import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  resolveSemanticColorModes,
  semanticIntentColorReferences,
} from "./semantic-color-references.mjs";

const geometryDefinitions = [
  ["shadow/offset/x/0", "offset-x-0", 0, "0"],
  ["shadow/offset/x/1", "offset-x-1", 1, "1px"],
  ["shadow/offset/x/2", "offset-x-2", 2, "2px"],
  ["shadow/offset/x/4", "offset-x-4", 4, "4px"],
  ["shadow/offset/y/0", "offset-y-0", 0, "0"],
  ["shadow/offset/y/1", "offset-y-1", 1, "1px"],
  ["shadow/offset/y/2", "offset-y-2", 2, "2px"],
  ["shadow/offset/y/4", "offset-y-4", 4, "4px"],
  ["shadow/offset/y/8", "offset-y-8", 8, "8px"],
  ["shadow/blur/2", "blur-2", 2, "2px"],
  ["shadow/blur/4", "blur-4", 4, "4px"],
  ["shadow/blur/12", "blur-12", 12, "12px"],
  ["shadow/blur/16", "blur-16", 16, "16px"],
  ["shadow/blur/24", "blur-24", 24, "24px"],
  ["shadow/blur/48", "blur-48", 48, "48px"],
  ["shadow/spread/0", "spread-0", 0, "0"],
];

export const referenceShadowGeometry = Object.freeze(
  geometryDefinitions.map(([id, cssSuffix, sourcePx, webValue]) =>
    Object.freeze({
      id,
      type: "dimension",
      sourcePx,
      cssVariable: `--ref-shadow-${cssSuffix}`,
      webValue,
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const referenceShadowGeometryById = Object.freeze(
  Object.fromEntries(referenceShadowGeometry.map((token) => [token.id, token])),
);

function resolveOpacityModes(references, label) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(references).map(([modeId, referenceId]) => {
        const reference = referenceOpacityById[referenceId];

        if (!reference) {
          throw new Error(`Missing ${label} opacity reference: ${referenceId}`);
        }

        return [
          modeId,
          Object.freeze({
            referenceId,
            resolvedValue: reference.value,
            resolvedWebValue: reference.webValue,
          }),
        ];
      }),
    ),
  );
}

const opacityDefinitions = [
  {
    id: "elevation/opacity/key",
    cssVariable: "--elevation-opacity-key",
    modes: { light: "opacity/16", dark: "opacity/24" },
  },
  {
    id: "elevation/opacity/ambient",
    cssVariable: "--elevation-opacity-ambient",
    modes: { light: "opacity/8", dark: "opacity/8" },
  },
];

export const elevationOpacityAliases = Object.freeze(
  opacityDefinitions.map(({ id, cssVariable, modes }) =>
    Object.freeze({
      id,
      type: "mode-number-alias",
      cssVariable,
      modes: resolveOpacityModes(modes, id),
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const elevationOpacityAliasesById = Object.freeze(
  Object.fromEntries(elevationOpacityAliases.map((token) => [token.id, token])),
);

// Composition metadata, not additional token identities. Explicit chromatic
// compositions retain the shared opacity aliases above for both contributions.
export const neutralElevationOpacity = Object.freeze({
  key: resolveOpacityModes({ light: "opacity/16", dark: "opacity/32" }, "neutral key"),
  ambient: resolveOpacityModes({ light: "opacity/8", dark: "opacity/24" }, "neutral ambient"),
});

const neutralTintModes = Object.freeze({
  light: "color/neutral/950",
  dark: "color/basic/black",
});

function createTint({ id, cssVariable, kind, intent, modeReferences }) {
  return Object.freeze({
    id,
    type: "color",
    kind,
    intent,
    cssVariable,
    modes: resolveSemanticColorModes(modeReferences, id),
    sourceTask: "SAVI-73",
    lifecycle: "admitted",
  });
}

const ambientIntentIds = Object.freeze([
  "neutral",
  "accent",
  "info",
  "success",
  "warning",
  "destructive",
]);

export const elevationTints = Object.freeze([
  createTint({
    id: "elevation/tint/key/default",
    cssVariable: "--elevation-tint-key-default",
    kind: "key",
    intent: "neutral",
    modeReferences: neutralTintModes,
  }),
  ...ambientIntentIds.map((intent) =>
    createTint({
      id: `elevation/tint/ambient/${intent}`,
      cssVariable: `--elevation-tint-ambient-${intent}`,
      kind: "ambient",
      intent,
      modeReferences:
        intent === "neutral"
          ? neutralTintModes
          : semanticIntentColorReferences[intent].default,
    }),
  ),
]);

function createLayer({
  kind,
  offsetXId,
  offsetYId,
  blurId,
  opacityId,
  tintInputId,
}) {
  return Object.freeze({
    kind,
    offsetXId,
    offsetYId,
    blurId,
    spreadId: "shadow/spread/0",
    opacityId,
    tintInputId,
  });
}

const keyLayer = createLayer({
  kind: "key",
  offsetXId: "shadow/offset/x/0",
  offsetYId: "shadow/offset/y/0",
  blurId: "shadow/blur/2",
  opacityId: "elevation/opacity/key",
  tintInputId: "elevation/tint/key/default",
});

function createElevationDefinition(id, cssSuffix, ambientLayer = null) {
  return Object.freeze({
    id,
    cssSuffix,
    layers: Object.freeze(ambientLayer ? [keyLayer, ambientLayer] : []),
  });
}

function createAmbientLayer(offsetXId, offsetYId, blurId) {
  return createLayer({
    kind: "ambient",
    offsetXId,
    offsetYId,
    blurId,
    opacityId: "elevation/opacity/ambient",
    tintInputId: "elevation/tint/ambient/neutral",
  });
}

const elevationDefinitions = [
  createElevationDefinition("elevation/none", "none"),
  createElevationDefinition(
    "elevation/raised",
    "raised",
    createAmbientLayer(
      "shadow/offset/x/1",
      "shadow/offset/y/1",
      "shadow/blur/4",
    ),
  ),
  createElevationDefinition(
    "elevation/floating",
    "floating",
    createAmbientLayer(
      "shadow/offset/x/2",
      "shadow/offset/y/4",
      "shadow/blur/16",
    ),
  ),
  createElevationDefinition(
    "elevation/overlay",
    "overlay",
    createAmbientLayer(
      "shadow/offset/x/4",
      "shadow/offset/y/8",
      "shadow/blur/48",
    ),
  ),
];

export const elevationRoles = Object.freeze(
  elevationDefinitions.map(({ id, cssSuffix, layers }) =>
    Object.freeze({
      id,
      cssVariable: `--elevation-${cssSuffix}`,
      layers: Object.freeze(layers),
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const elevationRolesById = Object.freeze(
  Object.fromEntries(elevationRoles.map((token) => [token.id, token])),
);

function createUsage(relationship, modality, placement, scrim, guidance) {
  return Object.freeze({ relationship, modality, placement, scrim, guidance });
}

export const elevationUsageByRoleId = Object.freeze(
  {
    "elevation/none": createUsage(
      "same-plane",
      "none",
      "in-flow",
      "absent",
      "Use when content belongs to the same plane and spacing or fill already preserves its structure.",
    ),
    "elevation/raised": createUsage(
      "persistent-raised",
      "non-modal",
      "in-flow-or-persistent-overlap",
      "absent",
      "Use for a persistent surface whose hierarchy or overlap must remain visible above its host.",
    ),
    "elevation/floating": createUsage(
      "transient-floating",
      "non-modal",
      "anchored-or-viewport-floating",
      "absent",
      "Use for transient non-modal content that floats above the current task without blocking it.",
    ),
    "elevation/overlay": createUsage(
      "transient-overlay",
      "modal",
      "viewport-layer-above-scrim",
      "required",
      "Use for a modal surface that interrupts the current task and is separated by a Scrim.",
    ),
  },
);

export const elevationPolicy = Object.freeze({
  layers: Object.freeze(["key", "ambient"]),
  neutralOpacity: neutralElevationOpacity,
  defaultRoleId: "elevation/none",
  selectionOwner: "admitted-component-or-composition-contract",
  weakestSufficientRelationshipOnly: true,
  runtimeAutoInference: "prohibited",
  componentNameInference: "prohibited",
  colorOrStatusInference: "prohibited",
  viewportInference: "prohibited",
  borderCoupling: "prohibited",
  surfaceCoupling: "prohibited",
  stackingOrderCoupling: "prohibited",
  lightSource: "upper-left",
  keyCastDirection: "centered-contact",
  ambientCastDirection: "positive-x-positive-y",
  highlightContribution: "not-admitted",
  geometryIndependentFromSpacing: true,
  geometryIndependentFromViewport: true,
  geometryChangesByInteractionState: false,
  depthIncreasesOffsetAndBlur: true,
  tintMatrixGeneration: "prohibited",
  intentAutomaticallySelectedFromStatus: false,
  ambientIntentAdapterAttribute: "data-hito-elevation-intent",
  statusByShadowOnly: "prohibited",
  focusByShadow: "prohibited",
  selectedByShadowOnly: "prohibited",
  requiredBoundaryByShadowOnly: "prohibited",
  borderDefault: "absent-when-fill-spacing-and-elevation-preserve-boundary",
  borderOptIn: "only-for-required-boundary-state-or-accessibility-evidence",
  decorativeGlow: "separate-deferred-effect-role",
  canonicalFlattenedRgbaAllowed: false,
});
