import { FaGithub } from "react-icons/fa";
import Head from "next/head";
import NextLink from "next/link";
import { Flex, Heading, Text, Button, ButtonProps } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { GetServerSideProps } from "next/types";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";
import { ChevronRightIcon } from "@chakra-ui/icons";

interface HomeProps {
  gitHubProviderId: string;
}

interface GetServerSideHomeProps {
  props: HomeProps;
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }): Promise<GetServerSideHomeProps> => {
  const session = await unstable_getServerSession(req, res, authOptions);
  const gitHubProviderId = "github";
  return {
    props: {
      gitHubProviderId,
    },
  };
};

export default function Home({ gitHubProviderId }: HomeProps) {
  const session = useSession();

  const loginButtonProps: ButtonProps = {
    colorScheme: "gray",
    leftIcon: <FaGithub />,
    size: "lg",
  };

  const chooseRepositoriesButtonProps: ButtonProps = {
    colorScheme: "gray",
    rightIcon: <ChevronRightIcon />,
    size: "lg",
  };

  return (
    <>
      <Head>
        <title>Open Source Sustainability Tracker</title>
        <meta name="description" content="Open Source Sustainability Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Flex alignItems="center" justifyContent="center" flexGrow={1} flexDirection="column">
        <>
          <Heading as="h1" size="4xl" color="gray.700" marginBlockEnd="6" fontWeight="black">
            Who do you rely on?
          </Heading>

          {!!session.data ? (
            <NextLink href="/repositories" passHref>
              <Button {...chooseRepositoriesButtonProps}>Choose repository</Button>
            </NextLink>
          ) : (
            <>
              <Text marginBlockEnd="6" fontSize="lg">
                Login with GitHub and discover all your{" "}
                <Text as="strong" color="pink.500">
                  direct
                </Text>{" "}
                and{" "}
                <Text as="strong" color="purple.500">
                  indirect
                </Text>{" "}
                dependencies.
              </Text>
              <Button {...loginButtonProps} onClick={() => signIn(gitHubProviderId)}>
                Login with GitHub
              </Button>
            </>
          )}
        </>
      </Flex>
    </>
  );
}
