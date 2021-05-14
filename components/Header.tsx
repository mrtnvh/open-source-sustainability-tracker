import { FormControl, FormLabel, Button, Input } from "@chakra-ui/react";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { useContext } from "react";
import { UsernameContext } from "../lib/context/Username.context";
import { AggregatorContext } from "../lib/context/Aggregator.context";

export default function Header() {
  const { username, setUsername } = useContext(UsernameContext);
  const { setAggregator } = useContext(AggregatorContext);
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

      <form onSubmit={(e) => handleSubmit(e)}>
        <FormControl
          display="flex"
          alignItems="center"
          id="ghUsername"
          gridGap="3"
          w="auto"
        >
          <FormLabel whiteSpace="nowrap" margin="0">
            Your GitHub username
          </FormLabel>
          <Input
            type="text"
            maxW="300"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <Button type="submit" colorScheme="blue">Go</Button>
        </FormControl>
      </form>
    </Flex>
  );
}
