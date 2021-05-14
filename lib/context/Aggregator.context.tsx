import { createContext, useState } from "react";

export const AggregatorContext = createContext({
  aggregator: "",
  setAggregator: (value: string) => {},
});

export const AggregatorProvider = ({ children }) => {
  const [aggregator, setAggregator] = useState("");

  return (
    <AggregatorContext.Provider
      value={{
        aggregator,
        setAggregator,
      }}
    >
      {children}
    </AggregatorContext.Provider>
  );
};
