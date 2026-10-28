import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

import { assert } from "./validation-helpers.mjs";

const ICON_ROOT = new URL("../src/components/Icon/", import.meta.url);
const ASSET_ROOT = new URL("../src/components/Icon/assets/", import.meta.url);

async function listSvgFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryUrl = new URL(entry.name, directoryUrl);
    if (entry.isDirectory()) {
      files.push(
        ...(await listSvgFiles(new URL(`${entry.name}/`, directoryUrl))),
      );
    } else if (entry.name.endsWith(".svg")) {
      files.push(entryUrl);
    }
  }

  return files;
}

const [catalog, component, styles, svgFiles] = await Promise.all([
  readFile(new URL("icon-catalog.ts", ICON_ROOT), "utf8"),
  readFile(new URL("Icon.tsx", ICON_ROOT), "utf8"),
  readFile(new URL("Icon.module.css", ICON_ROOT), "utf8"),
  listSvgFiles(ASSET_ROOT),
]);

const groupCounts = Object.freeze({ arrows: 23, controls: 40, general: 50, tech: 13, keyboard: 6, delivery: 13, finance: 13, communication: 6, map: 9, documents: 6, social: 3 });
for (const [group, expectedCount] of Object.entries(groupCounts)) {
  const count = svgFiles.filter((url) =>
    url.pathname.includes(`/assets/${group}/`),
  ).length;
  assert(count === expectedCount, `${group} asset count drifted`);
}
assert(svgFiles.length === 182, "Icon asset count drifted");
assert(
  [...catalog.matchAll(/Object\.freeze\(\{ figmaName:/gu)].length === 188 &&
    [...catalog.matchAll(/figmaNodeId: "[0-9]+:[0-9]+"/gu)].length === 187 &&
    [...catalog.matchAll(/figmaNodeId: "pending"/gu)].length === 1 &&
    catalog.includes('"general/status-half-circle": Object.freeze({ figmaName: "status-half-circle", figmaNodeId: "9525:30", group: "general" })') &&
    catalog.includes(
      '"controls/plus-s": Object.freeze({ figmaName: "plus-s", figmaNodeId: "pending", group: "controls" })',
    ),
  "Figma provenance catalog is incomplete",
);
assert(
  [...styles.matchAll(/\.icon\[data-icon-name=/gu)].length === 188,
  "Icon CSS mask mapping count drifted",
);
for (const fileUrl of svgFiles) {
  const relative = fileUrl.pathname.slice(ICON_ROOT.pathname.length);
  assert(
    styles.includes(`url("./${relative}")`),
    `Unmapped icon asset: ${relative}`,
  );
}
assert(
  !/https?:\/\//u.test(component + styles + catalog),
  "Runtime icon source must be local",
);
for (const size of ["sm", "md", "lg", "xl"]) {
  assert(
    styles.includes(`--ui-icon-size-${size}`),
    `Icon size role is missing: ${size}`,
  );
}
assert(
  component.includes("aria-hidden={label ? undefined : true}") &&
    component.includes('role={label ? "img" : undefined}'),
  "Icon accessibility contract drifted",
);
assert(
  styles.includes("color: var(--icon-color, var(--color-icon-default))") &&
    styles.includes("color: var(--color-icon-disabled)"),
  "Icon semantic color adapter drifted",
);

// Preserve the exact MIT-vendored Phosphor Regular subset from the pinned source.
const progressHalf = await readFile(new URL("assets/general/status-progress-half.svg", ICON_ROOT), "utf8");
const simpleHalf = await readFile(new URL("assets/general/status-half-circle.svg", ICON_ROOT), "utf8");
assert(simpleHalf.match(/<path\b/gu)?.length === 1 && simpleHalf.includes(progressHalf.match(/<path\b[^>]*>/gu)[1]), "Simple half must reuse only the existing inner path");
assert(simpleHalf.includes('viewBox="0 0 16 16"') && simpleHalf.includes('fill="currentColor"'), "Simple half must retain native geometry/color");
const keyboardHashes = {
  "command.svg": "50d8e0a378d091226285385d8e9f692a8238487273b9cc64e2ef28e2b34f2495",
  "shift.svg": "3cad9100936e2c8c4f6216420c4850f04281801c694c77939e8f79090a2f0333",
  "option.svg": "8ab95149bbb90b717e4397e535f8f086cdeaf4296373367a6c24a4e4243b76c7",
  "control.svg": "f93e9f6ee4df21646d8122a76de15d0889d64a50055f414b117de399f1e98c99",
  "return.svg": "fbdd2134fb315153f5e33c78f7f2677556d2ad4006d4a274de11f61b06daf558",
  "backspace.svg": "4d0d07f12e8a2e735c9aa0dc843837a5e61bba3792be1196071e2aff6cd46723",
  LICENSE: "b5b1f1da112d18ea2147decfd48ddc1bf2b5aeb6c265381579340e95b15a2bb2",
};
for (const [file, expectedHash] of Object.entries(keyboardHashes)) {
  const bytes = await readFile(new URL(`assets/keyboard/${file}`, ICON_ROOT));
  assert(createHash("sha256").update(bytes).digest("hex") === expectedHash, `Pinned keyboard asset drifted: ${file}`);
}
const keyboardProvenance = await readFile(new URL("assets/keyboard/PROVENANCE.md", ICON_ROOT), "utf8");
assert(keyboardProvenance.includes("2b75f3ad12b420c9504ef05df8d2564a28f8500e"), "Keyboard upstream commit missing");

// SAVI-203 recovers only the accepted SAVI-373 multicolor Google mark, not the social bulk import.
const google = await readFile(new URL("assets/social/google-branded.svg", ICON_ROOT));
assert(createHash("sha256").update(google).digest("hex") === "2a518bfd7c81e7241818b29059f852fb635b355bd8d901631a02ef8349819f37", "Accepted Google mark drifted");
assert(styles.includes('background-image: url("./assets/social/google-branded.svg")') && styles.includes("mask-image: none"), "Branded Google paints must remain unmodified");

console.log(
  [
    "SAVI-81 Figma icon catalog validation PASS",
    `assets=${svgFiles.length}`,
    `arrows=${groupCounts.arrows}`,
    `general=${groupCounts.general}`,
    `controls=${groupCounts.controls}`,
    `tech=${groupCounts.tech}`,
    `keyboard=${groupCounts.keyboard}`,
    `delivery=${groupCounts.delivery}`,
    `finance=${groupCounts.finance}`,
    `communication=${groupCounts.communication}`,
    `map=${groupCounts.map}`,
    `documents=${groupCounts.documents}`,
    "sizes=sm,md,lg,xl",
    "semanticColor=PASS",
    "figmaProvenance=186/187",
    "pendingFigmaMapping=controls/plus-s",
    "runtimeRemoteAssets=ABSENT",
  ].join(" "),
);
