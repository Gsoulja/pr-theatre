import type { FactsFile, StoryFile } from "./types";

export function makeFacts(): FactsFile {
  return {
    meta: { repo: "example/robot", prNumber: 7, title: "Add arm", headCommit: "abc1234" },
    facts: [
      {
        id: "f-1",
        kind: "secret_exposed",
        summary: "The key is in the code.",
        severity: "danger",
        evidence: [{ file: "src/a.ts", startLine: 3, endLine: 4, commit: "abc1234" }],
      },
      {
        id: "f-2",
        kind: "tests_added",
        summary: "Tests were added.",
        severity: "ok",
        evidence: [{ file: "src/a.test.ts", startLine: 1, endLine: 9, commit: "abc1234" }],
      },
    ],
  };
}

export function makeStory(): StoryFile {
  return {
    meta: { repo: "example/robot", prNumber: 7, title: "Add arm", theme: "theatre", summary: "One danger." },
    scenes: [
      { id: "s-1", factIds: ["f-1"], title: "Key", caption: "The key hangs outside.", prop: "key", move: "swing", severity: "danger" },
      { id: "s-2", factIds: ["f-2"], title: "Rehearsal", caption: "They rehearsed.", prop: "rehearsal", move: "enter", severity: "ok" },
    ],
  };
}
