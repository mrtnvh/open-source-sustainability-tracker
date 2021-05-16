import { useContext } from "react";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Box, Table, Tbody, Tr, Td, Thead, Th, Link, useColorModeValue, useBreakpointValue } from "@chakra-ui/react";

export default function AggregatedTable() {
  const { aggregated } = useContext(AggregatorContext);
  const columnProps = {
    py: "3",
    px: "4",
  };
  return (
    <Box overflowX="auto">
      <Table fontSize={useBreakpointValue({ base: "sm", md: "md" })}>
        <Thead position="sticky" insetBlockStart="0" bg={useColorModeValue("gray.100", "gray.900")}>
          <Tr>
            <Th>Project</Th>
            <Th>Author</Th>
            <Th>Direct</Th>
            <Th>Indirect</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {aggregated.dependencies.map(({ name, directCount, indirectCount, funding, author }) => (
            <Tr key={name}>
              <Td {...columnProps}>
                <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={"https://www.npmjs.com/package/" + name}>
                  {name}
                </Link>
              </Td>
              <Td {...columnProps}>
                {author && (
                  <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={author.url}>
                    {author.name}
                  </Link>
                )}
              </Td>
              <Td {...columnProps}>{directCount || 0}</Td>
              <Td {...columnProps}>{indirectCount || 0}</Td>
              <Td {...columnProps} textAlign="end">
                {funding && (
                  <Link whiteSpace="nowrap" href={typeof funding === "string" ? funding : funding.url}>
                    Fund project
                  </Link>
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
