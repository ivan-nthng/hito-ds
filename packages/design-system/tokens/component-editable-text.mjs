import { referenceColorsById } from "./reference-colors.mjs";

const editingBorderReference = referenceColorsById["color/orange/500"];

if (!editingBorderReference) {
  throw new Error("Missing editable text editing border reference");
}

export const editableTextColorAliases = Object.freeze([
  Object.freeze({
    id: "component/editable-text/editing-border",
    type: "color",
    kind: "reference-alias",
    purpose: "active-editable-text-boundary",
    cssVariable: "--editable-text-editing-border",
    referenceId: editingBorderReference.id,
    resolvedWebValue: editingBorderReference.webValue,
    sourceTask: "SAVI-107",
    lifecycle: "admitted",
  }),
]);
