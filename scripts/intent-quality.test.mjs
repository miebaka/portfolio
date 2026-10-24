import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(join(root, file), "utf8");

test("design documentation names the implemented ultramarine identity", async () => {
  const [brief, system, tokens] = await Promise.all([
    read("DESIGN.md"),
    read("docs/design-system-v3.md"),
    read("styles/foundations.css")
  ]);
  for (const source of [brief, system]) {
    assert.match(source, /ultramarine/i);
    assert.doesNotMatch(source, /forest[- ]green|deep green ink|green accents|pale sage/i);
  }
  for (const contract of [
    /--ref-ultramarine:#002080/,
    /--ref-air:#e8eeff/,
    /--ref-paper:#f8f9fc/,
    /--ref-midnight:#07112b/,
    /--ref-blue-30:#1c3da4/,
    /--ref-blue-80:#b1c5ff/,
    /--ref-coral-30:#83251d/,
    /--ref-coral-75:#ffa08f/
  ]) assert.match(tokens, contract);
});

test("project introductions expose specific propositions rather than generic labels", () => {
  const publicProjects = SITE.projects.filter(project => project.status !== "private");
  assert.ok(publicProjects.length > 0);
  assert.equal(new Set(publicProjects.map(project => project.tagline)).size, publicProjects.length);
  for (const project of publicProjects) {
    assert.ok(project.tagline.length >= 24, `${project.slug} needs a useful proposition`);
    assert.doesNotMatch(project.tagline, /unleash|transform your|next level|all-in-one|innovative solutions/i);
  }
});

test("every published case makes context decision system and production visible", () => {
  const published = Object.values(SITE.caseStudies).filter(study => study.status === "published");
  assert.ok(published.length > 0);
  for (const study of published) {
    const chapters = new Set(study.chapters?.map(chapter => chapter.id));
    for (const id of ["context", "decision", "system", "production"]) assert.ok(chapters.has(id), `${study.title} needs ${id}`);
    const proof = new Map(study.proof?.map(item => [item.type, item]));
    for (const type of ["decision", "system", "survival"]) assert.ok(proof.has(type), `${study.title} needs ${type} proof`);
    for (const item of proof.values()) {
      assert.match(item.strength, /^(verified|partial)$/);
      assert.ok(item.statement.length >= 40, `${study.title} ${item.type} proof needs a bounded statement`);
    }
  }
});
