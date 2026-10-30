import { readFile } from "node:fs/promises";

import { referenceColorsById } from "./reference-colors.mjs";
import {
  semanticFocusColorPolicy,
  semanticFocusColorRoles,
  semanticFocusColorRolesById,
} from "./semantic-focus-colors.mjs";
import {
  semanticSurfaceForegroundRolesById,
  semanticSurfaceRoles,
  semanticSurfaceRolesById,
} from "./semantic-surfaces.mjs";
import { assert, contrastRatio } from "./validation-helpers.mjs";

function assertContrast(surfaceReferenceId, focusRoleId, label) {
  const surface = referenceColorsById[surfaceReferenceId];
  const focusRole = semanticFocusColorRolesById[focusRoleId];
  const focus = referenceColorsById[focusRole?.referenceId];

  assert(surface && focus, `Missing focus contrast input: ${label}`);
  assert(
    contrastRatio(surface.value, focus.value) >=
      semanticFocusColorPolicy.minimumAdjacentContrast,
    `Focus indicator fails 3:1 against ${label}`,
  );
}

assert(
  semanticFocusColorRoles.length === 2,
  "Expected exactly two focus polarities",
);
assert(
  semanticFocusColorRolesById["color/focus/on-light"]?.referenceId ===
    "color/neutral/950" &&
    semanticFocusColorRolesById["color/focus/on-dark"]?.referenceId ===
      "color/basic/white",
  "Focus polarity mappings drifted",
);
assert(
  semanticFocusColorRoles.every(
    (role) => role.kind === "opaque-reference-alias",
  ),
  "Focus indicators must remain opaque",
);
assert(
  semanticFocusColorPolicy.mechanism === "outer-outline" &&
    semanticFocusColorPolicy.activation === "focus-visible" &&
    semanticFocusColorPolicy.widthId === "border/width/2" &&
    semanticFocusColorPolicy.offsetSourcePx === 2 &&
    semanticFocusColorPolicy.colorSelectionContext ===
      "perimeter-surface-not-control-fill" &&
    semanticFocusColorPolicy.intentSpecificMatrix === "prohibited" &&
    semanticFocusColorPolicy.runtimePixelSampling === "prohibited" &&
    semanticFocusColorPolicy.innerIndicator === "not-admitted" &&
    semanticFocusColorPolicy.shadowRing === "not-admitted" &&
    semanticFocusColorPolicy.outlineGuard === "not-admitted" &&
    semanticFocusColorPolicy.forcedColorsAdapter === "Highlight",
  "Focus indicator policy drifted",
);

for (const modeId of ["light", "dark"]) {
  const focusRoleId = semanticFocusColorPolicy.defaultRoleByColorScheme[modeId];

  for (const layerId of ["canvas", "base", "raised", "overlay"]) {
    const surfaceRole = semanticSurfaceRolesById[`color/surface/${layerId}`];
    assertContrast(
      surfaceRole.modes[modeId].referenceId,
      focusRoleId,
      `${layerId}/${modeId}`,
    );
  }
}

for (const surfaceRole of semanticSurfaceRoles.filter(
  (role) => role.kind === "opaque-mode-alias" && role.id.includes("/strong/"),
)) {
  for (const modeId of ["light", "dark"]) {
    assertContrast(
      surfaceRole.modes[modeId].referenceId,
      semanticFocusColorPolicy.strongSurfaceRoleByForegroundReference[
        semanticSurfaceForegroundRolesById[
          `color/foreground/on-${surfaceRole.id.split("/")[2]}-strong`
        ].modes[modeId].referenceId
      ],
      `${surfaceRole.id}/${modeId}`,
    );
  }
}

const [tokensCss, baseCss, storySource, storyCss] = await Promise.all([
  readFile(new URL("../src/tokens.css", import.meta.url), "utf8"),
  readFile(new URL("../src/base.css", import.meta.url), "utf8"),
  readFile(
    new URL("../src/foundations/FocusColors.stories.tsx", import.meta.url),
    "utf8",
  ),
  readFile(
    new URL(
      "../src/foundations/FocusColors.stories.module.css",
      import.meta.url,
    ),
    "utf8",
  ),
]);

for (const role of semanticFocusColorRoles) {
  const reference = referenceColorsById[role.referenceId];
  assert(
    tokensCss.includes(`${role.cssVariable}: var(${reference.cssVariable});`),
    `Focus CSS mapping is missing: ${role.id}`,
  );
}
assert(
  tokensCss.includes("--focus-indicator-color: var(--color-focus-on-light);") &&
    tokensCss.includes("--focus-indicator-color: var(--color-focus-on-dark);"),
  "Focus contextual default mappings are missing",
);
assert(
  !tokensCss.includes("--color-focus-ring") &&
    !storySource.includes("Inner indicator") &&
    !storySource.includes("Shadow ring") &&
    !storySource.includes("Outline + guard") &&
    !storyCss.includes("box-shadow"),
  "Superseded focus mechanism legacy remains",
);
assert(
  baseCss.includes(
    "outline: var(--focus-indicator-width) solid var(--focus-indicator-color)",
  ) &&
    baseCss.includes("outline-offset: var(--focus-indicator-offset)") &&
    baseCss.includes("outline-color: Highlight"),
  "Focus Web or forced-colors adapter drifted",
);
assert(
  storySource.includes("data-focus-context={context.id}") &&
    storySource.includes("styles.staticFocus") &&
    storyCss.includes("--focus-indicator-color: var(--color-focus-on-dark);") &&
    storyCss.includes("--focus-indicator-color: var(--color-focus-on-light);"),
  "Focus Storybook context proof drifted",
);

console.log(
  [
    "SAVI-70 semantic focus color validation PASS",
    `roles=${semanticFocusColorRoles.length}`,
    "mechanism=OUTER_OUTLINE",
    "geometry=2PX_OFFSET_2PX",
    "selection=PERIMETER_SURFACE",
    "opacity=OPAQUE",
    "intentMatrix=ABSENT",
    "rejectedMechanismLegacy=ABSENT",
    "contrast=PASS",
    "forcedColors=HIGHLIGHT",
  ].join(" "),
);
