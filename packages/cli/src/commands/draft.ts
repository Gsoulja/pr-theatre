import { buildSceneFromFacts } from "../build-scene-from-facts";
import { writeJson } from "../files";
import { assertReferences, loadFacts, loadTheme } from "../load-inputs";

export interface DraftOptions {
  facts: string;
  theme: string;
  out: string;
}

/** Writes the deterministic first draft of scene.json for the storyteller to polish. */
export async function draftCommand(options: DraftOptions): Promise<string> {
  const facts = await loadFacts(options.facts);
  const theme = await loadTheme(options.theme);
  const scene = buildSceneFromFacts(facts, theme);
  assertReferences(facts, scene);
  await writeJson(options.out, scene);
  return `Drafted ${scene.scenes.length} scenes in the ${theme.name} theme to ${options.out}.`;
}
