import { join } from "node:path";
import { checkReferences, validateFacts, validateScene, validateTheme } from "@pr-theatre/schema";
import type { FactsFile, StoryFile, Theme } from "@pr-theatre/schema";
import { CliError } from "./cli-error";
import { DiffIndex } from "./diff-index";
import { readJson, readText } from "./files";

export async function loadFacts(path: string): Promise<FactsFile> {
  return validateFacts(await readJson(path));
}

export async function loadScene(path: string): Promise<StoryFile> {
  return validateScene(await readJson(path));
}

export async function loadDiff(path: string | undefined): Promise<DiffIndex | undefined> {
  return path === undefined ? undefined : DiffIndex.fromUnifiedDiff(await readText(path));
}

export async function loadTheme(themeDir: string): Promise<Theme> {
  const theme = validateTheme(await readJson(join(themeDir, "theme.json")));
  const missing = Object.values(theme.kinds)
    .map((look) => look.prop)
    .filter((prop) => !(prop in theme.props));
  if (missing.length > 0) {
    throw new CliError(`Theme ${theme.name} uses props with no artwork: ${[...new Set(missing)].join(", ")}. Add them to "props".`);
  }
  return theme;
}

/** Throws one readable error listing every broken reference, never just the first. */
export function assertReferences(facts: FactsFile, scene?: StoryFile, diff?: DiffIndex): void {
  const issues = checkReferences(facts, scene, diff);
  if (issues.length === 0) return;
  const lines = issues.map((issue) => `  - ${issue.where}: ${issue.message}`);
  throw new CliError(`The story does not match the facts:\n${lines.join("\n")}`);
}
