import {
  FormControl,
  FormLabel,
  Input,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useContext } from "react";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { UsernameContext } from "../lib/context/Username.context";

interface InitialFormProps {
  inHeader?: boolean;
}

export default function AggregationForm({ inHeader }: InitialFormProps) {
  const { username, setUsername } = useContext(UsernameContext);
  const { setAggregator, aggregatorState, setAggregatorState, setAggregated } =
    useContext(AggregatorContext);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAggregator(username);
    setAggregatorState("pending");
    fetch("/api/aggregator", {
      method: "POST",
      body: JSON.stringify({
        username,
      }),
    })
      .then((response) => response.json())
      .then(setAggregated)
      .finally(() => {
        setAggregatorState("idle");
      });
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

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <FormControl {...formControlProps} id="ghUsername">
        <FormLabel whiteSpace="nowrap" {...formLabelProps}>
          Your GitHub username
        </FormLabel>
        <Input
          {...formInputProps}
          type="text"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
        <Button type="submit" colorScheme="blue">
          {inHeader ? "Go" : "Aggregate dependencies"}
        </Button>
      </FormControl>
    </form>
  );
}
