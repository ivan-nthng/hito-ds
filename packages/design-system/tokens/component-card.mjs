import { fixedLayoutRadii } from "./semantic-radii.mjs";
import { responsiveLayoutModes, responsiveLayoutSpacingById } from "./responsive-layout-spacing.mjs";
import { referenceSpacing, referenceSpacingById } from "./reference-spacing.mjs";
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

const responsiveCardPadding = [
  ["compact", "layout/space/responsive/sm"],
  ["comfortable", "layout/space/responsive/lg"],
];

export const cardPaddingAliases = Object.freeze(responsiveCardPadding.map(([size, semanticId]) => {
  const spacing = responsiveLayoutSpacingById[semanticId];
  return Object.freeze({
    id: `component/card/padding/responsive-${size}`,
    cssVariable: `--card-padding-responsive-${size}`,
    semanticId,
    webValue: `var(${spacing.cssVariable})`,
    sourceTask: "HDS-21",
    lifecycle: "admitted",
    modes: spacing.modes,
  });
}));

const densityFactors = { compact: 0.75, spacious: 1.25 };
const densityCandidates = referenceSpacing.filter(({ kind, sourcePx }) =>
  kind === "space" && sourcePx >= 4 && sourcePx <= 40,
);

export function responsiveCardDensityAdapterCss() {
  const defaults = cardPaddingAliases.map(({ cssVariable, webValue }) =>
    `    ${cssVariable}: ${webValue};`,
  ).join("\n");
  const rules = responsiveLayoutModes.map(({ id, minWidthWebValue }) => {
    const selectors = Object.entries(densityFactors).map(([density, factor]) => {
      const declarations = cardPaddingAliases.map(({ cssVariable, modes }) => {
        const target = modes[id].resolvedSourcePx * factor;
        const [nearest] = densityCandidates.toSorted((a, b) =>
          Math.abs(a.sourcePx - target) - Math.abs(b.sourcePx - target) || b.sourcePx - a.sourcePx,
        );
        return `    ${cssVariable}: var(${nearest.cssVariable});`;
      }).join("\n");
      return `  :root[data-hito-layout-density="${density}"] {\n${declarations}\n  }\n`;
    }).join("");
    return minWidthWebValue ? `  @media (min-width: ${minWidthWebValue}) {\n${selectors}  }\n` : selectors;
  }).join("");
  return `/* HDS-21 generated responsive Card padding density. */\n@layer hito.tokens {\n  :root {\n${defaults}\n  }\n${rules}}\n`;
}
