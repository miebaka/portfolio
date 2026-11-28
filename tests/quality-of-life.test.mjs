import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { replaceSectionHash } from "../js/core/section-links.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { SITE } from "../data/site.js";

const root = new URL("../", import.meta.url);

test("section links replace the current URL without growing browser history", () => {
  let next = "";
  const historyImpl = {
    state: { retained: true },
    replaceState(state, title, url) {
      assert.deepEqual(state, this.state);
      next = String(url);
    },
  };
  const locationImpl = { href: "https://example.test/work/rivo.html" };
  assert.equal(replaceSectionHash("system", { historyImpl, locationImpl }), true);
  assert.equal(next, "https://example.test/work/rivo.html#system");
});

test("case studies expose evidence states, print and inspectable media hooks", () => {
  const html = renderCaseMarkup(SITE, "rivo", "../");
  assert.match(html, /data-evidence-lens/);
  assert.match(html, /data-evidence-state="documented"/);
  assert.match(html, /data-evidence-state="proposed"/);
  assert.match(html, /data-evidence-state="unverified"/);
  assert.match(html, /data-print-case/);
  assert.match(html, /class="case-gallery-flow"/);
});

test("title fitting measures the rendered title, not a hard-coded home name", async () => {
  const source = await readFile(new URL("js/main.js", root), "utf8");
  assert.match(source, /probe\.textContent = name\.textContent\.trim\(\)/);
  assert.doesNotMatch(source, /probe\.textContent = "Miebaka Joshua"/);
});

test("experiments index uses a coherent modal contract", async () => {
  const html = await readFile(new URL("experiments.html", root), "utf8");
  const source = await readFile(new URL("js/render/experiments.js", root), "utf8");
  assert.match(html, /role="dialog"\s+aria-modal="true"/);
  assert.match(source, /setAttribute\("inert", ""\)/);
  assert.match(source, /removeAttribute\("inert"\)/);
});

test("print mode and the CSS marquee are part of the shipped stylesheet contract", async () => {
  const main = await readFile(new URL("styles/main.css", root), "utf8");
  const print = await readFile(new URL("styles/print.css", root), "utf8");
  const projects = await readFile(new URL("js/render/projects.js", root), "utf8");
  assert.match(main, /@import url\("print\.css"\) print/);
  assert.match(print, /@media print/);
  assert.doesNotMatch(projects, /velocity \* \.35|translate3d\(/);
});
