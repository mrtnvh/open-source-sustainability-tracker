import { useContext } from "react";
import { AggregatorContext } from "../lib/context/Aggregator.context";
import { Grid, Box, Link, useBreakpointValue } from "@chakra-ui/react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";

const Row = ({ index, style }) => {
  const { aggregated } = useContext(AggregatorContext);
  const { name, directCount, indirectCount, funding, author } = aggregated.dependencies[index];
  const columnProps = {
    py: "3",
    px: "4",
    fontSize: useBreakpointValue({ base: "sm", md: "md" }),
    borderBottomWidth: "1px",
  };

  return (
    <Grid templateColumns="auto 25% 6rem 6rem 9rem" style={style}>
      <Box {...columnProps}>
        <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={"https://www.npmjs.com/package/" + name}>
          {name}
        </Link>
      </Box>
      <Box {...columnProps}>
        {author && (
          <Link target="_blank" rel="noopener" whiteSpace="nowrap" href={author.url}>
            {author.name}
          </Link>
        )}
      </Box>
      <Box {...columnProps}>{directCount || 0}</Box>
      <Box {...columnProps}>{indirectCount || 0}</Box>
      <Box {...columnProps} textAlign="end">
        {funding && (
          <Link whiteSpace="nowrap" href={typeof funding === "string" ? funding : funding.url}>
            Fund project
          </Link>
        )}
      </Box>
    </Grid>
  );
};

export default function AggregatedTable() {
  const { aggregated } = useContext(AggregatorContext);
  return (
    <AutoSizer>
      {({ height, width }) => (
        <List height={height} itemCount={aggregated.dependencies.length} itemSize={50} width={width}>
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
