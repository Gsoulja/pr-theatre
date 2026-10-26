import { describe, expect, it } from "vitest";
import { evidenceForScene } from "./evidence";
import { exampleShow } from "./example-show.test-helpers";

describe("evidenceForScene", () => {
  const show = exampleShow();
  const keyScene = show.scene.scenes.find((scene) => scene.factIds.includes("f-2"))!;

  it("lists each fact the scene tells, with every piece of its evidence", () => {
    const [view] = evidenceForScene(show, keyScene);
    expect(view?.fact.id).toBe("f-2");
    expect(view?.evidence.map(({ evidence }) => evidence.startLine)).toEqual([4, 8]);
  });

  it("matches code lines to the right piece of evidence, and leaves the rest empty", () => {
    const [view] = evidenceForScene(show, keyScene);
    expect(view?.evidence.map(({ lines }) => lines.length)).toEqual([0, 1]);
    expect(view?.evidence[1]?.lines[0]).toEqual({ number: 8, text: "  headers: { Authorization: `Bearer ${ROBOT_TOKEN}` }," });
  });

  it("fails loudly when a scene points to a fact the show does not have", () => {
    expect(() => evidenceForScene(show, { ...keyScene, factIds: ["f-999"] })).toThrow(/points to fact f-999/);
  });
});
