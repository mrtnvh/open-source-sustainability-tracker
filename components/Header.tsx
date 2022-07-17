import {
  Flex,
  Text,
  useColorModeValue,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Avatar,
} from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { User } from "next-auth";

export default function Header() {
  const session = useSession();
  const user = session?.data?.user as User;

  return (
    <Box borderBottom={1} borderStyle={"solid"} borderColor={useColorModeValue("gray.200", "gray.900")}>
      <Flex
        maxW="full"
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        px={{ base: 6 }}
        py={{ base: 3 }}
        align={"center"}
        gridGap="9"
      >
        <Text fontFamily={"heading"} color={useColorModeValue("gray.800", "white")} fontWeight={"bold"} flexGrow={1} py={{ base: 4 }}>
          Open Source Sustainability Tracker
        </Text>

        {!!user && (
          <Menu>
            <MenuButton as={Button} variant="link">
              <Avatar name={user.name} src={user?.image} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Box>
  );
}
