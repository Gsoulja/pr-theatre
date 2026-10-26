import { describe, expect, it } from "vitest";
import { codeExcerptFor } from "./code-excerpt";
import { exampleShow } from "./example-show.test-helpers";

describe("codeExcerptFor", () => {
  const show = exampleShow();
  const keyScene = show.scene.scenes.find((scene) => scene.factIds.includes("f-2"))!;

  it("takes the first piece of evidence that has real lines, and counts the other places", () => {
    expect(codeExcerptFor(show, keyScene)).toEqual({
      file: "src/robotClient.ts",
      lines: [{ number: 8, text: "  headers: { Authorization: `Bearer ${ROBOT_TOKEN}` }," }],
      more: 1,
    });
  });

  it("gives nothing when the show was bundled without code lines", () => {
    expect(codeExcerptFor({ ...show, snippets: [] }, keyScene)).toBeUndefined();
  });
});
