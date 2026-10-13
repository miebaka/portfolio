import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { siteConfig } from "../data/site-config.js";
import { CONTENT } from "../data/site.js";
import { services } from "../data/services.js";
import {
  createServiceSwatches,
  renderExperienceLedger,
  renderServiceFallbackMarkup,
  renderServiceSwatchesMarkup,
  renderCvMarkup
} from "../js/render/sections.js";
import { renderIndexMarkup } from "../js/render/navigation.js";
import { validateContent } from "../scripts/content-schema.mjs";
import { assertValidContent } from "../scripts/validate-content.mjs";

const root = new URL("../", import.meta.url);
const page = name => readFile(new URL(name, root), "utf8");

test("CV is either complete approved metadata or truthfully absent", () => {
  assert.equal(siteConfig.cv, null);
  assert.equal(renderCvMarkup(siteConfig.cv), "");
  assert.doesNotMatch(renderIndexMarkup({ site: siteConfig }), /site-index__cv/);

  const cv = { href: "assets/documents/miebaka-joshua-cv.pdf", label: "Download CV", mimeType: "application/pdf", sizeLabel: "184 KB" };
  assert.match(renderCvMarkup(cv), /download/);
  assert.match(renderCvMarkup(cv), /PDF · 184 KB/);
  assert.match(renderIndexMarkup({ site: { ...siteConfig, cv } }), /site-index__cv/);

  const missingState = validateContent({ ...CONTENT, siteConfig: { ...siteConfig, cv: undefined } });
  assert.equal(missingState.ok, false);
  assert.ok(missingState.errors.some(error => error.code === "CV_STATE_REQUIRED"));
  assert.throws(() => assertValidContent({ ...CONTENT, siteConfig: { ...siteConfig, cv } }), /CV_FILE_MISSING/);
});

test("the service system has exactly five complete shared records", () => {
  assert.equal(services.length, 5);
  for (const service of services) {
    assert.match(service.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ["title", "description", "outputs", "fit"]) assert.ok(service[field]?.trim(), `${service.id}.${field}`);
  }
  const markup = renderServiceSwatchesMarkup(services);
  assert.equal((markup.match(/role="tab"/g) || []).length, 5);
  assert.equal((markup.match(/role="tabpanel"/g) || []).length, 5);
  assert.match(markup, /aria-selected="true"/);
  const fallback = renderServiceFallbackMarkup(services);
  for (const service of services) for (const field of ["title", "description", "outputs", "fit"]) {
    assert.ok(fallback.includes(service[field].replaceAll("&", "&amp;")), `${service.id}.${field} is available without JavaScript`);
  }
});

test("Home, About and Services expose the same progressive service source", async () => {
  for (const file of ["index.html", "about.html", "services.html"]) {
    const html = await page(file);
    assert.match(html, /data-mount="capabilities"/, file);
    for (const service of services) for (const field of ["title", "description", "outputs", "fit"]) {
      assert.ok(html.includes(service[field].replaceAll("&", "&amp;")), `${file}: ${service.id}.${field}`);
    }
  }
  assert.match(await page("scripts/build-site.mjs"), /renderServiceFallbackMarkup\(content\.services\)/);
});

class FakeControl {
  constructor() { this.attributes = new Map(); this.listeners = new Map(); this.tabIndex = -1; this.hidden = false; this.focused = false; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type, listener) { if (this.listeners.get(type) === listener) this.listeners.delete(type); }
  focus() { this.focused = true; }
  fire(type, event = {}) { this.listeners.get(type)?.({ preventDefault() {}, ...event }); }
}

test("service swatches support pointer and complete roving-keyboard selection with cleanup", () => {
  const tabs = services.map(() => new FakeControl());
  const panels = services.map(() => new FakeControl());
  const root = { dataset: {}, querySelectorAll: selector => selector === '[role="tab"]' ? tabs : panels };
  const cleanup = createServiceSwatches(root);

  tabs[2].fire("click");
  assert.equal(tabs[2].attributes.get("aria-selected"), "true");
  assert.equal(panels[2].hidden, false);
  assert.equal(panels[0].hidden, true);

  tabs[2].fire("keydown", { key: "ArrowRight" });
  assert.equal(tabs[3].tabIndex, 0);
  assert.equal(tabs[3].focused, true);
  assert.equal(root.dataset.input, "keyboard");
  tabs[3].fire("keydown", { key: "End" });
  assert.equal(tabs[4].tabIndex, 0);
  tabs[4].fire("keydown", { key: "Home" });
  assert.equal(tabs[0].tabIndex, 0);

  cleanup();
  assert.ok(tabs.every(tab => tab.listeners.size === 0));
});

test("service selection has a non-colour cue and both reduced-motion paths", async () => {
  const markup = renderServiceSwatchesMarkup(services);
  const css = await page("styles/pages-v4.css");
  assert.match(markup, /aria-selected="true"/);
  assert.match(css, /service-swatch\[aria-selected="true"\][^{]*\{[^}]*outline:/s);
  assert.match(css, /service-swatch\[aria-selected="true"\]::after\{content:"Selected"/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[\s\S]*?service-swatch/);
  assert.match(css, /html\[data-motion="reduced"\] \.service-swatch/);
});

test("experience ledger uses one bounded contribution and no numeric outcome claims", () => {
  const entries = siteConfig.experience;
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry), ["organisation", "role", "period", "contribution"]);
    assert.doesNotMatch(entry.contribution, /\b\d[\d,+.%]*\b/);
  }
  const markup = renderExperienceLedger(entries);
  assert.equal((markup.match(/class="experience-ledger__item"/g) || []).length, entries.length);
  assert.doesNotMatch(markup, /<details|timeline|card/i);
});

