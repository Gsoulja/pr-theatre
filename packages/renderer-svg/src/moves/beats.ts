import type { Rig } from "../art/svg";
import { OK_COLOUR } from "./move-context";
import type { MoveContext } from "./move-context";

/** Pops a part in from nothing, overshooting a little like a cartoon. */
export function pop(timeline: gsap.core.Timeline, target: Rig | Rig[], position?: gsap.Position, stagger = 0): gsap.core.Timeline {
  return timeline.fromTo(target, { scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2.2)", stagger }, position);
}

/** Writes a line on, from its start to its end. */
export function drawOn(timeline: gsap.core.Timeline, target: SVGElement | SVGElement[], duration: number, position?: gsap.Position): gsap.core.Timeline {
  return timeline.fromTo(target, { drawSVG: "0%" }, { drawSVG: "100%", duration, ease: "power1.inOut" }, position);
}

/** The light warms to the scene's colour as the act begins. */
export function lightUp(timeline: gsap.core.Timeline, { spotlight, colour }: MoveContext): gsap.core.Timeline {
  return timeline.fromTo(spotlight, { attr: { fill: colour }, opacity: 0.2 }, { opacity: 0.75, duration: 0.6 }, 0);
}

/** Shared end of every fix: the light turns calm green and the "fixed" stamp lands. */
export function fixedEnding(timeline: gsap.core.Timeline, { spotlight, stamp }: MoveContext): gsap.core.Timeline {
  return timeline
    .to(spotlight, { attr: { fill: OK_COLOUR }, opacity: 0.85, duration: 0.6 })
    .fromTo(stamp, { opacity: 0, scale: 1.6, svgOrigin: "640 90" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
}
