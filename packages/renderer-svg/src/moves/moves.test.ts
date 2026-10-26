// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { EventBus } from "@pr-theatre/engine";
import type { PlaybackEvents } from "@pr-theatre/engine";
import type { Scene } from "@pr-theatre/schema";
import { SvgRenderer } from "../svg-renderer";
import { SVG_MOVES } from "./index";

// jsdom has no layout. Line drawing needs a path length; that is all these smoke tests stub.
beforeAll(() => {
  const proto = window.SVGElement.prototype as unknown as Record<string, unknown>;
  proto["getTotalLength"] = () => 100;
  proto["getBBox"] = () => ({ x: 0, y: 0, width: 100, height: 100 });
});

const scene = (move: string): Scene => ({
  id: `s-${move}`,
  factIds: ["f-1"],
  title: "A scene title",
  caption: "Words the viewer reads while the act plays.",
  prop: "key",
  move,
  severity: "danger",
  fix: { move: "lock-key", caption: "After the fix." },
});

describe.each(SVG_MOVES.map((move) => move.name))("move %s", (name) => {
  let host: HTMLElement;
  afterEach(() => host.remove());

  it("mounts, plays to its still frame, and disposes without errors", async () => {
    host = document.createElement("div");
    document.body.append(host);
    const renderer = new SvgRenderer({
      looks: { key: { href: "assets/key.svg", alt: "A key", colour: "#d64545" } },
      events: new EventBus<PlaybackEvents>(),
      reducedMotion: true,
      codeFor: () => ({ file: "src/a.ts", lines: [{ number: 3, text: "const key = 'x';" }], more: 1 }),
    });
    renderer.mount(host);
    await expect(renderer.play(scene(name), name)).resolves.toBeUndefined();
    expect(host.querySelector(".pt-art")?.childElementCount).toBeGreaterThan(0);
    expect(host.querySelector(".pt-title")?.textContent).toBe("A scene title");
    renderer.dispose();
    expect(host.childElementCount).toBe(0);
  });
});

describe("the stage around every move", () => {
  it("falls back to the theme's picture for a move it does not know", async () => {
    const host = document.createElement("div");
    const renderer = new SvgRenderer({ looks: {}, events: new EventBus<PlaybackEvents>(), reducedMotion: true });
    renderer.mount(host);
    await renderer.play(scene("no-such-move"), "no-such-move");
    expect(host.querySelector(".pt-art image")).not.toBeNull();
    renderer.dispose();
  });

  it("shows the real code in the close-up, as text, and leaves it out of the fix", async () => {
    const host = document.createElement("div");
    const renderer = new SvgRenderer({
      looks: {},
      events: new EventBus<PlaybackEvents>(),
      reducedMotion: true,
      codeFor: () => ({ file: "src/deep/down/in/a.ts", lines: [{ number: 7, text: "<b>not html</b>" }], more: 0 }),
    });
    renderer.mount(host);
    await renderer.play(scene("key-outside"), "key-outside");
    expect(host.querySelector(".pt-code-file")?.textContent).toBe("…/down/in/a.ts");
    expect(host.querySelector(".pt-code-text")?.textContent).toBe("<b>not html</b>");
    expect(host.querySelector(".pt-code-card b")).toBeNull();
    await renderer.play({ ...scene("key-outside"), caption: "After the fix." }, "lock-key");
    expect((host.querySelector(".pt-code-card") as HTMLElement).hidden).toBe(true);
    expect(host.querySelector(".pt-badge")?.textContent).toBe("After the fix");
    renderer.dispose();
  });
});
