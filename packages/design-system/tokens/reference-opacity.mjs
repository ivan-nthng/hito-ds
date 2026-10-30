const definitions = /** @type {const} */ ([
  ["opacity/0", "0", 0],
  ["opacity/4", "4", 0.04],
  ["opacity/8", "8", 0.08],
  ["opacity/12", "12", 0.12],
  ["opacity/16", "16", 0.16],
  ["opacity/24", "24", 0.24],
  ["opacity/32", "32", 0.32],
  ["opacity/48", "48", 0.48],
  ["opacity/64", "64", 0.64],
  ["opacity/80", "80", 0.8],
  ["opacity/100", "100", 1],
]);

export const referenceOpacity = Object.freeze(
  definitions.map(([id, cssSuffix, value]) =>
    Object.freeze({
      id,
      type: "number",
      value,
      cssVariable: `--ref-opacity-${cssSuffix}`,
      webValue: String(value),
      sourceTask: "SAVI-70",
      lifecycle: "admitted",
    }),
  ),
);

export const referenceOpacityById = Object.freeze(
  Object.fromEntries(referenceOpacity.map((token) => [token.id, token])),
);

export const alphaCompositionContract = Object.freeze({
  type: "color-with-opacity",
  colorInput: "reference-or-semantic-color-alias",
  opacityInput: "reference-opacity-alias",
  canonicalFlattenedRgbaAllowed: false,
  derivedAdaptersMustRetainBothInputs: true,
});
