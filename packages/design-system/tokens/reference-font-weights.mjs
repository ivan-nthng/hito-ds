const definitions = [
  [400, "Regular"],
  [500, "Medium"],
  [600, "Semi Bold"],
  [700, "Bold"],
];

export const referenceFontWeights = Object.freeze(
  definitions.map(([value, provisionalStyleName]) =>
    Object.freeze({
      id: `font/weight/${value}`,
      cssVariable: `--ref-font-weight-${value}`,
      value,
      webValue: String(value),
      provisionalStyleName,
      status: "stable",
    }),
  ),
);

export const referenceFontWeightsById = Object.freeze(
  Object.fromEntries(referenceFontWeights.map((token) => [token.id, token])),
);

export const semanticFontWeightPolicy = Object.freeze({
  canonicalIdentity: "numeric-weight",
  familyStyleName: "adapter-metadata-only",
  semanticRoleAssignment: "rebindable-alias",
  directComponentValue: "prohibited",
  unsupportedFamilyWeight: "requires-reviewed-adapter-mapping",
});
