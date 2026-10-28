import { readFile } from "node:fs/promises";

import {
  colorScaleSteps,
  referenceBasicColors,
  referenceColorFamilies,
  referenceColors,
} from "./reference-colors.mjs";
import {
  alphaCompositionContract,
  referenceOpacity,
  referenceOpacityById,
} from "./reference-opacity.mjs";
import {
  assert,
  compositeColor,
  contrastRatio,
} from "./validation-helpers.mjs";

const EXPECTED_FAMILIES = Object.freeze([
  "neutral",
  "blue",
  "green",
  "red",
  "orange",
  "brand",
  "pink",
  "yellow",
]);
const EXPECTED_ANCHORS = Object.freeze({
  "color/neutral/50": "#F6F3EE",
  "color/neutral/700": "#615B63",
  "color/blue/500": "#12ABFE",
  "color/green/500": "#2FBC56",
  "color/red/500": "#F94047",
  "color/orange/500": "#F6843C",
  "color/brand/500": "#F4A34B",
  "color/pink/300": "#FEAFD7",
  "color/yellow/500": "#FEBB05",
});
const CONTRAST_CASES = Object.freeze([
  [
    "default text on light reference surface",
    "color/neutral/700",
    "color/neutral/50",
    4.5,
  ],
  [
    "enhanced text on light reference surface",
    "color/neutral/800",
    "color/neutral/50",
    7,
  ],
  [
    "default text on dark reference surface",
    "color/neutral/50",
    "color/neutral/1000",
    7,
  ],
  [
    "blue foreground on light reference surface",
    "color/blue/700",
    "color/neutral/50",
    4.5,
  ],
  [
    "green foreground on light reference surface",
    "color/green/700",
    "color/neutral/50",
    4.5,
  ],
  [
    "red foreground on light reference surface",
    "color/red/700",
    "color/neutral/50",
    4.5,
  ],
  [
    "orange foreground on light reference surface",
    "color/orange/700",
    "color/neutral/50",
    4.5,
  ],
  [
    "brand foreground on light reference surface",
    "color/brand/800",
    "color/neutral/50",
    4.5,
  ],
  [
    "pink foreground on light reference surface",
    "color/pink/800",
    "color/neutral/50",
    7,
  ],
  [
    "yellow foreground on light reference surface",
    "color/yellow/800",
    "color/neutral/50",
    4.5,
  ],
  ["white on blue fill", "color/basic/white", "color/blue/700", 4.5],
  ["white on green fill", "color/basic/white", "color/green/700", 4.5],
  ["white on red fill", "color/basic/white", "color/red/700", 4.5],
  ["white on orange fill", "color/basic/white", "color/orange/700", 4.5],
  ["white on brand fill", "color/basic/white", "color/brand/800", 4.5],
  ["white on pink fill", "color/basic/white", "color/pink/700", 4.5],
  ["white on yellow fill", "color/basic/white", "color/yellow/800", 4.5],
  [
    "white content on accepted light success button default fill",
    "color/basic/white",
    "color/green/500",
    2.4,
  ],
  [
    "white content on accepted light success button hover fill",
    "color/basic/white",
    "color/green/600",
    3,
  ],
  [
    "white content on accepted light success button pressed fill",
    "color/basic/white",
    "color/green/700",
    4.5,
  ],
  [
    "white content on destructive button default fill",
    "color/basic/white",
    "color/red/600",
    4.5,
  ],
  [
    "white content on destructive button hover fill",
    "color/basic/white",
    "color/red/700",
    4.5,
  ],
  [
    "white content on destructive button pressed fill",
    "color/basic/white",
    "color/red/800",
    4.5,
  ],
]);
const COMPOSITE_CONTRAST_CASES = Object.freeze([
  [
    "success content on its subtle light canvas surface",
    "color/green/700",
    "color/neutral/50",
    "opacity/8",
    4.5,
  ],
  [
    "success content on its subtle dark canvas surface",
    "color/green/300",
    "color/neutral/1000",
    "opacity/8",
    4.5,
  ],
  [
    "destructive content on its subtle light canvas surface",
    "color/red/700",
    "color/neutral/50",
    "opacity/8",
    4.5,
  ],
  [
    "destructive content on its subtle dark canvas surface",
    "color/red/300",
    "color/neutral/1000",
    "opacity/8",
    4.5,
  ],
]);
const RETIRED_SCAFFOLD_MARKERS = Object.freeze([
  "--ref-color-neutral-0",
  "--ref-color-accent-500",
  "--ref-color-accent-600",
  "--ref-color-critical-600",
  "--ref-opacity-muted",
  "#4f46e5",
  "#4338ca",
  "#c81e1e",
]);

function parseHex(value) {
  return [1, 3, 5].map(
    (offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255,
  );
}

function linearize(channel) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function oklabLightness(value) {
  const [red, green, blue] = parseHex(value).map(linearize);
  const l = 0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue;
  const m = 0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue;
  const s = 0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue;

  return (
    0.2104542553 * Math.cbrt(l) +
    0.793617785 * Math.cbrt(m) -
    0.0040720468 * Math.cbrt(s)
  );
}

function parseCssCustomProperties(css) {
  return new Map(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/giu)].map((match) => [
      match[1],
      match[2].trim(),
    ]),
  );
}

assert(
  colorScaleSteps.join(",") ===
    "50,100,200,300,400,500,600,700,800,900,950,1000",
  "Color scale steps do not match the accepted 50-1000 contract",
);
assert(
  referenceColorFamilies.length === 8,
  "Expected exactly eight color families",
);
assert(referenceBasicColors.length === 2, "Expected exactly two Basic colors");
assert(
  referenceColors.length === 98,
  "Expected 96 scale colors plus two Basic colors",
);
assert(
  referenceOpacity.length === 11,
  "Expected exactly eleven opacity tokens",
);
assert(
  referenceColorFamilies.map((family) => family.family).join(",") ===
    EXPECTED_FAMILIES.join(","),
  "Color family order or identity drifted",
);

const colorIds = referenceColors.map((token) => token.id);
const colorValues = referenceColors.map((token) => token.value);
assert(
  new Set(colorIds).size === colorIds.length,
  "Duplicate reference color identity",
);
assert(
  new Set(colorValues).size === colorValues.length,
  "Duplicate reference color value",
);
assert(
  referenceColors.every((token) => /^#[0-9A-F]{6}$/u.test(token.value)),
  "Reference colors must be uppercase six-digit sRGB hex values",
);

for (const family of referenceColorFamilies) {
  assert(
    family.tokens.length === 12,
    `${family.id} must contain exactly twelve steps`,
  );
  const lightness = family.tokens.map((token) => oklabLightness(token.value));

  for (let index = 1; index < lightness.length; index += 1) {
    assert(
      lightness[index - 1] > lightness[index],
      `${family.id} must have strictly decreasing perceptual lightness`,
    );
  }
}

const colorsById = Object.fromEntries(
  referenceColors.map((token) => [token.id, token]),
);
for (const [id, value] of Object.entries(EXPECTED_ANCHORS)) {
  assert(colorsById[id]?.value === value, `Accepted anchor drifted: ${id}`);
  assert(
    colorsById[id]?.anchor !== null,
    `Accepted anchor metadata missing: ${id}`,
  );
}
for (const [
  context,
  foregroundId,
  backgroundId,
  minimumRatio,
] of CONTRAST_CASES) {
  const foreground = colorsById[foregroundId]?.value;
  const background = colorsById[backgroundId]?.value;
  assert(
    foreground && background,
    `Contrast pair references a missing color: ${context}`,
  );
  assert(
    contrastRatio(foreground, background) >= minimumRatio,
    `Contrast pair fails its named threshold: ${context}`,
  );
}
for (const [
  context,
  foregroundId,
  backgroundId,
  opacityId,
  minimumRatio,
] of COMPOSITE_CONTRAST_CASES) {
  const foreground = colorsById[foregroundId]?.value;
  const background = colorsById[backgroundId]?.value;
  const opacity = referenceOpacityById[opacityId]?.value;
  assert(
    foreground && background && opacity,
    `Composite contrast pair references a missing token: ${context}`,
  );
  assert(
    contrastRatio(
      foreground,
      compositeColor(foreground, background, opacity),
    ) >= minimumRatio,
    `Composite contrast pair fails its named threshold: ${context}`,
  );
}

const opacityIds = referenceOpacity.map((token) => token.id);
const opacityValues = referenceOpacity.map((token) => token.value);
assert(
  new Set(opacityIds).size === opacityIds.length,
  "Duplicate opacity identity",
);
assert(
  new Set(opacityValues).size === opacityValues.length,
  "Duplicate opacity value",
);
assert(
  opacityValues[0] === 0 && opacityValues.at(-1) === 1,
  "Opacity scale must span 0 through 1",
);
assert(
  opacityValues.every(
    (value, index) => index === 0 || opacityValues[index - 1] < value,
  ),
  "Opacity scale must be strictly increasing",
);
assert(
  alphaCompositionContract.canonicalFlattenedRgbaAllowed === false,
  "Flattened RGBA must not become canonical alpha truth",
);

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
const cssProperties = parseCssCustomProperties(css);
for (const token of [...referenceColors, ...referenceOpacity]) {
  assert(
    cssProperties.get(token.cssVariable)?.toUpperCase() ===
      token.webValue.toUpperCase(),
    `CSS adapter drifted: ${token.cssVariable}`,
  );
}
assert(
  !/#[0-9A-F]{8}\b/iu.test(css),
  "Canonical CSS adapter must not flatten alpha into hex8",
);
for (const marker of RETIRED_SCAFFOLD_MARKERS) {
  assert(!css.includes(marker), `Retired scaffold color remains: ${marker}`);
}

console.log(
  [
    "SAVI-70 color registry validation PASS",
    `families=${referenceColorFamilies.length}`,
    `scaleColors=${referenceColorFamilies.length * colorScaleSteps.length}`,
    `basicColors=${referenceBasicColors.length}`,
    `anchors=${Object.keys(EXPECTED_ANCHORS).length}`,
    `contrastPairs=${CONTRAST_CASES.length}`,
    `compositeContrastPairs=${COMPOSITE_CONTRAST_CASES.length}`,
    `opacity=${referenceOpacity.length}`,
    "cssParity=PASS",
    "flattenedAlpha=ABSENT",
    "retiredScaffold=ABSENT",
  ].join(" "),
);
