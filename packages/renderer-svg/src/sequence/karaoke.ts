import { gsap } from "../gsap";

/** Writes the caption as one span per word, so it can light up as it is told. */
export function fillCaption(caption: HTMLElement, text: string): HTMLElement[] {
  const doc = caption.ownerDocument;
  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const spans = words.map((word) => {
    const span = doc.createElement("span");
    span.className = "pt-word";
    span.textContent = word;
    return span;
  });
  caption.replaceChildren(...spans.flatMap((span, i) => (i === 0 ? [span] : [doc.createTextNode(" "), span])));
  return spans;
}

/** Words light up at narration pace; the full caption stays readable the whole time. */
export function lightWords(spans: HTMLElement[], wordsPerMinute: number): gsap.core.Timeline {
  const perWord = 60 / wordsPerMinute;
  return gsap.timeline().fromTo(spans, { opacity: 0.38 }, { opacity: 1, duration: Math.min(0.25, perWord), stagger: perWord, ease: "none" }, 0);
}
