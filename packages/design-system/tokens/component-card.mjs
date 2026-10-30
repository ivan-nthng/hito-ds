import { fixedLayoutRadii } from "./semantic-radii.mjs";
import { responsiveLayoutModes } from "./responsive-layout-spacing.mjs";
import { referenceSpacingById } from "./reference-spacing.mjs";
import { radiusScale } from "./radius-geometry.mjs";

function createResponsiveRadius(size, modeIds) {
  return Object.freeze({
    id: `component/card/radius/responsive/${size}`,
    type: "responsive-dimension-alias",
    cssVariable: `--card-radius-responsive-${size}`,
    sourceTask: "SAVI-165",
    lifecycle: "admitted",
    modes: Object.freeze(Object.fromEntries(responsiveLayoutModes.map((mode, index) => {
      const semanticId = modeIds[index];
      // The accepted LG Card recipe uses space coordinates without expanding the
      // global radius candidate set or inventing a fixed semantic radius role.
      if (mode.id === "lg") {
        const reference = referenceSpacingById[semanticId];
        if (!reference || reference.kind !== "space" || semanticId !== (size === "compact" ? "space/5" : "space/7")) {
          throw new Error(`Missing admitted Card LG coordinate: ${semanticId}`);
        }
        return [mode.id, Object.freeze({
          referenceId: semanticId,
          webValue: `calc(var(${reference.cssVariable}) * var(${radiusScale.cssVariable}))`,
          resolvedSourcePx: reference.sourcePx,
        })];
      }
      const semantic = fixedLayoutRadii.find((radius) => radius.id === semanticId);
      if (!semantic) throw new Error(`Missing Card radius semantic: ${semanticId}`);
      return [mode.id, Object.freeze({
        semanticId,
        webValue: `var(${semantic.cssVariable})`,
        resolvedSourcePx: semantic.resolvedSourcePx,
      })];
    }))),
  });
}

/** Compact Card corners retain a component-owned responsive mapping. */
export const cardCompactResponsiveRadius = createResponsiveRadius("compact", [
  "radius/layout/fixed/md",
  "radius/layout/fixed/lg",
  "space/5",
  "radius/layout/fixed/xl",
]);

/** Spacious cards keep a larger minimum and stop at the admitted layout radius ceiling. */
export const cardComfortableResponsiveRadius = createResponsiveRadius("comfortable", [
  "radius/layout/fixed/xl",
  "radius/layout/fixed/xl",
  "space/7",
  "radius/layout/fixed/2xl",
]);

export const cardResponsiveRadii = Object.freeze([
  cardCompactResponsiveRadius,
  cardComfortableResponsiveRadius,
]);
