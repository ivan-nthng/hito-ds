import { getRadiusWebValue } from "./radius-geometry.mjs";
import { referenceSpacingById } from "./reference-spacing.mjs";
import { fixedUiRadii, resolveConcentricOuterRadius } from "./semantic-radii.mjs";
import { fixedUiSpacingById } from "./fixed-ui-spacing.mjs";

/** Switch thumb geometry is independent from control-size radius roles. */
export const switchThumbRadius = Object.freeze({
  id: "component/switch/thumb-radius",
  cssVariable: "--switch-thumb-radius",
  referenceId: "space/1.5",
  resolvedSourcePx: referenceSpacingById["space/1.5"].sourcePx,
  resolvedWebValue: getRadiusWebValue("space/1.5"),
});

/** Strict concentric edge: scale the row radius once and retain the panel inset. */
export const selectionPanelRadii = Object.freeze(
  [["sm", "2xs"], ["md", "xs"], ["lg", "sm"]].map(([size, inset]) => {
    const row = fixedUiRadii.find((radius) => radius.id === `radius/ui/${size}`);
    const spacing = fixedUiSpacingById[`ui/space/${inset}`];
    if (!row || !spacing) throw new Error(`Missing SelectionPanel geometry: ${size}`);
    const strictSourcePx = row.resolvedSourcePx + spacing.resolvedSourcePx;
    const reference = Object.values(referenceSpacingById).find((token) => token.sourcePx === strictSourcePx);
    if (!reference) throw new Error(`Missing SelectionPanel sum reference: ${size}`);
    return Object.freeze({
      id: `component/selection-panel/radius/${size}`,
      type: "dimension-composition",
      cssVariable: `--selection-panel-radius-${size}`,
      rowRadiusId: row.id,
      insetSpacingId: spacing.id,
      referenceId: reference.id,
      strictSourcePx,
      webValue: `calc(var(${row.cssVariable}) + var(${spacing.cssVariable}))`,
      resolvedSourcePx: strictSourcePx,
      sourceTask: "SAVI-433",
      lifecycle: "admitted",
    });
  }),
);

/** Segmented Tabs have a fixed inset around the directly visible selected indicator. */
export const segmentedTabsRadii = Object.freeze(
  ["sm", "md"].map((size) => {
    const inner = fixedUiRadii.find((radius) => radius.id === `radius/ui/${size}`);
    const inset = fixedUiSpacingById["ui/space/2xs"];
    if (!inner || !inset) throw new Error(`Missing segmented Tabs geometry: ${size}`);
    const outer = resolveConcentricOuterRadius({
      innerRadiusId: inner.id,
      insetSpacingId: inset.referenceId,
    });
    return Object.freeze({
      id: `component/tabs/segmented/radius/${size}`,
      type: "dimension-composition",
      cssVariable: `--tabs-segmented-outer-radius-${size}`,
      innerRadiusId: inner.id,
      insetSpacingId: inset.id,
      referenceId: outer.outerReferenceId,
      strictSourcePx: outer.strictSourcePx,
      resolvedSourcePx: outer.resolvedOuterSourcePx,
      webValue: `max(${outer.resolvedOuterWebValue}, calc(var(${inner.cssVariable}) + var(${inset.cssVariable})))`,
    });
  }),
);
