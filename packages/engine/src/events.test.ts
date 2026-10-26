import { describe, expect, it } from "vitest";
import { EventBus } from "./events";

describe("EventBus", () => {
  it("delivers payloads to listeners of that event only", () => {
    const bus = new EventBus();
    const taps: string[] = [];
    bus.on("prop:tapped", (e) => taps.push(e.sceneId));
    bus.emit("prop:tapped", { sceneId: "s-1" });
    bus.emit("fix:requested", { sceneId: "s-2" });
    expect(taps).toEqual(["s-1"]);
  });

  it("stops delivering after unsubscribe", () => {
    const bus = new EventBus();
    let count = 0;
    const off = bus.on("show:end", () => void (count += 1));
    off();
    bus.emit("show:end", { sceneCount: 1 });
    expect(count).toBe(0);
  });
});
