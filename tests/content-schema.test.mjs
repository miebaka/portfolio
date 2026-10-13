import test from "node:test";
import assert from "node:assert/strict";
import { validateContent } from "../scripts/content-schema.mjs";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const project = (overrides = {}) => ({
  slug: "sample", title: "Sample", category: "Identity", tagline: "A useful identity.",
  tags: ["Brand identity"], year: "2025", tone: "#002080", cover: "sample-hero",
  featured: true, status: "published", ...overrides
});
const study = (overrides = {}) => ({
  title: "Sample", tagline: "A useful identity.", status: "draft",
  media: [{ label: "Identity", src: "sample-hero", w: 1080, h: 810, alt: "The sample identity on paper." }],
  ...overrides
});
const fixture = (overrides = {}) => ({
  siteConfig: { name: "Designer", role: "Brand designer", email: "designer@example.com", location: "Lagos, Nigeria", socials: [], canonicalUrl: "https://miebaka.design/" },
  services: [{ title: "Brand identity", description: "Useful identity systems.", preview: "sample-hero" }],
  writing: [{ title: "A design essay", href: "writing/essay.html", date: "2024-02-29", summary: "An authored design essay.", readingTime: "5 min read" }],
  clients: [{ name: "Sample client", logo: "assets/images/clients/sample.svg", logoW: 120, logoH: 40 }],
  navigation: {
    routes: [{ key: "work", label: "Work", href: "work.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] }],
    primary: [{ key: "work", label: "Work", href: "work.html" }]
  },
  projects: [project()], caseStudies: { sample: study() }, ...overrides
});
const expectError = (content, code, path) => {
  const result = validateContent(content);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === code && error.path === path), JSON.stringify(result));
  result.errors.forEach(error => assert.equal(typeof error.message, "string"));
};

test("valid content returns the original value without mutation", () => {
  const content = fixture();
  const before = structuredClone(content);
  assert.deepEqual(validateContent(content), { ok: true, value: content });
  assert.deepEqual(content, before);
});
test("duplicate project slugs are rejected", () => {
  expectError(fixture({ projects: [project(), project()] }), "PROJECT_SLUG_DUPLICATE", "projects[1].slug");
});
test("missing project slugs and required metadata are rejected", () => {
  expectError(fixture({ projects: [project({ slug: "", title: "" })] }), "PROJECT_SLUG_INVALID", "projects[0].slug");
  expectError(fixture({ projects: [project({ title: "" })] }), "PROJECT_FIELD_REQUIRED", "projects[0].title");
});
test("invalid and missing publication states are rejected", () => {
  for (const status of ["ready", undefined]) {
    expectError(fixture({ projects: [project({ status })] }), "PROJECT_STATUS_INVALID", "projects[0].status");
  }
});
test("published projects require a case study", () => {
  expectError(fixture({ caseStudies: {} }), "PUBLISHED_CASE_MISSING", "projects[0].slug");
});
test("published articles can use their direct writing route", () => {
  assert.equal(validateContent(fixture({ projects: [project({ href: "writing/sample.html" })], caseStudies: {} })).ok, true);
  expectError(fixture({ projects: [project({ href: "work/sample.html" })], caseStudies: {} }), "PUBLISHED_CASE_MISSING", "projects[0].slug");
});
test("media requires positive dimensions and a meaningful alternative", () => {
  for (const [field, value, code] of [["w", undefined, "MEDIA_DIMENSIONS_INVALID"], ["h", 0, "MEDIA_DIMENSIONS_INVALID"], ["alt", " ", "MEDIA_ALT_REQUIRED"]]) {
    const media = { ...study().media[0], [field]: value };
    expectError(fixture({ caseStudies: { sample: study({ media: [media] }) } }), code, `caseStudies.sample.media[0].${field}`);
  }
});
test("media source and loading priority are validated", () => {
  expectError(fixture({ caseStudies: { sample: study({ media: [{ ...study().media[0], src: "" }] }) } }), "MEDIA_FIELD_REQUIRED", "caseStudies.sample.media[0].src");
  expectError(fixture({ caseStudies: { sample: study({ media: [{ ...study().media[0], loading: "fast" }] }) } }), "MEDIA_LOADING_INVALID", "caseStudies.sample.media[0].loading");
});
test("next-project references must resolve to a public project", () => {
  expectError(fixture({ caseStudies: { sample: study({ next: { slug: "missing", title: "Missing" } }) } }), "NEXT_PROJECT_MISSING", "caseStudies.sample.next.slug");
  expectError(fixture({ projects: [project({ status: "private" })], caseStudies: { sample: study({ next: { slug: "sample", title: "Sample" } }) } }), "NEXT_PROJECT_PRIVATE", "caseStudies.sample.next.slug");
});
test("next cannot route a published writing project to a nonexistent case page", () => {
  expectError(fixture({ projects: [project(), project({ slug: "essay", featured: false, href: "writing/essay.html" })], caseStudies: { sample: study({ next: { slug: "essay", title: "Essay" } }) } }), "NEXT_CASE_MISSING", "caseStudies.sample.next.slug");
});
test("next cannot route an unready project without a case destination", () => {
  expectError(fixture({ projects: [project(), project({ slug: "unready", status: "coming-soon", featured: false })], caseStudies: { sample: study({ next: { slug: "unready", title: "Unready" } }) } }), "NEXT_CASE_MISSING", "caseStudies.sample.next.slug");
});
test("next can link to an existing draft case destination", () => {
  assert.equal(validateContent(fixture({ projects: [project(), project({ slug: "up-next", status: "coming-soon", featured: false })], caseStudies: { sample: study({ next: { slug: "up-next", title: "Up next" } }), "up-next": study() } })).ok, true);
});
test("every public content domain rejects missing or null records", () => {
  for (const [domain, code] of [["siteConfig", "SITE_CONFIG_INVALID"], ["services", "SERVICES_INVALID"], ["writing", "WRITING_INVALID"], ["clients", "CLIENTS_INVALID"]]) {
    for (const value of [undefined, null]) expectError(fixture({ [domain]: value }), code, domain);
  }
});
test("site configuration requires usable identity and contact metadata", () => {
  for (const field of ["name", "role", "location"]) expectError(fixture({ siteConfig: { ...fixture().siteConfig, [field]: "" } }), "SITE_FIELD_REQUIRED", `siteConfig.${field}`);
  expectError(fixture({ siteConfig: { ...fixture().siteConfig, email: "invalid" } }), "SITE_EMAIL_INVALID", "siteConfig.email");
  expectError(fixture({ siteConfig: { ...fixture().siteConfig, socials: null } }), "SOCIALS_INVALID", "siteConfig.socials");
  expectError(fixture({ siteConfig: { ...fixture().siteConfig, socials: [{ label: "Blog", href: "javascript:alert(1)" }] } }), "SOCIAL_URL_INVALID", "siteConfig.socials[0].href");
});
test("services require their displayed copy and media preview", () => {
  expectError(fixture({ services: {} }), "SERVICES_INVALID", "services");
  expectError(fixture({ services: [null] }), "SERVICE_INVALID", "services[0]");
  for (const field of ["title", "description", "preview"]) expectError(fixture({ services: [{ ...fixture().services[0], [field]: "" }] }), "SERVICE_FIELD_REQUIRED", `services[0].${field}`);
});
test("writing requires titles summaries and valid dates", () => {
  expectError(fixture({ writing: [null] }), "WRITING_ENTRY_INVALID", "writing[0]");
  for (const field of ["title", "summary"]) expectError(fixture({ writing: [{ ...fixture().writing[0], [field]: "" }] }), "WRITING_FIELD_REQUIRED", `writing[0].${field}`);
  for (const date of [undefined, "", "yesterday", "2026-02-30", "2025-02-29", "2026-13-01"]) expectError(fixture({ writing: [{ ...fixture().writing[0], date }] }), "WRITING_DATE_INVALID", "writing[0].date");
  expectError(fixture({ writing: [{ ...fixture().writing[0], readingTime: "" }] }), "WRITING_FIELD_REQUIRED", "writing[0].readingTime");
});
test("writing rejects unsafe or invalid hrefs", () => {
  for (const href of [undefined, "", "javascript:alert(1)", "../essay.html", "//example.com/essay", "https://", "https://user:password@example.com/essay", "ftp://example.com/essay"]) expectError(fixture({ writing: [{ ...fixture().writing[0], href }] }), "WRITING_URL_INVALID", "writing[0].href");
});
test("writing permits valid local or HTTPS article destinations", () => {
  for (const href of ["writing/essay.html", "https://example.com/essay"]) assert.equal(validateContent(fixture({ writing: [{ ...fixture().writing[0], href }] })).ok, true);
});
test("client proof requires names and valid logo metadata", () => {
  expectError(fixture({ clients: {} }), "CLIENTS_INVALID", "clients");
  expectError(fixture({ clients: [null] }), "CLIENT_INVALID", "clients[0]");
  expectError(fixture({ clients: [{ name: "" }] }), "CLIENT_NAME_REQUIRED", "clients[0].name");
  expectError(fixture({ clients: [{ ...fixture().clients[0], logo: "../private.svg" }] }), "CLIENT_LOGO_INVALID", "clients[0].logo");
  for (const field of ["logoW", "logoH"]) expectError(fixture({ clients: [{ ...fixture().clients[0], [field]: undefined }] }), "CLIENT_DIMENSIONS_INVALID", `clients[0].${field}`);
  expectError(fixture({ clients: [{ ...fixture().clients[0], optical: -1 }] }), "CLIENT_OPTICAL_INVALID", "clients[0].optical");
});
test("client wordmarks can omit logo metadata", () => {
  assert.equal(validateContent(fixture({ clients: [{ name: "Sample client" }] })).ok, true);
});
test("duplicate routes in one navigation group are rejected", () => {
  expectError(fixture({ navigation: { primary: [{ href: "work.html" }, { href: "./work.html#projects" }] } }), "ROUTE_DUPLICATE", "navigation.primary[1].href");
});
test("canonical registry rejects duplicate keys and invalid placement metadata", () => {
  const route = { key: "work", label: "Work", href: "work.html", includeIn: ["primary", "index", "footer", "build", "sitemap"] };
  expectError(fixture({ navigation: { routes: [route, { ...route, href: "about.html" }] } }), "ROUTE_KEY_DUPLICATE", "navigation.routes[1].key");
  for (const includeIn of [undefined, [], ["unknown"], ["index", "index"]]) {
    expectError(fixture({ navigation: { routes: [{ ...route, includeIn }] } }), "ROUTE_PLACEMENT_INVALID", "navigation.routes[0].includeIn");
  }
  expectError(fixture({ navigation: { routes: [{ ...route, label: "" }] } }), "ROUTE_FIELD_REQUIRED", "navigation.routes[0].label");
  expectError(fixture({ navigation: { routes: [{ ...route, href: "./work.html#fragment" }] } }), "ROUTE_CANONICAL_INVALID", "navigation.routes[0].href");
});
test("registry sitemap routes require a build placement and a canonical HTTPS origin", () => {
  const route = { key: "work", label: "Work", href: "work.html", includeIn: ["build", "sitemap"] };
  for (const canonicalUrl of [undefined, "https://", "http://example.com/", "https://example.com/base/", "https://example.com/?query=1"]) {
    expectError(fixture({ siteConfig: { ...fixture().siteConfig, canonicalUrl }, navigation: { routes: [route] } }), "SITE_CANONICAL_INVALID", "siteConfig.canonicalUrl");
  }
  expectError(fixture({ navigation: { routes: [{ ...route, includeIn: ["sitemap"] }] } }), "ROUTE_BUILD_REQUIRED", "navigation.routes[0].includeIn");
});
test("content requires the registry and canonical origin consumed by the builder", () => {
  for (const routes of [undefined, null, {}]) {
    expectError(fixture({ navigation: { primary: fixture().navigation.primary, routes } }), "ROUTES_INVALID", "navigation.routes");
  }
  for (const canonicalUrl of [undefined, null, "", "http://example.com/", "https://example.com/path/"]) {
    expectError(fixture({ siteConfig: { ...fixture().siteConfig, canonicalUrl } }), "SITE_CANONICAL_INVALID", "siteConfig.canonicalUrl");
  }
  const result = validateContent(fixture({ siteConfig: { ...fixture().siteConfig, canonicalUrl: undefined }, navigation: { primary: fixture().navigation.primary } }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some(error => error.code === "ROUTES_INVALID"));
  assert.ok(result.errors.some(error => error.code === "SITE_CANONICAL_INVALID"));
});
test("the same route can appear in different navigation placements", () => {
  assert.equal(validateContent(fixture({ navigation: { ...fixture().navigation, primary: [{ href: "work.html" }], footer: [{ href: "work.html" }] } })).ok, true);
});
test("invalid route traversal and unsafe URLs are rejected", () => {
  for (const href of ["../work.html", "javascript:alert(1)", "", "//example.com/work.html"]) {
    expectError(fixture({ navigation: { primary: [{ href }] } }), "ROUTE_INVALID", "navigation.primary[0].href");
  }
});
test("published case studies require a published project", () => {
  expectError(fixture({ projects: [project({ status: "coming-soon" })], caseStudies: { sample: study({ status: "published" }) } }), "CASE_PROJECT_NOT_PUBLISHED", "caseStudies.sample.status");
  expectError(fixture({ caseStudies: { sample: study({ status: "ready" }) } }), "CASE_STATUS_INVALID", "caseStudies.sample.status");
});
test("draft case narratives remain locked despite a published project listing", () => {
  const markup = renderCaseMarkup(fixture(), "sample");
  assert.match(markup, /Coming soon/);
  assert.doesNotMatch(markup, /case-index|sample-hero/);
});
test("published case narratives render when their project is published", () => {
  const markup = renderCaseMarkup(fixture({ caseStudies: { sample: study({ status: "published" }) } }), "sample");
  assert.match(markup, /case-index/);
  assert.doesNotMatch(markup, /Coming soon/);
});
test("malformed content returns structured errors instead of throwing", () => {
  for (const content of [null, {}, { navigation: null, projects: [null], caseStudies: { sample: null } }]) {
    assert.equal(validateContent(content).ok, false);
  }
});

test("invalid content fails CLI and direct build without touching previous output", async t => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-content-gate-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "scripts"));
  await mkdir(join(directory, "js", "render"), { recursive: true });
  await mkdir(join(directory, "dist"));
  await cp(new URL("../data", import.meta.url), join(directory, "data"), { recursive: true });
  for (const file of ["build-site.mjs", "content-schema.mjs", "validate-content.mjs"]) {
    await cp(new URL(`../scripts/${file}`, import.meta.url), join(directory, "scripts", file));
  }
  await cp(new URL("../js/render/case-markup.js", import.meta.url), join(directory, "js", "render", "case-markup.js"));
  await writeFile(join(directory, "package.json"), '{"type":"module"}');
  const previousOutput = "Keep this previously built page.";
  await writeFile(join(directory, "dist", "index.html"), previousOutput);
  await writeFile(join(directory, "data", "projects.js"), `export const PROJECT_STATUS = { PUBLISHED: "published", COMING_SOON: "coming-soon", PRIVATE: "private" };\nexport const projects = ${JSON.stringify([project({ status: "invalid" })])};`);
  for (const script of ["validate-content.mjs", "build-site.mjs"]) {
    const result = spawnSync(process.execPath, [join(directory, "scripts", script)], { encoding: "utf8" });
    assert.equal(result.status, 1, script);
    assert.match(result.stderr, /PROJECT_STATUS_INVALID/, script);
    assert.equal(await readFile(join(directory, "dist", "index.html"), "utf8"), previousOutput);
  }
});

test("adding a validated root route generates its build output and sitemap entry", async t => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-route-build-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceRoot = new URL("../", import.meta.url);
  for (const folder of ["data", "scripts", "js", "styles", "work", "writing"]) await cp(new URL(folder, sourceRoot), join(directory, folder), { recursive: true });
  for (const entry of await readdir(sourceRoot)) {
    if (/\.html$/.test(entry) || ["robots.txt", "package.json"].includes(entry)) await cp(new URL(entry, sourceRoot), join(directory, entry));
  }
  for (const folder of ["assets", "node_modules"]) await symlink(new URL(folder, sourceRoot).pathname, join(directory, folder), "dir");
  const navigationModule = await import("../data/navigation.js");
  assert.ok(Array.isArray(navigationModule.navigation.routes), "Build routes need a canonical registry");
  const routes = [...navigationModule.navigation.routes, { key: "studio", label: "Studio", href: "studio.html", includeIn: ["index", "footer", "build", "sitemap"] }];
  await writeFile(join(directory, "data", "navigation.js"), `export const navigation = ${JSON.stringify({ routes, primary: routes.filter(route => route.includeIn.includes("primary")) })};`);
  await writeFile(join(directory, "studio.html"), '<html><head><link rel="canonical" href="https://miebaka.design/studio.html"></head><body><h1>Studio</h1></body></html>');
  const result = spawnSync(process.execPath, [join(directory, "scripts", "build-site.mjs")], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  assert.match(await readFile(join(directory, "dist", "studio.html"), "utf8"), /<h1>Studio<\/h1>/);
  assert.match(await readFile(join(directory, "dist", "sitemap.xml"), "utf8"), /<loc>https:\/\/miebaka.design\/studio.html<\/loc>/);
  assert.match(await readFile(join(directory, "dist", "index.html"), "utf8"), /href="studio.html">Studio<\/a>/);
  assert.match(await readFile(join(directory, "dist", "writing", "when-the-swoosh-lost-its-soul.html"), "utf8"), /href="\.\.\/studio.html">Studio<\/a>/);
});

test("accepted local writing URL variants build their pathname and retain authored hrefs", async t => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-writing-build-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceRoot = new URL("../", import.meta.url);
  for (const folder of ["data", "scripts", "js", "styles", "work", "writing"]) await cp(new URL(folder, sourceRoot), join(directory, folder), { recursive: true });
  for (const entry of await readdir(sourceRoot)) {
    if (/\.html$/.test(entry) || ["robots.txt", "package.json"].includes(entry)) await cp(new URL(entry, sourceRoot), join(directory, entry));
  }
  for (const folder of ["assets", "node_modules"]) await symlink(new URL(folder, sourceRoot).pathname, join(directory, folder), "dir");
  const pathname = "writing/when-the-swoosh-lost-its-soul.html";
  const authoredSource = await readFile(join(directory, pathname), "utf8");
  for (const href of [`./${pathname}`, `${pathname}#main`, `${pathname}?source=index`, `./${pathname}?source=index#main`]) {
    await t.test(href, async () => {
      const writing = [{ title: "An authored essay", href, date: "2024-02-29", summary: "An authored summary." }];
      const module = `export const writing = ${JSON.stringify(writing)};`;
      await writeFile(join(directory, "data", "writing.js"), module);
      const result = spawnSync(process.execPath, [join(directory, "scripts", "build-site.mjs")], { encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
      const builtArticle = await readFile(join(directory, "dist", pathname), "utf8");
      assert.ok(builtArticle.includes(authoredSource.match(/<h1[\s\S]*?<\/h1>/)[0]));
      const sitemap = await readFile(join(directory, "dist", "sitemap.xml"), "utf8");
      assert.ok(sitemap.includes('<loc>https://miebaka.design/writing/when-the-swoosh-lost-its-soul.html</loc>'));
      assert.doesNotMatch(sitemap, /#main|\?source=index/);
      assert.equal(await readFile(join(directory, "dist", "data", "writing.js"), "utf8"), module);
    });
  }
});

test("missing build registry and origin fail with validation errors before dist changes", async t => {
  const directory = await mkdtemp(join(tmpdir(), "portfolio-registry-gate-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(join(directory, "scripts"));
  await mkdir(join(directory, "js", "render"), { recursive: true });
  await mkdir(join(directory, "dist"));
  await cp(new URL("../data", import.meta.url), join(directory, "data"), { recursive: true });
  for (const file of ["build-site.mjs", "content-schema.mjs", "validate-content.mjs"]) await cp(new URL(`../scripts/${file}`, import.meta.url), join(directory, "scripts", file));
  await cp(new URL("../js/render/case-markup.js", import.meta.url), join(directory, "js", "render", "case-markup.js"));
  await writeFile(join(directory, "package.json"), '{"type":"module"}');
  const previousOutput = "Keep the prior output.";
  await writeFile(join(directory, "dist", "index.html"), previousOutput);
  const { navigation } = await import("../data/navigation.js");
  const { siteConfig } = await import("../data/site-config.js");
  const missingRegistry = { ...navigation };
  delete missingRegistry.routes;
  const missingOrigin = { ...siteConfig };
  delete missingOrigin.canonicalUrl;
  for (const [nav, config, code] of [[missingRegistry, siteConfig, "ROUTES_INVALID"], [navigation, missingOrigin, "SITE_CANONICAL_INVALID"]]) {
    await writeFile(join(directory, "data", "navigation.js"), `export const navigation = ${JSON.stringify(nav)};`);
    await writeFile(join(directory, "data", "site-config.js"), `export const siteConfig = ${JSON.stringify(config)};`);
    for (const script of ["validate-content.mjs", "build-site.mjs"]) {
      const result = spawnSync(process.execPath, [join(directory, "scripts", script)], { encoding: "utf8" });
      assert.equal(result.status, 1, script);
      assert.match(result.stderr, new RegExp(`\\[${code}\\]`), script);
      assert.doesNotMatch(result.stderr, /TypeError|ERR_MODULE_NOT_FOUND/, script);
      assert.equal(await readFile(join(directory, "dist", "index.html"), "utf8"), previousOutput);
    }
  }
});
