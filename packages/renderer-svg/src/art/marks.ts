import { group, ink, INK, PAPER, rig, svgEl, text } from "./svg";
import type { Rig } from "./svg";

export interface Mark {
  root: SVGGElement;
  rig: Rig;
}

/** A four-point sparkle centred on (x, y). */
export function sparkle(doc: Document, x: number, y: number, size: number, colour: string): Mark {
  const s = size;
  const root = group(
    doc,
    {},
    svgEl(doc, "path", {
      d: `M${x} ${y - s} Q${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} Q${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} Q${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} Q${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s} Z`,
      fill: colour,
      ...ink({ "stroke-width": 3 }),
    }),
  );
  return { root, rig: rig(root, { x, y }, { scale: 0 }) };
}

/** A tick drawn as one stroke, so it can be "written" on with DrawSVG. */
export function tick(doc: Document, x: number, y: number, size: number, colour: string): SVGPathElement {
  return svgEl(doc, "path", { d: `M${x - size} ${y} L${x - size * 0.3} ${y + size * 0.7} L${x + size} ${y - size * 0.8}`, fill: "none", ...ink({ stroke: colour, "stroke-width": size * 0.45 }) });
}

/** A big question mark that pops in. */
export function question(doc: Document, x: number, y: number, size: number, colour: string): Mark {
  const root = group(doc, {}, text(doc, "?", { x, y: y + size * 0.35, "font-size": size, fill: colour, stroke: INK, "stroke-width": 3, "paint-order": "stroke" }));
  return { root, rig: rig(root, { x, y }, { scale: 0 }) };
}

/** A round warning badge with "!" in it. */
export function alarm(doc: Document, x: number, y: number, colour: string): Mark {
  const root = group(
    doc,
    {},
    svgEl(doc, "circle", { cx: x, cy: y, r: 22, fill: colour, ...ink() }),
    text(doc, "!", { x, y: y + 11, "font-size": 32, fill: PAPER }),
  );
  return { root, rig: rig(root, { x, y }, { scale: 0 }) };
}

/** A label on a little card, for "NEW", "BEFORE", "AFTER" and the like. */
export function chip(doc: Document, x: number, y: number, label: string, colour: string, width = 96): Mark {
  const root = group(
    doc,
    {},
    svgEl(doc, "rect", { x: x - width / 2, y: y - 17, width, height: 34, rx: 17, fill: colour, ...ink({ "stroke-width": 4 }) }),
    text(doc, label, { x, y: y + 7, "font-size": 18, fill: PAPER, "font-family": "system-ui, sans-serif", "letter-spacing": 1 }),
  );
  return { root, rig: rig(root, { x, y }, { scale: 0 }) };
}

/** A speech bubble pointing down-left at whoever is talking. */
export function bubble(doc: Document, x: number, y: number, label: string, colour: string, width = 150): Mark {
  const root = group(
    doc,
    {},
    svgEl(doc, "path", {
      d: `M${x - width / 2} ${y - 24} h${width} a10 10 0 0 1 10 10 v28 a10 10 0 0 1 -10 10 h${-width + 36} l-22 18 l4 -18 h-18 a10 10 0 0 1 -10 -10 v-28 a10 10 0 0 1 10 -10 z`,
      fill: PAPER,
      ...ink({ "stroke-width": 4 }),
    }),
    text(doc, label, { x: x + 5, y: y + 8, "font-size": 20, fill: colour, "font-family": "system-ui, sans-serif" }),
  );
  return { root, rig: rig(root, { x: x - width / 2 + 20, y: y + 30 }, { scale: 0 }) };
}

/** The ∞ sign: "this never ends". */
export function infinity(doc: Document, x: number, y: number, size: number, colour: string): Mark {
  const s = size;
  const root = group(
    doc,
    {},
    svgEl(doc, "path", {
      d: `M${x} ${y} C${x + s * 0.4} ${y - s * 0.55} ${x + s} ${y - s * 0.55} ${x + s} ${y} C${x + s} ${y + s * 0.55} ${x + s * 0.4} ${y + s * 0.55} ${x} ${y} C${x - s * 0.4} ${y - s * 0.55} ${x - s} ${y - s * 0.55} ${x - s} ${y} C${x - s} ${y + s * 0.55} ${x - s * 0.4} ${y + s * 0.55} ${x} ${y} Z`,
      fill: "none",
      ...ink({ stroke: colour, "stroke-width": s * 0.22 }),
    }),
  );
  return { root, rig: rig(root, { x, y }, { scale: 0 }) };
}

/** Short speed lines behind something moving fast to the left. */
export function speedLines(doc: Document, x: number, y: number): Mark {
  const root = group(
    doc,
    {},
    ...[-16, 0, 16].map((dy, i) => svgEl(doc, "path", { d: `M${x + i * 8} ${y + dy} h${46 - i * 10}`, fill: "none", ...ink({ "stroke-width": 4, opacity: 0.55 }) })),
  );
  return { root, rig: rig(root, { x, y }, { opacity: 0 }) };
}
