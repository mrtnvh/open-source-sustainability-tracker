import { createContext, useState } from "react";

type AggregatorState = "idle" | "pending";

export const defaultAggregated = {
  projectsCount: 0,
  dependencies: [],
};

export const AggregatorContext = createContext({
  aggregator: "",
  setAggregator: (value: string) => {},
  aggregatorState: "idle" as AggregatorState,
  setAggregatorState: (value: AggregatorState) => {},
  aggregated: { ...defaultAggregated },
  setAggregated: (value: any) => {},
});

export const AggregatorProvider = ({ children }) => {
  const [aggregator, setAggregator] = useState("");
  const [aggregated, setAggregated] = useState({
    ...defaultAggregated,
  });
  const [aggregatorState, setAggregatorState] = useState("idle" as AggregatorState);

  return (
    <AggregatorContext.Provider
      value={{
        aggregator,
        setAggregator,
        aggregatorState,
        setAggregatorState,
        aggregated,
        setAggregated,
      }}
    >
      {children}
    </AggregatorContext.Provider>
  );
};
