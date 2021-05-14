import { ChakraProvider} from "@chakra-ui/react";
import { combineComponents } from "../lib/combineComponents";
import { UsernameProvider } from "../lib/context/Username.context";
import { AggregatorProvider } from "../lib/context/Aggregator.context";

const providers = [ChakraProvider, UsernameProvider, AggregatorProvider];

export const AppContextProvider = combineComponents(...providers);
