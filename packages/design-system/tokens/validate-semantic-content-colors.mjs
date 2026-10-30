import { readFile } from "node:fs/promises";

import {
  semanticBorderColorPolicy,
  semanticBorderColorRoles,
  semanticBorderColorRolesById,
} from "./semantic-border-colors.mjs";
import {
  semanticIconColorPolicy,
  semanticIconColorRoles,
  semanticIconColorRolesById,
} from "./semantic-icon-colors.mjs";
import { assert } from "./validation-helpers.mjs";

const expectedIntents = ["accent", "info", "success", "warning", "destructive"];
const expectedStates = ["subtle", "default", "hover"];

assert(
  semanticBorderColorRoles.length === 19,
  "Border color role count drifted",
);
assert(semanticIconColorRoles.length === 14, "Icon color role count drifted");
assert(
  Object.keys(semanticBorderColorRolesById).length ===
    semanticBorderColorRoles.length,
  "Duplicate border color identity",
);
assert(
  Object.keys(semanticIconColorRolesById).length ===
    semanticIconColorRoles.length,
  "Duplicate icon color identity",
);

for (const [name, opacityReferenceId] of [
  ["subtle", "opacity/12"],
  ["default", "opacity/24"],
  ["strong", "opacity/48"],
  ["disabled", "opacity/12"],
]) {
  const role = semanticBorderColorRolesById[`color/border/${name}`];
  assert(
    role?.kind === "contextual-alpha",
    `Border ${name} must remain contextual alpha`,
  );
  assert(
    role.opacityReferenceId === opacityReferenceId,
    `Border ${name} opacity drifted`,
  );
  assert(
    role.foregroundInput === "paired-semantic-content-color",
    `Border ${name} lost paired foreground provenance`,
  );
}

for (const intent of expectedIntents) {
  for (const state of expectedStates) {
    const border =
      semanticBorderColorRolesById[`color/border/${intent}/${state}`];
    const icon = semanticIconColorRolesById[`color/icon/${intent}/${state}`];
    assert(
      border?.kind === "mode-color-opacity-composition",
      `Missing border ${intent}/${state}`,
    );
    if (state !== "subtle") {
      assert(
        icon?.kind === "opaque-mode-alias",
        `Missing icon ${intent}/${state}`,
      );
    }
    assert(
      border.opacityReferenceId ===
        { subtle: "opacity/24", default: "opacity/64", hover: "opacity/80" }[
          state
        ],
      `Border ${intent}/${state} opacity drifted`,
    );
    assert(
      Object.keys(border.modes).join(",") === "light,dark" &&
        (state === "subtle" ||
          Object.keys(icon.modes).join(",") === "light,dark"),
      `Color modes drifted for ${intent}/${state}`,
    );
  }
  assert(
    !semanticBorderColorRolesById[`color/border/${intent}/disabled`] &&
      !semanticIconColorRolesById[`color/icon/${intent}/disabled`],
    `Intent-specific disabled alias must not exist: ${intent}`,
  );
}

assert(
  semanticIconColorRolesById["color/icon/disabled"].baseSemanticId ===
    "color/icon/default" &&
    semanticIconColorRolesById["color/icon/disabled"].opacityReferenceId ===
      "opacity/48",
  "Universal disabled icon composition drifted",
);
assert(
  semanticBorderColorPolicy.separatorRoleId === "color/border/subtle" &&
    semanticBorderColorPolicy.focusMeaning ===
      "separate-focus-indicator-contract" &&
    semanticBorderColorPolicy.intentDisabledAliases ===
      "prohibited-use-universal-border-disabled",
  "Border color policy drifted",
);
assert(
  semanticIconColorPolicy.intentDisabledAliases ===
    "prohibited-use-universal-icon-disabled" &&
    semanticIconColorPolicy.colorOnlyMeaning ===
      "prohibited-use-label-shape-or-state-in-addition",
  "Icon color policy drifted",
);

const css = await readFile(
  new URL("../src/tokens.css", import.meta.url),
  "utf8",
);
for (const role of [...semanticBorderColorRoles, ...semanticIconColorRoles]) {
  assert(
    css.includes(`${role.cssVariable}:`),
    `CSS adapter missing ${role.cssVariable}`,
  );
}
assert(
  !/--color-(?:border|icon)-(?:accent|info|success|warning|destructive)-disabled\s*:/u.test(
    css,
  ),
  "Intent-specific disabled CSS variables must not exist",
);
assert(
  !/(?:rgba\(|#[0-9a-f]{8}\b)/iu.test(
    css.slice(
      css.indexOf("/* Semantic border colors"),
      css.indexOf("/* Semantic geometry"),
    ),
  ),
  "Semantic border/icon CSS must retain reference plus opacity provenance",
);

console.log(
  [
    "SAVI-81 semantic border and icon color validation PASS",
    `borderRoles=${semanticBorderColorRoles.length}`,
    `iconRoles=${semanticIconColorRoles.length}`,
    `intents=${expectedIntents.length}`,
    "states=subtle,default,hover,universal-disabled",
    "separator=border/subtle",
    "focus=SEPARATE",
    "flattenedRgba=ABSENT",
    "intentDisabledMatrix=ABSENT",
  ].join(" "),
);
