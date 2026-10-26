import { gsap } from "../../gsap";
import { chip, sparkle, speedLines } from "../../art/marks";
import { drawCrate } from "../../art/props-stage";
import { BLUE, GOLD, RED } from "../../art/svg";
import { lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { SvgMove } from "../move-context";

/** A crate slides in from the wings with a travel label; its lid lifts and new props peek out. */
export const crateArrivesMove: SvgMove = {
  name: "crate-arrives",
  build: (context) => {
    const { doc, art } = context;
    const x = STAGE.centre + 10;
    const crate = drawCrate(doc, x, STAGE.floor, "FROM ANOTHER", "theatre");
    const trail = speedLines(doc, x + 92, STAGE.floor - 60);
    const props = [
      sparkle(doc, x - 40, STAGE.floor - 150, 16, GOLD),
      sparkle(doc, x + 6, STAGE.floor - 170, 13, RED),
      sparkle(doc, x + 50, STAGE.floor - 152, 15, BLUE),
    ];
    const tag = chip(doc, x + 170, 150, "NEW PART", BLUE, 130);
    art.append(...props.map((p) => p.root), crate.root, trail.root, tag.root);

    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(crate.rig, { x: 520, rotation: 0 }, { x: 0, duration: 1.3, ease: "power3.out" }, 0.1)
      .fromTo(trail.rig, { x: 520, opacity: 1 }, { x: 0, duration: 1.3, ease: "power3.out" }, 0.1)
      .to(trail.rig, { opacity: 0, duration: 0.3 }, 1.2)
      .to(crate.rig, { rotation: -4, duration: 0.15, ease: "power2.out" }, 1.35)
      .to(crate.rig, { rotation: 0, duration: 0.4, ease: "bounce.out" }, 1.5)
      .to(crate.lid, { rotation: -28, y: -14, duration: 0.45, ease: "back.out(2)" }, 2.1)
      .fromTo(props.map((p) => p.rig), { y: 60, scale: 0 }, { y: 0, scale: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, 2.3)
      .to(props.map((p) => p.rig), { rotation: 45, duration: 0.8, ease: "sine.out" }, 2.7);
    return pop(timeline, tag.rig, 2.6);
  },
};
