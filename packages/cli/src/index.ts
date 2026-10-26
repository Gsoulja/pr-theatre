import { parseArgs } from "node:util";
import { SchemaValidationError } from "@pr-theatre/schema";
import { CliError } from "./cli-error";
import { bundleCommand } from "./commands/bundle";
import { draftCommand } from "./commands/draft";
import { publishCommand } from "./commands/publish";
import { validateCommand } from "./commands/validate";

const USAGE = `pr-theatre <command> [options]

  validate --facts <file> [--scene <file>] [--diff <file>]
  draft    --facts <file> --theme <dir> --out <file>
  bundle   --facts <file> --scene <file> --theme <dir> [--diff <file>] --out <dir>
  publish  --player <dist dir> --show <bundle dir> --slug <name> --out <site dir>
`;

const OPTIONS = {
  facts: { type: "string" },
  scene: { type: "string" },
  diff: { type: "string" },
  theme: { type: "string" },
  out: { type: "string" },
  player: { type: "string" },
  show: { type: "string" },
  slug: { type: "string" },
} as const;

type Values = Partial<Record<keyof typeof OPTIONS, string>>;

function required(values: Values, name: keyof typeof OPTIONS): string {
  const value = values[name];
  if (value === undefined) throw new CliError(`Missing --${name}.\n\n${USAGE}`);
  return value;
}

function run(command: string | undefined, values: Values): Promise<string> {
  switch (command) {
    case "validate":
      return validateCommand({ facts: required(values, "facts"), ...pick(values, "scene", "diff") });
    case "draft":
      return draftCommand({ facts: required(values, "facts"), theme: required(values, "theme"), out: required(values, "out") });
    case "bundle":
      return bundleCommand({
        facts: required(values, "facts"),
        scene: required(values, "scene"),
        theme: required(values, "theme"),
        out: required(values, "out"),
        ...pick(values, "diff"),
      });
    case "publish":
      return publishCommand({
        player: required(values, "player"),
        show: required(values, "show"),
        slug: required(values, "slug"),
        out: required(values, "out"),
      });
    default:
      throw new CliError(command === undefined ? USAGE : `Unknown command "${command}".\n\n${USAGE}`);
  }
}

function pick<K extends keyof typeof OPTIONS>(values: Values, ...names: K[]): Partial<Record<K, string>> {
  // exactOptional-style: leave absent options out instead of passing `undefined`.
  return Object.fromEntries(names.flatMap((name) => (values[name] === undefined ? [] : [[name, values[name]]]))) as Partial<Record<K, string>>;
}

try {
  // pnpm passes a literal "--" through when called as `pnpm --filter cli start -- <args>`.
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const { positionals, values } = parseArgs({ args, options: OPTIONS, allowPositionals: true });
  process.stdout.write(`${await run(positionals[0], values)}\n`);
} catch (error) {
  const known = error instanceof CliError || error instanceof SchemaValidationError;
  process.stderr.write(`${known ? error.message : String((error as Error).stack ?? error)}\n`);
  process.exitCode = 1;
}
