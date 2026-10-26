import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SceneFile } from "@pr-theatre/schema";

// A string path, not a URL object: under jsdom `URL` is jsdom's class, which node:fs does not accept.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const repoJson = (path: string): unknown => JSON.parse(readFileSync(join(repoRoot, path), "utf8"));

/** The robot-mcp example as a show, with one hand-made snippet so tests need no diff parser. */
export function exampleShow(): SceneFile {
  return {
    version: 1,
    scene: repoJson("examples/robot-mcp-pr/scene.json"),
    facts: repoJson("examples/robot-mcp-pr/facts.json"),
    theme: repoJson("themes/theatre/theme.json"),
    snippets: [{ factId: "f-2", evidenceIndex: 1, lines: [{ number: 8, text: "  headers: { Authorization: `Bearer ${ROBOT_TOKEN}` }," }] }],
  } as SceneFile;
}
