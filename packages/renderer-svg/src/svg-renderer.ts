import type { EventBus, MoveRegistry, PlaybackEvents, Renderer } from "@pr-theatre/engine";
import { SEVERITY_LABELS } from "@pr-theatre/schema";
import type { MoveName, PropName, Scene } from "@pr-theatre/schema";
import { gsap } from "./gsap";
import type { SplitText } from "./gsap";
import { createSvgMoveRegistry } from "./moves";
import type { SvgMove } from "./moves/move-context";
import { codeCloseUp, fillCodeCard, leaveCloseUp, resetCloseUp } from "./sequence/code-card";
import type { CodeExcerpt } from "./sequence/code-card";
import { closeCurtains, curtainsAreOpen, openCurtains } from "./sequence/curtains";
import { riseHeadline } from "./sequence/headline";
import { fillCaption, lightWords } from "./sequence/karaoke";
import { buildStage } from "./stage";
import type { StageParts } from "./stage";

/** How one prop looks on this stage. Built from the theme by the composition root. */
export interface PropLook {
  href: string;
  alt: string;
  colour: string;
}

export interface SvgRendererOptions {
  looks: Record<PropName, PropLook>;
  events: EventBus<PlaybackEvents>;
  /** When true every scene jumps straight to its final still frame. */
  reducedMotion: boolean;
  /** The real code behind a scene, for the close-up. Scenes without it skip that beat. */
  codeFor?: (scene: Scene) => CodeExcerpt | undefined;
  /** Caption pace. Matches the narrator, so words light up as they are told. */
  wordsPerMinute?: number;
  moves?: MoveRegistry<SvgMove>;
}

export class NotMountedError extends Error {
  constructor() {
    super("SvgRenderer.play was called before mount(). Mount it into an element first.");
    this.name = "NotMountedError";
  }
}

const NEUTRAL = "#fbf3e4";
// Below this the card's code would be unreadable; "See the real code" still has every line.
const MIN_WIDTH_FOR_CODE = 520;
// Shown when a scene names a prop the theme has no art for: never crash, still tell the story.
const UNKNOWN_PROP_HREF =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="#fbf3e4" stroke="#3a2a1f" stroke-width="4"/><text x="100" y="128" font-size="90" text-anchor="middle" font-family="Georgia,serif" fill="#3a2a1f">?</text></svg>');

/** The 2D theatre: each scene plays as a short explainer — curtain, headline, act, the real code. */
export class SvgRenderer implements Renderer<HTMLElement> {
  private parts: StageParts | undefined;
  private running: gsap.core.Timeline | undefined;
  private finishRunning: (() => void) | undefined;
  private sceneId: string | undefined;
  private split: SplitText | undefined;
  private readonly moves: MoveRegistry<SvgMove>;

  constructor(private readonly options: SvgRendererOptions) {
    this.moves = options.moves ?? createSvgMoveRegistry();
  }

  mount(el: HTMLElement): void {
    this.dispose();
    this.parts = buildStage(el.ownerDocument);
    this.parts.prop.addEventListener("click", this.onTap);
    this.parts.prop.addEventListener("keydown", this.onKey);
    el.append(this.parts.root);
  }

  play(scene: Scene, move: MoveName): Promise<void> {
    const parts = this.parts;
    if (!parts) return Promise.reject(new NotMountedError());
    this.stopRunning();
    const newScene = scene.id !== this.sceneId;
    this.sceneId = scene.id;
    return new Promise<void>((resolve) => {
      this.finishRunning = resolve;
      const perform = (): void => this.run(this.stageScene(parts, scene, move, newScene));
      if (newScene && curtainsAreOpen(parts) && !this.options.reducedMotion) {
        // The old scene stays up while the curtains close; the new one is set behind them.
        this.running = closeCurtains(parts).eventCallback("onComplete", perform);
      } else {
        perform();
      }
    });
  }

  dispose(): void {
    this.stopRunning();
    this.split?.revert();
    this.split = undefined;
    if (!this.parts) return;
    this.parts.prop.removeEventListener("click", this.onTap);
    this.parts.prop.removeEventListener("keydown", this.onKey);
    this.parts.root.remove();
    this.parts = undefined;
    this.sceneId = undefined;
  }

  private stageScene(parts: StageParts, scene: Scene, move: MoveName, opening: boolean): gsap.core.Timeline {
    const look = this.options.looks[scene.prop];
    // The engine plays a fix as the same scene with the fix's move and caption.
    const isFix = scene.fix !== undefined && scene.fix.move === move && scene.fix.caption === scene.caption;
    this.split?.revert();
    parts.root.dataset["severity"] = scene.severity;
    parts.badge.textContent = isFix ? "After the fix" : SEVERITY_LABELS[scene.severity];
    parts.title.textContent = scene.title;
    parts.spokenTitle.textContent = `${parts.badge.textContent}: ${scene.title}. `;
    parts.prop.setAttribute("aria-label", `${look?.alt ?? scene.title}. ${scene.title}. Press to see the real code.`);
    parts.art.replaceChildren();
    gsap.set(parts.stamp, { opacity: 0 });
    gsap.set(parts.spotlight, { attr: { fill: look?.colour ?? NEUTRAL } });
    if (opening) resetCloseUp(parts);
    // An unmeasured stage (no layout yet) counts as wide enough.
    const width = parts.root.clientWidth;
    const roomForCode = width === 0 || width >= MIN_WIDTH_FOR_CODE;
    const rows = fillCodeCard(parts, isFix || !roomForCode ? undefined : this.options.codeFor?.(scene));
    const words = fillCaption(parts.caption, scene.caption);

    const start = opening ? 0.3 : 0;
    const master = gsap.timeline();
    // A new scene opens behind fresh curtains; the same scene replayed glides back to the full stage.
    master.add(opening ? openCurtains(parts) : leaveCloseUp(parts), 0);
    const headline = riseHeadline(parts.title, parts.badge);
    this.split = headline.split;
    master.add(headline.timeline, start);
    const act = this.moves.resolve(move).build({
      doc: parts.root.ownerDocument,
      art: parts.art,
      colour: look?.colour ?? NEUTRAL,
      propHref: look?.href ?? UNKNOWN_PROP_HREF,
      spotlight: parts.spotlight,
      stamp: parts.stamp,
    });
    master.add(act, start + 0.15);
    // The close-up comes once the act has made its point, never before the viewer saw it.
    if (rows.length > 0) master.add(codeCloseUp(parts, rows), start + Math.min(Math.max(act.duration() * 0.85, 3), 4.6));
    master.add(lightWords(words, this.options.wordsPerMinute ?? 180), start + 0.5);
    return master;
  }

  private run(master: gsap.core.Timeline): void {
    this.running = master;
    if (this.options.reducedMotion) {
      master.progress(1);
      this.stopRunning();
      return;
    }
    master.eventCallback("onComplete", () => this.stopRunning());
  }

  private stopRunning(): void {
    this.running?.kill();
    this.running = undefined;
    const finish = this.finishRunning;
    this.finishRunning = undefined;
    finish?.();
  }

  private readonly onTap = (): void => {
    if (this.sceneId) this.options.events.emit("prop:tapped", { sceneId: this.sceneId });
  };

  private readonly onKey = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.onTap();
  };
}
