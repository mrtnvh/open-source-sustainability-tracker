import { FormControl, FormLabel, Input, Button, useColorModeValue, Text, Td, Table, Tbody, Tr } from "@chakra-ui/react";
import { orderBy, slice, unionBy } from "lodash";
import React, { useContext, useState } from "react";
import { fetchProjectsFromUsername } from "../lib/aggregator";
import { getIndirectDependenciesFromPackageLock } from "../lib/aggregator/depedency/lockfile";
import { getDirectDependenciesFromPackages } from "../lib/aggregator/depedency/package";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { UsernameContext } from "../lib/context/Username.context";

interface InitialFormProps {
  inHeader?: boolean;
}

export default function AggregationForm({ inHeader }: InitialFormProps) {
  const { username, setUsername } = useContext(UsernameContext);
  const { setAggregator, aggregatorState, setAggregatorState, setAggregated } = useContext(AggregatorContext);

  const [projectsCount, setProjectsCount] = useState(0);
  const [packagesProgressState, setPackagesProgressState] = useState(0);
  const [directDependenciesProgressState, setDirectDependenciesProgressState] = useState(0);
  const [directDependenciesCount, setDirectDependenciesCount] = useState(0);
  const [indirectDependenciesProgressState, setIndirectDependenciesProgressState] = useState(0);
  const [indirectDependenciesCount, setIndirectDependenciesCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setAggregator(username);
    setAggregatorState("pending");

    const handleFetchPackageLockFilesFromUsername = fetchProjectsFromUsername(username);
    handleFetchPackageLockFilesFromUsername.onProgress(setPackagesProgressState);
    const packages = await handleFetchPackageLockFilesFromUsername;
    setProjectsCount(packages.length);

    const handleGetDirectDependenciesFromPackages = getDirectDependenciesFromPackages(
      packages.map(({ pkgFile }) => pkgFile)
    );
    handleGetDirectDependenciesFromPackages.onProgress(setDirectDependenciesProgressState);
    const directDependenciesFromPackages = await handleGetDirectDependenciesFromPackages;
    setDirectDependenciesCount(directDependenciesFromPackages.length);

    const handleGetIndirectDependenciesFromPackageLock = getIndirectDependenciesFromPackageLock(
      packages.map(({ lockFile }) => lockFile)
    );
    handleGetIndirectDependenciesFromPackageLock.onProgress(setIndirectDependenciesProgressState);
    const inDirectDependencies = await handleGetIndirectDependenciesFromPackageLock;
    setIndirectDependenciesCount(inDirectDependencies.length);

    const dependencies = orderBy(
      unionBy(
        directDependenciesFromPackages.map(({ dependencies, ...dep }) => dep),
        inDirectDependencies,
        "name"
      ).filter((dep) => dep !== null),
      ["directCount", "indirectCount"],
      ["desc", "desc"]
    );

    setAggregated({
      projectsCount,
      dependencies,
    });
    setAggregatorState("idle");
  };

  const formControlProps = {
    ...(inHeader && {
      display: "flex",
      alignItems: "center",
      gridGap: "3",
      w: "auto",
    }),
  };

  const formLabelProps = {
    ...(inHeader && {
      margin: 0,
    }),
  };

  const formInputProps = {
    ...(inHeader
      ? {
          maxW: 300,
        }
      : {
          mb: "4",
          bg: useColorModeValue("white", "black"),
        }),
  };

  if (aggregatorState === "idle") {
    return (
      <form onSubmit={(e) => handleSubmit(e)}>
        <FormControl {...formControlProps} id="ghUsername">
          <FormLabel whiteSpace="nowrap" {...formLabelProps}>
            Your GitHub username
          </FormLabel>
          <Input {...formInputProps} type="text" onChange={(e) => setUsername(e.target.value)} value={username} />
          <Button type="submit" colorScheme="blue">
            {inHeader ? "Go" : "Aggregate dependencies"}
          </Button>
        </FormControl>
      </form>
    );
  }

  if (aggregatorState === "pending") {
    return (
      <Table variant="simple">
        <Tbody>
          <Tr>
            <Td>Projects</Td>
            <Td>{projectsCount}</Td>
            <Td>{Math.ceil(packagesProgressState * 100)}%</Td>
          </Tr>
          <Tr>
            <Td>Direct dependencies</Td>
            <Td>{directDependenciesCount}</Td>
            <Td>{Math.ceil(directDependenciesProgressState * 100)}%</Td>
          </Tr>
          <Tr>
            <Td>Indirect dependencies</Td>
            <Td>{indirectDependenciesCount}</Td>
            <Td>{Math.ceil(indirectDependenciesProgressState * 100)}%</Td>
          </Tr>
        </Tbody>
      </Table>
    );
  }
}
