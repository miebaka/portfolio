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
const withoutComments = source => source.replace(/\/\*[\s\S]*?\*\//g, "");
const splitSelectors = selector => {
  const result = []; let current = "", depth = 0;
  for (const char of selector) {
    if (char === "(" || char === "[") depth += 1;
    if (char === ")" || char === "]") depth -= 1;
    if (char === "," && depth === 0) { result.push(current.trim()); current = ""; }
    else current += char;
  }
  if (current.trim()) result.push(current.trim());
  return result;
};
const leafRules = source => [...withoutComments(source).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(match => ({ selector: match[1].trim(), declarations: match[2].trim() }))
  .filter(rule => rule.declarations.includes(":"));
const contextualRules = source => {
  const records = [];
  const normalizeContext = context => context.replace(/\s+/g, " ").replace(/\s*([():,])\s*/g, "$1").trim().toLowerCase();
  const scan = (start, end, contexts) => {
    let cursor = start;
    while (cursor < end) {
      const open = source.indexOf("{", cursor);
      if (open === -1 || open >= end) break;
      const prelude = source.slice(cursor, open).replace(/^\s*;+/, "").trim();
      let depth = 1, close = open + 1;
      while (close < end && depth) { if (source[close] === "{") depth += 1; else if (source[close] === "}") depth -= 1; close += 1; }
      if (prelude.startsWith("@") && !/^@(?:font-face|page)\b/i.test(prelude)) {
        scan(open + 1, close - 1, [...contexts, normalizeContext(prelude)]);
      } else if (prelude && !prelude.startsWith("@")) {
        records.push({ selector: prelude, declarations: source.slice(open + 1, close - 1), contexts });
      }
      cursor = close;
    }
  };
  scan(0, source.length, []);
  return records;
};

reject(/transition\s*:\s*all(?:\s|;|$)/i.test(all), "transition: all is prohibited");
reject(/transition-property\s*:[^;}]*\ball\b/i.test(all), "transition-property: all is prohibited");
reject(/(?:^|[\s:,])ease-in(?:[\s,;)]|$)/m.test(all.replaceAll("--ease-in-out-ui", "--allowed-ease")), "bare ease-in is prohibited");
reject(/body\[data-page=/.test(css["foundations.css"] + css["components-v4.css"]), "route selectors belong in pages-v4.css");
reject(/(?:#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|lab\(|color\s*\()/i.test(css["components-v4.css"] + css["pages-v4.css"]), "raw colours belong in foundation token declarations");
reject(/font(?:-family)?\s*:[^;}]*["']?(?:BIZ UDPMincho|Schibsted Grotesk|Josefin Sans|Borges|Material Symbols Outlined)/i.test(css["components-v4.css"] + css["pages-v4.css"]), "named font families must be consumed through permitted role tokens");
reject(/will-change\s*:\s*(?!auto)/i.test(all.replace(/\.client-marquee\.is-running \.client-marquee__track\{will-change:transform/g, "")), "will-change must be measured and active-state scoped");
reject(/\bV(?:5|6|7|8|9|10|11|12|13)\b|historical\s+(?:override|layer)|override\s+strat/i.test(all), "historical version/override strata are prohibited");

const layoutProperties = /^(?:width|height|min-width|max-width|min-height|max-height|top|right|bottom|left|inset(?:-[a-z]+)?|margin(?:-[a-z]+)?|padding(?:-[a-z]+)?|gap|row-gap|column-gap|grid(?:-[a-z]+)?|flex(?:-[a-z]+)?|order)$/;
for (const [name, source] of entries) for (const rule of leafRules(source)) {
  for (const declaration of rule.declarations.matchAll(/transition(?:-property|-duration)?\s*:\s*([^;]+)/gi)) {
    const value = declaration[1];
    const durations = [...value.matchAll(/(^|[\s,(])([0-9]*\.?[0-9]+)(ms|s)\b/gi)].map(match => Number(match[2]) * (match[3].toLowerCase() === "s" ? 1000 : 1));
    const isSignatureReveal = rule.selector.includes("decision-field__canvas") && value.includes("opacity 700ms");
    // Owner-requested Proof Sheet record: its ink inversion and rolling arrow
    // intentionally retain the reference's 500ms timing. No other UI is exempt.
    const isReferenceRecord = [".home-page .now-playing", 'html:not([data-motion="reduced"]) .now-playing:hover .now-playing__arrow-track'].includes(rule.selector) && durations.every(duration => duration <= 500);
    reject(!isSignatureReveal && !isReferenceRecord && durations.some(duration => duration > 300), `${name} has a transition longer than 300ms in ${rule.selector}: ${value}`);
    if (/^transition\s*:/i.test(declaration[0])) for (const item of value.split(",")) {
      const property = item.trim().split(/\s+/)[0];
      reject(layoutProperties.test(property), `${name} transitions layout property ${property} in ${rule.selector}`);
    }
    if (/^transition-property/i.test(declaration[0])) for (const property of value.split(",").map(item => item.trim())) {
      reject(layoutProperties.test(property), `${name} transitions layout property ${property} in ${rule.selector}`);
    }
  }
}

const mediaBlocks = source => {
  const blocks = []; let cursor = 0;
  while ((cursor = source.indexOf("@media", cursor)) !== -1) {
    const open = source.indexOf("{", cursor); if (open === -1) break;
    let depth = 1, end = open + 1;
    while (end < source.length && depth) { if (source[end] === "{") depth += 1; else if (source[end] === "}") depth -= 1; end += 1; }
    blocks.push({ query: source.slice(cursor, open), content: source.slice(open + 1, end - 1) }); cursor = end;
  }
  return blocks;
};
for (const coarse of mediaBlocks(withoutComments(all)).filter(block => /hover\s*:\s*none|pointer\s*:\s*coarse/i.test(block.query))) {
  for (const rule of leafRules(coarse.content)) reject(rule.selector.includes(":hover") && /transform\s*:\s*(?!none\b)/i.test(rule.declarations), `coarse-pointer hover transform is prohibited in ${rule.selector}`);
}

for (const [name, source] of entries) {
  const seen = new Set();
  let count = 0;
  for (const rule of contextualRules(withoutComments(source))) for (const selector of splitSelectors(rule.selector)) {
    if (/^(?:from|to|\d+%)$/.test(selector)) continue;
    const key = `${JSON.stringify(rule.contexts)} || ${selector.replace(/\s+/g, " ")}`;
    reject(seen.has(key), `${name} repeats selector in one cascade context: ${selector}`);
    seen.add(key); count += 1;
    if (selector.includes(":hover") && /(?:^|;)\s*transform\s*:/i.test(`;${rule.declarations}`)) {
      const finePointer = rule.contexts.some(context => /@media/i.test(context) && /hover\s*:\s*hover/i.test(context) && /pointer\s*:\s*fine/i.test(context));
      reject(!finePointer, `${name} has a transform-bearing :hover rule outside fine-pointer media: ${selector}`);
    }
  }
  console.log(`${name}: ${count} selector-context groups, 0 duplicates.`);
}

const selectorOwners = new Map();
for (const [name, source] of entries) for (const rule of leafRules(source)) for (const selector of splitSelectors(rule.selector)) {
  if (/^(?:from|to|\d+%)$/.test(selector)) continue;
  const normalized = selector.replace(/\s+/g, " ");
  if (!selectorOwners.has(normalized)) selectorOwners.set(normalized, new Set());
  selectorOwners.get(normalized).add(name);
}
for (const [selector, owners] of selectorOwners) reject(owners.size > 1, `selector has duplicate ownership across ${[...owners].join(", ")}: ${selector}`);

for (const rule of leafRules(css["pages-v4.css"])) for (const selector of splitSelectors(rule.selector)) {
  if (/^(?:from|to|\d+%)$/.test(selector)) continue;
  reject(!selector.includes(".") && !selector.includes("body[data-page"), `page selector is not scoped to a named page block or body[data-page]: ${selector}`);
}

const imports = [...(await readFile(join(root, "styles/main.css"), "utf8")).matchAll(/@import\s+["']([^"']+)["'];/g)].map(match => match[1]);
assert.deepEqual(imports, names, "main.css must own only the current foundation/component/page imports");
reject(entries.some(([, source]) => /@import\s/.test(source)), "historical/nested CSS imports are prohibited");

const requiredTokens = ["--motion-press:120ms", "--motion-hover:160ms", "--motion-panel-in:220ms", "--motion-panel-out:160ms", "--ease-out-ui:cubic-bezier(.25,1,.5,1)", "--ease-in-out-ui:cubic-bezier(.65,0,.35,1)"];
for (const token of requiredTokens) reject(!css["foundations.css"].includes(token), `missing required motion token ${token}`);

const production = await readFile(join(root, "dist/styles/main.css"));
reject(gzipSync(production).byteLength > 45 * 1024, "production CSS exceeds the 45KB gzip budget");

if (failures.length) throw new Error(`CSS contract failed:\n- ${failures.join("\n- ")}`);
console.log(`CSS contract passed (${gzipSync(production).byteLength} gzip bytes).`);
