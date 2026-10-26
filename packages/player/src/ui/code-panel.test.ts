// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { exampleShow } from "../example-show.test-helpers";
import { CodePanel } from "./code-panel";

describe("CodePanel", () => {
  const show = exampleShow();
  const keyScene = show.scene.scenes.find((scene) => scene.factIds.includes("f-2"))!;
  let dialog: HTMLDialogElement;

  beforeEach(() => {
    dialog = document.createElement("dialog");
    // jsdom has no modal dialogs; the browser behaviour is not what these tests check.
    dialog.showModal = vi.fn();
    document.body.replaceChildren(dialog);
    new CodePanel(dialog, show).open(keyScene);
  });

  it("opens as a modal named by the scene title", () => {
    expect(dialog.showModal).toHaveBeenCalledOnce();
    const title = document.getElementById(dialog.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe(keyScene.title);
  });

  it("tells the fact in plain words with its severity", () => {
    expect(dialog.querySelector(".pt-fact-summary")?.textContent).toBe(show.facts.facts.find((f) => f.id === "f-2")?.summary);
    expect(dialog.querySelector(".pt-fact-label")?.textContent).toBe("Needs fixing");
  });

  it("shows where each piece of evidence lives and the real lines when they were bundled", () => {
    const [first, second] = dialog.querySelectorAll(".pt-snippet");
    expect(first?.querySelector("figcaption")?.textContent).toBe("src/robotClient.ts · line 4 · commit 4153593");
    expect(first?.querySelector(".pt-snippet-missing")).not.toBeNull();
    expect([...(second?.querySelectorAll(".pt-line") ?? [])].map((line) => line.textContent)).toEqual(["8  headers: { Authorization: `Bearer ${ROBOT_TOKEN}` },"]);
  });

  it("never parses show text as HTML", () => {
    const sneaky = { ...keyScene, title: "<img src=x onerror=alert(1)>" };
    new CodePanel(dialog, show).open(sneaky);
    expect(dialog.querySelector("img")).toBeNull();
    expect(dialog.querySelector(".pt-code-title")?.textContent).toBe(sneaky.title);
  });
});
