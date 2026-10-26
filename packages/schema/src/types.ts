// Hand-written to match the JSON schemas next to this file. schema.test.ts keeps them in step.

export const FACT_KINDS = [
  "feature_added",
  "behaviour_changed",
  "code_removed",
  "secret_exposed",
  "missing_safety_limit",
  "unit_mismatch",
  "error_hidden",
  "no_timeout",
  "no_human_approval",
  "tests_added",
  "tests_missing",
  "dependency_added",
] as const;

export type FactKind = (typeof FACT_KINDS)[number];

export const SEVERITIES = ["ok", "check", "danger"] as const;

export type Severity = (typeof SEVERITIES)[number];

/** How each severity is said to a non-programmer, the same words on every stage. */
export const SEVERITY_LABELS: Record<Severity, string> = { ok: "Fine", check: "Worth a look", danger: "Needs fixing" };

/** Prop and move names are open: themes and renderers add their own. */
export type PropName = string;
export type MoveName = string;

export interface Evidence {
  file: string;
  startLine: number;
  endLine: number;
  commit: string;
}

export interface Fact {
  id: string;
  kind: FactKind;
  summary: string;
  severity: Severity;
  evidence: Evidence[];
}

export interface FactsFile {
  meta: { repo: string; prNumber: number; title: string; headCommit: string };
  facts: Fact[];
}

export interface SceneFix {
  move: MoveName;
  caption: string;
}

export interface Scene {
  id: string;
  factIds: string[];
  title: string;
  caption: string;
  prop: PropName;
  move: MoveName;
  severity: Severity;
  fix?: SceneFix;
}

export interface StoryFile {
  meta: { repo: string; prNumber: number; title: string; theme: string; summary: string };
  scenes: Scene[];
}

export interface KindLook {
  title: string;
  prop: PropName;
  move: MoveName;
  /** Contains the `{summary}` placeholder, filled with the fact summary. */
  narration: string;
  colour: string;
  fix?: { move: MoveName; narration: string };
}

export interface PropArt {
  asset: string;
  alt: string;
  /** Used by an ArtProvider that generates images instead of using `asset`. */
  prompt: string;
}

export interface Theme {
  name: string;
  title: string;
  kinds: Record<FactKind, KindLook>;
  props: Record<PropName, PropArt>;
}

export interface SnippetLine {
  number: number;
  text: string;
}

export interface EvidenceSnippet {
  factId: string;
  evidenceIndex: number;
  lines: SnippetLine[];
}

/** The show bundle the player loads: story, facts, theme and the real code lines. */
export interface SceneFile {
  version: 1;
  scene: StoryFile;
  facts: FactsFile;
  theme: Theme;
  snippets: EvidenceSnippet[];
}
