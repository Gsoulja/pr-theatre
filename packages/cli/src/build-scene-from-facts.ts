import type { Fact, FactsFile, Scene, Severity, StoryFile, Theme } from "@pr-theatre/schema";

// Good news first, so the viewer knows what the PR is for; then what must change; then what to check.
const TELLING_ORDER: Record<Severity, number> = { ok: 0, danger: 1, check: 2 };

function sceneForFact(fact: Fact, theme: Theme, index: number): Scene {
  const look = theme.kinds[fact.kind];
  const scene: Scene = {
    id: `s-${index + 1}`,
    factIds: [fact.id],
    title: look.title,
    caption: look.narration.replace("{summary}", fact.summary),
    prop: look.prop,
    move: look.move,
    severity: fact.severity,
  };
  if (look.fix && fact.severity !== "ok") scene.fix = { move: look.fix.move, caption: look.fix.narration };
  return scene;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function summarise(facts: Fact[]): string {
  const count = (severity: Severity) => facts.filter((fact) => fact.severity === severity).length;
  const danger = count("danger");
  const check = count("check");
  if (danger + check === 0) return `${plural(facts.length, "change", "changes")}, nothing worrying.`;
  return `${plural(danger, "thing needs", "things need")} fixing and ${plural(check, "thing needs", "things need")} a second look.`;
}

/**
 * The plain, deterministic storyteller: one scene per fact, worded by the theme.
 * The storyteller agent starts from this draft and may only rephrase it.
 */
export function buildSceneFromFacts(facts: FactsFile, theme: Theme): StoryFile {
  const ordered = [...facts.facts].sort((a, b) => TELLING_ORDER[a.severity] - TELLING_ORDER[b.severity]);
  return {
    meta: {
      repo: facts.meta.repo,
      prNumber: facts.meta.prNumber,
      title: facts.meta.title,
      theme: theme.name,
      summary: summarise(facts.facts),
    },
    scenes: ordered.map((fact, index) => sceneForFact(fact, theme, index)),
  };
}
