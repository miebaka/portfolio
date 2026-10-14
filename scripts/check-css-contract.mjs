import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const names = ["foundations.css", "components-v4.css", "pages-v4.css"];
const entries = await Promise.all(names.map(async name => [name, await readFile(join(root, "styles", name), "utf8")]));
const css = Object.fromEntries(entries);
const all = entries.map(([name, source]) => `/* ${name} */\n${source}`).join("\n");
const failures = [];
const reject = (condition, message) => { if (condition) failures.push(message); };

reject(/transition\s*:\s*all(?:\s|;|$)/i.test(all), "transition: all is prohibited");
reject(/(?:^|[\s:,])ease-in(?:[\s,;)]|$)/m.test(all.replaceAll("--ease-in-out-ui", "--allowed-ease")), "bare ease-in is prohibited");
reject((css["components-v4.css"].match(/^\.btn\{/gm) || []).length !== 1, ".btn must have one component owner");
reject(/^\.btn\{/m.test(css["pages-v4.css"]), ".btn cannot be page-owned");
reject(/body\[data-page=/.test(css["foundations.css"] + css["components-v4.css"]), "route selectors belong in pages-v4.css");
reject(/#[0-9a-f]{3,8}\b|rgba?\(/i.test(css["components-v4.css"] + css["pages-v4.css"]), "raw colours belong in foundation token declarations");
reject(/font(?:-family)?\s*:[^;}]*"(?:BIZ UDPMincho|Schibsted Grotesk|Josefin Sans|Borges|Material Symbols Outlined)"/i.test(css["components-v4.css"] + css["pages-v4.css"]), "special font families must be consumed through permitted role tokens");
reject(/will-change\s*:\s*(?!auto)/i.test(all.replace(/\.client-marquee\.is-running \.client-marquee__track\{will-change:transform/g, "")), "will-change must be measured and active-state scoped");

const imports = [...(await readFile(join(root, "styles/main.css"), "utf8")).matchAll(/@import\s+["']([^"']+)["'];/g)].map(match => match[1]);
assert.deepEqual(imports, names, "main.css must own only the current foundation/component/page imports");
reject(entries.some(([, source]) => /@import\s/.test(source)), "historical/nested CSS imports are prohibited");

for (const [name, source] of entries) for (const declaration of source.matchAll(/transition\s*:[^;}]+/gi)) {
  if (name === "pages-v4.css" && declaration[0].includes("opacity 700ms") && source.slice(Math.max(0, declaration.index - 80), declaration.index).includes("decision-field__canvas")) continue;
  const durations = [...declaration[0].matchAll(/([0-9]+)ms/g)].map(match => Number(match[1]));
  reject(durations.some(value => value > 300), `${name} has frequent UI transition longer than 300ms: ${declaration[0]}`);
}

const requiredTokens = ["--motion-press:120ms", "--motion-hover:160ms", "--motion-panel-in:220ms", "--motion-panel-out:160ms", "--ease-out-ui:cubic-bezier(.25,1,.5,1)", "--ease-in-out-ui:cubic-bezier(.65,0,.35,1)"];
for (const token of requiredTokens) reject(!css["foundations.css"].includes(token), `missing required motion token ${token}`);

const production = await readFile(join(root, "dist/styles/main.css"));
reject(gzipSync(production).byteLength > 45 * 1024, "production CSS exceeds the 45KB gzip budget");

if (failures.length) throw new Error(`CSS contract failed:\n- ${failures.join("\n- ")}`);
console.log(`CSS contract passed (${gzipSync(production).byteLength} gzip bytes).`);
