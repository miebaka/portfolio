/* Project presentation for the shared editorial indexes. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  el.className = "home-project-list";
  el.dataset.workView = "rack";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderHomeProjectList(SITE.projects, SITE.caseStudies, basePath());
}

const SECTIONS = ["The Call", "The System", "What Survived", "First Contact", "The Results"];
const ROMAN = ["I", "II", "III", "IV", "V"];
const PAPER_TOPS = [38, 50, 62, 74, 86];
const PAPER_ROTATIONS = [-.35, .25, -.15, .4, -.25];
const PAPER_TONES = ["#f3f1e8", "#fbfaf5", "#f6f4ec", "#fbfaf5", "#fdfcf8"];
const FOLDER_TONES = ["#d9c49a", "#cdb68a", "#e0cfa6", "#d3bd91"];

function publishedProjects(projects, studies, featuredOnly) {
  return projects.filter(project =>
    project.status === "published" &&
    studies?.[project.slug]?.status === "published" &&
    project.cover && !(project.href || "").startsWith("essays/") &&
    (!featuredOnly || project.featured === true)
  ).sort((a, b) => featuredOnly
    ? (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99)
    : Number(b.year) - Number(a.year) ||
      (a.featuredOrder ?? 99) - (b.featuredOrder ?? 99) ||
      a.title.localeCompare(b.title));
}

/* One physical rack serves both Home and Work. The same source data gives
   truthful routes, five still sheets and the five actual case chapters. */
export function renderFolderRackMarkup(projects, base = "", variant = "work") {
  const folders = projects.map((project, index) => {
    const slug = safeToken(project.slug);
    const title = esc(project.title);
    const href = base + safeURL(project.href || "work/" + slug + ".html");
    const number = String(index + 1).padStart(2, "0");
    const sheets = PAPER_TOPS.map((top, i) =>
      '<span class="folder-rack__sheet" style="--sheet-top:' + top +
      'px;--sheet-rotation:' + PAPER_ROTATIONS[i] +
      'deg;--sheet-tone:' + PAPER_TONES[i] + '" aria-hidden="true"></span>').join("");
    const chapters = SECTIONS.map((section, i) =>
      '<li><b>' + ROMAN[i] + '</b>' + section + '</li>').join("");
    return '<a class="folder-rack__folder" href="' + href + '" data-slug="' + slug +
      '" style="--folder-tone:' + FOLDER_TONES[index % FOLDER_TONES.length] +
      ';--folder-order:' + (index + 1) + '" aria-label="View ' + title + ' case study">' +
      '<span class="folder-rack__back" aria-hidden="true"></span>' +
      '<span class="folder-rack__tab" aria-hidden="true">' + number + '</span>' +
      sheets +
      '<span class="folder-rack__front"><span class="folder-rack__lip">' + esc(project.category) +
      '</span><span class="folder-rack__fold"></span>' +
      '<span class="folder-rack__vertical-name">' + title + '</span>' +
      '<span class="folder-rack__face"><span class="folder-rack__number">' + number +
      '</span><strong class="folder-rack__name">' + title + '</strong>' +
      '<ol class="folder-rack__index">' + chapters + '</ol></span></span></a>';
  }).join("");
  return '<div class="folder-rack folder-rack--' + variant +
    '" data-folder-rack aria-label="Case study folders"><div class="folder-rack__scroller" tabindex="0" aria-label="Browse case study folders horizontally"><div class="folder-rack__track">' +
    folders + '</div></div><p class="folder-rack__hint">Hover to explore · Select to open</p></div>';
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const selected = publishedProjects(projects, studies, true);
  return renderFolderRackMarkup(selected, base, "home") +
    '<div class="work-view-controls"><a href="' + base + 'work.html">All work <span aria-hidden="true">↗</span></a></div>';
}

export function renderProjectArchive() {
  const el = document.querySelector("[data-project-archive]");
  if (!el) return;
  el.className = "project-folder-stack";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderProjectArchiveMarkup(SITE.projects, basePath(), SITE.caseStudies);
}

export function renderProjectFolderStackMarkup(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  return '<div class="project-folder-stack__stage">' +
    renderFolderRackMarkup(publishedProjects(projects, studies, false), base, "work") +
    '</div>';
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
