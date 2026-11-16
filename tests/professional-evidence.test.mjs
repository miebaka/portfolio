import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { siteConfig } from "../data/site-config.js";
import { CONTENT } from "../data/site.js";
import { services } from "../data/services.js";
import {
  createServiceSwatches,
  renderExperienceLedger,
  renderServiceAccordionMarkup,
  renderServiceFallbackMarkup,
  renderServiceSwatchesMarkup,
  renderCvMarkup
} from "../js/render/sections.js";
import { renderIndexMarkup } from "../js/render/navigation.js";
import { renderHomeProjectList } from "../js/render/projects.js";
import { validateContent } from "../scripts/content-schema.mjs";
import { assertValidContent } from "../scripts/validate-content.mjs";

const root = new URL("../", import.meta.url);
const page = name => readFile(new URL(name, root), "utf8");

test("CV is either downloadable or truthfully available by request", () => {
  assert.equal(siteConfig.cv, null);
  assert.equal(renderCvMarkup(siteConfig.cv), "");
  assert.match(renderIndexMarkup({ site: siteConfig }), /Request CV/);
  assert.match(renderIndexMarkup({ site: siteConfig }), /Available by email/);

  const cv = { href: "assets/documents/miebaka-joshua-cv.pdf", label: "Download CV", mimeType: "application/pdf", sizeLabel: "184 KB" };
  assert.match(renderCvMarkup(cv), /download/);
  assert.match(renderCvMarkup(cv), /PDF · 184 KB/);
  assert.match(renderIndexMarkup({ site: { ...siteConfig, cv } }), /site-index__cv/);
  assert.doesNotMatch(renderIndexMarkup({ site: { ...siteConfig, cv } }), /Request CV/);

  const missingState = validateContent({ ...CONTENT, siteConfig: { ...siteConfig, cv: undefined } });
  assert.equal(missingState.ok, false);
  assert.ok(missingState.errors.some(error => error.code === "CV_STATE_REQUIRED"));
  assert.throws(() => assertValidContent({ ...CONTENT, siteConfig: { ...siteConfig, cv } }), /CV_FILE_MISSING/);
});

test("the service system has exactly five complete shared records", () => {
  assert.equal(services.length, 5);
  for (const service of services) {
    assert.match(service.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ["title", "description", "outputs", "fit", "evidenceLabel", "evidenceHref"]) assert.ok(service[field]?.trim(), `${service.id}.${field}`);
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

test("the homepage makes the hiring proposition and proof available before biography", async () => {
  const html = await page("index.html");
  assert.match(html, /I turn complex briefs into clear brands &amp; campaigns\./);
  assert.match(html, /8\+ years/);
  assert.match(html, /Marketing designer at Rise/);
  assert.match(html, /Six partner teams/);
  assert.match(html, /Lagos \/ remote/);
  assert.match(html, /Request CV/);
  assert.ok(html.indexOf('id="current-practice"') < html.indexOf('id="profile"'));
});

test("the closing invitation clearly supports employment and collaboration", async () => {
  const html = await page("index.html");
  assert.match(html, /Available for senior brand and marketing design roles, selected collaborations and design-led teams\./);
  assert.match(html, />Contact me</);
  assert.match(html, />Request CV</);
});

test("About owns the detailed service source while Home keeps the practice concise", async () => {
  const home = await page("index.html");
  assert.doesNotMatch(home, /data-mount="capabilities"/);
  assert.match(home, /One brand\. Six teams\./);
  assert.equal((home.match(/class="home-practice__proof"/g) || []).length, 1);
  const about = await page("about.html");
  assert.match(about, /data-mount="capabilities"/);
  for (const service of services) for (const field of ["title", "description", "outputs", "fit"]) {
    assert.ok(about.includes(service[field].replaceAll("&", "&amp;")), `about.html: ${service.id}.${field}`);
  }
  await assert.rejects(page("services.html"));
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

test("mobile service markup is a vertical, fully readable accordion", () => {
  const markup = renderServiceAccordionMarkup(services);
  assert.equal((markup.match(/<details/g) || []).length, 5);
  for (const service of services) {
    assert.ok(markup.includes(service.title));
    assert.ok(markup.includes(service.description));
    assert.ok(markup.includes(service.evidenceLabel));
  }
  assert.doesNotMatch(markup, /role="tab"|role="tabpanel"/);
});

test("service selection has a persistent non-colour cue", async () => {
  const markup = renderServiceSwatchesMarkup(services);
  const css = await page("styles/components-v4.css");
  assert.match(markup, /aria-selected="true"/);
  assert.match(css, /service-swatch\[aria-selected="true"\][^{]*\{[^}]*outline:/s);
  assert.match(css, /service-swatch\[aria-selected="true"\]::after\{content:"Selected"/);
});

test("experience ledger uses one bounded contribution and no numeric outcome claims", () => {
  const entries = siteConfig.experience;
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry), ["organisation", "role", "period", "startYear", "endYear", "contribution"]);
    assert.doesNotMatch(entry.contribution, /\b\d[\d,+.%]*\b/);
  }
  const markup = renderExperienceLedger(entries);
  assert.equal((markup.match(/class="experience-ruler__item"/g) || []).length, entries.length);
  assert.match(markup, /experience-ruler__scale/);
  assert.doesNotMatch(markup, /<details|card/i);
});

test("the homepage exposes each flagship governing decision before biography", () => {
  const markup = renderHomeProjectList(CONTENT.projects, CONTENT.caseStudies);
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    const decision = CONTENT.caseStudies[slug].proof.find(item => item.type === "decision");
    assert.ok(decision, `${slug} has a governing decision`);
    assert.ok(markup.includes(decision.statement.replaceAll("&", "&amp;").replaceAll("“", "“").replaceAll("”", "”")), `${slug} decision appears on Home`);
  }
  assert.equal((markup.match(/Governing decision/g) || []).length, 3);
});

