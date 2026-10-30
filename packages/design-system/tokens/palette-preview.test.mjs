import test from "node:test";
import assert from "node:assert/strict";
import { generatePalette } from "./generate-palette.mjs";
import { createPalettePreview, updatePalettePreview, palettePreviewMapping } from "./palette-preview.mjs";
import { themePresets } from "./themes.mjs";
import { compositeColor, contrastRatio } from "./validation-helpers.mjs";

test("standard blue is a no-op against active roles, in both schemes", () => {
  const preview = createPalettePreview(generatePalette("#2563EB"));
  assert.equal(preview.ok, true);
  assert.deepEqual(preview.changedShades, []);
  for (const scheme of ["light", "dark"]) {
    assert.deepEqual(preview.schemes[scheme].changedRoles, []);
    assert.ok(preview.schemes[scheme].validation.every(check => check.pass));
  }
});

test("frozen map preserves existing neutral semantic assignments, including editing alias", () => {
  const blue = createPalettePreview(generatePalette("#2563EB"));
  for (const row of themePresets.neutral.overrides) for (const scheme of ["light", "dark"]) {
    const actual = blue.schemes[scheme].roles[row.cssVariable];
    const expected = row.modes[scheme];
    assert.equal(actual.color, expected.resolvedWebValue.toUpperCase(), row.cssVariable);
    assert.equal(actual.opacity, expected.opacity, row.cssVariable);
  }
  for (const scheme of ["light", "dark"]) assert.deepEqual(
    blue.schemes[scheme].roles["--editable-text-editing-border"], blue.schemes[scheme].roles["--color-border-accent-hover"]);
  assert.ok(Object.isFrozen(palettePreviewMapping.rows[0]));
});

test("yellow and ink keep exact shades, correct seed step and unmodified standard role choices", () => {
  for (const [seed, step] of [["#FACC15", 200], ["#111827", 1000]]) {
    const generated = generatePalette(seed), preview = createPalettePreview(generated);
    assert.equal(preview.ok, true);
    assert.deepEqual(preview.shades, generated.shades);
    assert.equal(preview.anchorStep, step);
    assert.equal(preview.changedShades.length, 12);
    for (const [scheme, fill, foreground] of [["light", 600, "#FFFFFF"], ["dark", 400, "#201E23"]]) {
      const report = preview.schemes[scheme];
      assert.equal(report.fill.color, generated.shades[fill]);
      assert.equal(report.foreground, foreground);
      assert.equal(report.changedRoles.length, 19);
      assert.ok(report.validation.every(check => check.ratio >= check.minimum));
      assert.ok(Object.isFrozen(report.styles));
      assert.ok(Object.isFrozen(report.changedRoles[0].after));
    }
  }
});

test("transition diff uses actual previous configuration, not generator template", () => {
  const yellow = createPalettePreview(generatePalette("#FACC15"));
  const ink = updatePalettePreview(generatePalette("#111827"), yellow).preview;
  assert.equal(ink.changedShades.find(row => row.step === 600).before, "#7B6D00");
  assert.equal(ink.schemes.light.changedRoles.find(row => row.name === "--button-primary-accent-background-default").before.color, "#7B6D00");
  const repeated = updatePalettePreview(generatePalette("#111827"), ink).preview;
  assert.deepEqual(repeated.changedShades, []);
  assert.deepEqual(repeated.schemes.dark.changedRoles, []);
});

test("failed generation, forged success and unsupported contrast retain exact last valid preview", () => {
  const previous = createPalettePreview(generatePalette("#FACC15"));
  const blue = generatePalette("#2563EB");
  for (const candidate of [generatePalette("bad"), { ...blue, shades: { ...blue.shades, 600: "#FFFFFF" } }, generatePalette("#003366")]) {
    const rejected = updatePalettePreview(candidate, previous);
    assert.strictEqual(rejected.preview, previous);
    assert.ok(rejected.error.message.length < 180);
    assert.equal("styles" in rejected, false);
  }
  const unsupported = updatePalettePreview(generatePalette("#003366"), previous);
  assert.equal(unsupported.error.code, "CONTRAST_FAILED");
  assert.match(unsupported.error.message, /4\.408/);
  assert.equal(updatePalettePreview(generatePalette("bad")).preview, null);
});

test("editing check composes edge and pressed input over raised parent before comparing", () => {
  const generated = generatePalette("#FACC15");
  const preview = createPalettePreview(generated);
  const pair = preview.schemes.dark.validation.find(check => check.pair === "editing inner/#353138/0.12");
  const input = compositeColor("#FFFFFF", "#353138", .12);
  assert.equal(pair.ratio, contrastRatio(compositeColor(generated.shades[200], input, .8), input));
  assert.ok(pair.ratio >= 3);
});

test("only accent roles and editing alias are scoped; no protected values or global refs", () => {
  const preview = createPalettePreview(generatePalette("#111827"));
  for (const scheme of ["light", "dark"]) {
    const names = Object.keys(preview.schemes[scheme].styles);
    assert.ok(names.every(name => name.includes("accent") || name === "--editable-text-editing-border"));
    assert.equal(names.some(name => /ref-color|error|disabled|focus|logo/.test(name)), false);
    assert.ok(Object.isFrozen(preview.schemes[scheme].validation));
  }
});
