/** What `pnpm demo` bundles; `cli publish` links to other shows with `?show=`. */
export const DEFAULT_SHOW_PATH = "shows/robot-mcp-pr/show.json";

export class ShowLocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowLocationError";
  }
}

/** Finds the show for this page. Only shows on the same site play, so a link cannot stage someone else's story. */
export function resolveShowUrl(page: URL): URL {
  const requested = page.searchParams.get("show") ?? DEFAULT_SHOW_PATH;
  const show = new URL(requested, page);
  if (show.origin !== page.origin) {
    throw new ShowLocationError(`This player only plays shows from ${page.origin}, but the link asks for one from ${show.origin}.`);
  }
  return show;
}
