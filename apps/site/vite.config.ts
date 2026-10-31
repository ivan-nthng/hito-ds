import { defineConfig } from "vite";
export default defineConfig({
  base: "/",
  oxc: { jsx: { runtime: "automatic" } },
  build: { outDir: "../../output/site", emptyOutDir: true },
});
