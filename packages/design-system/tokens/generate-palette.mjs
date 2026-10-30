// HDS-16: pure local generator. No registry, consumer, role solver or apply adapter.
// Deterministic palette generation for local preview and validation.
// OKLab coefficients: Ottosson's 2021-01-25 linear-sRGB matrices, binary64.
// https://bottosson.github.io/posts/oklab/

const ALGORITHM = "hito-adaptive-oklch-preview/0.1.0";
const TEMPLATE = "hds3-brand-2026-10-29";
const STEPS = Object.freeze([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000]);
// Intentionally independent of mutable reference-colors.mjs.
const STANDARD = Object.freeze([
  "#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6",
  "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A", "#172554", "#0B122B",
]);
const GAMUT_TOLERANCE = 1e-12;
const CHROMA_EPSILON = 1e-7;
const BISECTION_ITERATIONS = 32;

export const paletteGenerationMethod = Object.freeze({
  algorithm: ALGORITHM,
  template: TEMPLATE,
  steps: STEPS,
  inputFormat: "opaque-srgb-hex6",
});

/** @param {string} hex */
function channels(hex) {
  return [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
}

/** @param {number} channel */
function toLinear(channel) {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

/** @param {number} channel */
function toEncoded(channel) {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

/** @param {string} hex */
function toOklch(hex) {
  const [r, g, b] = channels(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bLab = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return Object.freeze([L, Math.hypot(a, bLab), Math.atan2(bLab, a)]);
}

/** @param {number} L @param {number} C @param {number} h */
function toLinearRgb(L, C, h) {
  const a = C * Math.cos(h), b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** @param {number[]} rgb */
function inGamut(rgb) {
  return rgb.every(channel => Number.isFinite(channel) &&
    channel >= -GAMUT_TOLERANCE && channel <= 1 + GAMUT_TOLERANCE);
}

/** @param {number[]} rgb */
function toHex(rgb) {
  // Only called after the gamut guard; clamp numerical boundary residue.
  return "#" + rgb.map(channel => Math.floor(
    Math.max(0, Math.min(1, toEncoded(channel))) * 255 + 0.5,
  ).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** @param {string} hex */
function luminance(hex) {
  const [r, g, b] = channels(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const PROFILE = Object.freeze(STANDARD.map(toOklch));

/** @param {string} code @param {string} message @param {number | undefined} [step] */
function failure(code, message, step) {
  return Object.freeze({
    ok: false,
    algorithm: ALGORITHM,
    template: TEMPLATE,
    error: Object.freeze({ code, message, ...(step === undefined ? {} : { step }) }),
  });
}

/**
 * Generate fixed twelve-step sRGB shades without selecting roles or mutating state.
 * A success is palette validity only, never an accessibility/application verdict.
 * @param {unknown} input Opaque #RRGGBB; no trimming, alpha or color-space coercion.
 */
export function generatePalette(input) {
  if (typeof input !== "string" || input.length !== 7 || !/^#[\da-f]{6}$/i.test(input)) {
    return failure("INVALID_SEED", "Expected an opaque six-digit sRGB #RRGGBB string.");
  }
  const seed = input.toUpperCase();
  const [L, C, h] = toOklch(seed);
  let anchorIndex = 0;
  for (let index = 1; index < STEPS.length; index++) {
    // Strict comparison preserves the lower numerical step on equal distances.
    if (Math.abs(PROFILE[index][0] - L) < Math.abs(PROFILE[anchorIndex][0] - L)) {
      anchorIndex = index;
    }
  }
  const existingIndex = STANDARD.indexOf(seed);
  if (existingIndex >= 0) anchorIndex = existingIndex;
  const [anchorL, anchorC, anchorH] = PROFILE[anchorIndex];
  /** @type {string[]} */
  const values = [];
  /** @type {number[]} */
  const gamutReducedSteps = [];
  for (let index = 0; index < STEPS.length; index++) {
    if (existingIndex >= 0) {
      values.push(STANDARD[index]);
      continue;
    }
    if (index === anchorIndex) {
      values.push(seed); // Never reconstruct or quantize the seed from OKLab.
      continue;
    }
    const [targetL, targetC, targetH] = PROFILE[index];
    const adjustedL = index < anchorIndex
      ? L + (targetL - anchorL) / (1 - anchorL) * (1 - L)
      : L * targetL / anchorL;
    const adjustedC = C < CHROMA_EPSILON ? 0 : Math.min(C, targetC * C / anchorC);
    const adjustedH = h + targetH - anchorH;
    let chroma = adjustedC;
    let rgb = toLinearRgb(adjustedL, chroma, adjustedH);
    if (!inGamut(rgb)) {
      if (!inGamut(toLinearRgb(adjustedL, 0, adjustedH))) {
        return failure("OUT_OF_GAMUT", "No in-gamut color exists on the selected lightness ray.", STEPS[index]);
      }
      let low = 0, high = chroma;
      for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration++) {
        const mid = (low + high) / 2;
        if (inGamut(toLinearRgb(adjustedL, mid, adjustedH))) low = mid;
        else high = mid;
      }
      chroma = low;
      rgb = toLinearRgb(adjustedL, chroma, adjustedH);
      gamutReducedSteps.push(STEPS[index]);
    }
    if (!inGamut(rgb)) {
      return failure("OUT_OF_GAMUT", "The generated shade is outside bounded sRGB.", STEPS[index]);
    }
    values.push(toHex(rgb));
  }
  const seen = new Set();
  let previousLuminance = Infinity;
  for (let index = 0; index < values.length; index++) {
    if (seen.has(values[index])) {
      return failure("DUPLICATE_SHADES", "Quantization cannot produce twelve distinct shades.", STEPS[index]);
    }
    seen.add(values[index]);
    const currentLuminance = luminance(values[index]);
    if (!(currentLuminance < previousLuminance)) {
      return failure("NON_MONOTONIC_SHADES", "Quantized shade luminance is not strictly descending.", STEPS[index]);
    }
    previousLuminance = currentLuminance;
  }
  return Object.freeze({
    ok: true,
    algorithm: ALGORITHM,
    template: TEMPLATE,
    inputSeed: input,
    seed,
    anchorStep: STEPS[anchorIndex],
    shades: Object.freeze(Object.fromEntries(STEPS.map((step, index) => [step, values[index]]))),
    gamutReducedSteps: Object.freeze(gamutReducedSteps),
    changedShades: Object.freeze(STEPS.flatMap((step, index) => values[index] === STANDARD[index]
      ? [] : [Object.freeze({ step, from: STANDARD[index], to: values[index] })])),
  });
}
