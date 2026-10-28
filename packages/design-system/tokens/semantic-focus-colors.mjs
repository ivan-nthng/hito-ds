import { referenceColorsById } from "./reference-colors.mjs";

const focusColorDefinitions = [
  [
    "color/focus/on-light",
    "--color-focus-on-light",
    "color/neutral/950",
    "opaque-dark-focus-indicator-on-a-light-perimeter-surface",
  ],
  [
    "color/focus/on-dark",
    "--color-focus-on-dark",
    "color/basic/white",
    "opaque-light-focus-indicator-on-a-dark-perimeter-surface",
  ],
];

export const semanticFocusColorRoles = Object.freeze(
  focusColorDefinitions.map(([id, cssVariable, referenceId, purpose]) => {
    const reference = referenceColorsById[referenceId];

    if (!reference) {
      throw new Error(`Missing focus color reference: ${referenceId}`);
    }

    return Object.freeze({
      id,
      type: "color",
      kind: "opaque-reference-alias",
      purpose,
      cssVariable,
      referenceId,
      resolvedWebValue: reference.webValue,
      sourceTask: "SAVI-70",
      lifecycle: "admitted",
    });
  }),
);

export const semanticFocusColorRolesById = Object.freeze(
  Object.fromEntries(semanticFocusColorRoles.map((role) => [role.id, role])),
);

export const semanticFocusColorPolicy = Object.freeze({
  mechanism: "outer-outline",
  activation: "focus-visible",
  widthId: "border/width/2",
  offsetSourcePx: 2,
  minimumAdjacentContrast: 3,
  colorSelectionContext: "perimeter-surface-not-control-fill",
  defaultRoleByColorScheme: Object.freeze({
    light: "color/focus/on-light",
    dark: "color/focus/on-dark",
  }),
  strongSurfaceRoleByForegroundReference: Object.freeze({
    "color/basic/white": "color/focus/on-dark",
    "color/neutral/950": "color/focus/on-light",
  }),
  nearestSurfaceOwnsContext: true,
  opacity: "opaque",
  intentSpecificMatrix: "prohibited",
  runtimePixelSampling: "prohibited",
  innerIndicator: "not-admitted",
  shadowRing: "not-admitted",
  outlineGuard: "not-admitted",
  clippingFallback: "deferred-to-proven-component-contract",
  forcedColorsAdapter: "Highlight",
});
