import {readFile,writeFile} from 'node:fs/promises';
import {mediaRecipeCss} from './media-recipe.mjs';
const file=new URL('../src/tokens.css',import.meta.url),css=await readFile(file,'utf8');
const marker='/* HITO-001 generated theme adapter; run node tokens/build-themes.mjs. */';
const index=css.indexOf(marker);if(index<0)throw Error('Theme boundary missing');
const prefix=css.slice(0,index).replace(/\/\* HDS-41 media recipe start \*\/[\s\S]*?\/\* HDS-41 media recipe end \*\//u,'').trimEnd();
const result=`${prefix}\n\n${mediaRecipeCss()}\n\n${css.slice(index)}`;
if(process.argv.includes('--check')){if(css!==result)throw Error('Media recipe adapter is stale');}else await writeFile(file,result);
