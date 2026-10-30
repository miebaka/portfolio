import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { SITE, CONTENT } from "../data/site.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { validateContent } from "../scripts/content-schema.mjs";

const root = new URL("../", import.meta.url);
const chapterIds = ["context", "decision", "system", "applications", "reflection"];
const markup = () => renderCaseMarkup(SITE, "tedx-rsu", "../");
const reject = (change, code, path) => {
  const content = structuredClone(CONTENT);
  change(content.caseStudies["tedx-rsu"], content);
  const result = validateContent(content);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === code && error.path === `caseStudies.tedx-rsu.${path}`), JSON.stringify(result));
};

test("published narratives cannot lose their proposition, hero or supported facts", () => {
  reject(study => { study.tagline = ""; }, "CASE_FIELD_REQUIRED", "tagline");
  reject(study => { delete study.hero; }, "CASE_HERO_INVALID", "hero");
  reject(study => { study.hero = "unknown"; }, "CASE_HERO_INVALID", "hero");
  reject(study => { delete study.facts; }, "CASE_FACTS_REQUIRED", "facts");
  for (const field of ["role", "delivered"]) reject(study => { study.facts[field] = ""; }, "CASE_FACT_REQUIRED", `facts.${field}`);
});

test("published narratives reject missing, reordered, duplicated or empty chapters", () => {
  reject(study => { delete study.chapters; }, "CASE_CHAPTERS_INVALID", "chapters");
  reject(study => { study.chapters.pop(); }, "CASE_CHAPTER_ORDER_INVALID", "chapters");
  reject(study => { [study.chapters[0], study.chapters[1]] = [study.chapters[1], study.chapters[0]]; }, "CASE_CHAPTER_ORDER_INVALID", "chapters");
  reject(study => { study.chapters[1].id = "context"; }, "CASE_CHAPTER_ORDER_INVALID", "chapters");
  reject(study => { study.chapters[4].body = []; }, "CASE_CHAPTER_BODY_INVALID", "chapters[4].body");
  reject(study => { study.chapters[0].body = [null]; }, "CASE_CHAPTER_BODY_INVALID", "chapters[0].body");
  reject(study => { study.chapters[0].label = ""; }, "CASE_CHAPTER_LABEL_REQUIRED", "chapters[0].label");
});

test("published media references cannot silently disappear or duplicate a plate", () => {
  reject(study => { study.chapters[2].media = ["missing"]; }, "CASE_CHAPTER_MEDIA_INVALID", "chapters[2].media");
  reject(study => { study.chapters[2].media = [study.hero]; }, "CASE_MEDIA_REUSED", "chapters[2].media");
  reject(study => { study.chapters[2].media = {}; }, "CASE_CHAPTER_MEDIA_INVALID", "chapters[2].media");
  reject(study => { study.media[1].src = study.media[0].src; }, "MEDIA_SOURCE_DUPLICATE", "media[1].src");
  reject(study => { study.media[0].w = 0; }, "MEDIA_DIMENSIONS_INVALID", "media[0].w");
  reject(study => { study.media[0].alt = ""; }, "MEDIA_ALT_REQUIRED", "media[0].alt");
  reject(study => { delete study.media[0].caption; }, "MEDIA_CAPTION_REQUIRED", "media[0].caption");
  reject(study => { delete study.media[0].loading; }, "MEDIA_LOADING_REQUIRED", "media[0].loading");
});

test("published narratives need one usable next destination and allow omitted unverified credits and outcomes", () => {
  reject(study => { delete study.next; }, "CASE_NEXT_REQUIRED", "next");
  reject(study => { study.next.title = ""; }, "CASE_NEXT_TITLE_REQUIRED", "next.title");
  reject(study => { study.next.slug = "tedx-rsu"; }, "CASE_NEXT_SELF", "next.slug");
  reject(study => { study.next.slug = "missing"; }, "NEXT_PROJECT_MISSING", "next.slug");
  assert.equal(validateContent(structuredClone(CONTENT)).ok, true);
});

test("active next destinations require a published project and published case", () => {
  reject((study, content) => { content.projects.find(project => project.slug === "chopbox").status = "coming-soon"; }, "NEXT_PROJECT_UNPUBLISHED", "next.slug");
  reject((study, content) => { content.caseStudies.chopbox.status = "draft"; }, "NEXT_CASE_UNPUBLISHED", "next.slug");
  reject(study => { study.next.interactive = "false"; }, "CASE_NEXT_INTERACTIVE_INVALID", "next.interactive");
});

test("TEDx opens with its proposition, hero and supported project facts", () => {
  const html = markup();
  assert.doesNotMatch(html, /case-locked|aria-disabled/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const opening = html.indexOf('class="case-statement"');
  const hero = html.indexOf('case-shot--hero');
  const facts = html.indexOf('<dl class="case-facts">');
  assert.ok(opening >= 0 && opening < hero && hero < facts);
  assert.match(html, /A global event system given a distinct pause-and-reflect rhythm\./);
  assert.match(html, /tedx-rsu-campus-banner-1080\.jpg/);
  assert.match(html, /<dt>My role<\/dt><dd>Identity design, creative direction and print<\/dd>/);
  assert.match(html, /<dt>Year<\/dt><dd>2023<\/dd>/);
  assert.match(html, /<dt>Deliverables<\/dt><dd>[^<]+<\/dd>/);
  assert.doesNotMatch(html, /<dt>Collaborators<\/dt>|<dt>Outcomes<\/dt>/);
});

test("Rivo publishes as an evidence-bounded identity case", () => {
  const study = SITE.caseStudies.rivo;
  const markup = renderCaseMarkup(SITE, "rivo");
  assert.equal(study.status, "published");
  assert.equal(SITE.projects.find(project => project.slug === "rivo").status, "published");
  assert.match(markup, /How can access feel like a brand position\?/);
  assert.match(markup, /<dt>Published<\/dt><dd>2025<\/dd>/);
  assert.match(markup, /application visualisation/i);
  assert.match(markup, /not presented as evidence of later team adoption/i);
  assert.match(markup, /What this case can prove/);
  assert.match(markup, /Bounded evidence/);
  assert.match(markup, /href="\.\.\/work\/tedx-rsu.html"/);
});

test("ChopBox publishes without converting presentation visualisations into production claims", () => {
  const study = SITE.caseStudies.chopbox;
  const html = renderCaseMarkup(SITE, "chopbox");
  assert.equal(study.status, "published");
  assert.equal(SITE.projects.find(project => project.slug === "chopbox").status, "published");
  assert.match(html, /does this make the food feel worth ordering/i);
  assert.match(html, /not presented as photographs of produced rollout materials/i);
  assert.match(html, /does not verify which applications entered production/i);
  assert.match(html, /Bounded evidence/);
  assert.doesNotMatch(html, /audience impact|sales|conversion|continued team use/i);
});

test("the complete narrative and chapter links follow the approved sequence", () => {
  const html = markup();
  const sections = [...html.matchAll(/<section class="case-chapter" id="([^"]+)" aria-labelledby="([^"]+)">/g)];
  assert.deepEqual(sections.map(match => match[1]), chapterIds);
  for (const [, id, labelId] of sections) {
    assert.equal(labelId, `${id}-title`);
    assert.match(html, new RegExp(`<h2 id="${labelId}">[^<]+<\\/h2>`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
  assert.doesNotMatch(html, /id="outcomes"|id="result"/);
  assert.ok(html.indexOf('id="reflection"') < html.indexOf('class="case-next'));
});

test("all owner media is shown once, with intrinsic dimensions, alternatives and factual captions", async () => {
  const html = markup();
  const images = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  assert.equal(images.length, 8);
  assert.equal((html.match(/<figcaption\b/g) || []).length, 8);
  assert.deepEqual([...html.matchAll(/class="case-shot__plate">([^<]+)</g)].map(match => match[1]), ["PLATE 01", "PLATE 02", "PLATE 03", "PLATE 04", "PLATE 05", "PLATE 06", "PLATE 07", "PLATE 08"]);
  for (const media of SITE.caseStudies["tedx-rsu"].media) {
    const image = images.find(image => image.includes(`${media.src}-`));
    assert.ok(image, media.src);
    assert.match(image, new RegExp(`width="${media.w}" height="${media.h}"`));
    assert.match(image, /alt="[^"]{30,}"/);
    assert.ok(media.caption?.length > 20, `${media.src} needs context beyond its label`);
    const source = new URL(`assets/images/work/tedx-rsu/${media.src.replace("tedx-rsu-", "")}.jpg`, root);
    const actual = await sharp(source.pathname).metadata();
    assert.equal(media.w, actual.width);
    assert.equal(media.h, actual.height);
  }
  const hero = images.find(image => image.includes("tedx-rsu-campus-banner-"));
  assert.match(hero, /loading="eager" fetchpriority="high"/);
  assert.ok(images.filter(image => image !== hero).every(image => image.includes('loading="lazy"')));
});

test("the next published project is an active destination", () => {
  const html = markup();
  assert.match(html, /aria-label="Next project"/);
  assert.match(html, /href="\.\.\/work\/chopbox\.html"/);
  assert.doesNotMatch(html, /class="case-next__state"/);
});

test("a published usable next case is linked while an unavailable case stays noninteractive", () => {
  const site = structuredClone(SITE);
  site.projects.find(project => project.slug === "chopbox").status = "coming-soon";
  site.caseStudies["tedx-rsu"].next.interactive = false;
  assert.doesNotMatch(renderCaseMarkup(site, "tedx-rsu"), /href="[^\"]*chopbox\.html"/);
  site.projects.find(project => project.slug === "chopbox").status = "published";
  site.caseStudies.chopbox.status = "published";
  delete site.caseStudies["tedx-rsu"].next.interactive;
  const html = renderCaseMarkup(site, "tedx-rsu");
  assert.match(html, /href="\.\.\/work\/chopbox\.html">Next project: ChopBox<\/a>/);
  assert.doesNotMatch(html, /class="case-next__state"/);
});

test("chapter rendering honours authored media references and escapes content", () => {
  const fixture = {
    projects: [{ slug: "sample", title: "Sample", year: "2023", status: "published" }],
    caseStudies: {
      sample: {
        status: "published", title: "Sample", tagline: 'A <clear> proposition', hero: "sample-wide",
        facts: { role: "Design", delivered: "Identity", collaborators: "A & B" },
        media: [{ src: "sample-wide", label: "Wide", w: 1440, h: 810, alt: 'A <wide> image', caption: "The final & approved application." }, { src: "sample-tall", label: "Tall", w: 1240, h: 1550, alt: "The complete tall application.", caption: "All of the tall application." }],
        chapters: [{ id: "context", label: "Context", title: "The <brief>", body: ["Keep <script> readable."], media: ["sample-tall"] }]
      }
    }
  };
  const html = renderCaseMarkup(fixture, "sample", "./");
  assert.match(html, /A &lt;clear&gt; proposition/);
  assert.match(html, /Keep &lt;script&gt; readable\./);
  assert.match(html, /<dt>Collaborators<\/dt><dd>A &amp; B<\/dd>/);
  assert.match(html, /sample-tall-1080\.jpg/);
  assert.match(html, /The final &amp; approved application\./);
  assert.doesNotMatch(html, /<script>|undefined/);
});

test("the built page contains the whole case before JavaScript runs", async () => {
  execFileSync(process.execPath, ["scripts/build-site.mjs"], { cwd: root, stdio: "pipe" });
  const html = await readFile(new URL("dist/work/tedx-rsu.html", root), "utf8");
  const article = html.match(/<article class="case" data-mount="case" data-prerendered="true">([\s\S]*?)<\/article>/)?.[1];
  assert.ok(article);
  assert.equal(article, markup());
  for (const id of chapterIds) assert.match(article, new RegExp(`id="${id}"`));
  assert.match(article, /<figcaption/);
  assert.match(article, /href="\.\.\/work\/chopbox\.html">Next project: ChopBox<\/a>/);
  assert.match(html, /og:image" content="https:\/\/miebaka-portfolio\.vercel\.app\/assets\/images\/optimized\/tedx-rsu-campus-banner-1080\.jpg"/);
  const source = await readFile(new URL("work/tedx-rsu.html", root), "utf8");
  assert.equal(source.match(/<article class="case" data-mount="case">([\s\S]*?)<\/article>/)?.[1].trim(), markup(), "The authored shell also supplies the full narrative without JavaScript.");
});
