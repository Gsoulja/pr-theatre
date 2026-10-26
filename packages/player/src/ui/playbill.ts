import type { StoryFile } from "@pr-theatre/schema";
import { element } from "./dom";

/** The header: which pull request this show is about, and the one-line verdict. */
export function renderPlaybill(host: HTMLElement, meta: StoryFile["meta"]): void {
  const doc = host.ownerDocument;
  host.replaceChildren(
    element(doc, "p", "pt-playbill-pr", `${meta.repo} · pull request #${meta.prNumber}`),
    element(doc, "h1", "pt-playbill-title", meta.title),
    element(doc, "p", "pt-playbill-summary", meta.summary),
  );
  doc.title = `${meta.title} · PR Theatre`;
}
