import test from "node:test";
import assert from "node:assert/strict";
import stylelint from "stylelint";
import sizingRule, { breakpointSizes, ruleName } from "./stylelint-sizing.mjs";
import { viewportQueries } from "../js/core/responsive.js";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

test("exactly one responsive scale has five ascending breakpoints", () => {
  assert.deepEqual(breakpointSizes.min, ["24em", "40em", "56em", "72em", "88em"]);
  assert.deepEqual(breakpointSizes.max, ["23.999em", "39.999em", "55.999em", "71.999em", "87.999em"]);
  assert.deepEqual(breakpointSizes.min.map(Number.parseFloat), [24, 40, 56, 72, 88]);
  breakpointSizes.min.forEach((min, index) => {
    const boundary = Number.parseFloat(min);
    const precedingUpperBound = Number.parseFloat(breakpointSizes.max[index]);
    assert.equal(Math.round((boundary - precedingUpperBound) * 1000), 1,
      "each exclusive upper bound must sit 0.001em below its next lower bound");
    if (index) assert.ok(boundary > Number.parseFloat(breakpointSizes.min[index - 1]));
  });
});

test("sizing lint refuses unsupported spacing, arbitrary breakpoints and parallel containers", async () => {
  const invalid = [
    "p { margin-block: 1em; }",
    "p { padding: 22px; }",
    "main { gap: clamp(1em, 2vw, 3em); }",
    "@media (min-width: 53em) { p { color: inherit; } }",
    "@media (max-width: 56em) { p { color: inherit; } }",
    "main { --tailor-container: 86em; }",
    "main { --grid-max: 100em; }",
    "a { min-height: 44px; }",
  ];
  const accepted = [
    "p { margin-block: var(--s2); }",
    "main { gap: clamp(var(--s2), 2vw, var(--s4)); }",
    "@media (min-width: 24em) { main { padding: var(--s4); } }",
    "@media (min-width: 40em) { main { padding: var(--s4); } }",
    "@media (min-width: 56em) { main { padding: var(--s4); } }",
    "@media (min-width: 72em) { main { padding: var(--s4); } }",
    "@media (min-width: 88em) { main { padding: var(--s4); } }",
    "@media (max-width: 55.999em), (pointer: coarse) { main { padding: 0; } }",
    "main { width: min(100%, var(--content)); }",
    "a { min-height: var(--control-target); }",
  ];
  const output = await stylelint.lint({
    code: [...invalid, ...accepted].join("\n"),
    codeFilename: "/tmp/portfolio/styles/sizing-fixture.css",
    config: { plugins: [sizingRule], rules: { [ruleName]: true } },
  });
  const warnings = output.results[0].warnings.filter(item => item.rule === ruleName);
  assert.equal(warnings.length, invalid.length, JSON.stringify(warnings));
});


test("browser interaction breakpoints match the CSS contract", () => {
  assert.equal(viewportQueries.compact, "(max-width: " + breakpointSizes.max[2] + ")");
  assert.equal(viewportQueries.tablet, "(min-width: " + breakpointSizes.min[2] + ")");
  assert.equal(viewportQueries.desktop, "(min-width: " + breakpointSizes.min[3] + ")");
  assert.equal(viewportQueries.tabletMax, "(max-width: " + breakpointSizes.max[3] + ")");
  assert.equal(viewportQueries.wideMax, "(max-width: " + breakpointSizes.max[4] + ")");
  assert.equal(viewportQueries.wide, "(min-width: " + breakpointSizes.min[4] + ")");
});


test("browser JavaScript has no independent viewport-width thresholds", async () => {
  const top = resolve(import.meta.dirname, "..", "js");
  const files = [];
  async function discover(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const location = join(dir, entry.name);
      if (entry.isDirectory()) await discover(location);
      else if (entry.name.endsWith(".js") && entry.name !== "responsive.js") files.push(location);
    }
  }
  await discover(top);
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.doesNotMatch(source, /(?:min|max)-width\s*:\s*\d+(?:\.\d+)?(?:em|px)/i, file);
    assert.doesNotMatch(source, /(?:innerWidth|outerWidth)\s*[<>]=?\s*\d+/, file);
  }
});
