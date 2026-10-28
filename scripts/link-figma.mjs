import { readFile, writeFile } from "node:fs/promises";
const fileKey = process.argv[2];
if (!fileKey || !/^[A-Za-z0-9]+$/.test(fileKey)) throw new Error("Usage: node scripts/link-figma.mjs VERIFIED_DUPLICATE_FILE_KEY");
const mapping = JSON.parse(await readFile(new URL("../figma/mapping.json", import.meta.url), "utf8"));
for (const path of new Set(mapping.nodes.map(n => n.path))) {
  const url = new URL(`../${path}`, import.meta.url);
  const source = await readFile(url,"utf8");
  const result = source.replace(/https:\/\/github\.com\/ivan-nthng\/hito-ds\/blob\/main\/docs\/figma-and-code\.md#node-([0-9-]+)/g, (_, id) => `https://www.figma.com/design/${fileKey}/Hito-DS?node-id=${id}`);
  await writeFile(url,result);
}
mapping.fileKey=fileKey;mapping.status="linked-awaiting-publication";
await writeFile(new URL("../figma/mapping.json",import.meta.url), JSON.stringify(mapping,null,2)+"\n");
console.log(`Linked ${mapping.nodes.length} references. Verify node existence and public access before publication.`);
