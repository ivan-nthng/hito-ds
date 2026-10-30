import { readFile } from "node:fs/promises";
import { registryEntries, registryWebAdapter, tokenRegistry } from "./registry.mjs";
import { assert } from "./validation-helpers.mjs";
import { collectDeclarations, collectReferences, collectPropertyValues, validateStylingDependencies } from "./web-adapter-validation.mjs";

const [tokensCss, baseCss, manifest] = await Promise.all([
  readFile(new URL("../src/tokens.css", import.meta.url), "utf8"),
  readFile(new URL("../src/base.css", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8").then(JSON.parse),
]);

assert(
  tokenRegistry.webAdapter === registryWebAdapter &&
    registryWebAdapter.transport === "css-custom-properties" &&
    registryWebAdapter.consumerBoundary === "global-base-and-css-modules" &&
    registryWebAdapter.runtimeJavascriptStyling === "prohibited",
  "Web adapter contract drifted",
);

const declarations = collectDeclarations(tokensCss);
const registryVariables = new Set(
  registryEntries.flatMap((entry) => entry.declaredCssVariables),
);
const admittedAdapterVariables = new Set([
  ...registryVariables,
  ...registryWebAdapter.platformCompatibilityVariables,
  ...registryWebAdapter.internalCompositionVariables,
]);

for (const variable of registryVariables) {
  assert(
    declarations.has(variable),
    `Registry CSS variable is missing: ${variable}`,
  );
}
for (const variable of declarations) {
  assert(
    admittedAdapterVariables.has(variable),
    `Unowned writable CSS custom property remains: ${variable}`,
  );
}
for (const variable of registryWebAdapter.retiredCompatibilityVariables) {
  assert(
    !tokensCss.includes(variable),
    `Retired compatibility alias remains: ${variable}`,
  );
  assert(
    !baseCss.includes(variable),
    `Base CSS consumes retired alias: ${variable}`,
  );
}

for (const property of [
  "font-size",
  "font-weight",
  "letter-spacing",
  "line-height",
]) {
  const values = collectPropertyValues(baseCss, property);
  assert(values.length > 0, `Base CSS does not consume ${property}`);
  assert(
    values.every((value) => value.startsWith("var(--")),
    `Base CSS contains raw ${property}`,
  );
}

assert(
  baseCss.includes("background: var(--color-surface-canvas)"),
  "Base page background must consume the Canvas role",
);

for (const variable of collectReferences(baseCss)) {
  assert(declarations.has(variable), `Base CSS references an undeclared adapter variable: ${variable}`);
}
validateStylingDependencies(manifest);
console.log(`DS web token adapter validation PASS registryVariables=${registryVariables.size} adapterVariables=${declarations.size} retiredAliases=ABSENT stylingDependencies=ABSENT`);
