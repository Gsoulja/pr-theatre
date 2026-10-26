import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { CliError } from "./cli-error";

/** pnpm runs scripts inside the package folder; paths should mean what the caller typed. */
export function fromCaller(path: string): string {
  return resolve(process.env["INIT_CWD"] ?? process.cwd(), path);
}

export async function readText(path: string): Promise<string> {
  try {
    return await readFile(fromCaller(path), "utf8");
  } catch (error) {
    throw new CliError(`Cannot read ${path}: ${(error as Error).message}`);
  }
}

export async function readJson(path: string): Promise<unknown> {
  const text = await readText(path);
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new CliError(`${path} is not valid JSON: ${(error as Error).message}`);
  }
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  const target = fromCaller(path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
