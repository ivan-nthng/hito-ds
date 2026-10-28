import { referenceSpacingById } from "./reference-spacing.mjs";

const aliases = /** @type {const} */ ([
  ["ui/space/3xs", "3xs", "space/0.5"],
  ["ui/space/2xs", "2xs", "space/1"],
  ["ui/space/xs", "xs", "space/1.5"],
  ["ui/space/sm", "sm", "space/2"],
  ["ui/space/md", "md", "space/2.5"],
  ["ui/space/lg", "lg", "space/3"],
  ["ui/space/xl", "xl", "space/3.5"],
  ["ui/space/2xl", "2xl", "space/4"],
  ["ui/space/3xl", "3xl", "space/5"],
  ["ui/space/4xl", "4xl", "space/6"],
  ["ui/space/5xl", "5xl", "space/7"],
]);

export const fixedUiSpacing = Object.freeze(
  aliases.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceSpacingById[referenceId];

    if (!reference) {
      throw new Error(`Missing reference spacing token: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--ui-space-${cssSuffix}`,
      referenceId,
      resolvedSourcePx: reference.sourcePx,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const fixedUiSpacingById = Object.freeze(
  Object.fromEntries(fixedUiSpacing.map((token) => [token.id, token])),
);
