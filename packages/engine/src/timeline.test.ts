import { describe, expect, it } from "vitest";
import type { MoveName, Scene } from "@pr-theatre/schema";
import { EventBus } from "./events";
import type { PlaybackEvents } from "./events";
import type { AudioHandle, Narrator, Renderer } from "./ports";
import { SceneHasNoFixError } from "./scene-command";
import { EmptyShowError, Timeline } from "./timeline";

class RecordingRenderer implements Renderer {
  readonly calls: Array<{ sceneId: string; move: MoveName; caption: string }> = [];
  mount(): void {}
  dispose(): void {}
  async play(scene: Scene, move: MoveName): Promise<void> {
    this.calls.push({ sceneId: scene.id, move, caption: scene.caption });
  }
}

class RecordingNarrator implements Narrator {
  readonly spoken: string[] = [];
  stopped = 0;
  async speak(text: string): Promise<AudioHandle> {
    this.spoken.push(text);
    return { finished: Promise.resolve(), stop: () => void (this.stopped += 1) };
  }
}

const scenes: Scene[] = [
  { id: "s-1", factIds: ["f-1"], title: "One", caption: "first", prop: "key", move: "swing", severity: "danger", fix: { move: "lock", caption: "locked" } },
  { id: "s-2", factIds: ["f-2"], title: "Two", caption: "second", prop: "string", move: "dangle", severity: "check" },
  { id: "s-3", factIds: ["f-3"], title: "Three", caption: "third", prop: "crate", move: "enter", severity: "ok" },
];

function setUp() {
  const renderer = new RecordingRenderer();
  const narrator = new RecordingNarrator();
  const events = new EventBus<PlaybackEvents>();
  const seen: string[] = [];
  events.on("scene:start", (e) => seen.push(`start:${e.sceneId}:${e.variant}`));
  events.on("show:end", (e) => seen.push(`end:${e.sceneCount}`));
  const timeline = new Timeline({ scenes, renderer, narrator, events });
  return { renderer, narrator, events, seen, timeline };
}

describe("Timeline", () => {
  it("refuses an empty show", () => {
    const { renderer, narrator, events } = setUp();
    expect(() => new Timeline({ scenes: [], renderer, narrator, events })).toThrow(EmptyShowError);
  });

  it("plays every scene in order and announces the end", async () => {
    const { renderer, narrator, seen, timeline } = setUp();
    await timeline.play();
    expect(renderer.calls.map((c) => `${c.sceneId}:${c.move}`)).toEqual(["s-1:swing", "s-2:dangle", "s-3:enter"]);
    expect(narrator.spoken).toEqual(["first", "second", "third"]);
    expect(seen.at(-1)).toBe("end:3");
    expect(timeline.isPlaying).toBe(false);
  });

  it("seeks to one scene when paused and plays only that scene", async () => {
    const { renderer, timeline } = setUp();
    await timeline.seek(1);
    expect(renderer.calls.map((c) => c.sceneId)).toEqual(["s-2"]);
    expect(timeline.currentIndex).toBe(1);
  });

  it("clamps seeks outside the show", async () => {
    const { timeline } = setUp();
    await timeline.seek(99);
    expect(timeline.currentIndex).toBe(2);
    await timeline.seek(-5);
    expect(timeline.currentIndex).toBe(0);
  });

  it("plays the fix with the fix move and caption", async () => {
    const { renderer, seen, timeline } = setUp();
    await timeline.playFix();
    expect(renderer.calls).toEqual([{ sceneId: "s-1", move: "lock", caption: "locked" }]);
    expect(seen).toEqual(["start:s-1:fix"]);
  });

  it("refuses to play a fix that does not exist", async () => {
    const { timeline } = setUp();
    await timeline.seek(1);
    await expect(timeline.playFix()).rejects.toThrow(SceneHasNoFixError);
  });

  it("stops after the current scene when paused", async () => {
    const { renderer, events, timeline } = setUp();
    events.on("scene:end", () => timeline.pause());
    await timeline.play();
    expect(renderer.calls.map((c) => c.sceneId)).toEqual(["s-1"]);
    expect(timeline.isPlaying).toBe(false);
  });

  it("replays from the start after the show ended", async () => {
    const { renderer, timeline } = setUp();
    await timeline.play();
    await timeline.replay();
    expect(renderer.calls.map((c) => c.sceneId)).toEqual(["s-1", "s-2", "s-3", "s-1", "s-2", "s-3"]);
  });

  it("stops narration when interrupted", async () => {
    const { narrator, timeline } = setUp();
    await timeline.seek(0);
    timeline.pause();
    expect(narrator.stopped).toBeGreaterThan(0);
  });

  it("does not report the show as playing when the renderer fails", async () => {
    const { narrator, events } = setUp();
    const failing: Pick<Renderer, "play"> = { play: () => Promise.reject(new Error("stage broke")) };
    const timeline = new Timeline({ scenes, renderer: failing, narrator, events });
    await expect(timeline.play()).rejects.toThrow("stage broke");
    expect(timeline.isPlaying).toBe(false);
  });
});
