import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";
import { assertValidContent } from "./validate-content.mjs";

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
  const importPattern = /@import\s+["']([^"']+)["'];/g;
  let result = "";
  let cursor = 0;
  for (const match of css.matchAll(importPattern)) {
    result += css.slice(cursor, match.index);
    result += await bundleCss(resolve(dirname(absolute), match[1]), seen);
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

// Validate before touching dist, including when this script runs directly.
const content = assertValidContent();
const { escapeHTML: esc } = await import("../js/utilities/dom.js");
const routes = content.navigation.routes;
const rootFiles = routes.filter(route => route.includeIn.includes("build")).map(route => route.href);
// Authored links may contain ./, a query or a fragment; filesystem and sitemap
// destinations use only the normalized local pathname, while href data stays intact.
const localPath = href => typeof href === "string" && !/^https:\/\//i.test(href)
  ? new URL(href, content.siteConfig.canonicalUrl).pathname.slice(1) : "";
const caseProjects = content.projects.filter(project => project.status !== "private" && content.caseStudies[project.slug] && !localPath(project.href).startsWith("writing/"));
const articleFiles = [...new Set(content.writing.map(entry => localPath(entry.href)).filter(path => path.startsWith("writing/")))];
const canonicalUrl = href => new URL(href === "index.html" ? "" : href, content.siteConfig.canonicalUrl).href;
const sitemapRoutes = [
  ...routes.filter(route => route.includeIn.includes("sitemap")).map(route => route.href),
  ...caseProjects.filter(project => content.caseStudies[project.slug].status === "published").map(project => `work/${project.slug}.html`),
  ...articleFiles
];
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [...new Set(sitemapRoutes)].map(href => `  <url><loc>${canonicalUrl(href)}</loc></url>`).join("\n") + '\n</urlset>\n';
function renderShell(source, href) {
  const base = "../".repeat(href.split("/").length - 1);
  const links = placement => routes.filter(route => route.includeIn.includes(placement))
    .map(route => `        <a href="${base}${esc(route.href)}">${esc(route.label)}</a>`).join("\n");
  return source
    .replace(/<nav class="nav-fallback" aria-label="Primary">[\s\S]*?<\/nav>/, `<nav class="nav-fallback" aria-label="Primary">\n${links("index")}\n    </nav>`)
    .replace(/(<div class="nav-fallback">)[\s\S]*?(?=\s*<a href="https:)/, `$1\n${links("footer")}\n`);
}
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of rootFiles) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await writeFile(join(output, file), renderShell(await readFile(join(root, file), "utf8"), file));
}
await ensureCopy(join(root, "robots.txt"), join(output, "robots.txt"));
await writeFile(join(output, "sitemap.xml"), sitemap);
await ensureCopy(join(root, "data/site.js"), join(output, "data/site.js"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-logo.svg"), join(output, "assets/images/miebaka-joshua-logo.svg"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-script-name.svg"), join(output, "assets/images/miebaka-joshua-script-name.svg"));
await ensureCopy(join(root, "assets/images/clients"), join(output, "assets/images/clients"));
for (const file of articleFiles) {
  await mkdir(dirname(join(output, file)), { recursive: true });
  await writeFile(join(output, file), renderShell(await readFile(join(root, file), "utf8"), file));
}

for (const project of caseProjects) {
  const slug = project.slug;
  const file = `${slug}.html`;
  const source = renderShell(await readFile(join(root, "work", file), "utf8"), `work/${file}`);
  const article = `<article class="case" data-mount="case" data-prerendered="true">${renderCaseMarkup(SITE, slug, "../")}</article>`;
  const rendered = source.replace(/<article class="case" data-mount="case">[\s\S]*?<\/article>/, article);
  await mkdir(join(output, "work"), { recursive: true });
  await writeFile(join(output, "work", file), rendered);
}

await mkdir(join(output, "styles"), { recursive: true });
await writeFile(join(output, "styles/main.css"), await bundleCss(join(root, "styles/main.css")));
await copyJsGraph("js/main.js");
await ensureCopy(join(root, "node_modules/three/build/three.module.js"), join(output, "assets/vendor/three.module.js"));
await ensureCopy(join(root, "node_modules/three/build/three.core.js"), join(output, "assets/vendor/three.core.js"));

const allHtml = await htmlFiles(output);
const assets = new Set();
for (const file of allHtml) {
  const html = await readFile(file, "utf8");
  for (const match of html.matchAll(/assets\/images\/optimized\/([a-z0-9_-]+\.(?:avif|webp|jpg|png))/gi)) assets.add(match[1]);
}
for (const project of SITE.projects.filter(project => project.caseReady !== false && project.cover)) {
  for (const width of [540, 810, 1080]) for (const ext of ["avif", "webp", "jpg"]) assets.add(`${project.cover}-${width}.${ext}`);
}
for (const asset of assets) {
  const source = join(root, "assets/images/optimized", asset);
  try { if ((await stat(source)).isFile()) await ensureCopy(source, join(output, "assets/images/optimized", asset)); } catch {}
}

const bundledCss = await readFile(join(output, "styles/main.css"), "utf8");
for (const match of bundledCss.matchAll(/\.\.\/assets\/fonts\/([a-z0-9_.-]+\.(?:woff2|ttf))/gi)) {
  await ensureCopy(join(root, "assets/fonts", match[1]), join(output, "assets/fonts", match[1]));
}

console.log(`Built ${allHtml.length} HTML pages with prerendered case studies, one CSS request and ${assets.size} referenced image variants.`);
