import type { LineIndex, SnippetLine } from "@pr-theatre/schema";

interface FileLines {
  added: Map<number, string>;
  removed: Map<number, string>;
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

/**
 * The lines a PR diff actually shows, by file. Evidence must sit inside these lines;
 * new-side numbers for added or kept code, old-side numbers for removed code.
 */
export class DiffIndex implements LineIndex {
  private constructor(private readonly files: Map<string, FileLines>) {}

  static fromUnifiedDiff(diff: string): DiffIndex {
    const files = new Map<string, FileLines>();
    let current: FileLines | undefined;
    let oldPath = "";
    let oldLine = 0;
    let newLine = 0;
    let oldLeft = 0;
    let newLeft = 0;

    for (const line of diff.split("\n")) {
      if (oldLeft > 0 || newLeft > 0) {
        const text = line.slice(1);
        if (line.startsWith("+")) {
          current?.added.set(newLine++, text);
          newLeft -= 1;
        } else if (line.startsWith("-")) {
          current?.removed.set(oldLine++, text);
          oldLeft -= 1;
        } else if (line.startsWith(" ") || line === "") {
          current?.added.set(newLine++, text);
          current?.removed.set(oldLine++, text);
          newLeft -= 1;
          oldLeft -= 1;
        }
        continue;
      }
      if (line.startsWith("--- ")) {
        oldPath = stripPrefix(line.slice(4));
      } else if (line.startsWith("+++ ")) {
        const newPath = stripPrefix(line.slice(4));
        current = { added: new Map(), removed: new Map() };
        for (const path of new Set([newPath, oldPath])) if (path !== "/dev/null") files.set(path, current);
      } else {
        const hunk = HUNK_HEADER.exec(line);
        if (hunk) {
          oldLine = Number(hunk[1]);
          oldLeft = hunk[2] === undefined ? 1 : Number(hunk[2]);
          newLine = Number(hunk[3]);
          newLeft = hunk[4] === undefined ? 1 : Number(hunk[4]);
        }
      }
    }
    return new DiffIndex(files);
  }

  hasFile(file: string): boolean {
    return this.files.has(file);
  }

  covers(file: string, startLine: number, endLine: number): boolean {
    return this.sideFor(file, startLine, endLine) !== undefined;
  }

  /** The real code behind a piece of evidence, so the player can show it offline. */
  snippet(file: string, startLine: number, endLine: number): SnippetLine[] {
    const side = this.sideFor(file, startLine, endLine);
    if (!side) return [];
    return range(startLine, endLine).map((number) => ({ number, text: side.get(number) ?? "" }));
  }

  private sideFor(file: string, startLine: number, endLine: number): Map<number, string> | undefined {
    const lines = this.files.get(file);
    if (!lines) return undefined;
    return [lines.added, lines.removed].find((side) => range(startLine, endLine).every((n) => side.has(n)));
  }
}

function stripPrefix(path: string): string {
  const clean = path.split("\t")[0] ?? path;
  return clean === "/dev/null" ? clean : clean.replace(/^[ab]\//, "");
}

function range(start: number, end: number): number[] {
  return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);
}
