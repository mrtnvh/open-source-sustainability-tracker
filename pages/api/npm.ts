import pacote from "pacote";
// import { withSentry } from "@sentry/nextjs";
import { NextApiRequest, NextApiResponse } from "next";

const fetchDependencyInformation = async (name: string) =>
  pacote.manifest(name, { fullMetadata: true, preferOnline: true });

const getDependencyInformation = async (name: string) => {
  try {
    if (!name) return { name };

    const { dependencies, devDependencies, funding } = await fetchDependencyInformation(name);
    const indirectDependencies = Object.keys({
      ...dependencies,
      ...devDependencies,
    }).map((name) => ({ name }));

    return {
      name,
      funding,
      dependencies: indirectDependencies,
    };
  } catch {
    return { name };
  }
};

const handleGetRequest = async (req: NextApiRequest) => {
  const { name } = req.query;

  if (typeof name === "string") {
    return getDependencyInformation(name);
  }

  throw new Error("name is not valid");
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method.toUpperCase() === "GET") {
      // console.log(req.method.toUpperCase() )
      const info = await handleGetRequest(req);
      res.status(200).json(info);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(400).end(error);
  }
};

export default handleRequest;
