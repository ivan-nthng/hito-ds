import { readFile } from "node:fs/promises";

import { referenceColorsById } from "./reference-colors.mjs";
import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  semanticTextColorPolicy,
  semanticTextColorRoles,
  semanticTextColorRolesById,
} from "./semantic-text-colors.mjs";
import { semanticSurfaceRolesById } from "./semantic-surfaces.mjs";
import {
  assert,
  compositeColor,
  contrastRatio,
} from "./validation-helpers.mjs";

const expectedReferences = Object.freeze({
  "color/text/primary": Object.freeze({
    light: "color/neutral/950",
    dark: "color/neutral/50",
  }),
  "color/text/secondary": Object.freeze({
    light: "color/neutral/800",
    dark: "color/neutral/300",
  }),
  "color/text/muted": Object.freeze({
    light: "color/neutral/700",
    dark: "color/neutral/400",
  }),
  "color/text/error/default": Object.freeze({
    light: "color/red/700",
    dark: "color/red/300",
  }),
  "color/text/accent/default": Object.freeze({
    light: "color/brand/800",
    dark: "color/brand/400",
  }),
  "color/text/accent/hover": Object.freeze({
    light: "color/brand/900",
    dark: "color/brand/300",
  }),
  "color/text/info/default": Object.freeze({
    light: "color/blue/700",
    dark: "color/blue/400",
  }),
  "color/text/info/hover": Object.freeze({
    light: "color/blue/800",
    dark: "color/blue/300",
  }),
  "color/text/success/default": Object.freeze({
    light: "color/green/700",
    dark: "color/green/300",
  }),
  "color/text/success/hover": Object.freeze({
    light: "color/green/800",
    dark: "color/green/200",
  }),
  "color/text/destructive/default": Object.freeze({
    light: "color/red/700",
    dark: "color/red/300",
  }),
  "color/text/destructive/hover": Object.freeze({
    light: "color/red/800",
    dark: "color/red/200",
  }),
  "color/text/warning/default": Object.freeze({
    light: "color/orange/700",
    dark: "color/orange/300",
  }),
  "color/text/warning/hover": Object.freeze({
    light: "color/orange/800",
    dark: "color/orange/200",
  }),
});

const intentIds = Object.freeze([
  "accent",
  "info",
  "success",
  "destructive",
  "warning",
]);
const readableRoleIds = Object.freeze(Object.keys(expectedReferences));

assert(
  semanticTextColorRoles.length === 15,
  "Expected exactly 15 admitted text color roles",
);
assert(
  Object.keys(semanticTextColorRolesById).length ===
    semanticTextColorRoles.length,
  "Duplicate text color identity",
);

for (const [roleId, modeReferences] of Object.entries(expectedReferences)) {
  const role = semanticTextColorRolesById[roleId];
  assert(
    role?.kind === "opaque-mode-alias",
    `Missing reference-backed text color role: ${roleId}`,
  );

  for (const [modeId, referenceId] of Object.entries(modeReferences)) {
    assert(
      role.modes[modeId].referenceId === referenceId,
      `Text color mapping drifted: ${roleId}/${modeId}`,
    );

    const foreground = referenceColorsById[referenceId].value;
    for (const surfaceId of ["color/surface/canvas", "color/surface/base"]) {
      const surface = semanticSurfaceRolesById[surfaceId];
      const backgroundReferenceId = surface.modes[modeId].referenceId;
      const background = referenceColorsById[backgroundReferenceId].value;
      assert(
        contrastRatio(foreground, background) >= 4.5,
        `Text color fails 4.5:1 on ${surfaceId}: ${roleId}/${modeId}`,
      );
    }
  }
}

const disabledRole = semanticTextColorRolesById["color/text/disabled"];
const disabledOpacity = referenceOpacityById["opacity/48"];
assert(
  disabledRole?.kind === "color-opacity-composition" &&
    disabledRole.baseSemanticId === "color/text/primary" &&
    disabledRole.opacityReferenceId === "opacity/48" &&
    disabledRole.resolvedOpacity === disabledOpacity.value,
  "Disabled text must compose primary text with opacity/48",
);

for (const modeId of ["light", "dark"]) {
  const primaryReferenceId =
    semanticTextColorRolesById[disabledRole.baseSemanticId].modes[modeId]
      .referenceId;
  const foreground = referenceColorsById[primaryReferenceId].value;

  for (const surfaceId of ["color/surface/canvas", "color/surface/base"]) {
    const backgroundReferenceId =
      semanticSurfaceRolesById[surfaceId].modes[modeId].referenceId;
    const background = referenceColorsById[backgroundReferenceId].value;
    const compositedForeground = compositeColor(
      foreground,
      background,
      disabledOpacity.value,
    );
    const mutedReferenceId =
      semanticTextColorRolesById["color/text/muted"].modes[modeId].referenceId;
    const mutedForeground = referenceColorsById[mutedReferenceId].value;
    const disabledContrast = contrastRatio(compositedForeground, background);
    assert(
      disabledContrast >= 2.9 &&
        disabledContrast < contrastRatio(mutedForeground, background),
      `Disabled text must remain visible but weaker than muted: ${surfaceId}/${modeId}`,
    );
  }
}

for (const intent of intentIds) {
  const defaultRole =
    semanticTextColorRolesById[`color/text/${intent}/default`];
  const hoverRole = semanticTextColorRolesById[`color/text/${intent}/hover`];
  assert(
    defaultRole && hoverRole,
    `Missing default or hover text intent: ${intent}`,
  );
  assert(
    !semanticTextColorRolesById[`color/text/${intent}/disabled`],
    `Intent-specific disabled alias must not exist: ${intent}`,
  );

  for (const modeId of ["light", "dark"]) {
    const defaultColor =
      referenceColorsById[defaultRole.modes[modeId].referenceId].value;
    const hoverColor =
      referenceColorsById[hoverRole.modes[modeId].referenceId].value;
    for (const surfaceId of ["color/surface/canvas", "color/surface/base"]) {
      const backgroundReferenceId =
        semanticSurfaceRolesById[surfaceId].modes[modeId].referenceId;
      const background = referenceColorsById[backgroundReferenceId].value;
      assert(
        contrastRatio(hoverColor, background) >
          contrastRatio(defaultColor, background),
        `Hover text must strengthen contrast: ${intent}/${modeId}/${surfaceId}`,
      );
    }
  }
}

assert(
  readableRoleIds.length === 14 &&
    semanticTextColorPolicy.hierarchy === "primary-secondary-muted-disabled" &&
    semanticTextColorPolicy.typographyCoupling === "prohibited" &&
    semanticTextColorPolicy.disabledMeaning === "admitted-inert-content-only" &&
    semanticTextColorPolicy.disabledConsumerRequirement ===
      "inactive-control-semantics-required" &&
    semanticTextColorPolicy.disabledContrastBoundary ===
      "inactive-controls-only-primary-plus-opacity-48" &&
    semanticTextColorPolicy.disabledHoverResponse === "prohibited" &&
    semanticTextColorPolicy.validationErrorRoleId ===
      "color/text/error/default" &&
    semanticTextColorPolicy.validationErrorMeaning ===
      "validation-feedback-not-destructive-action" &&
    semanticTextColorPolicy.interactiveIntents.join(",") ===
      intentIds.join(",") &&
    semanticTextColorPolicy.interactiveStates.join(",") === "default,hover" &&
    semanticTextColorPolicy.intentDisabledAliases ===
      "prohibited-use-universal-disabled-state" &&
    semanticTextColorPolicy.inverseOrOnAccentMeaning === "deferred" &&
    semanticTextColorPolicy.decorativeOnColorMeaning === "deferred" &&
    semanticTextColorPolicy.statusMeaning ===
      "content-only-no-surface-border-or-icon-inference" &&
    semanticTextColorPolicy.shadeNumberAccessibilityClaim === "prohibited",
  "Text color semantic boundary drifted",
);

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
const storyCss = await readFile(
  new URL(
    "../src/foundations/ContentColors.stories.module.css",
    import.meta.url,
  ),
  "utf8",
);
const storySource = await readFile(
  new URL("../src/foundations/ContentColors.stories.tsx", import.meta.url),
  "utf8",
);
const fieldCss = await readFile(
  new URL("../src/components/Field/Field.module.css", import.meta.url),
  "utf8",
);

function storyAdoptsTextRole(role) {
  if (storyCss.includes(`color: var(${role.cssVariable})`)) {
    return true;
  }

  const [, family, intent, state] = role.id.split("/");
  return (
    family === "text" &&
    intentIds.includes(intent) &&
    state !== undefined &&
    storySource.includes("--color-text-${role.id}-${state}")
  );
}

for (const [roleId, modeReferences] of Object.entries(expectedReferences)) {
  const role = semanticTextColorRolesById[roleId];
  for (const referenceId of Object.values(modeReferences)) {
    const reference = referenceColorsById[referenceId];
    assert(
      css.includes(`${role.cssVariable}: var(${reference.cssVariable});`),
      `Text color CSS mapping is missing: ${role.id} -> ${reference.id}`,
    );
  }
  assert(
    role.id === "color/text/error/default"
      ? fieldCss.includes(`color: var(${role.cssVariable})`)
      : storyAdoptsTextRole(role),
    `Text color consumer evidence is missing: ${role.cssVariable}`,
  );
}

const disabledCssComposition =
  /--color-text-disabled:\s*rgb\(\s*from\s+var\(--color-text-primary\)\s+r\s+g\s+b\s*\/\s*var\(--ref-opacity-48\)\s*\);/gu;
assert(
  [...css.matchAll(disabledCssComposition)].length === 4,
  "Disabled text CSS must compose primary text with opacity/48 in every theme scope",
);
assert(
  storyCss.includes("color: var(--color-text-disabled)"),
  "Disabled text Storybook adoption is missing",
);

for (const intent of intentIds) {
  assert(
    !css.includes(`--color-text-${intent}-disabled`) &&
      !storyCss.includes(`.${intent}Disabled`),
    `Intent-specific disabled adapter must not exist: ${intent}`,
  );
}

assert(
  !css.includes("--color-text-muted: GrayText"),
  "Legacy system muted text remains",
);
assert(
  !css.includes("--color-text-primary: CanvasText"),
  "Legacy system primary text remains",
);
const textSemanticCss = [...css.matchAll(/--color-text-[\w-]+:\s*[^;]+;/gu)]
  .map(([declaration]) => declaration)
  .join("\n");
assert(
  !/(?:rgba?\(|#[0-9a-f]{3,8}\b)/iu.test(
    textSemanticCss.replace(disabledCssComposition, ""),
  ),
  "Text semantics must not store flattened or raw color values",
);

console.log(
  [
    "Semantic text color validation PASS",
    `roles=${semanticTextColorRoles.length}`,
    "hierarchy=primary/secondary/muted/disabled",
    "intents=accent/info/success/destructive/warning",
    "intentStates=default/hover",
    "intentDisabledAliases=ABSENT",
    "readableCanvasBaseContrast>=4.5",
    "disabled=PRIMARY+OPACITY48",
    "disabledScope=INACTIVE_CONTROLS_ONLY",
    "disabledContrastBelowMuted=PASS",
    "disabledHover=PROHIBITED",
    "validationError=DEDICATED_NON_DESTRUCTIVE_MEANING",
    "typographyCoupling=ABSENT",
    "inverseOnColor=DEFERRED",
    "decorativeOnColor=DEFERRED",
    "statusSurfaceBorderIcon=UNADMITTED",
  ].join(" "),
);
