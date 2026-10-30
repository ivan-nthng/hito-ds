import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("package adapter validates outside the repository and still rejects missing tokens and styling dependencies", async t => {
  const directory = await mkdtemp(path.join(tmpdir(), "hito-ds-adapter-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(new URL("./", import.meta.url), path.join(directory, "tokens"), { recursive: true });
  await mkdir(path.join(directory, "src"));
  for (const name of ["tokens.css", "base.css"]) {
    await cp(new URL(`../src/${name}`, import.meta.url), path.join(directory, "src", name));
  }
  const manifest = await readFile(new URL("../package.json", import.meta.url), "utf8");
  await writeFile(path.join(directory, "package.json"), manifest);
  const run = () => spawnSync(process.execPath, ["tokens/validate-web-adapter.mjs"], { cwd: directory, encoding: "utf8" });
  assert.equal(run().status, 0, "standalone package requires no apps/web or root scripts");

  const cssPath = path.join(directory, "src/tokens.css");
  const css = await readFile(cssPath, "utf8");
  await writeFile(cssPath, css.replace(/--color-surface-canvas\s*:/gu, "--unowned-test-color:"));
  const missing = run();
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /Registry CSS variable is missing: --color-surface-canvas/u);
  await writeFile(cssPath, css);

  const changed = JSON.parse(manifest);
  changed.devDependencies["styled-components"] = "0.0.0";
  await writeFile(path.join(directory, "package.json"), JSON.stringify(changed));
  const dependency = run();
  assert.notEqual(dependency.status, 0);
  assert.match(dependency.stderr, /Unadmitted styling dependency/u);
});
