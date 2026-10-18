import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";
import { navigation } from "../data/navigation.js";
import * as projectRender from "../js/render/projects.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

test("homepage proof precedes biography in the source and built document", async () => {
  for (const directory of [root, dist]) {
    const html = await readFile(join(directory, "index.html"), "utf8");
    assert.ok(html.includes('id="selected-work"'));
    assert.ok(html.includes('id="profile"'));
    assert.ok(html.indexOf('id="selected-work"') < html.indexOf('id="profile"'));
  }
});

test("homepage keeps the approved section order without the retired practice-standard interstitial", async () => {
  for (const directory of [root, dist]) {
    const html = await readFile(join(directory, "index.html"), "utf8");
    const proof = html.indexOf('id="selected-work"');
    const biography = html.indexOf('id="profile"');
    const capabilities = html.indexOf('id="capabilities"');
    const journey = html.indexOf('class="journey"');
    const close = html.indexOf('class="home-close');
    assert.ok(proof < biography && biography < capabilities && capabilities < journey && journey < close, directory);
    assert.doesNotMatch(html, /practice-standard|Find the decision|Build the system|Edit until it holds/);
  }
});

test("project cards link published work and leave unfinished work non-interactive", () => {
  assert.equal(typeof projectRender.projectMarkup, "function");
  const published = SITE.projects.find(project => project.slug === "tedx-rsu");
  assert.match(projectRender.projectMarkup(published), /<a\b[^>]*href="work\/tedx-rsu.html"/);
  assert.match(projectRender.projectMarkup(published, 1, "../"), /href="\.\.\/work\/tedx-rsu.html"/);
  const unfinished = projectRender.projectMarkup({ ...published, status: "coming-soon" });
  assert.match(unfinished, /^<article\b/);
  assert.match(unfinished, /Coming soon/);
  assert.match(unfinished, /class="work-flick__status"/);
  assert.doesNotMatch(unfinished, /class="[^"]*\bbtn\b/);
  assert.doesNotMatch(unfinished, /<a\b|<button\b|tabindex|aria-disabled/);
  assert.equal(projectRender.projectMarkup({ ...published, status: "private" }), "");
});

test("Work archive excludes private and writing records and only published rows are links", () => {
  assert.equal(typeof projectRender.renderProjectArchiveMarkup, "function");
  const tedx = SITE.projects.find(project => project.slug === "tedx-rsu");
  const html = projectRender.renderProjectArchiveMarkup([
    tedx, { ...tedx, title: "Unfinished", status: "coming-soon" },
    { ...tedx, title: "Private fixture", status: "private" },
    SITE.projects.find(project => project.href?.startsWith("writing/"))
  ]);
  assert.match(html, /<a\b[^>]*href="work\/tedx-rsu.html"/);
  assert.match(html, /<article\b[^>]*>[\s\S]*Unfinished[\s\S]*Coming soon/);
  assert.doesNotMatch(html, /Private fixture|Designing for Disability|<details|<summary/);
  assert.equal((html.match(/<a\b/g) || []).length, 1);
  assert.match(html, /A global event system given a distinct pause-and-reflect rhythm\./);
});

test("built Home and Work expose truthful project states without JavaScript", async () => {
  for (const file of ["index.html", "work.html"]) {
    const html = await readFile(join(dist, file), "utf8");
    assert.match(html, /data-prerendered="true"/);
    assert.match(html, /href="work\/tedx-rsu.html"/);
    assert.match(html, /Coming soon/);
    assert.doesNotMatch(html, /href="work\/(?:rivo|chopbox|christian-poster-a-week)\.html"/);
  }
});

test("project hit areas are full rows and hover expansion requires fine-pointer capability", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /\.project-archive__item\[href\]\s*\{[^}]*display:\s*block/);
  const scopes = [];
  for (const match of css.matchAll(/([^{}]*)([{}])/g)) {
    if (match[2] === "{") {
      scopes.push(match[1].trim());
    } else {
      const selector = scopes.pop() || "";
      if (selector.includes("work-flick__item--more") && selector.includes(":hover") && /flex:\s*[2-9]/.test(match[1])) {
        assert.ok(scopes.some(scope => /@media/.test(scope) && /hover:\s*hover/.test(scope) && /pointer:\s*fine/.test(scope)), `Ungated expansion: ${selector}`);
      }
    }
  }
});

test("the route registry has unique destinations and supports the approved global masthead", () => {
  assert.ok(Array.isArray(navigation.routes), "A canonical route registry is required");
  assert.equal(new Set(navigation.routes.map(route => route.href)).size, navigation.routes.length);
  assert.equal(new Set(navigation.routes.map(route => route.key)).size, navigation.routes.length);
  assert.deepEqual(navigation.index.map(route => route.label), ["Home", "Work", "Explorations", "Community", "About", "Services", "Writing", "Contact"]);
  assert.deepEqual(new Set(navigation.primary.map(route => route.label)), new Set(["Work", "About", "Explorations", "Writing", "Community", "Contact"]));
  assert.ok(navigation.footer.some(route => route.href === "explorations.html"));
  assert.ok(navigation.footer.some(route => route.href === "community.html"));
});

test("every production shell exposes the complete Index as fallback navigation", async () => {
  const destinations = ["index.html", "work.html", "explorations.html", "community.html", "about.html", "services.html", "playground.html", "contact.html"];
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    const header = html.match(/<header data-mount="nav">([\s\S]*?)<\/header>/)?.[1] || "";
    const links = [...header.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => resolve(dirname(file), match[1]));
    for (const href of destinations) assert.ok(links.includes(join(dist, href)), `${file} omits fallback ${href}`);
  }
});

test("registry routes build with canonical URLs and generated sitemap entries", async () => {
  for (const [href, canonical] of [["index.html", "https://miebaka.design/"], ["explorations.html", "https://miebaka.design/explorations.html"], ["community.html", "https://miebaka.design/community.html"]]) {
    const html = await readFile(join(dist, href), "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), href);
  }
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes("https://miebaka.design/explorations.html"));
  assert.ok(urls.includes("https://miebaka.design/community.html"));
  assert.ok(!urls.some(url => url.endsWith("404.html")));
  for (const project of SITE.projects.filter(project => SITE.caseStudies[project.slug]?.status !== "published")) {
    assert.ok(!urls.includes(`https://miebaka.design/work/${project.slug}.html`), `${project.slug} is not a published narrative`);
  }
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const html = await readFile(join(dist, pathname === "/" ? "index.html" : pathname), "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), url);
  }
});

test("collection routes explain their empty state without invented entries", async () => {
  for (const [href, title, message] of [
    ["explorations.html", "Explorations", "Self-initiated studies in image, type and systems. The first entries are being prepared for publication."],
    ["community.html", "Community", "Resources, contributions and shared work will appear here when they are ready to be useful."]
  ]) {
    const html = await readFile(join(dist, href), "utf8");
    assert.match(html, /data-prerendered="true"/);
    assert.ok(new RegExp(`<h1[^>]*>${title}</h1>`).test(html));
    assert.ok(html.includes(message));
    assert.doesNotMatch(html, /aria-disabled|<time\b|collection-entry/);
  }
});

test("collection markup escapes authored content and renders usable real entries", async () => {
  const { renderCollectionState } = await import("../js/render/collection.js");
  const empty = renderCollectionState({ title: "Studies", introduction: "About <studies>", entries: [], emptyMessage: "Preparing & reviewing." });
  assert.match(empty, /About &lt;studies&gt;/);
  assert.match(empty, /Preparing &amp; reviewing\./);
  assert.doesNotMatch(empty, /<ul|<a\b|collection-entry/);
  const entries = renderCollectionState({ title: "Studies", introduction: "About studies", entries: [{ title: "Type & image", href: "explorations/type.html", summary: "A <study>" }], emptyMessage: "Preparing." });
  assert.match(entries, /href="explorations\/type.html"/);
  assert.match(entries, /Type &amp; image/);
  assert.match(entries, /A &lt;study&gt;/);
  assert.doesNotMatch(entries, /Preparing\./);
});

async function walk(dir, suffix = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path, suffix));
    else if (!suffix || path.endsWith(suffix)) files.push(path);
  }
  return files;
}

test("project publication states are explicit", async () => {
  const statuses = new Set(["published", "coming-soon", "private"]);
  for (const project of SITE.projects) {
    assert.ok(statuses.has(project.status), `${project.slug} needs a publication status`);
  }
  assert.equal(SITE.projects.filter(project => project.featured && project.status === "published").length, 1);
  assert.ok(SITE.projects.some(project => project.status === "coming-soon"));

  const pages = await walk(dist, ".html");
  const publicMarkup = (await Promise.all(pages.map(file => readFile(file, "utf8")))).join("\n");
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  for (const project of SITE.projects.filter(project => project.status === "private")) {
    assert.ok(!publicMarkup.includes(project.title), `${project.slug} appears in public HTML`);
    assert.ok(!sitemap.includes(`/work/${project.slug}.html`), `${project.slug} appears in the sitemap`);
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

test("unfinished case studies explain their state before JavaScript runs", async () => {
  for (const project of SITE.projects.filter(project => project.status === "coming-soon" && SITE.caseStudies[project.slug])) {
    const html = await readFile(join(dist, "work", `${project.slug}.html`), "utf8");
    assert.match(html, /data-prerendered="true"/, project.slug);
    assert.match(html, /Coming soon/, project.slug);
    assert.doesNotMatch(html, /filled by js|placeholder/i, project.slug);
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
  await access(join(dist, "js", "core", "shader-backdrop.js"));
  await access(join(dist, "assets", "runtime", "shader-gradient.js"));
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
  assert.match(css, /repeating-radial-gradient/);
  assert.doesNotMatch(css, /#(?:d7ff64|e96843|355cff|001c12|005b44|ff75aa|f4efec)\b/i);
  assert.doesNotMatch(css, /filter:saturate/i);
});

test("theme shader backdrop preserves both authored water-plane contracts", async () => {
  const source = await readFile(join(dist, "js", "core", "shader-backdrop.js"), "utf8");
  const island = await readFile(join(root, "js", "shader-gradient-island.js"), "utf8");
  assert.match(source, /Light water plane/);
  assert.match(source, /Dark water plane/);
  for (const color of ["#ebedff", "#f3f2f8", "#dbf8ff", "#606080", "#8d7dca", "#212121"]) assert.match(source, new RegExp(color, "i"));
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /\(hover: hover\) and \(pointer: fine\)/);
  assert.match(source, /pointermove/);
  assert.match(source, /setPointer/);
  assert.match(source, /shader-static/);
  assert.match(source, /connection\?\.saveData/);
  assert.match(island, /separate\s+compositions/);
  for (const value of ["#ebedff", "#f3f2f8", "#dbf8ff", "#606080", "#8d7dca", "#212121"]) assert.match(island, new RegExp(value));
  for (const value of ["cameraZoom: 1", "cPolarAngle: 120", "uFrequency: 5.5", "uStrength: 3", "cameraZoom: 9.1", "cPolarAngle: 80", "uDensity: 1.5"]) assert.match(island, new RegExp(value));
  for (const contract of [/type: "waterPlane"/, /cDistance: 2\.8/, /cPolarAngle: 80/, /rotationX: 50/, /rotationZ: -60/, /uDensity: 1\.5/, /uStrength: 1\.5/, /grain: "on"/]) assert.match(island, contract);
  assert.match(island, /ShaderGradientCanvas/);
  assert.match(island, /function CursorCamera/);
  assert.match(island, /MathUtils\.damp/);
  assert.match(island, /animate: reduced \? "off" : "on"/);
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
  const listening = await readFile(join(dist, "js", "render", "now-playing.js"), "utf8");
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");

  assert.doesNotMatch(html, /Curiosity is part of the job/i);
  assert.doesNotMatch(html, /swiss-selected__all|View all work/i);
  for (const title of ["TEDx RSU", "Rivo Studio", "Chop Box", "Detour", "Out Of Office"]) assert.match(projects, new RegExp(title));
  assert.doesNotMatch(projects, /work-flick__category|work-flick__action/);
  assert.match(projects, /client-marquee__track/);
  assert.match(projects, /client-marquee__control/);
  assert.match(projects, /Pause client logos/);
  assert.match(projects, /createMarqueeController/);
  assert.match(projects, /aria-hidden="true"/);
  assert.doesNotMatch(sections, /Evidence:/);
  assert.doesNotMatch(html, /Evidence:/);
  assert.doesNotMatch(services, /Evidence:/);
  assert.match(services, /data-mount="capabilities"/);
  assert.match(projects, /work-flick__bar/);
  assert.doesNotMatch(projects, /i === 0 \? ' is-active'/);
  assert.doesNotMatch(footer, /mailto:/);
  for (const selector of [".site-nav a", ".btn", ".work-flick__item", ".writing-item__link", ".site-footer a"]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\{[^}]*text-decoration:none`));
  }
  assert.match(css, /\.case-next__link\{[^}]*text-decoration:none/);
  assert.match(css, /\.site-footer__signature-canvas/);
  assert.match(css, /\.work-flick__more-arrow\{animation:none/);
  assert.match(html, /data-mount="now-playing"/);
  assert.match(css, /\.home-profile__media\{grid-column:8\/13/);
  assert.match(css, /\.now-playing__track\{[^}]*text-overflow:ellipsis/);
  assert.match(listening, /Currently listening to:/);
  assert.match(listening, /Que Linda/);
  assert.doesNotMatch(listening, /chip\.hidden\s*=\s*true/);
});

test("interactive controls include the approved Figma button states", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /\.btn\{[^}]*height:2\.5rem[^}]*min-height:2\.5rem[^}]*padding:0 1\.5rem/);
  assert.match(css, /\.btn:focus-visible\{[^}]*outline:3px solid var\(--ref-coral-75\)/);
  assert.match(css, /\.btn:focus-visible::before,\.btn:active::before\{opacity:\.1\}/);
  assert.match(css, /@media\(hover:hover\)\{\.btn:hover\{[^}]*box-shadow:var\(--elevation-hover\)/);
  assert.match(css, /\.btn\[aria-busy="true"\]\{[^}]*cursor:wait/);
  assert.doesNotMatch(css, /\.contact__submit \.btn/);
  assert.doesNotMatch(css, /\.btn--primary/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /animation-duration:1ms|transition-duration:1ms/);
  assert.doesNotMatch(css, /transition:\s*flex/);
  assert.doesNotMatch(css, /transition:[^;}]*max-height/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /@media\s*\(hover:hover\) and \(pointer:fine\)/);
  assert.match(css, /@media\(hover:none\),\(pointer:coarse\)\{\s*textarea\{font-size:16px\}\s*select\{font-size:16px\}\s*input\{font-size:16px\}\s*\}/);
});

test("alignment, service parity and article hierarchy stay systemic", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  const home = await readFile(join(dist, "index.html"), "utf8");
  const services = await readFile(join(dist, "services.html"), "utf8");
  const writing = await readFile(join(dist, "js", "render", "writing.js"), "utf8");
  const projects = await readFile(join(dist, "js", "render", "projects.js"), "utf8");
  assert.match(css, /main\{[^}]*text-align:left/);
  assert.match(css, /\.site-footer\{[^}]*text-align:left/);
  assert.match(home, /<h1 id="hero-title">I design brand systems, then build the tools that keep them intact\.<\/h1>/);
  assert.match(services, /data-mount="capabilities"/);
  assert.match(projects, /querySelectorAll\('\.work-flick__item'\)/);
  const title = writing.indexOf('writing-item__title');
  const summary = writing.indexOf('writing-item__summary');
  const meta = writing.indexOf('writing-item__meta');
  assert.ok(title > -1 && title < summary && summary < meta);
});

test("built service fallbacks contain one complete shared record per service", async () => {
  for (const file of ["index.html", "about.html", "services.html"]) {
    const html = await readFile(join(dist, file), "utf8");
    assert.equal((html.match(/data-mount="capabilities"/g) || []).length, 1, file);
    const start = html.indexOf('<div data-mount="capabilities"');
    const capability = html.slice(start, html.indexOf("</section>", start));
    for (const service of SITE.capabilities) for (const field of ["title", "description", "outputs", "fit"]) {
      const value = service[field].replaceAll("&", "&amp;");
      assert.equal(capability.split(value).length - 1, 1, `${file}: ${service.id}.${field}`);
    }
    assert.doesNotMatch(capability, /<\/ol><\/div><div><dt>Good fit/, file);
  }
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
  const header = (source, key) => config.headers.find(rule => rule.source === source)?.headers.find(item => item.key === key)?.value;
  assert.equal(header("/api/(.*)", "Cache-Control"), "no-store");
  assert.equal(header("/", "Cache-Control"), "public, max-age=0, must-revalidate");
  assert.equal(header("/(.*)\\.html", "Cache-Control"), "public, max-age=0, must-revalidate");
  for (const rule of config.headers) {
    for (const item of rule.headers || []) {
      if (/immutable/i.test(item.value)) assert.match(rule.source, /\[[^\]]*[a-f0-9][^\]]*\]|hash/i, `immutable cache on stable path ${rule.source}`);
    }
  }
});

test("portfolio depth features are present without depending on JavaScript for content", async () => {
  const work = await readFile(join(dist, "work.html"), "utf8");
  assert.match(work, /data-project-archive/);
  assert.doesNotMatch(work, /data-mount="work-grid"/);
  assert.doesNotMatch(work, /Work \/ 2019/);
});

test("requested language and contact details stay canonical", async () => {
  const sourceFiles = [
    join(dist, "index.html"), join(dist, "about.html"), join(dist, "services.html"),
    join(dist, "contact.html"), join(dist, "playground.html"), join(dist, "privacy.html"),
    join(dist, "writing", "when-the-swoosh-lost-its-soul.html"),
    join(dist, "writing", "designing-for-disability-in-nigeria.html")
  ];
  const source = (await Promise.all(sourceFiles.map(file => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /hello@miebaka\.design|About \/ Practice|Writing \/ Notes|Contact \/ Start here|Services \/ What I do/);
  assert.doesNotMatch(source, /article-hero__tag|Brand Strategy<\/span>|Inclusive Design<\/span>/);
  assert.match(source, /miebakakiki@gmail\.com/);
  assert.match(await readFile(join(dist, "index.html"), "utf8"), /I design brand systems, then build the tools that keep them intact\./);
  assert.doesNotMatch(await readFile(join(root, "js", "render", "projects.js"), "utf8"), /work-flick__veil/);
  const projects = await readFile(join(root, "js", "render", "projects.js"), "utf8");
  assert.match(projects, /Coming soon/);
  assert.match(projects, /!project\.href\?\.startsWith\('writing\/'\)/);
  const footer = await readFile(join(root, "js", "render", "footer.js"), "utf8");
  assert.match(footer, /site-footer__links/);
  assert.match(footer, /Explore/);
  assert.match(footer, /Social/);
  assert.doesNotMatch(footer, /Based in|SITE\.location/);
  assert.match(footer, /SITE\.socials/);
  assert.match(footer, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(footer, /Back to top|data-year/);
  const signature = await readFile(join(root, "js", "core", "footer-signature.js"), "utf8");
  assert.match(signature, /site-footer__signature-canvas/);
  assert.match(signature, /drawStatic/);
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

test("CSP inventory permits every executable inline script and stages dependency removal", async () => {
  const netlify = await readFile(join(root, "netlify.toml"), "utf8");
  const vercel = await readFile(join(root, "vercel.json"), "utf8");
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    for (const [, script] of html.matchAll(/<script(?![^>]*src)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
      const hash = createHash("sha256").update(script).digest("base64");
      const pattern = new RegExp(hash.replace(/[+/]/g, "\\$&"));
      assert.match(netlify, pattern, file);
      assert.match(vercel, pattern, file);
    }
  }
  assert.match(netlify, /Content-Security-Policy-Report-Only/);
  assert.match(vercel, /Content-Security-Policy-Report-Only/);
  const netlifyCandidate = netlify.match(/Content-Security-Policy-Report-Only\s*=\s*"([^"]+)"/)?.[1] || "";
  const vercelCandidate = JSON.parse(vercel).headers[0].headers.find(item => item.key === "Content-Security-Policy-Report-Only").value;
  assert.doesNotMatch(netlifyCandidate, /audioscrobbler|report-uri|report-to/i);
  assert.doesNotMatch(vercelCandidate, /audioscrobbler|report-uri|report-to/i);
  assert.doesNotMatch(netlifyCandidate, /upgrade-insecure-requests/i);
  assert.doesNotMatch(vercelCandidate, /upgrade-insecure-requests/i);
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
  await assert.rejects(access(new URL("../dist/data/drafts.js", import.meta.url)));
  await assert.rejects(access(new URL("../dist/js/core/footer-scene.js", import.meta.url)));
  for (const file of await walk(dist)) {
    const shippedPath = file.slice(dist.length + 1).replaceAll("\\", "/");
    assert.doesNotMatch(shippedPath, /(?:^|\/)(?:docs|reports|drafts?|samples from figma|klat_magazine|graphify-out)(?:\/|$)|\.map$/i);
  }
});

test("listening status uses the private server boundary and privacy copy matches network behavior", async () => {
  const renderer = await readFile(join(dist, "js", "render", "now-playing.js"), "utf8");
  const config = await readFile(join(dist, "data", "site-config.js"), "utf8");
  const privacy = await readFile(join(dist, "privacy.html"), "utf8");
  assert.match(renderer, /fetch\("\/api\/now-playing"/);
  assert.doesNotMatch(renderer, /api_key|audioscrobbler/i);
  assert.doesNotMatch(config, /lastfmKey|127872bcf2ccc619e4fb52bb4b81805f/);
  assert.match(renderer, /https:\/\/www\.last\.fm\/user\//);
  assert.match(privacy, /server asks Last\.fm for the latest track/i);
  assert.match(privacy, /browser does not receive the Last\.fm API key/i);
});

test("retired source systems cannot return unnoticed", async () => {
  for (const path of [
    "styles/cohesion.css", "styles/editorial-system.css", "styles/swiss.css",
    "js/core/case-rail.js", "js/core/motion-director.js", "js/core/kinetic.js"
  ]) await assert.rejects(access(join(root, path)), path);
  const main = await readFile(join(root, "js", "main.js"), "utf8");
  const styles = await readFile(join(root, "styles", "main.css"), "utf8");
  assert.doesNotMatch(main, /kinetic|case-rail|motion-director/i);
  assert.equal((styles.match(/@import/g) || []).length, 3);
  assert.doesNotMatch(styles, /(?:base|components|sections|tokens)\//);
});
