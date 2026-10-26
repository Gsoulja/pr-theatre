import { gsap } from "../../gsap";
import { chip, infinity } from "../../art/marks";
import { drawSpool } from "../../art/props-stage";
import { GREEN, group, ink, INK, ORANGE, rig, svgEl } from "../../art/svg";
import { drawOn, fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const SPOOL = { x: 300, y: 150 };
const START = `M${SPOOL.x + 34} ${SPOOL.y + 12} C${SPOOL.x + 70} ${SPOOL.y + 90} ${SPOOL.x + 40} ${STAGE.floor - 6} ${SPOOL.x + 130} ${STAGE.floor - 6}`;

function drawStringScene({ doc, art, colour }: MoveContext) {
  const spool = drawSpool(doc, SPOOL.x, SPOOL.y, colour);
  const long = svgEl(doc, "path", { d: `${START} L${STAGE.width + 60} ${STAGE.floor - 6}`, fill: "none", ...ink({ stroke: colour, "stroke-width": 6 }) });
  const short = svgEl(doc, "path", { d: `${START} L${SPOOL.x + 250} ${STAGE.floor - 6}`, fill: "none", ...ink({ stroke: colour, "stroke-width": 6 }) });
  const knotAt = { x: SPOOL.x + 256, y: STAGE.floor - 6 };
  const knotEl = group(
    doc,
    {},
    svgEl(doc, "circle", { cx: knotAt.x, cy: knotAt.y, r: 13, fill: colour, ...ink({ "stroke-width": 4 }) }),
    svgEl(doc, "path", { d: `M${knotAt.x + 8} ${knotAt.y + 8} q14 10 6 22 M${knotAt.x + 10} ${knotAt.y - 2} q18 -4 22 10`, fill: "none", ...ink({ stroke: colour, "stroke-width": 5 }) }),
    svgEl(doc, "rect", { x: knotAt.x + 30, y: knotAt.y - 34, width: 16, height: 40, rx: 4, fill: INK }),
  );
  const endless = infinity(doc, 588, 236, 42, ORANGE);
  const noEnd = chip(doc, 588, 184, "NO END", ORANGE, 110);
  const max = chip(doc, knotAt.x + 30, 250, "LIMIT", GREEN, 96);
  art.append(spool.root, long, short, knotEl, endless.root, noEnd.root, max.root);
  return { spool, long, short, knot: rig(knotEl, knotAt, { opacity: 0 }), endless, noEnd, max };
}

/** Thread runs off a spinning spool, across the floor and off the stage: nothing ever stops it. */
export const unspoolMove: SvgMove = {
  name: "string-unspools",
  build: (context) => {
    const scene = drawStringScene(context);
    gsap.set(scene.short, { opacity: 0 });
    const timeline = lightUp(gsap.timeline(), context);
    pop(timeline, scene.spool.rig, 0.1);
    drawOn(timeline, scene.long, 3.0, 0.6);
    timeline.to(scene.spool.rig, { rotation: 1080, duration: 3.0, ease: "power1.inOut" }, 0.6);
    pop(timeline, scene.endless.rig, 2.6);
    pop(timeline, scene.noEnd.rig, 2.8);
    return timeline.to(scene.endless.rig, { rotation: 8, duration: 0.3, repeat: 3, yoyo: true, ease: "sine.inOut" }, 3.2);
  },
};

/** The fix: the thread winds back to a set length and a knot stops it at a peg. */
export const tieKnotMove: SvgMove = {
  name: "tie-knot",
  build: (context) => {
    const scene = drawStringScene(context);
    // Starts where the unspooling ended.
    gsap.set([scene.endless.rig, scene.noEnd.rig], { scale: 1 });
    gsap.set(scene.short, { drawSVG: "0%" });
    const timeline = gsap.timeline();
    timeline
      .to(scene.long, { drawSVG: "0% 38%", duration: 1.0, ease: "power2.inOut" }, 0.2)
      .to(scene.spool.rig, { rotation: -540, duration: 1.0, ease: "power2.inOut" }, 0.2)
      .to([scene.endless.rig, scene.noEnd.rig], { scale: 0, duration: 0.3, ease: "back.in(2)" }, 0.3)
      .set(scene.long, { opacity: 0 }, 1.2)
      .set(scene.short, { drawSVG: "100%" }, 1.2)
      .fromTo(scene.knot, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "bounce.out" }, 1.25);
    pop(timeline, scene.max.rig, 1.7);
    return fixedEnding(timeline, context);
  },
};
