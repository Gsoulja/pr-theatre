import type { Fact, FactsFile, Severity, StoryFile } from "./types";

/** Answers "do these lines exist in the PR?" without schema knowing how diffs are parsed. */
export interface LineIndex {
  hasFile(file: string): boolean;
  covers(file: string, startLine: number, endLine: number): boolean;
}

export interface ReferenceIssue {
  where: string;
  message: string;
}

const SEVERITY_RANK: Record<Severity, number> = { ok: 0, check: 1, danger: 2 };

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
}

function checkEvidence(fact: Fact, lines: LineIndex | undefined): ReferenceIssue[] {
  return fact.evidence.flatMap((evidence, index): ReferenceIssue[] => {
    const where = `${fact.id}.evidence[${index}]`;
    const span = `${evidence.file}:${evidence.startLine}-${evidence.endLine}`;
    if (evidence.startLine > evidence.endLine) {
      return [{ where, message: `startLine is after endLine (${span})` }];
    }
    if (!lines) return [];
    if (!lines.hasFile(evidence.file)) {
      return [{ where, message: `file ${evidence.file} is not part of this PR` }];
    }
    if (!lines.covers(evidence.file, evidence.startLine, evidence.endLine)) {
      return [{ where, message: `lines ${span} are not in the PR diff` }];
    }
    return [];
  });
}

function highestSeverity(facts: Fact[]): Severity {
  return facts.reduce<Severity>((top, fact) => (SEVERITY_RANK[fact.severity] > SEVERITY_RANK[top] ? fact.severity : top), "ok");
}

function checkScenes(facts: FactsFile, story: StoryFile): ReferenceIssue[] {
  const byId = new Map(facts.facts.map((fact) => [fact.id, fact]));
  const issues: ReferenceIssue[] = duplicates(story.scenes.map((scene) => scene.id)).map((id) => ({
    where: id,
    message: "scene id is used more than once",
  }));

  for (const scene of story.scenes) {
    const used = scene.factIds.map((id) => byId.get(id));
    scene.factIds.forEach((id, index) => {
      if (!used[index]) issues.push({ where: scene.id, message: `points to fact ${id}, which does not exist in facts.json` });
    });
    const known = used.filter((fact): fact is Fact => fact !== undefined);
    if (known.length > 0 && scene.severity !== highestSeverity(known)) {
      issues.push({ where: scene.id, message: `severity is ${scene.severity} but its facts say ${highestSeverity(known)}` });
    }
  }

  const told = new Set(story.scenes.flatMap((scene) => scene.factIds));
  for (const fact of facts.facts) {
    if (fact.severity === "danger" && !told.has(fact.id)) {
      issues.push({ where: fact.id, message: "danger fact is not shown in any scene" });
    }
  }

  if (story.meta.repo !== facts.meta.repo || story.meta.prNumber !== facts.meta.prNumber) {
    issues.push({ where: "meta", message: "scene.json and facts.json describe different pull requests" });
  }
  return issues;
}

/**
 * The "may simplify, may never invent" rule. Facts must point at real lines (when a
 * LineIndex is given), and scenes must point at real facts and show every danger.
 */
export function checkReferences(facts: FactsFile, story?: StoryFile, lines?: LineIndex): ReferenceIssue[] {
  const issues: ReferenceIssue[] = duplicates(facts.facts.map((fact) => fact.id)).map((id) => ({
    where: id,
    message: "fact id is used more than once",
  }));
  issues.push(...facts.facts.flatMap((fact) => checkEvidence(fact, lines)));
  if (story) issues.push(...checkScenes(facts, story));
  return issues;
}
