import { SessionProvider } from "next-auth/react";
import { chakra, Flex } from "@chakra-ui/react";
import { AppContextProvider } from "../components/AppContextProvider";
import Footer from "../components/Footer";
import Header from "../components/Header";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <AppContextProvider>
      <SessionProvider session={session}>
        <Flex direction="column" minH="100vh" w="100%">
          <Header />
          <chakra.main display="flex" flexDirection="column" flexGrow={1} px={{ base: 6 }} py={{ base: 12 }}>
            <Component {...pageProps} />
          </chakra.main>
          <Footer />
        </Flex>
      </SessionProvider>
    </AppContextProvider>
  );
}
