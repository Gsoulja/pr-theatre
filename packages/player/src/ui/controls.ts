import type { EventBus, PlaybackEvents, SceneVariant } from "@pr-theatre/engine";
import { SEVERITY_LABELS } from "@pr-theatre/schema";
import type { Scene } from "@pr-theatre/schema";
import { element } from "./dom";

/** What the buttons ask for. The composition root maps these onto the Timeline. */
export interface PlayerCommands {
  togglePlay(): void;
  previous(): void;
  next(): void;
  seek(index: number): void;
  playFix(): void;
  openCode(): void;
}

function button(doc: Document, label: string, onPress: () => void, className = "pt-button"): HTMLButtonElement {
  const el = element(doc, "button", className, label);
  el.type = "button";
  el.addEventListener("click", onPress);
  return el;
}

/** Play, step, show the fix, see the code, and a strip of every scene. Follows playback through events only. */
export class PlayerControls {
  private readonly playButton: HTMLButtonElement;
  private readonly fixButton: HTMLButtonElement;
  private readonly counter: HTMLElement;
  private readonly steps: HTMLButtonElement[];
  private index = 0;
  private variant: SceneVariant = "before";

  constructor(
    host: HTMLElement,
    private readonly scenes: readonly Scene[],
    events: EventBus<PlaybackEvents>,
    private readonly commands: PlayerCommands,
  ) {
    const doc = host.ownerDocument;
    this.playButton = button(doc, "Play", () => commands.togglePlay(), "pt-button pt-button-primary");
    this.fixButton = button(doc, "Show the fix", () => this.onFixPressed());
    this.counter = element(doc, "p", "pt-counter");
    this.steps = scenes.map((scene, index) => this.stepButton(doc, scene, index));

    const buttons = element(doc, "div", "pt-buttons");
    buttons.setAttribute("role", "group");
    buttons.setAttribute("aria-label", "Show controls");
    buttons.append(
      button(doc, "Back", () => commands.previous()),
      this.playButton,
      button(doc, "Next", () => commands.next()),
      this.fixButton,
      button(doc, "See the real code", () => commands.openCode()),
    );
    const strip = element(doc, "ol", "pt-steps");
    strip.setAttribute("aria-label", "All scenes");
    strip.append(...this.steps.map((step) => listItem(doc, step)));
    host.replaceChildren(buttons, this.counter, strip);

    events.on("scene:start", ({ index, variant }) => this.showScene(index, variant));
    events.on("playback:state", ({ playing }) => (this.playButton.textContent = playing ? "Pause" : "Play"));
    events.on("show:end", () => (this.playButton.textContent = "Play again"));
    this.showScene(0, "before");
  }

  private stepButton(doc: Document, scene: Scene, index: number): HTMLButtonElement {
    const step = button(doc, String(index + 1), () => this.commands.seek(index), "pt-step");
    step.dataset["severity"] = scene.severity;
    step.title = scene.title;
    step.setAttribute("aria-label", `Scene ${index + 1}: ${scene.title}. ${SEVERITY_LABELS[scene.severity]}.`);
    return step;
  }

  private onFixPressed(): void {
    // After the fix, the same button replays the problem: before and after are one mechanism.
    if (this.variant === "fix") this.commands.seek(this.index);
    else this.commands.playFix();
  }

  private showScene(index: number, variant: SceneVariant): void {
    this.index = index;
    this.variant = variant;
    const after = variant === "fix" ? " · after the fix" : "";
    this.counter.textContent = `Scene ${index + 1} of ${this.scenes.length}${after}`;
    this.steps.forEach((step, i) => (i === index ? step.setAttribute("aria-current", "step") : step.removeAttribute("aria-current")));
    this.fixButton.hidden = this.scenes[index]?.fix === undefined;
    this.fixButton.textContent = variant === "fix" ? "Show the problem again" : "Show the fix";
  }
}

function listItem(doc: Document, child: HTMLElement): HTMLLIElement {
  const item = doc.createElement("li");
  item.append(child);
  return item;
}
