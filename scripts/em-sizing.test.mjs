import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const styles = resolve("styles");
const sources = await Promise.all((await readdir(styles))
  .filter(name => name.endsWith(".css"))
  .map(async name => ({ name, css: await readFile(join(styles, name), "utf8") })));

test("authored font and spacing sizes use em rather than root-fixed rem", () => {
  for (const { name, css } of sources) {
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /(?<![\w])\d*\.?\d+rem\b/, name + " uses a fixed root-relative unit");
    const fixed = [...code.matchAll(/(?<![\w])(-?\d*\.?\d+)px\b/g)]
      .map(x => Number(x[1]))
      .filter(v => Math.abs(v) > 7 && Math.abs(v) !== 44);
    assert.deepEqual(fixed, [], name + " includes a fixed-length layout dimension");
  }
});

test("the core grid and spacing start mobile-first", async () => {
  const layout = await readFile(join(styles, "layout.css"), "utf8");
  const foundations = await readFile(join(styles, "foundations.css"), "utf8");
  const typography = await readFile(join(styles, "tokens.css"), "utf8");
  assert.match(layout, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(layout, /@media\s*\(min-width:\s*48\.001em\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(foundations, /--grid-outer:1\.25em/);
  assert.match(typography, /--type-heading-lg:\s*clamp\(2em,\s*1\.55em \+ 1\.7vw,\s*3em\)/);
});

test("interactive folder dimensions scale with text rather than using fixed-pixel CSS sizes", async () => {
  const controller = await readFile(resolve("js/core/project-folder-interactions.js"), "utf8");
  assert.match(controller, /const relativeLength = \(element, pixels\)/);
  assert.match(controller, /style\.minHeight = relativeLength\(card, height\)/);
  assert.match(controller, /setProperty\("--work-folder-height", relativeLength\(list, height\)\)/);
  assert.doesNotMatch(controller, /(?:style\.minHeight|--work-folder-height"\s*,)[^;\n]*toFixed\(2\) \+ "px"/);
});
