import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("../output/public-site/", import.meta.url));
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg" };
// Ordinary directory hosting, including slash canonicalization and genuine missing-file 404.
// This is local artifact verification, not a claim about a hosting provider's routing config.
const server = createServer(async (request, response) => {
  try {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405).end(); return; }
    const url = new URL(request.url, "http://localhost");
    const filename = path.resolve(root, `.${decodeURIComponent(url.pathname)}`);
    if (filename !== root.slice(0, -1) && !filename.startsWith(root)) { response.writeHead(403).end(); return; }
    let target = filename;
    if ((await stat(target)).isDirectory()) {
      if (!url.pathname.endsWith("/")) { response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end(); return; }
      target = path.join(target, "index.html");
    }
    const bytes = await readFile(target);
    response.writeHead(200, { "Content-Type": mime[path.extname(target)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : bytes);
  } catch { response.writeHead(404, { "Content-Type": "text/plain" }).end("Not found"); }
});
const suppliedBase = process.argv[2] ?? process.env.HITO_SITE_BASE_URL;
if (!suppliedBase) await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = suppliedBase ? new URL(suppliedBase).origin : `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  for (const route of ["/", "/storybook/", "/storybook/iframe.html", "/storybook/index.json", "/favicon.svg", "/storybook/favicon.svg", "/storybook/hito-wordmark-manager.svg"]) assert.equal((await fetch(origin + route)).status, 200, route);
  const slash = await fetch(`${origin}/storybook?path=/story/hito-welcome--overview`, { redirect: "manual" });
  assert.ok([301, 308].includes(slash.status)); assert.equal(new URL(slash.headers.get("location"), origin).pathname, "/storybook/"); assert.equal(new URL(slash.headers.get("location"), origin).search, "?path=/story/hito-welcome--overview");
  for (const route of ["/absent.js", "/assets/absent.js", "/storybook/assets/absent.js", "/storybook/absent.html"]) assert.equal((await fetch(origin + route)).status, 404, route);
  browser = await chromium.launch();
  const failures = [], requests = [], fonts = new Set();
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
  context.on("page", page => {
    page.on("pageerror", error => failures.push(error.message));
    page.on("request", request => requests.push({ method: request.method(), url: request.url() }));
    page.on("response", response => {
      if (response.status() >= 400) failures.push(`${response.status()}: ${response.url()}`);
      if (response.url().includes(".woff2")) fonts.add(response.url());
    });
  });
  const external = [];
  await context.route("**/*", route => {
    const url = new URL(route.request().url());
    if (["http:", "https:"].includes(url.protocol) && url.origin !== origin) {
      external.push(url.href); return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  for (const scheme of ["light", "dark"]) for (const width of [1440, 390, 320]) {
    console.log(`Checking root ${scheme}/${width}`);
    await page.emulateMedia({ colorScheme: scheme }); await page.setViewportSize({ width, height: 1000 });
    await page.goto(origin); await page.getByRole("heading", { name: "Structure. With feeling.", exact: true }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator("html").getAttribute("data-hito-color-scheme"), "dark");
    assert.equal(await overflow(), false, `${scheme}/${width} overflow`);
    const geometry = await page.locator("[data-card]").evaluate(el => {
      const r = el.getBoundingClientRect(), photo = el.querySelector("img"), play = el.querySelector('button[aria-label="Play"]'), live = document.querySelector("[data-hito-live]"), dot = document.querySelector("[data-live-dot]"), separator = el.querySelector('[role="presentation"]');
      return { width:r.width,height:r.height,scheme:el.getAttribute("data-hito-color-scheme"),radius:getComputedStyle(el).borderRadius,photoRadius:getComputedStyle(photo).borderRadius,photoWidth:photo.width,photoHeight:photo.height,playRadius:getComputedStyle(play).borderRadius,corner:getComputedStyle(play).getPropertyValue("corner-shape"),playWidth:play.getBoundingClientRect().width,separatorWidth:separator.getBoundingClientRect().width,liveOpacity:getComputedStyle(live).opacity,dotAnimation:getComputedStyle(dot).animationName,objects:document.querySelectorAll("[data-media-object]").length };
    });
    assert.equal(geometry.scheme,"light"); assert.equal(geometry.objects,6);
    assert.equal(geometry.playWidth,56); assert.equal(geometry.playRadius,"9999px");
    if(geometry.corner) assert.equal(geometry.corner,"round");
    assert.equal(geometry.dotAnimation,"none"); assert.equal(geometry.liveOpacity,"1");
    assert.equal(geometry.separatorWidth,geometry.width,"full-bleed normal-flow separator");
    if(width===1440 || width===390) {
      assert.equal(geometry.width,width===1440?448:358); assert.equal(geometry.height,width===1440?593:545);
      assert.equal(geometry.radius,width===1440?"24px":"16px"); assert.equal(geometry.photoRadius,width===1440?"16px":"8px");
    }
    assert.equal(await page.locator("h1").evaluate(el => getComputedStyle(el).fontSize), width===1440?"64px":"40px");
    assert.equal(await page.locator("header svg").evaluate(el => getComputedStyle(el).width), "96px");
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    const cdp = await context.newCDPSession(page); await cdp.send("DOM.enable"); await cdp.send("CSS.enable");
    const { root: documentRoot } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: documentRoot.nodeId, selector: "h1" });
    const native = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    assert.ok(native.fonts.some(font => font.isCustomFont && /Instrument/.test(font.familyName))); await cdp.detach();
    await page.getByRole("button",{name:"Play",exact:true}).click();
    assert.equal(await page.getByRole("button",{name:"Pause",exact:true}).getAttribute("aria-pressed"),"true");
    assert.match(await page.getByRole("status").textContent(),/No audio is streamed/);
    await page.getByRole("button",{name:"Pause",exact:true}).click();
    await page.getByRole("button",{name:"Save Session",exact:true}).click();
    assert.equal(await page.getByRole("button",{name:"Session saved",exact:true}).getAttribute("aria-pressed"),"true");
    await page.getByRole("button",{name:"Session saved",exact:true}).click();
    const tracklist=page.getByRole("button",{name:"View Tracklist",exact:true});
    await tracklist.click(); assert.equal(await tracklist.getAttribute("aria-expanded"),"true");
    assert.equal(await page.getByText("Demo tracklist",{exact:false}).isVisible(),true);
    assert.equal(await overflow(),false); await tracklist.click();

  }
  console.log("Checking actual repeated Live beyond the finite native export and reduced motion");
  await page.setViewportSize({width:1440,height:1019}); await page.emulateMedia({reducedMotion:"no-preference"}); await page.goto(origin);
  const phases=[];
  for(let index=0;index<27;index++) { phases.push(await page.locator("[data-live-dot]").evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),time:el.getAnimations()[0]?.currentTime,duration:el.getAnimations()[0]?.effect.getTiming().duration,iterations:el.getAnimations()[0]?.effect.getTiming().iterations===Infinity,label:getComputedStyle(el.nextElementSibling).opacity}))); await page.waitForTimeout(250); }
  assert.ok(phases.every(p=>p.duration===1920 && p.iterations && p.label==="1"));
  assert.ok(Math.max(...phases.map(p=>p.opacity))>.95 && Math.min(...phases.map(p=>p.opacity))<.5);
  const late=phases.filter(p=>p.time>5760); assert.ok(late.length>=3 && Math.max(...late.map(p=>p.opacity))-Math.min(...late.map(p=>p.opacity))>.1,"Live must keep changing beyond5.76s");
  await page.emulateMedia({reducedMotion:"reduce"});
  assert.equal(await page.locator("[data-live-dot]").evaluate(el=>getComputedStyle(el).animationName),"none");
  await page.waitForTimeout(300); assert.equal(await page.locator("[data-live-dot]").evaluate(el=>getComputedStyle(el).opacity),"1");
  console.log("Checking keyboard/reflow and external CTA clicks");
  await page.setViewportSize({ width: 1366, height: 1000 }); await page.goto(origin);
  await page.keyboard.press("Tab"); assert.equal(await page.getByRole("link", { name: "Skip to main content" }).evaluate(el => el === document.activeElement), true);
  await page.keyboard.press("Enter"); assert.equal(await page.locator("main").evaluate(el => el === document.activeElement), true);
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => ({ tag: document.activeElement.tagName, outline: getComputedStyle(document.activeElement).outlineWidth }));
  assert.equal(focus.tag, "A"); assert.equal(focus.outline, "2px");
  await page.setViewportSize({width:683,height:1000}); assert.equal(await overflow(), false, "200% browser-zoom equivalent CSS viewport reflow (1366/2)");
  await page.setViewportSize({width:1366,height:1000});
  for (const [name, expected] of [["GitHub", "https://github.com/ivan-nthng/hito-runner"], ["Figma", "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX"], ["Source & contributions", "https://github.com/ivan-nthng/hito-runner"], ["MIT license", "https://github.com/ivan-nthng/hito-runner/blob/main/LICENSE"]]) {
    const popupPromise = context.waitForEvent("page");
    await page.getByRole("link", { name, exact: true }).click(); const popup = await popupPromise;
    await page.waitForTimeout(100); assert.ok(external.includes(expected), `${name} click destination`); await popup.close();
  }
  console.log("Checking nested Storybook navigation");
  await page.getByRole("link", { name: "Explore Storybook", exact: true }).click(); await page.waitForURL(url => url.pathname === "/storybook/");
  const frame = page.frameLocator("#storybook-preview-iframe");
  await frame.getByRole("heading", { name: "Hito design system", exact: true }).waitFor();
  await frame.getByRole("link", { name: "Components", exact: true }).click(); await page.waitForURL(/path=\/story\/actions-button--default/);
  await page.locator('a[href="/"]').first().click(); await page.waitForURL(origin + "/");
  await page.getByRole("link", { name: "Storybook", exact: true }).click(); await page.waitForURL(url => url.pathname === "/storybook/");
  await page.goto(`${origin}/storybook/?path=/story/hito-welcome--overview`);
  await frame.getByRole("link", { name: "Hito home", exact: true }).click(); await page.waitForURL(origin + "/");
  await page.goto(`${origin}/?path=/story/hito-welcome--overview&globals=colorScheme:dark`); await page.waitForURL(/\/storybook\/\?path=/);
  await frame.getByRole("heading", { name: "Hito design system", exact: true }).waitFor();
  await page.goto(`${origin}/storybook/?path=/story/foundations-color-hito-identity--logo`);
  await frame.getByRole("img", { name: "Hito wordmark", exact: true }).waitFor();
  await frame.locator("img").evaluateAll(async images => { for (const image of images) { await image.decode(); if (!image.naturalWidth) throw Error("Broken nested logo"); } });
  await page.goto(`${origin}/storybook/iframe.html?id=start-here-neutral-pilot--shared-pilot&viewMode=story`);
  await page.getByRole("textbox", { name: "Project name", exact: true }).waitFor(); await page.evaluate(() => document.fonts.ready);
  assert.ok(fonts.size >= 2, "actual nested/local font requests");
  assert.ok([...fonts].some(url => url.startsWith(`${origin}/storybook/assets/`) && url.includes("instrument-sans")), "actual nested product-font response");
  await page.goto(`${origin}/?path=//example.com`); await page.getByRole("heading", { name: "Structure. With feeling.", exact: true }).waitFor();
  assert.ok(!requests.some(request => request.method !== "GET"), "demo must not send data");
  assert.ok(!external.some(url => /fonts\.googleapis|fonts\.gstatic/.test(url)), "fonts must remain local");
  assert.deepEqual(failures, []);
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const [pack] = JSON.parse(execFileSync(npm, ["pack", "--dry-run", "--json", "--workspace=@hito-ds/react"], { cwd: fileURLToPath(new URL("../", import.meta.url)), encoding: "utf8" }));
  const files = new Set(pack.files.map(file => file.path));
  assert.ok(![...files].some(file => /^apps\//.test(file) || /^src\/(foundations|storybook)\//.test(file) || /^src\/.*\.(stories|story|test)\./.test(file) || /project-agent-operating|docs\/product/.test(file)));
  const pkg = JSON.parse(await readFile(new URL("../packages/design-system/package.json", import.meta.url), "utf8"));
  for (const value of Object.values(pkg.exports)) {
    const target = typeof value === "string" ? value : value.types;
    if (!target.includes("*")) assert.ok(files.has(target.replace(/^\.\//, "")), `Preserved public export ${target}`);
  }
  console.log(`Public-site verification PASS: root + nested SB/slash/404/assets/navigation/bookmarks, 6 viewport/scheme combinations, media controls/keyboard/reflow/custom fonts/continuous Live/reduced motion, ${files.size} pack files with public exports preserved.`);
} finally {
  if (browser) await browser.close();
  if (server.listening) await new Promise(resolve => server.close(resolve));
}
