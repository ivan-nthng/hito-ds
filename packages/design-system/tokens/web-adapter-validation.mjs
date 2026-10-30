import { assert } from "./validation-helpers.mjs";

export function collectDeclarations(css) {
  return new Set(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*[^;]+;/giu)].map(
      (match) => match[1],
    ),
  );
}

export function collectReferences(css) {
  return new Set(
    [...css.matchAll(/var\(\s*(--[a-z0-9-]+)/giu)].map((match) => match[1]),
  );
}

export function collectPropertyValues(css, property) {
  const pattern = new RegExp(
    `(?:^|\\n)\\s*${property}\\s*:\\s*([^;]+);`,
    "giu",
  );
  return [...css.matchAll(pattern)].map((match) => match[1].trim());
}

export function collectDirectDependencies(manifest) {
  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);
}

const prohibitedStylingDependencies = [
  "@emotion/",
  "@linaria/",
  "@stitches/",
  "@tailwindcss/",
  "@vanilla-extract/",
  "goober",
  "sass",
  "styled-components",
  "tailwindcss",
];

export function validateStylingDependencies(manifest) {
  const dependencies = collectDirectDependencies(manifest);
  for (const dependency of dependencies) {
    assert(
      !prohibitedStylingDependencies.some(
        (prohibited) =>
          dependency === prohibited ||
          (prohibited.endsWith("/") && dependency.startsWith(prohibited)),
      ),
      `Unadmitted styling dependency: ${manifest.name ?? "root"}/${dependency}`,
    );
  }
}
