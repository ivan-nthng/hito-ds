import { readFile, writeFile } from "node:fs/promises";
import { themePresets } from "./themes.mjs";
const url = new URL("../src/tokens.css", import.meta.url);
const marker = "/* HITO-001 generated theme adapter; run node tokens/build-themes.mjs. */";
const css = (await readFile(url, "utf8")).split(marker)[0].trimEnd();
const modes = { light: new Map(), dark: new Map() };
// The existing adapter uses flat declaration rules inside media/layer blocks.
for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (!selector.includes(":root") && !selector.includes("data-hito-color-scheme")) continue;
  const targets = selector.includes('="dark"') || selector.includes(':root:not') ? ["dark"] : selector.includes('="light"') ? ["light"] : ["light", "dark"];
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    if (!/^(--focus-indicator-color|--color-|--button-.*(?:background|foreground|border)|--editable-text-editing-border|--type-family-|--status-badge-)/.test(name)) continue;
    for (const mode of targets) modes[mode].set(name, value.trim().replace(/\s+/g, " "));
  }
}
// Guaranteed-invalid reset enables the component's distinct rest/hover fallbacks.
// Neutral scopes still bind this alias to strong, including nested scheme scopes.
modes.light.set("--hito-input-rest-border", "initial");
modes.dark.set("--hito-input-rest-border", "initial");
modes.light.set("--hito-choice-rest-border", "var(--color-border-default)");
modes.dark.set("--hito-choice-rest-border", "var(--color-border-default)");
const declarations = [...modes.light].map(([name, light]) => {
  const dark = modes.dark.get(name) ?? light;
  return `    ${name}: ${light === dark ? light : `light-dark(${light}, ${dark})`};`;
}).join("\n");
const overrides = themePresets.neutral.overrides.map(({ cssVariable, modes }) => `      ${cssVariable}: light-dark(${modes.light.webValue}, ${modes.dark.webValue});`).join("\n");
const aliases = Object.entries(themePresets.neutral.aliases).map(([name, target]) => `      ${name}: var(${target});`).join("\n");
const result = `${css}\n\n${marker}\n@layer hito.tokens {\n  :where([data-hito-theme], [data-hito-color-scheme]) {\n${declarations}\n  }\n  [data-hito-color-scheme="light"] { color-scheme: light; }\n  [data-hito-color-scheme="dark"] { color-scheme: dark; }\n  @scope ([data-hito-theme="neutral"]) to ([data-hito-theme="inherited"]) {\n    :scope, [data-hito-color-scheme] {\n${overrides}\n${aliases}\n    }\n  }\n}\n`;
if (process.argv.includes("--check")) {
  if (await readFile(url, "utf8") !== result) throw new Error("Theme adapter is stale; run tokens/build-themes.mjs");
} else await writeFile(url, result);
