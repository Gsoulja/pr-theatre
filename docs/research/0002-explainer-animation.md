---
type: check
date: 2026-10-26
verdict: adapt
project: pr-theatre
---

# Prior art: explainer-video quality animation in the browser, generated from scene.json

Constraints: plays live in the browser (2D now, WebXR later), driven by data (no hand-made assets per PR),
text stays real DOM text (captions, screen readers, still frame + caption), offline, commercial use.

## Verdict: Adapt — keep GSAP, add its free plugins, and follow the explainer-video structure
GSAP 3.15 (already installed) now ships SplitText, DrawSVG, MorphSVG and MotionPath free, including
commercial use. Its only ban is building a no-code visual animation builder that competes with Webflow,
which PR Theatre is not. Every scene becomes a short explainer sequence: curtain transition → animated
headline → a per-kind illustrated action drawn from parts (no flat image) → a close-up of the real code →
captions that light up word by word at narration pace.
Runner-up: Motion Canvas, if PR Theatre ever exports MP4 and drops live interactivity.

## Options considered
| option | kind | fit | maintained | licence | notes |
|---|---|---|---|---|---|
| GSAP 3.15 + SplitText/DrawSVG | library | DOM + SVG, timelines, text splitting, line drawing | yes | GSAP Standard (free, commercial OK; no Webflow-competing builders) | already a dependency |
| Motion Canvas 3.17 | library | made for explainer videos, but canvas-drawn | slow (last release 2025-02) | MIT | text not in DOM; harder captions/a11y/VR |
| Revideo 0.11 | library | Motion Canvas fork for rendering videos | yes (2026-07) | MIT | aimed at server-side MP4 rendering |
| Remotion 4 | library | React video, renders MP4 | yes | company licence for teams of 4+ | heavy, licence cost |
| Theatre.js 0.7 | library | visual sequence editor | stale (2024-05) | Apache-2.0 | editor-centric, not data-driven |
| Lottie / Rive | runtime | great playback | yes | MIT runtimes | needs After Effects / Rive editor assets per kind |

## What to reuse
- `gsap.registerPlugin(SplitText, DrawSVGPlugin)` once in a central module; `SplitText.create(el, {type: "words, lines", mask: "lines"})`, `revert()` before reusing the element.
- Explainer craft: anticipation, squash and stretch, staggered pops (`back.out`), lines drawn on (DrawSVG), a camera move to make room for the code close-up, an end frame that reads as a still.

## Sources
- GSAP README in the installed package (3.15.0): "100% FREE including ALL of the bonus plugins … even for commercial use"
- GSAP Standard licence (mirror): https://scancode-licensedb.aboutcode.org/gsap-standard-no-charge-2025.html
- GSAP docs via Context7: SplitText (`mask`, `revert`), DrawSVGPlugin, plugin registration
- npm registry, read 2026-10-26: @motion-canvas/core 3.17.2, @revideo/core 0.11.0, remotion 4.0.539, @theatre/core 0.7.2, lottie-web 5.13.0, @rive-app/canvas 2.47.1
