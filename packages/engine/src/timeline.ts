import type { Scene } from "@pr-theatre/schema";
import type { EventBus, PlaybackEvents, SceneVariant } from "./events";
import type { AudioHandle, Narrator, Renderer } from "./ports";
import { commandForScene } from "./scene-command";

export interface TimelineDeps {
  scenes: readonly Scene[];
  renderer: Pick<Renderer, "play">;
  narrator: Narrator;
  events: EventBus<PlaybackEvents>;
}

export class EmptyShowError extends Error {
  constructor() {
    super("The show has no scenes. Validate scene.json before building a Timeline.");
    this.name = "EmptyShowError";
  }
}

/** Plays scenes in order with pause, seek, replay and "show the fix". */
export class Timeline {
  private index = 0;
  private playing = false;
  private finished = false;
  // Bumped by every command, so a loop started by an older command knows to stop.
  private generation = 0;
  private speech: AudioHandle | undefined;

  constructor(private readonly deps: TimelineDeps) {
    if (deps.scenes.length === 0) throw new EmptyShowError();
  }

  get currentIndex(): number {
    return this.index;
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  get currentScene(): Scene {
    return this.sceneAt(this.index);
  }

  async play(): Promise<void> {
    if (this.playing) return;
    if (this.finished) this.index = 0;
    this.finished = false;
    const generation = this.interrupt();
    this.setPlaying(true);
    try {
      while (generation === this.generation) {
        await this.perform(this.index, "before");
        if (generation !== this.generation) return;
        if (this.index === this.deps.scenes.length - 1) {
          this.finished = true;
          this.setPlaying(false);
          this.deps.events.emit("show:end", { sceneCount: this.deps.scenes.length });
          return;
        }
        this.index += 1;
      }
    } catch (error) {
      this.setPlaying(false);
      throw error;
    }
  }

  pause(): void {
    this.interrupt();
    this.setPlaying(false);
  }

  /** Jumps to a scene. Keeps playing if it was playing; otherwise shows that one scene. */
  async seek(index: number): Promise<void> {
    const wasPlaying = this.playing;
    this.pause();
    this.index = Math.min(Math.max(index, 0), this.deps.scenes.length - 1);
    this.finished = false;
    if (wasPlaying) return this.play();
    return this.perform(this.index, "before");
  }

  next(): Promise<void> {
    return this.seek(this.index + 1);
  }

  previous(): Promise<void> {
    return this.seek(this.index - 1);
  }

  replay(): Promise<void> {
    this.pause();
    this.index = 0;
    this.finished = false;
    return this.play();
  }

  /** Replays the current scene with its fix move. Pauses the show so the fix can be watched. */
  playFix(): Promise<void> {
    this.pause();
    return this.perform(this.index, "fix");
  }

  private interrupt(): number {
    this.generation += 1;
    this.speech?.stop();
    this.speech = undefined;
    return this.generation;
  }

  private setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    this.playing = playing;
    this.deps.events.emit("playback:state", { playing });
  }

  private sceneAt(index: number): Scene {
    const scene = this.deps.scenes[index];
    if (!scene) throw new RangeError(`No scene at index ${index}; the show has ${this.deps.scenes.length}.`);
    return scene;
  }

  private async perform(index: number, variant: SceneVariant): Promise<void> {
    const generation = this.generation;
    const command = commandForScene(this.sceneAt(index), variant);
    const payload = { sceneId: command.scene.id, index, variant };
    this.deps.events.emit("scene:start", payload);
    const speech = await this.deps.narrator.speak(command.caption);
    if (generation !== this.generation) {
      speech.stop();
      return;
    }
    this.speech = speech;
    await Promise.all([this.deps.renderer.play(command.scene, command.move), speech.finished]);
    if (generation === this.generation) this.deps.events.emit("scene:end", payload);
  }
}
