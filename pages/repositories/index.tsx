import NextLink from "next/link";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import Head from "next/head";
import { authOptions } from "../api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const origin = process.env.NEXTAUTH_URL;
  const repositoriesData = await fetch(`${origin}/api/github/repositories`, {
    headers: {
      Authorization: `token ${session.accessToken}`,
    },
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  const repositories: IGithubRepository[] = repositoriesData.map(({ id, name, description, hasPkg }) => ({
    id,
    name,
    description,
    hasPkg,
  }));

  return {
    props: {
      repositories,
    },
  };
};

interface IGithubRepository {
  id: number;
  name: string;
  description: string;
  hasPkg: boolean;
}

interface IRepositoryPageProps {
  repositories: IGithubRepository[];
}

export default function RepositoryPage({ repositories }: IRepositoryPageProps) {
  const title = "Choose your repository";

  function getRepositoryUrl({ id }: IGithubRepository) {
    return `/repositories/${id}`;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Flex alignItems="center" justifyContent="center" flexGrow={1} flexDirection="column">
        <Heading as="h1" color="gray.700" marginBlockEnd="6" fontWeight="black">
          {title}
        </Heading>

        <Box maxInlineSize="48rem" inlineSize="full" shadow="md" rounded="md">
          {repositories.map((repository, index) => (
            <LinkBox
              key={repository.name}
              as="article"
              p="5"
              borderWidth="1px"
              rounded="md"
              borderTopRadius={index === 0 ? "md" : "0"}
              borderBottomRadius={index === repositories.length - 1 ? "md" : "0"}
              marginBlockStart="-1px"
              display="flex"
              alignItems={["center"]}
              gap={8}
              {...(repository.hasPkg && {
                _hover: {
                  bg: "gray.100",
                },
                _focusWithin: {
                  bg: "gray.100",
                },
              })}
            >
              <Box flexGrow={1}>
                <Heading as="h2" size="md">
                  {repository.hasPkg ? (
                    <NextLink href={getRepositoryUrl(repository)} passHref>
                      <LinkOverlay>{repository.name}</LinkOverlay>
                    </NextLink>
                  ) : (
                    repository.name
                  )}
                </Heading>
                {repository.description && <Text mt="2">{repository.description}</Text>}
              </Box>
              {repository.hasPkg && (
                <Box>
                  <ChevronRightIcon blockSize={6} inlineSize={6} />
                </Box>
              )}
            </LinkBox>
          ))}
        </Box>
      </Flex>
    </>
  );
}
