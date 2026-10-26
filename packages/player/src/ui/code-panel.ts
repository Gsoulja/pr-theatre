import { SEVERITY_LABELS } from "@pr-theatre/schema";
import type { Scene, SceneFile } from "@pr-theatre/schema";
import { evidenceForScene } from "../evidence";
import type { EvidenceView, FactView } from "../evidence";
import { element } from "./dom";

export const CODE_PANEL_TITLE_ID = "pt-code-title";

/** "See the real code": the facts behind the current scene and the exact lines they point to. */
export class CodePanel {
  constructor(
    private readonly dialog: HTMLDialogElement,
    private readonly show: SceneFile,
  ) {
    dialog.setAttribute("aria-labelledby", CODE_PANEL_TITLE_ID);
    // A click on the dimmed backdrop lands on the dialog itself; treat it as "close".
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  open(scene: Scene): void {
    this.dialog.replaceChildren(this.render(scene));
    this.dialog.showModal();
  }

  private render(scene: Scene): HTMLElement {
    const doc = this.dialog.ownerDocument;
    const panel = element(doc, "div", "pt-code");
    const header = element(doc, "header", "pt-code-header");
    const heading = element(doc, "div", "pt-code-heading");
    const title = element(doc, "h2", "pt-code-title", scene.title);
    title.id = CODE_PANEL_TITLE_ID;
    heading.append(element(doc, "p", "pt-code-eyebrow", "The real code behind"), title);
    const close = element(doc, "form", "pt-code-close");
    close.method = "dialog";
    close.append(element(doc, "button", "pt-button", "Close"));
    header.append(heading, close);
    panel.append(header, ...evidenceForScene(this.show, scene).map((view) => this.renderFact(doc, view)));
    return panel;
  }

  private renderFact(doc: Document, { fact, evidence }: FactView): HTMLElement {
    const section = element(doc, "section", "pt-fact");
    section.dataset["severity"] = fact.severity;
    section.append(element(doc, "p", "pt-fact-label", SEVERITY_LABELS[fact.severity]), element(doc, "p", "pt-fact-summary", fact.summary));
    section.append(...evidence.map((view) => this.renderEvidence(doc, view)));
    return section;
  }

  private renderEvidence(doc: Document, { evidence, lines }: EvidenceView): HTMLElement {
    const figure = element(doc, "figure", "pt-snippet");
    const span = evidence.startLine === evidence.endLine ? `line ${evidence.startLine}` : `lines ${evidence.startLine}–${evidence.endLine}`;
    const caption = element(doc, "figcaption", "pt-snippet-caption");
    caption.append(element(doc, "code", "pt-snippet-file", evidence.file), ` · ${span} · commit ${evidence.commit.slice(0, 7)}`);
    figure.append(caption);
    if (lines.length === 0) {
      figure.append(element(doc, "p", "pt-snippet-missing", "The code lines were not packed into this show. Open the file above at those lines to read them."));
      return figure;
    }
    const code = element(doc, "code", "pt-snippet-code");
    code.append(...lines.map((line) => this.renderLine(doc, line.number, line.text)));
    const pre = element(doc, "pre", "pt-snippet-pre");
    pre.tabIndex = 0;
    pre.append(code);
    figure.append(pre);
    return figure;
  }

  private renderLine(doc: Document, number: number, text: string): HTMLElement {
    const row = element(doc, "span", "pt-line");
    row.append(element(doc, "span", "pt-line-number", String(number)), element(doc, "span", "pt-line-text", text));
    return row;
  }
}
