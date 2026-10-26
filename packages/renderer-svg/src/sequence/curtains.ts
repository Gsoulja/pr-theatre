import { gsap } from "../gsap";
import { CURTAIN_TRAVEL } from "../stage";
import type { StageParts } from "../stage";

/** Curtains meet in the middle: the cut between two scenes. */
export function closeCurtains(parts: StageParts): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(parts.curtainLeft, { x: 0, duration: 0.42, ease: "power2.in" }, 0)
    .to(parts.curtainRight, { x: 0, duration: 0.42, ease: "power2.in" }, 0);
}

/** Curtain up on a new scene. Starts from closed whatever the curtains were doing. */
export function openCurtains(parts: StageParts): gsap.core.Timeline {
  return gsap
    .timeline()
    .fromTo(parts.curtainLeft, { x: 0 }, { x: -CURTAIN_TRAVEL, duration: 0.75, ease: "power3.out" }, 0)
    .fromTo(parts.curtainRight, { x: 0 }, { x: CURTAIN_TRAVEL, duration: 0.75, ease: "power3.out" }, 0);
}

export function curtainsAreOpen(parts: StageParts): boolean {
  return parts.curtainLeft.x < 0;
}
