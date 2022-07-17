import { NextApiRequest, NextApiResponse } from "next";
import pMap from "p-map";

function getApiUrl(path: string) {
  return `https://api.github.com${path}`;
}

function ghFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, init)
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .catch((error) => {
      console.error(error);
    });
}

async function getRepositories(req: NextApiRequest) {
  return ghFetch(getApiUrl(`/user/repos`), {
    method: "GET",
    headers: {
      Authorization: req.headers.authorization,
      Accept: "application/vnd.github+json",
    },
  });
}

async function getPackageJsons(req: NextApiRequest, repositories: any) {

  const pkgs = await pMap(
    repositories,
    async ({ name: repo, owner: { login: owner } }: any) => {
      const repository = fetch(getApiUrl(`/repos/${owner}/${repo}/contents/package.json`), {
        method: "GET",
        headers: {
          Authorization: req.headers.authorization,
          Accept: "application/vnd.github+json",
        },
      }).catch(() => {
        return;
      });
      return !!repository
    },
    { concurrency: 50, stopOnError: false }
  );

  return repositories.map((repo, index) => {
    return {
      ...repo,
      hasPkg: pkgs[index]
    };
  });
}

const handleGetRequest = async (req: NextApiRequest) => {
  const repositories = await getRepositories(req);
  const repositoriesWithPkgJson = await getPackageJsons(req, repositories);
  return repositoriesWithPkgJson;
};

const handleRequest = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method.toUpperCase() === "GET") {
      const info = await handleGetRequest(req);
      res.status(200).json(info);
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(400).end(error.message);
  }
};

export default handleRequest;
