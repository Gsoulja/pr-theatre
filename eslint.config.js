import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

// The one-way dependency rule from CLAUDE.md, enforced so it cannot drift.
const forbiddenForCore = [
  { group: ["@pr-theatre/renderer-*", "@pr-theatre/adapters", "@pr-theatre/player", "@pr-theatre/cli"], message: "schema and engine must not depend on outer layers. Add a port to engine/ports.ts instead." },
  { group: ["gsap", "gsap/*", "aframe", "three"], message: "schema and engine must stay renderer-agnostic." },
];

export default tseslint.config(
  { ignores: ["**/node_modules/**", "**/dist/**", "**/public/shows/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "no-console": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["packages/schema/**/*.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [...forbiddenForCore, { group: ["@pr-theatre/engine"], message: "schema is the bottom layer." }] }],
    },
  },
  {
    files: ["packages/engine/**/*.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: forbiddenForCore }] },
  },
);
