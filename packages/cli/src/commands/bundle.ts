import { cp } from "node:fs/promises";
import { join } from "node:path";
import { validateSceneFile } from "@pr-theatre/schema";
import { buildSceneFile } from "../build-scene-file";
import { CliError } from "../cli-error";
import { fromCaller, writeJson } from "../files";
import { assertReferences, loadDiff, loadFacts, loadScene, loadTheme } from "../load-inputs";

export interface BundleOptions {
  facts: string;
  scene: string;
  theme: string;
  diff?: string;
  out: string;
}

/** Writes `<out>/show.json` plus the theme's assets: one folder the player can load. */
export async function bundleCommand(options: BundleOptions): Promise<string> {
  const facts = await loadFacts(options.facts);
  const scene = await loadScene(options.scene);
  const theme = await loadTheme(options.theme);
  const diff = await loadDiff(options.diff);
  assertReferences(facts, scene, diff);
  if (scene.meta.theme !== theme.name) {
    throw new CliError(`scene.json is written for the "${scene.meta.theme}" theme but --theme is "${theme.name}".`);
  }

  const showFile = validateSceneFile(buildSceneFile(scene, facts, theme, diff));
  await writeJson(join(options.out, "show.json"), showFile);
  await cp(fromCaller(join(options.theme, "assets")), fromCaller(join(options.out, "assets")), { recursive: true });
  return `Bundled ${scene.scenes.length} scenes into ${join(options.out, "show.json")}.`;
}
