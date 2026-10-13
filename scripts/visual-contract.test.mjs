import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const contract = JSON.parse(await readFile(join(root, "tests", "fixtures", "visual-contract.json"), "utf8"));

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(?:script|style)\b[^>]*>[\s\S]*?<\/\s*(?:script|style)\s*>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&rsquo;", "’")
    .replaceAll("&#8217;", "’")
    .replaceAll("&#x2019;", "’")
    .replace(/\s+/g, " ");
}

test("approved visual contract remains intact", async () => {
  assert.equal(contract.baselineCommit, "54dcc41");
  const cssFiles = (await readdir(join(dist, "styles"))).filter(file => file.endsWith(".css"));
  assert.deepEqual(cssFiles, ["main.css"], "production has one bundled stylesheet");
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  const compactCss = css.replace(/\s+/g, "").toLowerCase();
  assert.doesNotMatch(css, /@import\b/i);
  for (const [token, value] of Object.entries(contract.tokens)) {
    assert.ok(compactCss.includes(`${token}:${value}`), `${token} changed from ${value}`);
  }
  for (const pattern of contract.forbiddenCss) {
    assert.ok(!compactCss.includes(pattern), `forbidden CSS: ${pattern}`);
  }

  // Borges draws the inherited signature; Material Symbols is an icon font.
  // The three editorial text roles must keep their approved faces and no new
  // font can enter the bundle under the guise of a fourth text role.
  const roleFonts = ["display", "body", "label"].map(role => {
    const match = css.match(new RegExp(`--${role}:\\s*"([^"]+)"`));
    assert.ok(match, `missing --${role} typography role`);
    return match[1];
  });
  assert.deepEqual(roleFonts, contract.fonts);
  assert.equal(new Set(roleFonts).size, 3);
  const definedFonts = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, block]) => {
    const family = block.match(/font-family\s*:\s*(?:"([^"]+)"|'([^']+)'|([^;}]+))/i);
    assert.ok(family, "@font-face has no family");
    return (family[1] || family[2] || family[3]).trim();
  });
  const allowedFonts = new Set([...contract.fonts, "Borges", "Material Symbols Outlined"]);
  for (const font of contract.fonts) assert.ok(definedFonts.includes(font), `${font} is not bundled`);
  for (const font of definedFonts) assert.ok(allowedFonts.has(font), `unapproved fourth typeface: ${font}`);

  const home = await readFile(join(dist, "index.html"), "utf8");
  const homeText = visibleText(home);
  for (const phrase of contract.protectedCopy) assert.ok(homeText.includes(phrase), `protected homepage copy: ${phrase}`);
  const htmlPaths = await htmlFiles(dist);
  for (const path of htmlPaths) {
    const html = await readFile(path, "utf8");
    const text = visibleText(html);
    for (const phrase of contract.forbiddenCopy) {
      assert.ok(!text.toLowerCase().includes(phrase.toLowerCase()), `${path}: forbidden copy: ${phrase}`);
    }
    const stylesheets = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)];
    assert.equal(stylesheets.length, 1, `${path}: expected one stylesheet request`);
    assert.match(stylesheets[0][0], /href=["'](?:\.\.\/)?styles\/main\.css["']/i, path);
  }
  assert.match(css, /\.site-footer__signature::before\{[^}]*miebaka-joshua-script-name\.svg/);
  const footer = await readFile(join(dist, "js", "render", "footer.js"), "utf8");
  assert.match(footer, /site-footer__signature/);
});
