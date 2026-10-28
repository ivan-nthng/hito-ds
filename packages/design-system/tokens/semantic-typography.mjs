import { referenceFontWeightsById } from "./reference-font-weights.mjs";
import { referenceSpacingById } from "./reference-spacing.mjs";
import { referenceTrackingById } from "./reference-tracking.mjs";
import { semanticFontFamiliesById } from "./semantic-font-families.mjs";

const emphasisDefinitions = [
  ["typography/emphasis/regular", "type-emphasis-regular", "font/weight/400"],
  ["typography/emphasis/medium", "type-emphasis-medium", "font/weight/500"],
  ["typography/emphasis/strong", "type-emphasis-strong", "font/weight/600"],
  ["typography/emphasis/bold", "type-emphasis-bold", "font/weight/700"],
];

export const typographyEmphasis = Object.freeze(
  emphasisDefinitions.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceFontWeightsById[referenceId];

    if (!reference) {
      throw new Error(`Missing reference font-weight token: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--${cssSuffix}`,
      referenceId,
      resolvedValue: reference.value,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const typographyEmphasisById = Object.freeze(
  Object.fromEntries(typographyEmphasis.map((token) => [token.id, token])),
);

export const typographyPurposeLanes = Object.freeze([
  Object.freeze({ id: "typography/ui", purpose: "interactive-control-content" }),
  Object.freeze({ id: "typography/body", purpose: "prose-and-descriptive-content" }),
  Object.freeze({ id: "typography/heading", purpose: "interface-content-hierarchy" }),
  Object.freeze({ id: "typography/label", purpose: "external-label-and-short-metadata" }),
  Object.freeze({ id: "typography/technical", purpose: "design-system-and-technical-identifiers" }),
  Object.freeze({ id: "typography/data", purpose: "tabular-values-identifiers-and-alignment-sensitive-data" }),
  Object.freeze({ id: "typography/display", purpose: "expressive-landing-and-client-content" }),
]);

const fixedMetricDefinitions = [
  ["typography/ui/sm", "type-ui-sm", "space/3", "space/4", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/ui/md", "type-ui-md", "space/3.5", "space/5", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/ui/lg", "type-ui-lg", "space/4", "space/6", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/ui/xl", "type-ui-xl", "space/5", "space/7", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/label/sm", "type-label-sm", "space/3", "space/4", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/label/base", "type-label-base", "space/3.5", "space/5", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/label/lg", "type-label-lg", "space/4", "space/6", "font/tracking/normal", "typography/emphasis/medium"],
  ["typography/label/eyebrow", "type-label-eyebrow", "space/2.5", "space/3", "font/tracking/caps", "typography/emphasis/strong"],
  ["typography/body/sm", "type-body-sm", "space/3.5", "space/5", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/body/base", "type-body-base", "space/4", "space/6", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/body/md", "type-body-md", "space/5", "space/7", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/body/lg", "type-body-lg", "space/6", "space/9", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/heading/sm", "type-heading-sm", "space/5", "space/6", "font/tracking/slightly-tight", "typography/emphasis/strong"],
  ["typography/heading/base", "type-heading-base", "space/6", "space/8", "font/tracking/slightly-tight", "typography/emphasis/strong"],
  ["typography/heading/md", "type-heading-md", "space/7", "space/9", "font/tracking/slightly-tight", "typography/emphasis/strong"],
  ["typography/heading/lg", "type-heading-lg", "space/8", "space/9", "font/tracking/slightly-tight", "typography/emphasis/strong"],
  ["typography/heading/xl", "type-heading-xl", "space/10", "space/11", "font/tracking/slightly-tight", "typography/emphasis/strong"],
  ["typography/technical/sm", "type-technical-sm", "space/3", "space/4", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/data/sm", "type-data-sm", "space/3", "space/4", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/data/base", "type-data-base", "space/3.5", "space/5", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/data/lg", "type-data-lg", "space/4", "space/6", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/display/subtitle", "type-display-subtitle", "space/6", "space/8", "font/tracking/normal", "typography/emphasis/regular"],
  ["typography/display/eyebrow", "type-display-eyebrow", "space/3", "space/4", "font/tracking/caps", "typography/emphasis/strong"],
];

export const typographyViewportModes = Object.freeze([
  Object.freeze({ id: "sm", minWidthSourcePx: 0, minWidthWebValue: null }),
  Object.freeze({ id: "md", minWidthSourcePx: 640, minWidthWebValue: "40rem" }),
  Object.freeze({ id: "lg", minWidthSourcePx: 1024, minWidthWebValue: "64rem" }),
  Object.freeze({ id: "xl", minWidthSourcePx: 1280, minWidthWebValue: "80rem" }),
]);

const responsiveMetricDefinitions = [
  [
    "typography/display/hero",
    "type-display-hero",
    "fluid",
    "font/tracking/tight",
    "typography/emphasis/strong",
    [
      ["space/10", "space/12"],
      ["space/12", "space/14"],
      ["space/14", "space/16"],
      ["space/16", "space/16"],
    ],
  ],
  [
    "typography/display/section",
    "type-display-section",
    "responsive",
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
    [
      ["space/8", "space/10"],
      ["space/10", "space/12"],
      ["space/12", "space/14"],
      ["space/12", "space/14"],
    ],
  ],
];

const familySlotByMetricLane = Object.freeze({
  "typography/ui": "font/family/base",
  "typography/label": "font/family/display",
  "typography/body": "font/family/base",
  "typography/heading": "font/family/display",
  "typography/technical": "font/family/base",
  "typography/data": "font/family/mono",
  "typography/display": "font/family/display",
});

function createFixedMetricRole([
  id,
  cssSuffix,
  fontSizeReferenceId,
  lineHeightReferenceId,
  trackingReferenceId,
  defaultEmphasisId,
]) {
  const fontSize = referenceSpacingById[fontSizeReferenceId];
  const lineHeight = referenceSpacingById[lineHeightReferenceId];
  const tracking = referenceTrackingById[trackingReferenceId];
  const emphasis = typographyEmphasisById[defaultEmphasisId];
  const metricLaneId = id.split("/").slice(0, 2).join("/");
  const familySlotId = familySlotByMetricLane[metricLaneId];
  const familySlot = semanticFontFamiliesById[familySlotId];

  if (!fontSize || !lineHeight || !tracking || !emphasis || !familySlot) {
    throw new Error(`Typography metric role has a missing alias: ${id}`);
  }

  return Object.freeze({
    id,
    cssVariables: Object.freeze({
      fontSize: `--${cssSuffix}-font-size`,
      lineHeight: `--${cssSuffix}-line-height`,
      letterSpacing: `--${cssSuffix}-letter-spacing`,
      defaultFontWeight: `--${cssSuffix}-font-weight`,
    }),
    fontSizeReferenceId,
    lineHeightReferenceId,
    trackingReferenceId,
    defaultEmphasisId,
    familySlotId,
    familyCssVariable: familySlot.cssVariable,
    resolvedSourcePx: Object.freeze({
      fontSize: fontSize.sourcePx,
      lineHeight: lineHeight.sourcePx,
    }),
    resolvedWeb: Object.freeze({
      fontSize: fontSize.webValue,
      lineHeight: Number((lineHeight.sourcePx / fontSize.sourcePx).toFixed(4)).toString(),
      letterSpacing: tracking.webValue,
      defaultFontWeight: emphasis.resolvedWebValue,
    }),
    viewportPolicy: "fixed",
    familySlotStatus: "active-replaceable-adapter",
  });
}

function createResponsiveMetricRole([
  id,
  cssSuffix,
  viewportPolicy,
  trackingReferenceId,
  defaultEmphasisId,
  modeReferencePairs,
]) {
  const tracking = referenceTrackingById[trackingReferenceId];
  const emphasis = typographyEmphasisById[defaultEmphasisId];
  const familySlotId = "font/family/display";
  const familySlot = semanticFontFamiliesById[familySlotId];

  if (!tracking || !emphasis || !familySlot) {
    throw new Error(`Responsive typography role has a missing alias: ${id}`);
  }

  const modes = Object.fromEntries(
    typographyViewportModes.map((mode, index) => {
      const [fontSizeReferenceId, lineHeightReferenceId] = modeReferencePairs[index];
      const fontSize = referenceSpacingById[fontSizeReferenceId];
      const lineHeight = referenceSpacingById[lineHeightReferenceId];

      if (!fontSize || !lineHeight) {
        throw new Error(`Responsive typography mode has a missing metric alias: ${id}/${mode.id}`);
      }

      return [
        mode.id,
        Object.freeze({
          fontSizeReferenceId,
          lineHeightReferenceId,
          resolvedSourcePx: Object.freeze({
            fontSize: fontSize.sourcePx,
            lineHeight: lineHeight.sourcePx,
          }),
        }),
      ];
    }),
  );

  return Object.freeze({
    id,
    cssVariables: Object.freeze({
      fontSize: `--${cssSuffix}-font-size`,
      lineHeight: `--${cssSuffix}-line-height`,
      letterSpacing: `--${cssSuffix}-letter-spacing`,
      defaultFontWeight: `--${cssSuffix}-font-weight`,
    }),
    modes: Object.freeze(modes),
    trackingReferenceId,
    defaultEmphasisId,
    familySlotId,
    familyCssVariable: familySlot.cssVariable,
    resolvedWeb: Object.freeze({
      letterSpacing: tracking.webValue,
      defaultFontWeight: emphasis.resolvedWebValue,
    }),
    viewportPolicy,
    familySlotStatus: "active-replaceable-adapter",
  });
}

export const typographyFixedMetricRoles = Object.freeze(
  fixedMetricDefinitions.map(createFixedMetricRole),
);

export const typographyResponsiveMetricRoles = Object.freeze(
  responsiveMetricDefinitions.map(createResponsiveMetricRole),
);

export const typographyMetricRoles = Object.freeze([
  ...typographyFixedMetricRoles,
  ...typographyResponsiveMetricRoles,
]);

export const typographyMetricRolesById = Object.freeze(
  Object.fromEntries(typographyMetricRoles.map((role) => [role.id, role])),
);

export const semanticTypographyPolicy = Object.freeze({
  headingTerm: "heading",
  rejectedHeadingTerm: "header",
  technicalLane: "typography/technical",
  currentTechnicalLane: "typography/technical",
  admittedMetricLanes: Object.freeze([
    "typography/ui",
    "typography/label",
    "typography/body",
    "typography/heading",
    "typography/technical",
    "typography/data",
    "typography/display",
  ]),
  deferredMetricLanes: Object.freeze([]),
  responsiveRoleIds: Object.freeze([
    "typography/display/hero",
    "typography/display/section",
  ]),
  fluidRoleIds: Object.freeze(["typography/display/hero"]),
  emphasisComposition: "independent-from-metrics",
  cartesianStyleGeneration: "prohibited",
  directComponentReferenceConsumption: "prohibited",
});

export const semanticLineHeightPolicy = Object.freeze({
  canonicalReferences: "direct-space-primitives",
  figmaAdapter: "pixels",
  webSemanticAdapter: "unitless-ratio-from-accepted-size-and-line-height-pair",
  webFluidAdapter: "role-specific-rem-and-viewport-clamp-from-accepted-mode-pairs",
  viewportPolicies: Object.freeze(["fixed", "responsive", "fluid"]),
  defaultViewportPolicy: "fixed",
  fluidAdmission: "explicit-display-role-only",
  accessibilityScaling: "required",
});
