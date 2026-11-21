import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE } from "../data/site.js";
import { renderProjectFolderStackMarkup, renderProjectArchiveMarkup } from "../js/render/projects.js";

test("archive publishes exactly three honest brand-specific native folder links", () => {
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  assert.equal((html.match(/class="project-folder__link"/g) || []).length, 3);
  assert.deepEqual([...html.matchAll(/href="work\/([^"]+\.html)"/g)].map(match => match[1]),
    ["rivo.html", "tedx-rsu.html", "chopbox.html"]);
  for (const color of ["#000041", "#6e2962", "#c2531c"]) assert.ok(html.includes(color), color);
  for (const year of [2024, 2023, 2022]) assert.match(html, new RegExp("CASE STUDY / " + year));
  assert.doesNotMatch(html, /filing-cabinet|drawer|webgl|canvas/i);
});

test("each paper folder has rear tab, two sheets, opaque front and full text", () => {
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  for (const className of ["project-folder__back", "project-folder__tab",
    "project-folder__paper--left", "project-folder__paper--right",
    "project-folder__front", "project-folder__title", "project-folder__view"]) {
    assert.equal((html.match(new RegExp('class="[^"]*' + className + '(?: [^"]*)?"', "g")) || []).length, 3, className);
  }
  for (const name of ["Rivo Studio", "TEDx Rivers State University", "ChopBox"]) {
    assert.match(html, new RegExp('aria-label="View ' + name + ' case study"'));
  }
});

test("archive separates published case files from unpublished updates", () => {
  const html = renderProjectArchiveMarkup(SITE.projects, "", SITE.caseStudies);
  assert.match(html, /project-archive__progress/);
  assert.match(html, /project-archive__collections/);
  assert.doesNotMatch(html, /href="work\/(?:kigoma-hotels|kiki-joshua-notepad|christian-poster-a-week)\.html"/);
});

test("Work page never loads retired drawer or WebGL components", () => {
  const work = readFileSync(resolve("work.html"), "utf8");
  const css = readFileSync(resolve("styles/project-folders.css"), "utf8");
  assert.doesNotMatch(work, /filing-cabinet|work-cabinet|work-cabinet-three/i);
  assert.match(work, /styles\/project-folders\.css/);
  assert.match(css, /\.project-folder:focus-within/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /pointer: coarse/);
});
