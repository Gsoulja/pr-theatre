import type { MoveName, Scene } from "@pr-theatre/schema";
import type { SceneVariant } from "./events";

/** One playable step. "before" and "fix" are the same mechanism with different data. */
export interface SceneCommand {
  scene: Scene;
  move: MoveName;
  caption: string;
}

export class SceneHasNoFixError extends Error {
  constructor(sceneId: string) {
    super(`Scene ${sceneId} has no fix to show. Only offer "show the fix" when scene.fix is set.`);
    this.name = "SceneHasNoFixError";
  }
}

export function commandForScene(scene: Scene, variant: SceneVariant): SceneCommand {
  if (variant === "before") return { scene, move: scene.move, caption: scene.caption };
  if (!scene.fix) throw new SceneHasNoFixError(scene.id);
  // The renderer shows `scene.caption` and `scene.severity`, so the fixed state travels inside the scene.
  // The fact keeps its real severity; only this replay of "after the fix" is fine.
  return { scene: { ...scene, caption: scene.fix.caption, severity: "ok" }, move: scene.fix.move, caption: scene.fix.caption };
}
