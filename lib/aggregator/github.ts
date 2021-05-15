import { uniq } from "lodash";
import pMap from "p-map";
import PProgress from "p-progress";
import { ManifestResult } from "pacote";

const apiBaseUrl = "https://api.github.com";

export const fetchProjectsFromUsername = PProgress.fn(
  async (username: string, progress: PProgress.ProgressNotifier) => {
    const requestUrl = new URL(`${apiBaseUrl}/search/code`);
    requestUrl.searchParams.append("q", `filename:package-lock.json user:${username}`);
    requestUrl.searchParams.append("per_page", "100");
    const data = await fetch(requestUrl.toString(), {
      headers: {
        accept: "application/vnd.github.v3+json",
      },
    }).then((res) => res.json());

    const urls = uniq(
      data.items.map((item: any) => ({
        pkgFileUrl: item.html_url
          .replace("https://github.com/", "https://raw.githubusercontent.com/")
          .replace("/blob/", "/")
          .replace("package-lock.json", "package.json"),
        lockFileUrl: item.html_url
          .replace("https://github.com/", "https://raw.githubusercontent.com/")
          .replace("/blob/", "/"),
      }))
      // .filter((url: string) => url.includes("package-lock.json"))
    );

    return pMap(urls, async ({ pkgFileUrl, lockFileUrl }, index: number) => {
      const pkgFile: ManifestResult = await fetch(pkgFileUrl).then((res) => res.json());
      const lockFile: any = await fetch(lockFileUrl).then((res) => res.json());
      progress(index / (urls.length * 2));
      return { pkgFile, lockFile };
    });
  }
);
