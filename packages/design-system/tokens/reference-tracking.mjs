const definitions = [
  ["tight", -0.02, "display-heading"],
  ["slightly-tight", -0.01, "heading"],
  ["normal", 0, "body-and-interface"],
  ["wide", 0.02, "short-label"],
  ["wider", 0.04, "special-short-label"],
  ["caps", 0.08, "short-uppercase-eyebrow"],
  ["expanded", 0.12, "restricted-legacy-uppercase"],
];

function formatEm(value) {
  return value === 0 ? "0" : `${value}em`;
}

export const referenceTracking = Object.freeze(
  definitions.map(([name, valueEm, intendedUse]) =>
    Object.freeze({
      id: `font/tracking/${name}`,
      cssVariable: `--ref-font-tracking-${name}`,
      valueEm,
      webValue: formatEm(valueEm),
      intendedUse,
      status: name === "expanded" ? "restricted" : "stable",
    }),
  ),
);

export const referenceTrackingById = Object.freeze(
  Object.fromEntries(referenceTracking.map((token) => [token.id, token])),
);

export const trackingPolicy = Object.freeze({
  unit: "em",
  defaultReferenceId: "font/tracking/normal",
  expandedAllowedFor: "short-uppercase-legacy-or-reviewed-display-only",
  prohibitedExpandedUses: Object.freeze([
    "body",
    "long-localized-copy",
    "technical-data",
    "accessibility-critical-label",
  ]),
  semanticRoleAssignment: "rebindable-alias",
  directComponentValue: "prohibited",
});
