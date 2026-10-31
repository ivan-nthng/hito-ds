import { spawn } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
function build(workspace) {
  return new Promise((resolve, reject) => {
    const child = spawn(npm, ["run", "build", `--workspace=${workspace}`], { cwd: root, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", code => code === 0 ? resolve() : reject(new Error(`${workspace} build exited ${code}`)));
  });
}
await Promise.all([build("@hito-ds/site"), build("@hito-ds/storybook")]);
// Only replace generated combined output after both complete; no source/SB rewriting.
const destination = new URL("../output/public-site/", import.meta.url);
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(new URL("../output/site/", import.meta.url), destination, { recursive: true });
await cp(new URL("../apps/storybook/storybook-static/", import.meta.url), new URL("storybook/", destination), { recursive: true });
console.log("Combined public output: output/public-site/ (root + intact storybook/)");
