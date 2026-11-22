import test from "node:test";
import assert from "node:assert/strict";
import { isMotionReduced } from "../js/core/motion-language.js";

test("explicit Reduce takes precedence over an unrestricted OS", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "reduced" } }, { matches: false }), true);
});

test("operating-system Reduce remains respected even if Full was previously chosen", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "full" } }, { matches: true }), true);
  assert.equal(isMotionReduced({ dataset: { motion: "full" } }, { matches: false }), false);
});

test("System follows the OS setting and fails open when unavailable", () => {
  assert.equal(isMotionReduced({ dataset: { motion: "system" } }, { matches: true }), true);
  assert.equal(isMotionReduced({ dataset: { motion: "system" } }, { matches: false }), false);
  assert.equal(isMotionReduced(null, undefined), false);
});

test("an unset preference honors the OS without introducing hidden content", () => {
  assert.equal(isMotionReduced({ dataset: {} }, { matches: true }), true);
  assert.equal(isMotionReduced({ dataset: {} }, { matches: false }), false);
});
