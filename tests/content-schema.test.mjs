import test from "node:test";
import assert from "node:assert/strict";
import { validateContent } from "../scripts/content-schema.mjs";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
  navigation: { primary: [{ key: "work", label: "Work", href: "work.html" }] },
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
test("duplicate routes in one navigation group are rejected", () => {
  expectError(fixture({ navigation: { primary: [{ href: "work.html" }, { href: "./work.html#projects" }] } }), "ROUTE_DUPLICATE", "navigation.primary[1].href");
});
test("the same route can appear in different navigation placements", () => {
  assert.equal(validateContent(fixture({ navigation: { primary: [{ href: "work.html" }], footer: [{ href: "work.html" }] } })).ok, true);
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
