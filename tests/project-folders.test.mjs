import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SITE } from "../data/site.js";
import {
  renderHomeProjectList,
  renderProjectFolderStackMarkup,
  renderProjectArchiveMarkup,
} from "../js/render/projects.js";

const names = ["Rivo Studio", "TEDx Rivers State University", "ChopBox"];
const sections = ["The Call", "The System", "What Survived", "First Contact", "The Results"];
const workMarkup = () => renderProjectFolderStackMarkup(SITE.projects, SITE.caseStudies);

test("Work publishes three genuine upright case-study links in year order", () => {
  const html = workMarkup();
  assert.match(html, /class="folder-rack folder-rack--work"/);
  assert.equal((html.match(/class="folder-rack__folder"/g) || []).length, 3);
  assert.deepEqual([...html.matchAll(/href="work\/([^"]+\.html)"/g)].map(match => match[1]),
    ["rivo.html", "tedx-rsu.html", "chopbox.html"]);
  for (const name of names)
    assert.match(html, new RegExp('aria-label="View ' + name + ' case study"'));
  assert.doesNotMatch(html, /DEMO|filing-cabinet|webgl|canvas/i);
});

test("Home and Work share five static sheets, tabs and five chapter labels", () => {
  for (const html of [workMarkup(), renderHomeProjectList(SITE.projects, SITE.caseStudies)]) {
    assert.equal((html.match(/class="folder-rack__sheet"/g) || []).length, 15);
    assert.equal((html.match(/class="folder-rack__tab"/g) || []).length, 3);
    assert.equal((html.match(/class="folder-rack__front"/g) || []).length, 3);
    assert.deepEqual([...html.matchAll(/class="folder-rack__tab" aria-hidden="true">(\d\d)</g)].map(match => match[1]),
      ["01", "02", "03"]);
    for (const section of sections)
      assert.equal(html.split(section).length - 1, 3);
    assert.doesNotMatch(html, /demo.*would open|Hisa Nigeria|Schoolinka/);
  }
});

test("Home uses the same folders in featured order and links to the full archive", () => {
  const html = renderHomeProjectList(SITE.projects, SITE.caseStudies);
  assert.match(html, /folder-rack--home/);
  assert.ok(html.indexOf('data-slug="tedx-rsu"') < html.indexOf('data-slug="rivo"'));
  assert.match(html, /href="work\.html">All work/);
});

test("unpublished case studies remain in progress without fake destination links", () => {
  const html = renderProjectArchiveMarkup(SITE.projects, "", SITE.caseStudies);
  assert.match(html, /project-archive__progress/);
  assert.match(html, /project-archive__collections/);
  assert.doesNotMatch(html, /href="work\/(?:kigoma-hotels|kiki-joshua-notepad|christian-poster-a-week)\.html"/);
});

test("Work has a functioning no-JS fallback with actual upright folders", () => {
  const html = readFileSync(resolve("work.html"), "utf8");
  assert.equal((html.match(/class="folder-rack__folder"/g) || []).length, 3);
  assert.equal((html.match(/class="folder-rack__sheet"/g) || []).length, 15);
  assert.doesNotMatch(html, /class="project-folder__link"|filing-cabinet|work-cabinet/i);
  assert.match(html, /href="styles\/main\.css"/);
  assert.doesNotMatch(html, /href="styles\/project-folders\.css"/);
});

test("folder animation uses logical hit-testing, keyboard focus and motion preferences", () => {
  const css = readFileSync(resolve("styles/folder-rack.css"), "utf8");
  const js = readFileSync(resolve("js/core/folder-rack.js"), "utf8");
  assert.match(css, /aspect-ratio:\s*\.66/);
  assert.match(css, /\.folder-rack__sheet\s*\{/);
  assert.match(css, /pointer-events:\s*none/);
  assert.match(css, /\.folder-rack__folder:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(js, /function indexAt\(x\)/);
  assert.match(js, /getBoundingClientRect\(\)\.left/);
  assert.match(js, /requestAnimationFrame/);
  assert.match(js, /pointerType === "touch"/);
  assert.match(js, /ResizeObserver/);
  assert.match(js, /function enter\(index\)/);
  assert.doesNotMatch(js, /DEMO|toast|return false/);
});