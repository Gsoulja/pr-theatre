---
type: check
date: 2026-10-26
verdict: adopt
project: pr-theatre
---

# Prior art: dev server, static build and offline narrator for the 2D player

Constraints: pnpm workspace whose packages export raw `.ts` (no build step), Node ≥ 22.12,
static hosting on GitHub Pages under an unknown sub-path, must work offline with no API credits.

## Verdict: Adopt Vite 8 + build a silent timed Narrator (null object)
Vite 8.3.5 is already in the lockfile (Vitest 5 depends on it) and its Node range
(`^20.19 || >=22.12`) is exactly our `engines`. It transpiles linked workspace `.ts` sources
directly and `base: "./"` makes the build relocatable, which `cli publish` needs
(`index.html?show=shows/<slug>/show.json`). The offline Narrator is ~20 lines: wait for a
reading-time delay, no audio. Runner-up for voice: Web Speech API, later and optional.

## Options considered
| option | kind | fit | maintained | licence | notes |
|---|---|---|---|---|---|
| Vite 8 | library | HTML entries, TS, relative base, multi-page for `vr.html` later | yes (8.3.5, 2026-10-21) | MIT | already installed via Vitest |
| esbuild serve + hand-written HTML | library | no HTML entry handling, more glue | yes | MIT | ruled out: re-builds what Vite gives |
| Web Speech API (`speechSynthesis`) | browser API | free, no network for local voices | Baseline | n/a | Chrome on Linux returns no voices; `onend` unreliable; needs timeout |
| Pre-baked Kokoro audio | library | best offline voice | slow/done | Apache-2.0 | later: offline adapter with pre-baked assets |

## What to reuse
- Vite relative base and multi-page `build.rolldownOptions.input` (Vite 8 renamed `rollupOptions`).
- The null-object pattern from CLAUDE.md for the offline Narrator.

## Sources
- [[vite-8-build]] — relative base, multi-page input, Node range
- [[web-speech-synthesis]] — browser TTS and its gotchas
- [[text-to-speech]] — Kokoro for pre-baked narration later
