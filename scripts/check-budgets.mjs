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
const shaderIsland = gzipSync(readFileSync(resolve(dist, "assets/runtime/shader-gradient.js"))).byteLength;

function assertBudget(label, actual, budget) {
  const display = bytes => `${(bytes / 1024).toFixed(1)} KiB`;
  console.log(`${label}: ${display(actual)} / ${display(budget)}`);
  assert.ok(actual <= budget, `${label} exceeds its budget (${display(actual)} > ${display(budget)})`);
}

assertBudget("initial CSS", gzipBytes(css), 45 * 1024);
assertBudget("initial JavaScript", gzipBytes(js), 75 * 1024);
assertBudget("lazy shader JavaScript", shaderIsland, 375 * 1024);
assertBudget("homepage media", homepageMedia, 1.5 * 1024 * 1024);
