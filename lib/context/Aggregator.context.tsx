import { createContext, useState } from "react";

export const AggregatorContext = createContext({
  aggregator: "",
  setAggregator: (value: string) => {},
  setAggregated: (value: any[]) => {},
  aggregated: [],
});

export const AggregatorProvider = ({ children }) => {
  const [aggregator, setAggregator] = useState("");
  const [aggregated, setAggregated] = useState([]);

  return (
    <AggregatorContext.Provider
      value={{
        aggregator,
        setAggregator,
        aggregated,
        setAggregated
      }}
    >
      {children}
    </AggregatorContext.Provider>
  );
};
