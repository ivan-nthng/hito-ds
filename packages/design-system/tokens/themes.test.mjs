import "./palette-validation.test.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { themePresets, themeAxes } from "./themes.mjs";
import { registryEntries, registryWebAdapter } from "./registry.mjs";
import { readFile } from "node:fs/promises";
test("neutral overrides preserve owned CSS identities and resolved reference inputs", () => {
  const variables = new Set(registryEntries.flatMap(entry => entry.declaredCssVariables));
  for (const entry of themePresets.neutral.overrides) {
    assert.ok(variables.has(entry.cssVariable), entry.cssVariable);
    assert.ok(!/identity|success|warning|error|destructive/.test(entry.cssVariable));
    for (const mode of ["light", "dark"]) {
      assert.match(entry.modes[mode].referenceId, /^color\/(brand|basic|neutral)\//);
      assert.ok(entry.modes[mode].opacity > 0 && entry.modes[mode].opacity <= 1);
    }
  }
  for (const [name, target] of Object.entries(themePresets.neutral.aliases)) {
    assert.ok(variables.has(name) || registryWebAdapter.internalCompositionVariables.includes(name), name);
    assert.ok(variables.has(target), target);
  }
  assert.deepEqual(themePresets.inherited.overrides, []);
  assert.deepEqual(themeAxes.theme, ["neutral", "inherited"]);
});

test("input borders retain inherited hover and neutral overrides through nested scheme boundaries", async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const tokens = await readFile(new URL("../src/tokens.css", import.meta.url), "utf8");
    const controls = await readFile(new URL("../src/components/input-frame/InputFrame.module.css", import.meta.url), "utf8");
    for (const scheme of ["light", "dark"]) {
      const page = await browser.newPage({ colorScheme: scheme });
      // Actual adapter and component CSS, including native hover; no copied token resolver.
      await page.setContent(`<style>${tokens}\n${controls}</style><main></main>`);
      const cases = [
        { path: [{ theme: "inherited", scheme }], neutral: false },
        { path: [{ theme: "neutral", scheme }], neutral: true },
        { path: [{}], neutral: false },
        { path: [{ theme: "neutral", scheme }, { theme: "inherited" }], neutral: false },
        { path: [{ theme: "inherited", scheme }, { theme: "neutral" }], neutral: true },
        { path: [{ theme: "neutral", scheme: scheme === "light" ? "dark" : "light" }, { scheme }], neutral: true },
        { path: [{ theme: "neutral", scheme }, { theme: "inherited" }, { scheme }], neutral: false },
      ];
      for (const { path, neutral } of cases) {
        await page.evaluate(path => {
          const main = document.querySelector("main"); main.replaceChildren();
          let parent = main;
          for (const context of path) {
            const node = document.createElement("div");
            if (context.theme) node.dataset.hitoTheme = context.theme;
            if (context.scheme) node.dataset.hitoColorScheme = context.scheme;
            parent.append(node); parent = node;
          }
          parent.innerHTML = '<div class="surface" data-appearance="outlined"><input class="input" aria-label="Sample"></div>';
        }, path);
        const frame = page.locator(".surface");
        const read = () => frame.evaluate(frame => {
          const probe = document.createElement("span"); frame.append(probe);
          const expected = {};
          for (const role of ["subtle", "default", "strong"]) {
            probe.style.borderColor = `var(--color-border-${role})`;
            expected[role] = getComputedStyle(probe).borderColor;
          }
          probe.remove();
          return { actual: getComputedStyle(frame).borderColor, expected };
        });
        await page.mouse.move(0, 0);
        await page.waitForTimeout(200);
        const rest = await read();
        await frame.hover();
        await page.waitForTimeout(200);
        const hover = await read();
        const label = `${scheme}/${JSON.stringify(path)}`;
        assert.equal(rest.actual, rest.expected[neutral ? "strong" : "subtle"], `${label} rest`);
        assert.equal(hover.actual, hover.expected[neutral ? "strong" : "default"], `${label} hover`);
        if (!neutral) assert.notEqual(rest.actual, hover.actual, `${label} inherited edge changes`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
