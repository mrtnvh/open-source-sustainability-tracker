import { useContext } from "react";
import Head from "next/head";
import AggregationForm from "../components/AggregationForm";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Box, useColorModeValue, Flex } from "@chakra-ui/react";

export default function Home() {
  const { aggregator } = useContext(AggregatorContext);

  return (
    <>
      <Head>
        <title>Open Source Sustainability Tracker</title>
        <meta name="description" content="Open Source Sustainability Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!!aggregator ? (
        <div>aggregated</div>
      ) : (
        <Flex alignItems="center" justifyContent="center" flexGrow={1}>
          <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            bg={useColorModeValue("gray.100", "gray.900")}
            color={useColorModeValue("gray.700", "gray.200")}
            p="6"
          >
            <AggregationForm />
          </Box>
        </Flex>
      )}
    </>
  );
}
