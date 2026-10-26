// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventBus } from "@pr-theatre/engine";
import type { PlaybackEvents } from "@pr-theatre/engine";
import { exampleShow } from "../example-show.test-helpers";
import { PlayerControls } from "./controls";
import type { PlayerCommands } from "./controls";

const scenes = exampleShow().scene.scenes;
const fixIndex = scenes.findIndex((scene) => scene.fix !== undefined);
const plainIndex = scenes.findIndex((scene) => scene.fix === undefined);

const mockCommands = () => ({
  togglePlay: vi.fn<PlayerCommands["togglePlay"]>(),
  previous: vi.fn<PlayerCommands["previous"]>(),
  next: vi.fn<PlayerCommands["next"]>(),
  seek: vi.fn<PlayerCommands["seek"]>(),
  playFix: vi.fn<PlayerCommands["playFix"]>(),
  openCode: vi.fn<PlayerCommands["openCode"]>(),
});

describe("PlayerControls", () => {
  let host: HTMLElement;
  let events: EventBus<PlaybackEvents>;
  let commands: ReturnType<typeof mockCommands>;
  const byText = (text: string) => [...host.querySelectorAll("button")].find((b) => b.textContent === text);
  const steps = () => [...host.querySelectorAll<HTMLButtonElement>(".pt-step")];
  const start = (index: number, variant: "before" | "fix" = "before") =>
    events.emit("scene:start", { sceneId: scenes[index]!.id, index, variant });

  beforeEach(() => {
    host = document.createElement("div");
    events = new EventBus<PlaybackEvents>();
    commands = mockCommands();
    new PlayerControls(host, scenes, events, commands);
  });

  it("offers one step per scene, named for a screen reader with its severity", () => {
    expect(steps()).toHaveLength(scenes.length);
    expect(steps()[0]?.getAttribute("aria-label")).toBe(`Scene 1: ${scenes[0]!.title}. Fine.`);
  });

  it("follows the playing scene", () => {
    start(2);
    expect(host.querySelector(".pt-counter")?.textContent).toBe(`Scene 3 of ${scenes.length}`);
    expect(steps().map((step) => step.hasAttribute("aria-current"))).toEqual(scenes.map((_, i) => i === 2));
  });

  it("shows the fix button only for scenes that have a fix", () => {
    start(plainIndex);
    expect(byText("Show the fix")?.hidden).toBe(true);
    start(fixIndex);
    expect(byText("Show the fix")?.hidden).toBe(false);
  });

  it("plays the fix, then offers the problem again with the same button", () => {
    start(fixIndex);
    byText("Show the fix")?.click();
    expect(commands.playFix).toHaveBeenCalledOnce();
    start(fixIndex, "fix");
    byText("Show the problem again")?.click();
    expect(commands.seek).toHaveBeenCalledWith(fixIndex);
  });

  it("asks for play, steps and the code", () => {
    byText("Play")?.click();
    byText("Back")?.click();
    byText("Next")?.click();
    byText("See the real code")?.click();
    steps()[4]?.click();
    expect([commands.togglePlay, commands.previous, commands.next, commands.openCode].map((c) => c.mock.calls.length)).toEqual([1, 1, 1, 1]);
    expect(commands.seek).toHaveBeenCalledWith(4);
  });

  it("names the play button after what pressing it will do", () => {
    events.emit("playback:state", { playing: true });
    expect(byText("Pause")).toBeDefined();
    events.emit("playback:state", { playing: false });
    events.emit("show:end", { sceneCount: scenes.length });
    expect(byText("Play again")).toBeDefined();
  });
});
