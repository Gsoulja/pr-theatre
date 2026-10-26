import type { Scene, SceneFile } from "@pr-theatre/schema";
import type { CodeExcerpt } from "@pr-theatre/renderer-svg";
import { evidenceForScene } from "./evidence";

/** The lines the stage shows in its close-up: the first piece of evidence that has real code. */
export function codeExcerptFor(show: SceneFile, scene: Scene): CodeExcerpt | undefined {
  const pieces = evidenceForScene(show, scene).flatMap((view) => view.evidence);
  const first = pieces.find((piece) => piece.lines.length > 0);
  return first && { file: first.evidence.file, lines: first.lines, more: pieces.length - 1 };
}
