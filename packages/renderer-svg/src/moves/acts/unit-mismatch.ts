import { gsap } from "../../gsap";
import { drawPointer, drawRuler } from "../../art/props-tools";
import { GOLD, GREEN, ink, PAPER, RED, rig, svgEl, text } from "../../art/svg";
import { drawOn, fixedEnding, lightUp, pop } from "../beats";
import type { MoveContext, SvgMove } from "../move-context";

const LEFT = 180;
const TOP = 132;
const BOTTOM = 246;
const SMALL = 8;
const BIG = 40;
const VALUE = 5;

function drawRulersScene({ doc, art }: MoveContext) {
  const top = drawRuler(doc, LEFT, TOP, 440, SMALL, "mm", GOLD);
  const bottom = drawRuler(doc, LEFT, BOTTOM, 440, BIG, "cm", PAPER);
  const agreed = drawRuler(doc, LEFT, BOTTOM, 440, SMALL, "mm", GOLD);
  const asked = drawPointer(doc, LEFT + 10 + VALUE * SMALL, TOP - 6, GREEN);
  const moved = drawPointer(doc, LEFT + 10 + VALUE * SMALL, BOTTOM - 6, RED);
  const gap = svgEl(doc, "path", { d: `M${LEFT + 10 + VALUE * SMALL} ${BOTTOM - 34} H${LEFT + 10 + VALUE * BIG}`, fill: "none", ...ink({ stroke: RED, "stroke-width": 5, "stroke-dasharray": "12 8" }) });
  const notEqual = text(doc, "≠", { x: 520, y: 214, "font-size": 64, fill: RED, stroke: "#2f2118", "stroke-width": 2, "paint-order": "stroke" });
  const equal = text(doc, "=", { x: 520, y: 214, "font-size": 64, fill: GREEN, stroke: "#2f2118", "stroke-width": 2, "paint-order": "stroke" });
  art.append(top.root, bottom.root, agreed.root, gap, asked.root, moved.root, notEqual, equal);
  return { top, bottom, agreed, asked, moved, gap, notEqual: rig(notEqual, { x: 520, y: 196 }, { scale: 0 }), equal: rig(equal, { x: 520, y: 196 }, { scale: 0 }) };
}

/** Two rulers with different marks: the same number lands in two very different places. */
export const rulersDisagreeMove: SvgMove = {
  name: "rulers-disagree",
  build: (context) => {
    const s = drawRulersScene(context);
    gsap.set(s.agreed.rig, { opacity: 0 });
    gsap.set(s.gap, { drawSVG: "0%" });
    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(s.top.rig, { x: -420 }, { x: 0, duration: 0.7, ease: "power3.out" }, 0.1)
      .fromTo(s.bottom.rig, { x: 420 }, { x: 0, duration: 0.7, ease: "power3.out" }, 0.3)
      .fromTo([s.asked.rig, s.moved.rig], { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out", stagger: 0.15 }, 1.0)
      .to(s.moved.rig, { x: VALUE * (BIG - SMALL), duration: 1.1, ease: "power2.inOut" }, 1.9);
    drawOn(timeline, s.gap, 1.1, 1.9);
    pop(timeline, s.notEqual, 3.0);
    return timeline
      .to(s.top.rig, { rotation: -1.5, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" }, 3.1)
      .to(s.bottom.rig, { rotation: 1.5, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" }, 3.1);
  },
};

/** The fix: both stagehands use the same ruler, and the marks meet. */
export const rulersAgreeMove: SvgMove = {
  name: "rulers-agree",
  build: (context) => {
    const s = drawRulersScene(context);
    // Starts where the disagreement ended.
    gsap.set(s.agreed.rig, { opacity: 0 });
    gsap.set(s.moved.rig, { x: VALUE * (BIG - SMALL) });
    gsap.set(s.notEqual, { scale: 1 });
    const timeline = gsap.timeline();
    timeline
      .to(s.bottom.rig, { scaleY: 0, duration: 0.3, ease: "power2.in" }, 0.3)
      .set(s.bottom.rig, { opacity: 0 }, 0.6)
      .fromTo(s.agreed.rig, { opacity: 1, scaleY: 0 }, { scaleY: 1, duration: 0.35, ease: "back.out(2)" }, 0.6)
      .to(s.moved.rig, { x: 0, duration: 0.9, ease: "power2.inOut" }, 1.0)
      .to(s.gap, { drawSVG: "0%", duration: 0.9, ease: "power2.inOut" }, 1.0)
      .to(s.notEqual, { scale: 0, duration: 0.25, ease: "back.in(2)" }, 1.5);
    pop(timeline, s.equal, 1.8);
    return fixedEnding(timeline, context);
  },
};
