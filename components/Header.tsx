import { Flex, Text, useColorModeValue, Box, Button } from "@chakra-ui/react";
import { useContext } from "react";
import { UsernameContext } from "../lib/context/Username.context";
import { AggregatorContext, defaultAggregated } from "../lib/context/Aggregator.context";
import AggregationForm from "../components/AggregationForm";

export default function Header() {
  const { username, setUsername } = useContext(UsernameContext);
  const { aggregated, aggregator, setAggregator, setAggregated } = useContext(AggregatorContext);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAggregator(username);
  };
  return (
    <Box borderBottom={1} borderStyle={"solid"} borderColor={useColorModeValue("gray.200", "gray.900")}>
      <Flex
        maxW="full"
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        p={{ base: 6 }}
        align={"center"}
        gridGap="9"
      >
        <Text fontFamily={"heading"} color={useColorModeValue("gray.800", "white")} fontWeight={"bold"} flexGrow={1}>
          Open Source Sustainability Tracker
        </Text>
        {aggregated.dependencies.length > 0 && (
          <Button
            variant="ghost"
            onClick={(e) =>
              setAggregated({
                ...defaultAggregated,
              })
            }
          >
            New search
          </Button>
        )}
        {!!aggregator && <AggregationForm inline />}
      </Flex>
    </Box>
  );
}
