import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const token = (await readFile(join(root, "styles", "tokens.css"), "utf8")).split("/* Below:")[0];
const sizes = [...token.matchAll(/(--type-(?!weight|leading|tracking)[\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]);
const PROPORTIONAL = new Set(["--type-signature-vw","--type-signature-wide-vw","--type-inline-mark"]);
function split(v) { const a=[];let d=0,s="";for(const c of v){if(c==="(")d++;if(c===")")d--;if(c===","&&d===0){a.push(s.trim());s="";}else s+=c;}return [...a,s.trim()];}
test("approved type roles are root-relative, bounded and resolve aliases without cycles", () => {
  const roles = new Map(sizes);
  assert.ok(roles.has("--type-name"));
  assert.equal(roles.size, 15);
  for (const [name] of roles) {
    if (PROPORTIONAL.has(name)) continue;
    let value=roles.get(name), seen=new Set([name]);
    while (value.startsWith("var(")) {
      const target=value.slice(4,-1);
      assert.ok(!seen.has(target) && roles.has(target), name);
      seen.add(target); value=roles.get(target);
    }
    const parts=value.startsWith("clamp(")?split(value.slice(6,-1)):[value,value,value];
    const bounds=[parts[0],parts[2]].map(v=>{const match=v.match(/^(\d*\.?\d+)rem$/);assert.ok(match,`${name}: ${v} must be rem-bounded`);return Number(match[1]);});
    assert.ok(bounds[0]>=.8125 && bounds[0]<=bounds[1],name);
    if(name.startsWith("--type-heading-"))assert.ok(bounds[1]<=3,name);
  }
});
test("the written docs describe the actual Overused Grotesk faces", async () => {
  const retired=/Archivo|Finlandica|Host Grotesk|Josefin|Borges|Television Sans|Google Sans Flex/i;
  const versionLog=/^\s*[-*]\s+\*\*\d+\.\d+\.\d+/;
  for(const doc of ["DESIGN.md","engineering-specification.md","docs/TYPOGRAPHY-SYSTEM.md"]){
    const content=await readFile(join(root,doc),"utf8");
    assert.deepEqual(content.split("\n").filter(line=>retired.test(line)&&!versionLog.test(line)),[]);
  }
});
