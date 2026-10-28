import { segmentedTabsRadii, selectionPanelRadii, switchThumbRadius } from "./component-radii.mjs";
import { cardResponsiveRadii } from "./component-card.mjs";
import { readdir, readFile } from "node:fs/promises";

import {
  borderFocusPolicy,
  focusIndicator,
  referenceBorderWidths,
  semanticBorderWidths,
} from "./border-focus.mjs";
import {
  elevationOpacityAliases,
  elevationPolicy,
  elevationRoles,
  elevationTints,
  elevationUsageByRoleId,
  neutralElevationOpacity,
  referenceShadowGeometry,
} from "./elevation.mjs";
import { referenceOpacityById } from "./reference-opacity.mjs";
import {
  motionEasings,
  motionPolicy,
  reducedMotionPolicy,
  referenceDurations,
  semanticDurations,
} from "./motion.mjs";
import { assertRadiusScale, fullRadius, getRadiusWebValue, radiusCandidateSpaceIds, radiusScale, radiusGeometryPolicy } from "./radius-geometry.mjs";
import { referenceSpacingById } from "./reference-spacing.mjs";
import {
  fixedLayoutRadii,
  fixedUiRadii,
  intrinsicRoundRadius,
  resolveConcentricInnerRadius,
  resolveConcentricOuterRadius,
  responsiveLayoutOuterRadius,
  semanticRadiusPolicy,
} from "./semantic-radii.mjs";
import { assert } from "./validation-helpers.mjs";

const {
  durationUsage: motionUsageByDurationId,
  easingUsage: motionUsageByEasingId,
  property: motionPropertyPolicy,
  transition: motionTransitionPolicy,
} = motionPolicy;

const radiusCoordinates = radiusCandidateSpaceIds.map(id => referenceSpacingById[id]);

const EXPECTED_RADIUS_VALUES = Object.freeze([
  0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 32,
]);
const EXPECTED_UI_RADII = Object.freeze([4, 4, 6, 8, 12]);
const EXPECTED_LAYOUT_RADII = Object.freeze([6, 8, 12, 16, 24, 32]);
const EXPECTED_RESPONSIVE_OUTER = Object.freeze([8, 12, 16, 24]);
const EXPECTED_BORDER_WIDTHS = Object.freeze([0, 1, 2]);
const EXPECTED_SHADOW_GEOMETRY = Object.freeze([
  ["shadow/offset/x/0", 0],
  ["shadow/offset/x/1", 1],
  ["shadow/offset/x/2", 2],
  ["shadow/offset/x/4", 4],
  ["shadow/offset/y/0", 0],
  ["shadow/offset/y/1", 1],
  ["shadow/offset/y/2", 2],
  ["shadow/offset/y/4", 4],
  ["shadow/offset/y/8", 8],
  ["shadow/blur/2", 2],
  ["shadow/blur/4", 4],
  ["shadow/blur/12", 12],
  ["shadow/blur/16", 16],
  ["shadow/blur/24", 24],
  ["shadow/blur/48", 48],
  ["shadow/spread/0", 0],
]);
const EXPECTED_DURATIONS = Object.freeze([0, 120, 200, 320, 480]);
const EXPECTED_EASINGS = Object.freeze([
  ["motion/easing/linear", "linear"],
  ["motion/easing/standard", "cubic-bezier(0.2, 0, 0, 1)"],
  ["motion/easing/enter", "cubic-bezier(0, 0, 0.2, 1)"],
  ["motion/easing/exit", "cubic-bezier(0.4, 0, 1, 1)"],
]);

function parseCssCustomProperties(css) {
  return new Map(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/giu)].map((match) => [
      match[1],
      match[2].trim().replaceAll(/\s+/gu, " "),
    ]),
  );
}

assert(
  radiusCoordinates
    .map((token) => token.sourcePx)
    .join(",") === EXPECTED_RADIUS_VALUES.join(","),
  "Radius reference scale drifted",
);
assert(
  fullRadius.id === "radius/full",
  "Full radius reference is missing",
);
assert(
  radiusGeometryPolicy.numericCoordinateOwner === "space" &&
    radiusGeometryPolicy.scaling === "independent-radius-output-only" &&
    radiusGeometryPolicy.candidateSelection === "explicit-subset",
  "Radius must share space coordinates while retaining its own scale and candidate subset",
);
assert(
  fixedUiRadii.map((token) => token.resolvedSourcePx).join(",") ===
    EXPECTED_UI_RADII.join(","),
  "Fixed UI radius mapping drifted",
);
assert(
  fixedLayoutRadii.map((token) => token.resolvedSourcePx).join(",") ===
    EXPECTED_LAYOUT_RADII.join(","),
  "Fixed layout radius mapping drifted",
);
assert(
  Object.values(responsiveLayoutOuterRadius.modes)
    .map((mode) => mode.resolvedSourcePx)
    .join(",") === EXPECTED_RESPONSIVE_OUTER.join(","),
  "Responsive outer radius mapping drifted",
);
assert(
  semanticRadiusPolicy.universalInnerToken === "prohibited" &&
    semanticRadiusPolicy.runtimeJavaScript === "prohibited" &&
    semanticRadiusPolicy.concentricOuterSelection ===
      "next-admitted-reference-strictly-above-inner-plus-inset" &&
    semanticRadiusPolicy.tieBreak === "larger-reference" &&
    semanticRadiusPolicy.opticalSoftening ===
      "bounded-existing-reference-up-to-2px" &&
    semanticRadiusPolicy.opticalMinimumIdealSourcePx === 4 &&
    semanticRadiusPolicy.opticalMaximumCompensationSourcePx === 2 &&
    semanticRadiusPolicy.opticalInnerMustRemainBelowOuter === true &&
    semanticRadiusPolicy.opticalAppliesToFullRadius === false &&
    semanticRadiusPolicy.opticalAppliesToUiControls === false &&
    semanticRadiusPolicy.opticalThemeOrColorCoupling === "prohibited" &&
    semanticRadiusPolicy.concentricRelationshipBoundary ===
      "inset-below-outer-radius" &&
    semanticRadiusPolicy.separatedChildBoundary ===
      "inset-at-least-outer-radius" &&
    semanticRadiusPolicy.separatedChildRadiusSelection ===
      "explicit-semantic-layout-role",
  "Nested radius optical-softening policy drifted",
);

const exactNested = resolveConcentricInnerRadius({
  outerRadiusId: "radius/layout/fixed/sm",
  insetSpacingId: "space/1",
  borderWidthId: "border/width/0",
});
assert(
  exactNested.idealSourcePx === 4 &&
    exactNested.strictInnerReferenceId === "space/1" &&
    exactNested.innerReferenceId === "space/1.5" &&
    exactNested.opticalCompensationSourcePx === 2,
  "Small nested radius must receive bounded 2px optical softening",
);
const roundedNested = resolveConcentricInnerRadius({
  outerRadiusId: "radius/layout/fixed/md",
  insetSpacingId: "space/2",
  borderWidthId: "border/width/1",
});
assert(
  roundedNested.idealSourcePx === 3 &&
    roundedNested.innerReferenceId === "space/1" &&
    roundedNested.opticalCandidateSelected === false,
  "Sub-4px nested radius must use strict nearest resolution with a larger tie-break",
);
const responsiveNested = resolveConcentricInnerRadius({
  outerRadiusId: "radius/layout/responsive/outer",
  modeId: "lg",
  insetSpacingId: "space/1",
  borderWidthId: "border/width/0",
});
assert(
  responsiveNested.innerReferenceId === "space/3",
  "Responsive nested radius resolution drifted",
);

for (const fixture of [
  ["radius/layout/fixed/xl", "space/4", "border/width/0", 8, 10, 2],
  ["radius/layout/fixed/xl", "space/4", "border/width/1", 8, 8, 1],
  ["radius/layout/fixed/lg", "space/3", "border/width/0", 4, 6, 2],
  ["radius/layout/fixed/lg", "space/2", "border/width/1", 8, 8, 1],
  ["radius/layout/fixed/2xl", "space/4", "border/width/0", 16, 16, 0],
]) {
  const [
    outerRadiusId,
    insetSpacingId,
    borderWidthId,
    strictPx,
    resolvedPx,
    opticalPx,
  ] = fixture;
  const result = resolveConcentricInnerRadius({
    outerRadiusId,
    insetSpacingId,
    borderWidthId,
  });

  assert(
    result.strictResolvedInnerSourcePx === strictPx &&
      result.resolvedInnerSourcePx === resolvedPx &&
      result.opticalCompensationSourcePx === opticalPx &&
      result.resolvedInnerSourcePx < result.resolvedOuterSourcePx,
    `Bounded optical nested radius drifted: ${outerRadiusId}/${insetSpacingId}/${borderWidthId}`,
  );
}

for (const [modeId, insetSpacingId, expectedPx] of [
  ["sm", "space/1", 6],
  ["md", "space/2", 6],
  ["lg", "space/3", 6],
  ["xl", "space/4", 10],
]) {
  const result = resolveConcentricInnerRadius({
    outerRadiusId: "radius/layout/responsive/outer",
    modeId,
    insetSpacingId,
    borderWidthId: "border/width/0",
  });

  assert(
    result.resolvedInnerSourcePx === expectedPx,
    `Responsive optical nested radius drifted: ${modeId}`,
  );
}

// Re-resolve discrete reference selection; scaling the old selected inner is incorrect.
for (const [scale, outer, ideal, referenceId, inner, correction, optical] of [
  [0.75, 18, 2, "space/0.5", 1.5, 0, false],
  [1, 24, 8, "space/2.5", 10, 2, true],
  [1.25, 30, 14, "space/3", 15, 1, true],
  [2, 48, 32, "space/4", 32, 0, true],
  [3, 72, 56, "space/5", 60, 0, false],
]) {
  const result = resolveConcentricInnerRadius({ outerRadiusId: "radius/layout/fixed/xl", insetSpacingId: "space/4", borderWidthId: "border/width/0", scale });
  assert(result.resolvedOuterSourcePx === outer && result.idealSourcePx === ideal &&
    result.innerReferenceId === referenceId && result.resolvedInnerSourcePx === inner &&
    result.opticalCompensationSourcePx === correction && result.opticalCandidateSelected === optical &&
    result.resolvedInnerSourcePx < outer && result.resolvedInsetSourcePx === 16,
  `Scale-aware optical reference selection drifted: ${scale}`);
}
for (const options of [
  { outerRadiusId: "radius/layout/fixed/sm", insetSpacingId: "space/2", borderWidthId: "border/width/0" },
  { outerRadiusId: "radius/layout/fixed/sm", insetSpacingId: "space/3", borderWidthId: "border/width/0" },
  { outerRadiusId: "radius/layout/fixed/xl", insetSpacingId: "space/4", borderWidthId: "border/width/0", scale: 0.5 },
  { outerRadiusId: "radius/layout/fixed/xl", insetSpacingId: "space/4", borderWidthId: "border/width/0", scale: 0 },
  { outerRadiusId: "radius/ui/lg", insetSpacingId: "space/1", borderWidthId: "border/width/0" },
  { outerRadiusId: "radius/full", insetSpacingId: "space/1", borderWidthId: "border/width/0" },
]) {
  let rejected = false;
  try { resolveConcentricInnerRadius(options); } catch { rejected = true; }
  assert(rejected, `Out-of-domain optical composition accepted: ${JSON.stringify(options)}`);
}

const radiusStorySource = await readFile(
  new URL("../src/foundations/Radius.stories.tsx", import.meta.url),
  "utf8",
);
const radiusStoryCss = await readFile(
  new URL("../src/foundations/Radius.stories.module.css", import.meta.url),
  "utf8",
);

assert(
  radiusStorySource.includes('id: "foundations-radius"') &&
    radiusStorySource.includes("export const Reference") &&
    radiusStorySource.includes("export const UI") &&
    radiusStorySource.includes("export const Layout") &&
    radiusStorySource.includes("export const Nesting") &&
    radiusStorySource.includes("radiusCandidateSpaceIds.map") &&
    radiusStorySource.includes("fixedUiRadii.map") &&
    radiusStorySource.includes("fixedLayoutRadii.map") &&
    radiusStorySource.includes(
      "Object.entries(responsiveLayoutOuterRadius.modes)",
    ),
  "Foundations/Radius Storybook inventory drifted",
);

for (const [id, outerId, spacingId, expectedStrictPx, expectedOpticalPx] of [
  ["small", "radius/layout/fixed/lg", "space/3", 4, 6],
  ["medium", "radius/layout/fixed/xl", "space/4", 8, 10],
  ["large", "radius/layout/fixed/2xl", "space/6", 8, 10],
]) {
  const result = resolveConcentricInnerRadius({
    outerRadiusId: outerId,
    insetSpacingId: spacingId,
    borderWidthId: "border/width/0",
  });

  assert(
    result.strictResolvedInnerSourcePx === expectedStrictPx &&
      result.resolvedInnerSourcePx === expectedOpticalPx &&
      radiusStorySource.includes(`id: "${id}"`) &&
      radiusStoryCss.includes(
        `--demo-corner-strict-radius: ${result.strictResolvedInnerWebValue};`,
      ) &&
      radiusStoryCss.includes(
        `--demo-corner-optical-radius: ${result.resolvedInnerWebValue};`,
      ),
    `Radius Storybook corner-softening comparison drifted: ${id}`,
  );
}

assert(
  radiusStorySource.includes('id: "extra-large"') &&
    radiusStorySource.includes('kind: "independent"') &&
    radiusStorySource.includes("independentRadius: 12") &&
    radiusStoryCss.includes(
      "--demo-corner-independent-radius: var(--radius-layout-fixed-md);",
    ),
  "Separated Extra Large nested Surface must use the explicit 12px layout role",
);

assert(
  referenceBorderWidths.map((token) => token.sourcePx).join(",") ===
    EXPECTED_BORDER_WIDTHS.join(","),
  "Border-width reference scale drifted",
);
assert(
  semanticBorderWidths.map((token) => token.resolvedSourcePx).join(",") ===
    "1,2",
  "Semantic border-width mapping drifted",
);
assert(
  focusIndicator.widthId === "border/width/2" &&
    focusIndicator.offsetSourcePx === 2,
  "Focus indicator geometry drifted",
);
assert(
  borderFocusPolicy.referenceZeroPurpose ===
    "technical-coordinate-not-visible-border-role" &&
    borderFocusPolicy.semanticAbsence ===
      "component-contract-not-global-token" &&
    borderFocusPolicy.componentSizeMatrix === "prohibited" &&
    borderFocusPolicy.componentAliases ===
      "deferred-until-evidenced-component-contract" &&
    borderFocusPolicy.stateChangesStructuralWidth === false &&
    borderFocusPolicy.focusChangesStructuralWidth === false &&
    borderFocusPolicy.selectedChangesStructuralWidth === false &&
    borderFocusPolicy.focusMechanism === "outer-outline" &&
    borderFocusPolicy.focusShadowRing === "not-admitted" &&
    borderFocusPolicy.focusInnerIndicator === "not-admitted" &&
    borderFocusPolicy.focusOutlineGuard === "not-admitted",
  "Button structural edge policy drifted",
);
assert(
  semanticBorderWidths.map((token) => token.id).join(",") ===
    "border/width/default,border/width/strong" &&
    !semanticBorderWidths.some((token) => token.id === "border/width/none"),
  "Border-width semantics must remain default/strong without a global none role",
);

assert(
  referenceShadowGeometry
    .map((token) => [token.id, token.sourcePx])
    .join("|") === EXPECTED_SHADOW_GEOMETRY.join("|"),
  "Shadow geometry references drifted",
);
assert(
  elevationRoles.map((role) => role.id).join(",") ===
    "elevation/none,elevation/raised,elevation/floating,elevation/overlay",
  "Elevation roles drifted",
);
assert(
  Object.keys(elevationUsageByRoleId).join(",") ===
    elevationRoles.map((role) => role.id).join(",") &&
    elevationUsageByRoleId["elevation/none"].relationship === "same-plane" &&
    elevationUsageByRoleId["elevation/raised"].relationship ===
      "persistent-raised" &&
    elevationUsageByRoleId["elevation/floating"].modality === "non-modal" &&
    elevationUsageByRoleId["elevation/floating"].scrim === "absent" &&
    elevationUsageByRoleId["elevation/overlay"].modality === "modal" &&
    elevationUsageByRoleId["elevation/overlay"].scrim === "required" &&
    elevationPolicy.defaultRoleId === "elevation/none" &&
    elevationPolicy.selectionOwner ===
      "admitted-component-or-composition-contract" &&
    elevationPolicy.weakestSufficientRelationshipOnly === true &&
    elevationPolicy.runtimeAutoInference === "prohibited" &&
    elevationPolicy.componentNameInference === "prohibited" &&
    elevationPolicy.colorOrStatusInference === "prohibited" &&
    elevationPolicy.viewportInference === "prohibited" &&
    elevationPolicy.borderCoupling === "prohibited" &&
    elevationPolicy.surfaceCoupling === "prohibited" &&
    elevationPolicy.stackingOrderCoupling === "prohibited",
  "Elevation role-selection contract drifted",
);
assert(
  elevationRoles[0].layers.length === 0,
  "Elevation none must have zero layers",
);
assert(
  elevationRoles.slice(1).every((role) => role.layers.length === 2),
  "Every non-zero elevation must contain key and ambient layers",
);
assert(
  elevationRoles
    .slice(1)
    .map((role) =>
      role.layers
        .map(
          (layer) =>
            `${layer.kind}:${layer.offsetXId}:${layer.offsetYId}:${layer.blurId}:${layer.spreadId}`,
        )
        .join("+"),
    )
    .join("|") ===
    [
      "key:shadow/offset/x/0:shadow/offset/y/0:shadow/blur/2:shadow/spread/0+ambient:shadow/offset/x/1:shadow/offset/y/1:shadow/blur/4:shadow/spread/0",
      "key:shadow/offset/x/0:shadow/offset/y/0:shadow/blur/2:shadow/spread/0+ambient:shadow/offset/x/2:shadow/offset/y/4:shadow/blur/16:shadow/spread/0",
      "key:shadow/offset/x/0:shadow/offset/y/0:shadow/blur/2:shadow/spread/0+ambient:shadow/offset/x/4:shadow/offset/y/8:shadow/blur/48:shadow/spread/0",
    ].join("|"),
  "Elevation key and ambient geometry drifted",
);
assert(
  elevationOpacityAliases
    .map((token) =>
      [
        token.id,
        token.modes.light.referenceId,
        token.modes.dark.referenceId,
      ].join(":"),
    )
    .join("|") ===
    "elevation/opacity/key:opacity/16:opacity/24|elevation/opacity/ambient:opacity/8:opacity/8",
  "Elevation opacity aliases drifted",
);
assert(
  elevationPolicy.neutralOpacity === neutralElevationOpacity &&
    Object.entries(neutralElevationOpacity)
      .map(([kind, modes]) => `${kind}:${modes.light.referenceId}:${modes.dark.referenceId}`)
      .join("|") === "key:opacity/16:opacity/32|ambient:opacity/8:opacity/24",
  "Neutral elevation composition opacity drifted",
);
assert(
  elevationTints.map((token) => token.id).join(",") ===
    "elevation/tint/key/default,elevation/tint/ambient/neutral,elevation/tint/ambient/accent,elevation/tint/ambient/info,elevation/tint/ambient/success,elevation/tint/ambient/warning,elevation/tint/ambient/destructive" &&
    elevationTints[0].modes.light.referenceId === "color/neutral/950" &&
    elevationTints[0].modes.dark.referenceId === "color/basic/black" &&
    elevationTints.slice(1).every((token) => token.kind === "ambient") &&
    elevationPolicy.layers.join(",") === "key,ambient" &&
    elevationPolicy.lightSource === "upper-left" &&
    elevationPolicy.keyCastDirection === "centered-contact" &&
    elevationPolicy.ambientCastDirection === "positive-x-positive-y" &&
    elevationPolicy.borderDefault ===
      "absent-when-fill-spacing-and-elevation-preserve-boundary" &&
    elevationPolicy.borderOptIn ===
      "only-for-required-boundary-state-or-accessibility-evidence" &&
    elevationPolicy.geometryChangesByInteractionState === false &&
    elevationPolicy.intentAutomaticallySelectedFromStatus === false &&
    elevationPolicy.ambientIntentAdapterAttribute ===
      "data-hito-elevation-intent" &&
    elevationPolicy.tintMatrixGeneration === "prohibited" &&
    elevationPolicy.canonicalFlattenedRgbaAllowed === false,
  "Elevation tint composition policy drifted",
);

assert(
  referenceDurations.map((token) => token.milliseconds).join(",") ===
    EXPECTED_DURATIONS.join(","),
  "Motion duration references drifted",
);
assert(
  semanticDurations.map((token) => token.resolvedMilliseconds).join(",") ===
    EXPECTED_DURATIONS.join(","),
  "Semantic duration aliases drifted",
);
assert(
  motionEasings.map((token) => [token.id, token.webValue]).join("|") ===
    EXPECTED_EASINGS.join("|"),
  "Motion easing values drifted",
);
assert(
  reducedMotionPolicy.spatialDurationId === "motion/duration/instant" &&
    reducedMotionPolicy.orientationFadeDurationId ===
      "motion/duration/feedback" &&
    reducedMotionPolicy.globalReferenceOverride === "prohibited",
  "Reduced-motion policy drifted",
);
assert(
  motionPolicy.propertyDurationEasingMatrix === "prohibited",
  "Motion must remain compositional rather than Cartesian",
);
assert(
  Object.keys(motionUsageByDurationId).join(",") ===
    semanticDurations.map((token) => token.id).join(",") &&
    Object.keys(motionUsageByEasingId).join(",") ===
      motionEasings.map((token) => token.id).join(",") &&
    motionPolicy.durationUsage === motionUsageByDurationId &&
    motionPolicy.easingUsage === motionUsageByEasingId,
  "Motion role usage contract drifted",
);
assert(
  motionPropertyPolicy.preferredSpatialProperties.join(",") ===
    "opacity,transform" &&
    motionPropertyPolicy.transitionAll === "prohibited" &&
    motionPropertyPolicy.layoutAffectingProperties ===
      "component-specific-evidence-and-performance-validation-only" &&
    motionPropertyPolicy.focusIndicator === "immediate" &&
    motionPropertyPolicy.meaningOnlyInMotion === "prohibited" &&
    motionPolicy.property === motionPropertyPolicy,
  "Motion property policy drifted",
);
assert(
  motionTransitionPolicy.enter.durationId === "motion/duration/reveal" &&
    motionTransitionPolicy.enter.easingId === "motion/easing/enter" &&
    motionTransitionPolicy.exit.durationId === "motion/duration/transition" &&
    motionTransitionPolicy.exit.easingId === "motion/easing/exit" &&
    motionTransitionPolicy.exitMustNotExceedEnter === true &&
    motionTransitionPolicy.componentRecipes ===
      "deferred-to-admitted-component-contract" &&
    motionPolicy.transition === motionTransitionPolicy &&
    semanticDurations.find(
      (token) => token.id === motionTransitionPolicy.exit.durationId,
    )?.resolvedMilliseconds <=
      semanticDurations.find(
        (token) => token.id === motionTransitionPolicy.enter.durationId,
      )?.resolvedMilliseconds,
  "Motion enter and exit contract drifted",
);

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
const baseCss = await readFile(
  new URL("../src/base.css", import.meta.url),
  "utf8",
);
const cssProperties = parseCssCustomProperties(css);

assert(radiusScale.defaultValue === 1 && radiusScale.scope === "document-root", "Radius scale default/scope drifted");
for (const value of [0.1, 0.75, 1, 1.25, 3]) assertRadiusScale(value);
for (const value of [0, -1, NaN, Infinity, -Infinity, "1", null]) {
  let rejected = false;
  try { assertRadiusScale(value); } catch (error) { rejected = error instanceof RangeError; }
  assert(rejected, `Invalid radius scale accepted: ${value}`);
}
for (const coordinate of radiusCoordinates) {
  assert(coordinate.kind === "space", `Radius candidate must use a space coordinate: ${coordinate.id}`);
  assert(!coordinate.webValue.includes(radiusScale.cssVariable), `Radius scale leaked into space: ${coordinate.id}`);
  assert(getRadiusWebValue(coordinate.id) === (coordinate.sourcePx === 0 ? "0" : `calc(var(${coordinate.cssVariable}) * var(${radiusScale.cssVariable}))`),
    `Radius must scale exactly once: ${coordinate.id}`);
}
assert(fullRadius.webValue === "9999px" && getRadiusWebValue("space/0") === "0", "Intrinsic/zero radius must not scale");
for (const id of ["space/px", "space/3.5", "space/7"]) {
  let rejected = false;
  try { getRadiusWebValue(id); } catch (error) { rejected = error instanceof RangeError; }
  assert(rejected, `Unadmitted radius coordinate accepted: ${id}`);
}
assert(!/--ref-radius-\d/u.test(css), "Retired numeric radius adapter remains");
const cardCoordinateModes = cardResponsiveRadii.flatMap(radius => Object.entries(radius.modes)
  .filter(([, mode]) => mode.referenceId)
  .map(([viewport, mode]) => ({ viewport, ...mode })));
assert(cardCoordinateModes.length === 2 && cardCoordinateModes.every(mode => mode.viewport === "lg") &&
  cardCoordinateModes.map(mode => mode.referenceId).join(",") === "space/5,space/7",
  "Only the accepted LG Card cells may bypass the shared radius candidate subset");
for (const mode of cardCoordinateModes) {
  const reference = referenceSpacingById[mode.referenceId];
  assert(reference.kind === "space" && mode.resolvedSourcePx === reference.sourcePx &&
    mode.webValue === `calc(var(${reference.cssVariable}) * var(${radiusScale.cssVariable}))`,
    "Card coordinate recipe must scale its existing space reference exactly once");
}
assert((css.match(/var\(--radius-scale\)/gu) ?? []).length === fixedUiRadii.length + fixedLayoutRadii.length + Object.keys(responsiveLayoutOuterRadius.modes).length + 1 + cardCoordinateModes.length + segmentedTabsRadii.length,
  "Scale must appear only in independent semantic/component radius outputs");
const panelCss = await readFile(new URL("../src/components/selection-panel/SelectionPanel.module.css", import.meta.url), "utf8");
for (const [index, [size, inset, strict, referenceId]] of [["sm", "2xs", 8, "space/2"], ["md", "xs", 12, "space/3"], ["lg", "sm", 16, "space/4"]].entries()) {
  const token = selectionPanelRadii[index];
  assert(token.rowRadiusId === `radius/ui/${size}` && token.insetSpacingId === `ui/space/${inset}` && token.strictSourcePx === strict && token.resolvedSourcePx === strict && token.referenceId === referenceId,
    `SelectionPanel default geometry changed: ${size}`);
  assert(token.webValue === `calc(var(--radius-ui-${size}) + var(--ui-space-${inset}))` && panelCss.includes(`--panel-radius: var(${token.cssVariable})`),
    `SelectionPanel must use the strict scaled-row-plus-inset sum: ${size}`);
}
assert(resolveConcentricOuterRadius({ innerRadiusId: "radius/ui/sm", insetSpacingId: "space/1", scale: 0.5 }).outerReferenceId === "space/4",
  "Concentric outer resolution must consider radius scale without scaling inset");
for (const [index, [size, strict, compensated, referenceId]] of [["sm", 8, 10, "space/2.5"], ["md", 10, 12, "space/3"]].entries()) {
  const token = segmentedTabsRadii[index];
  assert(token.innerRadiusId === `radius/ui/${size}` && token.insetSpacingId === "ui/space/2xs" && token.strictSourcePx === strict && token.resolvedSourcePx === compensated && token.referenceId === referenceId,
    `Segmented Tabs outer geometry drifted: ${size}`);
  assert(token.webValue === `max(${getRadiusWebValue(referenceId)}, calc(var(--radius-ui-${size}) + var(--ui-space-2xs)))`,
    `Segmented Tabs must use an admitted outer radius with a low-scale concentric fallback: ${size}`);
}
assert(panelCss.includes("border-radius: calc(var(--panel-radius) + var(--border-width-default))"), "SelectionPanel forced-colors border inset is unaccounted for");

for (const token of [
  radiusScale,
  ...selectionPanelRadii,
  ...segmentedTabsRadii,
  fullRadius,
  ...referenceBorderWidths,
  ...referenceShadowGeometry,
  ...referenceDurations,
  ...motionEasings,
]) {
  assert(
    cssProperties.get(token.cssVariable) ===
      token.webValue.replaceAll(/\s+/gu, " "),
    `CSS reference adapter drifted: ${token.cssVariable}`,
  );
}
for (const token of [...fixedUiRadii, ...fixedLayoutRadii, intrinsicRoundRadius, switchThumbRadius]) {
  assert(
    cssProperties.get(token.cssVariable) === (token.referenceId === fullRadius.id
      ? `var(${fullRadius.cssVariable})`
      : getRadiusWebValue(token.referenceId)),
    `CSS semantic radius adapter drifted: ${token.cssVariable}`,
  );
}
for (const token of semanticBorderWidths) {
  const reference = referenceBorderWidths.find(
    (candidate) => candidate.id === token.referenceId,
  );
  assert(
    cssProperties.get(token.cssVariable) === `var(${reference?.cssVariable})`,
    `CSS semantic border adapter drifted: ${token.cssVariable}`,
  );
}
for (const token of semanticDurations) {
  const reference = referenceDurations.find(
    (candidate) => candidate.id === token.referenceId,
  );
  assert(
    cssProperties.get(token.cssVariable) === `var(${reference?.cssVariable})`,
    `CSS semantic duration adapter drifted: ${token.cssVariable}`,
  );
}

assert(
  css.includes("--elevation-opacity-key: var(--ref-opacity-16);") &&
    css.includes("--elevation-opacity-key: var(--ref-opacity-24);") &&
    cssProperties.get("--elevation-opacity-ambient") === "var(--ref-opacity-8)",
  "Mode-aware Elevation opacity CSS drifted",
);
const neutralComposition = css.match(/:root,\s*\[data-hito-color-scheme\],\s*\[data-hito-elevation-intent\]\s*\{([^}]+)\}/u)?.[1];
assert(neutralComposition, "Missing local neutral elevation composition scope");
const neutralProperties = parseCssCustomProperties(neutralComposition);
for (const [kind, modes] of Object.entries(neutralElevationOpacity)) {
  const colors = ["light", "dark"].map(mode => {
    const opacity = referenceOpacityById[modes[mode].referenceId];
    return `rgb(from var(--elevation-${kind}-tint) r g b / var(${opacity.cssVariable}))`;
  });
  assert(
    neutralProperties.get(`--elevation-shadow-color-${kind}`) === `light-dark( ${colors.join(", ")} )`,
    `Neutral ${kind} CSS must resolve existing primitives in both themes`,
  );
}
const chromaticComposition = css.match(/\[data-hito-elevation-intent="accent"\],\s*\[data-hito-elevation-intent="info"\],\s*\[data-hito-elevation-intent="success"\],\s*\[data-hito-elevation-intent="warning"\],\s*\[data-hito-elevation-intent="destructive"\]\s*\{([^}]+)\}/u)?.[1];
assert(chromaticComposition, "All five chromatic intents must opt out of neutral opacity");
const chromaticProperties = parseCssCustomProperties(chromaticComposition);
for (const kind of ["key", "ambient"]) {
  assert(
    chromaticProperties.get(`--elevation-shadow-color-${kind}`) ===
      `rgb( from var(--elevation-${kind}-tint) r g b / var(--elevation-opacity-${kind}) )`,
    `Chromatic ${kind} must retain the generic alias baseline`,
  );
}
assert(
  css.includes("--elevation-tint-key-default: var(--ref-color-neutral-950);") &&
    css.includes(
      "--elevation-tint-key-default: var(--ref-color-basic-black);",
    ) &&
    css.includes(
      "--elevation-tint-ambient-accent: var(--ref-color-brand-800);",
    ) &&
    css.includes(
      "--elevation-tint-ambient-accent: var(--ref-color-brand-400);",
    ) &&
    css.includes(
      "--elevation-key-tint: var(--elevation-tint-key-default);",
    ) &&
    css.includes(
      "--elevation-ambient-tint: var(--elevation-tint-ambient-neutral);",
    ) &&
    css.includes('[data-hito-elevation-intent="accent"]') &&
    css.includes(
      "--elevation-ambient-tint: var(--elevation-tint-ambient-accent);",
    ),
  "Mode-aware Elevation tint CSS drifted",
);
assert(
  cssProperties.get("--elevation-none") === "none",
  "Elevation none CSS drifted",
);
assert(
  cssProperties
    .get("--elevation-raised")
    ?.includes("var(--ref-shadow-offset-y-0)") &&
    cssProperties
      .get("--elevation-raised")
      ?.includes("var(--ref-shadow-offset-x-1)") &&
    cssProperties
      .get("--elevation-raised")
      ?.includes("var(--ref-shadow-blur-4)"),
  "Raised elevation CSS drifted",
);
assert(
  cssProperties
    .get("--elevation-floating")
    ?.includes("var(--ref-shadow-offset-y-0)") &&
    cssProperties
      .get("--elevation-floating")
      ?.includes("var(--ref-shadow-offset-x-2)") &&
    cssProperties
      .get("--elevation-floating")
      ?.includes("var(--ref-shadow-offset-y-4)") &&
    cssProperties
      .get("--elevation-floating")
      ?.includes("var(--ref-shadow-blur-16)"),
  "Floating elevation CSS drifted",
);
assert(
  cssProperties
    .get("--elevation-overlay")
    ?.includes("var(--ref-shadow-offset-y-0)") &&
    cssProperties
      .get("--elevation-overlay")
      ?.includes("var(--ref-shadow-offset-x-4)") &&
    cssProperties
      .get("--elevation-overlay")
      ?.includes("var(--ref-shadow-offset-y-8)") &&
    cssProperties
      .get("--elevation-overlay")
      ?.includes("var(--ref-shadow-blur-48)"),
  "Overlay elevation CSS drifted",
);
assert(
  !css.includes("--elevation-opacity-contact") &&
    !css.includes("--elevation-shadow-color-contact") &&
    !css.includes("--elevation-tint-default") &&
    !css.includes("--elevation-tint:"),
  "Superseded Elevation contact or shared-tint adapter remains",
);
assert(
  !/#[0-9a-f]{8}\b/iu.test(css),
  "Elevation CSS must not flatten alpha into hex8",
);
assert(
  !css.includes("--radius-inner"),
  "A universal inner radius CSS token is prohibited",
);
assert(
  !css.includes("--ref-radius-sm"),
  "Superseded named radius reference remains",
);
assert(
  !css.includes("--ref-duration-fast"),
  "Superseded named duration reference remains",
);
assert(
  !/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*--ref-duration-/u.test(
    css,
  ),
  "Reduced motion must not rewrite duration references",
);
assert(
  baseCss.includes(
    "outline: var(--focus-indicator-width) solid var(--focus-indicator-color)",
  ) &&
    baseCss.includes("outline-offset: var(--focus-indicator-offset)") &&
    baseCss.includes("outline-color: Highlight"),
  "Focus indicator Web/forced-colors adapter drifted",
);
assert(
  cssProperties.get("--focus-indicator-width") === "var(--ref-border-width-2)",
  "Focus width must reuse reference 2 without structural strong coupling",
);

// Runtime component styles must consume governed radius aliases, never coordinates.
async function validateComponentRadii(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const url = new URL(entry.name + (entry.isDirectory() ? "/" : ""), directory);
    if (entry.isDirectory()) await validateComponentRadii(url);
    else if (entry.name.endsWith(".css") && !entry.name.includes(".stories.")) {
      const source = await readFile(url, "utf8");
      assert(!/var\(\s*--ref-(?:font|line-height|tracking)/u.test(source), `Direct typography reference in component: ${url.pathname}`);
      for (const match of source.matchAll(/border-(?:radius|[a-z-]+-radius)\s*:\s*([^;]+);/gu)) {
        const expression = match[1].trim();
        const clearEdge = "max( 0px, calc(var(--input-frame-radius) - var(--border-width-default)) )";
        assert(/^(?:0$|inherit$|var\(|calc\()/u.test(expression) ||
          (entry.name === "SearchField.module.css" && expression.replaceAll(/\s+/gu, " ") === clearEdge),
        `Raw radius in component: ${url.pathname}`);
      }
      assert(!/var\(\s*--ref-radius-/u.test(source), `Direct radius reference in component: ${url.pathname}`);
    }
  }
}
await validateComponentRadii(new URL("../src/components/", import.meta.url));
const choiceCss = await readFile(new URL("../src/components/choice-control/ChoiceControl.module.css", import.meta.url), "utf8");
assert(choiceCss.includes("border-radius: var(--switch-thumb-radius)"), "Switch thumb must use its component radius");
assert((choiceCss.match(/border-radius: var\(--radius-shape-round\)/gu) ?? []).length === 3, "Radio/dot/indeterminate must use round shape semantics");

console.log(
  [
    "SAVI-73 geometry/effects/motion registry validation PASS",
    `radiusCandidates=${radiusCoordinates.length} intrinsicReferences=1`,
    `radiusRoles=${fixedUiRadii.length + fixedLayoutRadii.length + 2}`,
    `borderReferences=${referenceBorderWidths.length}`,
    `borderRoles=${semanticBorderWidths.length}`,
    `elevationRoles=${elevationRoles.length}`,
    `shadowLayers=${elevationRoles.reduce((count, role) => count + role.layers.length, 0)}`,
    `elevationTints=${elevationTints.length}`,
    `durationReferences=${referenceDurations.length}`,
    `easings=${motionEasings.length}`,
    "nestedResolver=BOUNDED_OPTICAL_2PX",
    "radiusStories=REFERENCE_UI_LAYOUT_NESTING",
    "reducedMotion=PASS",
    "cssParity=PASS",
    "flattenedAlpha=ABSENT",
  ].join(" "),
);
