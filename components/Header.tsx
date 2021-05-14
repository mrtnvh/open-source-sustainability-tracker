import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useContext } from "react";
import { UsernameContext } from "../lib/context/Username.context";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import AggregationForm from "../components/AggregationForm";

export default function Header() {
  const { username, setUsername } = useContext(UsernameContext);
  const { aggregator, setAggregator } = useContext(AggregatorContext);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAggregator(username);
  };
  return (
    <Flex
      bg={useColorModeValue("white", "gray.800")}
      color={useColorModeValue("gray.600", "white")}
      p={{ base: 6 }}
      borderBottom={1}
      borderStyle={"solid"}
      borderColor={useColorModeValue("gray.200", "gray.900")}
      align={"center"}
      gridGap="9"
    >
      <Text
        fontFamily={"heading"}
        color={useColorModeValue("gray.800", "white")}
        fontWeight={"black"}
        flexGrow={1}
      >
        Open Source Sustainability Tracker
      </Text>
      {!!aggregator && <AggregationForm inHeader={true} />}
    </Flex>
  );
}
