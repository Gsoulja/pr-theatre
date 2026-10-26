import type { AudioHandle, Narrator } from "@pr-theatre/engine";

export interface SilentNarratorOptions {
  /** Subtitle pace; slower than silent reading because the viewer also watches the stage. */
  wordsPerMinute?: number;
  /** Even a two-word caption stays up long enough to notice. */
  minimumMs?: number;
}

/** The null-object Narrator: no audio and no network, it holds each caption long enough to read. */
export class SilentNarrator implements Narrator {
  private readonly msPerWord: number;
  private readonly minimumMs: number;

  constructor(options: SilentNarratorOptions = {}) {
    this.msPerWord = 60_000 / (options.wordsPerMinute ?? 180);
    this.minimumMs = options.minimumMs ?? 3_000;
  }

  speak(text: string): Promise<AudioHandle> {
    return Promise.resolve(holdFor(this.readingTimeMs(text)));
  }

  readingTimeMs(text: string): number {
    const words = text.split(/\s+/).filter((word) => word.length > 0).length;
    return Math.max(this.minimumMs, Math.round(words * this.msPerWord));
  }
}

function holdFor(ms: number): AudioHandle {
  let stop: () => void = () => undefined;
  const finished = new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    stop = () => {
      clearTimeout(timer);
      resolve();
    };
  });
  return { finished, stop: () => stop() };
}
