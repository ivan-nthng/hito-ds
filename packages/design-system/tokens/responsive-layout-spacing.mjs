import { referenceSpacingById } from "./reference-spacing.mjs";

export const responsiveLayoutModes = Object.freeze(
  /** @type {const} */ ([
    Object.freeze({
      id: "sm",
      minWidthSourcePx: 0,
      minWidthWebValue: /** @type {null} */ (null),
    }),
    Object.freeze({ id: "md", minWidthSourcePx: 640, minWidthWebValue: "40rem" }),
    Object.freeze({ id: "lg", minWidthSourcePx: 1024, minWidthWebValue: "64rem" }),
    Object.freeze({ id: "xl", minWidthSourcePx: 1280, minWidthWebValue: "80rem" }),
  ]),
);

const definitions = /** @type {const} */ ([
  ["layout/space/responsive/xs", "xs", ["space/1", "space/2", "space/3", "space/4"]],
  ["layout/space/responsive/sm", "sm", ["space/3", "space/4", "space/4", "space/5"]],
  ["layout/space/responsive/md", "md", ["space/3", "space/4", "space/5", "space/6"]],
  ["layout/space/responsive/lg", "lg", ["space/4", "space/5", "space/6", "space/8"]],
  ["layout/space/responsive/xl", "xl", ["space/6", "space/8", "space/10", "space/12"]],
  ["layout/space/responsive/2xl", "2xl", ["space/8", "space/10", "space/12", "space/14"]],
]);

export const responsiveLayoutSpacing = Object.freeze(
  definitions.map(([id, cssSuffix, referenceIds]) => {
    const modes = Object.fromEntries(
      responsiveLayoutModes.map((mode, index) => {
        const referenceId = referenceIds[index];
        const reference = referenceSpacingById[referenceId];

        if (!reference) {
          throw new Error(`Missing reference spacing token: ${referenceId}`);
        }

        return [
          mode.id,
          Object.freeze({
            referenceId,
            resolvedSourcePx: reference.sourcePx,
            resolvedWebValue: reference.webValue,
          }),
        ];
      }),
    );

    return Object.freeze({
      id,
      cssVariable: `--layout-space-responsive-${cssSuffix}`,
      modes: Object.freeze(modes),
    });
  }),
);

export const responsiveLayoutSpacingById = Object.freeze(
  Object.fromEntries(responsiveLayoutSpacing.map((token) => [token.id, token])),
);
