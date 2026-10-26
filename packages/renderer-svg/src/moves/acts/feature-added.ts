import { gsap } from "../../gsap";
import { drawMarionette } from "../../art/figures";
import { chip, sparkle } from "../../art/marks";
import { GOLD, GREEN } from "../../art/svg";
import { lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { SvgMove } from "../move-context";

/** A new puppet walks on from the wings, lands, and waves; sparkles and a "NEW" tag. */
export const joinCastMove: SvgMove = {
  name: "join-cast",
  build: (context) => {
    const { doc, art, colour } = context;
    const m = drawMarionette(doc, { x: STAGE.centre, y: STAGE.floor - 5, barY: 92, tunic: colour });
    const tag = chip(doc, 486, 150, "NEW", GREEN, 80);
    const sparks = [
      [322, 176, 15],
      [494, 222, 11],
      [458, 112, 13],
      [338, 262, 9],
    ].map(([x, y, s]) => sparkle(doc, x ?? 0, y ?? 0, s ?? 10, GOLD));
    art.append(m.root, tag.root, ...sparks.map((s) => s.root));

    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(m.rig, { x: -360 }, { x: 0, duration: 1.9, ease: "power2.out" }, 0.1)
      .fromTo(m.rig, { y: 0 }, { y: -12, duration: 0.19, repeat: 9, yoyo: true, ease: "sine.inOut" }, 0.1)
      .to(m.puppet.body, { scaleY: 0.9, scaleX: 1.08, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.out" }, 2.0)
      .to(m.puppet.armRight, { rotation: -125, duration: 0.35, ease: "back.out(2)" }, 2.25)
      .to(m.puppet.armRight, { rotation: -100, duration: 0.22, repeat: 3, yoyo: true, ease: "sine.inOut" }, 2.6)
      .to(m.puppet.head, { rotation: -8, duration: 0.3, yoyo: true, repeat: 1 }, 2.4);
    pop(timeline, tag.rig, 2.4);
    pop(timeline, sparks.map((s) => s.rig), 2.5, 0.12);
    return timeline.to(sparks.map((s) => s.rig), { rotation: 45, duration: 0.8, ease: "sine.out" }, 2.6);
  },
};
