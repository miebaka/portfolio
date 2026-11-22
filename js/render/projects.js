/* Project presentation for the shared editorial indexes. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderEditorialIndex } from "./editorial-index.js";

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  el.className = "home-project-list";
  el.dataset.workView = "standing-folders";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderHomeProjectList(SITE.projects, SITE.caseStudies, basePath());
}

/* Identical physical construction on both pages. Only its orientation
   and interaction axis differ: Home stands, Work remains landscape. */
function renderFolderCard(project, index, base, standing = false) {
  const slug = safeToken(project.slug);
  const title = esc(project.title);
  const tone = /^#[0-9a-fA-F]{6}$/.test(project.tone || "") ? project.tone : "#002080";
  const onColor = slug === "chopbox" ? "#000000" : "#ffffff";
  const href = base + safeURL(project.href || "work/" + slug + ".html");
  const number = String(index + 1).padStart(2, "0");
  const papers = Array.from({ length: 5 }, (_, paperIndex) =>
    '<span class="project-folder__paper project-folder__paper--' + (paperIndex + 1) +
    '" aria-hidden="true"></span>').join("");
  const spine = standing
    ? '<span class="project-folder__spine" aria-hidden="true">' + title + '</span>'
    : "";

  return '<li class="project-folder project-folder--' + slug + '" data-slug="' + slug +
    '" style="--folder-index:' + index + ';--folder-tone:' + tone + ';--folder-on:' + onColor + '">' +
    '<a class="project-folder__link" href="' + href + '" aria-label="View ' + title + ' case study">' +
    '<span class="project-folder__back" aria-hidden="true"><span class="project-folder__tab">' +
    '<span class="project-folder__tab-number">' + number + '</span></span></span>' + papers +
    '<span class="project-folder__front">' + spine + '<strong class="project-folder__title">' +
    title + '</strong></span></a></li>';
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const selected = projects
    .filter(project => project.featured === true &&
      project.status === "published" && project.cover &&
      studies?.[project.slug]?.status === "published")
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) -
      (b.featuredOrder ?? Number.MAX_SAFE_INTEGER));
  return '<div class="home-folder-stack"><div class="home-folder-stack__viewport" role="region" ' +
    'aria-label="Browse selected case-study folders horizontally" tabindex="0">' +
    '<ol class="project-folder-stack__cards home-folder-stack__cards" aria-label="Selected case studies">' +
    selected.map((project, index) => renderFolderCard(project, index, base, true)).join("") +
    '</ol></div></div>';
}

export function renderProjectArchive() {
  const el = document.querySelector("[data-project-archive]");
  if (!el) return;
  el.className = "project-folder-stack";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderProjectArchiveMarkup(SITE.projects, basePath(), SITE.caseStudies);
}

/* Filing Cabinet V2: the source data determines the filing order and truthful
   divider dates; case studies stay ordinary links even if JS fails entirely. */
/* Published projects become layered, native-link paper folders.
   The design works without WebGL or any hover-specific JavaScript. */
export function renderProjectFolderStackMarkup(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const published = projects
    .filter(project => project.status === "published" &&
      studies?.[project.slug]?.status === "published" &&
      project.cover && !(project.href || "").startsWith("essays/"))
    .sort((a, b) => Number(b.year) - Number(a.year) ||
      (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.title.localeCompare(b.title));

  const folders = published.map((project, index) =>
    renderFolderCard(project, index, base)).join("");

  return '<div class="project-folder-stack__stage"><ol class="project-folder-stack__cards" aria-label="Published case studies">' +
    folders + '</ol></div>';
}

export function renderProjectArchiveMarkup(projects = SITE.projects, base = "", studies = SITE.caseStudies) {
  const inProgress = projects
    .filter(project => project.status === "coming-soon" && project.featured !== true)
    .sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
  const progressMarkup = inProgress.length
    ? '<div class="project-archive__progress" role="region" aria-labelledby="in-progress-title"><div class="project-archive__progress-head"><h2 id="in-progress-title">In progress</h2><p>Projects being prepared for publication. These are not case studies yet.</p></div><ul>' +
      inProgress.map(project =>
        '<li><span>' + esc(project.title) + '</span><time>' + esc(project.year) + '</time></li>').join("") +
      '</ul></div>'
    : "";
  const collectionMarkup =
    '<nav class="project-archive__collections" aria-labelledby="more-practice-title"><div><p class="project-archive__eyebrow">Beyond case studies</p><h2 id="more-practice-title">See the practice from another angle</h2></div><ul><li><a href="' +
    base +
    'experiments.html"><span>Experiments</span><small>Posters, tests and unfinished visual questions</small></a></li><li><a href="' +
    base +
    'essays.html"><span>Essays</span><small>Writing on brands, culture and accessible design</small></a></li></ul></nav>';
  return renderProjectFolderStackMarkup(projects, studies, base) + progressMarkup + collectionMarkup;
}

function clientItem(client) {
  const dims = client.logoW ? ' width="' + client.logoW + '" height="' + client.logoH + '"' : ' height="32"';
  const inner = client.logo
    ? '<img src="' + esc(client.logo) + '" alt="' + esc(client.name) + '"' + dims + ' decoding="async">'
    : '<span class="marquee__wordmark">' + esc(client.name) + "</span>";

  // Area-matched optical fitting: preserve the source aspect ratio while
  // keeping a common occupied area, constrained by a consistent viewport.
  // W = sqrt(A * aspect), H = sqrt(A / aspect). Cap both dimensions and
  // preserve the smallest fit scale (no distortion or cropping).
  const aspect = client.logoW > 0 && client.logoH > 0 ? client.logoW / client.logoH : 1;
  const optical = typeof client.optical === "number" ? client.optical : 1;
  const area = 19000 * optical;
  const rawWidth = Math.sqrt(area * aspect);
  const rawHeight = Math.sqrt(area / aspect);
  const fit = Math.min(1, 320 / rawWidth, 112 / rawHeight);
  const renderWidth = rawWidth * fit;
  const renderHeight = rawHeight * fit;
  const scale = Math.min(1.25, Math.max(.45, (1.15 / Math.sqrt(aspect)) * optical));
  const style = ' style="--logo-render-width:' + renderWidth.toFixed(2) +
    'px;--logo-render-height:' + renderHeight.toFixed(2) +
    'px;--logo-scale:' + scale.toFixed(3) + ';--logo-aspect:' + aspect.toFixed(3) + '"';
  return '<li class="marquee__item"' + style + ">" + inner + "</li>";
}

export function renderClients() {
  const el = mount(MOUNT.CLIENTS);
  if (!el || !SITE.clients || !SITE.clients.length) return;
  const items = SITE.clients.map(clientItem).join("");
  el.className = "client-marquee";
  el.innerHTML =
    '<div class="client-marquee__track"><ul class="client-proof">' +
    items +
    '</ul><ul class="client-proof" aria-hidden="true">' +
    items +
    "</ul></div>";
  const controller = createMarqueeController(el);
  addEventListener("pagehide", () => controller.destroy(), { once: true });
}

export function renderClientProofMarkup(clients = SITE.clients) {
  return '<ul class="client-proof">' + (clients || []).map(clientItem).join("") + "</ul>";
}

export function createMarqueeController(root, deps = {}) {
  const doc = deps.document || root.ownerDocument || document;
  const Observer =
    deps.IntersectionObserver === undefined ? globalThis.IntersectionObserver : deps.IntersectionObserver;
  const AttrObserver =
    deps.MutationObserver === undefined ? doc.defaultView?.MutationObserver : deps.MutationObserver;
  const motionQuery = doc.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)");
  let visible = !Observer;
  let destroyed = false;

  const isReduced = () => {
    const chosen = doc.documentElement?.dataset.motion;
    return chosen === "reduced" || (chosen !== "full" && Boolean(motionQuery?.matches));
  };
  const sync = () => {
    const running = !isReduced() && !destroyed && visible && !doc.hidden;
    root.classList.toggle("is-running", running);
    root.dataset.marqueeState = running ? "playing" : "paused";
  };
  const onVisibility = () => sync();
  doc.addEventListener("visibilitychange", onVisibility);
  motionQuery?.addEventListener?.("change", onVisibility);
  const preferences = AttrObserver && doc.documentElement
    ? new AttrObserver(sync)
    : null;
  preferences?.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  const observer = Observer
    ? new Observer(
        ([entry]) => {
          visible = Boolean(entry?.isIntersecting);
          sync();
        },
        { threshold: 0.1 },
      )
    : null;
  observer?.observe(root);
  sync();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      observer?.disconnect();
      preferences?.disconnect();
      motionQuery?.removeEventListener?.("change", onVisibility);
      doc.removeEventListener("visibilitychange", onVisibility);
      sync();
    },
  };
}
