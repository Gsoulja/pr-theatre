import { defineConfig } from "vite";

// A relative base lets one build live under any GitHub Pages path, next to its shows/ folder.
// "mpa" turns off the single-page fallback, so a missing show is a 404 locally too, as on Pages.
// public/ only holds shows bundled for `pnpm dev`, and those may be private code: a build ships
// none of them; `cli publish` adds exactly the show it is given.
// Vite only reads a default export, so this file is the one exception to named exports.
export default defineConfig({
  base: "./",
  appType: "mpa",
  build: { copyPublicDir: false },
});
