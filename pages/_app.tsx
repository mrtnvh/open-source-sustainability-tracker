import Header from "../components/Header";
import Footer from "../components/Footer";
import { chakra, Flex } from "@chakra-ui/react";
import { AppContextProvider } from "../components/AppContextProvider";

function MyApp({ Component, pageProps }) {
  return (
    <AppContextProvider>
        <Flex direction="column" minH="100vh" w="100%">
          <Header />
          <chakra.main display="flex" flexDirection="column" flexGrow={1} p={{ base: 6 }}>
            <Component {...pageProps} />
          </chakra.main>
          <Footer />
        </Flex>
    </AppContextProvider>
  );
}
export default MyApp;
