import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mediaRecipe, mediaObjects, mediaRecipeCss } from "./media-recipe.mjs";
test("bounded approved recipe preserves native geometry, opacity and repeat timing", async () => {
 assert.equal(mediaObjects.length,6);
 assert.equal(mediaRecipe.length,37);
 const get=name=>mediaRecipe.find(p=>p.id===`recipe/media/${name}`);
 assert.equal(get("warm-opacity").webValue,"0.4");
 assert.equal(get("warm-opacity").mobileWebValue,"0.8");
 assert.equal(get("warm-third-opacity").mobileWebValue,"1");
 assert.equal(get("warm-sixth-opacity").mobileWebValue,"0.75");
 assert.equal(get("grain-luminance").webValue,"0.45");
 assert.equal(get("grain-contrast").webValue,"2.35");
 assert.equal(get("live-cycle").webValue,"calc(var(--motion-duration-emphasis) * 4)");
 assert.ok((await readFile(new URL("../src/tokens.css",import.meta.url),"utf8")).includes(mediaRecipeCss()));
});
