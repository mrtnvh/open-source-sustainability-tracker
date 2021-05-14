import { NextApiRequest, NextApiResponse } from "next";

import { resolve } from "path";
import axios from "axios";
import { orderBy, uniq, slice, defaultsDeep } from "lodash";
import pacote from "pacote";
import pMap from "p-map";
// import pReduce from 'p-reduce'

const MAX_CONCURRENCY = 25;
const SLICE_AMOUNT = 50;
const P_MAP_OPTIONS = {
  concurrency: MAX_CONCURRENCY,
};
const CACHE_PATH = resolve(__dirname, "../.cache/dependencies");
const apiBaseUrl = "https://api.github.com";

const getPackageFilesFromUsername = async (username: string) => {
  const { data } = await axios.get(`${apiBaseUrl}/search/code`, {
    headers: {
      accept: "application/vnd.github.v3+json",
    },
    params: {
      q: `filename:package.json user:${username}`,
      per_page: 100,
    },
  });

  const urls = uniq(
    data.items.map((item) =>
      item.html_url
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace("/blob/", "/")
    )
  );

  return pMap(urls, async (url: string) => {
    const { data } = await axios.get(url);
    console.log("Fetched project package file from", url);
    return data;
  });
};

const getDependenciesFromPackageFile = (
  acc,
  { dependencies, devDependencies }
) => [
  ...acc,
  ...(dependencies ? Object.keys(dependencies) : []),
  ...(devDependencies ? Object.keys(devDependencies) : []),
];

const defaultGetDependencyInformationOptions = {
  maxDepth: 0,
  depth: 0,
  totalCount: 0,
};

const getDependencyInformation = async ({ name, ...dep }: any) => {
  try {
    if (!name) return;

    const { dependencies, devDependencies, funding } = await pacote.manifest(
      name,
      { fullMetadata: true, cache: CACHE_PATH }
    );
    const indirectDependencies = Object.keys({
      ...dependencies,
      ...devDependencies,
    }).map((name) => ({ name }));

    return {
      ...dep,
      name,
      funding,
      dependencies: indirectDependencies,
    };
  } catch (error) {
    console.warn("getDependencyInformation", name, error);
    return { name, ...dep };
  }
};

const dependencyCountReducer =
  (countProp) =>
  (acc, { name, ...dep }) => {
    const existingDepIndex = acc.findIndex((item) => item.name === name);
    if (existingDepIndex !== -1) {
      acc[existingDepIndex][countProp] += 1;
      return acc;
    }
    return [
      ...acc,
      {
        name,
        ...dep,
        [countProp]: 1,
      },
    ];
  };

const cleanup = (deps) =>
  deps.reduce((acc, { dependencies, ...dependency }) => {
    const existingIndex = acc.findIndex(
      (item) => item.name === dependency.name
    );
    if (existingIndex !== -1) {
      acc[existingIndex].indirectCount += dependency.indirectCount;
      return acc;
    }
    return [...acc, dependency];
  }, []);

const recursor = (options) => async (parents) => {
  const { maxDepth, depth } = defaultsDeep(
    options,
    defaultGetDependencyInformationOptions
  );
  const childrenToQuery = parents
    .reduce((acc, { dependencies }) => [...acc, ...(dependencies || [])], [])
    .reduce(dependencyCountReducer("indirectCount"), []);

  const slicedChildrenToQuery = slice(childrenToQuery, 0, SLICE_AMOUNT);

  const parentsWithoutDependencies = parents.map(
    ({ dependencies, ...parent }) => parent
  );

  const queriedFamilies = await pMap(
    slicedChildrenToQuery,
    async ({ dependencies, ...child }, index) => {
      const totalCount = slicedChildrenToQuery.length;
      const existingIndex = parentsWithoutDependencies.findIndex(
        (item) => item.name === child.name
      );
      if (existingIndex !== -1) {
        console.log(
          `DUP - Depth ${depth} - ${index + 1} of ${totalCount} : ${child.name}`
        );
        return child;
      }

      const newChild = await getDependencyInformation(child);
      console.log(
        `NEW - Depth ${depth} - ${index + 1} of ${totalCount} : ${child.name}`
      );
      return newChild;
    },
    P_MAP_OPTIONS
  ).then((children) =>
    children.reduce((acc, child) => {
      const existingIndex = acc.findIndex((item) => item.name === child.name);
      if (existingIndex !== -1) {
        acc[existingIndex].indirectCount += child.indirectCount;
        return acc;
      }
      return [...acc, child];
    }, parentsWithoutDependencies)
  );

  return maxDepth > depth
    ? await recursor({
        maxDepth,
        depth: depth + 1,
      })(queriedFamilies)
    : cleanup(queriedFamilies);
};

const handleAggregatorPost = async (req: NextApiRequest) => {
  const { username } = JSON.parse(req.body);
  console.log(req.body.username);
  const files = await getPackageFilesFromUsername(username);
  const projectsCount = files.length;

  const depsFormPackage = slice(
    files.reduce(getDependenciesFromPackageFile, []),
    0,
    SLICE_AMOUNT
  );

  // Direct deps
  const directDeps = await Promise.resolve(
    depsFormPackage
      .map((name) => ({ name }))
      .reduce(dependencyCountReducer("directCount"), [])
  )
    .then((deps) => pMap(deps, getDependencyInformation, P_MAP_OPTIONS))
    .then((deps) => orderBy(deps, "directCount", "desc"));

  const directDepsToRecurse = slice(directDeps, 0, SLICE_AMOUNT);

  // Indirect deps
  const dependencies = await recursor({
    maxDepth: 2,
  })(directDepsToRecurse).then((deps) =>
    orderBy(deps, ["directCount", "indirectCount"], ["desc", "desc"])
  );

  return {
    projectsCount,
    dependencies,
  };
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const aggregatorPostResponse = await handleAggregatorPost(req);
    res.status(200).json(aggregatorPostResponse);
    return;
  }

  res.status(501).end("Not implemented");
  return;
};
