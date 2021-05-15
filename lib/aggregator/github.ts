import { uniq } from "lodash";
import pMap from "p-map";
import PProgress from "p-progress";
import { ManifestResult } from "pacote";

const apiBaseUrl = "https://api.github.com";

export const fetchPackageFilesFromUsername = PProgress.fn(
  async (username: string, progress: PProgress.ProgressNotifier) => {
    const requestUrl = new URL(`${apiBaseUrl}/search/code`);
    requestUrl.searchParams.append("q", `filename:package.json user:${username}`);
    requestUrl.searchParams.append("per_page", "100");
    const data = await fetch(requestUrl.toString(), {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }).then((res) => res.json());

    const urls = uniq(
      data.items
        .map((item: any) =>
          item.html_url.replace("https://github.com/", "https://raw.githubusercontent.com/").replace("/blob/", "/")
        )
        .filter((url: string) => url.includes("package.json"))
    );

    const packageFiles = pMap(urls, async (url: string, index: number) => {
      const data: ManifestResult = await fetch(url).then((res) => res.json());
      progress(index / urls.length);
      return data;
    });
    return packageFiles;
  }
);
