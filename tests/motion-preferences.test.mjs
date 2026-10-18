import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createMarqueeController } from "../js/render/projects.js";
import { createPreferencesController } from "../js/core/preferences.js";
import { createFooterSignatureController } from "../js/core/footer-signature.js";

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

test("preferences survive a throwing global localStorage getter", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, get() { throw Error("denied"); } });
  try {
    const html = new Target();
    const controller = createPreferencesController({ root: html, reducedQuery: new Media(false), darkQuery: new Media(false) });
    controller.setMotion("reduce");
    assert.equal(html.dataset.motion, "reduced"); controller.destroy();
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "localStorage", descriptor);
    else delete globalThis.localStorage;
  }
});

test("footer enhancement follows motion changes and fully cleans up", () => {
  const doc = new Target(); doc.documentElement = new Target(); doc.documentElement.dataset.motion = "reduced"; doc.hidden = false;
  let intersection, enhanced = 0, starts = 0, stops = 0, statics = 0, destroyed = 0, disconnected = 0;
  class Observer { constructor(callback) { intersection = callback; } observe() {} disconnect() { disconnected++; } }
  const controller = createFooterSignatureController(new Target(), {
    document: doc, IntersectionObserver: Observer,
    enhance() { enhanced++; return { start() { starts++; }, stop() { stops++; }, static() { statics++; }, destroy() { destroyed++; } }; }
  });
  assert.equal(enhanced, 1); assert.equal(statics, 1);
  doc.documentElement.dataset.motion = "full"; doc.dispatchEvent(new Event("motionpreferencechange"));
  assert.equal(enhanced, 1); assert.equal(starts, 0);
  intersection([{ isIntersecting: true }]); assert.equal(starts, 1);
  doc.documentElement.dataset.motion = "reduced"; doc.dispatchEvent(new Event("motionpreferencechange")); assert.equal(statics, 2);
  doc.documentElement.dataset.motion = "full"; doc.dispatchEvent(new Event("motionpreferencechange")); assert.equal(starts, 2);
  controller.destroy(); assert.equal(disconnected, 1); assert.equal(destroyed, 1);
  doc.dispatchEvent(new Event("motionpreferencechange")); assert.equal(starts, 2);
});

test("OS reduced-motion rules yield to an explicit full preference", async () => {
  for (const file of ["foundations.css", "components-v4.css", "pages-v4.css"]) {
    const css = await readFile(new URL(`../styles/${file}`, import.meta.url), "utf8");
    const media = css.match(/@media\(prefers-reduced-motion:reduce\)\{/g) || [];
    const scoped = css.match(/@media\(prefers-reduced-motion:reduce\)\{:root:not\(\[data-motion-preference="full"\]\)/g) || [];
    assert.equal(scoped.length, media.length, file);
  }
});
