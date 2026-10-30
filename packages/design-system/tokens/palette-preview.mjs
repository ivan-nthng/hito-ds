// HDS-17: local standard-mode preview only; never writes registry or DOM state.
import { generatePalette, paletteGenerationMethod } from "./generate-palette.mjs";
import { referenceColorsById } from "./reference-colors.mjs";
import { contrastRatio, compositeColor } from "./validation-helpers.mjs";

/** @template T @param {T} value @returns {T} */
const freeze = value => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
/** @type {{name: string, light: number|string, dark: number|string, opacity: number}[]} */
const rows = [];
/** @param {string} name @param {number|string} light @param {number|string} dark @param {number} [opacity] */
const add = (name, light, dark, opacity = 1) => rows.push({ name, light, dark, opacity });
for (const lane of ["text", "icon"]) {
  add(`--color-${lane}-accent-default`, 700, 300);
  add(`--color-${lane}-accent-hover`, 800, 200);
}
for (const [index, state] of ["default", "hover", "pressed"].entries()) {
  add(`--color-surface-accent-strong-${state}`, [600, 700, 800][index], [400, 300, 200][index]);
  add(`--button-primary-accent-background-${state}`, [600, 700, 800][index], [400, 300, 200][index]);
  add(`--color-surface-accent-subtle-${state}`, 700, 300, [.08, .12, .16][index]);
}
add("--color-foreground-on-accent-strong", "#FFFFFF", "#201E23");
add("--button-primary-accent-foreground", "#FFFFFF", "#201E23");
add("--color-border-accent-subtle", 700, 300, .24);
add("--color-border-accent-default", 700, 300, .64);
add("--color-border-accent-hover", 800, 200, .8);
add("--button-secondary-accent-border", 700, 300, .32);
// Rebind this alias at the same boundary; inherited custom properties do not recompute.
add("--editable-text-editing-border", 800, 200, .8);
add("--elevation-tint-ambient-accent", 700, 300);
export const palettePreviewMapping = freeze({ version: "hds17-standard/0.1.0", rows });
const activeShades = freeze(Object.fromEntries(paletteGenerationMethod.steps.map(step =>
  [step, referenceColorsById[`color/brand/${step}`].webValue.toUpperCase()])));
const surfaces = freeze({ light: ["#F6F3EE", "#FFFFFF"], dark: ["#0E0C0F", "#201E23", "#353138"] });
const foregrounds = freeze({ light: "#FFFFFF", dark: "#201E23" });
/** @typedef {'light'|'dark'} Scheme
 * @typedef {Record<number,string>} Shades
 * @typedef {{reference:string, color:string, opacity:number}} Role
 * @typedef {{pair:string, ratio:number, minimum:number, pass:boolean}} Check
 * @typedef {{roles:Record<string,Role>, styles:Record<string,string>, changedRoles:{name:string,before:Role,after:Role}[], validation:Check[], verdict:'PASS', fill:Role, foreground:string}} SchemeReport
 * @typedef {{ok:true,mapping:string,seed:string,anchorStep:number,shades:Shades,schemes:Record<Scheme,SchemeReport>,changedShades:{step:number,before:string,after:string}[]}} Preview
 * @typedef {{ok:false,error:{code:string,message:string}}} Failure
 */
/** @param {string} color @param {number} opacity */
const css = (color, opacity) => opacity === 1 ? color : `rgb(from ${color} r g b / ${opacity})`;
/** @param {Shades} shades @param {Scheme} scheme @returns {Record<string,Role>} */
function resolve(shades, scheme) {
  return Object.fromEntries(rows.map(row => [row.name, {
    reference: typeof row[scheme] === "number" ? `brand/${row[scheme]}` : row[scheme],
    color: typeof row[scheme] === "number" ? shades[row[scheme]] : row[scheme], opacity: row.opacity,
  }]));
}
/** @param {Shades} shades @param {Scheme} scheme */
function checks(shades, scheme) {
  /** @type {Check[]} */
  const results = [];
  /** @param {string} pair @param {string|number[]} first @param {string|number[]} second @param {number} minimum */
  const check = (pair, first, second, minimum) => {
    const ratio = contrastRatio(first, second);
    results.push({ pair, ratio, minimum, pass: ratio >= minimum });
  };
  const strong = scheme === "light" ? [600, 700, 800] : [400, 300, 200];
  const text = scheme === "light" ? [700, 800] : [300, 200];
  for (const step of strong) {
    check(`strong ${step}/foreground`, shades[step], foregrounds[scheme], 4.5);
    for (const parent of surfaces[scheme]) check(`selected ${step}/${parent}`, shades[step], parent, 3);
  }
  for (const parent of surfaces[scheme]) {
    for (const step of text) check(`accent text ${step}/${parent}`, shades[step], parent, 4.5);
    for (const [index, opacity] of [.08, .12, .16].entries()) {
      const background = compositeColor(shades[text[0]], parent, opacity);
      const step = text[index === 0 ? 0 : 1];
      check(`soft text ${step}/${parent}/${opacity}`, shades[step], background, 4.5);
    }
    const editing = compositeColor(shades[text[1]], parent, .8);
    check(`editing outer/${parent}`, editing, parent, 3);
    for (const opacity of [.04, .08, .12]) {
      const input = compositeColor(scheme === "light" ? "#201E23" : "#FFFFFF", parent, opacity);
      check(`editing inner/${parent}/${opacity}`, compositeColor(shades[text[1]], input, .8), input, 3);
    }
    check(`focus/${parent}`, scheme === "light" ? "#201E23" : "#FFFFFF", parent, 3);
  }
  return results;
}

/**
 * A rejected candidate retains the exact previous preview object (no partial styles).
 * The default comparison is the active repository Brand map, not generator-template diffs.
 * @param {ReturnType<typeof generatePalette>} candidate
 * @param {Preview | Failure | null} [previous]
 */
export function updatePalettePreview(candidate, previous = null) {
  const next = createPalettePreview(candidate, previous?.ok ? previous : null);
  return freeze({ preview: next.ok ? next : previous, error: next.ok ? null : next.error });
}

/** @param {ReturnType<typeof generatePalette>} candidate @param {Preview|null} [previous] @returns {Preview|Failure} */
export function createPalettePreview(candidate, previous = null) {
  /** @param {string} code @param {string} message @returns {Failure} */
  const fail = (code, message) => freeze({ ok: false, error: { code, message } });
  if (!candidate || candidate.ok !== true) return fail("INVALID_PALETTE", "A successful generator result is required.");
  const canonical = generatePalette(candidate.seed);
  if (!canonical.ok || candidate.algorithm !== canonical.algorithm || candidate.template !== canonical.template ||
      candidate.anchorStep !== canonical.anchorStep || !candidate.shades ||
      paletteGenerationMethod.steps.some(step => candidate.shades[step] !== canonical.shades[step])) {
    return fail("INVALID_PALETTE", "Palette does not match the supported generator result.");
  }
  const schemes = /** @type {Record<Scheme,SchemeReport>} */ ({});
  for (const scheme of /** @type {const} */ (["light", "dark"])) {
    const validation = checks(candidate.shades, scheme);
    const failed = validation.find(result => !result.pass);
    if (failed) return fail("CONTRAST_FAILED", `${scheme}: ${failed.pair} requires ${failed.minimum}:1; got ${failed.ratio.toFixed(3)}:1.`);
    const roles = resolve(candidate.shades, scheme);
    const before = previous?.schemes[scheme].roles ?? resolve(activeShades, scheme);
    const changedRoles = Object.entries(roles).flatMap(([name, after]) =>
      after.color === before[name].color && after.opacity === before[name].opacity ? [] : [{ name, before: before[name], after }]);
    schemes[scheme] = {
      roles, styles: Object.fromEntries(Object.entries(roles).map(([name, role]) => [name, css(role.color, role.opacity)])),
      changedRoles, validation, verdict: "PASS",
      fill: roles["--button-primary-accent-background-default"], foreground: foregrounds[scheme],
    };
  }
  const beforeShades = previous?.shades ?? activeShades;
  return freeze({ ok: true, mapping: palettePreviewMapping.version, seed: candidate.seed, anchorStep: candidate.anchorStep,
    shades: { ...candidate.shades }, schemes,
    changedShades: paletteGenerationMethod.steps.flatMap(step => beforeShades[step] === candidate.shades[step] ? [] :
      [{ step, before: beforeShades[step], after: candidate.shades[step] }]),
  });
}
