import { referenceColorsById } from "./reference-colors.mjs";

// HITO-001: additive preset; existing registry identities remain authoritative.
const rows = [];
function color(cssVariable, light, dark = light, opacity) {
  const modes = Object.fromEntries(Object.entries({ light, dark }).map(([mode, referenceId]) => {
    const reference = referenceColorsById[`color/${referenceId}`];
    if (!reference) throw new Error(`Unknown theme reference: ${referenceId}`);
    return [mode, { referenceId: reference.id, resolvedWebValue: reference.webValue, opacity: opacity ?? 1,
      webValue: opacity ? `rgb(from var(${reference.cssVariable}) r g b / ${opacity})` : `var(${reference.cssVariable})` }];
  }));
  rows.push({ cssVariable, modes });
}
for (const lane of ["text", "icon"]) {
  color(`--color-${lane}-accent-default`, "brand/700", "brand/300");
  color(`--color-${lane}-accent-hover`, "brand/800", "brand/200");
}
for (const [i, state] of ["default", "hover", "pressed"].entries()) {
  const light = ["brand/600", "brand/700", "brand/800"][i];
  const dark = ["brand/400", "brand/300", "brand/200"][i];
  color(`--color-surface-accent-strong-${state}`, light, dark);
  color(`--button-primary-accent-background-${state}`, light, dark);
  color(`--color-surface-accent-subtle-${state}`, "brand/700", "brand/300", [.08, .12, .16][i]);
}
color("--color-foreground-on-accent-strong", "basic/white", "neutral/950");
color("--button-primary-accent-foreground", "basic/white", "neutral/950");
for (const [state, opacity] of [["subtle", .24], ["default", .64]]) color(`--color-border-accent-${state}`, "brand/700", "brand/300", opacity);
color("--color-border-accent-hover", "brand/800", "brand/200", .8);
color("--button-secondary-accent-border", "brand/700", "brand/300", .32);
export const themePresets = Object.freeze({
  inherited: { id: "inherited", source: "registry.mjs", overrides: [] },
  neutral: { id: "neutral", sourceTask: "HDS-3", overrides: rows,
    aliases: { "--hito-input-rest-border": "--color-border-strong", "--hito-choice-rest-border": "--color-border-strong", "--type-family-display": "--type-family-base", "--editable-text-editing-border": "--color-border-accent-hover" } },
});
export const themeAxes = Object.freeze({ theme: ["neutral", "inherited"], colorScheme: ["light", "dark", "system"], defaultWithoutAttribute: "inherited" });
