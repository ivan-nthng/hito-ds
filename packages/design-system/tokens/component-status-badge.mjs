import { referenceColorsById } from "./reference-colors.mjs";

const solidAliases = Object.freeze(
  Object.entries({"foreground": "basic/white", "neutral": "neutral/800", "info": "blue/700", "success": "green/700", "warning": "orange/700", "destructive": "red/700"}).map(([name, reference]) => {
    const color = referenceColorsById[`color/${reference}`];
    if (!color) throw new Error(`Missing StatusBadge reference: ${reference}`);
    return Object.freeze({
      id: `component/status-badge/solid/${name}`,
      type: "color", kind: "reference-alias", purpose: `status-badge-solid-${name}`,
      cssVariable: `--status-badge-solid-${name}`, referenceId: color.id,
      resolvedWebValue: color.webValue, sourceTask: "SAVI-135", lifecycle: "admitted",
    });
  }),
);

const softAliases = [
  ["info", "blue/800", "blue/400"],
  ["warning", "orange/800", "orange/300"],
].map(([intent, light, dark]) => Object.freeze({
  id: `component/status-badge/soft/${intent}/foreground`,
  type: "color", kind: "opaque-mode-alias", purpose: `status-badge-soft-${intent}-foreground`,
  cssVariable: `--status-badge-soft-${intent}-foreground`,
  modes: Object.freeze(Object.fromEntries(Object.entries({ light, dark }).map(([mode, reference]) => {
    const color = referenceColorsById[`color/${reference}`];
    return [mode, Object.freeze({ referenceId: color.id, resolvedWebValue: color.webValue })];
  }))),
  sourceTask: "SAVI-135", lifecycle: "admitted",
}));
export const statusBadgeColorAliases = Object.freeze([...solidAliases, ...softAliases]);
