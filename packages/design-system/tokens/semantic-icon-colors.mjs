import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  chromaticIntentIds,
  resolveSemanticColorModes,
  semanticIntentColorReferences,
} from "./semantic-color-references.mjs";

const neutralDefinitions = [
  [
    "default",
    "--color-icon-default",
    "default-readable-icon",
    { light: "color/neutral/950", dark: "color/neutral/50" },
  ],
  [
    "secondary",
    "--color-icon-secondary",
    "supporting-icon",
    { light: "color/neutral/800", dark: "color/neutral/300" },
  ],
  [
    "muted",
    "--color-icon-muted",
    "deemphasized-noncritical-icon",
    { light: "color/neutral/700", dark: "color/neutral/400" },
  ],
];

function createOpaqueRole(id, cssVariable, purpose, references) {
  return Object.freeze({
    id,
    type: "color",
    kind: "opaque-mode-alias",
    purpose,
    cssVariable,
    modes: resolveSemanticColorModes(references, "icon"),
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

const disabledOpacityReference = referenceOpacityById["opacity/48"];

if (!disabledOpacityReference) {
  throw new Error("Missing disabled icon opacity reference: opacity/48");
}

export const semanticIconColorRoles = Object.freeze([
  ...neutralDefinitions.map(([name, cssVariable, purpose, references]) =>
    createOpaqueRole(`color/icon/${name}`, cssVariable, purpose, references),
  ),
  Object.freeze({
    id: "color/icon/disabled",
    type: "color",
    kind: "color-opacity-composition",
    purpose: "inert-disabled-icon-only",
    cssVariable: "--color-icon-disabled",
    baseSemanticId: "color/icon/default",
    opacityReferenceId: disabledOpacityReference.id,
    resolvedOpacity: disabledOpacityReference.value,
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  }),
  ...chromaticIntentIds.flatMap((intent) =>
    ["default", "hover"].map((state) =>
      createOpaqueRole(
        `color/icon/${intent}/${state}`,
        `--color-icon-${intent}-${state}`,
        `${intent}-icon-${state}`,
        semanticIntentColorReferences[intent][state],
      ),
    ),
  ),
]);

export const semanticIconColorRolesById = Object.freeze(
  Object.fromEntries(semanticIconColorRoles.map((role) => [role.id, role])),
);

export const semanticIconColorPolicy = Object.freeze({
  hierarchy: "default-secondary-muted-disabled",
  interactiveIntents: Object.freeze([
    "accent",
    "info",
    "success",
    "warning",
    "destructive",
  ]),
  interactiveStates: Object.freeze(["default", "hover"]),
  intentDisabledAliases: "prohibited-use-universal-icon-disabled",
  disabledRoleId: "color/icon/disabled",
  disabledHoverResponse: "prohibited",
  colorOnlyMeaning: "prohibited-use-label-shape-or-state-in-addition",
  componentAliasMeaning: "deferred-until-component-contract",
  contrastValidation: "measured-icon-against-adjacent-surface",
  shadeNumberAccessibilityClaim: "prohibited",
});
