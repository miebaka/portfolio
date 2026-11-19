import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { siteConfig } from "../data/site-config.js";
import { CONTENT } from "../data/site.js";
import { services } from "../data/services.js";
import { escapeHTML } from "../js/utilities/dom.js";
import {
  createServiceSwatches,
  renderExperienceLedger,
  renderServiceAccordionMarkup,
  renderServiceFallbackMarkup,
  renderServiceSwatchesMarkup,
  renderCvMarkup,
} from "../js/render/sections.js";
import { renderIndexMarkup } from "../js/render/navigation.js";
import { renderHomeProjectList, renderProjectArchiveMarkup } from "../js/render/projects.js";
import { validateContent } from "../scripts/content-schema.mjs";
import { assertValidContent } from "../scripts/validate-content.mjs";

const root = new URL("../", import.meta.url);
const page = (name) => readFile(new URL(name, root), "utf8");

test("CV is either downloadable or truthfully available by request", () => {
  assert.equal(siteConfig.cv, null);
  assert.equal(renderCvMarkup(siteConfig.cv), "");
  assert.match(renderIndexMarkup({ site: siteConfig }), /Request CV/);
  assert.match(renderIndexMarkup({ site: siteConfig }), /Available by email/);

  const cv = {
    href: "assets/documents/miebaka-joshua-cv.pdf",
    label: "Download CV",
    mimeType: "application/pdf",
    sizeLabel: "184 KB",
  };
  assert.match(renderCvMarkup(cv), /download/);
  assert.match(renderCvMarkup(cv), /PDF · 184 KB/);
  assert.match(renderIndexMarkup({ site: { ...siteConfig, cv } }), /site-index__cv/);
  assert.doesNotMatch(renderIndexMarkup({ site: { ...siteConfig, cv } }), /Request CV/);

  const missingState = validateContent({ ...CONTENT, siteConfig: { ...siteConfig, cv: undefined } });
  assert.equal(missingState.ok, false);
  assert.ok(missingState.errors.some((error) => error.code === "CV_STATE_REQUIRED"));
  assert.throws(() => assertValidContent({ ...CONTENT, siteConfig: { ...siteConfig, cv } }), /CV_FILE_MISSING/);
});

test("the service system has exactly five complete shared records", () => {
  assert.equal(services.length, 5);
  for (const service of services) {
    assert.match(service.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ["title", "description", "outputs", "fit", "evidenceLabel", "evidenceHref"])
      assert.ok(service[field]?.trim(), `${service.id}.${field}`);
  }
  const markup = renderServiceSwatchesMarkup(services);
  assert.equal((markup.match(/class="service-journey /g) || []).length, 5);
  assert.equal((markup.match(/class="service-journey__number"/g) || []).length, 5);
  const fallback = renderServiceFallbackMarkup(services);
  for (const service of services)
    for (const field of ["title", "description", "outputs", "fit"]) {
      assert.ok(
        fallback.includes(service[field].replaceAll("&", "&amp;")),
        `${service.id}.${field} is available without JavaScript`,
      );
    }
});

test("service cards sanitize unsafe destinations, filenames and injected markup", () => {
  const hostile = [{ ...services[0], title: '<img src=x onerror=alert(1)>', evidenceHref: 'javascript:alert(1)', cover: '../bad" onerror=alert(1)' }];
  const markup = renderServiceSwatchesMarkup(hostile);
  assert.match(markup, /href="#"/);
  assert.doesNotMatch(markup, /href="javascript:|<img src=x onerror=|<img[^>]+\\sonerror=/);
  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt;/);
});

test("the homepage makes the hiring proposition and proof available before biography", async () => {
  const html = await page("index.html");
  assert.match(html, /A creative partner for teams turning difficult briefs into unmistakable brands\./);
  assert.match(html, /Miebaka/);
  assert.match(html, /Marketing designer at Rise/);
  assert.match(html, /Lagos, Nigeria/);
  assert.match(html, /Selected work/);
  assert.ok(html.indexOf('id="selected-work"') < html.indexOf('id="profile"'));
});

test("the closing invitation clearly supports employment and collaboration", async () => {
  const html = await page("index.html");
  assert.match(
    html,
    /Available for senior brand and marketing design roles, selected collaborations and design-led teams\./,
  );
  assert.match(html, /miebakakiki@gmail\.com/);
});

test("Home and About share the complete capability source", async () => {
  const home = await page("index.html");
  assert.match(home, /data-mount="capabilities"/);
  assert.match(home, /id="what-i-do"/);
  const about = await page("about.html");
  assert.match(about, /data-mount="capabilities"/);
  for (const [pageName, html] of [
    ["index.html", home],
    ["about.html", about],
  ]) {
    for (const service of services)
      for (const field of ["title", "description"]) {
        assert.ok(html.includes(service[field].replaceAll("&", "&amp;")), `${pageName}: ${service.id}.${field}`);
      }
  }
  await assert.rejects(page("services.html"));
  assert.match(await page("scripts/build-site.mjs"), /renderServiceFallbackMarkup\(content\.services\)/);
});

class FakeControl {
  constructor() {
    this.attributes = new Map();
    this.listeners = new Map();
    this.tabIndex = -1;
    this.hidden = false;
    this.focused = false;
  }
  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }
  removeEventListener(type, listener) {
    if (this.listeners.get(type) === listener) this.listeners.delete(type);
  }
  focus() {
    this.focused = true;
  }
  fire(type, event = {}) {
    this.listeners.get(type)?.({ preventDefault() {}, ...event });
  }
}

test("service swatches support pointer and complete roving-keyboard selection with cleanup", () => {
  const tabs = services.map(() => new FakeControl());
  const panels = services.map(() => new FakeControl());
  const root = { dataset: {}, querySelectorAll: (selector) => (selector === '[role="tab"]' ? tabs : panels) };
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
  assert.ok(tabs.every((tab) => tab.listeners.size === 0));
});

test("mobile service markup is a vertical, fully readable accordion", () => {
  const markup = renderServiceAccordionMarkup(services);
  assert.equal((markup.match(/<details/g) || []).length, 5);
  for (const service of services) {
    assert.ok(markup.includes(escapeHTML(service.title)));
    assert.ok(markup.includes(escapeHTML(service.description)));
    assert.ok(markup.includes(escapeHTML(service.evidenceLabel)));
  }
  assert.doesNotMatch(markup, /role="tab"|role="tabpanel"/);
});

test("service journeys expose persistent number, title and evidence link cues", async () => {
  const markup = renderServiceSwatchesMarkup(services);
  assert.equal((markup.match(/class="service-journey__number"/g) || []).length, 5);
  assert.equal((markup.match(/class="service-journey__arrow"/g) || []).length, 5);
  for (const service of services) assert.ok(markup.includes(service.evidenceHref));
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

test("the homepage keeps selected work concise and image-led", () => {
  const markup = renderHomeProjectList(CONTENT.projects, CONTENT.caseStudies);
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    const project = CONTENT.projects.find((item) => item.slug === slug);
    assert.ok(markup.includes(project.title), `${slug} title appears on Home`);
  }
  assert.doesNotMatch(markup, /Governing decision|home-project-list__decision/);
  assert.equal((markup.match(/home-project-list__visual/g) || []).length, 3);
});

test("public service names are concrete disciplines backed by real published chapter anchors", async () => {
  assert.deepEqual(services.map(service => service.title), [
    "Brand Identity & Systems", "Art Direction", "Campaign & Marketing Design",
    "Editorial & Graphic Design", "Design Systems & Production",
  ]);
  for (const service of services) {
    const [file, anchor] = service.evidenceHref.split("#");
    assert.ok(anchor, `${service.id} needs an explicit evidence chapter`);
    const slug = file.replace(/^work\//, "").replace(/\.html$/, "");
    const source = (await import("../data/case-studies.js")).caseStudies;
    const record = source[slug];
    assert.ok(record, `${service.id} references a published case`);
    assert.ok(record.chapters?.some(chapter => chapter.id === anchor),
      `${service.id} links to a real chapter`);
  }
  const markup = renderServiceSwatchesMarkup(services);
  assert.equal((markup.match(/service-journey__evidence/g) || []).length, services.length);
});

test("About portrait and 404 recovery follow semantic design contracts", async () => {
  const about = await page("about.html");
  assert.doesNotMatch(about, /<\/picture>\s*<\/picture>/);
  assert.match(about, /<div class="about-hero__media">[\s\S]*?<picture>[\s\S]*?<\/picture>\s*<\/div>/);
  const missing = await page("404.html");
  for (const href of ["index.html", "work.html", "contact.html"])
    assert.match(missing, new RegExp(`href="${href}"`));
});

test("Home and About preserve authentic public proof without JavaScript", async () => {
  const home = await page("index.html");
  const about = await page("about.html");
  for (const client of (await import("../data/clients.js")).clients) {
    assert.ok(home.includes('alt="' + client.name.replaceAll("&", "&amp;") + '"'));
  }
  for (const job of siteConfig.experience) {
    assert.ok(about.includes(job.organisation));
    assert.ok(about.includes(job.period));
  }
  assert.match(home,/client-strip__fallback/);
  assert.match(about,/experience-fallback/);
});

test("Work archive derives published cases and in-progress register from real project records", () => {
  const markup = renderProjectArchiveMarkup(CONTENT.projects, "", CONTENT.caseStudies);
  const published = CONTENT.projects.filter(project =>
    project.status === "published" && CONTENT.caseStudies?.[project.slug]?.status === "published" && project.cover);
  const drafts = CONTENT.projects.filter(project => project.status === "coming-soon" && project.featured !== true);
  assert.equal((markup.match(/class="project-archive__item /g) || []).length, published.length);
  assert.equal((markup.match(/class="project-archive__preview-frame"/g) || []).length, published.length);
  for (const project of drafts) assert.ok(markup.includes(project.title));
  assert.doesNotMatch(markup, /Detour|Out Of Office/);
  assert.doesNotMatch(markup, /javascript:/);
});
