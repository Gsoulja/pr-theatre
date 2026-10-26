import { checkReferences, validateSceneFile } from "@pr-theatre/schema";
import type { SceneFile } from "@pr-theatre/schema";
import type { SceneSource } from "@pr-theatre/engine";

export class ShowLoadError extends Error {
  constructor(
    readonly url: string,
    reason: string,
  ) {
    super(`Could not load the show from ${url}: ${reason}`);
    this.name = "ShowLoadError";
  }
}

/** The slice of `fetch` this source needs, so tests can pass a fake. */
export type FetchShow = (url: string) => Promise<Pick<Response, "ok" | "status" | "statusText" | "json">>;

/** Loads a bundled show.json over HTTP and checks it where it enters the player. */
export class FetchSceneSource implements SceneSource {
  constructor(
    private readonly url: URL,
    private readonly fetchShow: FetchShow = (url) => fetch(url),
  ) {}

  async load(): Promise<SceneFile> {
    const show = validateSceneFile(await this.fetchJson());
    // The schema cannot see across files; a scene naming a missing fact would break "see the real code".
    const issues = checkReferences(show.facts, show.scene);
    if (issues.length > 0) {
      throw new ShowLoadError(this.url.href, `the story does not match its facts: ${issues.map((issue) => `${issue.where} ${issue.message}`).join("; ")}.`);
    }
    return show;
  }

  private async fetchJson(): Promise<unknown> {
    const response = await this.fetchShow(this.url.href).catch((error: unknown) => {
      throw new ShowLoadError(this.url.href, `the request failed (${(error as Error).message}).`);
    });
    if (!response.ok) throw new ShowLoadError(this.url.href, `the server answered ${response.status} ${response.statusText}`.trimEnd() + ".");
    return response.json().catch(() => {
      throw new ShowLoadError(this.url.href, "the file is not valid JSON.");
    });
  }
}
