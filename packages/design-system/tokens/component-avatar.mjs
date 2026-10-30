import { referenceSpacingById } from "./reference-spacing.mjs";
import { fixedLayoutRadii, fixedUiRadii } from "./semantic-radii.mjs";

export const avatarSizes = Object.freeze(/** @type {const} */ (["xs", "sm", "md", "lg"]));

export const avatarDimensions = Object.freeze([
  ["size", ["space/6", "space/10", "space/20", "space/40"]],
  ["icon-size", ["space/4", "space/5", "space/8", "space/16"]],
].flatMap(([part, references]) => avatarSizes.map((size, index) => {
  const referenceId = references[index];
  const reference = referenceSpacingById[referenceId];
  return Object.freeze({
    id: `component/avatar/${part}/${size}`, type: "dimension-alias",
    cssVariable: `--avatar-${part}-${size}`, referenceId,
    webValue: `var(${reference.cssVariable})`, resolvedSourcePx: reference.sourcePx,
    sourceTask: "SAVI-167", lifecycle: "admitted",
  });
})));

const radiusRoles = ["radius/ui/xs", "radius/ui/lg", "radius/ui/xl", "radius/layout/fixed/xl"];
export const avatarRadii = Object.freeze(avatarSizes.map((size, index) => {
  const semanticId = radiusRoles[index];
  const role = [...fixedUiRadii, ...fixedLayoutRadii].find(radius => radius.id === semanticId);
  if (!role) throw new Error(`Missing Avatar radius: ${semanticId}`);
  return Object.freeze({
    id: `component/avatar/radius/${size}`, type: "dimension-alias",
    cssVariable: `--avatar-radius-${size}`, semanticId,
    webValue: `var(${role.cssVariable})`, resolvedSourcePx: role.resolvedSourcePx,
    sourceTask: "SAVI-167", lifecycle: "admitted",
  });
}));
