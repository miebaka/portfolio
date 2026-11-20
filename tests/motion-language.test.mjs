import test from "node:test";
import assert from "node:assert/strict";
import { isMotionReduced, pointerDisplacement, initMotionLanguage } from "../js/core/motion-language.js";

test("explicit Reduce takes precedence over an unrestricted OS", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "reduced" } }, { matches: false }), true);
});
test("explicit Full overrides the operating system Reduce preference", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "full" } }, { matches: true }), false);
});
test("System resolves the OS preference and fails open when unavailable", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "full" } }, undefined), false);
  assert.equal(isMotionReduced({ dataset: { motion: "system" } }, { matches: true }), true);
  assert.equal(isMotionReduced({ dataset: { motion: "system" } }, { matches: false }), false);
  assert.equal(isMotionReduced(null, undefined), false);
});
test("pointer displacement is centred and clamped within an editorial image", () => {
  const box = { left: 100, top: 200, width: 400, height: 200 };
  assert.deepEqual(pointerDisplacement(box, 300, 300), { x: 0, y: 0 });
  assert.deepEqual(pointerDisplacement(box, 100, 200), { x: -28, y: -16 });
  assert.deepEqual(pointerDisplacement(box, 500, 400), { x: 28, y: 16 });
  assert.deepEqual(pointerDisplacement(box, 999, 999), { x: 28, y: 16 });
  assert.deepEqual(pointerDisplacement(box, -999, -999), { x: -28, y: -16 });
});
test("zero-sized targets never produce NaN or a layout jump", () => {
  assert.deepEqual(pointerDisplacement({ width: 0, height: 200 }, 10, 10), { x: 0, y: 0 });
  assert.deepEqual(pointerDisplacement(null, 10, 10), { x: 0, y: 0 });
});
test("motion initialization is harmless in non-browser environments", () => {
  assert.equal(typeof initMotionLanguage({ document: null, window: null }).destroy, "function");
});
