import { access, cp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { CliError } from "../cli-error";
import { fromCaller } from "../files";

export interface PublishOptions {
  player: string;
  show: string;
  slug: string;
  out: string;
}

const SLUG = /^[a-z0-9][a-z0-9-]*$/;

async function mustExist(path: string, hint: string): Promise<void> {
  try {
    await access(fromCaller(path));
  } catch {
    throw new CliError(`${path} does not exist. ${hint}`);
  }
}

/**
 * Lays out a static site (player + show) ready for GitHub Pages. It does not upload:
 * deploying is the workflow's job, so this command never needs credentials.
 */
export async function publishCommand(options: PublishOptions): Promise<string> {
  if (!SLUG.test(options.slug)) throw new CliError(`--slug must be lowercase letters, digits and dashes, got "${options.slug}".`);
  await mustExist(join(options.player, "index.html"), "Build the player first: pnpm build.");
  await mustExist(join(options.show, "show.json"), "Run the bundle command first.");

  await cp(fromCaller(options.player), fromCaller(options.out), { recursive: true });
  await cp(fromCaller(options.show), fromCaller(join(options.out, "shows", options.slug)), { recursive: true });
  // GitHub Pages would otherwise run Jekyll and hide folders that start with "_".
  await writeFile(fromCaller(join(options.out, ".nojekyll")), "");
  return `Site ready in ${options.out}. Open index.html?show=shows/${options.slug}/show.json`;
}
