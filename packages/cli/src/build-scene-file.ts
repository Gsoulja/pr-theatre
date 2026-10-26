import type { EvidenceSnippet, FactsFile, SceneFile, StoryFile, Theme } from "@pr-theatre/schema";
import type { DiffIndex } from "./diff-index";

/** Packs everything the player needs, including the real code lines when the diff is known. */
export function buildSceneFile(scene: StoryFile, facts: FactsFile, theme: Theme, diff?: DiffIndex): SceneFile {
  const snippets: EvidenceSnippet[] = diff
    ? facts.facts.flatMap((fact) =>
        fact.evidence.map((evidence, evidenceIndex) => ({
          factId: fact.id,
          evidenceIndex,
          lines: diff.snippet(evidence.file, evidence.startLine, evidence.endLine),
        })),
      )
    : [];
  return { version: 1, scene, facts, theme, snippets };
}
