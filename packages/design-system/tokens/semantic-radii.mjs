import { referenceBorderWidthsById } from "./border-focus.mjs";
import { assertRadiusScale, fullRadius, getRadiusWebValue, radiusCandidateSpaceIds, radiusScale } from "./radius-geometry.mjs";
import { referenceSpacingById } from "./reference-spacing.mjs";
import { responsiveLayoutModes } from "./responsive-layout-spacing.mjs";

/**
 * @typedef {readonly [id: string, cssSuffix: string, referenceId: string]}
 * FixedRadiusDefinition
 */
/** @typedef {"ui" | "layout-fixed"} FixedRadiusLane */
/**
 * @typedef {Extract<
 *   (typeof referenceSpacingById)[string],
 *   { kind: "space" }
 * >} RadiusCoordinate
 */

/** @type {readonly FixedRadiusDefinition[]} */
const fixedUiDefinitions = [
  ["radius/ui/xs", "xs", "space/1"],
  ["radius/ui/sm", "sm", "space/1"],
  ["radius/ui/md", "md", "space/1.5"],
  ["radius/ui/lg", "lg", "space/2"],
  ["radius/ui/xl", "xl", "space/3"],
];

/** @type {readonly FixedRadiusDefinition[]} */
const fixedLayoutDefinitions = [
  ["radius/layout/fixed/xs", "xs", "space/1.5"],
  ["radius/layout/fixed/sm", "sm", "space/2"],
  ["radius/layout/fixed/md", "md", "space/3"],
  ["radius/layout/fixed/lg", "lg", "space/4"],
  ["radius/layout/fixed/xl", "xl", "space/6"],
  ["radius/layout/fixed/2xl", "2xl", "space/8"],
];

/**
 * @param {FixedRadiusDefinition} definition
 * @param {FixedRadiusLane} lane
 */
function createFixedRole([id, cssSuffix, referenceId], lane) {
  const reference = /** @type {RadiusCoordinate | undefined} */ (
    referenceSpacingById[referenceId]
  );

  if (!reference) {
    throw new Error(`Missing radius reference: ${referenceId}`);
  }

  return Object.freeze({
    id,
    lane,
    viewportPolicy: "fixed",
    cssVariable: `--radius-${lane}-${cssSuffix}`,
    referenceId,
    resolvedSourcePx: reference.sourcePx,
    resolvedWebValue: getRadiusWebValue(referenceId),
  });
}

export const fixedUiRadii = Object.freeze(
  fixedUiDefinitions.map((definition) => createFixedRole(definition, "ui")),
);

export const fixedLayoutRadii = Object.freeze(
  fixedLayoutDefinitions.map((definition) => createFixedRole(definition, "layout-fixed")),
);

const responsiveOuterReferences = /** @type {const} */ ([
  "space/2",
  "space/3",
  "space/4",
  "space/6",
]);

export const responsiveLayoutOuterRadius = Object.freeze({
  id: "radius/layout/responsive/outer",
  viewportPolicy: "responsive-opt-in",
  cssVariable: "--radius-layout-responsive-outer",
  modes: Object.freeze(
    Object.fromEntries(
      responsiveLayoutModes.map((mode, index) => {
        const referenceId = responsiveOuterReferences[index];
        const reference = /** @type {RadiusCoordinate | undefined} */ (
          referenceSpacingById[referenceId]
        );

        if (!reference) {
          throw new Error(`Missing responsive outer radius reference: ${referenceId}`);
        }

        return [
          mode.id,
          Object.freeze({
            referenceId,
            resolvedSourcePx: reference.sourcePx,
            resolvedWebValue: getRadiusWebValue(referenceId),
          }),
        ];
      }),
    ),
  ),
});

export const intrinsicRoundRadius = Object.freeze({
  id: "radius/shape/round",
  lane: "shape",
  viewportPolicy: "fixed",
  cssVariable: "--radius-shape-round",
  referenceId: "radius/full",
  resolvedSourcePx: null,
  resolvedWebValue: fullRadius.webValue,
});

export const semanticRadiusRoles = Object.freeze([
  intrinsicRoundRadius,
  ...fixedUiRadii,
  ...fixedLayoutRadii,
  responsiveLayoutOuterRadius,
]);

export const semanticRadiusRolesById = Object.freeze(
  Object.fromEntries(semanticRadiusRoles.map((token) => [token.id, token])),
);

/**
 * @param {string} radiusId
 * @param {string | null | undefined} modeId
 */
function resolveRadiusReference(radiusId, modeId) {
  if (radiusId === fullRadius.id) return fullRadius;

  const semantic = semanticRadiusRolesById[radiusId];

  if (!semantic) {
    throw new Error(`Unknown radius token: ${radiusId}`);
  }

  if (semantic.modes) {
    const mode = semantic.modes[modeId];

    if (!mode) {
      throw new Error(`Responsive radius requires a valid mode: ${radiusId}/${modeId}`);
    }

    return referenceSpacingById[mode.referenceId];
  }

  return semantic.referenceId === fullRadius.id
    ? fullRadius
    : referenceSpacingById[semantic.referenceId];
}

/**
 * Resolve a panel around a directly visible child: add the parent's inset to
 * the child's radius, then select the next admitted radius reference above it.
 * Like the inner resolver, this discrete choice is made at build/config time.
 *
 * @param {{ innerRadiusId: string; insetSpacingId: string; scale?: number }} options
 */
export function resolveConcentricOuterRadius({
  innerRadiusId,
  insetSpacingId,
  scale = radiusScale.defaultValue,
}) {
  assertRadiusScale(scale);
  const inner = resolveRadiusReference(innerRadiusId, null);
  const inset = referenceSpacingById[insetSpacingId];
  if (!inner || inner.kind !== "space") {
    throw new Error("Concentric outer radius requires a numeric inner radius");
  }
  if (!inset || inset.kind !== "space") {
    throw new Error(`Missing inset spacing reference: ${insetSpacingId}`);
  }
  const strictSourcePx = inner.sourcePx * scale + inset.sourcePx;
  const selected = radiusCandidateSpaceIds
    .map((id) => referenceSpacingById[id])
    .find((candidate) => candidate.sourcePx * scale > strictSourcePx);
  if (!selected) {
    throw new RangeError("No admitted radius reference exceeds the nested child and inset");
  }
  return Object.freeze({
    innerRadiusId,
    insetSpacingId,
    strictSourcePx,
    outerReferenceId: selected.id,
    resolvedOuterSourcePx: selected.sourcePx * scale,
    resolvedOuterWebValue: getRadiusWebValue(selected.id),
  });
}

/**
 * @param {{
 *   outerRadiusId: string;
 *   modeId?: string | null;
 *   insetSpacingId: string;
 *   borderWidthId: string;
 *   scale?: number;
 * }} options
 */
export function resolveConcentricInnerRadius({
  outerRadiusId,
  modeId = null,
  insetSpacingId,
  borderWidthId,
  scale = radiusScale.defaultValue,
}) {
  assertRadiusScale(scale);
  if (outerRadiusId.startsWith("radius/ui/")) {
    throw new RangeError("UI controls keep their size radius without Surface optical correction.");
  }
  const outer = resolveRadiusReference(outerRadiusId, modeId);
  const spacing = referenceSpacingById[insetSpacingId];
  const border = referenceBorderWidthsById[borderWidthId];

  if (!outer || outer.kind !== "space") {
    throw new Error("Concentric inner radius requires a numeric outer radius");
  }
  if (!spacing) {
    throw new Error(`Missing inset spacing reference: ${insetSpacingId}`);
  }
  if (!border) {
    throw new Error(`Missing border-width reference: ${borderWidthId}`);
  }

  const resolvedInsetSourcePx = spacing.sourcePx + border.sourcePx;
  const resolvedOuterSourcePx = outer.sourcePx * scale;
  if (resolvedInsetSourcePx >= resolvedOuterSourcePx) {
    throw new RangeError("Separated surfaces require an explicit independent semantic inner radius.");
  }
  const idealSourcePx = resolvedOuterSourcePx - resolvedInsetSourcePx;
  const candidates = /** @type {RadiusCoordinate[]} */ (
    radiusCandidateSpaceIds.map(id => referenceSpacingById[id]).filter(
      (token) => token.sourcePx < outer.sourcePx,
    )
  );
  const strict = /** @type {RadiusCoordinate | undefined} */ (
    candidates.toSorted(
      (left, right) =>
        Math.abs(left.sourcePx * scale - idealSourcePx) - Math.abs(right.sourcePx * scale - idealSourcePx) ||
        right.sourcePx - left.sourcePx,
    )[0]
  );

  if (!strict) {
    throw new Error("No admitted radius reference can satisfy the concentric geometry");
  }

  const opticalCeilingSourcePx = Math.min(
    idealSourcePx + semanticRadiusPolicy.opticalMaximumCompensationSourcePx,
    resolvedOuterSourcePx - semanticRadiusPolicy.opticalMaximumCompensationSourcePx,
  );
  const optical = /** @type {RadiusCoordinate | null} */ (
    idealSourcePx >= semanticRadiusPolicy.opticalMinimumIdealSourcePx
      ? candidates
          .filter(
            (token) =>
              token.sourcePx * scale >= idealSourcePx &&
              token.sourcePx * scale <= opticalCeilingSourcePx,
          )
          .toSorted((left, right) => right.sourcePx - left.sourcePx)[0]
      : null
  );
  const selected = optical ?? strict;

  return Object.freeze({
    scale,
    outerReferenceId: outer.id,
    resolvedOuterSourcePx,
    resolvedOuterWebValue: getRadiusWebValue(outer.id),
    insetSpacingId,
    resolvedInsetSpacingSourcePx: spacing.sourcePx,
    resolvedInsetSpacingWebValue: spacing.webValue,
    borderWidthId,
    resolvedBorderWidthSourcePx: border.sourcePx,
    resolvedBorderWidthWebValue: border.webValue,
    resolvedInsetSourcePx,
    idealSourcePx,
    opticalCeilingSourcePx,
    strictInnerReferenceId: strict.id,
    strictResolvedInnerSourcePx: strict.sourcePx * scale,
    strictResolvedInnerWebValue: getRadiusWebValue(strict.id),
    innerReferenceId: selected.id,
    resolvedInnerSourcePx: selected.sourcePx * scale,
    resolvedInnerWebValue: getRadiusWebValue(selected.id),
    opticalCandidateSelected: Boolean(optical),
    opticalCompensationApplied: Boolean(optical && selected.sourcePx * scale > idealSourcePx),
    opticalCompensationSourcePx: optical ? selected.sourcePx * scale - idealSourcePx : 0,
  });
}

export const semanticRadiusPolicy = Object.freeze({
  fixedUiSizes: Object.freeze(["xs", "sm", "md", "lg", "xl"]),
  fixedLayoutSizes: Object.freeze(["xs", "sm", "md", "lg", "xl", "2xl"]),
  responsiveLayout: "explicit-opt-in",
  universalInnerToken: "prohibited",
  governedNestedComponents: Object.freeze(["Surface", "Card"]),
  governedOuterComponents: Object.freeze(["SelectionPanel", "Menu", "Select", "Combobox", "ValuePicker", "SegmentedTabs"]),
  concentricOuterSelection: "next-admitted-reference-strictly-above-inner-plus-inset",
  nestedRelationship: "direct-visible-concentric-surface-with-parent-owned-inset",
  concentricRelationshipBoundary: "inset-below-outer-radius",
  separatedChildBoundary: "inset-at-least-outer-radius",
  separatedChildRadiusSelection: "explicit-semantic-layout-role",
  runtimeDomInspection: "prohibited",
  runtimeJavaScript: "prohibited",
  resolverExecution: "build-time-registry-validation",
  scaleInput: "same-configured-factor-as-semantic-adapter",
  tieBreak: "larger-reference",
  opticalSoftening: "bounded-existing-reference-up-to-2px",
  opticalMinimumIdealSourcePx: 4,
  opticalMaximumCompensationSourcePx: 2,
  opticalInnerMustRemainBelowOuter: true,
  opticalAppliesToFullRadius: false,
  opticalAppliesToUiControls: false,
  opticalThemeOrColorCoupling: "prohibited",
  arbitraryComputedRadius: "prohibited",
  directComponentReferenceConsumption: "prohibited",
  componentAliases: "deferred-until-component-contract",
});
