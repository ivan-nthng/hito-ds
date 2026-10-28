import { referenceSpacingById } from "./reference-spacing.mjs";

/** Document-root web configuration; coordinates and all other axes stay unchanged. */
export const radiusScale = Object.freeze({
  id: "radius/scale",
  type: "number",
  cssVariable: "--radius-scale",
  defaultValue: 1,
  webValue: "1",
  scope: "document-root",
  inputDomain: "finite-positive",
  sourceTask: "SAVI-165",
  lifecycle: "admitted",
});

export function assertRadiusScale(value) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new RangeError("Radius scale must be a finite positive number.");
  }
}

/** Policy candidates, not tokens: adding space coordinates does not add radius candidates. */
export const radiusCandidateSpaceIds = Object.freeze(/** @type {const} */ ([
  "space/0", "space/0.5", "space/1", "space/1.5", "space/2", "space/2.5",
  "space/3", "space/4", "space/5", "space/6", "space/8",
]));

/** Build-time adapter expression. Scale only the independent corner, never its inset.
 * @param {string} referenceId
 */
export function getRadiusWebValue(referenceId) {
  if (!radiusCandidateSpaceIds.some(id => id === referenceId)) {
    throw new RangeError(`Space coordinate is not admitted for radius: ${referenceId}`);
  }
  const reference = referenceSpacingById[referenceId];
  return reference.sourcePx === 0
    ? "0"
    : `calc(var(${reference.cssVariable}) * var(${radiusScale.cssVariable}))`;
}

export const fullRadius = Object.freeze({
  id: "radius/full",
  type: "dimension",
  kind: "full",
  sourcePx: /** @type {null} */ (null),
  cssVariable: "--ref-radius-full",
  webValue: "9999px",
  sourceTask: "SAVI-73",
  lifecycle: "admitted",
});

export const radiusGeometryPolicy = Object.freeze({
  numericCoordinateOwner: "space",
  scaling: "independent-radius-output-only",
  candidateSelection: "explicit-subset",
  numericWebUnit: "rem",
  figmaUnit: "px",
  fullBehavior: "platform-adapted-full-rounding",
  directComponentConsumption: "prohibited",
});
