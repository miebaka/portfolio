import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cabinetQuality, initWorkCabinetThree } from "../js/work-cabinet-three.js";
import { renderProjectArchiveMarkup } from "../js/render/projects.js";

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


test("quality tier disables GPU material layer when visitors request accessibility or data savings", () => {
  for (const preference of [
    { reducedMotion: true },
    { forcedColors: true },
    { deviceMemory: 2 },
    { hardwareConcurrency: 2 },
    { saveData: true },
  ]) {
    const quality = cabinetQuality({ width: 1440, hardwareConcurrency: 8, ...preference });
    assert.equal(quality.enabled, false, JSON.stringify(preference));
  }
});

test("3D geometry follows browser-computed transforms, not competing easing constants", () => {
  const root = resolve(import.meta.dirname, "..");
  const source = readFileSync(resolve(root, "js/work-cabinet-three.js"), "utf8");
  assert.match(source, /file\.face\.getBoundingClientRect\(\)/);
  assert.match(source, /file\.group\.scale\.set\(scale, scale, 1\)/);
  assert.doesNotMatch(source, /file\.travel\s*\+=/);
  assert.doesNotMatch(source, /\blastFrame\b/, "stale frame state crashes WebGL startup");
  assert.match(source, /function cleanup\(\)/);
  assert.match(source, /contextFailed = true;\s+cleanup\(\)/);
});

test("bootstrap cancels scroll-load work when the drawer leaves the viewport", () => {
  const root = resolve(import.meta.dirname, "..");
  const source = readFileSync(resolve(root, "js/core/work-cabinet-bootstrap.js"), "utf8");
  assert.match(source, /if \(settleTimer\) clearTimeout\(settleTimer\)/);
  assert.match(source, /if \(inViewport\(\)\) load\(\)/);
  assert.match(source, /requestIdleCallback/);
});

test("canonical archive renderer uses concise labels without repeating file counts", () => {
  const html = renderProjectArchiveMarkup();
  assert.match(html, /THE ARCHIVE/);
  assert.match(html, /CASE STUDIES/);
  assert.match(html, /CURRENT FILE/);
  assert.doesNotMatch(html, /FILING SYSTEM \/ 001|CURRENT FILE \/ REGISTER|AVAILABLE TO OPEN/);
});

test("PBR paper stock follows each staggered tab, regardless of year divider positions", () => {
  const source = readFileSync(resolve(import.meta.dirname, "../js/work-cabinet-three.js"), "utf8");
  assert.match(source, /\{ a: 0, b: 1, c: 2 \}\[element\.dataset\.tab\]/);
  assert.match(source, /materials\[stock\]/);
  assert.doesNotMatch(source, /materials\[index % 3\]/);
});

test("sparse archive is grounded by modeled steel floor and support rails, not fabricated files", () => {
  const source = readFileSync(resolve(import.meta.dirname, "../js/work-cabinet-three.js"), "utf8");
  assert.match(source, /const floor = new THREE.Mesh\(/);
  assert.match(source, /materials\[11\]/);
  assert.match(source, /for \(const x of \[22, width - 22\]\)/);
  assert.match(source, /new RoundedBoxGeometry\(3\.6/);
  assert.match(source, /RoundedBoxGeometry\(7\.2/);
});
