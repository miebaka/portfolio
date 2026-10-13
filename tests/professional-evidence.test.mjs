import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { siteConfig } from "../data/site-config.js";
import { services } from "../data/services.js";
import {
  renderExperienceLedger,
  renderServiceSwatchesMarkup,
  renderCvMarkup
} from "../js/render/sections.js";
import { renderIndexMarkup } from "../js/render/navigation.js";

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
});

test("Home, About and Services expose the same progressive service source", async () => {
  for (const file of ["index.html", "about.html", "services.html"]) {
    const html = await page(file);
    assert.match(html, /data-mount="capabilities"/, file);
    for (const service of services) assert.match(html, new RegExp(service.title.replace("&", "&amp;")), `${file}: ${service.title}`);
  }
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

