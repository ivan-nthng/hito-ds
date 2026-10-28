import { referenceOpacityById } from "./reference-opacity.mjs";

export const spinnerStroke = Object.freeze({
  id: "component/spinner/stroke/width",
  type: "dimension-alias",
  cssVariable: "--spinner-stroke-width",
  semanticId: "border/width/strong",
  webValue: "var(--border-width-strong)",
  sourceTask: "SAVI-162",
  lifecycle: "admitted",
});

export const spinnerOpacityAliases = Object.freeze([
  ["track", "opacity/16"],
  ["arc/head", "opacity/100"],
  ["arc/tail", "opacity/0"],
].map(([part, referenceId]) => {
  const reference = referenceOpacityById[referenceId];
  return Object.freeze({
    id: `component/spinner/${part}/opacity`,
    type: "number-alias",
    cssVariable: `--spinner-${part.replaceAll("/", "-")}-opacity`,
    referenceId,
    webValue: `var(${reference.cssVariable})`,
    resolvedValue: reference.value,
    sourceTask: "SAVI-162",
    lifecycle: "admitted",
  });
}));
