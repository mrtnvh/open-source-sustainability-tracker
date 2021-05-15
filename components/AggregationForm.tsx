import { FormControl, FormLabel, Input, Button, useColorModeValue, Text, Td, Table, Tbody, Tr } from "@chakra-ui/react";
import { slice } from "lodash";
import React, { useContext, useState } from "react";
import {
  fetchPackageFilesFromUsername,
  getDirectDependenciesFromPackages,
  getIndirectDependenciesFromDirectDependencies,
} from "../lib/aggregator";
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

    const handleFetchPackageFilesFromUsername = fetchPackageFilesFromUsername(username);
    handleFetchPackageFilesFromUsername.onProgress(setPackagesProgressState);
    const packages = await handleFetchPackageFilesFromUsername;
    setProjectsCount(packages.length);

    const handleGetDirectDependenciesFromPackages = getDirectDependenciesFromPackages(packages);
    handleGetDirectDependenciesFromPackages.onProgress(setDirectDependenciesProgressState);
    const directDependenciesFromPackages = await handleGetDirectDependenciesFromPackages;
    setDirectDependenciesCount(directDependenciesFromPackages.length);

    const handleGetIndirectDependenciesFromDirectDependencies =
      getIndirectDependenciesFromDirectDependencies(directDependenciesFromPackages);
    handleGetIndirectDependenciesFromDirectDependencies.onProgress(setIndirectDependenciesProgressState);
    const dependencies = await handleGetIndirectDependenciesFromDirectDependencies;
    setIndirectDependenciesCount(dependencies.filter(({ indirectCount }) => !!indirectCount).length);

    // setAggregator(username);
    setAggregated({
      projectsCount,
      dependencies: dependencies,
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
            <Td>{packagesProgressState * 100}%</Td>
          </Tr>
          <Tr>
            <Td>Direct dependencies</Td>
            <Td>{directDependenciesCount}</Td>
            <Td>{directDependenciesProgressState * 100}%</Td>
          </Tr>
          <Tr>
            <Td>Indirect dependencies</Td>
            <Td>{indirectDependenciesCount}</Td>
            <Td>{indirectDependenciesProgressState * 100}%</Td>
          </Tr>
        </Tbody>
      </Table>
    );
  }
}
