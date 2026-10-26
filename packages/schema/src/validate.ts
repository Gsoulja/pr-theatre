import { Ajv2020 } from "ajv/dist/2020.js";
import type { ErrorObject, ValidateFunction } from "ajv";
import factsSchema from "./facts.schema.json" with { type: "json" };
import sceneSchema from "./scene.schema.json" with { type: "json" };
import themeSchema from "./theme.schema.json" with { type: "json" };
import sceneFileSchema from "./scene-file.schema.json" with { type: "json" };
import type { FactsFile, SceneFile, StoryFile, Theme } from "./types";

export interface SchemaIssue {
  path: string;
  message: string;
}

export class SchemaValidationError extends Error {
  readonly issues: SchemaIssue[];

  constructor(what: string, issues: SchemaIssue[]) {
    const lines = issues.map((issue) => `  - ${issue.path || "(root)"}: ${issue.message}`);
    super(`${what} is not valid:\n${lines.join("\n")}`);
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}

function toIssue(error: ErrorObject): SchemaIssue {
  const extra = error.keyword === "additionalProperties" ? ` (${String(error.params["additionalProperty"])})` : "";
  return { path: error.instancePath, message: `${error.message ?? error.keyword}${extra}` };
}

// One Ajv instance per call keeps this module free of shared mutable state.
function compile<T>(schema: object): ValidateFunction<T> {
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  ajv.addSchema([factsSchema, sceneSchema, themeSchema]);
  return ajv.compile<T>(schema);
}

function validateWith<T>(schema: object, what: string, data: unknown): T {
  const check = compile<T>(schema);
  if (!check(data)) {
    throw new SchemaValidationError(what, (check.errors ?? []).map(toIssue));
  }
  return data;
}

export function validateFacts(data: unknown): FactsFile {
  return validateWith<FactsFile>({ $ref: factsSchema.$id }, "facts.json", data);
}

export function validateScene(data: unknown): StoryFile {
  return validateWith<StoryFile>({ $ref: sceneSchema.$id }, "scene.json", data);
}

export function validateTheme(data: unknown): Theme {
  return validateWith<Theme>({ $ref: themeSchema.$id }, "theme.json", data);
}

export function validateSceneFile(data: unknown): SceneFile {
  return validateWith<SceneFile>(sceneFileSchema, "show bundle", data);
}
