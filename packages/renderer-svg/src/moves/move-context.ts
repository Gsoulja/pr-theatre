/** Stage geometry, in viewBox units. Moves draw their scene around the centre, feet on the floor. */
export const STAGE = {
  width: 800,
  height: 450,
  centre: 400,
  floor: 330,
} as const;

export const OK_COLOUR = "#4f9d69";

export interface MoveContext {
  doc: Document;
  /** An empty layer this scene draws into. The renderer clears it before every move. */
  art: SVGGElement;
  /** The scene's colour from the theme (red for danger kinds, green for good news…). */
  colour: string;
  /** The theme's picture of the prop, for moves that show it as it is. */
  propHref: string;
  spotlight: SVGEllipseElement;
  stamp: SVGGElement;
}

/**
 * A named animation. `build` draws the scene into `art` and returns its timeline.
 * The timeline's end must read as a still frame: reduced motion jumps straight there.
 */
export interface SvgMove {
  readonly name: string;
  build(context: MoveContext): gsap.core.Timeline;
}
