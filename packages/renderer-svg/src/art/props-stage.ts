import { GOLD, group, ink, INK, PAPER, rig, svgEl, text, WOOD, WOOD_DARK } from "./svg";
import type { Pivot, Rig } from "./svg";

export interface Part {
  root: SVGGElement;
  rig: Rig;
}

/** The stage door with its sign, standing on the floor at (x, floor). */
export function drawDoor(doc: Document, x: number, floor: number): Part & { keyhole: Pivot } {
  const w = 120;
  const h = 210;
  const root = group(
    doc,
    {},
    svgEl(doc, "rect", { x: x - w / 2 - 12, y: floor - h - 12, width: w + 24, height: h + 12, rx: 6, fill: WOOD_DARK, ...ink() }),
    svgEl(doc, "rect", { x: x - w / 2, y: floor - h, width: w, height: h, rx: 4, fill: WOOD, ...ink() }),
    svgEl(doc, "rect", { x: x - w / 2 + 16, y: floor - h + 18, width: w - 32, height: 70, rx: 4, fill: "none", ...ink({ "stroke-width": 3, opacity: 0.5 }) }),
    svgEl(doc, "rect", { x: x - w / 2 + 16, y: floor - h + 104, width: w - 32, height: 88, rx: 4, fill: "none", ...ink({ "stroke-width": 3, opacity: 0.5 }) }),
    svgEl(doc, "rect", { x: x - 44, y: floor - h - 50, width: 88, height: 28, rx: 4, fill: PAPER, ...ink({ "stroke-width": 3 }) }),
    text(doc, "STAGE DOOR", { x, y: floor - h - 31, "font-size": 12, "font-family": "system-ui, sans-serif" }),
    svgEl(doc, "circle", { cx: x + w / 2 - 18, cy: floor - h / 2, r: 8, fill: GOLD, ...ink({ "stroke-width": 3 }) }),
    svgEl(doc, "path", { d: `M${x + w / 2 - 18} ${floor - h / 2 + 18} v12`, ...ink({ "stroke-width": 4 }) }),
  );
  return { root, rig: rig(root, { x, y: floor }), keyhole: { x: x + w / 2 - 18, y: floor - h / 2 + 22 } };
}

/** A key hanging from a nail at (x, y): ring, shaft and teeth. Pivot at the nail. */
export function drawKey(doc: Document, x: number, y: number): Part {
  const root = group(
    doc,
    {},
    svgEl(doc, "path", { d: `M${x} ${y} L${x} ${y + 18}`, ...ink({ "stroke-width": 3 }) }),
    svgEl(doc, "circle", { cx: x, cy: y + 40, r: 22, fill: GOLD, ...ink() }),
    svgEl(doc, "circle", { cx: x, cy: y + 40, r: 8, fill: PAPER, ...ink({ "stroke-width": 4 }) }),
    svgEl(doc, "path", { d: `M${x} ${y + 62} L${x} ${y + 132} M${x} ${y + 112} h14 M${x} ${y + 126} h14`, fill: "none", ...ink({ stroke: "#c9a23a", "stroke-width": 9 }) }),
    svgEl(doc, "circle", { cx: x, cy: y, r: 5, fill: INK }),
  );
  return { root, rig: rig(root, { x, y }) };
}

/** A padlock; its shackle drops shut. */
export function drawPadlock(doc: Document, x: number, y: number): Part & { shackle: Rig } {
  const shackle = svgEl(doc, "path", { d: `M${x - 14} ${y} v-16 a14 14 0 0 1 28 0 v16`, fill: "none", ...ink({ "stroke-width": 7 }) });
  const shackleGroup = group(doc, {}, shackle);
  const root = group(
    doc,
    {},
    shackleGroup,
    svgEl(doc, "rect", { x: x - 24, y, width: 48, height: 40, rx: 6, fill: GOLD, ...ink() }),
    svgEl(doc, "circle", { cx: x, cy: y + 18, r: 5, fill: INK }),
  );
  return { root, rig: rig(root, { x, y: y + 20 }, { scale: 0 }), shackle: rig(shackleGroup, { x, y }, { y: -12 }) };
}

/** A spool of thread seen from the front, centred on (x, y). */
export function drawSpool(doc: Document, x: number, y: number, thread: string): Part {
  const root = group(
    doc,
    {},
    svgEl(doc, "circle", { cx: x, cy: y, r: 46, fill: WOOD, ...ink() }),
    svgEl(doc, "circle", { cx: x, cy: y, r: 34, fill: thread, ...ink({ "stroke-width": 4 }) }),
    ...[-18, 0, 18].map((d) => svgEl(doc, "path", { d: `M${x - 30} ${y + d} Q${x} ${y + d - 6} ${x + 30} ${y + d}`, fill: "none", stroke: INK, "stroke-width": 2, opacity: 0.4 })),
    svgEl(doc, "circle", { cx: x, cy: y, r: 9, fill: PAPER, ...ink({ "stroke-width": 4 }) }),
  );
  return { root, rig: rig(root, { x, y }) };
}

/** A bar of hooks across the top of the stage; each hook can swing. */
export function drawHooks(doc: Document, y: number, xs: readonly number[]): { root: SVGGElement; hooks: Rig[] } {
  const hookEls = xs.map((x) => group(doc, {}, svgEl(doc, "path", { d: `M${x} ${y} v26 a12 12 0 1 1 -12 12`, fill: "none", ...ink({ "stroke-width": 5 }) })));
  const root = group(
    doc,
    {},
    svgEl(doc, "rect", { x: (xs[0] ?? 0) - 60, y: y - 10, width: (xs.at(-1) ?? 0) - (xs[0] ?? 0) + 120, height: 14, rx: 7, fill: WOOD_DARK, ...ink({ "stroke-width": 4 }) }),
    ...hookEls,
  );
  return { root, hooks: hookEls.map((hook, i) => rig(hook, { x: xs[i] ?? 0, y })) };
}

/** A wooden shipping crate on the floor, with a lid that lifts and a travel label. */
export function drawCrate(doc: Document, x: number, floor: number, label: string, tag: string): Part & { lid: Rig } {
  const w = 160;
  const h = 120;
  const lid = group(doc, {}, svgEl(doc, "rect", { x: x - w / 2 - 8, y: floor - h - 18, width: w + 16, height: 20, rx: 4, fill: WOOD_DARK, ...ink() }));
  const root = group(
    doc,
    {},
    svgEl(doc, "ellipse", { cx: x, cy: floor + 4, rx: w * 0.6, ry: 9, fill: INK, opacity: 0.18 }),
    svgEl(doc, "rect", { x: x - w / 2, y: floor - h, width: w, height: h, rx: 4, fill: WOOD, ...ink() }),
    svgEl(doc, "path", { d: `M${x - w / 2} ${floor - h / 2} H${x + w / 2} M${x - w / 2 + 8} ${floor - 8} L${x + w / 2 - 8} ${floor - h + 8}`, fill: "none", ...ink({ "stroke-width": 4, opacity: 0.6 }) }),
    svgEl(doc, "rect", { x: x - 52, y: floor - h + 22, width: 104, height: 40, rx: 4, fill: PAPER, ...ink({ "stroke-width": 3 }), transform: `rotate(-6 ${x} ${floor - h + 42})` }),
    text(doc, label, { x, y: floor - h + 40, "font-size": 11, "font-family": "system-ui, sans-serif", transform: `rotate(-6 ${x} ${floor - h + 42})` }),
    text(doc, tag, { x, y: floor - h + 55, "font-size": 13, fill: "#2f5f9f", transform: `rotate(-6 ${x} ${floor - h + 42})` }),
    lid,
  );
  return { root, rig: rig(root, { x, y: floor }), lid: rig(lid, { x: x - w / 2 - 8, y: floor - h - 8 }) };
}

/** A big lever on a box, with a lamp that lights when it is pulled. */
export function drawLever(doc: Document, x: number, floor: number): Part & { arm: Rig; lamp: SVGCircleElement } {
  const lamp = svgEl(doc, "circle", { cx: x + 34, cy: floor - 92, r: 12, fill: "#5a4a3e", ...ink({ "stroke-width": 4 }) });
  const armEl = group(
    doc,
    {},
    svgEl(doc, "path", { d: `M${x} ${floor - 60} L${x} ${floor - 140}`, fill: "none", ...ink({ stroke: WOOD_DARK, "stroke-width": 10 }) }),
    svgEl(doc, "circle", { cx: x, cy: floor - 146, r: 14, fill: "#d64545", ...ink({ "stroke-width": 4 }) }),
  );
  const root = group(
    doc,
    {},
    armEl,
    svgEl(doc, "rect", { x: x - 50, y: floor - 64, width: 100, height: 64, rx: 6, fill: "#6b6b6b", ...ink() }),
    text(doc, "GO", { x: x - 18, y: floor - 26, "font-size": 22, fill: PAPER, "font-family": "system-ui, sans-serif" }),
    svgEl(doc, "path", { d: `M${x + 34} ${floor - 64} v-16`, ...ink({ "stroke-width": 4 }) }),
    lamp,
  );
  return { root, rig: rig(root, { x, y: floor }), arm: rig(armEl, { x, y: floor - 60 }, { rotation: -28 }), lamp };
}

/** A folding director's chair with "DIRECTOR" on its back. */
export function drawChair(doc: Document, x: number, floor: number): Part {
  const root = group(
    doc,
    {},
    svgEl(doc, "ellipse", { cx: x, cy: floor + 4, rx: 70, ry: 9, fill: INK, opacity: 0.18 }),
    svgEl(doc, "path", { d: `M${x - 46} ${floor} L${x + 40} ${floor - 84} M${x + 46} ${floor} L${x - 40} ${floor - 84} M${x - 44} ${floor - 84} V${floor - 190} M${x + 44} ${floor - 84} V${floor - 190}`, fill: "none", ...ink({ stroke: WOOD_DARK, "stroke-width": 8 }) }),
    svgEl(doc, "rect", { x: x - 52, y: floor - 96, width: 104, height: 18, rx: 4, fill: "#2f5f9f", ...ink() }),
    svgEl(doc, "rect", { x: x - 50, y: floor - 186, width: 100, height: 40, rx: 4, fill: "#2f5f9f", ...ink() }),
    text(doc, "DIRECTOR", { x, y: floor - 160, "font-size": 15, fill: PAPER, "font-family": "system-ui, sans-serif", "letter-spacing": 1 }),
  );
  return { root, rig: rig(root, { x, y: floor }) };
}
