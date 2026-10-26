import "@pr-theatre/renderer-svg/style.css";
import "./style.css";
import { FetchSceneSource, ShowLoadError, SilentNarrator } from "@pr-theatre/adapters";
import { EventBus, Timeline } from "@pr-theatre/engine";
import type { PlaybackEvents } from "@pr-theatre/engine";
import { SvgRenderer } from "@pr-theatre/renderer-svg";
import { codeExcerptFor } from "./code-excerpt";
import { buildPropLooks } from "./prop-looks";
import { resolveShowUrl } from "./show-location";
import { CodePanel } from "./ui/code-panel";
import { PlayerControls } from "./ui/controls";
import { showError } from "./ui/error-banner";
import { renderPlaybill } from "./ui/playbill";

const LOCAL_HINT = 'Running it on your own computer? Start it with "pnpm demo", which prepares the example show first.';

function slot<T extends HTMLElement>(id: string, type: abstract new () => T): T {
  const el = document.getElementById(id);
  if (!(el instanceof type)) throw new Error(`index.html is missing the #${id} element the player mounts into.`);
  return el;
}

function report(error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  showError(slot("player-error", HTMLElement), error instanceof ShowLoadError ? `${message} ${LOCAL_HINT}` : message);
  // Also surfaces the stack in the browser console, the standard way, without console.* calls.
  reportError(error);
}

/** The one place concrete classes are chosen: HTTP show source, SVG stage, offline narrator. */
async function start(): Promise<void> {
  const showUrl = resolveShowUrl(new URL(window.location.href));
  const show = await new FetchSceneSource(showUrl).load();
  const events = new EventBus<PlaybackEvents>();
  const renderer = new SvgRenderer({
    looks: buildPropLooks(show.theme, showUrl),
    events,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    codeFor: (scene) => codeExcerptFor(show, scene),
  });
  renderer.mount(slot("stage", HTMLElement));

  const timeline = new Timeline({ scenes: show.scene.scenes, renderer, narrator: new SilentNarrator(), events });
  const codePanel = new CodePanel(slot("code-panel", HTMLDialogElement), show);
  const run = (command: () => Promise<void>): void => void command().catch(report);
  const openCode = (): void => {
    // Reading code takes longer than a caption, so the show waits.
    timeline.pause();
    codePanel.open(timeline.currentScene);
  };

  renderPlaybill(slot("playbill", HTMLElement), show.scene.meta);
  new PlayerControls(slot("controls", HTMLElement), show.scene.scenes, events, {
    togglePlay: () => (timeline.isPlaying ? timeline.pause() : run(() => timeline.play())),
    previous: () => run(() => timeline.previous()),
    next: () => run(() => timeline.next()),
    seek: (index) => run(() => timeline.seek(index)),
    playFix: () => run(() => timeline.playFix()),
    openCode,
  });
  events.on("prop:tapped", openCode);
  run(() => timeline.seek(0));
}

start().catch(report);
