import type { PropName, Theme } from "@pr-theatre/schema";
import type { PropLook } from "@pr-theatre/renderer-svg";

const NEUTRAL_LIGHT = "#fbf3e4";

/** Turns the theme's art list into what the stage shows. Asset paths are relative to the show file. */
export function buildPropLooks(theme: Theme, showUrl: URL): Record<PropName, PropLook> {
  // The theme gives colours per fact kind; a prop takes the colour of the kind that uses it.
  const colourByProp = new Map(Object.values(theme.kinds).map((look) => [look.prop, look.colour]));
  return Object.fromEntries(
    Object.entries(theme.props).map(([name, art]) => [
      name,
      { href: new URL(art.asset, showUrl).href, alt: art.alt, colour: colourByProp.get(name) ?? NEUTRAL_LIGHT },
    ]),
  );
}
