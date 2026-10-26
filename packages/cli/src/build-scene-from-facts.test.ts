import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { checkReferences, validateScene, validateTheme } from "@pr-theatre/schema";
import type { FactsFile } from "@pr-theatre/schema";
import { buildSceneFromFacts } from "./build-scene-from-facts";

const theme = validateTheme(JSON.parse(readFileSync(new URL("../../../themes/theatre/theme.json", import.meta.url), "utf8")));

const facts: FactsFile = {
  meta: { repo: "example/robot", prNumber: 1, title: "t", headCommit: "abc1234" },
  facts: [
    { id: "f-1", kind: "tests_missing", summary: "No tests.", severity: "check", evidence: [{ file: "a", startLine: 1, endLine: 1, commit: "abc1234" }] },
    { id: "f-2", kind: "secret_exposed", summary: "Key in code.", severity: "danger", evidence: [{ file: "a", startLine: 2, endLine: 2, commit: "abc1234" }] },
    { id: "f-3", kind: "feature_added", summary: "New tool.", severity: "ok", evidence: [{ file: "a", startLine: 3, endLine: 3, commit: "abc1234" }] },
  ],
};

describe("buildSceneFromFacts", () => {
  const story = buildSceneFromFacts(facts, theme);

  it("produces a valid scene file whose references all hold", () => {
    expect(validateScene(story)).toBe(story);
    expect(checkReferences(facts, story)).toEqual([]);
  });

  it("tells good news first, then dangers, then checks", () => {
    expect(story.scenes.map((scene) => scene.factIds[0])).toEqual(["f-3", "f-2", "f-1"]);
  });

  it("words captions from the theme and the fact summary", () => {
    expect(story.scenes[1]?.caption).toContain("Key in code.");
    expect(story.scenes[1]?.prop).toBe(theme.kinds.secret_exposed.prop);
  });

  it("adds the theme's fix only to scenes that need one", () => {
    expect(story.scenes[1]?.fix?.move).toBe(theme.kinds.secret_exposed.fix?.move);
    expect(story.scenes[0]?.fix).toBeUndefined();
  });

  it("summarises what needs attention", () => {
    expect(story.meta.summary).toBe("1 thing needs fixing and 1 thing needs a second look.");
  });
});
