import { describe, expect, it } from "vitest";
import factsSchema from "./facts.schema.json" with { type: "json" };
import { FACT_KINDS, SEVERITIES } from "./types";
import { SchemaValidationError, validateFacts, validateScene, validateSceneFile } from "./validate";
import { makeFacts, makeStory } from "./fixtures.test-helpers";

describe("types stay in step with the schema", () => {
  it("has the same fact kinds", () => {
    expect([...FACT_KINDS]).toEqual(factsSchema.$defs.factKind.enum);
  });

  it("has the same severities", () => {
    expect([...SEVERITIES]).toEqual(factsSchema.$defs.severity.enum);
  });
});

describe("validateFacts", () => {
  it("accepts a valid facts file", () => {
    expect(validateFacts(makeFacts()).facts).toHaveLength(2);
  });

  it("rejects a kind outside the closed list", () => {
    const facts = makeFacts();
    Object.assign(facts.facts[0]!, { kind: "looks_scary" });
    expect(() => validateFacts(facts)).toThrow(SchemaValidationError);
  });

  it("rejects a fact with no evidence", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence = [];
    expect(() => validateFacts(facts)).toThrow(/evidence/);
  });

  it("rejects an unknown severity", () => {
    const facts = makeFacts();
    Object.assign(facts.facts[0]!, { severity: "scary" });
    expect(() => validateFacts(facts)).toThrow(SchemaValidationError);
  });

  it("rejects a line number below 1", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence[0]!.startLine = 0;
    expect(() => validateFacts(facts)).toThrow(/startLine/);
  });

  it("rejects a commit that is not a hash", () => {
    const facts = makeFacts();
    facts.facts[0]!.evidence[0]!.commit = "main";
    expect(() => validateFacts(facts)).toThrow(/commit/);
  });

  it("rejects unknown fields and names them", () => {
    const facts = { ...makeFacts(), extra: true };
    expect(() => validateFacts(facts)).toThrow(/extra/);
  });

  it("lists every problem, not just the first", () => {
    const facts = makeFacts();
    Object.assign(facts.facts[0]!, { kind: "nope", severity: "nope" });
    try {
      validateFacts(facts);
      expect.unreachable();
    } catch (error) {
      expect((error as SchemaValidationError).issues.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("validateScene", () => {
  it("accepts a valid scene file", () => {
    expect(validateScene(makeStory()).scenes).toHaveLength(2);
  });

  it("rejects a scene with no factIds", () => {
    const story = makeStory();
    story.scenes[0]!.factIds = [];
    expect(() => validateScene(story)).toThrow(/factIds/);
  });

  it("rejects a scene with no scenes at all", () => {
    expect(() => validateScene({ ...makeStory(), scenes: [] })).toThrow(SchemaValidationError);
  });

  it("rejects a fix without a caption", () => {
    const story = makeStory();
    Object.assign(story.scenes[0]!, { fix: { move: "lock" } });
    expect(() => validateScene(story)).toThrow(/caption/);
  });
});

describe("validateSceneFile", () => {
  it("rejects a bundle whose inner scene file is invalid", () => {
    const bundle = { version: 1, scene: { ...makeStory(), scenes: [] }, facts: makeFacts(), theme: {}, snippets: [] };
    expect(() => validateSceneFile(bundle)).toThrow(SchemaValidationError);
  });
});
