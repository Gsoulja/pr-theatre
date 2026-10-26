import { describe, expect, it } from "vitest";
import { DiffIndex } from "./diff-index";

const diff = `diff --git a/src/app.ts b/src/app.ts
index 1111111..2222222 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -10,4 +10,4 @@ export function start() {
 const a = 1;
-const limit = 5;
+const limit = 50;
 const b = 2;

diff --git a/src/old.ts b/src/old.ts
deleted file mode 100644
--- a/src/old.ts
+++ /dev/null
@@ -1,2 +0,0 @@
---- not a header, a removed line
-export {};
`;

describe("DiffIndex", () => {
  const index = DiffIndex.fromUnifiedDiff(diff);

  it("knows which files the PR touches", () => {
    expect(index.hasFile("src/app.ts")).toBe(true);
    expect(index.hasFile("src/old.ts")).toBe(true);
    expect(index.hasFile("src/other.ts")).toBe(false);
  });

  it("covers new-side lines that the diff shows", () => {
    expect(index.covers("src/app.ts", 10, 13)).toBe(true);
    expect(index.covers("src/app.ts", 11, 11)).toBe(true);
  });

  it("does not cover lines outside the hunk", () => {
    expect(index.covers("src/app.ts", 9, 10)).toBe(false);
    expect(index.covers("src/app.ts", 13, 14)).toBe(false);
  });

  it("covers removed lines by their old numbers", () => {
    expect(index.covers("src/old.ts", 1, 2)).toBe(true);
  });

  it("returns the real text for a snippet", () => {
    expect(index.snippet("src/app.ts", 11, 11)).toEqual([{ number: 11, text: "const limit = 50;" }]);
    expect(index.snippet("src/old.ts", 1, 1)).toEqual([{ number: 1, text: "--- not a header, a removed line" }]);
  });

  it("returns no snippet for lines that are not in the diff", () => {
    expect(index.snippet("src/app.ts", 40, 41)).toEqual([]);
  });
});
