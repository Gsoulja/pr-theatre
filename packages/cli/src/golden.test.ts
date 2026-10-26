import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkReferences, validateFacts, validateScene, validateSceneFile, validateTheme } from "@pr-theatre/schema";
import { buildSceneFile } from "./build-scene-file";
import { buildSceneFromFacts } from "./build-scene-from-facts";
import { DiffIndex } from "./diff-index";

const examplesDir = new URL("../../../examples/", import.meta.url);
const read = (path: string, base: URL = examplesDir) => readFileSync(new URL(path, base), "utf8");
const theme = validateTheme(JSON.parse(read("../themes/theatre/theme.json")));

describe.each(readdirSync(examplesDir))("golden example %s", (example) => {
  const facts = validateFacts(JSON.parse(read(`${example}/facts.json`)));
  const scene = validateScene(JSON.parse(read(`${example}/scene.json`)));
  const diff = DiffIndex.fromUnifiedDiff(read(`${example}/pr.diff`));

  it("has facts that point to real lines and scenes that point to real facts", () => {
    expect(checkReferences(facts, scene, diff)).toEqual([]);
  });

  it("shows every danger fact", () => {
    const told = new Set(scene.scenes.flatMap((s) => s.factIds));
    expect(facts.facts.filter((f) => f.severity === "danger" && !told.has(f.id))).toEqual([]);
  });

  it("drafts a story from the facts that also passes", () => {
    expect(checkReferences(facts, buildSceneFromFacts(facts, theme), diff)).toEqual([]);
  });

  it("bundles a show the player accepts, with the real code for every piece of evidence", () => {
    const show = validateSceneFile(buildSceneFile(scene, facts, theme, diff));
    expect(show.snippets.every((snippet) => snippet.lines.length > 0)).toBe(true);
  });
});
