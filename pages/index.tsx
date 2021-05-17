import { useContext } from "react";
import Head from "next/head";
import AggregationForm from "../components/AggregationForm";
import AggregatedTable from "../components/AggregatedTable";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Box, useColorModeValue, Flex, Heading, Text } from "@chakra-ui/react";

export default function Home() {
  const { aggregated } = useContext(AggregatorContext);

  return (
    <>
      <Head>
        <title>Open Source Sustainability Tracker</title>
        <meta name="description" content="Open Source Sustainability Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex alignItems="center" justifyContent="center" flexGrow={1} flexDirection="column">
        {aggregated.dependencies.length > 0 ? (
          <Box w="100%" borderWidth="1px" borderRadius="lg">
            <AggregatedTable />
          </Box>
        ) : (
          <>
            <Heading as="h2" size="4xl" color="gray.700" marginBlockEnd="6" fontWeight="black">
              Who do you rely on?
            </Heading>
            <Text marginBlockEnd="6" fontSize="lg">
              Enter your GitHub username and discover all your{" "}
              <Text as="strong" color="pink.500">
                direct
              </Text>{" "}
              and{" "}
              <Text as="strong" color="purple.500">
                indirect
              </Text>{" "}
              dependencies.
            </Text>
            <Box
              borderWidth="1px"
              borderRadius="xl"
              w="full"
              maxW="2xl"
              bg={useColorModeValue("gray.100", "gray.900")}
              color={useColorModeValue("gray.700", "gray.200")}
              p="6"
            >
              <AggregationForm inline />
            </Box>
          </>
        )}
      </Flex>
    </>
  );
}
