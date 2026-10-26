import { GOLD, group, ink, INK, PAPER, rig, svgEl, text, WOOD, WOOD_DARK } from "./svg";
import type { Pivot, Rig } from "./svg";
import type { Part } from "./props-stage";

/** A ruler from (x, y) to the right, with a tick every `step` units and a unit label. */
export function drawRuler(doc: Document, x: number, y: number, length: number, step: number, unit: string, colour: string): Part & { ticks: Rig } {
  const marks: SVGElement[] = [];
  // Ticks stop short of the end, where the unit label sits.
  for (let n = 0, at = 0; at <= length - 50; n += 1, at += step) {
    marks.push(svgEl(doc, "path", { d: `M${x + 10 + at} ${y} v${n % 5 === 0 ? 22 : 12}`, stroke: INK, "stroke-width": 2.5 }));
    if (n % 5 === 0) marks.push(text(doc, String(n), { x: x + 10 + at, y: y + 36, "font-size": 11, "font-family": "system-ui, sans-serif" }));
  }
  const ticks = group(doc, {}, ...marks);
  const root = group(
    doc,
    {},
    svgEl(doc, "rect", { x, y: y - 4, width: length, height: 46, rx: 4, fill: colour, ...ink() }),
    ticks,
    text(doc, unit, { x: x + length - 22, y: y + 32, "font-size": 16, "font-family": "system-ui, sans-serif" }),
  );
  return { root, rig: rig(root, { x, y }), ticks: rig(ticks, { x: x + 10, y }) };
}

/** A marker that slides along a ruler, pointing down at it. */
export function drawPointer(doc: Document, x: number, y: number, colour: string): Part {
  const root = group(doc, {}, svgEl(doc, "path", { d: `M${x} ${y} l-12 -20 h24 z`, fill: colour, ...ink({ "stroke-width": 4 }) }));
  return { root, rig: rig(root, { x, y }) };
}

export interface Hourglass extends Part {
  sandTop: Rig;
  sandBottom: Rig;
  stream: SVGPathElement;
}

/** An hourglass standing on the floor, centred on x. */
export function drawHourglass(doc: Document, x: number, floor: number, sand: string): Hourglass {
  const top = floor - 200;
  const mid = floor - 100;
  const sandTopEl = svgEl(doc, "path", { d: `M${x - 44} ${top + 40} Q${x} ${top + 48} ${x + 44} ${top + 40} L${x + 6} ${mid - 6} L${x - 6} ${mid - 6} Z`, fill: sand });
  const sandBottomEl = svgEl(doc, "path", { d: `M${x - 52} ${floor - 18} Q${x} ${floor - 84} ${x + 52} ${floor - 18} Z`, fill: sand });
  const stream = svgEl(doc, "path", { d: `M${x} ${mid - 4} V${floor - 40}`, stroke: sand, "stroke-width": 4, fill: "none" });
  const root = group(
    doc,
    {},
    svgEl(doc, "path", {
      d: `M${x - 56} ${top + 14} C${x - 56} ${mid - 40} ${x - 8} ${mid - 14} ${x - 8} ${mid} C${x - 8} ${mid + 14} ${x - 56} ${floor - 54} ${x - 56} ${floor - 14} H${x + 56} C${x + 56} ${floor - 54} ${x + 8} ${mid + 14} ${x + 8} ${mid} C${x + 8} ${mid - 14} ${x + 56} ${mid - 40} ${x + 56} ${top + 14} Z`,
      fill: "rgb(255 255 255 / 0.55)",
      ...ink(),
    }),
    sandTopEl,
    stream,
    sandBottomEl,
    svgEl(doc, "rect", { x: x - 72, y: top, width: 144, height: 16, rx: 6, fill: WOOD, ...ink() }),
    svgEl(doc, "rect", { x: x - 72, y: floor - 16, width: 144, height: 16, rx: 6, fill: WOOD, ...ink() }),
    svgEl(doc, "path", { d: `M${x - 64} ${top + 16} V${floor - 16} M${x + 64} ${top + 16} V${floor - 16}`, fill: "none", ...ink({ stroke: WOOD_DARK, "stroke-width": 7 }) }),
  );
  return {
    root,
    rig: rig(root, { x, y: mid }),
    sandTop: rig(sandTopEl, { x, y: mid }),
    sandBottom: rig(sandBottomEl, { x, y: floor - 18 }, { scaleY: 0.15 }),
    stream,
  };
}

/** A wall clock; its hand turns around the centre. */
export function drawClock(doc: Document, x: number, y: number, r: number): Part & { hand: Rig } {
  const handEl = group(doc, {}, svgEl(doc, "path", { d: `M${x} ${y} V${y - r + 10}`, ...ink({ "stroke-width": 5 }) }));
  const root = group(
    doc,
    {},
    svgEl(doc, "circle", { cx: x, cy: y, r, fill: PAPER, ...ink() }),
    ...[0, 90, 180, 270].map((a) => svgEl(doc, "path", { d: `M${x} ${y - r + 4} v8`, ...ink({ "stroke-width": 3 }), transform: `rotate(${a} ${x} ${y})` })),
    handEl,
    svgEl(doc, "circle", { cx: x, cy: y, r: 4, fill: INK }),
  );
  return { root, rig: rig(root, { x, y }, { scale: 0 }), hand: rig(handEl, { x, y }) };
}

export interface Script extends Part {
  oldLines: SVGPathElement[];
  newLines: SVGPathElement[];
  page: Rig;
  pen: Rig;
}

/** An open script on a lectern. A page can turn over to reveal new lines. */
export function drawScript(doc: Document, x: number, floor: number, ink2: string): Script {
  const top = floor - 210;
  const lines = (left: number, colour: string, opacity: number): SVGPathElement[] =>
    [0, 1, 2, 3].map((i) => svgEl(doc, "path", { d: `M${left} ${top + 36 + i * 22} h${i === 3 ? 52 : 82}`, fill: "none", ...ink({ stroke: colour, "stroke-width": 5, opacity }) }));
  const oldLines = lines(x + 16, INK, 0.45);
  const newLines = lines(x + 16, ink2, 1);
  const pageEl = group(doc, {}, svgEl(doc, "path", { d: `M${x} ${top + 8} Q${x + 60} ${top} ${x + 116} ${top + 10} V${top + 132} Q${x + 60} ${top + 122} ${x} ${top + 130} Z`, fill: PAPER, ...ink() }), ...oldLines);
  const penEl = group(
    doc,
    {},
    svgEl(doc, "path", { d: `M${x + 16} ${top + 36} l12 -10 l46 -46 l-10 -10 l-46 46 z`, fill: GOLD, ...ink({ "stroke-width": 4 }) }),
  );
  const root = group(
    doc,
    {},
    svgEl(doc, "path", { d: `M${x - 12} ${top + 150} L${x - 30} ${floor} M${x + 12} ${top + 150} L${x + 30} ${floor}`, fill: "none", ...ink({ stroke: WOOD_DARK, "stroke-width": 9 }) }),
    svgEl(doc, "path", { d: `M${x - 140} ${top + 140} L${x + 140} ${top + 140} L${x + 124} ${top + 158} L${x - 124} ${top + 158} Z`, fill: WOOD, ...ink() }),
    svgEl(doc, "path", { d: `M${x} ${top + 8} Q${x - 60} ${top} ${x - 116} ${top + 10} V${top + 132} Q${x - 60} ${top + 122} ${x} ${top + 130} Z`, fill: PAPER, ...ink() }),
    ...lines(x - 100, INK, 0.45),
    svgEl(doc, "path", { d: `M${x} ${top + 8} Q${x + 60} ${top} ${x + 116} ${top + 10} V${top + 132} Q${x + 60} ${top + 122} ${x} ${top + 130} Z`, fill: PAPER, ...ink() }),
    ...newLines,
    pageEl,
    penEl,
  );
  return { root, rig: rig(root, { x, y: floor }), oldLines, newLines, page: rig(pageEl, { x, y: top + 70 }), pen: rig(penEl, { x: x + 16, y: top + 36 }, { opacity: 0 }) };
}

/** A clipboard with three empty boxes; returns where each box's centre is. */
export function drawClipboard(doc: Document, x: number, floor: number): Part & { boxes: Pivot[] } {
  const top = floor - 220;
  const boxes = [0, 1, 2].map((i) => ({ x: x - 50, y: top + 70 + i * 50 }));
  const root = group(
    doc,
    {},
    svgEl(doc, "rect", { x: x - 90, y: top, width: 180, height: 220, rx: 10, fill: WOOD_DARK, ...ink() }),
    svgEl(doc, "rect", { x: x - 76, y: top + 26, width: 152, height: 182, rx: 4, fill: PAPER, ...ink({ "stroke-width": 4 }) }),
    svgEl(doc, "rect", { x: x - 30, y: top - 10, width: 60, height: 26, rx: 6, fill: "#c0c0c0", ...ink({ "stroke-width": 4 }) }),
    ...boxes.flatMap((box) => [
      svgEl(doc, "rect", { x: box.x - 14, y: box.y - 14, width: 28, height: 28, rx: 4, fill: PAPER, ...ink({ "stroke-width": 4 }) }),
      svgEl(doc, "path", { d: `M${box.x + 26} ${box.y} h70`, ...ink({ "stroke-width": 5, opacity: 0.35 }) }),
    ]),
  );
  return { root, rig: rig(root, { x, y: floor }), boxes };
}
