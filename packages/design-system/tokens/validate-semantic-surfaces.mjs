import { readFile } from "node:fs/promises";

import { referenceColorsById } from "./reference-colors.mjs";
import { referenceOpacityById } from "./reference-opacity.mjs";
import { resolveConcentricInnerRadius } from "./semantic-radii.mjs";
import {
  semanticSurfaceForegroundRoles,
  semanticSurfaceForegroundRolesById,
  semanticSurfaceModes,
  semanticSurfacePolicy,
  semanticSurfaceRoles,
  semanticSurfaceRolesById,
} from "./semantic-surfaces.mjs";
import { assert, contrastRatio, normalizeCss } from "./validation-helpers.mjs";

const expectedLayers = Object.freeze({
  "color/surface/canvas": Object.freeze({
    light: "color/neutral/50",
    dark: "color/neutral/1000",
  }),
  "color/surface/base": Object.freeze({
    light: "color/basic/white",
    dark: "color/neutral/950",
  }),
  "color/surface/raised": Object.freeze({
    light: "color/basic/white",
    dark: "color/neutral/900",
  }),
  "color/surface/overlay": Object.freeze({
    light: "color/basic/white",
    dark: "color/neutral/950",
  }),
});

const expectedIntents = Object.freeze({
  neutral: Object.freeze({
    subtle: Object.freeze({
      light: "color/neutral/950",
      dark: "color/neutral/50",
    }),
    strong: Object.freeze({
      default: Object.freeze({
        light: "color/neutral/950",
        dark: "color/neutral/50",
      }),
      hover: Object.freeze({
        light: "color/neutral/800",
        dark: "color/neutral/200",
      }),
      pressed: Object.freeze({
        light: "color/neutral/700",
        dark: "color/neutral/300",
      }),
    }),
  }),
  accent: Object.freeze({
    subtle: Object.freeze({
      light: "color/brand/800",
      dark: "color/brand/400",
    }),
    strong: Object.freeze({
      default: Object.freeze({
        light: "color/brand/400",
        dark: "color/brand/500",
      }),
      hover: Object.freeze({
        light: "color/brand/500",
        dark: "color/brand/400",
      }),
      pressed: Object.freeze({
        light: "color/brand/600",
        dark: "color/brand/300",
      }),
    }),
  }),
  info: Object.freeze({
    subtle: Object.freeze({ light: "color/blue/700", dark: "color/blue/400" }),
    strong: Object.freeze({
      default: Object.freeze({
        light: "color/blue/700",
        dark: "color/blue/400",
      }),
      hover: Object.freeze({ light: "color/blue/800", dark: "color/blue/300" }),
      pressed: Object.freeze({
        light: "color/blue/900",
        dark: "color/blue/200",
      }),
    }),
  }),
  success: Object.freeze({
    subtle: Object.freeze({
      light: "color/green/700",
      dark: "color/green/300",
    }),
    strong: Object.freeze({
      default: Object.freeze({
        light: "color/green/700",
        dark: "color/green/300",
      }),
      hover: Object.freeze({
        light: "color/green/800",
        dark: "color/green/200",
      }),
      pressed: Object.freeze({
        light: "color/green/900",
        dark: "color/green/100",
      }),
    }),
  }),
  warning: Object.freeze({
    subtle: Object.freeze({
      light: "color/orange/700",
      dark: "color/orange/300",
    }),
    strong: Object.freeze({
      default: Object.freeze({
        light: "color/orange/700",
        dark: "color/orange/300",
      }),
      hover: Object.freeze({
        light: "color/orange/800",
        dark: "color/orange/200",
      }),
      pressed: Object.freeze({
        light: "color/orange/900",
        dark: "color/orange/100",
      }),
    }),
  }),
  destructive: Object.freeze({
    subtle: Object.freeze({ light: "color/red/700", dark: "color/red/300" }),
    strong: Object.freeze({
      default: Object.freeze({ light: "color/red/700", dark: "color/red/300" }),
      hover: Object.freeze({ light: "color/red/800", dark: "color/red/200" }),
      pressed: Object.freeze({ light: "color/red/900", dark: "color/red/100" }),
    }),
  }),
});

const expectedSubtleOpacity = Object.freeze({
  default: "opacity/8",
  hover: "opacity/12",
  pressed: "opacity/16",
});

const expectedNeutralSubtleOpacity = Object.freeze({
  default: "opacity/4",
  hover: "opacity/8",
  pressed: "opacity/12",
});

assert(semanticSurfaceRoles.length === 42, "Expected exactly 42 Surface roles");
const onScrim = semanticSurfaceForegroundRolesById["color/foreground/on-scrim"];
for (const mode of ["light", "dark"]) {
  assert(onScrim.modes[mode].referenceId === "color/basic/white", `On-scrim must stay white in ${mode}`);
}
const scrimOpacity = referenceOpacityById["opacity/64"].value;
const lightestComposedChannel = 255 * (1 - scrimOpacity);
assert(contrastRatio([255, 255, 255], [lightestComposedChannel, lightestComposedChannel, lightestComposedChannel]) >= 4.5, "On-scrim must contrast over a white image");
assert(
  semanticSurfaceForegroundRoles.length === 7,
  "Expected six on-strong foreground roles and one on-scrim role",
);
assert(
  semanticSurfaceModes.map((mode) => mode.id).join(",") === "light,dark",
  "Surface modes must remain light and dark",
);

for (const [roleId, expectedModes] of Object.entries(expectedLayers)) {
  const role = semanticSurfaceRolesById[roleId];
  assert(
    role?.kind === "opaque-mode-alias",
    `Missing Surface layer: ${roleId}`,
  );
  for (const [modeId, referenceId] of Object.entries(expectedModes)) {
    assert(
      role.modes[modeId].referenceId === referenceId,
      `Surface layer mapping drifted: ${roleId}/${modeId}`,
    );
  }
}

const contextualSubtle = semanticSurfaceRolesById["color/surface/subtle"];
assert(
  contextualSubtle.kind === "contextual-alpha" &&
    contextualSubtle.foregroundInput === "paired-semantic-content-color" &&
    contextualSubtle.opacityReferenceId === "opacity/8" &&
    contextualSubtle.resolvedOpacity === 0.08,
  "Contextual Subtle composition drifted",
);

const scrim = semanticSurfaceRolesById["color/surface/scrim"];
assert(
  scrim.kind === "color-opacity-composition" &&
    scrim.colorReferenceId === "color/basic/black" &&
    scrim.opacityReferenceId === "opacity/64" &&
    scrim.resolvedOpacity === 0.64,
  "Scrim composition drifted",
);

for (const [intent, expected] of Object.entries(expectedIntents)) {
  const foreground =
    semanticSurfaceForegroundRolesById[`color/foreground/on-${intent}-strong`];
  assert(foreground, `Missing paired on-strong foreground: ${intent}`);

  for (const [state, opacityReferenceId] of Object.entries(
    intent === "neutral" ? expectedNeutralSubtleOpacity : expectedSubtleOpacity,
  )) {
    const subtleRole =
      semanticSurfaceRolesById[`color/surface/${intent}/subtle/${state}`];
    assert(
      subtleRole?.kind === "mode-color-opacity-composition" &&
        subtleRole.opacityReferenceId === opacityReferenceId &&
        subtleRole.resolvedOpacity ===
          referenceOpacityById[opacityReferenceId].value,
      `Subtle Surface state drifted: ${intent}/${state}`,
    );
    for (const modeId of ["light", "dark"]) {
      assert(
        subtleRole.modes[modeId].referenceId === expected.subtle[modeId],
        `Subtle Surface color drifted: ${intent}/${state}/${modeId}`,
      );
    }
  }

  for (const [state, expectedModes] of Object.entries(expected.strong)) {
    const strongRole =
      semanticSurfaceRolesById[`color/surface/${intent}/strong/${state}`];
    assert(
      strongRole?.kind === "opaque-mode-alias",
      `Missing Strong Surface state: ${intent}/${state}`,
    );

    for (const modeId of ["light", "dark"]) {
      const referenceId = expectedModes[modeId];
      assert(
        strongRole.modes[modeId].referenceId === referenceId,
        `Strong Surface color drifted: ${intent}/${state}/${modeId}`,
      );
      const foregroundReferenceId = foreground.modes[modeId].referenceId;
      assert(
        contrastRatio(
          referenceColorsById[referenceId].value,
          referenceColorsById[foregroundReferenceId].value,
        ) >= 4.5,
        `On-strong foreground fails 4.5:1: ${intent}/${state}/${modeId}`,
      );
    }
  }
}

assert(
  semanticSurfacePolicy.intents.join(",") ===
    "neutral,accent,info,success,warning,destructive" &&
    semanticSurfacePolicy.intentEmphasis.join(",") === "subtle,strong" &&
    semanticSurfacePolicy.interactionStates.join(",") ===
      "default,hover,pressed" &&
    semanticSurfacePolicy.hoverPressedRequirement ===
      "interactive-surface-only" &&
    semanticSurfacePolicy.staticSurfaceState === "default-only" &&
    semanticSurfacePolicy.disabledMeaning === "component-owned-composition" &&
    semanticSurfacePolicy.focusMeaning ===
      "separate-focus-indicator-contract" &&
    semanticSurfacePolicy.overlayColorRelationship ===
      "same-as-base-depth-via-scrim-and-elevation" &&
    semanticSurfacePolicy.canonicalFlattenedRgbaAllowed === false &&
    semanticSurfacePolicy.supersededGlobalActionFamily ===
      "removed-with-zero-consumers",
  "Surface semantic policy drifted",
);

for (const modeId of ["light", "dark"]) {
  assert(
    semanticSurfaceRolesById["color/surface/overlay"].modes[modeId]
      .referenceId ===
      semanticSurfaceRolesById["color/surface/base"].modes[modeId].referenceId,
    `Overlay must share Base color and express depth through effects: ${modeId}`,
  );
}

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
const storyCss = await readFile(
  new URL(
    "../src/foundations/SurfaceColors.stories.module.css",
    import.meta.url,
  ),
  "utf8",
);
const storySource = await readFile(
  new URL("../src/foundations/SurfaceColors.stories.tsx", import.meta.url),
  "utf8",
);
const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const normalizedCss = normalizeCss(css);

function storyAdoptsSurfaceRole(role) {
  if (storyCss.includes(`var(${role.cssVariable})`)) {
    return true;
  }

  const [, family, intent, emphasis, state] = role.id.split("/");
  if (family === "surface" && intent && emphasis && state) {
    return storySource.includes(
      `--color-surface-\${intent}-${emphasis}-${state}`,
    );
  }

  return (
    family === "foreground" &&
    intent?.startsWith("on-") &&
    storySource.includes("--color-foreground-on-${intent}-strong")
  );
}

for (const role of [
  ...semanticSurfaceRoles,
  ...semanticSurfaceForegroundRoles,
]) {
  assert(
    storyAdoptsSurfaceRole(role),
    `Surface Storybook adoption is missing: ${role.cssVariable}`,
  );

  if (role.kind === "opaque-mode-alias") {
    for (const mode of Object.values(role.modes)) {
      const reference = referenceColorsById[mode.referenceId];
      assert(
        normalizedCss.includes(
          `${role.cssVariable}: var(${reference.cssVariable});`,
        ),
        `Surface CSS mapping is missing: ${role.id} -> ${reference.id}`,
      );
    }
  }
}

assert(
  normalizedCss.includes(
    "--color-surface-subtle: rgb(from currentColor r g b / var(--ref-opacity-8));",
  ) &&
    normalizedCss.includes(
      "--color-surface-scrim: rgb(from var(--ref-color-basic-black) r g b / var(--ref-opacity-64));",
    ),
  "Contextual Subtle or Scrim CSS composition is missing",
);

for (const [intent, expected] of Object.entries(expectedIntents)) {
  for (const [state, opacityReferenceId] of Object.entries(
    intent === "neutral" ? expectedNeutralSubtleOpacity : expectedSubtleOpacity,
  )) {
    const role =
      semanticSurfaceRolesById[`color/surface/${intent}/subtle/${state}`];
    const opacity = referenceOpacityById[opacityReferenceId];
    for (const referenceId of Object.values(expected.subtle)) {
      const reference = referenceColorsById[referenceId];
      assert(
        normalizedCss.includes(
          `${role.cssVariable}: rgb(from var(${reference.cssVariable}) r g b / var(${opacity.cssVariable}));`,
        ),
        `Subtle Surface CSS mapping is missing: ${role.id}/${reference.id}`,
      );
    }
  }
}

const nestedStoryPair = resolveConcentricInnerRadius({
  outerRadiusId: "radius/layout/fixed/xl",
  insetSpacingId: "space/4",
  borderWidthId: "border/width/0",
});
assert(
  nestedStoryPair.outerReferenceId === "space/6" &&
    nestedStoryPair.resolvedInsetSourcePx === 16 &&
    nestedStoryPair.strictInnerReferenceId === "space/2" &&
    nestedStoryPair.innerReferenceId === "space/2.5" &&
    nestedStoryPair.opticalCompensationSourcePx === 2 &&
    storyCss.includes("padding: var(--layout-space-fixed-lg);") &&
    storyCss.includes("border-radius: var(--radius-layout-fixed-xl);") &&
    storyCss.includes(
      "--demo-concentric-inner-radius: calc(var(--ref-space-2-5) * var(--radius-scale));",
    ) &&
    storyCss.includes("border-radius: var(--demo-concentric-inner-radius);") &&
    storySource.includes('data-concentric-pair="24/16/10"'),
  "Surface Storybook nesting must preserve the accepted optically softened 24/16/10 pair",
);

for (const composition of [
  "canvas-base",
  "canvas-raised",
  "base-raised",
  "base-overlay",
  "canvas-overlay",
  "surface-subtle",
]) {
  assert(
    storySource.includes(`data-surface-composition="${composition}"`),
    `Surface usage proof is missing: ${composition}`,
  );
}

assert(
  storySource.includes('id: "foundations-color-surface"'),
  "Surface stories require a stable explicit ID",
);
assert(
  !storySource.includes("CornerSoftening") &&
    !storyCss.includes("cornerComparison"),
  "Legacy radius documentation remains under Color/Surface",
);
assert(
  !storyCss.includes("border-block-end") &&
    !storyCss.includes("border-block-start"),
  "Legacy divider-led Surface layout remains",
);

assert(
  !css.includes("--color-action-"),
  "Superseded Action CSS variables remain",
);
assert(
  !packageJson.scripts["validate:action-colors"] &&
    !packageJson.exports["./tokens/semantic-action-colors"],
  "Superseded Action package entry remains",
);
assert(!/#[0-9a-f]{8}\b/iu.test(css), "Surface adapter must not flatten alpha");

console.log(
  [
    "SAVI-81 semantic Surface validation PASS",
    `surfaceRoles=${semanticSurfaceRoles.length}`,
    `foregroundRoles=${semanticSurfaceForegroundRoles.length}`,
    "layers=canvas/base/subtle/raised/overlay/scrim",
    "intents=neutral/accent/info/success/warning/destructive",
    "emphasis=subtle/strong",
    "states=default/hover/pressed",
    "onStrongContrast>=4.5",
    "actionLegacy=ABSENT",
    "flattenedAlpha=ABSENT",
    "nestedStoryPair=24/16/10",
    "usageCompositions=6",
    "legacyRowDividers=ABSENT",
  ].join(" "),
);
