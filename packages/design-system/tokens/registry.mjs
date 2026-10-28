import { statusBadgeColorAliases } from "./component-status-badge.mjs";
import { avatarDimensions, avatarRadii } from "./component-avatar.mjs";
import { spinnerOpacityAliases, spinnerStroke } from "./component-spinner.mjs";
import { cardResponsiveRadii } from "./component-card.mjs";
import { segmentedTabsRadii, selectionPanelRadii, switchThumbRadius } from "./component-radii.mjs";
import {
  borderFocusPolicy,
  focusIndicator,
  referenceBorderWidths,
  semanticBorderWidths,
} from "./border-focus.mjs";
import {
  buttonColorAliases,
  buttonMotionAliases,
} from "./component-button.mjs";
import { editableTextColorAliases } from "./component-editable-text.mjs";
import {
  elevationOpacityAliases,
  elevationPolicy,
  elevationRoles,
  elevationTints,
  referenceShadowGeometry,
} from "./elevation.mjs";
import { fixedLayoutSpacing } from "./fixed-layout-spacing.mjs";
import { fixedUiSizing } from "./fixed-ui-sizing.mjs";
import { fixedUiSpacing } from "./fixed-ui-spacing.mjs";
import {
  motionEasings,
  motionPolicy,
  reducedMotionPolicy,
  referenceDurations,
  semanticDurations,
} from "./motion.mjs";
import { referenceColors } from "./reference-colors.mjs";
import {
  referenceFontWeights,
  semanticFontWeightPolicy,
} from "./reference-font-weights.mjs";
import {
  alphaCompositionContract,
  referenceOpacity,
} from "./reference-opacity.mjs";
import { fullRadius, radiusGeometryPolicy, radiusScale } from "./radius-geometry.mjs";
import { referenceSpacing } from "./reference-spacing.mjs";
import { referenceTracking, trackingPolicy } from "./reference-tracking.mjs";
import {
  responsiveLayoutModes,
  responsiveLayoutSpacing,
} from "./responsive-layout-spacing.mjs";
import {
  semanticFontFamilies,
  semanticFontFamilyPolicy,
} from "./semantic-font-families.mjs";
import {
  semanticRadiusPolicy,
  semanticRadiusRoles,
  intrinsicRoundRadius,
} from "./semantic-radii.mjs";
import {
  semanticSurfaceModes,
  semanticSurfaceForegroundRoles,
  semanticSurfacePolicy,
  semanticSurfaceRoles,
} from "./semantic-surfaces.mjs";
import {
  semanticBorderColorPolicy,
  semanticBorderColorRoles,
} from "./semantic-border-colors.mjs";
import {
  semanticIconColorPolicy,
  semanticIconColorRoles,
} from "./semantic-icon-colors.mjs";
import {
  semanticFocusColorPolicy,
  semanticFocusColorRoles,
} from "./semantic-focus-colors.mjs";
import {
  semanticTextColorPolicy,
  semanticTextColorRoles,
} from "./semantic-text-colors.mjs";
import {
  semanticLineHeightPolicy,
  semanticTypographyPolicy,
  typographyEmphasis,
  typographyMetricRoles,
  typographyPurposeLanes,
  typographyViewportModes,
} from "./semantic-typography.mjs";

export const registrySchemaVersion = 1;

export const registryLayers = Object.freeze([
  "reference",
  "semantic",
  "component",
]);

export const registryDomains = Object.freeze([
  Object.freeze({
    id: "spacing-sizing-layout-responsive",
    sourceTask: "SAVI-72",
  }),
  Object.freeze({ id: "color-alpha", sourceTask: "SAVI-70" }),
  Object.freeze({ id: "typography", sourceTask: "SAVI-71" }),
  Object.freeze({
    id: "radius-border-elevation-motion",
    sourceTask: "SAVI-73",
  }),
]);

function collectAliasIds(value, key = null, aliases = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectAliasIds(item, null, aliases);
    }
    return aliases;
  }

  if (!value || typeof value !== "object") {
    if (
      key !== "id" &&
      key?.endsWith("Id") &&
      typeof value === "string" &&
      value.includes("/")
    ) {
      aliases.add(value);
    }
    return aliases;
  }

  for (const [childKey, childValue] of Object.entries(value)) {
    collectAliasIds(childValue, childKey, aliases);
  }
  return aliases;
}

function collectDeclaredCssVariables(definition) {
  const variables = new Set();

  if (typeof definition.cssVariable === "string") {
    variables.add(definition.cssVariable);
  }
  if (definition.cssVariables && typeof definition.cssVariables === "object") {
    for (const value of Object.values(definition.cssVariables)) {
      if (typeof value === "string") {
        variables.add(value);
      }
    }
  }
  return Object.freeze([...variables]);
}

function defineGroup({
  id,
  domain,
  layer,
  tokenType,
  sourceTask,
  definitions,
}) {
  return Object.freeze({
    id,
    domain,
    layer,
    tokenType,
    sourceTask,
    entries: Object.freeze(
      definitions.map((definition) =>
        Object.freeze({
          id: definition.id,
          domain,
          layer,
          tokenType,
          sourceTask,
          lifecycle:
            definition.lifecycle ??
            definition.status ??
            definition.identityStatus ??
            "admitted",
          aliasIds: Object.freeze([...collectAliasIds(definition)]),
          declaredCssVariables: collectDeclaredCssVariables(definition),
          definition,
        }),
      ),
    ),
  });
}

const groupDefinitions = [
  {
    id: "component/avatar-dimensions", domain: "spacing-sizing-layout-responsive",
    layer: "component", tokenType: "dimension-alias", sourceTask: "SAVI-167",
    definitions: avatarDimensions,
  },
  {
    id: "component/avatar-radii", domain: "radius-border-elevation-motion",
    layer: "component", tokenType: "dimension-alias", sourceTask: "SAVI-167",
    definitions: avatarRadii,
  },
  {
    id: "radius/scale", domain: "radius-border-elevation-motion",
    layer: "reference", tokenType: "number", sourceTask: "SAVI-165",
    definitions: [radiusScale],
  },
  {
    id: "component/selection-panel-radius", domain: "radius-border-elevation-motion",
    layer: "component", tokenType: "dimension-composition", sourceTask: "SAVI-165",
    definitions: selectionPanelRadii,
  },
  {
    id: "component/tabs-segmented-radius", domain: "radius-border-elevation-motion",
    layer: "component", tokenType: "dimension-composition", sourceTask: "SAVI-165",
    definitions: segmentedTabsRadii,
  },
  {
    id: "component/card-radius", domain: "radius-border-elevation-motion",
    layer: "component", tokenType: "responsive-dimension-alias", sourceTask: "SAVI-165",
    definitions: cardResponsiveRadii,
  },
  {
    id: "component/spinner-stroke", domain: "radius-border-elevation-motion",
    layer: "component", tokenType: "dimension-alias", sourceTask: "SAVI-162",
    definitions: [spinnerStroke],
  },
  {
    id: "component/spinner-opacity", domain: "color-alpha",
    layer: "component", tokenType: "number-alias", sourceTask: "SAVI-162",
    definitions: spinnerOpacityAliases,
  },
  {
    id: "spacing/reference",
    domain: "spacing-sizing-layout-responsive",
    layer: "reference",
    tokenType: "dimension",
    sourceTask: "SAVI-72",
    definitions: referenceSpacing,
  },
  {
    id: "spacing/fixed-ui-size",
    domain: "spacing-sizing-layout-responsive",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-72",
    definitions: fixedUiSizing,
  },
  {
    id: "spacing/fixed-ui-space",
    domain: "spacing-sizing-layout-responsive",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-72",
    definitions: fixedUiSpacing,
  },
  {
    id: "spacing/fixed-layout-space",
    domain: "spacing-sizing-layout-responsive",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-72",
    definitions: fixedLayoutSpacing,
  },
  {
    id: "spacing/responsive-layout-space",
    domain: "spacing-sizing-layout-responsive",
    layer: "semantic",
    tokenType: "responsive-dimension-alias",
    sourceTask: "SAVI-72",
    definitions: responsiveLayoutSpacing,
  },
  {
    id: "color/reference",
    domain: "color-alpha",
    layer: "reference",
    tokenType: "color",
    sourceTask: "SAVI-70",
    definitions: referenceColors,
  },
  {
    id: "opacity/reference",
    domain: "color-alpha",
    layer: "reference",
    tokenType: "number",
    sourceTask: "SAVI-70",
    definitions: referenceOpacity,
  },
  {
    id: "color/surface-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "surface-color-composition",
    sourceTask: "SAVI-81",
    definitions: semanticSurfaceRoles,
  },
  {
    id: "color/text-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "text-color-alias",
    sourceTask: "SAVI-70",
    definitions: semanticTextColorRoles,
  },
  {
    id: "color/foreground-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "foreground-color-alias",
    sourceTask: "SAVI-81",
    definitions: semanticSurfaceForegroundRoles,
  },
  {
    id: "color/border-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "border-color-composition",
    sourceTask: "SAVI-81",
    definitions: semanticBorderColorRoles,
  },
  {
    id: "color/icon-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "icon-color-alias",
    sourceTask: "SAVI-81",
    definitions: semanticIconColorRoles,
  },
  {
    id: "color/focus-semantic",
    domain: "color-alpha",
    layer: "semantic",
    tokenType: "focus-color-alias",
    sourceTask: "SAVI-70",
    definitions: semanticFocusColorRoles,
  },
  {
    id: "typography/font-weight-reference",
    domain: "typography",
    layer: "reference",
    tokenType: "font-weight",
    sourceTask: "SAVI-71",
    definitions: referenceFontWeights,
  },
  {
    id: "typography/tracking-reference",
    domain: "typography",
    layer: "reference",
    tokenType: "tracking",
    sourceTask: "SAVI-71",
    definitions: referenceTracking,
  },
  {
    id: "typography/family-semantic",
    domain: "typography",
    layer: "semantic",
    tokenType: "font-family-slot",
    sourceTask: "SAVI-71",
    definitions: semanticFontFamilies,
  },
  {
    id: "typography/emphasis-semantic",
    domain: "typography",
    layer: "semantic",
    tokenType: "font-weight-alias",
    sourceTask: "SAVI-71",
    definitions: typographyEmphasis,
  },
  {
    id: "typography/metric-semantic",
    domain: "typography",
    layer: "semantic",
    tokenType: "typography-composition",
    sourceTask: "SAVI-71",
    definitions: typographyMetricRoles,
  },
  {
    id: "radius/reference",
    domain: "radius-border-elevation-motion",
    layer: "reference",
    tokenType: "dimension",
    sourceTask: "SAVI-73",
    definitions: [fullRadius],
  },
  {
    id: "border/reference",
    domain: "radius-border-elevation-motion",
    layer: "reference",
    tokenType: "dimension",
    sourceTask: "SAVI-73",
    definitions: referenceBorderWidths,
  },
  {
    id: "shadow/reference",
    domain: "radius-border-elevation-motion",
    layer: "reference",
    tokenType: "dimension",
    sourceTask: "SAVI-73",
    definitions: referenceShadowGeometry,
  },
  {
    id: "motion/duration-reference",
    domain: "radius-border-elevation-motion",
    layer: "reference",
    tokenType: "duration",
    sourceTask: "SAVI-73",
    definitions: referenceDurations,
  },
  {
    id: "motion/easing-reference",
    domain: "radius-border-elevation-motion",
    layer: "reference",
    tokenType: "easing",
    sourceTask: "SAVI-73",
    definitions: motionEasings,
  },
  {
    id: "radius/semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-73",
    definitions: semanticRadiusRoles.filter((role) => role !== intrinsicRoundRadius),
  },
  {
    id: "radius/shape-semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-131",
    definitions: [intrinsicRoundRadius],
  },
  {
    id: "border/semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-73",
    definitions: semanticBorderWidths,
  },
  {
    id: "focus/semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "focus-indicator",
    sourceTask: "SAVI-73",
    definitions: [focusIndicator],
  },
  {
    id: "elevation/opacity-semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "number-alias",
    sourceTask: "SAVI-73",
    definitions: elevationOpacityAliases,
  },
  {
    id: "elevation/role-semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "shadow-composition",
    sourceTask: "SAVI-73",
    definitions: elevationRoles,
  },
  {
    id: "elevation/tint-semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "color-alias",
    sourceTask: "SAVI-73",
    definitions: elevationTints,
  },
  {
    id: "motion/duration-semantic",
    domain: "radius-border-elevation-motion",
    layer: "semantic",
    tokenType: "duration-alias",
    sourceTask: "SAVI-73",
    definitions: semanticDurations,
  },
  {
    id: "component/radius",
    domain: "radius-border-elevation-motion",
    layer: "component",
    tokenType: "dimension-alias",
    sourceTask: "SAVI-131",
    definitions: [switchThumbRadius],
  },
  {
    id: "component/status-badge-color",
    domain: "color-alpha", layer: "component", tokenType: "component-color-alias",
    sourceTask: "SAVI-135", definitions: statusBadgeColorAliases,
  },
  {
    id: "component/button-color",
    domain: "color-alpha",
    layer: "component",
    tokenType: "component-color-alias",
    sourceTask: "SAVI-83",
    definitions: buttonColorAliases,
  },
  {
    id: "component/button-motion",
    domain: "radius-border-elevation-motion",
    layer: "component",
    tokenType: "component-duration-recipe",
    sourceTask: "SAVI-83",
    definitions: buttonMotionAliases,
  },
  {
    id: "component/editable-text-color",
    domain: "color-alpha",
    layer: "component",
    tokenType: "component-color-alias",
    sourceTask: "SAVI-107",
    definitions: editableTextColorAliases,
  },
];

export const registryGroups = Object.freeze(groupDefinitions.map(defineGroup));

export const registryEntries = Object.freeze(
  registryGroups.flatMap((group) => group.entries),
);

export const registryEntriesById = Object.freeze(
  Object.fromEntries(registryEntries.map((entry) => [entry.id, entry])),
);

export const registryReferenceEntries = Object.freeze(
  registryEntries.filter((entry) => entry.layer === "reference"),
);

export const registrySemanticEntries = Object.freeze(
  registryEntries.filter((entry) => entry.layer === "semantic"),
);

export const registryComponentEntries = Object.freeze(
  registryEntries.filter((entry) => entry.layer === "component"),
);

export const registryModeSets = Object.freeze({
  colorScheme: semanticSurfaceModes,
  viewport: Object.freeze(
    responsiveLayoutModes.map((mode) =>
      Object.freeze({
        id: mode.id,
        minWidthSourcePx: mode.minWidthSourcePx,
        minWidthWebValue: mode.minWidthWebValue,
      }),
    ),
  ),
});

export const registryPolicies = Object.freeze({
  alphaComposition: alphaCompositionContract,
  borderColor: semanticBorderColorPolicy,
  borderFocus: borderFocusPolicy,
  elevation: elevationPolicy,
  focusColor: semanticFocusColorPolicy,
  fontFamily: semanticFontFamilyPolicy,
  fontWeight: semanticFontWeightPolicy,
  lineHeight: semanticLineHeightPolicy,
  iconColor: semanticIconColorPolicy,
  motion: motionPolicy,
  radiusGeometry: radiusGeometryPolicy,
  radiusSemantic: semanticRadiusPolicy,
  reducedMotion: reducedMotionPolicy,
  surface: semanticSurfacePolicy,
  textColor: semanticTextColorPolicy,
  tracking: trackingPolicy,
  typography: semanticTypographyPolicy,
  typographyPurposeLanes,
  typographyViewportModes,
});

export const registryLifecycle = Object.freeze({
  schemaVersion: registrySchemaVersion,
  authorityPath: "packages/design-system/tokens/",
  canonicalOwner: "FRONTEND",
  synchronizationDirection: "registry-to-platform-adapters",
  figmaOverwrite: "prohibited",
  stableIdentityRule: "change-by-admitted-task-with-explicit-migration",
  compatibilityRule: "preserve-stable-id-or-record-replacement-and-consumers",
  deprecationSequence: Object.freeze([
    "create-or-update",
    "rebind",
    "verify",
    "deprecate",
    "migrate-consumers",
    "separately-authorized-delete-at-zero-usage",
  ]),
  rollback: "non-rewriting-revert-of-exact-registry-revision",
  downstreamRollback: "independent-adapter-inverse-ledger",
});

export const registryWebAdapter = Object.freeze({
  source: "packages/design-system/src/tokens.css",
  transport: "css-custom-properties",
  packageImport: "@hito-ds/react/tokens.css",
  consumerBoundary: "global-base-and-css-modules",
  runtimeJavascriptStyling: "prohibited",
  directReferenceConsumptionInCssModules: "prohibited",
  componentLocalTokenDeclarations: "admitted-component-aliases-only",
  platformCompatibilityVariables: Object.freeze([]),
  internalCompositionVariables: Object.freeze([
    "--elevation-shadow-color-ambient",
    "--elevation-shadow-color-key",
    "--elevation-ambient-tint",
    "--elevation-key-tint",
    "--motion-reduced-fade-duration",
    "--motion-reduced-fade-easing",
    "--motion-reduced-spatial-duration",
  ]),
  retiredCompatibilityVariables: Object.freeze([
    "--layout-gutter",
    "--layout-section-gap",
    "--color-surface-elevated",
    "--shell-radius",
    "--shell-surface",
    "--shell-text",
  ]),
});

export const tokenRegistry = Object.freeze({
  id: "@hito-ds/react/tokens",
  schemaVersion: registrySchemaVersion,
  layers: registryLayers,
  domains: registryDomains,
  groups: registryGroups,
  entries: registryEntries,
  entriesById: registryEntriesById,
  references: registryReferenceEntries,
  semantics: registrySemanticEntries,
  components: registryComponentEntries,
  modeSets: registryModeSets,
  policies: registryPolicies,
  lifecycle: registryLifecycle,
  webAdapter: registryWebAdapter,
});
