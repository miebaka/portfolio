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
      .filter(v => Math.abs(v) > 7 && !(name === "foundations.css" && Math.abs(v) === 44));
    assert.deepEqual(fixed, [], name + " includes a fixed-length layout dimension");
  }
});

test("the core grid and spacing start mobile-first", async () => {
  const layout = await readFile(join(styles, "layout.css"), "utf8");
  const foundations = await readFile(join(styles, "foundations.css"), "utf8");
  const typography = await readFile(join(styles, "tokens.css"), "utf8");
  assert.match(layout, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(layout, /@media\s*\(min-width:\s*56em\)/);
  assert.match(layout, /grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(foundations, /--grid-outer:\s*clamp\(1em,\s*4vw,\s*4em\)/);
  assert.match(typography, /--type-heading-lg:\s*clamp\(2em,\s*1\.55em \+ 1\.7vw,\s*3em\)/);
});

test("responsive case folders use relative CSS sizing and never intercept a native link", async () => {
  const controller = await readFile(resolve("js/core/project-folder-interactions.js"), "utf8");
  const css = await readFile(join(styles, "project-folders.css"), "utf8");
  assert.doesNotMatch(controller, /pointerdown|preventDefault|clientY|touchPreview/);
  assert.match(css, /--work-folder-height: clamp\(8em,/);
  assert.match(css, /height: var\(--work-folder-height\)/);
});

test("canonical page layouts grow from phone defaults instead of shrinking desktop layouts", async () => {
  for (const name of ["layout.css", "home.css", "home-experience.css", "services-stack.css",
    "forliving-editorial.css", "editorial-index.css", "portfolio-refinement.css",
    "footer-layout.css"]) {
    const css = await readFile(join(styles, name), "utf8");
    const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(code, /@media\s*\(max-width:/, name + " still starts from a desktop-first breakpoint");
  }
  const editorial = await readFile(join(styles, "forliving-editorial.css"), "utf8");
  assert.match(editorial, /grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
  assert.match(editorial, /@media\(min-width:56em\)/);
  assert.match(editorial, /@media\(min-width:72em\)/);
});
