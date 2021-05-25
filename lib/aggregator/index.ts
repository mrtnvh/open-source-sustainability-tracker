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
}: AggregateOptions) =>
  new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./index.worker.ts", import.meta.url));
    worker.postMessage(username);
    worker.onmessage = (event) => {
      const { value, key, type } = event.data;
      switch (type) {
        case "progress":
          switch (key) {
            case "setPackagesProgressState":
              setPackagesProgressState(value);
              break;
            case "setDirectDependenciesProgressState":
              setDirectDependenciesProgressState(value);
              break;
            case "setIndirectDependenciesProgressState":
              setIndirectDependenciesProgressState(value);
              break;
          }
          break;
        case "count":
          switch (key) {
            case "setProjectsCount":
              setProjectsCount(value);
              break;
            case "setDirectDependenciesCount":
              setDirectDependenciesCount(value);
              break;
            case "setIndirectDependenciesCount":
              setIndirectDependenciesCount(value);
              break;
          }
          break;
        case "resolved":
          resolve(value);
          break;
        default:
          reject(value);
          break;
      }
    };
  });
