import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(join(root, file), "utf8");

test("design documentation names the implemented ultramarine identity", async () => {
  const [brief, tokens] = await Promise.all([
    read("DESIGN.md"),
    read("styles/foundations.css")
  ]);
  for (const source of [brief]) {
    assert.match(source, /ultramarine/i);
    assert.doesNotMatch(source, /forest[- ]green|deep green ink|green accents|pale sage/i);
  }
  for (const contract of [
    /--ref-ultramarine:oklch\(0.30849 0.1630241 263.4279283\)/,
    /--ref-air:oklch\(0.9496069 0.0237882 270.3425562\)/,
    /--ref-paper:oklch\(0.9822037 0.0041209 271.3701277\)/,
    /--ref-midnight:oklch\(0.1860346 0.054866 265.18549\)/,
    /--ref-blue-30:oklch\(0.4077383 0.1703921 265.4406785\)/,
    /--ref-blue-80:oklch\(0.8288005 0.0847627 269.7365604\)/,
    /--ref-coral-30:oklch\(0.4118179 0.1299018 28.8309974\)/,
    /--ref-coral-75:oklch\(0.7977425 0.1166691 30.7978838\)/
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

test("every published case exposes the approved five-part evidence narrative", () => {
  const published = Object.values(SITE.caseStudies).filter(study => study.status === "published");
  assert.ok(published.length > 0);
  for (const study of published) {
    const chapters = new Set(study.chapters?.map(chapter => chapter.id));
    for (const id of ["decision", "system", "survival", "encounter", "results"]) assert.ok(chapters.has(id), `${study.title} needs ${id}`);
    const proof = new Map(study.proof?.map(item => [item.type, item]));
    for (const type of ["decision", "system", "survival"]) assert.ok(proof.has(type), `${study.title} needs ${type} proof`);
    for (const item of proof.values()) {
      assert.match(item.strength, /^(verified|partial)$/);
      assert.ok(item.statement.length >= 40, `${study.title} ${item.type} proof needs a bounded statement`);
    }
  }
});
