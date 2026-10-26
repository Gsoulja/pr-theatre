import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SchemaValidationError } from "@pr-theatre/schema";
import type { SceneFile } from "@pr-theatre/schema";
import { FetchSceneSource, ShowLoadError } from "./fetch-scene-source";
import type { FetchShow } from "./fetch-scene-source";

const repoFile = (path: string): unknown => JSON.parse(readFileSync(new URL(`../../../../${path}`, import.meta.url), "utf8"));

function exampleShow(): SceneFile {
  return {
    version: 1,
    scene: repoFile("examples/robot-mcp-pr/scene.json"),
    facts: repoFile("examples/robot-mcp-pr/facts.json"),
    theme: repoFile("themes/theatre/theme.json"),
    snippets: [],
  } as SceneFile;
}

const answering =
  (body: unknown, status = 200, statusText = "OK"): FetchShow =>
  () =>
    Promise.resolve({ ok: status < 400, status, statusText, json: () => Promise.resolve(body) });

const url = new URL("https://example.test/shows/demo/show.json");

describe("FetchSceneSource", () => {
  it("returns the show when it is valid", async () => {
    const show = exampleShow();
    await expect(new FetchSceneSource(url, answering(show)).load()).resolves.toEqual(show);
  });

  it("asks for the exact show address", async () => {
    let asked = "";
    const spy: FetchShow = (requested) => ((asked = requested), answering(exampleShow())(requested));
    await new FetchSceneSource(url, spy).load();
    expect(asked).toBe(url.href);
  });

  it("explains a missing show with the address and the HTTP status", async () => {
    const load = new FetchSceneSource(url, answering("", 404, "Not Found")).load();
    await expect(load).rejects.toThrow(ShowLoadError);
    await expect(load).rejects.toThrow(`${url.href}: the server answered 404 Not Found.`);
  });

  it("explains a network failure", async () => {
    const offline: FetchShow = () => Promise.reject(new TypeError("Failed to fetch"));
    await expect(new FetchSceneSource(url, offline).load()).rejects.toThrow("the request failed (Failed to fetch)");
  });

  it("explains a file that is not JSON", async () => {
    const html: FetchShow = () => Promise.resolve({ ok: true, status: 200, statusText: "OK", json: () => Promise.reject(new SyntaxError("Unexpected token <")) });
    await expect(new FetchSceneSource(url, html).load()).rejects.toThrow("the file is not valid JSON.");
  });

  it("rejects a show that breaks the schema", async () => {
    await expect(new FetchSceneSource(url, answering({ version: 2 })).load()).rejects.toThrow(SchemaValidationError);
  });

  it("rejects a scene that points to a fact the show does not have", async () => {
    const show = exampleShow();
    show.scene.scenes[0] = { ...show.scene.scenes[0]!, factIds: ["f-999"] };
    await expect(new FetchSceneSource(url, answering(show)).load()).rejects.toThrow(/does not match its facts: s-1 points to fact f-999/);
  });
});
