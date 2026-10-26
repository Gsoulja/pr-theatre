import { gsap } from "../gsap";
import { CURTAIN_TRAVEL, CURTAIN_WIDE } from "../stage";
import type { StageParts } from "../stage";

/** The real lines behind a scene, as the composition root found them in the show. */
export interface CodeExcerpt {
  file: string;
  lines: ReadonlyArray<{ number: number; text: string }>;
  /** Other places in the code this scene's facts point to, shown in "See the real code". */
  more: number;
}

const MAX_LINES = 7;

function shortPath(file: string): string {
  const parts = file.split("/");
  return parts.length > 3 ? `…/${parts.slice(-3).join("/")}` : file;
}

/** Fills the card with the excerpt. Text only: show files are data and never parsed as HTML. */
export function fillCodeCard(parts: StageParts, excerpt: CodeExcerpt | undefined): HTMLElement[] {
  parts.code.hidden = excerpt === undefined;
  if (!excerpt) return [];
  const doc = parts.code.ownerDocument;
  parts.codeFile.textContent = shortPath(excerpt.file);
  const shown = excerpt.lines.length > MAX_LINES ? excerpt.lines.slice(0, MAX_LINES - 1) : excerpt.lines;
  const rows = shown.map((line) => {
    const row = doc.createElement("div");
    row.className = "pt-code-line";
    const number = doc.createElement("span");
    number.className = "pt-code-number";
    number.textContent = String(line.number);
    const text = doc.createElement("span");
    text.className = "pt-code-text";
    text.textContent = line.text.trim() === "" ? " " : line.text;
    row.append(number, text);
    return row;
  });
  const cut = excerpt.lines.length - shown.length;
  const notes = [cut > 0 ? `${cut} more lines` : "", excerpt.more > 0 ? `${excerpt.more} more ${excerpt.more === 1 ? "place" : "places"}` : ""].filter(Boolean);
  parts.codeMore.textContent = notes.length ? `+ ${notes.join(" · ")} in “See the real code”` : "";
  parts.codeLines.replaceChildren(...rows);
  return rows;
}

// The drawing moves into the left half (centre x 256) small enough that nothing reaches the card.
const SPLIT = { x: -144, scale: 0.78 };

/** Split screen: curtains draw back, the drawing steps left, the card slides in, a marker sweeps the lines. */
export function codeCloseUp(parts: StageParts, rows: HTMLElement[]): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(parts.camera, { ...SPLIT, duration: 0.8, ease: "power2.inOut" }, 0)
    .to(parts.curtainLeft, { x: -CURTAIN_WIDE, duration: 0.8, ease: "power2.inOut" }, 0)
    .to(parts.curtainRight, { x: CURTAIN_WIDE, duration: 0.8, ease: "power2.inOut" }, 0)
    .fromTo(parts.code, { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, 0.2)
    .fromTo(rows, { opacity: 0, x: 14 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.07, ease: "power2.out" }, 0.5)
    .fromTo(rows, { backgroundSize: "0% 100%" }, { backgroundSize: "100% 100%", duration: 0.35, stagger: 0.12, ease: "power1.inOut" }, 0.9);
}

/** Back to the full stage with no card, at once: used behind closed curtains. */
export function resetCloseUp(parts: StageParts): void {
  parts.camera.x = 0;
  parts.camera.scale = 1;
  gsap.set(parts.code, { opacity: 0, x: 60 });
}

/** Back to the full stage, gliding: used when the same scene replays its fix in view. */
export function leaveCloseUp(parts: StageParts): gsap.core.Timeline {
  return gsap
    .timeline()
    .to(parts.camera, { x: 0, scale: 1, duration: 0.6, ease: "power2.inOut" }, 0)
    .to(parts.curtainLeft, { x: -CURTAIN_TRAVEL, duration: 0.6, ease: "power2.inOut" }, 0)
    .to(parts.curtainRight, { x: CURTAIN_TRAVEL, duration: 0.6, ease: "power2.inOut" }, 0)
    .to(parts.code, { opacity: 0, x: 60, duration: 0.3 }, 0);
}
