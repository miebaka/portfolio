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

test("Work source attaches a lazy Three.js loader after native HTML links", () => {
  const root = resolve(import.meta.dirname, "..");
  const html = readFileSync(resolve(root, "work.html"), "utf8");
  assert.ok(existsSync(resolve(root, "js/core/work-cabinet-bootstrap.js")));
  assert.match(html, /js\/core\/work-cabinet-bootstrap\.js/);
  assert.match(html, /class="filing-cabinet__drawer"/);
  assert.match(html, /href="work\/rivo\.html"/);
  assert.ok(html.indexOf('src="js/core/work-cabinet.js"') <
    html.indexOf('src="js/core/work-cabinet-bootstrap.js"'));
});


test("Work bootstrap requires user engagement rather than eager viewport observation", () => {
  const root = resolve(import.meta.dirname, "..");
  const source = readFileSync(resolve(root, "js/core/work-cabinet-bootstrap.js"), "utf8");
  assert.match(source, /pointerenter/);
  assert.match(source, /focusin/);
  assert.match(source, /addEventListener\("scroll"/);
  assert.doesNotMatch(source, /new IntersectionObserver/);
});
