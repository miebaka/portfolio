import test from "node:test";
import assert from "node:assert/strict";
import { createIndexController } from "../js/core/navigation.js";
import { renderIndexMarkup } from "../js/render/navigation.js";
import { navigation } from "../data/navigation.js";

class Element extends EventTarget {
  constructor(document) {
    super(); this.ownerDocument = document; this.dataset = {}; this.attributes = new Map();
    this.style = {}; this.hidden = false; this.inert = false; this.isConnected = true;
    this.listeners = new Map(); this.controls = []; this.children = [];
  }
  setAttribute(key, value) { this.attributes.set(key, String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  removeAttribute(key) { this.attributes.delete(key); }
  contains(node) { return node === this || this.controls.includes(node); }
  querySelectorAll() { return this.controls; }
  getClientRects() { return this.hidden ? [] : [{}]; }
  focus() { this.ownerDocument.activeElement = this; }
  closest(selector) { return selector.includes("data-index-close") && this.closeControl ? this : null; }
  addEventListener(name, callback) { super.addEventListener(name, callback); this.listeners.set(name, (this.listeners.get(name) || 0) + 1); }
  removeEventListener(name, callback) { super.removeEventListener(name, callback); this.listeners.set(name, (this.listeners.get(name) || 0) - 1); }
}

function fixture() {
  const document = new Element(null); document.ownerDocument = document;
  document.defaultView = { matchMedia: () => ({ matches: false }), scrollX: 0, scrollY: 140, innerWidth: 1000, scrollTo() {} };
  document.documentElement = new Element(document); document.documentElement.clientWidth = 1000;
  document.body = new Element(document);
  const root = new Element(document), trigger = new Element(document), background = new Element(document), alreadyInert = new Element(document);
  alreadyInert.inert = true;
  root.hidden = true; root.inert = true;
  const first = new Element(document), last = new Element(document);
  first.closeControl = true; root.controls = [first, last];
  document.body.children = [background, alreadyInert, root]; trigger.focus();
  return { document, root, trigger, background, alreadyInert, first, last };
}

function key(document, value, shift = false) {
  const event = new Event("keydown", { cancelable: true });
  Object.defineProperties(event, { key: { value }, shiftKey: { value: shift } });
  document.dispatchEvent(event); return event;
}

test("Index opens immediately for keyboard, isolates the page and focuses its first control", () => {
  const f = fixture(), controller = createIndexController(f);
  controller.open({ source: "keyboard" });
  assert.equal(controller.isOpen, true);
  assert.equal(f.trigger.getAttribute("aria-expanded"), "true");
  assert.equal(f.background.inert, true); assert.equal(f.root.hidden, false); assert.equal(f.root.inert, false);
  assert.equal(f.root.dataset.source, "keyboard"); assert.equal(f.document.activeElement, f.first);
  assert.equal(f.document.body.style.position, "fixed"); controller.destroy();
});

test("Tab wraps in both directions; Escape restores focus, inertness and scroll styles", () => {
  const f = fixture(), controller = createIndexController(f);
  controller.open({ source: "keyboard" });
  f.last.focus(); assert.equal(key(f.document, "Tab").defaultPrevented, true); assert.equal(f.document.activeElement, f.first);
  assert.equal(key(f.document, "Tab", true).defaultPrevented, true); assert.equal(f.document.activeElement, f.last);
  key(f.document, "Escape");
  assert.equal(controller.isOpen, false); assert.equal(f.root.hidden, true); assert.equal(f.root.inert, true);
  assert.equal(f.background.inert, false); assert.equal(f.alreadyInert.inert, true);
  assert.equal(f.trigger.getAttribute("aria-expanded"), "false"); assert.equal(f.document.activeElement, f.trigger);
  assert.equal(f.document.body.style.position, undefined); controller.destroy();
});

test("repeated initialization/open/close leaves one listener and destroy removes it", () => {
  const f = fixture(), controller = createIndexController(f);
  assert.equal(createIndexController(f), controller);
  for (let i = 0; i < 3; i++) { controller.open({ source: "keyboard" }); controller.open(); controller.close(); }
  assert.equal(f.trigger.listeners.get("click"), 1); assert.equal(f.document.listeners.get("keydown"), 0);
  controller.destroy(); assert.equal(f.trigger.listeners.get("click"), 0);
});

test("close never focuses a disconnected trigger and can omit restoration", () => {
  const f = fixture(), controller = createIndexController(f);
  controller.open({ source: "keyboard" }); f.trigger.isConnected = false; controller.close();
  assert.notEqual(f.document.activeElement, f.trigger);
  f.trigger.isConnected = true; controller.open({ source: "keyboard" }); controller.close({ restoreFocus: false });
  assert.notEqual(f.document.activeElement, f.trigger); controller.destroy();
});

test("Index has the complete registry, named preferences, contact and only a configured CV", () => {
  const html = renderIndexMarkup({ base: "../", page: "work", site: { email: "test@example.com" } });
  for (const route of navigation.index) assert.ok(html.includes(`href="../${route.href}"`));
  assert.match(html, /aria-labelledby="site-index-title"/); assert.match(html, /mailto:test@example.com/);
  assert.match(html, /Preferences/); assert.doesNotMatch(html, /download/);
  assert.match(renderIndexMarkup({ site: { cv: { href: "assets/cv.pdf", label: "Download CV", mimeType: "application/pdf", sizeLabel: "120 KB" } } }), /download[^>]*>Download CV/);
});
