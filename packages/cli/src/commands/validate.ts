import { assertReferences, loadDiff, loadFacts, loadScene } from "../load-inputs";

export interface ValidateOptions {
  facts: string;
  scene?: string;
  diff?: string;
}

/** Checks the files against the schemas and against each other. Throws on any problem. */
export async function validateCommand(options: ValidateOptions): Promise<string> {
  const facts = await loadFacts(options.facts);
  const scene = options.scene === undefined ? undefined : await loadScene(options.scene);
  const diff = await loadDiff(options.diff);
  assertReferences(facts, scene, diff);
  const parts = [`${facts.facts.length} facts`, scene && `${scene.scenes.length} scenes`].filter(Boolean);
  const lines = diff ? " and every piece of evidence points to real lines in the diff" : "";
  return `Valid: ${parts.join(" and ")}${lines}.`;
}
