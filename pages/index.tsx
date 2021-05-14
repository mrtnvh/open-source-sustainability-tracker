import { useContext } from "react";
import Head from "next/head";
import { UsernameContext } from "../lib/context/Username.context";

export default function Home() {
  const { username, setUsername } = useContext(UsernameContext);
  return (
    <>
      <Head>
        <title>Open Source Sustainability Tracker</title>
        <meta name="description" content="Open Source Sustainability Tracker" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>{username}</div>
    </>
  );
}
