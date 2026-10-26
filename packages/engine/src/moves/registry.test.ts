import { describe, expect, it } from "vitest";
import { MissingFallbackMoveError, MoveRegistry } from "./registry";

describe("MoveRegistry", () => {
  it("finds a registered move by name", () => {
    const registry = new MoveRegistry<string>().register("highlight", "glow").register("swing", "swing!");
    expect(registry.resolve("swing")).toBe("swing!");
  });

  it("falls back to highlight for an unknown move", () => {
    const registry = new MoveRegistry<string>().register("highlight", "glow");
    expect(registry.resolve("moonwalk")).toBe("glow");
  });

  it("explains how to fix a renderer with no highlight move", () => {
    expect(() => new MoveRegistry<string>().resolve("swing")).toThrow(MissingFallbackMoveError);
  });
});
