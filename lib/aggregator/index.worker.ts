import { orderBy, unionBy } from "lodash";
import { getDirectDependenciesFromPackages } from "./direct";
import { fetchProjectsFromUsername } from "./github";
import { getIndirectDependenciesFromPackageLock } from "./indirect";
import { set, get } from "idb-keyval";

const postMessage = (type: string, value: any) => self.postMessage({ type, ...value });
const progress = (key: string) => (value: any) => postMessage("progress", { key, value });
const count = (key: string) => (value: any) => postMessage("count", { key, value });
const resolve = (value: any) => postMessage("resolved", { value });
const reject = (value: any) => postMessage("rejected", { value });

self.addEventListener("message", async (event) => {
  try {
    const username = event.data;

    const existingAggregated = await get(username);
    if (existingAggregated) {
      count("setProjectsCount")(existingAggregated.projectsCount);
      resolve(existingAggregated.dependencies);
    } else {
      const handleFetchPackageLockFilesFromUsername = fetchProjectsFromUsername(username);
      handleFetchPackageLockFilesFromUsername.onProgress(progress("setPackagesProgressState"));
      const packages = await handleFetchPackageLockFilesFromUsername;
      count("setProjectsCount")(packages.length);

      const handleGetDirectDependenciesFromPackages = getDirectDependenciesFromPackages(
        packages.map(({ pkgFile }) => pkgFile)
      );
      handleGetDirectDependenciesFromPackages.onProgress(progress("setDirectDependenciesProgressState"));
      const directDependenciesFromPackages = await handleGetDirectDependenciesFromPackages;
      count("setDirectDependenciesCount")(directDependenciesFromPackages.length);

      const handleGetIndirectDependenciesFromPackageLock = getIndirectDependenciesFromPackageLock(
        packages.map(({ lockFile }) => lockFile)
      );
      handleGetIndirectDependenciesFromPackageLock.onProgress(progress("setIndirectDependenciesProgressState"));
      const inDirectDependencies = await handleGetIndirectDependenciesFromPackageLock;
      count("setIndirectDependenciesCount")(inDirectDependencies.length);

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
      resolve(dependencies);
    }
  } catch (error) {
    reject(error);
  }
});
