import {test} from "node:test";
import assert from "node:assert/strict";
import {referenceColorFamilies,referenceColorsById} from "./reference-colors.mjs";
import {registryEntriesById} from "./registry.mjs";
import {semanticSurfaceRolesById} from "./semantic-surfaces.mjs";
import {themePresets} from "./themes.mjs";
import {contrastRatio} from "./validation-helpers.mjs";
const expectedBrand = ["#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A", "#172554", "#0B122B"];
test("HDS-32 retires identity-only families while preserving exact Brand values and registry bindings",()=>{
 const brand=referenceColorFamilies.find(f=>f.family==="brand");
 assert.deepEqual(brand.tokens.map(token=>token.value),expectedBrand);
 for(const token of brand.tokens) assert.equal(registryEntriesById[token.id].definition,token);
 assert.ok(referenceColorFamilies.every(f=>!f.family.startsWith("hito-")));
 assert.ok(Object.keys(registryEntriesById).every(id=>!id.startsWith("color/hito-")&&!id.startsWith("color/identity/hito/")));
 let previous=Infinity;
 for(const token of brand.tokens){
  const order=contrastRatio(token.value,"#000000");
  assert.ok(order<previous,`${token.id} luminance progression`);previous=order;
 }
});
test("HDS-3 default blue pairings are readable in both retained presets",()=>{
 const editing=registryEntriesById["component/editable-text/editing-border"].definition;
 assert.equal(editing.referenceId,"color/border/accent/hover");
 assert.equal(editing.resolvedOpacity,.8);
 assert.equal(themePresets.neutral.aliases["--editable-text-editing-border"],"--color-border-accent-hover");
 for(const mode of ["light","dark"])for(const state of ["default","hover","pressed"]){
  const bg=semanticSurfaceRolesById[`color/surface/accent/strong/${state}`].modes[mode];
  const fg=registryEntriesById["color/foreground/on-accent-strong"].definition.modes[mode];
  assert.ok(contrastRatio(bg.resolvedWebValue,fg.resolvedWebValue)>=4.5,`${mode}/${state}`);
  const override=themePresets.neutral.overrides.find(x=>x.cssVariable===`--color-surface-accent-strong-${state}`);
  assert.equal(override.modes[mode].referenceId,bg.referenceId);
 }
});
