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
 
// Source-format assertions inspect authored rules. The shipped CSS is
// separately tested as a bundled, minified artifact with a strict gzip budget.
async function readAuthoredCss() {
  const main = await readFile(join(root, "styles", "main.css"), "utf8");
  const names = [...main.matchAll(/@import url\("([^"]+)"\)/g)].map(match => match[1]);
  return (await Promise.all(names.map(name => readFile(join(root, "styles", name), "utf8")))).join("\n");
}

test("homepage proof precedes biography in the source and built document", async () => {
  for (const directory of [root, dist]) {
    const html = await readFile(join(directory, "index.html"), "utf8");
    assert.ok(html.includes('id="selected-work"'));
    assert.ok(html.includes('id="profile"'));
    assert.ok(html.indexOf('id="selected-work"') < html.indexOf('id="profile"'));
  }
});

test("homepage hero and professional proof remain useful without JavaScript", async () => {
  for (const directory of [root, dist]) {
    const html = await readFile(join(directory, "index.html"), "utf8");
    assert.match(html, /A creative partner for teams turning difficult briefs into unmistakable brands/);
    assert.match(html, /Marketing designer at Rise/);
    assert.match(html, /more than eight years/);
  }
});

test("homepage keeps the approved chapter order", async () => {
  for (const directory of [root, dist]) {
    const html = await readFile(join(directory, "index.html"), "utf8");
    const proof = html.indexOf('id="selected-work"');
    const biography = html.indexOf('id="profile"');
    const capabilities = html.indexOf('id="what-i-do"');
    const journey = html.indexOf('class="journey"');
    const close = html.indexOf('class="home-close');
    assert.ok(proof < biography && biography < capabilities && capabilities < journey && journey < close, directory);
    assert.doesNotMatch(html, /practice-standard|Build the system|Edit until it holds/);
  }
});

test("Work archive separates published cases from work in progress", () => {
  assert.equal(typeof projectRender.renderProjectArchiveMarkup, "function");
  const html = projectRender.renderProjectArchiveMarkup(SITE.projects);
  assert.match(html, /<a\b[^>]*href="work\/tedx-rsu.html"/);
  assert.match(html, /<a\b[^>]*href="work\/rivo.html"/);
  for (const title of ["TEDx Rivers State University", "Rivo Studio", "ChopBox", "Poster A Week", "Kiki-Joshua", "Kigoma Hotels"])
    assert.match(html, new RegExp(title));
  assert.doesNotMatch(html, /Designing for Disability|When the Swoosh Lost Its Soul|<details|<summary/);
  assert.equal((html.match(/<a\b/g) || []).length, 5);
  assert.equal((html.match(/class="project-folder__link"/g) || []).length, 3);
  assert.match(html, /class="project-folder-stack__cards"/);
  assert.ok(html.indexOf('data-slug="rivo"') < html.indexOf('data-slug="tedx-rsu"'));
  assert.ok(html.indexOf('data-slug="tedx-rsu"') < html.indexOf('data-slug="chopbox"'));
  assert.doesNotMatch(html, /CASE STUDY \/ 20\d\d/, "folder fronts only carry their project names");
  assert.doesNotMatch(html, /filing-cabinet|drawer|folder--sealed/);
  assert.match(html, /class="project-archive__progress"/);
  assert.match(html, /class="project-archive__collections"/);
  assert.match(html, /href="experiments\.html"/);
  assert.match(html, /href="essays\.html"/);
  const tedx = SITE.projects.find(project => project.slug === "tedx-rsu");
  assert.ok(tedx, "Published TEDx project must remain in the source data");
  assert.equal(tedx.tagline, "A global event system given a distinct pause-and-reflect rhythm.");
  assert.doesNotMatch(html, /A global event system given a distinct pause-and-reflect rhythm\./,
    "Keep full project details in source content and the case study, not the constrained physical lip");
});

test("built Home and Work expose truthful project states without JavaScript", async () => {
  const home = await readFile(join(dist, "index.html"), "utf8");
  const work = await readFile(join(dist, "work.html"), "utf8");
  for (const html of [home, work]) assert.match(html, /data-prerendered="true"/);
  for (const html of [home, work]) assert.match(html, /href="work\/tedx-rsu.html"/);
  for (const html of [home, work]) assert.match(html, /href="work\/rivo.html"/);
  assert.doesNotMatch(home, /Case study in progress|Detour|Out Of Office/);
  assert.match(work, /<h2 id="in-progress-title">In progress<\/h2>/);
  assert.equal((work.match(/class="project-folder__link"/g) || []).length, 3);
  assert.doesNotMatch(work, /filing-cabinet|work-cabinet/);
  assert.doesNotMatch(work, /class="editorial-index--archive"/);
  for (const html of [home, work]) assert.match(html, /href="work\/chopbox\.html"/);
  for (const html of [home, work]) assert.doesNotMatch(html, /href="work\/(?:detour|out-of-office)\.html"/);
});

test("project folders are full native links", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /\.project-folder__link\s*\{[^}]*display:\s*block/);
});

test("the route registry has unique destinations and supports the approved global masthead", () => {
  assert.ok(Array.isArray(navigation.routes), "A canonical route registry is required");
  assert.equal(new Set(navigation.routes.map((route) => route.href)).size, navigation.routes.length);
  assert.equal(new Set(navigation.routes.map((route) => route.key)).size, navigation.routes.length);
  assert.deepEqual(
    navigation.index.map((route) => route.label),
    ["Work", "Experiments", "About", "Essays", "Contact"],
  );
  assert.deepEqual(
    navigation.primary.map((route) => route.label),
    ["Work", "Experiments", "About", "Essays", "Contact"],
  );
  assert.ok(navigation.footer.some((route) => route.href === "experiments.html"));
  assert.ok(navigation.footer.some((route) => route.href === "essays.html"));
});

test("every production shell exposes the complete Index as fallback navigation", async () => {
  const destinations = navigation.index.map((route) => route.href);
  for (const file of await walk(dist, ".html")) {
    if (file.endsWith("experiments.html")) continue;
    const html = await readFile(file, "utf8");
    const header = html.match(/<header\b[^>]*data-mount="nav"[^>]*>([\s\S]*?)<\/header>/)?.[1] || "";
    const links = [...header.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1].startsWith("/") ? join(dist, match[1].slice(1)) : resolve(dirname(file), match[1]));
    for (const href of destinations) assert.ok(links.includes(join(dist, href)), `${file} omits fallback ${href}`);
  }
});

test("source and built footer fallbacks match the approved public navigation", async () => {
  const destinations = navigation.footer.map((route) => route.href);
  for (const directory of [root, dist]) {
    for (const file of await walk(directory, ".html")) {
      if (file.includes(`${directory}/prototype/`)) continue;
      if (directory === root && file.startsWith(`${dist}/`)) continue;
      const html = await readFile(file, "utf8");
      const footer = html.match(/<footer\b[\s\S]*?<div class="nav-fallback">([\s\S]*?)<a href="https:/)?.[1];
      if (!footer) continue;
      const links = [...footer.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((match) => match[1].startsWith("/") ? join(directory, match[1].slice(1)) : resolve(dirname(file), match[1]));
      for (const href of destinations)
        assert.ok(links.includes(join(directory, href)), `${file} omits footer fallback ${href}`);
      assert.ok(!links.includes(join(directory, "community.html")), `${file} exposes retired Playground navigation`);
    }
  }
});

test("registry routes build with canonical URLs and generated sitemap entries", async () => {
  for (const [href, canonical] of [
    ["index.html", "https://miebaka-portfolio.vercel.app/"],
    ["experiments.html", "https://miebaka-portfolio.vercel.app/experiments.html"],
    ["community.html", "https://miebaka-portfolio.vercel.app/experiments.html"],
  ]) {
    const html = await readFile(join(dist, href), "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), href);
  }
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes("https://miebaka-portfolio.vercel.app/experiments.html"));
  assert.ok(!urls.includes("https://miebaka-portfolio.vercel.app/community.html"));
  assert.ok(!urls.some((url) => url.endsWith("404.html")));
  for (const project of SITE.projects.filter((project) => SITE.caseStudies[project.slug]?.status !== "published")) {
    assert.ok(
      !urls.includes(`https://miebaka-portfolio.vercel.app/work/${project.slug}.html`),
      `${project.slug} is not a published narrative`,
    );
  }
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const html = await readFile(join(dist, pathname === "/" ? "index.html" : pathname), "utf8");
    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), url);
  }
});

test("Experiments ships a readable archive and the retired route points to it", async () => {
  const experiments = await readFile(join(dist, "experiments.html"), "utf8");
  assert.match(experiments, /data-experiments-spatial/);
  assert.match(experiments, /<h1[^>]*>Experiments<\/h1>/);
  assert.match(experiments, /Wada Sanzō, Study 264/);
  assert.doesNotMatch(experiments, /U014|WADA SANZ/);
  assert.match(experiments, /class="experiment-poster"/);
  assert.doesNotMatch(experiments, /experiment-disc|experiment-poster__hub/);
  assert.match(experiments, /aria-label="Experiments navigation"/);
  assert.doesNotMatch(
    experiments,
    /Spatial archive|Self-initiated work|works<\/p>|aria-disabled|<time\b|collection-entry/,
  );

  const playground = await readFile(join(dist, "community.html"), "utf8");
  assert.match(playground, /<h1[^>]*>Experiments have moved\.<\/h1>/);
  assert.match(playground, /href="experiments\.html"/);
  assert.match(playground, /name="robots" content="noindex,follow"/);
});

async function walk(dir, suffix = "") {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path, suffix)));
    else if (!suffix || path.endsWith(suffix)) files.push(path);
  }
  return files;
}

test("project publication states are explicit", async () => {
  const statuses = new Set(["published", "coming-soon", "private"]);
  for (const project of SITE.projects) {
    assert.ok(statuses.has(project.status), `${project.slug} needs a publication status`);
  }
  assert.equal(SITE.projects.filter((project) => project.featured && project.status === "published").length, 3);
  assert.ok(SITE.projects.some((project) => project.status === "coming-soon"));

  const pages = await walk(dist, ".html");
  const publicMarkup = (await Promise.all(pages.map((file) => readFile(file, "utf8")))).join("\n");
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  for (const project of SITE.projects.filter((project) => project.status === "private")) {
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
  for (const project of SITE.projects.filter(
    (project) => project.status === "coming-soon" && SITE.caseStudies[project.slug],
  )) {
    const html = await readFile(join(dist, "work", `${project.slug}.html`), "utf8");
    assert.match(html, /data-prerendered="true"/, project.slug);
    assert.match(html, /Coming soon/, project.slug);
    assert.doesNotMatch(html, /filled by js|placeholder/i, project.slug);
  }
});

test("production CSS is bundled and dead runtime modules are absent", async () => {
  const cssFiles = await walk(join(dist, "styles"), ".css");
  assert.deepEqual(cssFiles, [join(dist, "styles", "main.css")]);
  const workPage = await readFile(join(dist, "work.html"), "utf8");
  assert.match(workPage, /href="styles\/main\.css"/);
  assert.match(workPage, /class="project-folder-stack"/);
  assert.doesNotMatch(workPage, /work-cabinet|filing-cabinet/);
  await assert.rejects(access(join(dist, "js", "core", "work-cabinet.js")));
  await assert.rejects(access(join(dist, "js", "core", "case-arrival.js")));
  for (const slug of ["rivo", "tedx-rsu", "chopbox"]) {
    const html = await readFile(join(dist, "work", `${slug}.html`), "utf8");
    assert.match(html, /@view-transition\s*\{\s*navigation:\s*auto/);
    assert.doesNotMatch(html, /case-arrival\.js/);
  }
  const homePage = await readFile(join(dist, "index.html"), "utf8");
  assert.match(homePage, /class="home-folder-stack"/);
  const css = await readFile(cssFiles[0], "utf8");
  assert.doesNotMatch(css, /@import/);
  assert.match(css, /--accent:/);
  assert.doesNotMatch(css, /font-family:\s*"Geist Serif"/);
  assert.match(css, /font-family:\s*"?Geist Sans"?/);
  assert.match(css, /font-family:\s*"?Geist Mono"?/);
  assert.match(css, /font-family:\s*"?Material Symbols Outlined"?/);
  assert.doesNotMatch(css, /font-family:\s*"(?:Television Sans|Borges)"/);
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const value = match[1];
    if (/^(?:data:|https?:|#|%23)/.test(value)) continue;
    await access(resolve(join(dist, "styles"), value));
  }
  for (const file of ["scroll.js", "split-text.js", "hero-parallax.js", "work-preview.js"]) {
    await assert.rejects(access(join(dist, "js", "core", file)));
  }
  await assert.rejects(access(join(dist, "js", "core", "decision-field.js")));
  await access(join(dist, "js", "core", "hero-wave.js"));
  await access(join(dist, "assets", "runtime", "hero-wave.js"));
  await assert.rejects(access(join(dist, "assets", "runtime", "motion-experience.js")));
  await assert.rejects(access(join(dist, "js", "core", "editorial-reveals.js")));
  await assert.rejects(access(join(dist, "js", "core", "scroll-experience.js")));
  await assert.rejects(access(join(dist, "assets", "vendor", "three.module.js")));
  await assert.rejects(access(join(dist, "assets", "vendor", "three.core.js")));
  await assert.rejects(access(join(dist, "node_modules")));
});

test("ultramarine identity stays within its documented visual language", async () => {
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(css, /--ref-ultramarine:#002080/);
  assert.match(css, /--ref-paper:#f8f9fc/);
  assert.match(css, /--sys-color-primary:var\(--ref-ultramarine\)/);
  assert.match(css, /--sys-color-tertiary:var\(--ref-coral-30\)/);
  assert.match(css, /--sys-color-focus:var\(--ref-coral-30\)/);
  assert.match(css, /--font-sans:\s*"Geist Sans"/);
  assert.match(css, /--font-mono:\s*"Geist Mono"/);
  assert.doesNotMatch(css, /--(?:font-display|font-body|font-label|font-size-[\w-]+|editorial-display)\s*:/);
  assert.doesNotMatch(css, /font-family:"(?:Borges|Television Sans)"/);
  assert.match(css, /\.site-footer__signature-canvas/);
  assert.doesNotMatch(css, /#(?:d7ff64|e96843|355cff|001c12|005b44|ff75aa|f4efec)\b/i);
  assert.doesNotMatch(css, /filter:saturate/i);
});

test("hero water ships a bounded Three.js GPU fluid simulation with graceful fallback", async () => {
  const source = await readFile(join(dist, "js", "core", "hero-wave.js"), "utf8");
  const island = await readFile(join(root, "js", "hero-water-three.js"), "utf8");
  const runtime = await readFile(join(dist, "assets", "runtime", "hero-wave.js"), "utf8");
  const foundations = await readFile(join(root, "styles", "foundations.css"), "utf8");
  // A shader's actual WebGL uniforms, not unused stylesheet tokens, own its palette.
  assert.match(source, /assets\/runtime\/hero-wave\.js\?rev=/);
  for (const contract of [
    /WebGLRenderer/, /WebGLRenderTarget/, /HalfFloatType/,
    /const advect=/, /const divergence=/, /const jacobi=/, /const project=/,
    /const wave=/, /const shade=/, /PRESSURE|ITERATIONS/,
    /setRenderTarget/, /renderer\.render/,
    /IntersectionObserver/, /ResizeObserver/, /renderer\.dispose/,
    /const causticsVertex=/, /const causticsFragment=/,
    /dFdx\(vSource\)/, /refract\(incoming, n, 1\.0 \/ 1\.333\)/,
    /host\.dataset\.caustics="refracted-lightfront"/,
    /screen\.uniforms\.transmission\.value=dark\?/,
  
  ]) assert.match(island, contract);
  assert.match(source, /shader-static/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /Pause background motion/);
  assert.match(source, /setPointer/);
  assert.match(runtime, /WebGLRenderer|WebGLRenderTarget|webgl2/i);
  assert.match(island, /uniform vec4 rippleEvents\[4\]/);
  assert.match(island, /sunward-caustics/);
  assert.match(source, /20261122-refract-lightfront/);
  assert.doesNotMatch(foundations, /--hero-wave-color-|--ref-water-ripple-/);
  assert.doesNotMatch(source + island, /ShaderGradient|shader-background|ref-shader/);
});

test("rejected homepage language cannot return unnoticed", async () => {
  const html = await readFile(join(dist, "index.html"), "utf8");
  for (const phrase of [
    "Independent practice",
    "Position 01",
    "Brand thinking should survive",
    "Open to remote roles",
    "Three decisions. Three systems.",
    "From the first question to the final file.",
  ])
    assert.doesNotMatch(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.doesNotMatch(html, /Available for select projects|data-lagos-time/);
  assert.match(html, /Hi, I&rsquo;m Miebaka/);
  assert.match(html, /more than eight years/);
});

test("homepage hierarchy and motion affordances cannot regress", async () => {
  const html = await readFile(join(dist, "index.html"), "utf8");
  const projects = await readFile(join(dist, "js", "render", "projects.js"), "utf8");
  const sections = await readFile(join(dist, "js", "render", "sections.js"), "utf8");
  const footer = await readFile(join(dist, "js", "render", "footer.js"), "utf8");
  const navigation = await readFile(join(dist, "js", "render", "navigation.js"), "utf8");
  const css = await readAuthoredCss();

  assert.doesNotMatch(html, /Curiosity is part of the job/i);
  assert.doesNotMatch(html, /swiss-selected__all|View all work/i);
  assert.match(projects, /project\.status === "published"/);
  assert.match(projects, /studies\?\.\[project\.slug\]\?\.status === "published"/);
  assert.match(projects, /project\.status === "coming-soon"/);
  assert.doesNotMatch(projects, /Detour|Out Of Office/);
  const homeProjects = projects.match(/export function renderHomeProjectList[\s\S]*?\n}\n\nexport function renderProjectArchive/)?.[0] || "";
  assert.doesNotMatch(homeProjects, /proof\?\.find|home-project-list__decision|Governing decision/);
  assert.match(projects, /client-marquee__track/);
  assert.match(
    css,
    /body\[data-page="home"\] \.client-marquee\s*\{[^}]*width:\s*100%[^}]*mask-image:\s*linear-gradient\(90deg,\s*transparent/,
  );
  assert.match(css, /--content:var\(--grid-max\)/);
  assert.match(css, /--grid-max:100rem/);
  assert.match(css, /body\[data-page="home"\] \.marquee__item img\s*\{[^}]*height:\s*clamp\(2rem,\s*3vw,\s*3\.25rem\)/);
  assert.doesNotMatch(projects, /Pause client logos/);
  assert.match(projects, /createMarqueeController/);
  assert.match(projects, /aria-hidden="true"/);
  assert.doesNotMatch(sections, /Evidence:/);
  assert.doesNotMatch(html, /Evidence:/);
  await assert.rejects(readFile(join(dist, "services.html"), "utf8"));
  assert.match(footer, /site-footer__start/);
  assert.match(footer, /mailto:/);
  for (const selector of [".site-nav a", ".btn", ".writing-item__link", ".site-footer a"]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(css, new RegExp(`${escaped}\\{[^}]*text-decoration:none`));
  }
  assert.match(css, /\.case-next__link\{[^}]*text-decoration:none/);
  assert.match(css, /\.site-footer__signature-canvas/);
  assert.match(
    css,
    /body\[data-page="home"\]:not\(\.site-system-disabled\) \.site-footer__signature\s*\{[^}]*display:\s*block/,
  );
  assert.doesNotMatch(html, /\b0[1-9] \/ (?:Work|About me|Practice|Selected clients|Let(?:&rsquo;|')s work)\b/);
  assert.match(css, /body\[data-page="home"\] \.home-profile\s*>\s*\.home-profile__media\s*\{[^}]*grid-column:\s*1\/6/);
  assert.match(navigation, /class="theme-liquid-toggle"[^>]*role="switch"[^>]*aria-checked="false"/);
  assert.match(navigation, /data-theme-mode>Light/);
  assert.match(navigation, /themeButton\.addEventListener\("click", toggleTheme\)/);
  assert.match(css, /--hr:\s*clamp\(1\.25rem,\s*2\.5vw,\s*2\.75rem\)/);
  assert.doesNotMatch(css, /cursor:\s*url\(/);
  assert.doesNotMatch(css, /\.editorial-field/);
  assert.match(css, /body\[data-page="home"\] \.home-profile\s*\{[^}]*grid-template-columns:\s*repeat\(12,\s*1fr\)/);
});

test("interactive controls include the approved Figma button states", async () => {
  const css = await readAuthoredCss();
  assert.match(css, /\.btn\{[^}]*height:2\.5rem[^}]*min-height:2\.5rem[^}]*padding:0 1\.5rem/);
  assert.match(css, /body\[data-page="contact"\] \.contact__submit \.btn\{[^}]*width:100%[^}]*min-height:4rem/);
  assert.match(css, /\.btn:focus-visible\{[^}]*outline:3px solid var\(--ref-coral-75\)/);
  assert.match(css, /\.btn:focus-visible::before,\.btn:active::before\{opacity:\.1\}/);
  assert.match(css, /@media\(hover:hover\)\{\.btn:hover\{[^}]*box-shadow:var\(--elevation-hover\)/);
  assert.match(css, /\.btn\[aria-busy="true"\]\{[^}]*cursor:wait/);
  assert.doesNotMatch(css, /\.btn--primary/);
  assert.doesNotMatch(css, /transition:\s*all/);
  assert.doesNotMatch(css, /animation-duration:1ms|transition-duration:1ms/);
  assert.doesNotMatch(css, /transition:\s*flex/);
  assert.doesNotMatch(css, /transition:[^;}]*max-height/);
  assert.match(css, /-webkit-text-size-adjust:100%/);
  assert.match(css, /safe-area-inset-left/);
  assert.match(css, /@media\s*\(hover:hover\) and \(pointer:fine\)/);
  assert.match(
    css,
    /@media\(hover:none\),\(pointer:coarse\)\{\s*textarea\{font-size:var\(--type-input\)\}\s*select\{font-size:var\(--type-input\)\}\s*input\{font-size:var\(--type-input\)\}\s*\}/,
  );
});

test("alignment, service parity and article hierarchy stay systemic", async () => {
  const css = await readAuthoredCss();
  const home = await readFile(join(dist, "index.html"), "utf8");
  const writing = await readFile(join(dist, "js", "render", "writing.js"), "utf8");
  const projects = await readFile(join(dist, "js", "render", "projects.js"), "utf8");
  assert.match(css, /main\{[^}]*text-align:left/);
  assert.match(css, /\.site-footer\{[^}]*text-align:left/);
  assert.match(css, /\.measure-hero\{max-width:none\}/);
  assert.match(css, /\.hero\{[^}]*grid-template-columns:repeat\(12,minmax\(0,1fr\)\)/);
  assert.match(
    css,
    /body\[data-page="home"\] \.home-landing h1\s*\{[^}]*grid-column:\s*1\/-1[^}]*justify-content:\s*space-between/,
  );
  assert.match(css, /\.case-page \.case-chapter__body\{[^}]*max-width:/);
  assert.match(css, /\.article-hero__title\{[^}]*max-width:none/);
  assert.match(home, /<h1 id="hero-title"><span>Miebaka<\/span> <span>Joshua<\/span><\/h1>/);
  assert.doesNotMatch(home.match(/<h1 id="hero-title"[\s\S]*?<\/h1>/)?.[0] || "", /aria-label|aria-hidden/);
  const title = writing.indexOf("writing-item__title");
  const meta = writing.indexOf("writing-item__meta");
  assert.ok(title > -1 && title < meta);
  assert.match(writing, /writing-item__summary/);
  assert.doesNotMatch(
    projects.match(/export function renderHomeProjectList[\s\S]*?\n}/)?.[0] || "",
    /home-project-list__decision|Governing decision/,
  );
});

test("built service fallback remains complete on the detailed About page", async () => {
  for (const file of ["about.html"]) {
    const html = await readFile(join(dist, file), "utf8");
    assert.equal((html.match(/data-mount="capabilities"/g) || []).length, 1, file);
    const start = html.indexOf('<div data-mount="capabilities"');
    const capability = html.slice(start, html.indexOf("</section>", start));
    for (const service of SITE.capabilities)
      for (const field of ["title", "description", "outputs", "fit"]) {
        const value = service[field].replaceAll("&", "&amp;");
        assert.equal(capability.split(value).length - 1, 1, `${file}: ${service.id}.${field}`);
      }
    assert.doesNotMatch(capability, /<\/ol><\/div><div><dt>Good fit/, file);
  }
  await assert.rejects(readFile(join(dist, "services.html"), "utf8"));
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
  const header = (source, key) =>
    config.headers.find((rule) => rule.source === source)?.headers.find((item) => item.key === key)?.value;
  assert.equal(header("/api/contact", "Cache-Control"), "no-store");
  assert.equal(header("/api/(.*)", "Cache-Control"), undefined,
    "the Last.fm GET endpoint must be free to set a short shared cache at runtime");
  const nowPlayingApi = await readFile(join(root, "api", "now-playing.js"), "utf8");
  assert.match(nowPlayingApi, /s-maxage=60/);
  assert.equal(header("/", "Cache-Control"), "public, max-age=0, must-revalidate");
  assert.equal(header("/(.*)\\.html", "Cache-Control"), "public, max-age=0, must-revalidate");
  assert.equal(header("/assets/runtime/(.*)", "Cache-Control"), "public, max-age=0, must-revalidate");
  for (const rule of config.headers) {
    for (const item of rule.headers || []) {
      if (/immutable/i.test(item.value))
        assert.match(rule.source, /\[[^\]]*[a-f0-9][^\]]*\]|hash/i, `immutable cache on stable path ${rule.source}`);
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
    join(dist, "index.html"),
    join(dist, "about.html"),
    join(dist, "contact.html"),
    join(dist, "essays.html"),
    join(dist, "privacy.html"),
    join(dist, "essays", "when-the-swoosh-lost-its-soul.html"),
    join(dist, "essays", "designing-for-disability-in-nigeria.html"),
  ];
  const source = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(
    source,
    /hello@portfolio\.invalid|About \/ Practice|Writing \/ Essays|Contact \/ Start here|Services \/ What I do/,
  );
  assert.doesNotMatch(source, /article-hero__tag|Brand Strategy<\/span>|Inclusive Design<\/span>/);
  assert.match(source, /miebakakiki@gmail\.com/);
  const home = await readFile(join(dist, "index.html"), "utf8");
  assert.match(home, /A creative partner for teams turning difficult briefs into unmistakable brands/);
  assert.doesNotMatch(home, /Senior-leaning/);
  const projects = await readFile(join(root, "js", "render", "projects.js"), "utf8");
  assert.match(projects, /const published = projects/);
  assert.match(projects, /const inProgress = projects/);
  const footer = await readFile(join(root, "js", "render", "footer.js"), "utf8");
  assert.match(footer, /site-footer__links/);
  assert.match(footer, /Explore/);
  assert.match(footer, /Social/);
  assert.doesNotMatch(footer, /Based in|SITE\.location/);
  assert.match(footer, /SITE\.socials/);
  assert.match(footer, /target="_blank" rel="noopener noreferrer"/);
  assert.doesNotMatch(footer, /Back to top|data-year/);
  const signature = await readFile(join(root, "js", "core", "footer-signature.js"), "utf8");
  const css = await readFile(join(dist, "styles", "main.css"), "utf8");
  assert.match(signature, /site-footer__signature-canvas/);
  assert.match(signature, /host\.addEventListener\("pointermove"/);
  assert.match(css, /site-footer__signature-canvas\{[^}]*pointer-events:none/);
  assert.match(css, /site-footer__panel\{[^}]*position:relative/);
  assert.match(signature, /drawStatic/);
  await access(join(dist, "js", "core", "footer-signature.js"));
});

test("all local HTML assets and links resolve", async () => {
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    for (const match of html.matchAll(/(?:\shref|\ssrc)="([^"]+)"|\ssrcset="([^"]+)"/g)) {
      const raw = match[1] || match[2];
      const values = match[2] ? raw.split(",").map((item) => item.trim().split(/\s+/)[0]) : [raw];
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
  const vercel = await readFile(join(root, "vercel.json"), "utf8");
  for (const file of await walk(dist, ".html")) {
    const html = await readFile(file, "utf8");
    for (const [, script] of html.matchAll(
      /<script(?![^>]*src)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,
    )) {
      const hash = createHash("sha256").update(script).digest("base64");
      const pattern = new RegExp(hash.replace(/[+/]/g, "\\$&"));
      assert.match(vercel, pattern, file);
    }
  }
  assert.doesNotMatch(vercel, /Content-Security-Policy-Report-Only/,
    "an unenforced duplicate policy without a report endpoint serves no purpose");
  const enforced = JSON.parse(vercel).headers[0].headers.find(
    item => item.key === "Content-Security-Policy"
  )?.value;
  assert.match(enforced, /default-src 'self'/);
  assert.match(enforced, /upgrade-insecure-requests/);
});

test("search crawlers may index the public site and discover its sitemap", async () => {
  const robots = await readFile(join(dist, "robots.txt"), "utf8");
  assert.match(robots, /^User-agent:\s*\*$/m);
  assert.match(robots, /^Allow:\s*\/$/m);
  assert.doesNotMatch(robots, /^Disallow:\s*\/$/m);
  assert.match(robots, /^Sitemap:\s*https:\/\/miebaka-portfolio\.vercel\.app\/sitemap\.xml$/m);
  const homepage = await readFile(join(dist, "index.html"), "utf8");
  const work = await readFile(join(dist, "work.html"), "utf8");
  for (const markup of [homepage, work]) {
    assert.doesNotMatch(markup, /<meta[^>]+name=["']robots["'][^>]+noindex/i);
  }
  const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
  assert.match(sitemap, /<loc>https:\/\/miebaka-portfolio\.vercel\.app\/<\/loc>/);
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
  for (const path of ["reports", "Samples from Figma", "klat_magazine", "docs", "graphify-out", "output"]) {
    await assert.rejects(access(new URL("../dist/" + path, import.meta.url)));
  }
  await assert.rejects(access(new URL("../dist/data/drafts.js", import.meta.url)));
  await assert.rejects(access(new URL("../dist/js/core/footer-scene.js", import.meta.url)));
  for (const file of await walk(dist)) {
    const shippedPath = file.slice(dist.length + 1).replaceAll("\\", "/");
    assert.doesNotMatch(
      shippedPath,
      /(?:^|\/)(?:docs|reports|drafts?|samples from figma|klat_magazine|graphify-out|output)(?:\/|$)|\.map$/i,
    );
  }
});

test("Last.fm listening is restored through a server-only key and truthful privacy copy", async () => {
  const site = await readFile(join(dist, "js", "main.js"), "utf8");
  const client = await readFile(join(dist, "js", "render", "now-playing.js"), "utf8");
  const server = await readFile(join(root, "api", "now-playing.js"), "utf8");
  const config = await readFile(join(dist, "data", "site-config.js"), "utf8");
  const privacy = await readFile(join(dist, "privacy.html"), "utf8");
  assert.match(site, /initNowPlaying/);
  assert.match(client, /\/api\/now-playing/);
  assert.doesNotMatch(client, /LASTFM_API_KEY|ws\.audioscrobbler\.com/);
  assert.match(server, /process\.env\.LASTFM_API_KEY/);
  assert.match(config, /lastfmUser/);
  assert.match(privacy, /Last\.fm/);
  assert.match(privacy, /Geist text fonts load from jsDelivr/);
  assert.match(privacy, /colour-theme and motion preferences/);
  for (const unused of [
    "assets/fonts/Archivo-Variable.woff2",
    "assets/fonts/FinlandicaText-Variable.woff2",
    "assets/fonts/HostGrotesk-Variable.woff2",
    "api/lib/mail-service.js",
    "docs/work-filing-cabinet-threejs.md",
  ]) await assert.rejects(access(join(root, unused)), unused);
});

test("documentation and example contact origins follow active code, not retired systems", async () => {
  const readme = await readFile(join(root, "README.md"), "utf8");
  const engineering = await readFile(join(root, "engineering-specification.md"), "utf8");
  const env = await readFile(join(root, ".env.example"), "utf8");
  const config = await readFile(join(root, "data", "site-config.js"), "utf8");
  const docs = await readFile(join(root, "docs", "TYPOGRAPHY-SYSTEM.md"), "utf8");
  const allowedOrigin = env.match(/^CONTACT_ALLOWED_ORIGINS=(.+)$/m)?.[1];
  assert.equal(new URL(allowedOrigin).origin, new URL(SITE.canonicalUrl).origin,
    "sample contact origin must match the actual canonical host");
  for (const module of ["data/projects.js", "data/case-studies.js", "styles/tokens.css", "styles/project-folders.css"]) {
    assert.ok(readme.includes(module), `README must name the actual source: ${module}`);
  }
  assert.ok(readme.includes("jsDelivr"));
  assert.ok(engineering.includes("api/contact.js"));
  assert.ok(engineering.includes("api/now-playing.js"), "active Last.fm boundary must be documented");
  assert.ok(docs.includes("Material Symbols Outlined"));
  assert.ok(config.includes("lastfmUser"), "active profile must have one owner");
});

test("retired source systems cannot return unnoticed", async () => {
  for (const path of [
    "styles/cohesion.css",
    "styles/editorial-system.css",
    "styles/swiss.css",
    "js/core/case-rail.js",
    "js/core/motion-director.js",
    "js/core/kinetic.js",
  ])
    await assert.rejects(access(join(root, path)), path);
  const main = await readFile(join(root, "js", "main.js"), "utf8");
  const styles = await readFile(join(root, "styles", "main.css"), "utf8");
  assert.doesNotMatch(main, /kinetic|case-rail|motion-director/i);
  // Every stylesheet must be imported or explicitly page-scoped; no orphaned
  // compatibility or override file can silently ship.
  const imports = [...styles.matchAll(/@import url\("([^"]+)"\)/g)].map(match => match[1]);
  const available = (await readdir(join(root, "styles"))).filter(name => name.endsWith(".css")).sort();
  assert.deepEqual(available, [...imports, "main.css"].sort());
  assert.doesNotMatch(styles, /reference-overrides\.css/);
  const css = (await Promise.all(imports.map(name => readFile(join(root, "styles", name), "utf8")))).join("\n");
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(source, /\.(?:theme-cord|theme-toggle|site-nav__identity|site-nav__availability|mobile-tabbar|practice-standard|hero-noir|project-archive__preview-frame|service-swatch|service-detail|about-evidence|about-portrait)(?![\w-])/);
  assert.doesNotMatch(styles, /(?:base|components|sections|tokens)\//);
});

test("retired page prototypes and temporary motion engines are absent", async () => {
  const css = await readFile(join(root, "styles", "pages-v4.css"), "utf8");
  const types = await readFile(join(root, "styles", "tokens.css"), "utf8");
  const script = await readFile(join(root, "js", "main.js"), "utf8");
  assert.doesNotMatch(css, /decision-field|experiment-tunnel|disciplines-index|impeccable-motion/);
  assert.doesNotMatch(css, /experiments-loader|overflow:hidden;background:var\(--ref-neutral-94\)/);
  assert.doesNotMatch(css, /\.no-js \.experiments-spatial__stage|\.no-js \.experiment-poster/);
  assert.doesNotMatch(types, /experiment-tunnel/);
  assert.doesNotMatch(script, /scroll-experience|editorial-reveals|initMotionLanguage/);
  assert.doesNotMatch(css, /project-(?:image|copy)-enter/);
});

test("case chapters and Home proof remain visible without reveal observers", async () => {
  const css = await readFile(join(root, "styles", "pages-v4.css"), "utf8");
  const homeCss = await readFile(join(root, "styles", "home.css"), "utf8");
  const main = await readFile(join(root, "js", "main.js"), "utf8");
  const home = await readFile(join(root, "index.html"), "utf8");
  assert.doesNotMatch(css, /\\.has-js \\.case-page \\.case-chapter/);
  assert.doesNotMatch(homeCss, /data-editorial-reveal|home-reveal/);
  assert.doesNotMatch(main, /initEditorialReveals|initScrollExperience|initMotionLanguage/);
  assert.doesNotMatch(home, /data-editorial-reveal/);
  for (const slug of ["rivo", "tedx-rsu", "chopbox"]) {
    const caseHtml = await readFile(join(dist, "work", slug + ".html"), "utf8");
    assert.match(caseHtml, /class="case-chapter/);
    assert.match(caseHtml, /class="case-chapter__body"/);
  }
});

test("Experiments has a complete, navigable and image-rich no-JS gallery", async () => {
  const manifest = JSON.parse(await readFile(join(root,"assets","experiments","metadata.json"),"utf8"));
  for (const directory of [root,dist]) {
    const page = await readFile(join(directory,"experiments.html"),"utf8");
    assert.match(page, /<noscript><section class="experiments-static"/);
    for (const destination of ["work.html","about.html","essays.html","contact.html"])
      assert.match(page, new RegExp('href="' + destination + '"'));
    for (const file of Object.keys(manifest))
      assert.ok(page.includes(encodeURIComponent(file)), "Missing static experiment: " + file);
    assert.equal((page.match(/class="experiments-static__meta"/g)||[]).length, Object.keys(manifest).length);
  }
});
