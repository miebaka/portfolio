import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { renderExperimentMetadata } from "../js/render/metadata-strip.js";
import { renderNextEssayMarkup } from "../js/render/next-content.js";
import { renderPageLoaderMarkup } from "../js/core/page-loader.js";
import { assertValidContent } from "./validate-content.mjs";
import { normalizeHead, renderFooter, renderHeader } from "./render-partials.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");

const ensureCopy = async (source, target) => {
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, { recursive: true });
};

async function bundleCss(file, seen = new Set()) {
  const absolute = resolve(file);
  if (seen.has(absolute)) return "";
  seen.add(absolute);
  const css = await readFile(absolute, "utf8");
  const importPattern = /@import\s+(?:url\()?\s*["']([^"']+)["']\s*\)?(?:\s+layer\(([^)]+)\))?\s*;/g;
  let result = "";
  let cursor = 0;
  for (const match of css.matchAll(importPattern)) {
    result += css.slice(cursor, match.index);
    const imported = await bundleCss(resolve(dirname(absolute), match[1]), seen);
    result += match[2] ? `@layer ${match[2]}{${imported}}` : imported;
    cursor = match.index + match[0].length;
  }
  result += css.slice(cursor);
  const dataUrls = [];
  result = result.replace(/url\((['"])data:[\s\S]*?\1\)/g, value => `__DATA_URL_${dataUrls.push(value) - 1}__`);
  result = result.replace(/url\((['"]?)(?!https?:|\/)([^)'"?#]+)([^)'"#]*)(?:\1)\)/g, (_all, _quote, url, suffix) => {
    const rebased = relative(join(root, "styles"), resolve(dirname(absolute), url)).replaceAll("\\", "/");
    return `url("${rebased}${suffix}")`;
  });
  return result.replace(/__DATA_URL_(\d+)__/g, (_all, index) => dataUrls[Number(index)]);
}

async function copyJsGraph(entry) {
  const queue = [resolve(root, entry)];
  const seen = new Set();
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    const source = await readFile(file, "utf8");
    await ensureCopy(file, join(output, relative(root, file)));
    for (const match of source.matchAll(/(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.[^"']+)["']/g)) {
      const dependency = resolve(dirname(file), match[1]);
      queue.push(dependency.endsWith(".js") ? dependency : `${dependency}.js`);
    }
  }
}

async function htmlFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await htmlFiles(path));
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
}

async function outputFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await outputFiles(path));
    else found.push(path);
  }
  return found;
}

// Validate before touching dist, including when this script runs directly.
const content = assertValidContent();
const { renderClientProofMarkup, renderHomeProjectList, renderProjectArchiveMarkup } = await import("../js/render/projects.js");
const { renderServiceSwatchesMarkup } = await import("../js/render/sections.js");
const { escapeHTML: esc } = await import("../js/utilities/dom.js");
const routes = content.navigation.routes;
const rootFiles = routes.filter(route => route.includeIn.includes("build")).map(route => route.href);
// Authored links may contain ./, a query or a fragment; filesystem and sitemap
// destinations use only the normalized local pathname, while href data stays intact.
const localPath = href => typeof href === "string" && !/^https:\/\//i.test(href)
  ? new URL(href, content.siteConfig.canonicalUrl).pathname.slice(1) : "";
const caseProjects = content.projects.filter(project => project.status !== "private" && content.caseStudies[project.slug] && !localPath(project.href).startsWith("essays/"));
const articleFiles = [...new Set(content.writing.map(entry => localPath(entry.href)).filter(path => path.startsWith("essays/")))];
const canonicalHref = href => routes.find(route => route.href === href)?.canonicalHref || href;
const canonicalUrl = href => new URL(canonicalHref(href) === "index.html" ? "" : canonicalHref(href), content.siteConfig.canonicalUrl).href;
const sitemapRoutes = [
  ...routes.filter(route => route.includeIn.includes("sitemap")).map(route => route.href),
  ...caseProjects.filter(project => content.caseStudies[project.slug].status === "published").map(project => `work/${project.slug}.html`),
  ...articleFiles
];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [...new Set(sitemapRoutes)].map(href => `  <url><loc>${canonicalUrl(href)}</loc></url>`).join("\n") + '\n</urlset>\n';
function renderShell(source, href) {
  const base = "../".repeat(href.split("/").length - 1);
  const page = routes.find(route => route.href === href)?.key || (href.startsWith("work/") ? "work" : href.startsWith("essays/") ? "writing" : "");
  let rendered = normalizeHead(source, { canonicalUrl: canonicalUrl(href), base })
    .replace(/<header(?: class="[^"]*")? data-mount="nav">[\s\S]*?<\/header>/, renderHeader({ base, page }))
    .replace(/<footer(?: class="[^"]*")? data-mount="footer">[\s\S]*?<\/footer>/, renderFooter({ base }));
  if (href === "index.html") rendered = rendered.replace(/<div data-mount="work-grid">[\s\S]*?<\/div>/, '<div class="home-project-list" data-mount="work-grid" data-prerendered="true">' + renderHomeProjectList(content.projects, content.caseStudies, base) + '</div>');
  if (href === "index.html") rendered = rendered.replace(/<div class="client-strip__viewport" data-mount="clients">[\s\S]*?<\/div>/, '<div class="client-strip__viewport" data-mount="clients" data-prerendered="true">' + renderClientProofMarkup(content.clients) + '</div>');
  if (href === "work.html") rendered = rendered.replace(/<div class="project-folder-stack" data-project-archive(?: data-prerendered="true")?>[\s\S]*?(?=\s*<\/section>)/, '<div class="project-folder-stack" data-project-archive data-prerendered="true">' + renderProjectArchiveMarkup(content.projects, base, content.caseStudies) + '</div>');
  rendered = rendered.replace(/<div data-mount="capabilities">[\s\S]*?<\/div>(?=\s*<\/section>)/, '<div class="process-sequence" data-mount="capabilities" data-prerendered="true">' + renderServiceSwatchesMarkup(content.services) + '</div>');
  if (href.startsWith("essays/")) rendered = rendered.replace(/<section class="case-next next-content article-next container"[\s\S]*?<\/section>/, renderNextEssayMarkup(href));
  if (href === "experiments.html") rendered = rendered.replace(/<dl class="metadata-strip">[\s\S]*?<\/dl>/, renderExperimentMetadata());
  return href === "index.html" ? rendered.replace(/<body\b[^>]*>/, match => match + renderPageLoaderMarkup()) : rendered;
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of rootFiles) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await writeFile(join(output, file), renderShell(await readFile(join(root, file), "utf8"), file));
}
await ensureCopy(join(root, "robots.txt"), join(output, "robots.txt"));
await ensureCopy(join(root, "llms.txt"), join(output, "llms.txt"));
try {
  await ensureCopy(join(root, "manifest.webmanifest"), join(output, "manifest.webmanifest"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
await writeFile(join(output, "sitemap.xml"), sitemap);
await ensureCopy(join(root, "data/site.js"), join(output, "data/site.js"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-logo.svg"), join(output, "assets/images/miebaka-joshua-logo.svg"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-script-name.svg"), join(output, "assets/images/miebaka-joshua-script-name.svg"));
await ensureCopy(join(root, "assets/images/clients"), join(output, "assets/images/clients"));
await ensureCopy(join(root, "assets/experiments"), join(output, "assets/experiments"));
for (const file of articleFiles) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await writeFile(join(output, file), renderShell(await readFile(join(root, file), "utf8"), file));
}

for (const project of caseProjects) {
  const slug = project.slug;
  const file = `${slug}.html`;
  const source = renderShell(await readFile(join(root, "work", file), "utf8"), `work/${file}`);
  const article = `<article class="case" data-mount="case" data-prerendered="true">${renderCaseMarkup(SITE, slug, "../")}</article>`;
  const rendered = source.replace(/<article class="case" data-mount="case"(?: data-prerendered="true")?>[\s\S]*?<\/article>/, article);
  await mkdir(join(output, "work"), { recursive: true });
  await writeFile(join(output, "work", file), rendered);
}

await mkdir(join(output, "styles"), { recursive: true });
const cssBundle = await bundleCss(join(root, "styles/main.css"));
const { transform } = await import("esbuild");
const { code: minifiedCss } = await transform(cssBundle, { loader: "css", minify: true, legalComments: "inline" });
await writeFile(join(output, "styles/main.css"), minifiedCss);
/* The Work folder surface is imported into main.css for both pages. */
await copyJsGraph("js/main.js");
await ensureCopy(join(root, "js/boot.js"), join(output, "js/boot.js"));

const allHtml = await htmlFiles(output);
const assets = new Set();
for (const file of allHtml) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/assets\/images\/optimized\/([a-z0-9_-]+\.(?:avif|webp|jpg|png))/gi)) assets.add(match[1]);
}
for (const project of SITE.projects.filter(project => project.caseReady !== false && project.cover)) {
  if (SITE.caseStudies[project.slug]?.media?.find(media => media.src === project.cover)?.remoteSrc) continue;
  for (const width of [540, 810, 1080]) for (const ext of ["avif", "webp", "jpg"]) assets.add(`${project.cover}-${width}.${ext}`);
}
for (const asset of assets) {
  const source = join(root, "assets/images/optimized", asset);
  if (!(await stat(source).catch(() => null))?.isFile()) throw new Error(`Referenced image is missing from assets/images/optimized: ${asset}`);
  await ensureCopy(source, join(output, "assets/images/optimized", asset));
}

const bundledCss = await readFile(join(output, "styles/main.css"), "utf8");
for (const match of bundledCss.matchAll(/\.\.\/assets\/fonts\/([a-z0-9_.-]+\.(?:woff2?|ttf|otf))/gi)) {
  await ensureCopy(join(root, "assets/fonts", match[1]), join(output, "assets/fonts", match[1]));
}
await ensureCopy(join(root, "assets/fonts/OverusedGrotesk-LICENSE.txt"), join(output, "assets/fonts/OverusedGrotesk-LICENSE.txt"));

// Fail closed if a future copy step leaks implementation or review material.
const forbiddenOutput = /(?:^|\/)(?:docs|reports|drafts?|samples from figma|klat_magazine|graphify-out|output)(?:\/|$)|\.map$/i;
for (const file of await outputFiles(output)) {
  const shippedPath = relative(output, file).replaceAll("\\", "/");
  if (forbiddenOutput.test(shippedPath)) throw new Error(`Production output contains forbidden file: ${shippedPath}`);
}

console.log(`Built ${allHtml.length} HTML pages with prerendered case studies, one CSS request and ${assets.size} referenced image variants.`);
