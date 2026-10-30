import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { generatePalette, paletteGenerationMethod } from "./generate-palette.mjs";

// Accepted HDS-31 golden outputs, independent of mutable installed palettes.
const BLUE = ["#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A", "#172554", "#0B122B"];
const YELLOW = ["#FEF3D3", "#FAE49A", "#FACC15", "#E3B400", "#BC9900", "#978200", "#7B6D00", "#685E00", "#544D00", "#474100", "#2C2900", "#151400"];
const INK = ["#F1F6FB", "#E0EAF6", "#CADBEE", "#B2C4D6", "#96A7B8", "#7D8B9D", "#687486", "#596476", "#485264", "#3C4657", "#252D3E", "#111827"];
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];

// WCAG luminance independently checks quantized output, not generator internals.
function luminance(hex) {
  const rgb = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [r, g, b] = rgb.map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function assertValid(seed) {
  const result = generatePalette(seed);
  assert.equal(result.ok, true, `${seed}: ${JSON.stringify(result)}`);
  if (!result.ok) throw new Error("Expected success");
  assert.equal(result.seed, seed.toUpperCase());
  assert.equal(result.inputSeed, seed);
  assert.equal(result.shades[result.anchorStep], seed.toUpperCase(), "exact seed bytes at selected step");
  assert.deepEqual(Object.keys(result.shades).map(Number), STEPS);
  const shades = Object.values(result.shades);
  assert.equal(new Set(shades).size, 12);
  let previous = Infinity;
  for (const hex of shades) {
    assert.match(hex, /^#[0-9A-F]{6}$/);
    assert.ok(luminance(hex) < previous, `${seed}: strict luminance order`);
    previous = luminance(hex);
  }
  assert.deepEqual(result.changedShades, STEPS.flatMap((step, i) => shades[i] === BLUE[i]
    ? [] : [{ step, from: BLUE[i], to: shades[i] }]));
  assert.ok(result.gamutReducedSteps.every(step => STEPS.includes(step) && step !== result.anchorStep));
  return result;
}

for (const [seed, anchor, expected] of [
  ["#2563EB", 600, BLUE], ["#FACC15", 200, YELLOW], ["#111827", 1000, INK],
]) {
  test(`accepted ${seed} preserves all twelve exact shades and placement`, () => {
    const result = assertValid(seed);
    assert.equal(result.anchorStep, anchor);
    assert.deepEqual(Object.values(result.shades), expected);
    assert.equal(result.changedShades.length, seed === "#2563EB" ? 0 : 12);
  });
}

test("all frozen standard shades are idempotent, not regenerated", () => {
  BLUE.forEach((seed, i) => {
    const result = assertValid(seed);
    assert.equal(result.anchorStep, STEPS[i]);
    assert.deepEqual(Object.values(result.shades), BLUE);
    assert.deepEqual(result.changedShades, []);
    assert.deepEqual(result.gamutReducedSteps, []);
  });
});

test("black/white, achromatic and one-channel precision boundaries retain their seed", () => {
  const anchors = { "#000000": 1000, "#FFFFFF": 50, "#808080": 500, "#777777": 600, "#010101": 1000, "#FEFEFE": 50 };
  for (const [seed, step] of Object.entries(anchors)) {
    const result = assertValid(seed);
    assert.equal(result.anchorStep, step);
    assert.ok(Object.values(result.shades).every(hex => hex.slice(1, 3) === hex.slice(3, 5) && hex.slice(3, 5) === hex.slice(5, 7)));
  }
  for (const seed of ["#FFFFFE", "#FEFFFF", "#FFFEFF", "#000001", "#000100", "#010000", "#0A0A0A", "#0B0B0B"]) assertValid(seed);
});

test("saturated seeds use bounded chroma reduction without moving or clipping the seed", () => {
  for (const seed of ["#FF0000", "#00FF00", "#0000FF", "#00FFFF", "#FF00FF", "#FFFF00"]) {
    assert.ok(assertValid(seed).gamutReducedSteps.length > 0);
  }
  assert.deepEqual(assertValid("#FACC15").gamutReducedSteps, [300, 400, 500, 600, 700, 800, 900, 950, 1000]);
});

test("bounded RGB boundary grid is deterministic and never returns a partial scale", () => {
  for (const r of [0, 1, 127, 254, 255]) for (const g of [0, 1, 127, 254, 255]) for (const b of [0, 1, 127, 254, 255]) {
    const seed = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0")).join("");
    const first = assertValid(seed);
    assert.deepEqual(generatePalette(seed), first);
  }
});

test("normalization preserves original input while reporting exact canonical color", () => {
  const result = assertValid("#faCc15");
  assert.equal(result.inputSeed, "#faCc15");
  assert.equal(result.shades[200], "#FACC15");
});

test("invalid types, alpha, wide-gamut and extra precision are explicit bounded failures", () => {
  const invalid = [undefined, null, 123, NaN, Infinity, true, {}, [], new String("#2563EB"),
    "", "2563EB", "#ABC", "#2563EB80", "#GGGGGG", " #2563EB", "#2563EB ", "#2563EB\n",
    "rgb(37 99 235)", "color(display-p3 1 0 0)", "color(srgb 0.1 0.2 0.3)", "#" + "F".repeat(10000)];
  for (const input of invalid) {
    const result = generatePalette(input);
    assert.equal(result.ok, false);
    if (result.ok) throw new Error("Expected failure");
    assert.equal(result.error.code, "INVALID_SEED");
    assert.equal("shades" in result, false);
    assert.equal("anchorStep" in result, false);
    assert.ok(result.error.message.length < 100);
    assert.deepEqual(generatePalette(input), result);
  }
});

test("no input coercion, caller mutation or shared mutable result/template state", () => {
  const callerState = Object.freeze({ seed: "#2563EB", toString() { throw new Error("must not coerce"); } });
  const previous = assertValid("#111827");
  const receipt = JSON.stringify(previous);
  assert.equal(generatePalette(callerState).ok, false);
  assert.equal(callerState.seed, "#2563EB");
  assert.throws(() => { previous.shades[50] = "#000000"; }, TypeError);
  assert.throws(() => { previous.changedShades[0].to = "#000000"; }, TypeError);
  assert.throws(() => { previous.gamutReducedSteps.push(50); }, TypeError);
  assert.throws(() => { paletteGenerationMethod.steps.push(1); }, TypeError);
  assert.throws(() => { paletteGenerationMethod.template = "other"; }, TypeError);
  assert.equal(JSON.stringify(previous), receipt);
  assert.deepEqual(generatePalette("#111827"), previous);
  assert.deepEqual(paletteGenerationMethod, {
    algorithm: "hito-adaptive-oklch-preview/0.1.0", template: "hds3-brand-2026-10-29", steps: STEPS, inputFormat: "opaque-srgb-hex6",
  });
});

test("module runs in isolation without installed registry or mutable Brand imports", async () => {
  const source = await readFile(new URL("./generate-palette.mjs", import.meta.url));
  const isolated = await import(`data:text/javascript;base64,${source.toString("base64")}`);
  for (const seed of ["#2563EB", "#FACC15", "#111827"]) {
    assert.deepEqual(isolated.generatePalette(seed), generatePalette(seed));
  }
});
