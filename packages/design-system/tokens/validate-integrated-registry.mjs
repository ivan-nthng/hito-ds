import { readFile } from "node:fs/promises";

import {
  registryComponentEntries,
  registryDomains,
  registryEntries,
  registryEntriesById,
  registryGroups,
  registryLayers,
  registryLifecycle,
  registryModeSets,
  registryReferenceEntries,
  registrySchemaVersion,
  registrySemanticEntries,
  tokenRegistry,
} from "./registry.mjs";
import { referenceColorsById } from "./reference-colors.mjs";
import { assert, contrastRatio } from "./validation-helpers.mjs";
import { cardResponsiveRadii } from "./component-card.mjs";
import { avatarDimensions, avatarRadii, avatarSizes } from "./component-avatar.mjs";

const EXPECTED_GROUP_COUNTS = Object.freeze({
  "component/avatar-dimensions": 8,
  "component/avatar-radii": 4,
  "radius/scale": 1,
  "component/selection-panel-radius": 3,
  "component/tabs-segmented-radius": 2,
  "component/card-radius": 2,
  "component/spinner-stroke": 1,
  "component/spinner-opacity": 3,
  "spacing/reference": 35,
  "spacing/fixed-ui-size": 9,
  "spacing/fixed-ui-space": 11,
  "spacing/fixed-layout-space": 6,
  "spacing/responsive-layout-space": 6,
  "color/reference": 98,
  "opacity/reference": 11,
  "color/surface-semantic": 42,
  "color/text-semantic": 15,
  "color/foreground-semantic": 7,
  "color/border-semantic": 19,
  "color/icon-semantic": 14,
  "color/focus-semantic": 2,
  "typography/font-weight-reference": 4,
  "typography/tracking-reference": 7,
  "typography/family-semantic": 3,
  "typography/emphasis-semantic": 4,
  "typography/metric-semantic": 25,
  "radius/reference": 1,
  "border/reference": 3,
  "shadow/reference": 16,
  "motion/duration-reference": 5,
  "motion/easing-reference": 4,
  "radius/semantic": 12,
  "radius/shape-semantic": 1,
  "border/semantic": 2,
  "focus/semantic": 1,
  "elevation/opacity-semantic": 2,
  "elevation/role-semantic": 4,
  "elevation/tint-semantic": 7,
  "motion/duration-semantic": 5,
  "component/radius": 1,
  "component/status-badge-color": 8,
  "component/button-color": 32,
  "component/button-motion": 1,
  "component/editable-text-color": 1,
});

function parseCssCustomProperties(css) {
  return new Set(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*[^;]+;/giu)].map(
      (match) => match[1],
    ),
  );
}

function assertAcyclicAliases(entriesById) {
  const visiting = new Set();
  const visited = new Set();

  function visit(id, path = []) {
    if (visited.has(id)) {
      return;
    }
    assert(
      !visiting.has(id),
      `Registry alias cycle: ${[...path, id].join(" -> ")}`,
    );
    visiting.add(id);
    const entry = entriesById[id];
    for (const aliasId of entry.aliasIds) {
      visit(aliasId, [...path, id]);
    }
    visiting.delete(id);
    visited.add(id);
  }

  for (const id of Object.keys(entriesById)) {
    visit(id);
  }
}

assert(registrySchemaVersion === 1, "Registry schema version drifted");
assert(
  tokenRegistry.schemaVersion === registrySchemaVersion,
  "Registry manifest schema drifted",
);
assert(
  registryLayers.join(",") === "reference,semantic,component",
  "Registry layer contract drifted",
);
assert(
  registryDomains.map((domain) => domain.sourceTask).join(",") ===
    "SAVI-72,SAVI-70,SAVI-71,SAVI-73",
  "Registry domain provenance drifted",
);
assert(registryGroups.length === Object.keys(EXPECTED_GROUP_COUNTS).length, "Integrated registry group count drifted");

for (const group of registryGroups) {
  assert(
    group.entries.length === EXPECTED_GROUP_COUNTS[group.id],
    `Registry group count drifted: ${group.id}`,
  );
  assert(
    group.entries.every(
      (entry) =>
        entry.domain === group.domain &&
        entry.layer === group.layer &&
        entry.tokenType === group.tokenType &&
        entry.sourceTask === group.sourceTask,
    ),
    `Registry group metadata drifted: ${group.id}`,
  );
}

assert(
  registryEntries.length === 448,
  "Integrated registry entry count drifted",
);
assert(
  registryReferenceEntries.length === 185,
  "Reference registry count drifted",
);
assert(
  registrySemanticEntries.length === 197,
  "Semantic registry count drifted",
);
assert(
  registryComponentEntries.length === 66,
  "Admitted component alias count drifted",
);
assert(!registryEntries.some(entry => /^radius\/\d/u.test(entry.id)),
  "Retired numeric radius identity remains in the registry");
for (const entry of registryEntries.filter(entry => entry.id.startsWith("radius/ui/") || entry.id.startsWith("radius/layout/") || entry.id === "component/switch/thumb-radius")) {
  assert(entry.aliasIds.length > 0 && entry.aliasIds.every(id => id.startsWith("space/")),
    `Numeric radius role must reference space directly: ${entry.id}`);
}
const packageManifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
assert(
  !registryEntries.some((entry) => /^font\/(?:size|line-height)\//u.test(entry.id)),
  "Retired typography numeric identities remain in the registry",
);
for (const moduleName of ["reference-font-sizes", "reference-line-heights"]) {
  assert(
    !packageManifest.exports[`./tokens/${moduleName}`],
    `Retired typography module remains exported: ${moduleName}`,
  );
  assert(
    await readFile(new URL(`./${moduleName}.mjs`, import.meta.url)).then(
      () => false,
      (error) => error.code === "ENOENT",
    ),
    `Retired typography module remains on disk: ${moduleName}`,
  );
}
assert(!packageManifest.exports["./tokens/reference-radii"] && packageManifest.exports["./tokens/radius-geometry"],
  "Radius package exports must expose geometry policy, not the retired numeric palette");
const editableTextEditingBorder =
  registryEntriesById["component/editable-text/editing-border"];
assert(editableTextEditingBorder, "Missing admitted editable-text editing border");
assert(
  editableTextEditingBorder.definition.referenceId === "color/orange/500",
  "Editable-text editing border mapping drifted",
);
const expectedButtonAliasIds = Object.freeze({
  "component/button/secondary/neutral/border": [
    "color/text/primary",
    "opacity/32",
  ],
  "component/button/secondary/accent/border": [
    "color/text/accent/default",
    "opacity/32",
  ],
  "component/button/secondary/success/border": [
    "color/green/500",
    "color/green/600",
    "opacity/32",
  ],
  "component/button/secondary/destructive/border": [
    "color/red/500",
    "color/red/600",
    "opacity/32",
  ],
});
for (const [id, expectedAliasIds] of Object.entries(expectedButtonAliasIds)) {
  const entry = registryEntriesById[id];
  assert(entry, `Missing admitted Button alias: ${id}`);
  assert(
    entry.aliasIds.length === expectedAliasIds.length &&
      expectedAliasIds.every((aliasId) => entry.aliasIds.includes(aliasId)),
    `Button alias composition drifted: ${id}`,
  );
}
const expectedButtonBorderModes = Object.freeze({
  "component/button/secondary/neutral/border": {
    light: ["color/text/primary", "opacity/32"],
    dark: ["color/text/primary", "opacity/32"],
  },
  "component/button/secondary/accent/border": {
    light: ["color/text/accent/default", "opacity/32"],
    dark: ["color/text/accent/default", "opacity/32"],
  },
  "component/button/secondary/success/border": {
    light: ["color/green/500", "opacity/32"],
    dark: ["color/green/600", "opacity/32"],
  },
  "component/button/secondary/destructive/border": {
    light: ["color/red/500", "opacity/32"],
    dark: ["color/red/600", "opacity/32"],
  },
});
for (const [id, expectedModes] of Object.entries(expectedButtonBorderModes)) {
  const definition = registryEntriesById[id]?.definition;
  assert(
    definition?.kind === "mode-color-opacity-composition",
    `Button secondary border must remain a mode color-opacity composition: ${id}`,
  );
  for (const [modeId, [baseId, opacityReferenceId]] of Object.entries(
    expectedModes,
  )) {
    assert(
      definition.modes?.[modeId]?.baseId === baseId &&
        definition.modes?.[modeId]?.opacityReferenceId === opacityReferenceId,
      `Button secondary border mode drifted: ${id}/${modeId}`,
    );
  }
}
let buttonPrimaryContrastPairs = 0;
let buttonPrimaryContrastExceptions = 0;
const acceptedLightSuccessContrastByState = Object.freeze({
  default: 2.4,
  hover: 3,
  pressed: 4.5,
});
const acceptedPrimarySuccessBackgroundByState = Object.freeze({
  default: Object.freeze({
    light: "color/green/500",
    dark: "color/green/700",
  }),
  hover: Object.freeze({
    light: "color/green/600",
    dark: "color/green/800",
  }),
  pressed: Object.freeze({
    light: "color/green/700",
    dark: "color/green/900",
  }),
});
for (const intent of ["accent", "info", "success", "warning", "destructive"]) {
  const foreground =
    registryEntriesById[`component/button/primary/${intent}/foreground`]
      ?.definition;
  assert(foreground, `Missing Button primary foreground: ${intent}`);
  for (const state of ["default", "hover", "pressed"]) {
    const background =
      registryEntriesById[
        `component/button/primary/${intent}/background/${state}`
      ]?.definition;
    assert(
      background,
      `Missing Button primary background: ${intent}/${state}`,
    );
    for (const modeId of ["light", "dark"]) {
      if (intent === "success") {
        assert(
          background.modes[modeId].referenceId ===
            acceptedPrimarySuccessBackgroundByState[state][modeId],
          `Button primary success ramp drifted: ${state}/${modeId}`,
        );
        assert(
          foreground.modes[modeId].referenceId === "color/basic/white",
          `Button primary success foreground drifted: ${modeId}`,
        );
      }
      const foregroundColor =
        referenceColorsById[foreground.modes[modeId].referenceId]?.value;
      const backgroundColor =
        referenceColorsById[background.modes[modeId].referenceId]?.value;
      assert(
        foregroundColor && backgroundColor,
        `Button primary contrast references a missing color: ${intent}/${state}/${modeId}`,
      );
      const acceptedMinimum =
        intent === "success" && modeId === "light"
          ? acceptedLightSuccessContrastByState[state]
          : 4.5;
      const measuredContrast = contrastRatio(
        foregroundColor,
        backgroundColor,
      );
      assert(
        measuredContrast >= acceptedMinimum,
        `Button primary contrast failed: ${intent}/${state}/${modeId}`,
      );
      if (acceptedMinimum < 4.5) {
        buttonPrimaryContrastExceptions += 1;
      }
      buttonPrimaryContrastPairs += 1;
    }
  }
}
assert(
  Object.keys(registryEntriesById).length === registryEntries.length,
  "Duplicate registry identity",
);
assert(
  registryEntries.every(
    (entry) =>
      entry.id === entry.definition.id &&
      typeof entry.lifecycle === "string" &&
      entry.lifecycle.length > 0,
  ),
  "Registry entry schema or lifecycle metadata is incomplete",
);

for (const entry of registryEntries) {
  if (entry.layer === "reference") {
    assert(
      entry.aliasIds.length === 0,
      `Reference token must not alias another token: ${entry.id}`,
    );
  }
  for (const aliasId of entry.aliasIds) {
    assert(
      registryEntriesById[aliasId],
      `Missing registry alias target: ${entry.id} -> ${aliasId}`,
    );
  }
}
assertAcyclicAliases(registryEntriesById);

const declaredCssVariables = registryEntries.flatMap(
  (entry) => entry.declaredCssVariables,
);
assert(
  new Set(declaredCssVariables).size === declaredCssVariables.length,
  "Duplicate declared CSS custom-property ownership",
);

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
const cssProperties = parseCssCustomProperties(css);
const avatarSource = await readFile(new URL("../src/components/Avatar/Avatar.tsx", import.meta.url), "utf8");
assert(avatarSource.includes(`export const avatarSizes = [${avatarSizes.map(size => `"${size}"`).join(", ")}] as const;`), "Avatar public size vocabulary drifted from registered aliases");
for (const alias of [...avatarDimensions, ...avatarRadii]) {
  assert(css.includes(`${alias.cssVariable}: ${alias.webValue};`), `Avatar adapter drifted: ${alias.id}`);
}
assert(
  avatarRadii.map((radius) => radius.resolvedSourcePx).join(",") === "4,8,12,24",
  "Rounded Avatar radii must resolve to the accepted XS/SM/MD/LG values",
);
for (const radius of cardResponsiveRadii) {
  const modes = Object.values(radius.modes);
  const expected = radius.id.endsWith("/compact")
    ? ["radius/layout/fixed/md", "radius/layout/fixed/lg", "space/5", "radius/layout/fixed/xl"]
    : ["radius/layout/fixed/xl", "radius/layout/fixed/xl", "space/7", "radius/layout/fixed/2xl"];
  assert(
    Object.keys(radius.modes).join(",") === "sm,md,lg,xl" &&
      modes.map((mode) => mode.semanticId ?? mode.referenceId).join(",") === expected.join(",") &&
      modes.map(mode => mode.resolvedSourcePx).join(",") === (radius.id.endsWith("/compact") ? "12,16,20,24" : "24,24,28,32"),
    `Card responsive radius must retain its accepted viewport mapping: ${radius.id}`,
  );
  const declarations = [...css.matchAll(new RegExp(`${radius.cssVariable}:\\s*([^;]+);`, "gu"))]
    .map((match) => match[1]);
  assert(
    declarations.join("|") === modes.map((mode) => mode.webValue).join("|"),
    `Card responsive radius web adapter drifted from its governed mode mapping: ${radius.id}`,
  );
}
for (const [part, aliasId] of [
  ["stroke/width", "border/width/strong"],
  ["track/opacity", "opacity/16"],
  ["arc/head/opacity", "opacity/100"],
  ["arc/tail/opacity", "opacity/0"],
]) {
  const entry = registryEntriesById[`component/spinner/${part}`];
  assert(entry.aliasIds.includes(aliasId), `Spinner alias drifted: ${part}`);
  assert(css.includes(`${entry.definition.cssVariable}: ${entry.definition.webValue};`), `Spinner adapter drifted: ${part}`);
}
for (const variable of declaredCssVariables) {
  assert(
    cssProperties.has(variable),
    `Integrated CSS adapter is missing: ${variable}`,
  );
}

assert(
  registryModeSets.colorScheme.map((mode) => mode.id).join(",") ===
    "light,dark",
  "Surface color-scheme mode contract drifted",
);
assert(
  registryModeSets.viewport
    .map((mode) => [mode.id, mode.minWidthSourcePx])
    .join("|") === "sm,0|md,640|lg,1024|xl,1280",
  "Shared viewport mode contract drifted",
);
assert(
  tokenRegistry.policies.typographyViewportModes
    .map((mode) => [mode.id, mode.minWidthSourcePx])
    .join("|") ===
    registryModeSets.viewport
      .map((mode) => [mode.id, mode.minWidthSourcePx])
      .join("|"),
  "Typography and layout viewport modes drifted",
);
assert(
  tokenRegistry.policies.alphaComposition.canonicalFlattenedRgbaAllowed ===
    false &&
    tokenRegistry.policies.surface.canonicalFlattenedRgbaAllowed === false &&
    tokenRegistry.policies.surface.intents.join(",") ===
      "neutral,accent,info,success,warning,destructive" &&
    tokenRegistry.policies.surface.supersededGlobalActionFamily ===
      "removed-with-zero-consumers" &&
    tokenRegistry.policies.textColor.typographyCoupling === "prohibited" &&
    tokenRegistry.policies.textColor.shadeNumberAccessibilityClaim ===
      "prohibited" &&
    tokenRegistry.policies.borderColor.separatorRoleId ===
      "color/border/subtle" &&
    tokenRegistry.policies.iconColor.intentDisabledAliases ===
      "prohibited-use-universal-icon-disabled" &&
    tokenRegistry.policies.focusColor.mechanism === "outer-outline" &&
    tokenRegistry.policies.focusColor.intentSpecificMatrix === "prohibited" &&
    tokenRegistry.policies.radiusSemantic.universalInnerToken ===
      "prohibited" &&
    tokenRegistry.policies.motion.propertyDurationEasingMatrix ===
      "prohibited" &&
    tokenRegistry.policies.typography.cartesianStyleGeneration === "prohibited",
  "Cross-domain composition boundaries drifted",
);
assert(
  registryLifecycle.authorityPath === "packages/design-system/tokens/" &&
    registryLifecycle.canonicalOwner === "FRONTEND" &&
    registryLifecycle.synchronizationDirection ===
      "registry-to-platform-adapters" &&
    registryLifecycle.figmaOverwrite === "prohibited",
  "Registry authority or synchronization direction drifted",
);
assert(
  registryLifecycle.deprecationSequence.at(-1) ===
    "separately-authorized-delete-at-zero-usage" &&
    registryLifecycle.rollback ===
      "non-rewriting-revert-of-exact-registry-revision" &&
    registryLifecycle.downstreamRollback ===
      "independent-adapter-inverse-ledger",
  "Registry lifecycle or rollback contract drifted",
);

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
assert(
  packageJson.exports["./tokens"] === "./tokens/registry.mjs" &&
    packageJson.exports["./tokens/registry"] === "./tokens/registry.mjs",
  "Integrated registry package exports drifted",
);
assert(
  packageJson.scripts["validate:registry"] ===
    "node tokens/validate-integrated-registry.mjs" &&
    packageJson.scripts["validate:tokens"].includes("validate:registry"),
  "Integrated registry validation scripts drifted",
);

console.log(
  [
    "SAVI-78 integrated token registry validation PASS",
    `schema=${registrySchemaVersion}`,
    `domains=${registryDomains.length}`,
    `groups=${registryGroups.length}`,
    `entries=${registryEntries.length}`,
    `references=${registryReferenceEntries.length}`,
    `semantics=${registrySemanticEntries.length}`,
    `components=${registryComponentEntries.length}`,
    `aliases=${registryEntries.reduce((count, entry) => count + entry.aliasIds.length, 0)}`,
    "missingAliases=0",
    "aliasCycles=0",
    `cssDeclarations=${declaredCssVariables.length}`,
    "cssCoverage=PASS",
    "modeParity=PASS",
    `buttonPrimaryContrastPairs=${buttonPrimaryContrastPairs}`,
    `buttonPrimaryContrastExceptions=${buttonPrimaryContrastExceptions}`,
    "buttonPrimarySuccessRamp=PASS",
    "authority=FRONTEND",
    "figmaOverwrite=PROHIBITED",
    "rollback=RECORDED",
  ].join(" "),
);
