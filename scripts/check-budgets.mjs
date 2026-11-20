import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
if (!existsSync(resolve(dist, "index.html"))) throw new Error("dist is missing; run npm run build first");

const html = readFileSync(resolve(dist, "index.html"), "utf8");
const local = value => !/^(?:https?:|data:|#)/u.test(value);
const refs = (pattern, source = html) => [...source.matchAll(pattern)].map(match => match[1]).filter(local);
const unique = values => [...new Set(values.map(value => value.replace(/^\.\//u, "")))];
const gzipBytes = files => gzipSync(Buffer.concat(files.map(file => readFileSync(resolve(dist, file))))).byteLength;
const css = unique(refs(/<link[^>]+href=["']([^"']+\.css)["']/giu));
const js = unique(refs(/<script[^>]+src=["']([^"']+\.js)["']/giu));
const initialImages = [...html.matchAll(/<img\b([^>]*)>/giu)]
  .filter(([, attrs]) => !/\bloading=["']lazy["']/iu.test(attrs))
  .map(([, attrs]) => attrs.match(/\bsrc=["']([^"']+)["']/iu)?.[1])
  .filter(Boolean).filter(local);
const homepageMedia = unique(initialImages).reduce((sum, file) => sum + statSync(resolve(dist, file)).size, 0);
const heroWave = gzipSync(readFileSync(resolve(dist, "assets/runtime/hero-wave.js"))).byteLength;
const fontFiles = unique([...readFileSync(resolve(dist, "styles/main.css"), "utf8").matchAll(/url\(["']?\.\.\/assets\/fonts\/([^"')]+)["']?\)/giu)].map(match => `assets/fonts/${match[1]}`));
const fontBytes = gzipBytes(fontFiles);
// In the Geist system, display/body/label font files are pinned to a remote
// versioned CDN, so fetch their actual bytes rather than measuring retired Archivo.
const stylesheet = readFileSync(resolve(dist, "styles/main.css"), "utf8");
const remoteFontUrls = unique([...stylesheet.matchAll(/url\(["']?(https:\/\/cdn\.jsdelivr\.net\/npm\/geist@1\.9\.2\/[^"')]+\.woff2)["']?\)/giu)].map(match => match[1]));
assert.ok(remoteFontUrls.length >= 3, "Geist font budget must include display, body and mono fonts");
const remoteFontBuffers = await Promise.all(remoteFontUrls.map(async url => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  assert.ok(response.ok, `Geist font unavailable (${response.status}): ${url}`);
  assert.match(response.headers.get("content-type") || "", /font\/woff2|application\/font-woff/i,
    `Font endpoint must return WOFF2: ${url}`);
  return { url, buffer: Buffer.from(await response.arrayBuffer()) };
}));
const displayFontBuffer = remoteFontBuffers.find(({url}) => url.includes("GeistSerif-Regular.woff2"))?.buffer;
assert.ok(displayFontBuffer, "Geist Serif Regular display font is missing");
const displayFont = gzipSync(displayFontBuffer).byteLength;
const totalFontBytes = gzipSync(Buffer.concat([
  ...fontFiles.map(file => readFileSync(resolve(dist, file))),
  ...remoteFontBuffers.map(({buffer}) => buffer),
])).byteLength;

function assertBudget(label, actual, budget) {
  const display = bytes => `${(bytes / 1024).toFixed(1)} KiB`;
  console.log(`${label}: ${display(actual)} / ${display(budget)}`);
  assert.ok(actual <= budget, `${label} exceeds its budget (${display(actual)} > ${display(budget)})`);
}

assertBudget("initial CSS", gzipBytes(css), 45 * 1024);
assertBudget("initial JavaScript", gzipBytes(js), 75 * 1024);
assertBudget("lazy hero-wave JavaScript", heroWave, 145 * 1024);
assertBudget("homepage media", homepageMedia, 1.5 * 1024 * 1024);
assertBudget("display font", displayFont, 100 * 1024);
assertBudget("all site fonts (local + pinned Geist)", totalFontBytes, 420 * 1024);
