import { useContext } from "react";
import Head from "next/head";
import AggregationForm from "../components/AggregationForm";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Box, useColorModeValue, Flex, chakra, Spinner } from "@chakra-ui/react";

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
          <chakra.pre
            w="100%"
            p="6"
            bg={useColorModeValue("gray.100", "gray.900")}
            color={useColorModeValue("gray.700", "gray.200")}
            borderRadius="xl"
            fontSize="xs"
          >
            {JSON.stringify(aggregated, null, 2)}
          </chakra.pre>
        ) : (
          <Box
            maxW="md"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue("gray.100", "gray.900")}
            color={useColorModeValue("gray.700", "gray.200")}
            p="6"
          >
            <AggregationForm />
          </Box>
        )}
      </Flex>
    </>
  );
}
