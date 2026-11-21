import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stylesDir = join(root, "styles");
const files = (await readdir(stylesDir)).filter(name => name.endsWith(".css"));
const sources = Object.fromEntries(await Promise.all(files.map(async name => [name, await readFile(join(stylesDir, name), "utf8")])));
const strip = css => css.replace(/\/\*[\s\S]*?\*\//g, "");

// Split "a:b;c:d(e;f)" on top-level semicolons, ignoring parentheses and quoted strings.
function declarations(body) {
  const out = [];
  let current = "", depth = 0, quote = null;
  for (const char of body) {
    if (quote) { current += char; if (char === quote) quote = null; continue; }
    if (char === '"' || char === "'") { quote = char; current += char; continue; }
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === ";" && depth === 0) { out.push(current); current = ""; } else current += char;
  }
  if (current.trim()) out.push(current);
  return out
    .map(item => item.trim())
    .filter(item => item.startsWith("--"))
    .map(item => { const at = item.indexOf(":"); return [item.slice(0, at).trim(), item.slice(at + 1).trim().replace(/\s+/g, "")]; });
}

// Brace-aware block extraction: returns the body that follows `opener`.
function blockAfter(css, opener) {
  const start = css.indexOf(opener);
  assert.notEqual(start, -1, `missing ${opener}`);
  let depth = 1, cursor = start + opener.length;
  while (cursor < css.length && depth) { if (css[cursor] === "{") depth += 1; else if (css[cursor] === "}") depth -= 1; cursor += 1; }
  return css.slice(start + opener.length, cursor - 1);
}

const foundations = strip(sources["foundations.css"]);
const typography = strip(sources["tokens.css"]);
const typeTokens = declarations(blockAfter(typography, ":root {"));
const base = declarations(blockAfter(foundations, ":root{color-scheme:light dark;"));
const darkMedia = declarations(blockAfter(foundations, ':root:not([data-theme="light"]){'));
const darkAttribute = declarations(blockAfter(foundations, ':root[data-theme="dark"]{color-scheme:dark;'));
const declared = new Set([...base, ...typeTokens].map(([name]) => name));

// Component-scoped properties: declared inside a component or page stylesheet rule, never at :root.
const scoped = new Set(Object.entries(sources)
  .filter(([name]) => name !== "foundations.css" && name !== "tokens.css")
  .flatMap(([, css]) => [...strip(css).matchAll(/(?<![\w-])(--[\w-]+)\s*:/g)].map(match => match[1])));
// Properties scripts set inline (js/render/*, js/core/*) or that carry a fallback at the point of use.
const LOCAL = new Set(`--distance --offset --position --swell --logo-scale --preview-order --experience-start --experience-span
--experience-columns --rule-scale --stack-gap --stage-w --stage-h`.split(/\s+/));

// Declared but intentionally not consumed by var(): contract pins, the JS-read hero colours and the complete scales.
const KEEP = new Set(`--hero-wave-color-1 --hero-wave-color-2 --hero-wave-color-3 --motion-hover --motion-panel-in --motion-panel-out
--ease-in-out-ui --ref-air --ref-blue-30 --ref-coral-75 --sys-color-tertiary --sys-color-focus`.split(/\s+/));
const isScaleStep = name => /^--(type-|s\d+$|font-size-|font-display$|font-body$|font-label$|display$|body$|label$|signature$|editorial-display)/.test(name);

test("tokens have exactly one source file", () => {
  assert.equal(files.includes("tokens.css"), true, "typography tokens have a single authoritative source");
  assert.ok(typeTokens.every(([name]) => /^(--type-|--font-|--display$|--body$|--label$|--signature$|--editorial-display)/.test(name)), "tokens.css only contains typography");
  assert.ok(base.every(([name]) => !/^(--type-|--font-|--display$|--body$|--label$|--signature$|--editorial-display)/.test(name)), "foundations.css must not redeclare type");
  for (const [name, css] of Object.entries(sources)) {
    if (name === "foundations.css" || name === "tokens.css") continue;
    assert.doesNotMatch(strip(css), /:root\s*\{[^}]*--[\w-]+\s*:/, `${name} declares root tokens; move them to foundations.css`);
  }
});

test("every var() resolves to a declared token, a documented local, or carries a fallback", () => {
  const unresolved = [];
  for (const [name, css] of Object.entries(sources)) {
    for (const match of strip(css).matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
      const token = match[1];
      if (declared.has(token) || scoped.has(token) || LOCAL.has(token) || match[2] === ",") continue;
      unresolved.push(`${name}: ${token}`);
    }
  }
  assert.deepEqual([...new Set(unresolved)], [], "undefined custom property used without a fallback");
});

test("no token is declared and then never used", () => {
  const consumers = Object.values(sources).map(strip).join("\n");
  const inValues = [...base, ...typeTokens, ...darkMedia].map(([, value]) => value).join("\n");
  const used = new Set([...(consumers + inValues).matchAll(/var\(\s*(--[\w-]+)/g)].map(match => match[1]));
  const dead = [...declared].filter(name => !used.has(name) && !KEEP.has(name) && !isScaleStep(name));
  assert.deepEqual(dead, [], "dead tokens: delete them or add them to KEEP with a reason");
});

test("a token is declared once per block", () => {
  for (const [label, list] of [["base", base], ["typography", typeTokens], ["dark media", darkMedia], ["dark attribute", darkAttribute]]) {
    const names = list.map(([name]) => name);
    assert.deepEqual(names.filter((name, index) => names.indexOf(name) !== index), [], `${label} block repeats a token`);
  }
});

test("dark overrides only touch declared tokens and the two dark blocks stay identical", () => {
  for (const [name] of darkMedia) assert.ok(declared.has(name), `${name} is overridden in dark but never declared`);
  assert.deepEqual(darkMedia, darkAttribute, "prefers-color-scheme and [data-theme=dark] blocks have drifted apart");
});
