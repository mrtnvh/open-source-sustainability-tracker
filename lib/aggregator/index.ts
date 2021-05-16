import { orderBy, unionBy } from "lodash";
import { getDirectDependenciesFromPackages } from "./direct";
import { fetchProjectsFromUsername } from "./github";
import { getIndirectDependenciesFromPackageLock } from "./indirect";
import { set, get } from "idb-keyval";

type SetStateType = React.Dispatch<React.SetStateAction<number>>;

interface AggregateOptions {
  username: string;
  setPackagesProgressState: SetStateType;
  setProjectsCount: SetStateType;
  setDirectDependenciesProgressState: SetStateType;
  setDirectDependenciesCount: SetStateType;
  setIndirectDependenciesProgressState: SetStateType;
  setIndirectDependenciesCount: SetStateType;
}

export const aggregate = async ({
  username,
  setPackagesProgressState,
  setProjectsCount,
  setDirectDependenciesProgressState,
  setDirectDependenciesCount,
  setIndirectDependenciesProgressState,
  setIndirectDependenciesCount,
}: AggregateOptions) => {
  const existingAggregated = await get(username);
  if (existingAggregated) {
    setProjectsCount(existingAggregated.projectsCount);
    return existingAggregated.dependencies;
  } else {
    const handleFetchPackageLockFilesFromUsername = fetchProjectsFromUsername(username);
    handleFetchPackageLockFilesFromUsername.onProgress(setPackagesProgressState);
    const packages = await handleFetchPackageLockFilesFromUsername;
    setProjectsCount(packages.length);

    const handleGetDirectDependenciesFromPackages = getDirectDependenciesFromPackages(
      packages.map(({ pkgFile }) => pkgFile)
    );
    handleGetDirectDependenciesFromPackages.onProgress(setDirectDependenciesProgressState);
    const directDependenciesFromPackages = await handleGetDirectDependenciesFromPackages;
    setDirectDependenciesCount(directDependenciesFromPackages.length);

    const handleGetIndirectDependenciesFromPackageLock = getIndirectDependenciesFromPackageLock(
      packages.map(({ lockFile }) => lockFile)
    );
    handleGetIndirectDependenciesFromPackageLock.onProgress(setIndirectDependenciesProgressState);
    const inDirectDependencies = await handleGetIndirectDependenciesFromPackageLock;
    setIndirectDependenciesCount(inDirectDependencies.length);

    const dependencies = orderBy(
      unionBy(
        directDependenciesFromPackages.map(({ dependencies, ...dep }) => dep),
        inDirectDependencies,
        "name"
      ).filter((dep) => dep !== null),
      ["directCount", "indirectCount"],
      ["desc", "desc"]
    );
    await set(username, { projectsCount: packages.length, dependencies });
    return dependencies;
  }
};
