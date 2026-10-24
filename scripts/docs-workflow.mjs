import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registry = JSON.parse(await readFile(join(root, "docs", "critical-documents.json"), "utf8"));
const write = process.argv.includes("--write");
const start = "<!-- critical-docs:start -->";
const end = "<!-- critical-docs:end -->";

assert.ok(Array.isArray(registry.documents) && registry.documents.length > 0, "Critical document registry is empty.");

const rows = [];
for (const document of registry.documents) {
  const absolute = join(root, document.path);
  const source = await readFile(absolute, "utf8");
  assert.match(source, /^#\s+\S/m, `${document.path} needs a level-one heading.`);
  for (const heading of document.requiredHeadings || []) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(source, new RegExp(`^#{1,3}\\s+${escaped}\\s*$`, "mi"), `${document.path} is missing “${heading}”.`);
  }
  for (const match of source.matchAll(/\[[^\]]+\]\((?!https?:|mailto:|#)([^)]+)\)/g)) {
    const target = decodeURIComponent(match[1].split("#")[0]);
    if (target) await readFile(resolve(dirname(absolute), target));
  }
  rows.push(`| [\`${document.path}\`](${document.path}) | ${document.purpose} |`);
}

const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const versionFile = (await readFile(join(root, "VERSION"), "utf8")).trim();
const version = versionFile.replace(/^v/, "");
const changelog = await readFile(join(root, "CHANGELOG.md"), "utf8");
assert.equal(pkg.version, version, "package.json and VERSION disagree.");
assert.match(changelog, new RegExp(`^## \\[${version.replaceAll(".", "\\.")}\\]`, "m"), `CHANGELOG.md has no ${version} release.`);

const table = `${start}\n| Document | Owns |\n| --- | --- |\n${rows.join("\n")}\n${end}`;
const readmePath = join(root, "README.md");
const readme = await readFile(readmePath, "utf8");
const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
assert.match(readme, pattern, "README.md is missing the generated critical-documents block. Run npm run docs:update.");

if (write) {
  await writeFile(readmePath, readme.replace(pattern, table));
  console.log("Updated the critical-document index in README.md.");
} else {
  assert.equal(readme.match(pattern)[0], table, "Critical-document index is stale. Run npm run docs:update.");
  console.log(`Validated ${registry.documents.length} critical documents and version ${version}.`);
}
