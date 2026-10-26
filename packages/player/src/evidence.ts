import type { Evidence, Fact, Scene, SceneFile, SnippetLine } from "@pr-theatre/schema";

export interface EvidenceView {
  evidence: Evidence;
  /** Empty when the show was bundled without the diff. */
  lines: SnippetLine[];
}

export interface FactView {
  fact: Fact;
  evidence: EvidenceView[];
}

/** The real code behind one scene: each fact it tells, with the lines that prove it. */
export function evidenceForScene(show: SceneFile, scene: Scene): FactView[] {
  const facts = new Map(show.facts.facts.map((fact) => [fact.id, fact]));
  const snippets = new Map(show.snippets.map((snippet) => [`${snippet.factId}#${snippet.evidenceIndex}`, snippet.lines]));
  return scene.factIds.map((id) => {
    const fact = facts.get(id);
    // FetchSceneSource checks references on load, so this only fires on a wiring mistake.
    if (!fact) throw new RangeError(`Scene ${scene.id} points to fact ${id}, which this show does not have.`);
    return { fact, evidence: fact.evidence.map((evidence, index) => ({ evidence, lines: snippets.get(`${id}#${index}`) ?? [] })) };
  });
}
