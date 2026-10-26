import { group, ink, INK, rig, SKIN, svgEl, WOOD, WOOD_DARK } from "./svg";
import type { Pivot, Rig } from "./svg";

export interface Puppet {
  root: SVGGElement;
  /** The whole puppet; pivot at its feet. */
  body: Rig;
  head: Rig;
  armLeft: Rig;
  armRight: Rig;
  feet: Pivot;
}

export interface PuppetOptions {
  x: number;
  y: number;
  tunic: string;
  size?: number;
  /** A director's cap, for the one who says yes. */
  cap?: boolean;
}

/** A wooden marionette standing with its feet at (x, y). About 140 units tall at size 1. */
export function drawPuppet(doc: Document, { x, y, tunic, size = 1, cap = false }: PuppetOptions): Puppet {
  const at = (dx: number, dy: number): string => `${x + dx * size} ${y + dy * size}`;
  const shoulderL = { x: x - 22 * size, y: y - 86 * size };
  const shoulderR = { x: x + 22 * size, y: y - 86 * size };
  const arm = (shoulder: Pivot, side: number): SVGGElement =>
    group(
      doc,
      {},
      svgEl(doc, "path", { d: `M${shoulder.x} ${shoulder.y} L${shoulder.x + side * 22 * size} ${shoulder.y + 34 * size}`, fill: "none", ...ink({ "stroke-width": 7 * size }) }),
      svgEl(doc, "circle", { cx: shoulder.x + side * 22 * size, cy: shoulder.y + 36 * size, r: 6 * size, fill: SKIN, ...ink({ "stroke-width": 4 * size }) }),
    );
  const armLeftEl = arm(shoulderL, -1);
  const armRightEl = arm(shoulderR, 1);
  const headEl = group(
    doc,
    {},
    svgEl(doc, "circle", { cx: x, cy: y - 116 * size, r: 22 * size, fill: SKIN, ...ink({ "stroke-width": 5 * size }) }),
    svgEl(doc, "circle", { cx: x - 7 * size, cy: y - 119 * size, r: 2.8 * size, fill: INK }),
    svgEl(doc, "circle", { cx: x + 7 * size, cy: y - 119 * size, r: 2.8 * size, fill: INK }),
    svgEl(doc, "path", { d: `M${at(-8, -108)} Q${at(0, -101)} ${at(8, -108)}`, fill: "none", ...ink({ "stroke-width": 3.5 * size }) }),
    ...(cap ? [svgEl(doc, "path", { d: `M${at(-24, -124)} Q${at(0, -150)} ${at(24, -124)} Z M${at(14, -126)} L${at(34, -122)}`, fill: INK, ...ink({ "stroke-width": 4 * size }) })] : []),
  );
  const root = group(
    doc,
    { class: "pt-puppet" },
    svgEl(doc, "ellipse", { cx: x, cy: y + 4 * size, rx: 34 * size, ry: 7 * size, fill: INK, opacity: 0.18 }),
    svgEl(doc, "path", { d: `M${at(-10, -40)} L${at(-14, 0)} M${at(10, -40)} L${at(14, 0)}`, fill: "none", ...ink({ "stroke-width": 7 * size }) }),
    svgEl(doc, "path", { d: `M${at(-24, -92)} Q${at(0, -100)} ${at(24, -92)} L${at(30, -38)} Q${at(0, -30)} ${at(-30, -38)} Z`, fill: tunic, ...ink({ "stroke-width": 5 * size }) }),
    armLeftEl,
    armRightEl,
    headEl,
  );
  return {
    root,
    body: rig(root, { x, y }),
    head: rig(headEl, { x, y: y - 96 * size }),
    armLeft: rig(armLeftEl, shoulderL),
    armRight: rig(armRightEl, shoulderR),
    feet: { x, y },
  };
}

export interface Marionette {
  root: SVGGElement;
  /** The puppeteer's hand: moves bar, strings and puppet together. Pivot at the feet. */
  rig: Rig;
  puppet: Puppet;
  strings: SVGPathElement[];
}

/** A puppet hanging from its control bar by three strings. */
export function drawMarionette(doc: Document, options: PuppetOptions & { barY: number }): Marionette {
  const { x, y, barY } = options;
  const size = options.size ?? 1;
  const puppet = drawPuppet(doc, options);
  const strings = [
    [x, barY + 14, x, y - 138 * size],
    [x - 56, barY, x - 24 * size, y - 90 * size],
    [x + 56, barY, x + 24 * size, y - 90 * size],
  ].map(([x1, y1, x2, y2]) => svgEl(doc, "path", { d: `M${x1} ${y1} L${x2} ${y2}`, fill: "none", stroke: INK, "stroke-width": 2, opacity: 0.75 }));
  const bar = group(
    doc,
    {},
    svgEl(doc, "rect", { x: x - 64, y: barY - 6, width: 128, height: 12, rx: 6, fill: WOOD, ...ink({ "stroke-width": 4 }) }),
    svgEl(doc, "rect", { x: x - 6, y: barY - 26, width: 12, height: 52, rx: 6, fill: WOOD_DARK, ...ink({ "stroke-width": 4 }) }),
  );
  const root = group(doc, { class: "pt-marionette" }, ...strings, bar, puppet.root);
  return { root, rig: rig(root, { x, y }), puppet, strings };
}

/** A gloved hand reaching in from the right, fingers pointing left. Pivot at the wrist. */
export function drawHand(doc: Document, wrist: Pivot, colour: string): { root: SVGGElement; rig: Rig } {
  const { x, y } = wrist;
  const root = group(
    doc,
    { class: "pt-hand" },
    svgEl(doc, "rect", { x, y: y - 16, width: 70, height: 32, rx: 8, fill: colour, ...ink() }),
    svgEl(doc, "path", {
      d: `M${x + 4} ${y - 20} C${x - 30} ${y - 26} ${x - 58} ${y - 20} ${x - 60} ${y - 8} C${x - 62} ${y + 2} ${x - 40} ${y + 4} ${x - 30} ${y + 2} C${x - 40} ${y + 12} ${x - 30} ${y + 24} ${x - 14} ${y + 20} L${x + 4} ${y + 20} Z`,
      fill: INK,
      ...ink(),
    }),
  );
  return { root, rig: rig(root, wrist) };
}

/** The backs of three heads in the front row. */
export function drawAudience(doc: Document, y: number, xs: readonly number[]): { root: SVGGElement; heads: Rig[] } {
  const heads = xs.map((x) => svgEl(doc, "path", { d: `M${x - 34} ${y + 40} Q${x - 34} ${y - 30} ${x} ${y - 32} Q${x + 34} ${y - 30} ${x + 34} ${y + 40} Z`, fill: INK, opacity: 0.85 }));
  return { root: group(doc, { class: "pt-audience" }, ...heads), heads: heads.map((head, i) => rig(head, { x: xs[i] ?? 0, y: y + 40 })) };
}
