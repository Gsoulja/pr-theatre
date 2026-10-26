import { gsap } from "../../gsap";
import { drawHand } from "../../art/figures";
import { alarm } from "../../art/marks";
import { drawDoor, drawKey, drawPadlock } from "../../art/props-stage";
import { RED } from "../../art/svg";
import { fixedEnding, lightUp, pop } from "../beats";
import { STAGE } from "../move-context";
import type { MoveContext, SvgMove } from "../move-context";

const NAIL = { x: 486, y: 138 };

function drawKeyScene({ doc, art }: MoveContext) {
  const door = drawDoor(doc, 316, STAGE.floor);
  const key = drawKey(doc, NAIL.x, NAIL.y);
  const hand = drawHand(doc, { x: 600, y: 248 }, "#3d3d4a");
  const warning = alarm(doc, 560, 112, RED);
  const lock = drawPadlock(doc, door.keyhole.x, door.keyhole.y - 20);
  art.append(door.root, key.root, hand.root, warning.root, lock.root);
  return { door, key, hand, warning, lock };
}

/** The key hangs outside the stage door; a stranger's hand reaches for it. */
export const keyOutsideMove: SvgMove = {
  name: "key-outside",
  build: (context) => {
    const { door, key, hand, warning } = drawKeyScene(context);
    const timeline = lightUp(gsap.timeline(), context);
    timeline
      .fromTo(door.rig, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.1)
      .fromTo(key.rig, { rotation: 0, scale: 0 }, { scale: 1, duration: 0.45, ease: "back.out(2)" }, 0.5)
      .to(key.rig, { rotation: 22, duration: 0.5, ease: "sine.out" }, 0.9)
      .to(key.rig, { rotation: -16, duration: 0.8, ease: "sine.inOut" }, 1.4)
      .to(key.rig, { rotation: 11, duration: 0.7, ease: "sine.inOut" }, 2.2)
      .to(key.rig, { rotation: -6, duration: 0.6, ease: "sine.inOut" }, 2.9)
      .fromTo(hand.rig, { x: 300 }, { x: 0, duration: 1.0, ease: "power2.out" }, 1.6)
      .to(hand.rig, { x: -16, rotation: -6, duration: 0.22, repeat: 3, yoyo: true, ease: "sine.inOut" }, 2.6);
    pop(timeline, warning.rig, 2.4);
    return timeline.to(warning.rig, { scale: 1.18, duration: 0.25, repeat: 3, yoyo: true, ease: "sine.inOut" }, 2.9);
  },
};

/** The fix: the hand is gone, the key goes inside, and a padlock clicks shut. */
export const lockKeyMove: SvgMove = {
  name: "lock-key",
  build: (context) => {
    const { door, key, hand, warning, lock } = drawKeyScene(context);
    // Starts where the key scene ended: hand reaching, warning up.
    gsap.set(key.rig, { rotation: -6 });
    gsap.set(warning.rig, { scale: 1 });
    const timeline = gsap.timeline();
    timeline
      .to(hand.rig, { x: 320, duration: 0.6, ease: "power2.in" }, 0.2)
      .to(warning.rig, { scale: 0, duration: 0.3, ease: "back.in(2)" }, 0.3)
      .to(key.rig, { rotation: -90, x: door.keyhole.x - NAIL.x + 40, y: door.keyhole.y - NAIL.y - 30, scale: 0.55, duration: 1.0, ease: "power2.inOut" }, 0.8)
      .to(key.rig, { opacity: 0, duration: 0.25 }, 1.75);
    pop(timeline, lock.rig, 1.9);
    timeline.to(lock.shackle, { y: 0, duration: 0.35, ease: "bounce.out" }, 2.3);
    return fixedEnding(timeline, context);
  },
};
