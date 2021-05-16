import PProgress from "p-progress";

interface AsyncWebWorkerWithProgressArguments<T> {
  ctx: Worker;
  messageEvent: MessageEvent<any>;
  promise: (param1: any) => PProgress<T>;
}

export const asyncWebWorkerWithProgress = async <T>({
  ctx,
  messageEvent,
  promise,
}: AsyncWebWorkerWithProgressArguments<T>) => {
  const handler = promise(messageEvent.data);
  handler.onProgress((progress) => {
    ctx.postMessage({ type: "progress", value: progress });
  });
  handler.then((result) => {
    ctx.postMessage({ type: "resolved", value: result });
  });
};

interface WorkerWithProgressOptions {
  workerUrl: string;
  workerArguments: any;
}

export const WorkerWithProgress = (workerUrl: URL) =>
  PProgress.fn(async (workerArguments: any, progress: PProgress.ProgressNotifier): PProgress<any> => {
    const worker = new Worker(workerUrl);
    worker.postMessage(workerArguments);
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        switch (event.data.type) {
          case "progress":
            progress(event.data.value);
            break;
          case "resolved":
            console.log(event.data.value);
            resolve(event.data.value as any);
            break;
          default:
            reject(event.data.value);
            break;
        }
      };
    });
  });
