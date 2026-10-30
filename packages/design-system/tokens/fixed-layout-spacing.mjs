import { referenceSpacingById } from "./reference-spacing.mjs";

const aliases = /** @type {const} */ ([
  ["layout/space/fixed/xs", "xs", "space/1"],
  ["layout/space/fixed/sm", "sm", "space/2"],
  ["layout/space/fixed/md", "md", "space/3"],
  ["layout/space/fixed/lg", "lg", "space/4"],
  ["layout/space/fixed/xl", "xl", "space/6"],
  ["layout/space/fixed/2xl", "2xl", "space/8"],
]);

export const fixedLayoutSpacing = Object.freeze(
  aliases.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceSpacingById[referenceId];

    if (!reference) {
      throw new Error(`Missing reference spacing token: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--layout-space-fixed-${cssSuffix}`,
      referenceId,
      resolvedSourcePx: reference.sourcePx,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const fixedLayoutSpacingById = Object.freeze(
  Object.fromEntries(fixedLayoutSpacing.map((token) => [token.id, token])),
);
