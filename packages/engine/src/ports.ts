import type { MoveName, Scene, SceneFile } from "@pr-theatre/schema";

/**
 * Where a scene is drawn. The host type is a parameter because the engine has no DOM:
 * browser renderers implement `Renderer<HTMLElement>`.
 */
export interface Renderer<THost = unknown> {
  mount(el: THost): void;
  /** Resolves when the move has finished, or when a newer `play` replaces it. */
  play(scene: Scene, move: MoveName): Promise<void>;
  dispose(): void;
}

export interface AudioHandle {
  /** Resolves when speech ends or is stopped. */
  readonly finished: Promise<void>;
  stop(): void;
}

export interface Narrator {
  speak(text: string): Promise<AudioHandle>;
}

export interface ArtProvider {
  /** Returns a URL the renderer can show. */
  imageFor(prompt: string, style: string): Promise<string>;
}

export interface SceneSource {
  load(): Promise<SceneFile>;
}
