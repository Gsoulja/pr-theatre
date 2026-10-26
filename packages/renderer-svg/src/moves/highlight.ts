import { gsap } from "../gsap";
import { rig, svgEl } from "../art/svg";
import { fixedEnding, lightUp } from "./beats";
import { STAGE } from "./move-context";
import type { MoveContext, SvgMove } from "./move-context";

function drawThemeProp({ doc, art, propHref }: MoveContext) {
  const image = svgEl(doc, "image", { href: propHref, x: STAGE.centre - 110, y: STAGE.floor - 230, width: 220, height: 220 });
  art.append(image);
  return rig(image, { x: STAGE.centre, y: STAGE.floor - 10 });
}

/** The fallback every renderer has: the theme's picture, with the spotlight finding it. */
export const highlightMove: SvgMove = {
  name: "highlight",
  build: (context) => {
    const prop = drawThemeProp(context);
    return lightUp(gsap.timeline(), context)
      .fromTo(prop, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)" }, 0.1)
      .fromTo(context.spotlight, { opacity: 0.3 }, { opacity: 0.9, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0.7)
      .to(prop, { scale: 1.06, duration: 0.5, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0.7);
  },
};

/** The generic fix, for kinds without their own: the picture settles and the stamp lands. */
export const settleMove: SvgMove = {
  name: "settle",
  build: (context) => {
    const prop = drawThemeProp(context);
    return fixedEnding(gsap.timeline().fromTo(prop, { rotation: 8, y: -12 }, { rotation: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" }), context);
  },
};
