import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  resolveSemanticColorModes,
  semanticIntentColorReferences,
} from "./semantic-color-references.mjs";

// Strong accent fills use the approved brand steps independently of text and borders.
const accentStrongReferences = Object.freeze({
  default: Object.freeze({ light: "color/brand/400", dark: "color/brand/500" }),
  hover: Object.freeze({ light: "color/brand/500", dark: "color/brand/400" }),
  pressed: Object.freeze({ light: "color/brand/600", dark: "color/brand/300" }),
});

const surfaceLayerDefinitions = [
  [
    "color/surface/canvas",
    "--color-surface-canvas",
    "root-page-or-environment-background",
    { light: "color/neutral/50", dark: "color/neutral/1000" },
  ],
  [
    "color/surface/base",
    "--color-surface-base",
    "ordinary-content-surface-on-canvas",
    { light: "color/basic/white", dark: "color/neutral/950" },
  ],
  [
    "color/surface/raised",
    "--color-surface-raised",
    "raised-content-surface-above-base",
    { light: "color/basic/white", dark: "color/neutral/900" },
  ],
  [
    "color/surface/overlay",
    "--color-surface-overlay",
    "floating-overlay-surface-separated-by-scrim-and-elevation",
    { light: "color/basic/white", dark: "color/neutral/950" },
  ],
];

const subtleOpacityByState = Object.freeze({
  default: "opacity/8",
  hover: "opacity/12",
  pressed: "opacity/16",
});

const neutralSubtleOpacityByState = Object.freeze({
  default: "opacity/4",
  hover: "opacity/8",
  pressed: "opacity/12",
});

function createOpaqueLayerRole([id, cssVariable, purpose, modeReferences]) {
  return Object.freeze({
    id,
    type: "color",
    kind: "opaque-mode-alias",
    purpose,
    cssVariable,
    modes: resolveSemanticColorModes(modeReferences, "surface layer"),
    sourceTask:
      id === "color/surface/canvas" || id === "color/surface/base"
        ? "SAVI-70"
        : "SAVI-81",
    lifecycle: "admitted",
  });
}

function createIntentSubtleRole(intent, state, modeReferences) {
  const opacityReferenceId = (intent === "neutral"
    ? neutralSubtleOpacityByState
    : subtleOpacityByState)[state];
  const opacity = referenceOpacityById[opacityReferenceId];

  if (!opacity) {
    throw new Error(`Missing intent Surface opacity: ${opacityReferenceId}`);
  }

  return Object.freeze({
    id: `color/surface/${intent}/subtle/${state}`,
    type: "color-with-opacity",
    kind: "mode-color-opacity-composition",
    purpose: `${intent}-low-emphasis-surface-${state}`,
    cssVariable: `--color-surface-${intent}-subtle-${state}`,
    opacityReferenceId,
    resolvedOpacity: opacity.value,
    modes: resolveSemanticColorModes(
      modeReferences,
      `${intent} subtle Surface`,
    ),
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

function createIntentStrongRole(intent, state, modeReferences) {
  return Object.freeze({
    id: `color/surface/${intent}/strong/${state}`,
    type: "color",
    kind: "opaque-mode-alias",
    purpose: `${intent}-high-emphasis-surface-${state}`,
    cssVariable: `--color-surface-${intent}-strong-${state}`,
    modes: resolveSemanticColorModes(
      modeReferences,
      `${intent} strong Surface`,
    ),
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

function createOnStrongForegroundRole(intent) {
  const modeReferences = {
    light: intent === "accent" ? "color/neutral/950" : "color/basic/white",
    dark: "color/neutral/950",
  };

  return Object.freeze({
    id: `color/foreground/on-${intent}-strong`,
    type: "color",
    kind: "opaque-mode-alias",
    purpose: `shared-text-icon-spinner-content-on-${intent}-strong-surface`,
    cssVariable: `--color-foreground-on-${intent}-strong`,
    modes: resolveSemanticColorModes(
      modeReferences,
      `${intent} on-strong foreground`,
    ),
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

const contextualSubtleOpacityId = "opacity/8";
const contextualSubtleOpacity = referenceOpacityById[contextualSubtleOpacityId];
const scrimOpacityId = "opacity/64";
const scrimOpacity = referenceOpacityById[scrimOpacityId];

if (!contextualSubtleOpacity || !scrimOpacity) {
  throw new Error("Missing Surface layer opacity reference");
}

const contextualSubtleRole = Object.freeze({
  id: "color/surface/subtle",
  type: "color-with-opacity",
  kind: "contextual-alpha",
  purpose: "persistent-nested-surface-on-an-admitted-parent",
  cssVariable: "--color-surface-subtle",
  foregroundInput: "paired-semantic-content-color",
  webForegroundAdapter: "currentColor",
  opacityReferenceId: contextualSubtleOpacityId,
  resolvedOpacity: contextualSubtleOpacity.value,
  webValue: `rgb(from currentColor r g b / var(${contextualSubtleOpacity.cssVariable}))`,
  sourceTask: "SAVI-70",
  lifecycle: "admitted",
});

const scrimRole = Object.freeze({
  id: "color/surface/scrim",
  type: "color-with-opacity",
  kind: "color-opacity-composition",
  purpose: "content-obscuring-backdrop-behind-an-overlay",
  cssVariable: "--color-surface-scrim",
  colorReferenceId: "color/basic/black",
  opacityReferenceId: scrimOpacityId,
  resolvedOpacity: scrimOpacity.value,
  sourceTask: "SAVI-81",
  lifecycle: "admitted",
});

export const semanticSurfaceRoles = Object.freeze([
  ...surfaceLayerDefinitions.map(createOpaqueLayerRole),
  contextualSubtleRole,
  scrimRole,
  ...Object.entries(semanticIntentColorReferences).flatMap(
    ([intent, references]) => [
      ...Object.keys(subtleOpacityByState).map((state) =>
        createIntentSubtleRole(intent, state, references.default),
      ),
      ...Object.entries(intent === "accent" ? accentStrongReferences : references).map(([state, modes]) =>
        createIntentStrongRole(intent, state, modes),
      ),
    ],
  ),
]);

export const semanticSurfaceRolesById = Object.freeze(
  Object.fromEntries(semanticSurfaceRoles.map((role) => [role.id, role])),
);

export const semanticSurfaceForegroundRoles = Object.freeze(
  [...Object.keys(semanticIntentColorReferences).map(createOnStrongForegroundRole), Object.freeze({
    id: "color/foreground/on-scrim", type: "color", kind: "opaque-mode-alias",
    purpose: "text-and-icons-on-black-scrim-over-media",
    cssVariable: "--color-foreground-on-scrim",
    modes: resolveSemanticColorModes({ light: "color/basic/white", dark: "color/basic/white" }, "on-scrim foreground"),
    sourceTask: "SAVI-167", lifecycle: "admitted",
  })],
);

export const semanticSurfaceForegroundRolesById = Object.freeze(
  Object.fromEntries(
    semanticSurfaceForegroundRoles.map((role) => [role.id, role]),
  ),
);

export const semanticSurfaceModes = Object.freeze([
  Object.freeze({ id: "light" }),
  Object.freeze({ id: "dark" }),
]);

export const semanticSurfacePolicy = Object.freeze({
  modeRelationship: "semantic-correlation-not-mirrored-reference-steps",
  layerRoles: Object.freeze([
    "canvas",
    "base",
    "subtle",
    "raised",
    "overlay",
    "scrim",
  ]),
  intents: Object.freeze(Object.keys(semanticIntentColorReferences)),
  intentEmphasis: Object.freeze(["subtle", "strong"]),
  interactionStates: Object.freeze(["default", "hover", "pressed"]),
  subtleOpacityByState,
  neutralSubtleOpacityByState,
  strongOpacity: "opaque",
  onStrongForeground: "shared-text-icon-spinner-content",
  staticSurfaceState: "default-only",
  hoverPressedRequirement: "interactive-surface-only",
  disabledMeaning: "component-owned-composition",
  focusMeaning: "separate-focus-indicator-contract",
  colorOnlyMeaning: "prohibited-use-label-icon-shape-or-state-in-addition",
  componentAliasMeaning: "deferred-until-component-contract",
  contextualSubtleComposition: "paired-semantic-content-color-plus-opacity-8",
  contextualSubtleHostRequirement: "explicit-paired-semantic-content-color",
  scrimComposition: "basic-black-plus-opacity-64",
  overlayColorRelationship: "same-as-base-depth-via-scrim-and-elevation",
  contrastValidation: "measured-after-composition-on-each-admitted-parent",
  canonicalFlattenedRgbaAllowed: false,
  downstreamFlattenedAdapter: "allowed-only-with-base-and-opacity-provenance",
  supersededGlobalActionFamily: "removed-with-zero-consumers",
});
