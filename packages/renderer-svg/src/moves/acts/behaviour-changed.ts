import { gsap } from "../../gsap";
import { chip } from "../../art/marks";
import { drawScript } from "../../art/props-tools";
import { BLUE, GREY } from "../../art/svg";
import { lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { SvgMove } from "../move-context";

/** The script on its lectern turns a page, and a pen writes the new lines. */
export const rewriteScriptMove: SvgMove = {
  name: "rewrite-script",
  build: (context) => {
    const { doc, art } = context;
    const script = drawScript(doc, STAGE.centre, STAGE.floor, BLUE);
    const before = chip(doc, 286, 96, "BEFORE", GREY, 112);
    const after = chip(doc, 514, 96, "AFTER", BLUE, 104);
    art.append(script.root, before.root, after.root);
    gsap.set(script.newLines, { drawSVG: "0%" });

    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(script.rig, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.4)" }, 0.1);
    pop(timeline, before.rig, 0.6);
    timeline
      .to(script.page, { scaleX: 0, duration: 0.45, ease: "power2.in" }, 1.3)
      // The back of the turning page is blank: the old lines go with its front.
      .set(script.oldLines, { opacity: 0 }, 1.75)
      .to(script.page, { scaleX: -1, duration: 0.45, ease: "power2.out" }, 1.75)
      .to(before.rig, { opacity: 0.45, duration: 0.3 }, 1.75)
      .to(script.pen, { opacity: 1, duration: 0.2 }, 2.2);
    script.newLines.forEach((line, i) => {
      const at = 2.3 + i * 0.5;
      const width = i === 3 ? 52 : 82;
      timeline
        .fromTo(script.pen, { x: 0, y: i * 22 }, { x: width, duration: 0.42, ease: "none" }, at)
        .to(line, { drawSVG: "100%", duration: 0.42, ease: "none" }, at);
    });
    timeline.to(script.pen, { x: 96, y: 70, rotation: 20, duration: 0.4, ease: "power2.out" }, 4.35);
    return pop(timeline, after.rig, 4.3);
  },
};
