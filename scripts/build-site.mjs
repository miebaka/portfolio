import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../data/site.js";
import { renderCaseMarkup } from "../js/render/case-markup.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(root, "dist");
const rootFiles = ["404.html", "about.html", "contact.html", "index.html", "playground.html", "privacy.html", "robots.txt", "services.html", "sitemap.xml", "work.html"];
const caseFiles = ["rivo.html", "tedx-rsu.html", "chopbox.html", "christian-poster-a-week.html"];
const articleFiles = ["designing-for-disability-in-nigeria.html", "when-the-swoosh-lost-its-soul.html"];

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

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of rootFiles) await ensureCopy(join(root, file), join(output, file));
await ensureCopy(join(root, "data/site.js"), join(output, "data/site.js"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-logo.svg"), join(output, "assets/images/miebaka-joshua-logo.svg"));
await ensureCopy(join(root, "assets/images/miebaka-joshua-script-name.svg"), join(output, "assets/images/miebaka-joshua-script-name.svg"));
await ensureCopy(join(root, "assets/images/clients"), join(output, "assets/images/clients"));
for (const file of articleFiles) await ensureCopy(join(root, "writing", file), join(output, "writing", file));

for (const file of caseFiles) {
  const slug = file.replace(".html", "");
  const source = await readFile(join(root, "work", file), "utf8");
  const article = `<article class="case" data-mount="case" data-prerendered="true">${renderCaseMarkup(SITE, slug, "../")}</article>`;
  const rendered = source.replace(/<article class="case" data-mount="case">[\s\S]*?<\/article>/, article);
  await mkdir(join(output, "work"), { recursive: true });
  await writeFile(join(output, "work", file), rendered);
}

await mkdir(join(output, "styles"), { recursive: true });
await writeFile(join(output, "styles/main.css"), await bundleCss(join(root, "styles/main.css")));
await copyJsGraph("js/main.js");
/* decision-field.js loads Three only after capability checks. Dynamic imports
   are intentionally outside copyJsGraph's static-import matcher, so vendor the
   one browser module explicitly and keep the production CSP self-hosted. */
await ensureCopy(
  join(root, "node_modules/three/build/three.module.js"),
  join(output, "node_modules/three/build/three.module.js")
);
await ensureCopy(
  join(root, "node_modules/three/build/three.core.js"),
  join(output, "node_modules/three/build/three.core.js")
);
await ensureCopy(
  join(root, "node_modules/three/examples/jsm/loaders/SVGLoader.js"),
  join(output, "node_modules/three/examples/jsm/loaders/SVGLoader.js")
);

/* Capability cards are rendered from JS, so their image URLs are not present
   in the source HTML scanned below. Keep this small visual set explicit. */
for (const asset of ["rivo-guidelines-540.webp", "chopbox-campaign-540.webp", "tedx-rsu-pattern-540.webp"]) {
  await ensureCopy(
    join(root, "assets/images/optimized", asset),
    join(output, "assets/images/optimized", asset)
  );
}

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
