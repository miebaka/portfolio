import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE } from "../data/site.js";
import { renderProjectFolderStackMarkup, renderProjectArchiveMarkup, renderHomeProjectList } from "../js/render/projects.js";

test("archive publishes exactly three honest brand-specific native folder links", () => {
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  assert.equal((html.match(/class="project-folder__link"/g) || []).length, 3);
  assert.deepEqual([...html.matchAll(/href="work\/([^"]+\.html)"/g)].map(match => match[1]),
    ["tedx-rsu.html", "rivo.html", "chopbox.html"]);
  for (const color of ["#000041", "#6e2962", "#c2531c"]) assert.ok(html.includes(color), color);
  assert.doesNotMatch(html, /filing-cabinet|drawer|webgl|canvas/i);
});

test("each folder shows the project name, image, decision and numbered papers", () => {
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  for (const className of ["project-folder__back", "project-folder__tab",
    "project-folder__tab-number", "project-folder__front", "project-folder__title",
    "project-folder__paper--1", "project-folder__paper--2", "project-folder__paper--3",
    "project-folder__paper--4", "project-folder__paper--5"]) {
    assert.equal((html.match(new RegExp('class="[^"]*' + className + '(?: [^"]*)?"', "g")) || []).length, 3, className);
  }
  assert.equal((html.match(/class="project-folder__paper project-folder__paper--[1-5]" aria-hidden="true"><\/span>/g) || []).length, 15);
  assert.deepEqual([...html.matchAll(/class="project-folder__tab-number">(\d\d)</g)].map(match => match[1]), ["01", "02", "03"]);
  assert.doesNotMatch(html, /project-folder__(?:spine|serial|index|overline|bottom|view|tab-title)/);
  for (const cls of ["visual", "outcome", "open"]) {
    assert.equal((html.match(new RegExp('class="project-folder__' + cls + '"', "g")) || []).length, 3);
  }
  assert.doesNotMatch(html, /The Call|The System|What Survived|First Contact|The Results|FILE 0/);
  for (const name of ["Rivo Studio", "TEDx Rivers State University", "ChopBox"]) {
    assert.match(html, new RegExp('aria-label="View ' + name + ' case study"'));
    assert.match(html, new RegExp('class="project-folder__title">' + name + '</strong>'));
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
  assert.match(work, /styles\/main\.css/);
  assert.match(css, /\.project-folder:focus-within/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /pointer: coarse/);
});

test("static Work markup matches the horizontal folders and removes filler copy", () => {
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  const fallback = readFileSync(resolve("work.html"), "utf8");
  for (const markup of [html, fallback]) {
    assert.equal((markup.match(/class="project-folder__tab-number"/g) || []).length, 3);
    assert.equal((markup.match(/class="project-folder__title"/g) || []).length, 3);
    assert.equal((markup.match(/class="project-folder__paper project-folder__paper--[1-5]" aria-hidden="true"><\/span>/g) || []).length, 15);
    assert.doesNotMatch(markup, /project-folder__(?:spine|serial|index|overline|bottom|view|tab-title)/);
    assert.doesNotMatch(markup, /demo.*would open|TEDx RSU.*Rise.*Hisa Nigeria/i);
  }
  assert.doesNotMatch(fallback, /The archive \/ 2022 to 2024|Three different challenges\. Three identities/);
  assert.match(fallback, /id="archive-title">Selected work<\/h1>/);
});

test("folder surface keeps one target per case and static, non-intercepting papers", () => {
  const css = readFileSync(resolve("styles/project-folders.css"), "utf8");
  assert.match(css, /\.project-folder__paper\s*\{/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /\.project-folder__link:focus-visible/);
  assert.match(css, /\.project-folder:focus-within/);
  assert.match(css, /\.project-folder-stack__cards\s*\{[\s\S]*?display:\s*flex/);
  assert.match(css, /\.project-folder \+ \.project-folder\s*\{\s*margin-block-start:\s*calc\(-1 \* var\(--folder-overlap\)\)/);
  assert.doesNotMatch(css, /will-change:|preserve-3d|pointermove|overflow-x:\s*auto/);
});

test("native folder links do not intercept mouse, touch or keyboard activation", () => {
  const controller = readFileSync(resolve("js/core/project-folder-interactions.js"), "utf8");
  const html = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  assert.doesNotMatch(controller, /pointermove|preventDefault|touchPreview|clientY|indexAt/);
  assert.match(controller, /native/);
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    assert.match(html, new RegExp('data-slug="' + slug + '"'));
    assert.match(html, new RegExp('href="work/' + slug + '\\.html"'));
  }
});
test("folder reveal only animates compositor-friendly transform and opacity", () => {
  const css = readFileSync(resolve("styles/folder-interactions.css"), "utf8");
  assert.match(css, /transition:\s*transform 550ms/);
  assert.match(css, /opacity 400ms ease/);
  assert.doesNotMatch(css, /(?:^|,)\s*filter\s+\d+ms/m);
});

test("Home matches the Work landscape folder construction", () => {
  const html = renderHomeProjectList(SITE.projects, SITE.caseStudies);
  assert.match(html, /home-folder-stack__cards/);
  assert.deepEqual([...html.matchAll(/href="work\/([^"]+\.html)"/g)].map(match => match[1]),
    ["tedx-rsu.html", "rivo.html", "chopbox.html"]);
  assert.doesNotMatch(html, /project-folder__spine/);
  assert.equal((html.match(/class="project-folder__paper project-folder__paper--[1-5]"/g) || []).length, 15);
  assert.doesNotMatch(html, /project-roster__row|folder-rack__/);
});

test("work and home share a mobile-first gallery with always-visible evidence", () => {
  const css = readFileSync(resolve("styles/visitor-journey.css"), "utf8");
  const home = renderHomeProjectList(SITE.projects, SITE.caseStudies);
  const work = renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(min-width:40em\)/);
  assert.match(css, /@media \(min-width:72em\)/);
  for (const html of [home, work]) assert.equal((html.match(/class="project-folder__visual"/g) || []).length, 3);
});
