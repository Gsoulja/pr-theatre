import { gsap } from "../../gsap";
import { drawPuppet } from "../../art/figures";
import { chip, question, tick } from "../../art/marks";
import { drawClipboard } from "../../art/props-tools";
import { BLUE, GREEN, ORANGE, RED } from "../../art/svg";
import { drawOn, fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const TUNICS = [RED, BLUE, ORANGE];

function drawRehearsalScene({ doc, art }: MoveContext) {
  const board = drawClipboard(doc, 566, STAGE.floor - 6);
  const cast = TUNICS.map((tunic, i) => drawPuppet(doc, { x: 210 + i * 90, y: STAGE.floor - 4, tunic, size: 0.72 }));
  const ticks = board.boxes.map((box) => tick(doc, box.x, box.y, 14, GREEN));
  const unknowns = board.boxes.map((box) => question(doc, box.x, box.y, 34, ORANGE));
  const done = chip(doc, 566, 82, "REHEARSED", GREEN, 140);
  const skipped = chip(doc, 566, 82, "NOT TRIED", ORANGE, 140);
  art.append(board.root, ...cast.map((p) => p.root), ...ticks, ...unknowns.map((q) => q.root), done.root, skipped.root);
  return { board, cast, ticks, unknowns, done, skipped };
}

/** The cast run their lines one by one, and each gets a tick on the clipboard. */
export const rehearseMove: SvgMove = {
  name: "rehearse",
  build: (context) => {
    const s = drawRehearsalScene(context);
    gsap.set(s.ticks, { drawSVG: "0%" });
    const timeline = lightUp(gsap.timeline(), context);
    pop(timeline, s.board.rig, 0.1);
    pop(timeline, s.cast.map((p) => p.body), 0.3, 0.15);
    s.cast.forEach((puppet, i) => {
      const at = 1.2 + i * 0.75;
      timeline
        .to(puppet.body, { y: -26, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }, at)
        .to(puppet.armRight, { rotation: -110, duration: 0.22, yoyo: true, repeat: 1 }, at);
      const mark = s.ticks[i];
      if (mark) drawOn(timeline, mark, 0.35, at + 0.3);
    });
    return pop(timeline, s.done.rig, 3.5);
  },
};

/** Nobody rehearses: the clipboard fills with question marks and one puppet shrugs. */
export const skipRehearsalMove: SvgMove = {
  name: "skip-rehearsal",
  build: (context) => {
    const s = drawRehearsalScene(context);
    gsap.set(s.ticks, { drawSVG: "0%" });
    gsap.set(s.cast.slice(1).map((p) => p.body), { opacity: 0 });
    const timeline = lightUp(gsap.timeline(), context);
    pop(timeline, s.board.rig, 0.1);
    const lone = s.cast[0];
    if (lone) {
      timeline
        .fromTo(lone.body, { x: -200 }, { x: 40, duration: 0.9, ease: "power2.out" }, 0.4)
        .to([lone.armLeft, lone.armRight], { rotation: (i: number) => (i === 0 ? 50 : -50), duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.4)
        .to(lone.head, { rotation: -12, duration: 0.25, yoyo: true, repeat: 3 }, 2.4);
    }
    pop(timeline, s.unknowns.map((q) => q.rig), 1.2, 0.35);
    timeline.to(context.spotlight, { opacity: 0.25, duration: 0.08, repeat: 5, yoyo: true }, 2.0);
    return pop(timeline, s.skipped.rig, 3.0);
  },
};

/** The fix for missing tests: the rehearsal happens after all. */
export const rehearseNowMove: SvgMove = {
  name: "rehearse-now",
  build: (context) => fixedEnding(rehearseMove.build(context), context),
};
