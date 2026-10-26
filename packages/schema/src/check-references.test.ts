import { describe, expect, it } from "vitest";
import { checkReferences } from "./check-references";
import type { LineIndex } from "./check-references";
import { makeFacts, makeStory } from "./fixtures.test-helpers";

const prLines: LineIndex = {
  hasFile: (file) => file === "src/a.ts" || file === "src/a.test.ts",
  covers: (_file, start, end) => start >= 1 && end <= 20,
};

describe("checkReferences", () => {
  it("passes when every reference is real", () => {
    expect(checkReferences(makeFacts(), makeStory(), prLines)).toEqual([]);
  });

  it("flags a scene that points to a missing fact", () => {
    const story = makeStory();
    story.scenes[1]!.factIds = ["f-2", "f-99"];
    expect(checkReferences(makeFacts(), story)).toContainEqual({
      where: "s-2",
      message: "points to fact f-99, which does not exist in facts.json",
    });
  });

  it("flags a danger fact that no scene shows", () => {
    const story = makeStory();
    story.scenes = story.scenes.slice(1);
    expect(checkReferences(makeFacts(), story)).toContainEqual({ where: "f-1", message: "danger fact is not shown in any scene" });
  });

  it("flags a scene that is calmer than its facts", () => {
    const story = makeStory();
    story.scenes[0]!.severity = "ok";
    expect(checkReferences(makeFacts(), story)[0]?.message).toMatch(/severity is ok but its facts say danger/);
  });

  it("flags evidence in a file that is not in the PR", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence[0]!.file = "src/elsewhere.ts";
    expect(checkReferences(facts, undefined, prLines)[0]?.message).toMatch(/not part of this PR/);
  });

  it("flags evidence lines that are not in the diff", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence[0]!.endLine = 400;
    expect(checkReferences(facts, undefined, prLines)[0]?.message).toMatch(/not in the PR diff/);
  });

  it("flags a line range that runs backwards", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence[0]!.startLine = 9;
    expect(checkReferences(facts)[0]?.message).toMatch(/startLine is after endLine/);
  });

  it("flags duplicate fact and scene ids", () => {
    const facts = makeFacts();
    facts.facts[1]!.id = "f-1";
    const story = makeStory();
    story.scenes[1]!.id = "s-1";
    const messages = checkReferences(facts, story).map((issue) => issue.message);
    expect(messages).toContain("fact id is used more than once");
    expect(messages).toContain("scene id is used more than once");
  });

  it("flags scenes and facts from different pull requests", () => {
    const story = makeStory();
    story.meta.prNumber = 8;
    expect(checkReferences(makeFacts(), story)).toContainEqual({
      where: "meta",
      message: "scene.json and facts.json describe different pull requests",
    });
  });
});
