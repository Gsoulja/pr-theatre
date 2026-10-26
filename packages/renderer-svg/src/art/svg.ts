/** The theatre's paint box. Every illustration uses these, so scenes look like one show. */
export const INK = "#2f2118";
export const PAPER = "#fbf3e4";
export const WOOD = "#9a6a43";
export const WOOD_DARK = "#6e4a2e";
export const SKIN = "#f1d3a8";
export const GOLD = "#e6c25a";
export const RED = "#d64545";
export const GREEN = "#4f9d69";
export const BLUE = "#5b7fbf";
export const ORANGE = "#e08a2e";
export const GREY = "#8a8a8a";
export const LINE = 5;

const SVG_NS = "http://www.w3.org/2000/svg";

export type Attrs = Record<string, string | number>;

export function svgEl<K extends keyof SVGElementTagNameMap>(doc: Document, tag: K, attrs: Attrs = {}, ...children: SVGElement[]): SVGElementTagNameMap[K] {
  const el = doc.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, String(value));
  el.append(...children);
  return el;
}

export const group = (doc: Document, attrs: Attrs, ...children: SVGElement[]): SVGGElement => svgEl(doc, "g", attrs, ...children);

export function text(doc: Document, content: string, attrs: Attrs): SVGTextElement {
  const el = svgEl(doc, "text", { "font-family": "Georgia, 'Times New Roman', serif", "font-weight": 700, "text-anchor": "middle", fill: INK, ...attrs });
  el.textContent = content;
  return el;
}

export const ink = (extra: Attrs = {}): Attrs => ({ stroke: INK, "stroke-width": LINE, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });

export interface Pivot {
  x: number;
  y: number;
}

/** The properties a move animates on a drawn part. GSAP tweens these like any object. */
export interface Rig {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
}

/**
 * Wraps a part so it moves, turns and scales around a pivot we choose, written straight into its
 * `transform`. No bounding-box measuring, so the same move looks identical in every browser.
 */
export function rig(el: SVGElement, pivot: Pivot, start: Partial<Rig> = {}): Rig {
  const state: Rig = { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, ...start };
  const apply = (): void => {
    const sx = state.scale * state.scaleX;
    const sy = state.scale * state.scaleY;
    el.setAttribute(
      "transform",
      `translate(${state.x} ${state.y}) translate(${pivot.x} ${pivot.y}) rotate(${state.rotation}) scale(${sx} ${sy}) translate(${-pivot.x} ${-pivot.y})`,
    );
    el.setAttribute("opacity", String(state.opacity));
  };
  const proxy = {} as Rig;
  for (const key of Object.keys(state) as (keyof Rig)[]) {
    Object.defineProperty(proxy, key, {
      enumerable: true,
      get: () => state[key],
      set: (value: number) => {
        state[key] = value;
        apply();
      },
    });
  }
  apply();
  return proxy;
}
