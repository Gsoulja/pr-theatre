import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SilentNarrator } from "./silent-narrator";

const settled = async (promise: Promise<void>): Promise<boolean> => {
  let done = false;
  void promise.then(() => (done = true));
  await Promise.resolve();
  return done;
};

describe("SilentNarrator", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("holds a caption for its reading time at the given pace", () => {
    const narrator = new SilentNarrator({ wordsPerMinute: 60, minimumMs: 0 });
    expect(narrator.readingTimeMs("one two  three\nfour")).toBe(4_000);
  });

  it("never holds a short caption for less than the minimum", () => {
    expect(new SilentNarrator({ minimumMs: 3_000 }).readingTimeMs("Hi")).toBe(3_000);
  });

  it("finishes when the reading time has passed, not before", async () => {
    const speech = await new SilentNarrator({ wordsPerMinute: 60, minimumMs: 0 }).speak("one two");
    await vi.advanceTimersByTimeAsync(1_999);
    expect(await settled(speech.finished)).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await settled(speech.finished)).toBe(true);
  });

  it("finishes at once when stopped, so a seek does not wait for old speech", async () => {
    const speech = await new SilentNarrator().speak("a long caption that would take a while to read");
    speech.stop();
    expect(await settled(speech.finished)).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });
});
