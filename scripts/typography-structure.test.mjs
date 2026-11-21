import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = (await readFile(join(root, "styles", "tokens.css"), "utf8")).replace(/\/\*[\s\S]*?\*\//g, "");
const sizes = [...tokens.matchAll(/(--type-(?!weight|leading|tracking|family)[\w-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]);

// Intentionally not rem-bounded: documented in docs/TYPOGRAPHY-SYSTEM.md as proportional or relative to the surrounding text.
const PROPORTIONAL = new Set(["--type-display-signature-vw", "--type-display-signature-wide-vw", "--type-inline-mark"]);
// No functional label may be smaller than 13px.
const FLOOR_REM = 0.8125;

// Split "a, b + c, d" on top-level commas.
function split(value) {
  const out = [];
  let depth = 0, current = "";
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) { out.push(current.trim()); current = ""; } else current += char;
  }
  return [...out, current.trim()];
}

test("every size token is bounded in rem, ordered, and at or above the documented floor", () => {
  assert.ok(sizes.length >= 19, "size tokens were not found in styles/tokens.css");
  for (const [name, value] of sizes) {
    if (PROPORTIONAL.has(name) || value.startsWith("var(")) continue;
    const parts = value.startsWith("clamp(") ? split(value.slice(6, -1)) : [value, value, value];
    const [min, max] = [parts[0], parts[2]].map(bound => {
      const match = bound.match(/^(\d*\.?\d+)rem$/);
      assert.ok(match, `${name}: bound "${bound}" must be rem so browser zoom still scales it`);
      return Number(match[1]);
    });
    assert.ok(min <= max, `${name}: minimum ${min}rem exceeds maximum ${max}rem`);
    assert.ok(min >= FLOOR_REM, `${name}: ${min}rem is below the ${FLOOR_REM * 16}px floor`);
  }
});

test("the written docs describe the typefaces the code loads", async () => {
  const retired = /Archivo|Finlandica|Host Grotesk|Josefin|Borges|Television Sans|Google Sans Flex/i;
  const versionLog = /^\s*[-*]\s+\*\*\d+\.\d+\.\d+/; // changelog lines are history, not instructions
  for (const doc of ["DESIGN.md", "engineering-specification.md", "docs/TYPOGRAPHY-SYSTEM.md"]) {
    const text = await readFile(join(root, doc), "utf8");
    const stale = text.split("\n").filter(line => retired.test(line) && !versionLog.test(line));
    assert.deepEqual(stale.map(line => `${doc}: ${line.slice(0, 100)}`), [], "doc names a typeface the code does not load");
  }
});

test("fluid display hierarchy never crosses at responsive widths", () => {
  const sizeMap = new Map(sizes);
  const sizePx = (name, viewport) => {
    const value = sizeMap.get(name);
    assert.ok(value, `Missing display token: ${name}`);
    const matched = value.match(/^clamp\(([\d.]+)rem, ([\d.]+)vw, ([\d.]+)rem\)$/);
    assert.ok(matched, `Invalid fluid token: ${name}`);
    const [, min, fluid, max] = matched.map(Number);
    return Math.min(max * 16, Math.max(min * 16, (fluid * viewport) / 100));
  };
  const names = ["--type-display-hero", "--type-display-section", "--type-display-project", "--type-display-compact"];
  for (const width of [320, 390, 768, 1440, 1920]) {
    const values = names.map(name => sizePx(name, width));
    for (let i = 1; i < values.length; i++)
      assert.ok(values[i - 1] > values[i], `Display hierarchy crosses at ${width}px: ${values}`);
  }
  assert.equal(sizeMap.get("--type-label-s"), ".8125rem");
});
