import { gsap } from "../../gsap";
import { bubble, chip } from "../../art/marks";
import { drawClock, drawHourglass } from "../../art/props-tools";
import { GOLD, ORANGE, RED, svgEl } from "../../art/svg";
import { drawOn, fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const CLOCK = { x: 572, y: 156, r: 44 };

function drawTimeScene({ doc, art }: MoveContext) {
  const glass = drawHourglass(doc, 350, STAGE.floor, GOLD);
  const clock = drawClock(doc, CLOCK.x, CLOCK.y, CLOCK.r);
  const limit = svgEl(doc, "path", { d: `M${CLOCK.x} ${CLOCK.y - CLOCK.r + 2} A${CLOCK.r - 2} ${CLOCK.r - 2} 0 0 1 ${CLOCK.x + CLOCK.r - 2} ${CLOCK.y}`, fill: "none", stroke: RED, "stroke-width": 7, opacity: 0.85 });
  clock.root.insertBefore(limit, clock.root.children[1] ?? null);
  const noLimit = chip(doc, CLOCK.x, 246, "NO TIME LIMIT", ORANGE, 170);
  const call = bubble(doc, CLOCK.x + 24, 80, "Time!", RED, 100);
  art.append(glass.root, clock.root, noLimit.root, call.root);
  return { glass, clock, limit, noLimit, call };
}

/** Sand runs out, the hourglass turns, and runs again; the clock hand never stops. */
export const sandForeverMove: SvgMove = {
  name: "sand-forever",
  build: (context) => {
    const s = drawTimeScene(context);
    gsap.set(s.limit, { opacity: 0 });
    gsap.set(s.glass.stream, { drawSVG: "0%" });
    const timeline = lightUp(gsap.timeline(), context);
    pop(timeline, s.glass.rig, 0.1);
    pop(timeline, s.clock.rig, 0.4);
    timeline.to(s.clock.hand, { rotation: 1080, duration: 4.4, ease: "none" }, 0.6);
    for (const at of [0.7, 2.5]) {
      timeline
        .set(s.glass.sandTop, { scaleY: 1 }, at)
        .set(s.glass.sandBottom, { scaleY: 0.15 }, at)
        .set(s.glass.rig, { rotation: 0 }, at)
        .to(s.glass.stream, { drawSVG: "100%", duration: 0.2 }, at)
        .to(s.glass.sandTop, { scaleY: 0.08, duration: 1.2, ease: "none" }, at)
        .to(s.glass.sandBottom, { scaleY: 1, duration: 1.2, ease: "none" }, at)
        .to(s.glass.stream, { drawSVG: "100% 100%", duration: 0.15 }, at + 1.2)
        .to(s.glass.rig, { rotation: 180, duration: 0.5, ease: "back.inOut(1.4)" }, at + 1.3);
    }
    return pop(timeline, s.noLimit.rig, 3.0);
  },
};

/** The fix: the stage manager's clock has a limit, and calls time when the hand reaches it. */
export const callTimeMove: SvgMove = {
  name: "call-time",
  build: (context) => {
    const s = drawTimeScene(context);
    gsap.set([s.clock.rig, s.noLimit.rig], { scale: 1 });
    gsap.set(s.glass.stream, { drawSVG: "100%" });
    const timeline = gsap.timeline();
    timeline
      .to(s.noLimit.rig, { scale: 0, duration: 0.25, ease: "back.in(2)" }, 0.2)
      .set(s.limit, { drawSVG: "0%" }, 0.3);
    drawOn(timeline, s.limit, 0.5, 0.4);
    timeline
      .to(s.glass.sandTop, { scaleY: 0.55, duration: 1.4, ease: "none" }, 0.4)
      .to(s.glass.sandBottom, { scaleY: 0.6, duration: 1.4, ease: "none" }, 0.4)
      .to(s.clock.hand, { rotation: 90, duration: 1.4, ease: "power1.in" }, 0.4)
      .to(s.clock.hand, { rotation: 84, duration: 0.08, repeat: 3, yoyo: true }, 1.8)
      .to(s.glass.stream, { opacity: 0, duration: 0.15 }, 1.8)
      .to(s.clock.rig, { scale: 1.12, duration: 0.15, repeat: 1, yoyo: true }, 1.8);
    pop(timeline, s.call.rig, 1.9);
    return fixedEnding(timeline, context);
  },
};
