import test from "node:test";
import assert from "node:assert/strict";
import stylelint from "stylelint";
import sizingRule, { breakpointSizes, ruleName } from "./stylelint-sizing.mjs";
import { viewportQueries } from "../js/core/responsive.js";

test("exactly one responsive scale has five ascending breakpoints", () => {
  assert.deepEqual(breakpointSizes.min, ["25em", "40em", "48em", "62em", "72em"]);
  assert.deepEqual(breakpointSizes.max, ["24.999em", "39.999em", "47.999em", "61.999em", "71.999em"]);
});

test("sizing lint refuses unsupported spacing, arbitrary breakpoints and parallel containers", async () => {
  const invalid = [
    "p { margin-block: 1em; }",
    "p { padding: 22px; }",
    "main { gap: clamp(1em, 2vw, 3em); }",
    "@media (min-width: 53em) { p { color: inherit; } }",
    "@media (max-width: 48em) { p { color: inherit; } }",
    "main { --tailor-container: 86em; }",
    "main { --grid-max: 100em; }",
  ];
  const accepted = [
    "p { margin-block: var(--s2); }",
    "main { gap: clamp(var(--s2), 2vw, var(--s4)); }",
    "@media (min-width: 48em) { main { padding: var(--s4); } }",
    "@media (max-width: 47.999em), (pointer: coarse) { main { padding: 0; } }",
    "main { width: min(100%, var(--content)); }",
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
  assert.equal(viewportQueries.wide, "(min-width: " + breakpointSizes.min[4] + ")");
});
