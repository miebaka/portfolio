import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

async function walk(dir, suffix = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path, suffix));
    else if (!suffix || path.endsWith(suffix)) files.push(path);
  }
  return files;
}

test("featured projects are publishable and have real cover imagery", () => {
  const featured = SITE.projects.filter((project) => project.featured);
  assert.ok(featured.length >= 3);
  for (const project of featured) {
    assert.notEqual(project.caseReady, false, project.title + " is not case-ready");
    assert.ok(project.cover, project.title + " has no cover image");
    assert.ok(SITE.caseStudies[project.slug]?.media?.every((item) => item.src), project.title + " contains placeholder media");
  }
});

test("every production page has essential metadata and one heading", async () => {
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    assert.match(html, /<meta name="description"/i, file);
    if (!file.endsWith("404.html")) assert.match(html, /<link rel="canonical"/i, file);
    assert.match(html, /<main\b/i, file);
    assert.match(html, /class="skip-link"/i, file);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, file);
  }
});

test("case studies ship complete HTML before JavaScript runs", async () => {
  for (const [slug, study] of Object.entries(SITE.caseStudies)) {
    const html = await readFile(join(dist, "work", `${slug}.html`), "utf8");
    assert.match(html, /data-prerendered="true"/);
    assert.match(html, /<dt>My role<\/dt>/);
    if (study.media?.length) assert.ok((html.match(/<img\b/g) || []).length >= 8, slug);
    assert.doesNotMatch(html, /filled by js|placeholder/i);
  }
});

test("production CSS is bundled and dead runtime modules are absent", async () => {
  const cssFiles = await walk(join(dist, "styles"), ".css");
  assert.deepEqual(cssFiles, [join(dist, "styles", "main.css")]);
  const css = await readFile(cssFiles[0], "utf8");
  assert.doesNotMatch(css, /@import/);
  assert.match(css, /--accent:/);
  assert.match(css, /font-family:\s*"BIZ UDPMincho"/);
  assert.match(css, /font-family:\s*"Schibsted Grotesk"/);
  assert.match(css, /font-family:\s*"Josefin Sans"/);
  assert.match(css, /font-family:\s*"Material Symbols Outlined"/);
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const value = match[1];
    if (/^(?:data:|https?:|#|%23)/.test(value)) continue;
    await access(resolve(join(dist, "styles"), value));
  }
  for (const file of ["scroll.js", "split-text.js", "hero-parallax.js", "work-preview.js"]) {
    await assert.rejects(access(join(dist, "js", "core", file)));
  }
  await access(join(dist, "js", "core", "decision-field.js"));
  await access(join(dist, "assets", "vendor", "three.module.js"));
  await access(join(dist, "assets", "vendor", "three.core.js"));
  await assert.rejects(access(join(dist, "node_modules")));
});

test("ultramarine identity stays within its documented visual language", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /--ref-ultramarine:#002080/);
  assert.match(css, /--ref-paper:#f8f9fc/);
  assert.match(css, /--sys-color-primary:var\(--ref-ultramarine\)/);
  assert.match(css, /--sys-color-tertiary:var\(--ref-coral-30\)/);
  assert.match(css, /--sys-color-focus:var\(--ref-coral-30\)/);
  assert.match(css, /font-family:"Borges"/);
  assert.doesNotMatch(css, /gradient\(/i);
  assert.doesNotMatch(css, /#(?:d7ff64|e96843|355cff|001c12|005b44|ff75aa|f4efec)\b/i);
  assert.doesNotMatch(css, /filter:saturate/i);
});

test("documented interface colour pairs meet a 7:1 contrast floor", () => {
  const luminance = (hex) => {
    const channels = hex.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16) / 255);
    const linear = channels.map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
  };
  const contrast = (a, b) => {
    const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (lighter + .05) / (darker + .05);
  };
  const lightSurfaces = ["F8F9FC", "EFF1F6", "ECEEF3", "F2F3F8"];
  const darkSurfaces = ["07112B", "0C1730", "111B33", "172138"];
  for (const foreground of ["07112B", "3C4661", "002080", "1C3DA4", "83251D", "8F0B28"])
    for (const surface of lightSurfaces) assert.ok(contrast(foreground, surface) >= 7, `${foreground} on ${surface}`);
  for (const foreground of ["F8F9FC", "C3C6CF", "B1C5FF", "FFA08F", "FF9E9F"])
    for (const surface of darkSurfaces) assert.ok(contrast(foreground, surface) >= 7, `${foreground} on ${surface}`);
  for (const [foreground, background] of [["F8F9FC", "002080"], ["032485", "B1C5FF"], ["002080", "E8EEFF"]])
    assert.ok(contrast(foreground, background) >= 7, `${foreground} on ${background}`);
});

test("rejected homepage language cannot return unnoticed", async () => {
  const html = await readFile(join(dist, "index.html"), "utf8");
  for (const phrase of [
    "Independent practice",
    "Brand & visual designer",
    "Position 01",
    "Brand thinking should survive",
    "Open to remote roles",
    "Three decisions. Three systems.",
    "From the first question to the final file."
  ]) assert.doesNotMatch(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.match(html, /Hi, I&rsquo;m Miebaka/);
  assert.match(html, /Over the last seven years/);
});

test("homepage hierarchy and motion affordances cannot regress", async () => {
  const html = await readFile(join(dist, "index.html"), "utf8");
  const projects = await readFile(join(dist, "js", "render", "projects.js"), "utf8");
  const sections = await readFile(join(dist, "js", "render", "sections.js"), "utf8");
  const footer = await readFile(join(dist, "js", "render", "footer.js"), "utf8");
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");

  assert.doesNotMatch(html, /Curiosity is part of the job/i);
  assert.doesNotMatch(html, /swiss-selected__all|View all work/i);
  assert.match(projects, /work-flick__item--more/);
  assert.doesNotMatch(projects, /work-flick__category|work-flick__action|View project/);
  assert.match(projects, /client-marquee__track/);
  assert.match(projects, /aria-hidden="true"/);
  assert.match(sections, /Evidence:/);
  assert.doesNotMatch(footer, /mailto:/);
  assert.ok(css.includes('.site-nav a,.btn,.hero-noir__cta,.home-close__link,.work-flick__item,.writing-item__link,.case-next__link,.site-footer a{text-decoration:none}'));
  assert.match(css, /\.site-footer__signature[^}]+opacity:\.48/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)[^{]*\{\.work-flick__more-arrow\{animation:none\}/);
});

test("production language avoids typographic dash shortcuts", async () => {
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    const visibleSource = html
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style>/gi, "");
    assert.doesNotMatch(visibleSource, /&(?:m|n)dash;|[—–]/, file);
  }
});

test("Vercel configuration is valid and serves the static build", async () => {
  const config = JSON.parse(await readFile(join(root, "vercel.json"), "utf8"));
  assert.equal(config.outputDirectory, "dist");
  assert.ok(config.headers?.length);
});

test("portfolio depth features are present without depending on JavaScript for content", async () => {
  const work = await readFile(join(dist, "work.html"), "utf8");
  assert.match(work, /data-project-archive/);
  assert.doesNotMatch(work, /data-mount="work-grid"/);
  assert.doesNotMatch(work, /Work \/ 2019/);
  for (const slug of Object.keys(SITE.caseStudies)) {
    const html = await readFile(join(dist, "work", `${slug}.html`), "utf8");
    assert.match(html, /data-case-view="brief"/);
    assert.match(html, /data-case-view="full"/);
    assert.match(html, /Full study/);
  }
});

test("all local HTML assets and links resolve", async () => {
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(/(?:\shref|\ssrc)="([^"]+)"|\ssrcset="([^"]+)"/g)) {
      const raw = match[1] || match[2];
      const values = match[2] ? raw.split(",").map(item => item.trim().split(/\s+/)[0]) : [raw];
      for (const value of values) {
        if (/^(?:https?:|mailto:|#|data:)/.test(value)) continue;
        const clean = decodeURIComponent(value.split(/[?#]/)[0]);
        const target = clean.startsWith("/") ? join(dist, clean) : resolve(dirname(file), clean);
        await access(target);
      }
    }
  }
});

test("CSP permits every executable inline script", async () => {
  const policy = await readFile(join(root, "netlify.toml"), "utf8");
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    for (const [, script] of html.matchAll(/<script(?![^>]*src)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
      const hash = createHash("sha256").update(script).digest("base64");
      assert.match(policy, new RegExp(hash.replace(/[+/]/g, "\\$&")), file);
    }
  }
});

test("sitemap does not claim dates it cannot maintain", async () => {
  assert.doesNotMatch(await readFile(join(dist, "sitemap.xml"), "utf8"), /<lastmod>/);
});

test("public case studies do not expose metric-shaped decoration", () => {
  for (const study of Object.values(SITE.caseStudies)) {
    assert.equal("metrics" in (study.outcome || {}), false, study.title + " still defines outcome metrics");
  }
});

test("production build excludes source and review directories", async () => {
  const netlify = await readFile(new URL("../netlify.toml", import.meta.url), "utf8");
  assert.match(netlify, /publish\s*=\s*"dist"/);
  for (const path of ["reports", "Samples from Figma", "klat_magazine", "docs", "graphify-out"]) {
    await assert.rejects(access(new URL("../dist/" + path, import.meta.url)));
  }
  await access(new URL("../dist/work/christian-poster-a-week.html", import.meta.url));
  await assert.rejects(access(new URL("../dist/data/drafts.js", import.meta.url)));
  await assert.rejects(access(new URL("../dist/js/core/footer-scene.js", import.meta.url)));
  const publicData = await readFile(new URL("../dist/data/site.js", import.meta.url), "utf8");
  assert.match(publicData, /Poster A Week|christian-poster-a-week/);
});
