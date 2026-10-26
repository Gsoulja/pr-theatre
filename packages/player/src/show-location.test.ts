import { describe, expect, it } from "vitest";
import { DEFAULT_SHOW_PATH, ShowLocationError, resolveShowUrl } from "./show-location";

const page = (query = ""): URL => new URL(`https://owner.github.io/pr-theatre/index.html${query}`);

describe("resolveShowUrl", () => {
  it("plays the example show next to the page when no show is named", () => {
    expect(resolveShowUrl(page()).href).toBe(`https://owner.github.io/pr-theatre/${DEFAULT_SHOW_PATH}`);
  });

  it("finds a published show relative to the page, as cli publish links it", () => {
    expect(resolveShowUrl(page("?show=shows/pr-42/show.json")).href).toBe("https://owner.github.io/pr-theatre/shows/pr-42/show.json");
  });

  it.each(["https://elsewhere.test/show.json", "//elsewhere.test/show.json"])("refuses a show from another site (%s)", (show) => {
    expect(() => resolveShowUrl(page(`?show=${encodeURIComponent(show)}`))).toThrow(ShowLocationError);
  });
});
