import { describe, expect, it } from "vitest";
import type { Scene } from "@pr-theatre/schema";
import { SceneHasNoFixError, commandForScene } from "./scene-command";

const scene: Scene = {
  id: "s-1",
  factIds: ["f-1"],
  title: "The key hangs outside",
  caption: "Anyone can take the key.",
  prop: "key",
  move: "swing",
  severity: "danger",
  fix: { move: "lock", caption: "The key is kept inside." },
};

describe("commandForScene", () => {
  it("plays the scene as the PR wrote it before the fix", () => {
    expect(commandForScene(scene, "before")).toEqual({ scene, move: "swing", caption: "Anyone can take the key." });
  });

  it("plays the fix with its own move and caption", () => {
    const command = commandForScene(scene, "fix");
    expect(command.move).toBe("lock");
    expect(command.caption).toBe("The key is kept inside.");
    expect(command.scene.caption).toBe("The key is kept inside.");
  });

  it("shows the fixed scene as fine, so the stage never says 'needs fixing' next to 'fixed'", () => {
    expect(commandForScene(scene, "fix").scene.severity).toBe("ok");
  });

  it("refuses a fix the scene does not have", () => {
    expect(() => commandForScene({ ...scene, fix: undefined }, "fix")).toThrow(SceneHasNoFixError);
  });
});
