const referenceDefinitions = [
  ["border/width/0", "0", 0, "0"],
  ["border/width/1", "1", 1, "1px"],
  ["border/width/2", "2", 2, "2px"],
];

export const referenceBorderWidths = Object.freeze(
  referenceDefinitions.map(([id, cssSuffix, sourcePx, webValue]) =>
    Object.freeze({
      id,
      type: "dimension",
      sourcePx,
      cssVariable: `--ref-border-width-${cssSuffix}`,
      webValue,
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const referenceBorderWidthsById = Object.freeze(
  Object.fromEntries(referenceBorderWidths.map((token) => [token.id, token])),
);

const semanticDefinitions = [
  ["border/width/default", "default", "border/width/1"],
  ["border/width/strong", "strong", "border/width/2"],
];

export const semanticBorderWidths = Object.freeze(
  semanticDefinitions.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceBorderWidthsById[referenceId];

    if (!reference) {
      throw new Error(`Missing border-width reference: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--border-width-${cssSuffix}`,
      referenceId,
      resolvedSourcePx: reference.sourcePx,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const semanticBorderWidthsById = Object.freeze(
  Object.fromEntries(semanticBorderWidths.map((token) => [token.id, token])),
);

export const focusIndicator = Object.freeze({
  id: "focus/indicator",
  widthId: "border/width/2",
  offsetSourcePx: 2,
  offsetWebValue: "2px",
  cssVariables: Object.freeze({
    width: "--focus-indicator-width",
    offset: "--focus-indicator-offset",
    color: "--focus-indicator-color",
  }),
  activation: "focus-visible",
  colorContract: "light-or-dark-by-perimeter-surface",
  minimumAdjacentContrast: 3,
  forcedColorsAdapter: "Highlight",
});

export const borderFocusPolicy = Object.freeze({
  sizing: "border-box",
  referenceZeroPurpose: "technical-coordinate-not-visible-border-role",
  semanticAbsence: "component-contract-not-global-token",
  structuralDefaultId: "border/width/default",
  structuralStrongId: "border/width/strong",
  viewportResponsive: false,
  componentSizeMatrix: "prohibited",
  componentAliases: "deferred-until-evidenced-component-contract",
  stateChangesStructuralWidth: false,
  focusChangesStructuralWidth: false,
  selectedChangesStructuralWidth: false,
  focusMechanism: "outer-outline",
  forcedColorsMustNotDependOnShadow: true,
  focusShadowRing: "not-admitted",
  focusInnerIndicator: "not-admitted",
  focusOutlineGuard: "not-admitted",
  genericSelectedRing: "not-admitted",
});
