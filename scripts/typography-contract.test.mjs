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
const fonts = await readFile(join(styles, "forliving-editorial.css"), "utf8");

test("tokens load first, before foundation and page styling", () => {
  assert.ok(imports.indexOf('url("tokens.css")') < imports.indexOf('url("foundations.css")'));
  assert.match(tokens, /--type-display-hero: clamp\(3\.4rem, 8\.4vw, 11rem\)/);
});

test("Geist Sans and Mono have only their real registered static weights", () => {
  const geist = [...fonts.matchAll(/@font-face\{([^}]+)\}/g)].map(match => match[1]);
  assert.equal(geist.length, 4);
  assert.ok(geist.every(face => /font-weight:(?:400|600);/.test(face)));
  assert.doesNotMatch(fonts, /font-weight:600 900/);
  assert.match(tokens, /--type-weight-regular: 400;/);
  assert.match(tokens, /--type-weight-semibold: 600;/);
});

test("all CSS typography metrics come from semantic variables", async () => {
  const files = (await readdir(styles)).filter(path => path.endsWith(".css") && path !== "tokens.css");
  const errors = [];
  for (const path of files) {
    const source = (await readFile(join(styles, path), "utf8")).replace(/@font-face\{[^}]+\}/g, "");
    for (const match of source.matchAll(/(?<![\w-])(font-size|font-weight|line-height|letter-spacing|font)\s*:\s*([^;}\n]+)/g)) {
      const property = match[1], value = match[2].trim();
      if (/^(inherit|initial|unset|revert|normal)$/.test(value)) continue;
      if (property === "font" && /^var\(--type-weight-/.test(value)) continue;
      if (property === "font-size" && /^var\(--type-/.test(value)) continue;
      if (property === "font-weight" && /^var\(--type-weight-/.test(value)) continue;
      if (property === "line-height" && /^var\(--type-leading-/.test(value)) continue;
      if (property === "letter-spacing" && /^var\(--type-tracking-/.test(value)) continue;
      errors.push(path + ": " + property + ":" + value);
    }
  }
  assert.deepEqual(errors, []);
});

test("Stylelint rejects wrong-role and undeclared tokens, not just raw numbers", async () => {
  const rejected = [
    "h1{font-size:var(--type-leading-ui)}",
    "h2{font-size:var(--type-heading-imaginary)}",
    "p{line-height:var(--type-body-m)}",
    "small{letter-spacing:var(--type-label-m)}",
    "b{font-weight:500}",
    "em{font:var(--type-weight-semibold) var(--type-leading-hero)/var(--type-leading-body) var(--body)}",
  ];
  const accepted = [
    "h3{font-size:var(--type-heading-l)}",
    "p{line-height:var(--type-leading-body)}",
    "span{font:var(--type-weight-semibold) var(--type-label-m)/var(--type-leading-label) var(--label)}",
  ];
  const report = await stylelint.lint({
    code: [...rejected, ...accepted].join("\n"),
    codeFilename: join(styles, "typography-rule-fixture.css"),
    config: { plugins: [typographyRule], rules: { [ruleName]: true } },
  });
  const warnings = report.results[0].warnings.filter(warning => warning.rule === ruleName);
  assert.equal(warnings.length, rejected.length, JSON.stringify(warnings));
  assert.deepEqual(warnings.map(warning => warning.line), [1, 2, 3, 4, 5, 6]);
});
