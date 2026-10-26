import { gsap } from "../../gsap";
import { drawPuppet } from "../../art/figures";
import { chip, question } from "../../art/marks";
import { drawChair, drawLever } from "../../art/props-stage";
import { BLUE, GREEN, ORANGE } from "../../art/svg";
import { fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const CHAIR_X = 320;
const LEVER_X = 548;

function drawChairScene({ doc, art }: MoveContext) {
  const chair = drawChair(doc, CHAIR_X, STAGE.floor);
  const lever = drawLever(doc, LEVER_X, STAGE.floor);
  const director = drawPuppet(doc, { x: CHAIR_X, y: STAGE.floor - 2, tunic: BLUE, cap: true });
  const nobody = question(doc, CHAIR_X, 96, 84, ORANGE);
  const approved = chip(doc, CHAIR_X + 10, 92, "APPROVED", GREEN, 130);
  art.append(chair.root, director.root, lever.root, nobody.root, approved.root);
  return { chair, lever, director, nobody, approved };
}

/** Nobody sits in the director's chair, yet the GO lever pulls itself. */
export const emptyChairMove: SvgMove = {
  name: "empty-chair",
  build: (context) => {
    const s = drawChairScene(context);
    gsap.set(s.director.body, { opacity: 0 });
    const timeline = lightUp(gsap.timeline(), context);
    pop(timeline, s.chair.rig, 0.1);
    pop(timeline, s.lever.rig, 0.4);
    pop(timeline, s.nobody.rig, 1.2);
    timeline
      .to(s.nobody.rig, { rotation: 10, duration: 0.25, repeat: 3, yoyo: true, ease: "sine.inOut" }, 1.6)
      .to(s.lever.arm, { rotation: -36, duration: 0.25, ease: "power2.in" }, 2.3)
      .to(s.lever.arm, { rotation: 30, duration: 0.35, ease: "back.out(3)" }, 2.55)
      .to(s.lever.lamp, { attr: { fill: GREEN }, duration: 0.1 }, 2.75)
      .to(s.lever.lamp, { opacity: 0.4, duration: 0.15, repeat: 5, yoyo: true }, 2.85)
      .to(s.chair.rig, { rotation: -2, duration: 0.12, repeat: 3, yoyo: true }, 2.9);
    return timeline;
  },
};

/** The fix: the director takes the chair and nods; only then does the lever move. */
export const directorNodsMove: SvgMove = {
  name: "director-nods",
  build: (context) => {
    const s = drawChairScene(context);
    const timeline = gsap.timeline();
    timeline
      .fromTo(s.director.body, { x: -360, opacity: 1 }, { x: 0, duration: 1.1, ease: "power2.out" }, 0.1)
      .fromTo(s.director.body, { y: 0 }, { y: -10, duration: 0.18, repeat: 5, yoyo: true, ease: "sine.inOut" }, 0.1)
      .to(s.director.head, { rotation: 14, duration: 0.2, repeat: 3, yoyo: true, ease: "sine.inOut" }, 1.4)
      .to(s.director.armRight, { rotation: -70, duration: 0.3, ease: "back.out(2)" }, 1.4);
    pop(timeline, s.approved.rig, 1.6);
    timeline
      .to(s.lever.arm, { rotation: 30, duration: 0.35, ease: "back.out(3)" }, 2.1)
      .to(s.lever.lamp, { attr: { fill: GREEN }, duration: 0.1 }, 2.3);
    return fixedEnding(timeline, context);
  },
};
