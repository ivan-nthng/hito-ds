import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { chromium, webkit } from "playwright";

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

// Controlled phases test anchoring without rejecting intentionally moving artwork.
async function verifyAmbient(context, engine) {
  const page = await context.newPage(), errors = [];
  page.on("pageerror",error=>errors.push(error.message));
  const snapshot = async () => {
    await page.waitForFunction(()=>Math.abs(document.querySelector("[data-media-anchor]").getBoundingClientRect().top-(window.visualViewport?.offsetTop??0))<1);
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="hidden");
    const grain=page.locator("[data-media-backdrop]").locator(":scope > div").last();await grain.evaluate(el=>el.style.visibility="hidden");
    const pixels=await page.screenshot({style:"::-webkit-scrollbar{display:none!important} html{scrollbar-width:none!important}"});
    await grain.evaluate(el=>el.style.visibility="");
    await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="");
    return pixels;
  };
  const compareArtworkFrames = async (first, second) => page.evaluate(async ({first,second})=>{
    const decode=async encoded=>{const image=new Image();image.src=`data:image/png;base64,${encoded}`;await image.decode();const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext("2d");context.drawImage(image,0,0);return {width:image.width,height:image.height,pixels:context.getImageData(0,0,image.width,image.height).data};};
    const a=await decode(first),b=await decode(second);
    if(a.width!==b.width||a.height!==b.height)return {stationary:false,reason:"dimensions changed"};
    let changedPixels=0,maxChannelDelta=0,alphaChanges=0;
    for(let i=0;i<a.pixels.length;i+=4){let changed=false;for(let channel=0;channel<3;channel++){const delta=Math.abs(a.pixels[i+channel]-b.pixels[i+channel]);maxChannelDelta=Math.max(maxChannelDelta,delta);changed ||= delta!==0;}if(changed)changedPixels++;if(a.pixels[i+3]!==b.pixels[i+3])alphaChanges++;}
    // Captured static WebKit pair:173/334836 pixels differ by one RGB level.
    // Bound only that minute raster noise; a normal moving pair must fail this same policy.
    const pixelBudget=Math.floor(a.width*a.height*.001);
    return {stationary:maxChannelDelta<=1&&changedPixels<=pixelBudget&&alphaChanges===0,changedPixels,maxChannelDelta,alphaChanges,pixelBudget};
  },{first:first.toString("base64"),second:second.toString("base64")});
  const reducedState=()=>page.locator("[data-media-backdrop]").evaluate(root=>({forms:[...root.querySelectorAll("[data-media-object]")].map(el=>({transform:getComputedStyle(el).transform,animations:el.getAnimations().length})),anchorTop:root.querySelector("[data-media-anchor]").getBoundingClientRect().top,scrollY,clientWidth:document.documentElement.clientWidth,viewportTop:window.visualViewport?.offsetTop??0,viewportHeight:window.visualViewport?.height??innerHeight}));
  const phase = time => page.locator("[data-media-backdrop]").evaluate((root,time)=>{
    for(const el of [...root.querySelectorAll("[data-media-object]"),root.lastElementChild]) for(const animation of el.getAnimations()) { animation.pause(); animation.currentTime=time; }
  },time);
  try {
    for(const [width,height] of [[393,852],[390,664],[852,393],[320,700],[1440,900]]) {
      await page.setViewportSize({width,height}); await page.emulateMedia({reducedMotion:"no-preference"}); await page.goto(origin); await page.locator("main img").evaluate(el=>el.decode()); await page.evaluate(()=>document.fonts.ready);
      const motion=await page.locator("[data-media-backdrop]").evaluate(root=>[...root.querySelectorAll("[data-media-object]")].map(el=>({transform:getComputedStyle(el).transform,animations:el.getAnimations().map(a=>({time:a.currentTime,duration:a.effect.getTiming().duration,properties:Object.keys(a.effect.getKeyframes()[0])}))})));
      assert.equal(motion.length,6);
      assert.equal(await page.locator("[data-media-backdrop]").evaluate(root=>root.lastElementChild.getAnimations().length),0,"grain is static in normal mode"); assert.ok(motion.every(m=>m.animations.length===1&&m.animations[0].duration===96000));
      const liveA=await snapshot(); await page.waitForTimeout(500); const liveB=await snapshot(); assert.ok(!liveA.equals(liveB),`${engine}: actual ambient frames change`);
      const cardTop=await page.locator("[data-card]").evaluate(el=>el.getBoundingClientRect().top);
      let cycleStart;
      for(const time of [0,24000,48000,72000,96000]) {
        await phase(time); await page.evaluate(()=>scrollTo(0,0)); const initial=await snapshot();
        if(time===0) cycleStart=initial; else if(time===96000) assert.ok(initial.equals(cycleStart),`${engine}: rendered ambient cycle closes without a jump`);
        await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
        assert.ok((await snapshot()).equals(initial),`${engine}: equivalent-phase anchoring ${width}x${height}@${time}`);
        const coverage=await page.locator("[data-media-backdrop]").evaluate(el=>{const carrier=el.getBoundingClientRect(),r=el.querySelector("[data-media-viewport]").getBoundingClientRect(),grain=el.lastElementChild.getBoundingClientRect();return {carrierHeight:carrier.height,pageHeight:document.querySelector("[data-site-page]").getBoundingClientRect().height,x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight,grain:[grain.left,grain.top,grain.right,grain.bottom],overflow:document.documentElement.scrollWidth>innerWidth,extra:document.documentElement.scrollHeight-document.querySelector("[data-site-page]").getBoundingClientRect().height};});
        assert.ok(coverage.carrierHeight>=coverage.pageHeight,"paint carrier follows full document");assert.equal(coverage.x,0);assert.equal(coverage.y,0);assert.ok(coverage.right>=coverage.width&&coverage.bottom>=coverage.height);assert.ok(coverage.grain[0]<=0&&coverage.grain[1]<=0&&coverage.grain[2]>=coverage.width&&coverage.grain[3]>=coverage.height-1,`document grain covers viewport: ${JSON.stringify(coverage)}`);assert.equal(coverage.overflow,false);assert.ok(Math.abs(coverage.extra)<=1);
      }
      await page.getByRole("button",{name:"View Tracklist",exact:true}).click();await phase(24000);const expanded=await snapshot();await page.evaluate(()=>scrollTo(0,0));assert.ok((await snapshot()).equals(expanded),`${engine}: content growth keeps artwork anchored`);
      if(await page.evaluate(()=>scrollY>0)) assert.ok(await page.locator("[data-card]").evaluate(el=>el.getBoundingClientRect().top)<cardTop);
      await page.emulateMedia({reducedMotion:"reduce"});
      assert.equal(await page.locator("[data-media-backdrop]").evaluate(el=>el.getAnimations({subtree:true}).length),0);
      // Hold isolation constant across the pair: toggling filtered foreground layers between
      // captures can rerasterize an unchanged gradient with one-channel rounding differences.
      const reducedIsolation=await page.addStyleTag({content:'[data-site-content], [data-media-backdrop] > :last-child {visibility:hidden!important} ::-webkit-scrollbar{display:none!important} html{scrollbar-width:none!important}'});
      try {
        await page.waitForFunction(()=>Math.abs(document.querySelector("[data-media-anchor]").getBoundingClientRect().top-(window.visualViewport?.offsetTop??0))<1);
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        await page.waitForTimeout(250); // Commit reduced layers and isolation before either capture.
        const before=await reducedState();assert.ok(before.forms.every(form=>form.animations===0&&form.transform==="none"));
        const stillA=await page.screenshot();await page.waitForTimeout(300);const stillB=await page.screenshot();
        assert.deepEqual(await reducedState(),before,`${engine}: reduced forms/viewport remain stationary`);
        const stationary=await compareArtworkFrames(stillA,stillB);
        assert.ok(stationary.stationary,`${engine}: reduced motion freezes actual artwork ${width}x${height} ${JSON.stringify(stationary)}`);
        // Negative control uses the real six slow CSS animations, with no pause or screenshot disabling.
        await page.emulateMedia({reducedMotion:"no-preference"});
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        assert.equal(await page.locator("[data-media-backdrop]").evaluate(root=>root.getAnimations({subtree:true}).length),6);
        const movingA=await page.screenshot();await page.waitForTimeout(1000);const movingB=await page.screenshot();
        const moving=await compareArtworkFrames(movingA,movingB);
        assert.equal(moving.stationary,false,`${engine}: stationary comparison must reject real ambient movement ${width}x${height} ${JSON.stringify(moving)}`);
        console.log(`${engine}: reduced frame ${width}x${height} ${JSON.stringify(stationary)}; moving negative ${JSON.stringify(moving)}`);
        await page.emulateMedia({reducedMotion:"reduce"});
      } finally { await reducedIsolation.evaluate(el=>el.remove()); }
      await page.getByRole("button",{name:"Play",exact:true}).click();await page.getByRole("button",{name:"Pause",exact:true}).click();
    }
    // Real page paint below a deliberately shortened viewport plane while Card continues.
    await page.setViewportSize({width:393,height:852});await page.emulateMedia({reducedMotion:"no-preference"});await page.goto(origin);await page.locator("main img").evaluate(el=>el.decode());await page.evaluate(()=>document.fonts.ready);await phase(0);
    const boundary=await page.locator("[data-media-viewport]").evaluate(el=>{el.style.blockSize=`${innerHeight-240}px`;return el.firstElementChild.getBoundingClientRect().bottom;});
    assert.ok(await page.locator("[data-card]").evaluate((el,boundary)=>el.getBoundingClientRect().bottom>boundary+80,boundary),"foreground continues below prior paint boundary");
    const chromaticBelow=async()=>{
      const bytes=await snapshot();return page.evaluate(async({encoded,y})=>{const image=new Image();image.src=`data:image/png;base64,${encoded}`;await image.decode();const canvas=document.createElement("canvas");canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext("2d");ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,Math.floor(y)+10,canvas.width,70).data;let count=0;for(let i=0;i<pixels.length;i+=4)if(Math.max(pixels[i],pixels[i+1],pixels[i+2])-Math.min(pixels[i],pixels[i+1],pixels[i+2])>16)count++;return count;},{encoded:bytes.toString("base64"),y:boundary});
    };
    assert.ok(await chromaticBelow()>100,"colored document paint continues below old fixed-window cutoff");
    await page.locator("[data-media-viewport]").evaluate(el=>el.style.overflow="hidden");
    assert.equal(await chromaticBelow(),0,"counterfactual viewport clip reproduces lost color while foreground continues");
    await page.locator("[data-media-viewport]").evaluate(el=>{el.style.overflow="";el.style.blockSize="";});
    const canvas=await page.evaluate(()=>({html:getComputedStyle(document.documentElement).backgroundColor,body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.querySelector("#root")).backgroundColor,page:getComputedStyle(document.querySelector("[data-site-page]")).backgroundColor}));
    assert.equal(await page.locator("[data-media-backdrop]").evaluate(root=>[root,...root.querySelectorAll("*")].some(el=>["fixed","sticky"].includes(getComputedStyle(el).position))),false,"live decoration has no native fixed/sticky layer");
    assert.equal(canvas.html,canvas.root);assert.equal(canvas.body,"rgba(0, 0, 0, 0)");assert.equal(canvas.page,"rgba(0, 0, 0, 0)");
    // Isolate grain: actual time-separated frames must be static while forms still run.
    await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="hidden");await page.locator("[data-media-anchor]").evaluate(el=>el.style.visibility="hidden");
    const grainA=await page.screenshot();await page.waitForTimeout(500);assert.ok((await page.screenshot()).equals(grainA),`${engine}: no directional grain animation`);
    await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="");await page.locator("[data-media-anchor]").evaluate(el=>el.style.visibility="");
    // Same document resized through toolbar-like heights; this is engine coverage, not iOS toolbar hardware.
    await page.setViewportSize({width:393,height:852});await page.goto(origin);await page.emulateMedia({reducedMotion:"no-preference"});
    for(const height of [664,852,744]) {
      await page.setViewportSize({width:393,height});await phase(48000);await page.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));
      await page.waitForFunction(()=>Math.abs(document.querySelector("[data-media-anchor]").getBoundingClientRect().top-(window.visualViewport?.offsetTop??0))<1);
      assert.ok(await page.locator("[data-media-viewport]").evaluate(el=>el.getBoundingClientRect().bottom>=innerHeight));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    }
    if(engine==="chromium") {
      const cdp=await context.newCDPSession(page);
      await cdp.send("Emulation.setSafeAreaInsetsOverride",{insets:{top:47,bottom:34,left:0,right:0}});
      await page.setViewportSize({width:393,height:852});await page.goto(origin);
      assert.ok(await page.locator("[data-media-viewport]").evaluate(el=>el.getBoundingClientRect().bottom>=innerHeight+34),"synthetic safe-area lower coverage");
      assert.ok(await page.locator("[data-site-page]").evaluate(el=>parseFloat(getComputedStyle(el).paddingTop)>=47&&parseFloat(getComputedStyle(el).paddingBottom)>=34));
      await cdp.send("Emulation.setSafeAreaInsetsOverride",{insets:{top:0,bottom:21,left:47,right:47}});
      await page.setViewportSize({width:852,height:393});await page.goto(origin);
      assert.ok(await page.locator("[data-site-page]").evaluate(el=>parseFloat(getComputedStyle(el).paddingLeft)>=47&&parseFloat(getComputedStyle(el).paddingRight)>=47));
      assert.ok(await page.locator("[data-media-viewport]").evaluate(el=>el.getBoundingClientRect().bottom>=innerHeight+21));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      await cdp.send("Emulation.setSafeAreaInsetsOverride",{insets:{top:0,bottom:0,left:0,right:0}});await cdp.detach();
    }
    assert.deepEqual(errors,[]);console.log(`${engine}: ambient frames/controlled anchoring/coverage/resize/reduced-motion PASS (engine emulation, not physical iPhone)`);
  } finally { await page.close(); }
}

async function verifyDesktopFit(context, engine) {
  const page=await context.newPage();
  for(const [width,height] of [[1280,640],[1280,696],[1366,650],[1440,768],[1440,800],[1536,735],[1920,900],[1920,1200]]) {
    await page.setViewportSize({width,height});await page.goto(origin);await page.evaluate(()=>document.fonts.ready);
    const bounds=await page.evaluate(()=>{
      const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}};
      const image=document.querySelector('img[src*="coastal"]'),card=image.parentElement,credit=document.querySelector('[aria-label="Built with Hito"] a');
      return {intro:rect(document.querySelector('[aria-labelledby="site-title"]')),introParts:[...document.querySelectorAll('[aria-labelledby="site-title"] h1,[aria-labelledby="site-title"] p,[aria-labelledby="site-title"] a,header nav a')].map(rect),footer:rect(document.querySelector('footer')),header:rect(document.querySelector('header')),card:rect(card),credit:rect(credit),photo:rect(image),live:rect(document.querySelector('[data-hito-live]')),actions:[...card.querySelectorAll('button')].map(rect),imageStyle:{fit:getComputedStyle(image).objectFit,radius:getComputedStyle(image).borderRadius,liveInset:parseFloat(getComputedStyle(document.querySelector('[data-hito-live]')).right)},width:innerWidth,height:innerHeight,scrollY,overflow:document.documentElement.scrollWidth>innerWidth};
    });
    assert.equal(bounds.scrollY,0);assert.equal(bounds.overflow,false);
    for(const [label,r] of Object.entries({header:bounds.header,intro:bounds.intro,card:bounds.card,credit:bounds.credit,...Object.fromEntries(bounds.introParts.map((r,i)=>[`heroPart${i}`,r])),...Object.fromEntries(bounds.actions.map((r,i)=>[`action${i}`,r]))})) {
      assert(r.top>=0&&r.bottom<=height-8&&r.left>=0&&r.right<=width,`${engine} ${width}x${height}: ${label} outside first viewport ${JSON.stringify(r)}`);
    }
    assert(bounds.footer.top>=height,`${engine}: footer must begin after first viewport`);
    if(height>=900) {
      const heroTop=Math.min(bounds.intro.top,bounds.card.top),heroBottom=Math.max(bounds.intro.bottom,bounds.credit.bottom);
      assert(Math.abs((heroTop+heroBottom)/2-(bounds.header.bottom+height)/2)<40,`${engine}: tall hero centers below navigation`);
    }
    await page.locator('footer').scrollIntoViewIfNeeded();assert(await page.getByText('Open source. Built to be used together.',{exact:true}).isVisible());
    await page.evaluate(()=>scrollTo(0,0));
    assert(bounds.card.top>bounds.header.bottom+8,`${engine}: header separation`);
    assert(bounds.live.top>=bounds.photo.top&&bounds.live.bottom<=bounds.photo.bottom-8&&Math.abs(bounds.photo.right-bounds.live.right-bounds.imageStyle.liveInset)<1,`${engine}: Live stays inside cropped photo`);
    assert.equal(bounds.imageStyle.fit,'cover');assert(bounds.photo.height>=160&&bounds.photo.height<=289);
    if(height>=768)assert(Math.abs(bounds.photo.height-288)<1,`${engine}: tall desktop photo preserved`);
    const track=page.getByRole('button',{name:'View Tracklist'});await track.focus();
    assert(await track.evaluate(e=>e.matches(':focus-visible')),`${engine}: visible keyboard focus`);
    await page.keyboard.press('Enter');assert.equal(await track.getAttribute('aria-expanded'),'true');
    await page.getByRole('link',{name:'Built with Hito DS'}).scrollIntoViewIfNeeded();
    assert(await page.getByText('Demo tracklist · Soft Signals · Coastal Echoes · After the Tide',{exact:true}).isVisible());
  }
  // 200% zoom-equivalent CSS reflow keeps the complete composition reachable.
  await page.setViewportSize({width:640,height:320});await page.goto(origin);await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('button',{name:'View Tracklist'}).click();await page.getByRole('link',{name:'Built with Hito DS'}).scrollIntoViewIfNeeded();
  assert(await page.getByRole('link',{name:'Built with Hito DS'}).isVisible());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.close();console.log(`${engine}: desktop first-viewport Card/actions/credit and expanded/reflow reachability PASS`);
}

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
    await page.locator("main img").evaluate(image => image.decode());
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
    const credit = page.getByRole("link",{name:"Built with Hito DS",exact:true});
    assert.equal(await credit.getAttribute("href"),"/storybook/");
    const placement = await credit.evaluate(el => { const r=el.getBoundingClientRect(), card=el.parentElement.querySelector("[data-card]").getBoundingClientRect(), style=getComputedStyle(el);return {gap:r.top-card.bottom,left:r.left,right:r.right,cardLeft:card.left,cardRight:card.right,font:style.fontSize,line:style.lineHeight}; });
    assert.equal(placement.gap,8); assert.equal(placement.font,"12px"); assert.equal(placement.line,"16px");
    assert.ok(placement.left>=placement.cardLeft && placement.right<=placement.cardRight);
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
    assert.equal(await overflow(),false);
    await page.getByRole("button",{name:"Save Session",exact:true}).click(); assert.equal(await overflow(),false,"expanded and saved reflow");
    await page.getByRole("button",{name:"Session saved",exact:true}).click(); await tracklist.click();
    await credit.focus(); await page.keyboard.press("Enter"); await page.waitForURL(url=>url.pathname==="/storybook/");

  }
  console.log("Checking native hover/pressed/keyboard interaction finish");
  await page.setViewportSize({width:1440,height:1043}); await page.goto(origin);
  const interactionStyle=locator=>locator.evaluate(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,color:s.color,decoration:s.textDecorationThickness};});
  for(const locator of [page.getByRole("button",{name:"Play",exact:true}),page.getByRole("button",{name:"Save Session",exact:true}),page.getByRole("button",{name:"View Tracklist",exact:true}),page.getByRole("link",{name:"Built with Hito DS",exact:true})]) {
    await page.mouse.move(0,0); await page.waitForTimeout(200); const normal=await interactionStyle(locator);
    await locator.hover(); await page.waitForTimeout(200); const hover=await interactionStyle(locator);
    await page.mouse.down(); await page.waitForTimeout(200); const pressed=await interactionStyle(locator);
    assert.notDeepEqual(hover,normal,"visible native hover feedback"); assert.notDeepEqual(pressed,hover,"visible pressed feedback");
    await page.mouse.move(0,0); await page.mouse.up();
  }
  const play=page.getByRole("button",{name:"Play",exact:true}); await play.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
  assert.equal(await play.evaluate(el=>el.matches(":focus-visible") && getComputedStyle(el).outlineWidth==="2px"),true);
  await page.keyboard.press("Space"); assert.equal(await page.getByRole("button",{name:"Pause",exact:true}).getAttribute("aria-pressed"),"true");
  assert.equal(await page.getByRole("dialog").count(),0); assert.equal(new URL(page.url()).pathname,"/");
  await page.keyboard.press("Enter"); await page.getByRole("button",{name:"Play",exact:true}).waitFor();
  const save=page.getByRole("button",{name:"Save Session",exact:true}); await save.focus(); await page.keyboard.press("Space");
  assert.equal(await page.getByRole("button",{name:"Session saved",exact:true}).getAttribute("aria-pressed"),"true"); await page.keyboard.press("Space");
  const track=page.getByRole("button",{name:"View Tracklist",exact:true}); await track.focus(); await page.keyboard.press("Enter"); assert.equal(await track.getAttribute("aria-expanded"),"true"); await page.keyboard.press("Enter"); assert.equal(await track.getAttribute("aria-expanded"),"false");
  const credit=page.getByRole("link",{name:"Built with Hito DS",exact:true}); await credit.focus();
  assert.equal(await credit.evaluate(el=>el.matches(":focus-visible") && getComputedStyle(el).outlineWidth==="2px"),true);
  assert.equal(await page.locator("[data-tag] button,[data-tag] a,[data-tag][tabindex]").count(),0,"Tags remain passive");
  console.log("Checking reduced-motion static viewport artwork across scroll and content growth");
  for(const [width,height] of [[1440,900],[390,844],[320,800],[1440,1400]]) {
    await page.setViewportSize({width,height}); await page.goto(origin); await page.evaluate(()=>document.fonts.ready);
    const backgroundFrame=()=>page.locator("[data-media-viewport]").evaluate(el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];});
    const artwork=async()=>{await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="hidden");await page.locator("[data-media-backdrop]").evaluate(root=>root.lastElementChild.style.visibility="hidden");const pixels=await page.screenshot();await page.locator("[data-media-backdrop]").evaluate(root=>root.lastElementChild.style.visibility="");await page.locator("[data-site-content]").evaluate(el=>el.style.visibility="");return pixels;};
    const initial=await artwork(), cardTop=await page.locator("[data-card]").evaluate(el=>el.getBoundingClientRect().top);
    assert.deepEqual(await backgroundFrame(),[0,0,width,height]);
    for(const expanded of [false,true]) {
      if(expanded) await page.getByRole("button",{name:"View Tracklist",exact:true}).click();
      for(const fraction of [0,.5,1]) {
        await page.evaluate(f=>scrollTo(0,f*(document.documentElement.scrollHeight-innerHeight)),fraction); await page.waitForTimeout(40);
        assert.deepEqual(await backgroundFrame(),[0,0,width,height],"artwork frame remains viewport-bound");
        assert.ok((await artwork()).equals(initial),"actual artwork pixels stay fixed through scroll/expanded content");
        if(!expanded && fraction===1 && await page.evaluate(()=>scrollY>0)) assert.ok(await page.locator("[data-card]").evaluate(el=>el.getBoundingClientRect().top)<cardTop,"foreground still scrolls");
        assert.equal(await overflow(),false);
        assert.ok(await page.evaluate(()=>Math.abs(document.documentElement.scrollHeight-document.querySelector("[data-site-page]").getBoundingClientRect().height)<=1),"decorative paint adds no document height");
      }
    }
    const footerLink=page.getByRole("link",{name:"MIT license",exact:true}); await footerLink.focus(); await page.keyboard.press("Tab"); await page.keyboard.press("Shift+Tab");
    assert.equal(await footerLink.evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el),extent=parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset);return el.matches(":focus-visible")&&r.left-extent>=0&&r.right+extent<=innerWidth&&r.top-extent>=0&&r.bottom+extent<=innerHeight;}),true,"footer focus remains inside viewport paint bounds");
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
  await verifyDesktopFit(context,"chromium");
  await verifyAmbient(context,"chromium");
  if(process.env.HITO_VERIFY_WEBKIT==="1") {
    const webkitBrowser=await webkit.launch();try {const webkitContext=await webkitBrowser.newContext({isMobile:true,hasTouch:true,reducedMotion:"no-preference"});await verifyDesktopFit(webkitContext,"webkit");await verifyAmbient(webkitContext,"webkit");await webkitContext.close();} finally {await webkitBrowser.close();}
  }
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
