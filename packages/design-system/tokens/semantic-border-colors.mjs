import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  chromaticIntentIds,
  resolveSemanticColorModes,
  semanticIntentColorReferences,
} from "./semantic-color-references.mjs";

const contextualDefinitions = [
  ["subtle", "--color-border-subtle", "quiet-separation", "opacity/12"],
  [
    "default",
    "--color-border-default",
    "ordinary-structural-edge",
    "opacity/24",
  ],
  [
    "strong",
    "--color-border-strong",
    "emphasized-structural-edge",
    "opacity/48",
  ],
  ["disabled", "--color-border-disabled", "inert-control-edge", "opacity/12"],
];

function createContextualRole([
  name,
  cssVariable,
  purpose,
  opacityReferenceId,
]) {
  const opacity = referenceOpacityById[opacityReferenceId];

  if (!opacity) {
    throw new Error(`Missing border opacity reference: ${opacityReferenceId}`);
  }

  return Object.freeze({
    id: `color/border/${name}`,
    type: "color-with-opacity",
    kind: "contextual-alpha",
    purpose,
    cssVariable,
    foregroundInput: "paired-semantic-content-color",
    webForegroundAdapter: "currentColor",
    opacityReferenceId,
    resolvedOpacity: opacity.value,
    webValue: `rgb(from currentColor r g b / var(${opacity.cssVariable}))`,
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

const intentOpacityByState = Object.freeze({
  subtle: "opacity/24",
  default: "opacity/64",
  hover: "opacity/80",
});

function createIntentRole(intent, state, references) {
  const opacityReferenceId = intentOpacityByState[state];
  const opacity = referenceOpacityById[opacityReferenceId];

  if (!opacity) {
    throw new Error(
      `Missing border intent opacity reference: ${opacityReferenceId}`,
    );
  }

  return Object.freeze({
    id: `color/border/${intent}/${state}`,
    type: "color-with-opacity",
    kind: "mode-color-opacity-composition",
    purpose: `${intent}-structural-edge-${state}`,
    cssVariable: `--color-border-${intent}-${state}`,
    opacityReferenceId,
    resolvedOpacity: opacity.value,
    modes: resolveSemanticColorModes(references, "border"),
    sourceTask: "SAVI-81",
    lifecycle: "admitted",
  });
}

export const semanticBorderColorRoles = Object.freeze([
  ...contextualDefinitions.map(createContextualRole),
  ...chromaticIntentIds.flatMap((intent) => [
    createIntentRole(
      intent,
      "subtle",
      semanticIntentColorReferences[intent].default,
    ),
    createIntentRole(
      intent,
      "default",
      semanticIntentColorReferences[intent].default,
    ),
    createIntentRole(
      intent,
      "hover",
      semanticIntentColorReferences[intent].hover,
    ),
  ]),
]);

export const semanticBorderColorRolesById = Object.freeze(
  Object.fromEntries(semanticBorderColorRoles.map((role) => [role.id, role])),
);

export const semanticBorderColorPolicy = Object.freeze({
  hierarchy: "subtle-default-strong",
  separatorRoleId: "color/border/subtle",
  contextualComposition: "paired-semantic-content-color-plus-governed-opacity",
  intentStates: Object.freeze(["subtle", "default", "hover"]),
  intentSubtleOpacityReferenceId: "opacity/24",
  intentDefaultOpacityReferenceId: "opacity/64",
  intentHoverOpacityReferenceId: "opacity/80",
  intentDisabledAliases: "prohibited-use-universal-border-disabled",
  disabledRoleId: "color/border/disabled",
  disabledHoverResponse: "prohibited",
  focusMeaning: "separate-focus-indicator-contract",
  selectedMeaning: "component-owned-composition",
  componentAliasMeaning: "deferred-until-component-contract",
  contrastValidation: "measured-edge-against-each-adjacent-surface",
  canonicalFlattenedRgbaAllowed: false,
});
