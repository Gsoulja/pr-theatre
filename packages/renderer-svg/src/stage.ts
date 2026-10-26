import { rig, svgEl } from "./art/svg";
import type { Rig } from "./art/svg";
import { STAGE } from "./moves/move-context";

export interface StageParts {
  root: HTMLElement;
  /** The tappable group the scene is drawn in; `art` is the empty layer inside it. */
  prop: SVGGElement;
  art: SVGGElement;
  camera: Rig;
  curtainLeft: Rig;
  curtainRight: Rig;
  spotlight: SVGEllipseElement;
  stamp: SVGGElement;
  badge: HTMLElement;
  title: HTMLElement;
  code: HTMLElement;
  codeFile: HTMLElement;
  codeLines: HTMLElement;
  codeMore: HTMLElement;
  caption: HTMLElement;
  /** The title again, for screen readers only, so the live caption region says which scene this is. */
  spokenTitle: HTMLElement;
}

/** How far a curtain slides from closed (meeting in the middle) to open (gathered at the side). */
export const CURTAIN_TRAVEL = 272;
/** Further still for the code close-up, so the drawing and the card share a wider stage. */
export const CURTAIN_WIDE = 340;

function html<K extends keyof HTMLElementTagNameMap>(doc: Document, tag: K, className: string): HTMLElementTagNameMap[K] {
  const el = doc.createElement(tag);
  el.className = className;
  return el;
}

function drawCurtain(doc: Document, side: "left" | "right"): SVGGElement {
  const { width, height } = STAGE;
  const mirror = side === "right" ? `translate(${width} 0) scale(-1 1)` : "";
  const folds = [70, 150, 230, 315].map((x) => svgEl(doc, "path", { d: `M${x} 0 Q${x - 14} ${height / 2} ${x + 6} ${height}`, class: "pt-curtain-fold" }));
  return svgEl(doc, "g", { class: "pt-curtain" }, svgEl(doc, "g", { transform: mirror }, svgEl(doc, "path", { d: `M0 0 H412 Q392 ${height / 2} 414 ${height} H0 Z` }), ...folds));
}

function drawStamp(doc: Document): SVGGElement {
  const stamp = svgEl(doc, "g", { class: "pt-stamp", opacity: 0 });
  const label = svgEl(doc, "text", { x: 640, y: 100, "text-anchor": "middle", transform: "rotate(-8 640 90)" });
  label.textContent = "FIXED";
  stamp.append(svgEl(doc, "rect", { x: 570, y: 64, width: 140, height: 50, rx: 8, transform: "rotate(-8 640 90)" }), label);
  return stamp;
}

function buildCodeCard(doc: Document) {
  const code = html(doc, "div", "pt-code-card");
  code.setAttribute("aria-hidden", "true");
  const codeFile = html(doc, "div", "pt-code-file");
  const codeLines = html(doc, "div", "pt-code-lines");
  const codeMore = html(doc, "div", "pt-code-more");
  code.append(html(doc, "div", "pt-code-label"), codeFile, codeLines, codeMore);
  (code.firstElementChild as HTMLElement).textContent = "In the code";
  return { code, codeFile, codeLines, codeMore };
}

/** Builds the stage once per mount. Scenes only redraw the art layer, the words and the code card. */
export function buildStage(doc: Document): StageParts {
  const { width, height, floor } = STAGE;
  const stage = svgEl(doc, "svg", { viewBox: `0 0 ${width} ${height}`, class: "pt-stage", role: "group" });
  stage.append(
    svgEl(doc, "rect", { width, height, class: "pt-backdrop" }),
    svgEl(doc, "path", { d: `M0 ${height} L90 ${floor} H710 L${width} ${height} Z`, class: "pt-floor" }),
    svgEl(doc, "polygon", { points: `360,0 440,0 560,${floor + 15} 240,${floor + 15}`, class: "pt-beam" }),
  );
  const spotlight = svgEl(doc, "ellipse", { cx: STAGE.centre, cy: floor + 8, rx: 170, ry: 28, class: "pt-spotlight" });
  const art = svgEl(doc, "g", { class: "pt-art" });
  const prop = svgEl(doc, "g", { class: "pt-prop", tabindex: 0, role: "button" }, svgEl(doc, "rect", { x: 150, y: 74, width: 500, height: 276, rx: 18, class: "pt-focus-ring" }), art);
  const cameraEl = svgEl(doc, "g", { class: "pt-camera" }, spotlight, prop);
  const left = drawCurtain(doc, "left");
  const right = drawCurtain(doc, "right");
  const stamp = drawStamp(doc);
  stage.append(cameraEl, left, right, svgEl(doc, "path", { d: `M0 0 H${width} V58 Q600 92 400 66 Q200 92 0 58 Z`, class: "pt-valance" }), stamp);

  const headline = html(doc, "div", "pt-headline");
  const badge = html(doc, "span", "pt-badge");
  const title = html(doc, "h2", "pt-title");
  headline.append(badge, title);
  const card = buildCodeCard(doc);
  const overlay = html(doc, "div", "pt-overlay");
  overlay.append(headline, card.code);
  const screen = html(doc, "div", "pt-screen");
  screen.append(stage, overlay);

  const words = html(doc, "figcaption", "pt-words");
  words.setAttribute("aria-live", "polite");
  const spokenTitle = html(doc, "span", "pt-sr-only");
  const caption = html(doc, "p", "pt-caption");
  words.append(spokenTitle, caption);

  const root = html(doc, "figure", "pt-theatre");
  root.append(screen, words);
  return {
    root,
    prop,
    art,
    camera: rig(cameraEl, { x: STAGE.centre, y: floor }),
    // Closed until the first scene: the show opens with a curtain-up.
    curtainLeft: rig(left, { x: 0, y: 0 }),
    curtainRight: rig(right, { x: width, y: 0 }),
    spotlight,
    stamp,
    badge,
    title,
    ...card,
    caption,
    spokenTitle,
  };
}
