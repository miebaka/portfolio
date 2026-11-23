import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const dist = (path) => readFileSync(resolve("dist", path), "utf8");
const readSource = (path) => readFileSync(resolve(path), "utf8");
const origin = "https://miebaka-portfolio.vercel.app/";
const personId = origin + "#miebaka-joshua";
const pages = [
  "index.html", "about.html", "work.html", "work/rivo.html",
  "work/tedx-rsu.html", "work/chopbox.html", "essays.html",
  "essays/designing-for-disability-in-nigeria.html",
  "essays/when-the-swoosh-lost-its-soul.html", "process.html", "contact.html",
  "experiments.html", "accessibility.html", "privacy.html"
];

const schema = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .flatMap((match) => { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : [value]; });

test("every published page has one canonical, descriptive metadata and extractable JSON-LD", () => {
  for (const path of pages) {
    const html = dist(path);
    const canonical = origin + (path === "index.html" ? "" : path);
    assert.equal((html.match(/<link rel="canonical"/g) || []).length, 1, path);
    assert.ok(html.includes('<link rel="canonical" href="' + canonical + '">'), path);
    assert.match(html, /<title>[^<]{12,}<\/title>/, path);
    assert.match(html, /<meta name="description" content="[^"]{50,}">/, path);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, path);
    assert.ok(schema(html).length > 0, path);
    for (const match of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(match[0], /\balt="[^"]*"/, path + ": " + match[0].slice(0, 80));
    }
  }
});
test("Person identity is shared by website, authored cases and essays", () => {
  const home = schema(dist("index.html"));
  const person = home.find((x) => x["@type"] === "Person");
  assert.equal(person?.["@id"], personId);
  const website = home.find((x) => x["@type"] === "WebSite");
  assert.equal(website?.publisher?.["@id"], personId);
  for (const path of [...pages.filter((p) => p.startsWith("work/")), ...pages.filter((p) => p.startsWith("essays/"))]) {
    const work = schema(dist(path)).find((x) => ["CreativeWork", "Article"].includes(x["@type"]));
    assert.ok(work, path);
    assert.equal((work.creator || work.author)?.["@id"], personId, path);
    assert.ok(work.mainEntityOfPage?.["@id"], path);
    const metaDescription = dist(path).match(/<meta name="description" content="([^"]+)">/)?.[1];
    assert.equal(work.description, metaDescription.replaceAll("&amp;", "&"), path);
    const openGraphAlt = dist(path).match(/<meta property="og:image:alt" content="([^"]+)">/)?.[1];
    const twitterAlt = dist(path).match(/<meta name="twitter:image:alt" content="([^"]+)">/)?.[1];
    assert.equal(twitterAlt, openGraphAlt, path);
    assert.ok(work.image?.startsWith(origin), path);
    assert.ok(schema(dist(path)).some((x) => x["@type"] === "BreadcrumbList"), path);
  }
});
test("case summaries specify supported scope and proposed versus delivered work", () => {
  for (const slug of ["rivo", "tedx-rsu", "chopbox"]) {
    const html = dist("work/" + slug + ".html");
    assert.match(html, /class="case-lead-proof__status container"/, slug);
    assert.match(html, /class="case-opening__essentials"/, slug);
  }
  assert.match(dist("work/chopbox.html"), /manufacture and sales are unverified/);
  assert.match(dist("work/rivo.html"), /public production is not established/);
});
test("directory aliases redirect without intercepting individual asset paths", () => {
  const config = JSON.parse(readSource("vercel.json"));
  for (const [from, to] of [
    ["/index.html", "/"], ["/work", "/work.html"], ["/work/", "/work.html"],
    ["/essays", "/essays.html"], ["/essays/", "/essays.html"]
  ]) assert.ok(config.redirects.some((r) => r.source === from && r.destination === to && r.permanent === true), from);
  assert.ok(config.redirects.every((r) => !/^\/(?:assets|styles)\//.test(r.source)),
    "Do not accidentally redirect image, font, JS or CSS asset subpaths");
});
test("sitemap and llms.txt agree with the published case and article URLs", () => {
  const xml = dist("sitemap.xml");
  const inventory = dist("llms.txt");
  for (const path of pages.filter((p) => p.startsWith("work/") || p.startsWith("essays/"))) {
    assert.ok(xml.includes(origin + path), path);
    assert.ok(inventory.includes(origin + path), path);
  }
});
