import { referenceColorsById } from "./reference-colors.mjs";

/**
 * @template {Record<string, Readonly<Record<"light" | "dark", string>>>} T
 * @param {T} states
 * @returns {Readonly<T>}
 */
function freezeStates(states) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(states).map(([state, modes]) => [
        state,
        Object.freeze(modes),
      ]),
    ),
  );
}

export const semanticIntentColorReferences = Object.freeze({
  neutral: freezeStates({
    default: { light: "color/neutral/950", dark: "color/neutral/50" },
    hover: { light: "color/neutral/800", dark: "color/neutral/200" },
    pressed: { light: "color/neutral/700", dark: "color/neutral/300" },
  }),
  accent: freezeStates({
    default: { light: "color/brand/800", dark: "color/brand/400" },
    hover: { light: "color/brand/900", dark: "color/brand/300" },
    pressed: { light: "color/brand/950", dark: "color/brand/200" },
  }),
  info: freezeStates({
    default: { light: "color/blue/700", dark: "color/blue/400" },
    hover: { light: "color/blue/800", dark: "color/blue/300" },
    pressed: { light: "color/blue/900", dark: "color/blue/200" },
  }),
  success: freezeStates({
    default: { light: "color/green/700", dark: "color/green/300" },
    hover: { light: "color/green/800", dark: "color/green/200" },
    pressed: { light: "color/green/900", dark: "color/green/100" },
  }),
  warning: freezeStates({
    default: { light: "color/orange/700", dark: "color/orange/300" },
    hover: { light: "color/orange/800", dark: "color/orange/200" },
    pressed: { light: "color/orange/900", dark: "color/orange/100" },
  }),
  destructive: freezeStates({
    default: { light: "color/red/700", dark: "color/red/300" },
    hover: { light: "color/red/800", dark: "color/red/200" },
    pressed: { light: "color/red/900", dark: "color/red/100" },
  }),
});

export const chromaticIntentIds = Object.freeze(
  /** @type {const} */ ([
    "accent",
    "info",
    "success",
    "warning",
    "destructive",
  ]),
);

/**
 * @template {Readonly<Record<"light" | "dark", string>>} T
 * @param {T} references
 * @param {string} label
 * @returns {Readonly<{
 *   [Mode in keyof T]: Readonly<{
 *     referenceId: T[Mode];
 *     resolvedWebValue: string;
 *   }>;
 * }>}
 */
export function resolveSemanticColorModes(references, label) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(references).map(([modeId, referenceId]) => {
        const reference = referenceColorsById[referenceId];

        if (!reference) {
          throw new Error(`Missing ${label} color reference: ${referenceId}`);
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
  );
}
