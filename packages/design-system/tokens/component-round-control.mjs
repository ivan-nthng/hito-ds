import { fixedUiSizingById } from "./fixed-ui-sizing.mjs";
const owned = definition => Object.freeze({ ...definition, sourceTask: "HDS-65", lifecycle: "admitted" });
export const roundControlDefaults = Object.freeze([
  ...["sm", "md", "lg", "xl"].map(size => {
    const target = fixedUiSizingById[`ui/control/height/${size}`];
    return owned({ id: `component/round-control/size/${size}`, type: "dimension-alias", cssVariable: `--round-control-size-${size}`, semanticId: target.id, webValue: `var(${target.cssVariable})`, resolvedSourcePx: target.resolvedSourcePx });
  }),
  owned({ id: "component/round-control/progress/inset", type: "dimension-alias", cssVariable: "--round-control-progress-inset", semanticId: "ui/space/3xs", webValue: "var(--ui-space-3xs)" }),
  owned({ id: "component/round-control/progress/stroke", type: "dimension-alias", cssVariable: "--round-control-progress-stroke", semanticId: "border/width/strong", webValue: "var(--border-width-strong)" }),
  owned({ id: "component/round-control/progress/track-opacity", type: "number-alias", cssVariable: "--round-control-progress-track-opacity", referenceId: "opacity/24", webValue: "var(--ref-opacity-24)", resolvedValue: 0.24 }),
  owned({ id: "component/round-control/progress/color", type: "color-inheritance", cssVariable: "--round-control-progress-color", webValue: "currentColor" }),
  owned({ id: "component/round-control/radius", type: "dimension-alias", cssVariable: "--round-control-radius", semanticId: "radius/shape/round", webValue: "var(--radius-shape-round)" }),
]);
