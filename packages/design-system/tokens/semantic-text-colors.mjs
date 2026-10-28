import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  chromaticIntentIds,
  resolveSemanticColorModes,
  semanticIntentColorReferences,
} from "./semantic-color-references.mjs";

/**
 * @typedef {readonly [
 *   id: string,
 *   cssVariable: string,
 *   purpose: string,
 *   modeReferences: Readonly<Record<"light" | "dark", string>>,
 * ]} TextColorDefinition
 */

/** @type {readonly TextColorDefinition[]} */
const hierarchyDefinitions = [
  [
    "color/text/primary",
    "--color-text-primary",
    "default-readable-content",
    { light: "color/neutral/950", dark: "color/neutral/50" },
  ],
  [
    "color/text/secondary",
    "--color-text-secondary",
    "supporting-content-with-clear-hierarchy",
    { light: "color/neutral/800", dark: "color/neutral/300" },
  ],
  [
    "color/text/muted",
    "--color-text-muted",
    "deemphasized-noncritical-content",
    { light: "color/neutral/700", dark: "color/neutral/400" },
  ],
];

const intentPurpose = Object.freeze({
  accent: "accent",
  info: "informational",
  success: "success",
  warning: "warning",
  destructive: "destructive",
});

const intentDefinitions = chromaticIntentIds.flatMap((intent) =>
  /** @type {const} */ (["default", "hover"]).map(
    (state) =>
      /** @type {TextColorDefinition} */ ([
        `color/text/${intent}/${state}`,
        `--color-text-${intent}-${state}`,
        `${intentPurpose[intent]}-interactive-content${state === "hover" ? "-hover" : ""}`,
        semanticIntentColorReferences[intent][state],
      ]),
  ),
);

/** @type {readonly TextColorDefinition[]} */
const referenceRoleDefinitions = [
  ...hierarchyDefinitions,
  ...intentDefinitions,
];

/** @param {TextColorDefinition} definition */
function createReferenceTextColorRole([
  id,
  cssVariable,
  purpose,
  modeReferences,
]) {
  return Object.freeze({
    id,
    type: "color",
    kind: "opaque-mode-alias",
    purpose,
    cssVariable,
    modes: resolveSemanticColorModes(modeReferences, "text"),
    sourceTask: "SAVI-70",
    lifecycle: "admitted",
  });
}

const disabledOpacityReference = referenceOpacityById["opacity/48"];

if (!disabledOpacityReference) {
  throw new Error("Missing disabled text opacity reference: opacity/48");
}

const disabledTextColorRole = Object.freeze({
  id: "color/text/disabled",
  type: "color",
  kind: "color-opacity-composition",
  purpose: "inert-disabled-content-only",
  cssVariable: "--color-text-disabled",
  baseSemanticId: "color/text/primary",
  opacityReferenceId: disabledOpacityReference.id,
  resolvedOpacity: disabledOpacityReference.value,
  sourceTask: "SAVI-70",
  lifecycle: "admitted",
});

const errorTextColorRole = Object.freeze({
  id: "color/text/error/default",
  type: "color",
  kind: "opaque-mode-alias",
  purpose: "validation-error-content-not-destructive-action",
  cssVariable: "--color-text-error-default",
  modes: resolveSemanticColorModes(
    { light: "color/red/700", dark: "color/red/300" },
    "validation error text",
  ),
  sourceTask: "SAVI-86",
  lifecycle: "admitted",
});

const referenceTextColorRoles = referenceRoleDefinitions.map(
  createReferenceTextColorRole,
);

export const semanticTextColorRoles = Object.freeze([
  ...referenceTextColorRoles.slice(0, 3),
  disabledTextColorRole,
  errorTextColorRole,
  ...referenceTextColorRoles.slice(3),
]);

export const semanticTextColorRolesById = Object.freeze(
  Object.fromEntries(semanticTextColorRoles.map((role) => [role.id, role])),
);

export const semanticTextColorPolicy = Object.freeze({
  hierarchy: "primary-secondary-muted-disabled",
  typographyCoupling: "prohibited",
  mutedPurpose: "deemphasized-noncritical-content",
  disabledMeaning: "admitted-inert-content-only",
  disabledConsumerRequirement: "inactive-control-semantics-required",
  disabledContrastBoundary: "inactive-controls-only-primary-plus-opacity-48",
  disabledHoverResponse: "prohibited",
  validationErrorRoleId: "color/text/error/default",
  validationErrorMeaning: "validation-feedback-not-destructive-action",
  interactiveIntents: Object.freeze([
    "accent",
    "info",
    "success",
    "destructive",
    "warning",
  ]),
  interactiveStates: Object.freeze(["default", "hover"]),
  intentDisabledAliases: "prohibited-use-universal-disabled-state",
  inverseOrOnAccentMeaning: "deferred",
  decorativeOnColorMeaning: "deferred",
  statusMeaning: "content-only-no-surface-border-or-icon-inference",
  contrastValidation: "measured-foreground-background-pair",
  shadeNumberAccessibilityClaim: "prohibited",
});
