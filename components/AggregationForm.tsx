import {
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
  Td,
  Table,
  Tbody,
  Tr,
  visuallyHiddenStyle,
  useBreakpointValue,
  FormControlProps,
  FormLabelProps,
  InputProps,
  ButtonProps,
} from "@chakra-ui/react";
import { ChangeEvent, FormEvent, useContext, useState } from "react";
import { aggregate } from "../lib/aggregator";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { UsernameContext } from "../lib/context/Username.context";

interface InitialFormProps {
  inline?: boolean;
}

export default function AggregationForm({ inline }: InitialFormProps) {
  const { username, setUsername } = useContext(UsernameContext);
  const { aggregatorState, setAggregatorState, setAggregated } = useContext(AggregatorContext);
  const [projectsCount, setProjectsCount] = useState(0);
  const [packagesProgressState, setPackagesProgressState] = useState(0);
  const [directDependenciesProgressState, setDirectDependenciesProgressState] = useState(0);
  const [directDependenciesCount, setDirectDependenciesCount] = useState(0);
  const [indirectDependenciesProgressState, setIndirectDependenciesProgressState] = useState(0);
  const [indirectDependenciesCount, setIndirectDependenciesCount] = useState(0);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAggregatorState("pending");
    const dependencies = await aggregate({
      username,
      setPackagesProgressState,
      setProjectsCount,
      setDirectDependenciesProgressState,
      setDirectDependenciesCount,
      setIndirectDependenciesProgressState,
      setIndirectDependenciesCount,
    });
    setAggregated({ projectsCount, dependencies });
    setAggregatorState("idle");
  };

  const formControlProps: FormControlProps = {
    ...(inline && {
      display: "flex",
      alignItems: "center",
      gridGap: "3",
      w: "auto",
      flexDirection: useBreakpointValue({ base: "column", md: "row" }),
    }),
  };

  const formLabelProps: FormLabelProps = {
    htmlFor: "ghUsername",
    whiteSpace: "nowrap",
    ...(inline && {
      style: visuallyHiddenStyle,
      margin: 0,
    }),
  };

  const formInputProps: InputProps = {
    id: "ghUsername",
    type: "text",
    onChange: (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value),
    value: username,
    placeholder: "Your GitHub username",
    bg: useColorModeValue("white", "black"),
    ...(!inline && {
      mb: "4",
    }),
  };

  const buttonProps: ButtonProps = {
    type: "submit",
    colorScheme: "blue",
    minW: "auto",
    w: useBreakpointValue({ base: "full", md: "auto" }),
  };

  if (aggregatorState === "idle") {
    return (
      <form onSubmit={(e) => handleSubmit(e)}>
        <FormControl {...formControlProps} id="ghUsername">
          <FormLabel {...formLabelProps}>Your GitHub username</FormLabel>
          <Input {...formInputProps} />
          <Button {...buttonProps}>Aggregate dependencies</Button>
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
