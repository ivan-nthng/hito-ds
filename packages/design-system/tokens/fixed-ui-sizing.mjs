import { referenceSpacingById } from "./reference-spacing.mjs";

const aliases = [
  ["ui/control/height/sm", "ui-control-height-sm", "space/7"],
  ["ui/control/height/md", "ui-control-height-md", "space/9"],
  ["ui/control/height/lg", "ui-control-height-lg", "space/11"],
  ["ui/control/height/xl", "ui-control-height-xl", "space/14"],
  ["ui/interaction/target/min", "ui-interaction-target-min", "space/11"],
  ["ui/icon/size/sm", "ui-icon-size-sm", "space/4"],
  ["ui/icon/size/md", "ui-icon-size-md", "space/5"],
  ["ui/icon/size/lg", "ui-icon-size-lg", "space/6"],
  ["ui/icon/size/xl", "ui-icon-size-xl", "space/7"],
];

export const fixedUiSizing = Object.freeze(
  aliases.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceSpacingById[referenceId];

    if (!reference) {
      throw new Error(`Missing reference spacing token: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--${cssSuffix}`,
      referenceId,
      resolvedSourcePx: reference.sourcePx,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const fixedUiSizingById = Object.freeze(
  Object.fromEntries(fixedUiSizing.map((token) => [token.id, token])),
);
