import { useContext } from "react";
import Head from "next/head";
import AggregationForm from "../components/AggregationForm";
import AggregatedTable from "../components/AggregatedTable";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Box, useColorModeValue, Flex, Table, Tbody, Tr, Td, Thead, Th, Link } from "@chakra-ui/react";

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
          <Box
            maxW="none"
            borderWidth="1px"
            borderRadius="lg"
          >
            <AggregatedTable />
          </Box>
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
