import { Text, useColorModeValue, Flex, Link } from "@chakra-ui/react";

export default function SmallWithLogoLeft() {
  return (
    <Flex
      bg={useColorModeValue("gray.100", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
      p={{ base: 6 }}
      fontSize="sm"
    >
      <Text flexGrow={1}>
        © {new Date().getFullYear()} - <Link href="https://mrtnvh.com">mrtnvh</Link> - All rights reserved
      </Text>
      <Text>Build on Next.js, Chakra UI. Hosted on Vercel</Text>
    </Flex>
  );
}
