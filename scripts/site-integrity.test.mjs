import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
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
    assert.match(html, /viewport-fit=cover/i, file);
    assert.match(html, /interactive-widget=resizes-content/i, file);
    assert.equal((html.match(/<meta name="theme-color"/gi) || []).length, 2, file);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, file);
  }
});

test("case studies ship complete reading content before JavaScript runs", async () => {
  for (const slug of Object.keys(SITE.caseStudies)) {
    const html = await readFile(join(dist, "work", `${slug}.html`), "utf8");
    assert.match(html, /data-prerendered="true"/);
    assert.match(html, /class="case"/);
    assert.match(html, /class="case-index"/);
    assert.doesNotMatch(html, /Coming soon/);
    assert.doesNotMatch(html, /filled by js|placeholder/i);
  }
});

test("TEDx flagship preserves its verified concept, credits and evidence sequence", async () => {
  const html = await readFile(join(dist, "work", "tedx-rsu.html"), "utf8");
  const source = await readFile(join(root, "data", "site.js"), "utf8");
  for (const phrase of [
    "Pause was not a symbol to place on the work",
    "Reflect", "Reconsider", "Reward",
    "Carl Osimiri", "Onari Georgewill", "Anna Brands",
    "18 February 2023", "Student Dialogue Centre"
  ]) assert.match(html, new RegExp(phrase));
  assert.match(html, /case-thesis/);
  assert.match(html, /loading="eager"/);
  assert.match(source, /chapter: "decision"/);
  assert.match(source, /chapter: "system"/);
  assert.match(source, /chapter: "applications"/);
  assert.match(source, /chapter: "result"/);
  assert.doesNotMatch(html, /views|appreciations|likes|engagement rate/i);
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
  const displayFont = await stat(join(dist, "assets", "fonts", "BIZUDPMincho-Latin.ttf"));
  assert.ok(displayFont.size < 150_000, `display font is ${displayFont.size} bytes`);
  await assert.rejects(access(join(dist, "assets", "fonts", "BIZUDPMincho-Regular.ttf")));
});

test("ultramarine identity stays within its documented visual language", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /--ref-ultramarine:#002080/);
  assert.match(css, /--ref-paper:#f8f9fc/);
  assert.match(css, /--sys-color-primary:var\(--ref-ultramarine\)/);
  assert.match(css, /--sys-color-tertiary:var\(--ref-coral-30\)/);
  assert.match(css, /--sys-color-focus:var\(--ref-coral-30\)/);
  assert.doesNotMatch(css, /font-family:"Borges"/);
  assert.doesNotMatch(css, /\.pl--[cmy]\b|data-plates/i);
  assert.doesNotMatch(css, /#(?:d7ff64|e96843|355cff|001c12|005b44|ff75aa|f4efec)\b/i);
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
  const services = await readFile(join(dist, "services.html"), "utf8");
  const footer = await readFile(join(dist, "js", "render", "footer.js"), "utf8");
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");

  assert.doesNotMatch(html, /Curiosity is part of the job/i);
  assert.match(html, /View all work/i);
  assert.match(projects, /work-flick__item--more/);
  assert.doesNotMatch(projects, /work-flick__category|work-flick__action|View project/);
  assert.match(projects, /client-marquee__track/);
  assert.match(projects, /client-marquee__control/);
  assert.match(projects, /aria-hidden="true"/);
  assert.doesNotMatch(sections, /Evidence:/);
  assert.doesNotMatch(html, /Evidence:/);
  assert.doesNotMatch(services, /Evidence:/);
  assert.match(services, /data-mount="capabilities"/);
  assert.match(projects, /work-flick__link/);
  assert.match(projects, /PAUSE LOGOS/);
  assert.doesNotMatch(projects, /i === 0 \? ' is-active'/);
  assert.doesNotMatch(footer, /mailto:/);
  assert.ok(css.includes('.site-nav a,.btn,.work-flick__item,.writing-item__link,.case-next__link,.site-footer a{text-decoration:none}'));
  assert.match(css, /\.site-footer__signature-canvas/);
  assert.match(css, /\.client-marquee\.is-paused/);
  assert.match(html, /data-mount="now-playing"/);
  assert.match(css, /\.now-playing-pill\s*\{/);
  assert.match(css, /\.motion-fab\s*\{/);
  assert.match(css, /\.home-landing\s*\{[^}]*position:\s*sticky/);
  assert.match(css, /\.proof-about__grid\{display:grid/);
  assert.match(css, /\.record__track\{/);
  const orderedIds = ["about", "work", "services", "writing", "explorations", "community", "contact"];
  let cursor = -1;
  for (const id of orderedIds) {
    const next = html.indexOf(`id="${id}"`);
    assert.ok(next > cursor, `${id} is out of order on the homepage`);
    cursor = next;
  }
});

test("the adaptive index has one desktop destination mechanism and persistent Print Screen control", async () => {
  const navigation = await readFile(join(dist, "js", "render", "navigation.js"), "utf8");
  assert.doesNotMatch(navigation, /portfolio-nav__links/);
  assert.match(navigation, /portfolio-nav__theme/);
  assert.match(navigation, /PRINT/);
  assert.match(navigation, /SCREEN/);
  assert.match(navigation, /motion-fab/);
  assert.doesNotMatch(navigation, /portfolio-index__label">MOTION/);
  assert.match(navigation, /localStorage\.setItem\("color-theme", root\.dataset\.theme\)/);
  assert.deepEqual(SITE.menu.map(item => item.label), ["About", "Work", "Services", "Writing", "Explorations", "Community", "Contact"]);
});

test("interactive controls share the documented role system", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /\.btn\{[^}]*min-height:3rem/);
  assert.match(css, /\.site-nav__menu-btn,\.theme-toggle\{[^}]*min-height:2\.75rem/);
  assert.match(css, /\.btn:active\{transform:scale\(\.97\)/);
  assert.equal((css.match(/^\.btn\{/gm) || []).length, 1);
  assert.doesNotMatch(css, /\.btn--primary/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /@media\(hover:hover\) and \(pointer:fine\)/);
  assert.match(css, /@media\(hover:none\),\(pointer:coarse\)\{input,select,textarea\{font-size:16px/);
  const primaryMarkup = [
    await readFile(join(root, "index.html"), "utf8"),
    await readFile(join(root, "services.html"), "utf8"),
    await readFile(join(root, "contact.html"), "utf8"),
    await readFile(join(root, "js", "render", "projects.js"), "utf8"),
    await readFile(join(root, "js", "render", "case-markup.js"), "utf8")
  ].join("\n");
  assert.doesNotMatch(primaryMarkup, /class=["'`]btn\s+btn-/);
});

test("remaining proof behaviours stay dependency-free and retired effects stay retired", async () => {
  const source = await readFile(join(root, "js", "core", "proof-system.js"), "utf8");
  const navigation = await readFile(join(root, "js", "render", "navigation.js"), "utf8");
  const signature = await readFile(join(root, "js", "core", "footer-signature.js"), "utf8");
  const css = await readFile(join(root, "styles", "proof-system.css"), "utf8");
  const foundations = await readFile(join(root, "styles", "foundations.css"), "utf8");
  assert.doesNotMatch(source, /from\s+["']|import\s*\(/);
  assert.doesNotMatch(source, /press-crop|data\.proofPage|proof-folio/);
  assert.doesNotMatch(source, /proof-cursor|proof-portrait__dots|initReveals|initClock/);
  assert.match(source, /initDisclosures/);
  assert.match(source, /initNavSurface/);
  assert.doesNotMatch(source, /data-plates|misregistration|chroma/i);
  assert.doesNotMatch(navigation, /p\.\d|label:\s*"Cover"|label:\s*"Experience"/);
  assert.match(navigation, /SITE\.menu/);
  assert.doesNotMatch(css, /IBM Plex Mono|press-crop|\.proof-folio|\.proof-ink\{/);
  assert.match(signature, /host\.dataset\.signatureSrc/);
  assert.doesNotMatch(signature, /Borges/);
  assert.doesNotMatch(css, /data-motion="reduced"\] \.proof-cursor\{display:none/);
  assert.match(foundations, /feTurbulence/);
  await access(join(dist, "js", "core", "proof-system.js"));
});

test("alignment, service parity and article hierarchy stay systemic", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  const home = await readFile(join(dist, "index.html"), "utf8");
  const services = await readFile(join(dist, "services.html"), "utf8");
  const writing = await readFile(join(dist, "js", "render", "writing.js"), "utf8");
  const projects = await readFile(join(dist, "js", "render", "projects.js"), "utf8");
  assert.match(css, /main,\.site-footer\{text-align:left\}/);
  assert.match(home, /<h1 id="hero-title">I design brand systems, then build the tools that keep them intact\.<\/h1>/);
  assert.match(home, /class="home-profile container"/);
  assert.match(home, /Selected brands I&rsquo;ve worked with/);
  assert.doesNotMatch(home, /class="proof-ledger"/);
  assert.match(services, /data-mount="capabilities"/);
  assert.match(projects, /querySelectorAll\('\.work-flick__item'\)/);
  assert.match(projects, /system-list__row/);
  const sections = await readFile(join(dist, "js", "render", "sections.js"), "utf8");
  assert.match(sections, /proof-services__heading/);
  assert.match(sections, /<h2>Services<\/h2>/);
  assert.doesNotMatch(sections, /#002080|#1C3DA4|#E8EEFF|#83251D|#07112B/);
  const title = writing.indexOf('writing-item__title');
  const summary = writing.indexOf('writing-item__summary');
  const meta = writing.indexOf('writing-item__meta');
  assert.ok(title > -1 && title < summary && summary < meta);
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
    assert.doesNotMatch(html, /data-case-view|Brief view|Full study|Case study ·/);
    assert.match(html, /class="case"/);
    assert.doesNotMatch(html, /Coming soon/);
  }
});

test("checkpoint 6 routes ship as one complete editorial system", async () => {
  const routes = ["index.html", "work.html", "explorations.html", "community.html", "about.html", "services.html", "writing.html", "contact.html", "privacy.html", "404.html"];
  for (const route of routes) await access(join(dist, route));
  await assert.rejects(access(join(dist, "playground.html")));

  const explorations = await readFile(join(dist, "explorations.html"), "utf8");
  for (const label of ["PROMPT", "VISUAL DECISION", "DATE"]) assert.match(explorations, new RegExp(label));
  const community = await readFile(join(dist, "community.html"), "utf8");
  for (const label of ["FOR", "CONTRIBUTION", "ACCESS"]) assert.match(community, new RegExp(label));

  const about = await readFile(join(dist, "about.html"), "utf8");
  assert.match(about, /DOWNLOAD CV · PDF · 294 KB/);
  const cv = await stat(join(dist, "assets", "documents", "miebaka-joshua-cv.pdf"));
  assert.ok(cv.size > 250_000 && cv.size < 350_000);

  const contact = await readFile(join(dist, "contact.html"), "utf8");
  assert.match(contact, /action="\/api\/contact"/);
  assert.match(contact, /SEND ENQUIRY/);
  const endpoint = await readFile(join(root, "api", "contact.js"), "utf8");
  assert.match(endpoint, /https:\/\/api\.resend\.com\/emails/);
  assert.match(endpoint, /miebakakiki@gmail\.com/);

  const notFound = await readFile(join(dist, "404.html"), "utf8");
  assert.match(notFound, /data-decision-field/);
});

test("requested language and contact details stay canonical", async () => {
  const sourceFiles = [
    join(dist, "index.html"), join(dist, "about.html"), join(dist, "services.html"),
    join(dist, "contact.html"), join(dist, "writing.html"), join(dist, "privacy.html"),
    join(dist, "writing", "when-the-swoosh-lost-its-soul.html"),
    join(dist, "writing", "designing-for-disability-in-nigeria.html")
  ];
  const source = (await Promise.all(sourceFiles.map(file => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /hello@miebaka\.design|About \/ Practice|Writing \/ Notes|Contact \/ Start here|Services \/ What I do/);
  assert.doesNotMatch(source, /article-hero__tag|Brand Strategy<\/span>|Inclusive Design<\/span>/);
  assert.match(source, /miebakakiki@gmail\.com/);
  const home = await readFile(join(dist, "index.html"), "utf8");
  assert.match(home, /<h1 id="hero-title">I design brand systems, then build the tools that keep them intact\.<\/h1>/);
  assert.doesNotMatch(await readFile(join(root, "js", "render", "projects.js"), "utf8"), /work-flick__veil/);
  const projects = await readFile(join(root, "js", "render", "projects.js"), "utf8");
  assert.match(projects, /work-flick__link/);
  assert.match(projects, /!project\.href\?\.startsWith\('writing\/'\)/);
  const footer = await readFile(join(root, "js", "render", "footer.js"), "utf8");
  assert.match(footer, /site-footer__links/);
  assert.match(footer, /BASED IN/);
  assert.match(footer, /SOCIAL/);
  assert.match(footer, /SITE\.location/);
  assert.match(footer, /SITE\.socials/);
  assert.match(footer, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(footer, /Back to top/);
  assert.doesNotMatch(footer, /Colophon|BIZ UDPMincho/);
  assert.ok(footer.indexOf("BASED IN") < footer.indexOf("EXPLORE"));
  assert.ok(footer.indexOf("EXPLORE") < footer.indexOf("SOCIAL"));
  assert.match(await readFile(join(root, "js", "core", "footer-signature.js"), "utf8"), /drawImage\(artwork/);
  await access(join(dist, "js", "core", "footer-signature.js"));
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

test("retired source systems cannot return unnoticed", async () => {
  for (const path of [
    "styles/cohesion.css", "styles/editorial-system.css", "styles/swiss.css",
    "js/core/case-rail.js", "js/core/motion-director.js", "js/core/kinetic.js"
  ]) await assert.rejects(access(join(root, path)), path);
  const main = await readFile(join(root, "js", "main.js"), "utf8");
  const styles = await readFile(join(root, "styles", "main.css"), "utf8");
  assert.doesNotMatch(main, /kinetic|case-rail|motion-director/i);
  assert.equal((styles.match(/@import/g) || []).length, 5);
  assert.doesNotMatch(styles, /(?:base|components|sections|tokens)\//);
});
