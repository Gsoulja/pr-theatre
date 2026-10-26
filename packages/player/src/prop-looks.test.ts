import { describe, expect, it } from "vitest";
import { exampleShow } from "./example-show.test-helpers";
import { buildPropLooks } from "./prop-looks";

const showUrl = new URL("https://owner.github.io/pr-theatre/shows/pr-42/show.json");

describe("buildPropLooks", () => {
  const theme = exampleShow().theme;
  const looks = buildPropLooks(theme, showUrl);

  it("gives every prop in the theme a look", () => {
    expect(Object.keys(looks).sort()).toEqual(Object.keys(theme.props).sort());
  });

  it("points art at the show's own assets folder", () => {
    expect(looks["key"]?.href).toBe("https://owner.github.io/pr-theatre/shows/pr-42/assets/key.svg");
  });

  it("takes the alt text from the theme and the colour from the fact kind that uses the prop", () => {
    expect(looks["key"]).toMatchObject({ alt: theme.props["key"]?.alt, colour: theme.kinds.secret_exposed.colour });
  });
});
