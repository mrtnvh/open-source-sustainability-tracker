import { useContext } from "react";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Table, Tbody, Tr, Td, Thead, Th, Link } from "@chakra-ui/react";

export default function AggregatedTable() {
  const { aggregated } = useContext(AggregatorContext);
  return (
    <Table variant="simple">
      <Thead>
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
            <Td>
              <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={"https://www.npmjs.com/package/" + name}>
                {name}
              </Link>
            </Td>
            <Td>
              {author && (
                <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={author.url}>
                  {author.name}
                </Link>
              )}
            </Td>
            <Td>{directCount || 0}</Td>
            <Td>{indirectCount || 0}</Td>
            <Td textAlign="end">
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
  );
}
