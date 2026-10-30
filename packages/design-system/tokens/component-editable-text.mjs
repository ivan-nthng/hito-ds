import { semanticBorderColorRoles } from "./semantic-border-colors.mjs";
const editingBorder = semanticBorderColorRoles.find(role => role.id === "color/border/accent/hover");
export const editableTextColorAliases = Object.freeze([Object.freeze({
  id: "component/editable-text/editing-border", type: "color-with-opacity", kind: "semantic-alias",
  purpose: "active-editable-text-boundary", cssVariable: "--editable-text-editing-border",
  referenceId: editingBorder.id, modes: editingBorder.modes, opacityReferenceId: editingBorder.opacityReferenceId,
  resolvedOpacity: editingBorder.resolvedOpacity, sourceTask: "HDS-3", lifecycle: "admitted",
})]);
