import { defaultsDeep, orderBy, slice } from "lodash";
import pMap from "p-map";
import PProgress from "p-progress";
import { ManifestResult } from "pacote";
import { P_MAP_OPTIONS, SLICE_AMOUNT } from "../constants";

const getDependencyInformation = async ({ name, ...dep }: any) => {
  try {
    if (!name) return;

    const infoRequestURL = new URL(window.location.origin + "/api/npm");
    infoRequestURL.searchParams.append("name", name);
    const info = await fetch(infoRequestURL.toString()).then((res) => res.json());
    return { ...dep, name, ...info };
  } catch (error) {
    return { name, ...dep };
  }
};

export const getDependenciesFromPackageFile = (acc: string[], { dependencies, devDependencies }: ManifestResult) => [
  ...acc,
  ...(dependencies ? Object.keys(dependencies) : []),
  ...(devDependencies ? Object.keys(devDependencies) : []),
];

export const getDependenciesFromPackageFiles = (packages: ManifestResult[]) =>
  packages.reduce(getDependenciesFromPackageFile, []);

const dependencyCountReducer =
  (countProp: string) =>
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
    const existingIndex = acc.findIndex((item) => item.name === dependency.name);
    if (existingIndex !== -1) {
      acc[existingIndex].indirectCount += dependency.indirectCount;
      return acc;
    }
    return [...acc, dependency];
  }, []);

const defaultGetDependencyInformationOptions = {
  maxDepth: 0,
  depth: 0,
};

const recursor = async (
  parents: any,
  options: Partial<typeof defaultGetDependencyInformationOptions>
  // progress: PProgress.ProgressNotifier
) => {
  const { maxDepth, depth } = defaultsDeep(options, defaultGetDependencyInformationOptions);
  const childrenToQuery = parents
    .reduce((acc, { dependencies }) => [...acc, ...(dependencies || [])], [])
    .reduce(dependencyCountReducer("indirectCount"), []);
  const slicedChildrenToQuery = slice(childrenToQuery, 0, SLICE_AMOUNT);
  const parentsWithoutDependencies = parents.map(({ dependencies, ...parent }) => parent);

  const queriedFamilies = await pMap(
    slicedChildrenToQuery,
    async ({ dependencies, ...child }, index) => {
      // const totalCount = slicedChildrenToQuery.length;
      const existingIndex = parentsWithoutDependencies.findIndex((item) => item.name === child.name);
      const newChild = existingIndex !== -1 ? child : await getDependencyInformation(child);
      // progress(index / totalCount);
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

  if (maxDepth > depth) {
    const handleRecursion = await recursor(queriedFamilies, {
      maxDepth,
      depth: depth + 1,
    });
    // handleRecursion.onProgress(progress);
    return handleRecursion;
  } else {
    return cleanup(queriedFamilies);
  }
};

export const getDirectDependenciesFromPackages = PProgress.fn(
  async (packages: ManifestResult[], progress: PProgress.ProgressNotifier) => {
    const dependenciesFromPackages = slice(getDependenciesFromPackageFiles(packages), 0, SLICE_AMOUNT);
    const directDeps = await Promise.resolve(
      dependenciesFromPackages.map((name) => ({ name })).reduce(dependencyCountReducer("directCount"), [])
    )
      .then((deps) =>
        pMap(
          deps,
          async (dep, index) => {
            const info = await getDependencyInformation(dep);
            progress(index / deps.length);
            return info;
          },
          P_MAP_OPTIONS
        )
      )
      .then((deps) => orderBy(deps, "directCount", "desc"));

    return slice(directDeps, 0, SLICE_AMOUNT);
  }
);

export const getIndirectDependenciesFromDirectDependencies = PProgress.fn(
  async (dependencies: any[], progress: PProgress.ProgressNotifier) => {
    return recursor(dependencies, { maxDepth: 2 }).then((deps) =>
      orderBy(deps, ["directCount", "indirectCount"], ["desc", "desc"])
    );
  }
);
