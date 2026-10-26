import { gsap } from "../../gsap";
import { drawAudience, drawMarionette } from "../../art/figures";
import { alarm, bubble, sparkle } from "../../art/marks";
import { GOLD, GREEN, INK, RED, rig, svgEl } from "../../art/svg";
import { drawOn, fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const X = STAGE.centre;
const FEET = STAGE.floor - 5;
const BAR_Y = 92;
// The right string runs from the bar's end to the right shoulder; it breaks at its middle.
const FROM = { x: X + 56, y: BAR_Y };
const TO = { x: X + 24, y: FEET - 90 };
const BREAK = { x: (FROM.x + TO.x) / 2, y: (FROM.y + TO.y) / 2 };

function drawBowScene({ doc, art, colour }: MoveContext) {
  const m = drawMarionette(doc, { x: X, y: FEET, barY: BAR_Y, tunic: colour });
  m.strings[2]?.remove();
  const half = (a: { x: number; y: number }, b: { x: number; y: number }) => svgEl(doc, "path", { d: `M${a.x} ${a.y} L${b.x} ${b.y}`, fill: "none", stroke: INK, "stroke-width": 2, opacity: 0.75 });
  const upper = half(FROM, BREAK);
  const lowerEl = half(BREAK, TO);
  m.root.prepend(upper, lowerEl);
  const snap = sparkle(doc, BREAK.x, BREAK.y, 16, GOLD);
  const audience = drawAudience(doc, 418, [210, 320, 480, 590]);
  const fine = bubble(doc, X + 150, 150, "All good!", GREEN, 140);
  const honest = bubble(doc, X + 150, 150, "String broke!", RED, 160);
  const warning = alarm(doc, BREAK.x + 40, BREAK.y, RED);
  const ring = svgEl(doc, "circle", { cx: BREAK.x, cy: BREAK.y + 20, r: 36, fill: "none", stroke: RED, "stroke-width": 5, "stroke-dasharray": "10 7" });
  art.append(m.root, snap.root, ring, warning.root, fine.root, honest.root, audience.root);
  return { m, upper, lower: rig(lowerEl, TO), snap, audience, fine, honest, warning, ring };
}

/** A string snaps mid-act, yet the puppet bows and says all is well; the audience claps on. */
export const bowSnappedMove: SvgMove = {
  name: "bow-snapped",
  build: (context) => {
    const s = drawBowScene(context);
    gsap.set(s.ring, { drawSVG: "0%" });
    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(s.m.rig, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, 0.1)
      .fromTo(s.audience.heads, { y: 60 }, { y: 0, duration: 0.5, stagger: 0.08, ease: "back.out(1.6)" }, 0.2)
      .to(s.m.puppet.armRight, { rotation: -40, duration: 0.4, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0.9);
    pop(timeline, s.snap.rig, 1.8);
    timeline
      .to(s.snap.rig, { scale: 0, rotation: 90, duration: 0.3 }, 2.15)
      .to(s.upper, { drawSVG: "0% 0%", duration: 0.25, ease: "power2.out" }, 1.85)
      .to(s.lower, { rotation: 38, opacity: 0.5, duration: 0.5, ease: "bounce.out" }, 1.85)
      .to(s.m.puppet.armRight, { rotation: 24, duration: 0.4, ease: "bounce.out" }, 1.9)
      .to(s.m.rig, { rotation: 16, duration: 0.6, ease: "power2.inOut" }, 2.4);
    pop(timeline, s.fine.rig, 2.7);
    return timeline.to(s.audience.heads, { y: -8, duration: 0.16, repeat: 7, yoyo: true, stagger: 0.05, ease: "sine.inOut" }, 2.8);
  },
};

/** The fix: the puppet stops and says the string broke, so someone can mend it. */
export const speakUpMove: SvgMove = {
  name: "speak-up",
  build: (context) => {
    const s = drawBowScene(context);
    // Starts where the bow ended.
    gsap.set(s.upper, { drawSVG: "0% 0%" });
    gsap.set(s.ring, { drawSVG: "0%" });
    gsap.set(s.lower, { rotation: 38, opacity: 0.5 });
    gsap.set(s.m.puppet.armRight, { rotation: 24 });
    gsap.set(s.m.rig, { rotation: 16 });
    gsap.set(s.fine.rig, { scale: 1 });
    const timeline = gsap.timeline();
    timeline
      .to(s.m.rig, { rotation: 0, duration: 0.6, ease: "power2.out" }, 0.3)
      .to(s.fine.rig, { scaleX: 0, duration: 0.25, ease: "power2.in" }, 0.4)
      .fromTo(s.honest.rig, { scale: 1, scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "back.out(2)" }, 0.65);
    drawOn(timeline, s.ring, 0.6, 1.1);
    pop(timeline, s.warning.rig, 1.4);
    timeline.to(s.audience.heads, { y: 30, duration: 0.5, stagger: 0.06, ease: "power2.in" }, 1.6);
    return fixedEnding(timeline, context);
  },
};
