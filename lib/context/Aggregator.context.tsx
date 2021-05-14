import { createContext, useState } from "react";

type AggregatorState = "idle" | "pending";

export const AggregatorContext = createContext({
  aggregator: "",
  aggregatorState: "idle" as AggregatorState,
  setAggregator: (value: string) => {},
  setAggregated: (value: any[]) => {},
  setAggregatorState: (value: AggregatorState) => {},
  aggregated: [],
});

export const AggregatorProvider = ({ children }) => {
  const [aggregator, setAggregator] = useState("");
  const [aggregated, setAggregated] = useState([]);
  const [aggregatorState, setAggregatorState] = useState("idle" as AggregatorState);

  return (
    <AggregatorContext.Provider
      value={{
        aggregator,
        setAggregator,
        aggregated,
        setAggregated,
        aggregatorState,
        setAggregatorState
      }}
    >
      {children}
    </AggregatorContext.Provider>
  );
};
