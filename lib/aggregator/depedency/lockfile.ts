import pMap from "p-map";
import PProgress from "p-progress";

const getDependencyInformation = async ({ name, ...dep }: any) => {
  try {
    if (!name) return;
    const infoRequestURL = new URL(window.location.origin + "/api/npm");
    infoRequestURL.searchParams.append("name", name);
    const { funding } = await fetch(infoRequestURL.toString()).then((res) => res.json());
    return { ...dep, name, funding };
  } catch (error) {
    return { name, ...dep };
  }
};

const dependencyCountReducer = (countProp: string) => (acc, name: string) => {
  const existingDepIndex = acc.findIndex((item: any) => item.name === name);
  if (existingDepIndex !== -1) {
    acc[existingDepIndex][countProp] += 1;
    return acc;
  }
  return [
    ...acc,
    {
      name,
      [countProp]: 1,
    },
  ];
};

const dependencyReducer = (acc, [name, { dependencies }]) => {
  return [...acc, name, ...(dependencies ? Object.entries(dependencies).reduce(dependencyReducer, []) : [])];
};

export const getIndirectDependenciesFromPackageLock = PProgress.fn(
  async (packageLocks: any[], progress: PProgress.ProgressNotifier) => {
    try {
      const indirectDependencyList: string[] = packageLocks
        .reduce((packageLockAcc, packageLock) => {
          return [...packageLockAcc, ...Object.entries(packageLock.dependencies).reduce(dependencyReducer, [])];
        }, [])
        .reduce(dependencyCountReducer("indirectCount"), []);

      return await pMap(
        indirectDependencyList,
        async (dep, index) => {
          const info = await getDependencyInformation(dep);
          progress(index / indirectDependencyList.length);
          return info;
        },
        { concurrency: 10 }
      );
    } catch (error) {
      console.error(error);
    }
  }
);
