import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cabinetQuality, initWorkCabinetThree } from "../js/work-cabinet-three.js";

test("cabinet quality avoids costly GPU work on constrained devices", () => {
  assert.deepEqual(cabinetQuality({
    width: 390, devicePixelRatio: 3, hardwareConcurrency: 8,
  }), { enabled: true, pixelRatio: 1.25, environment: false });
  assert.deepEqual(cabinetQuality({
    width: 1440, devicePixelRatio: 2, hardwareConcurrency: 8,
  }), { enabled: true, pixelRatio: 1.5, environment: true });
  assert.deepEqual(cabinetQuality({
    width: 1440, devicePixelRatio: 2, hardwareConcurrency: 2,
  }), { enabled: false, pixelRatio: 1, environment: false });
  assert.equal(cabinetQuality({ saveData: true }).enabled, false);
});

test("3D cabinet enhancement is inert outside a browser with a Work drawer", () => {
  assert.equal(typeof initWorkCabinetThree({ document: null, window: null }).destroy, "function");
});

test("Work production page loads the 3D enhancement only after its DOM fallback", () => {
  const root = resolve(import.meta.dirname, "..");
  const htmlPath = resolve(root, "dist/work.html");
  if (!existsSync(htmlPath)) return; // Build is checked by production integrity tests.
  const html = readFileSync(htmlPath, "utf8");
  const runtime = resolve(root, "dist/assets/runtime/work-cabinet-three.js");
  assert.ok(existsSync(runtime), "page-scoped Three.js runtime must ship with Work");
  assert.match(html, /js\/core\/work-cabinet-bootstrap\.js/);
  assert.match(html, /class="filing-cabinet__drawer"/);
  assert.match(html, /href="work\/rivo\.html"/);
  assert.ok(html.indexOf('src="js/core/work-cabinet.js"') <
    html.indexOf('src="js/core/work-cabinet-bootstrap.js"'));
});
