import { gsap } from "../../gsap";
import { drawMarionette } from "../../art/figures";
import { chip } from "../../art/marks";
import { drawHooks } from "../../art/props-stage";
import { GREY, INK, svgEl } from "../../art/svg";
import { lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { SvgMove } from "../move-context";

/** A puppet is lifted off its hook and out of the show; a dashed outline and an empty hook remain. */
export const leaveStageMove: SvgMove = {
  name: "leave-stage",
  build: (context) => {
    const { doc, art, colour } = context;
    const x = STAGE.centre;
    const floor = STAGE.floor - 5;
    const hooks = drawHooks(doc, 70, [x - 120, x, x + 120]);
    const m = drawMarionette(doc, { x, y: floor, barY: 112, tunic: colour });
    const ghost = svgEl(doc, "path", {
      d: `M${x} ${floor - 138} a22 22 0 1 1 0.1 0 M${x - 26} ${floor - 92} Q${x} ${floor - 100} ${x + 26} ${floor - 92} L${x + 32} ${floor - 38} Q${x} ${floor - 30} ${x - 32} ${floor - 38} Z M${x - 10} ${floor - 38} L${x - 14} ${floor} M${x + 10} ${floor - 38} L${x + 14} ${floor}`,
      fill: "none",
      stroke: INK,
      "stroke-width": 4,
      "stroke-dasharray": "10 9",
      "stroke-linecap": "round",
      opacity: 0,
    });
    const tag = chip(doc, x + 130, 170, "REMOVED", GREY, 120);
    art.append(hooks.root, ghost, m.root, tag.root);

    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(m.rig, { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "bounce.out" }, 0.1)
      .to(m.puppet.head, { rotation: 10, duration: 0.3, yoyo: true, repeat: 1 }, 1.0)
      .to(m.rig, { y: 14, duration: 0.25, ease: "power1.out" }, 1.7)
      .to(m.rig, { y: -420, rotation: -6, duration: 1.2, ease: "power3.in" }, 1.95)
      .to(ghost, { opacity: 0.55, duration: 0.5 }, 2.6);
    const hook = hooks.hooks[1];
    if (hook) {
      timeline
        .to(hook, { rotation: 16, duration: 0.3, ease: "power1.out" }, 2.9)
        .to(hook, { rotation: -10, duration: 0.45, ease: "sine.inOut" }, 3.2)
        .to(hook, { rotation: 5, duration: 0.4, ease: "sine.inOut" }, 3.65)
        .to(hook, { rotation: 0, duration: 0.35, ease: "sine.out" }, 4.05);
    }
    return pop(timeline, tag.rig, 3.2);
  },
};
