import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SITE } from "../data/site.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { renderProjectArchiveMarkup } from "../js/render/projects.js";

const root = resolve(new URL("..", import.meta.url).pathname);

for (const project of SITE.projects) {
  const study = SITE.caseStudies?.[project.slug];
  if (!study || study.status !== "published" || project.status === "private") continue;
  const path = resolve(root, "work", `${project.slug}.html`);
  const source = await readFile(path, "utf8");
  const article = `<article class="case" data-mount="case">${renderCaseMarkup(SITE, project.slug, "../")}</article>`;
  const pattern = /<article class="case" data-mount="case"(?: data-prerendered="true")?>[\s\S]*?<\/article>/;
  if (!pattern.test(source)) throw new Error(`Could not find case shell: ${project.slug}`);
  const updated = source.replace(pattern, article);
  await writeFile(path, updated);
}

const workPath = resolve(root, "work.html");
const workSource = await readFile(workPath, "utf8");
const workMarkup = `<div class="project-archive__list editorial-index editorial-index--archive" data-project-archive>${renderProjectArchiveMarkup(SITE.projects)}</div>`;
const workPattern = /(<div class="project-archive__head">[\s\S]*?<\/div>\s*)<div(?: class="[^"]*")? data-project-archive(?: data-prerendered="true")?>[\s\S]*?(?=\s*<\/section>)/;
if (!workPattern.test(workSource)) throw new Error("Could not find Work archive fallback.");
const workUpdated = workSource.replace(workPattern, `$1${workMarkup}`);
await writeFile(workPath, workUpdated);

console.log("Synchronized authored Work and case-study fallbacks.");
