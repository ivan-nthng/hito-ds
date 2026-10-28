import { referenceColorsById } from "./reference-colors.mjs";
import { referenceOpacityById } from "./reference-opacity.mjs";
import { semanticTextColorRolesById } from "./semantic-text-colors.mjs";

const sourceTask = "SAVI-83";

function createModeColor(id, cssVariable, purpose, references) {
  return Object.freeze({
    id,
    type: "color",
    kind: "opaque-mode-alias",
    purpose,
    cssVariable,
    modes: Object.freeze(
      Object.fromEntries(
        Object.entries(references).map(([modeId, referenceId]) => {
          const reference = referenceColorsById[referenceId];

          if (!reference) {
            throw new Error(`Missing Button color reference: ${referenceId}`);
          }

          return [
            modeId,
            Object.freeze({
              referenceId,
              resolvedWebValue: reference.webValue,
            }),
          ];
        }),
      ),
    ),
    sourceTask,
    lifecycle: "admitted",
  });
}

function createModeSecondaryBorder(intent, definitions) {
  return Object.freeze({
    id: `component/button/secondary/${intent}/border`,
    type: "color-with-opacity",
    kind: "mode-color-opacity-composition",
    purpose: `${intent}-secondary-button-edge`,
    cssVariable: `--button-secondary-${intent}-border`,
    modes: Object.freeze(
      Object.fromEntries(
        Object.entries(definitions).map(
          ([modeId, { baseId, opacityReferenceId }]) => {
            const base =
              referenceColorsById[baseId] ??
              semanticTextColorRolesById[baseId];
            const opacity = referenceOpacityById[opacityReferenceId];

            if (!base || !opacity) {
              throw new Error(
                `Missing Button secondary border input: ${intent}/${modeId}`,
              );
            }

            return [
              modeId,
              Object.freeze({
                baseId,
                opacityReferenceId: opacity.id,
                resolvedOpacity: opacity.value,
                webValue: `rgb(from var(${base.cssVariable}) r g b / var(${opacity.cssVariable}))`,
              }),
            ];
          },
        ),
      ),
    ),
    sourceTask,
    lifecycle: "admitted",
  });
}

const messageIntentColors = [
  createModeColor("component/button/primary/info/background/default", "--button-primary-info-background-default", "primary-info-background-default", { light: "color/blue/700", dark: "color/blue/400" }),
  createModeColor("component/button/primary/info/background/hover", "--button-primary-info-background-hover", "primary-info-background-hover", { light: "color/blue/800", dark: "color/blue/300" }),
  createModeColor("component/button/primary/info/background/pressed", "--button-primary-info-background-pressed", "primary-info-background-pressed", { light: "color/blue/900", dark: "color/blue/200" }),
  createModeColor("component/button/primary/info/foreground", "--button-primary-info-foreground", "primary-info-foreground", { light: "color/basic/white", dark: "color/neutral/950" }),
  createModeColor("component/button/info/foreground/default", "--button-info-foreground-default", "info-foreground-default", { light: "color/blue/800", dark: "color/blue/400" }),
  createModeColor("component/button/info/foreground/hover", "--button-info-foreground-hover", "info-foreground-hover", { light: "color/blue/900", dark: "color/blue/300" }),
  createModeColor("component/button/secondary/info/border", "--button-secondary-info-border", "secondary-info-border", { light: "color/blue/800", dark: "color/blue/400" }),
  createModeColor("component/button/primary/warning/background/default", "--button-primary-warning-background-default", "primary-warning-background-default", { light: "color/yellow/500", dark: "color/yellow/400" }),
  createModeColor("component/button/primary/warning/background/hover", "--button-primary-warning-background-hover", "primary-warning-background-hover", { light: "color/yellow/400", dark: "color/yellow/300" }),
  createModeColor("component/button/primary/warning/background/pressed", "--button-primary-warning-background-pressed", "primary-warning-background-pressed", { light: "color/yellow/600", dark: "color/yellow/500" }),
  createModeColor("component/button/primary/warning/foreground", "--button-primary-warning-foreground", "primary-warning-foreground", { light: "color/neutral/950", dark: "color/neutral/950" }),
  createModeColor("component/button/warning/foreground/default", "--button-warning-foreground-default", "warning-foreground-default", { light: "color/yellow/800", dark: "color/yellow/300" }),
  createModeColor("component/button/warning/foreground/hover", "--button-warning-foreground-hover", "warning-foreground-hover", { light: "color/yellow/900", dark: "color/yellow/200" }),
  createModeColor("component/button/secondary/warning/border", "--button-secondary-warning-border", "secondary-warning-border", { light: "color/yellow/800", dark: "color/yellow/300" })
].map(definition => Object.freeze({ ...definition, sourceTask: "SAVI-159" }));

export const buttonColorAliases = Object.freeze([
  ...messageIntentColors,
  createModeColor(
    "component/button/primary/accent/background/default",
    "--button-primary-accent-background-default",
    "orange-accent-primary-button-default",
    { light: "color/brand/500", dark: "color/brand/400" },
  ),
  createModeColor(
    "component/button/primary/accent/background/hover",
    "--button-primary-accent-background-hover",
    "orange-accent-primary-button-hover",
    { light: "color/brand/400", dark: "color/brand/300" },
  ),
  createModeColor(
    "component/button/primary/accent/background/pressed",
    "--button-primary-accent-background-pressed",
    "orange-accent-primary-button-pressed",
    { light: "color/brand/600", dark: "color/brand/500" },
  ),
  createModeColor(
    "component/button/primary/accent/foreground",
    "--button-primary-accent-foreground",
    "paired-content-on-orange-accent-primary-button",
    { light: "color/neutral/950", dark: "color/neutral/950" },
  ),
  createModeColor(
    "component/button/primary/success/background/default",
    "--button-primary-success-background-default",
    "green-success-primary-button-default",
    { light: "color/green/500", dark: "color/green/700" },
  ),
  createModeColor(
    "component/button/primary/success/background/hover",
    "--button-primary-success-background-hover",
    "green-success-primary-button-hover",
    { light: "color/green/600", dark: "color/green/800" },
  ),
  createModeColor(
    "component/button/primary/success/background/pressed",
    "--button-primary-success-background-pressed",
    "green-success-primary-button-pressed",
    { light: "color/green/700", dark: "color/green/900" },
  ),
  createModeColor(
    "component/button/primary/success/foreground",
    "--button-primary-success-foreground",
    "paired-content-on-green-success-primary-button",
    { light: "color/basic/white", dark: "color/basic/white" },
  ),
  createModeColor(
    "component/button/primary/destructive/background/default",
    "--button-primary-destructive-background-default",
    "red-destructive-primary-button-default",
    { light: "color/red/600", dark: "color/red/600" },
  ),
  createModeColor(
    "component/button/primary/destructive/background/hover",
    "--button-primary-destructive-background-hover",
    "red-destructive-primary-button-hover",
    { light: "color/red/700", dark: "color/red/700" },
  ),
  createModeColor(
    "component/button/primary/destructive/background/pressed",
    "--button-primary-destructive-background-pressed",
    "red-destructive-primary-button-pressed",
    { light: "color/red/800", dark: "color/red/800" },
  ),
  createModeColor(
    "component/button/primary/destructive/foreground",
    "--button-primary-destructive-foreground",
    "paired-content-on-red-destructive-primary-button",
    { light: "color/basic/white", dark: "color/basic/white" },
  ),
  createModeColor(
    "component/button/destructive/foreground/default",
    "--button-destructive-foreground-default",
    "red-destructive-button-content-default",
    { light: "color/red/800", dark: "color/red/300" },
  ),
  createModeColor(
    "component/button/destructive/foreground/hover",
    "--button-destructive-foreground-hover",
    "red-destructive-button-content-hover",
    { light: "color/red/700", dark: "color/red/200" },
  ),
  createModeSecondaryBorder("neutral", {
    light: { baseId: "color/text/primary", opacityReferenceId: "opacity/32" },
    dark: { baseId: "color/text/primary", opacityReferenceId: "opacity/32" },
  }),
  createModeSecondaryBorder("accent", {
    light: {
      baseId: "color/text/accent/default",
      opacityReferenceId: "opacity/32",
    },
    dark: {
      baseId: "color/text/accent/default",
      opacityReferenceId: "opacity/32",
    },
  }),
  createModeSecondaryBorder("success", {
    light: { baseId: "color/green/500", opacityReferenceId: "opacity/32" },
    dark: { baseId: "color/green/600", opacityReferenceId: "opacity/32" },
  }),
  createModeSecondaryBorder("destructive", {
    light: { baseId: "color/red/500", opacityReferenceId: "opacity/32" },
    dark: { baseId: "color/red/600", opacityReferenceId: "opacity/32" },
  }),
]);

export const buttonMotionAliases = Object.freeze([
  Object.freeze({
    id: "component/button/loading/cycle-duration",
    type: "duration-calculation",
    kind: "semantic-duration-multiple",
    purpose: "continuous-button-loading-indicator",
    cssVariable: "--button-loading-cycle-duration",
    baseSemanticId: "motion/duration/emphasis",
    factor: 2,
    resolvedMilliseconds: 960,
    webValue:
      "calc(var(--motion-duration-emphasis) + var(--motion-duration-emphasis))",
    sourceTask,
    lifecycle: "admitted",
  }),
]);
