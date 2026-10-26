import { gsap, SplitText } from "../gsap";

/**
 * The scene title rises into the banner word by word. Returns the split so the next scene can
 * undo it: SplitText rewrites the element, and stacking splits would nest wrappers.
 */
export function riseHeadline(title: HTMLElement, badge: HTMLElement): { timeline: gsap.core.Timeline; split: SplitText } {
  const split = SplitText.create(title, { type: "words", mask: "words" });
  const timeline = gsap
    .timeline()
    .fromTo(badge, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(2)" }, 0)
    .fromTo(split.words, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }, 0.1);
  return { timeline, split };
}
