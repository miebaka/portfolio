import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const styles = resolve("styles");
const sources = await Promise.all((await readdir(styles))
  .filter(name => name.endsWith(".css"))
  .map(async name => ({ name, css: await readFile(join(styles, name), "utf8") })));

test("shared spacing and typography reproduce the reference at the normal root", async () => {
  const foundations = await readFile(join(styles, "foundations.css"), "utf8");
  const typography = await readFile(join(styles, "tokens.css"), "utf8");
  const layout = await readFile(join(styles, "layout.css"), "utf8");
  assert.match(foundations, /--spacing-unit:\s*\.25rem/);
  assert.match(foundations, /--grid-outer:clamp\(1\.25rem,.*3\.5rem\)/);
  assert.match(foundations, /--grid-gutter:var\(--space-gallery\)/);
  assert.match(foundations, /--grid-max:100rem/);
  assert.match(foundations, /--section-padding:clamp\(4rem,.*6rem\)/);
  assert.match(foundations, /--heading-content-gap:clamp\(1\.5rem,.*2rem\)/);
  assert.match(typography, /--type-body:\s*\.875rem/);
  assert.match(typography, /--type-body:\s*1rem/);
  assert.match(typography, /--type-heading-lg:\s*1\.5rem/);
  assert.match(typography, /--type-heading-lg:\s*2rem/);
  assert.match(layout, /grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(layout, /@media\s*\(min-width:\s*48\.0625em\)/);
  for (const { name, css } of sources) {
    if (name !== "foundations.css") assert.doesNotMatch(css, /--grid-max\s*:|--grid-outer\s*:/, name);
    assert.doesNotMatch(css, /(?:min|max)-width:\s*(?:24|40|56|72|88|23\.999|39\.999|55\.999|71\.999|87\.999)em\)/, name);
  }
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
  assert.match(editorial, /@media\(min-width:48\.0625em\)/);
  assert.match(editorial, /@media\(min-width:48\.0625em\)/);
});
