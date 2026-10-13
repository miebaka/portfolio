import test from "node:test";
import assert from "node:assert/strict";
import { createMarqueeController } from "../js/render/projects.js";
import { createPreferencesController } from "../js/core/preferences.js";

class Target extends EventTarget {
  constructor() { super(); this.dataset = {}; this.attributes = new Map(); this.classList = { values: new Set(), toggle: (k, on) => on ? this.classList.values.add(k) : this.classList.values.delete(k) }; }
  setAttribute(k, v) { this.attributes.set(k, String(v)); }
  getAttribute(k) { return this.attributes.get(k); }
}

class Media extends EventTarget { constructor(matches = false) { super(); this.matches = matches; } change(matches) { this.matches = matches; this.dispatchEvent(new Event("change")); } }

test("marquee user pause wins over visibility and intersection changes", () => {
  const root = new Target(), button = new Target(), doc = new Target(); doc.hidden = false;
  let intersection;
  class Observer { constructor(callback) { intersection = callback; } observe() {} disconnect() { this.disconnected = true; } }
  const controller = createMarqueeController(root, { button, document: doc, IntersectionObserver: Observer, reduced: () => false });
  intersection([{ isIntersecting: true }]);
  assert.equal(root.classList.values.has("is-running"), true);
  button.dispatchEvent(new Event("click"));
  assert.equal(controller.isPaused(), true);
  doc.hidden = true; doc.dispatchEvent(new Event("visibilitychange"));
  doc.hidden = false; doc.dispatchEvent(new Event("visibilitychange"));
  intersection([{ isIntersecting: true }]);
  assert.equal(root.classList.values.has("is-running"), false);
  assert.equal(button.getAttribute("aria-label"), "Play client logos");
  controller.destroy();
});

test("marquee stays static for reduced motion and cleans up", () => {
  const root = new Target(), button = new Target(), doc = new Target(); doc.hidden = false;
  let disconnected = false;
  class Observer { observe() {} disconnect() { disconnected = true; } }
  const controller = createMarqueeController(root, { button, document: doc, IntersectionObserver: Observer, reduced: () => true });
  controller.play();
  assert.equal(root.classList.values.has("is-running"), false);
  assert.equal(button.getAttribute("aria-disabled"), "true");
  controller.destroy(); assert.equal(disconnected, true);
});

test("preferences distinguish system, reduce and full and survive storage failures", () => {
  const html = new Target(), reduced = new Media(false), dark = new Media(false);
  const storage = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); } };
  const controller = createPreferencesController({ root: html, storage, reducedQuery: reduced, darkQuery: dark });
  assert.equal(controller.motionPreference, "system"); assert.equal(html.dataset.motion, "full");
  reduced.change(true); assert.equal(html.dataset.motion, "reduced");
  controller.setMotion("full"); reduced.change(true); assert.equal(html.dataset.motion, "full");
  controller.setMotion("reduce"); assert.equal(html.dataset.motion, "reduced");
  controller.destroy();
});

test("explicit color theme ignores later system changes", () => {
  const html = new Target(), reduced = new Media(false), dark = new Media(false), values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  const controller = createPreferencesController({ root: html, storage, reducedQuery: reduced, darkQuery: dark });
  dark.change(true); assert.equal(html.dataset.theme, "dark");
  controller.setTheme("light"); dark.change(true); assert.equal(html.dataset.theme, "light");
  assert.equal(values.get("color-theme"), "light"); controller.destroy();
});

test("preference destroy removes system listeners", () => {
  const html = new Target(), reduced = new Media(false), dark = new Media(false);
  let changes = 0;
  const controller = createPreferencesController({ root: html, storage: null, reducedQuery: reduced, darkQuery: dark, onChange() { changes++; } });
  assert.equal(changes, 1); controller.destroy(); reduced.change(true); dark.change(true);
  assert.equal(changes, 1); assert.equal(html.dataset.motion, "full"); assert.equal(html.dataset.theme, "light");
});
