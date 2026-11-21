import test from "node:test";
import assert from "node:assert/strict";
import { isMotionReduced, initMotionLanguage } from "../js/core/motion-language.js";

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

test("motion initialization is harmless in non-browser environments", () => {
  assert.equal(typeof initMotionLanguage({ document: null, window: null }).destroy, "function");
});

test("preference handler is inert after destruction", () => {
  const classes = new Set();
  const root = {
    dataset: { motion: "full" },
    classList: {
      add(name) { classes.add(name); },
      remove(name) { classes.delete(name); },
      toggle(name, state) {
        if (state) classes.add(name);
        else classes.delete(name);
      },
    },
  };
  let onChange;
  const win = {
    matchMedia() {
      return {
        matches: false,
        addEventListener(_, cb) { onChange = cb; },
        removeEventListener() {},
      };
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
  };
  const instance = initMotionLanguage({ document: { documentElement: root }, window: win });
  assert.ok(classes.has("motion-language-ready"));
  instance.destroy();
  assert.ok(!classes.has("motion-language-ready"));
  onChange();
  assert.ok(!classes.has("motion-language-ready"));
});
