import test from "node:test";
import assert from "node:assert/strict";
import stylelint from "stylelint";
import typographyRule, { ruleName } from "./stylelint-typography.mjs";
import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const styles = join(root, "styles");
const tokens = await readFile(join(styles, "tokens.css"), "utf8");
const imports = await readFile(join(styles, "main.css"), "utf8");
const sourceNames = (await readdir(styles)).filter(p => p.endsWith(".css") && p !== "tokens.css");
const sources = await Promise.all(sourceNames.map(async p => [p, await readFile(join(styles, p), "utf8")]));
const stripComments = value => value.replace(/\/\*[\s\S]*?\*\//g, "");
const prop = /(?<![-\w])(font(?:-[\w-]+)?|line-height|letter-spacing|word-spacing|text-(?:align|transform|wrap|rendering|indent|overflow|shadow|decoration(?:-[\w-]+)?|underline-[\w-]+|size-adjust|emphasis(?:-[\w-]+)?)|white-space|word-break|overflow-wrap|hyphens|tab-size|-webkit-(?:font-[\w-]+|text-[\w-]+))\s*:/g;

test("styles/tokens.css is imported once and after all layout styles", () => {
  assert.equal((imports.match(/url\("tokens\.css"\)/g) || []).length, 1);
  assert.ok(imports.indexOf('url("tokens.css")') > imports.indexOf('url("portfolio-refinement.css")'));
  assert.match(imports, /url\("tokens\.css"\) layer\(typography\)/);
  assert.match(tokens, /--type-heading-lg: clamp\(2em, 1\.55em \+ 1\.7vw, 3em\)/);
  assert.doesNotMatch(tokens, /--type-(?:hero|display|leading-display|leading-hero|tracking-display)\b/);
});

test("Geist Sans and icon font faces are registered only in the canonical file", () => {
  const faces = [...tokens.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(x => x[1]);
  assert.equal(faces.length, 3, "2 Geist text faces and 1 icon face");
  assert.equal(faces.filter(face => /Geist Sans/.test(face)).length, 2);
  assert.ok(faces.every(face => /font-weight:(?:400|600)/.test(face)));
  assert.ok(faces.every(face => /src:/.test(face)), "font-face must include its source");
  assert.match(tokens, /--font-sans: "Geist Sans"/);
  assert.doesNotMatch(tokens, /--font-mono|Geist Mono|geist-mono/);
  assert.ok(sources.every(([, css]) => !/@font-face/.test(stripComments(css))));
});

test("there is zero typography CSS outside styles/tokens.css", () => {
  const violations = sources.flatMap(([name, css]) =>
    [...stripComments(css).matchAll(prop)].map(match => `${name}: ${match[1]}`));
  assert.deepEqual(violations, []);
  assert.doesNotMatch(tokens, /--(?:font-size-|font-display|font-body|font-label|editorial-display|type-display-section)\b/);
});

test("stylelint rejects typography even when it references a valid token", async () => {
  const rejected = [
    "h1{font-size:var(--type-heading-lg)}",
    "p{font-size:17px}",
    "h2{font-family:var(--font-sans)}",
    "span{font-weight:var(--type-weight-semibold)}",
    "a{letter-spacing:var(--type-tracking-label)}",
    "div{text-transform:uppercase}",
    "small{line-height:var(--type-leading-ui)}",
  ];
  const accepted = ["h1{display:block}", "p{max-width:42em}", "span{color:inherit}"];
  const report = await stylelint.lint({
    code: [...rejected, ...accepted].join("\n"),
    codeFilename: join(styles, "typography-rule-fixture.css"),
    config: { plugins: [typographyRule], rules: { [ruleName]: true } },
  });
  const warnings = report.results[0].warnings.filter(warning => warning.rule === ruleName);
  assert.equal(warnings.length, rejected.length, JSON.stringify(warnings));
});

test("Geist 400 and 600 faces are declared with swap and no synthetic text weights", () => {
  const faces = [...tokens.matchAll(/@font-face\s*\{([^}]+)\}/g)]
    .map(([, css]) => css)
    .filter(css => /Geist Sans/.test(css));
  assert.equal(faces.length, 2);
  for (const family of ["Geist Sans"]) {
    for (const weight of [400, 600]) {
      const face = faces.find(css => css.includes('font-family:"' + family + '"') && css.includes('font-weight:' + weight));
      assert.ok(face, family + " " + weight + " face must be declared");
      assert.match(face, /font-display:swap/);
      assert.match(face, /\.woff2/);
    }
  }
  assert.match(tokens, /font-synthesis-weight:none/);
});
