/* Project presentation for the shared editorial indexes. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderEditorialIndex } from "./editorial-index.js";

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  el.className = "home-project-list";
  el.dataset.workView = "list";
  el.innerHTML = renderHomeProjectList(SITE.projects, SITE.caseStudies, basePath()) +
    '<div class="work-view-controls"><a href="' + basePath() +
    'work.html">All work <span aria-hidden="true">↗</span></a></div>';
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const selected = projects
    .filter(project =>
      project.featured === true &&
      project.status === "published" &&
      project.cover &&
      studies?.[project.slug]?.status === "published"
    )
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER));

  // One substantial, real project image per case. No floating tags, metadata
  // capsules or redundant arrow controls; the entire title/visual is the link.
  const items = selected.map(project => {
    const image = base + "assets/images/optimized/" + safeToken(project.cover);
    const title = esc(project.title);
    const content =
      '<div class="home-project-list__identity"><h3 class="home-project-list__title editorial-index__title">' +
      title + '</h3></div>' +
      '<span class="home-project-list__visual" aria-hidden="true"><picture>' +
      '<source type="image/avif" srcset="' + image + '-540.avif 540w, ' +
      image + '-810.avif 810w, ' + image + '-1080.avif 1080w" sizes="(max-width: 48rem) 100vw, 33vw">' +
      '<source type="image/webp" srcset="' + image + '-540.webp 540w, ' +
      image + '-810.webp 810w, ' + image + '-1080.webp 1080w" sizes="(max-width: 48rem) 100vw, 33vw">' +
      '<img src="' + image + '-810.webp" alt="" width="1080" height="810" loading="lazy" decoding="async">' +
      '</picture></span>';

    return {
      href: base + "work/" + safeToken(project.slug) + ".html",
      label: project.title + ", " + project.category + ", " + project.year + ", view case study",
      tone: project.slug,
      className: "project-roster__row",
      content,
    };
  });

  return renderEditorialIndex(items, { variant: "work", ordered: true });
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

  const folders = published.map((project, index) => {
    const slug = safeToken(project.slug);
    const title = esc(project.title);
    const tone = /^#[0-9a-fA-F]{6}$/.test(project.tone || "") ? project.tone : "#002080";
    const onColor = slug === "chopbox" ? "#000000" : "#ffffff";
    const href = base + safeURL(project.href || "work/" + slug + ".html");
    // These five fixed sheets mirror the five case-study sections.
    // They are decorative only; the whole folder is one ordinary link.
    const papers = ["The Call", "The System", "What Survived", "First Contact", "The Results"]
      .map((section, paperIndex) =>
        '<span class="project-folder__paper project-folder__paper--' + (paperIndex + 1) +
        '" aria-hidden="true"><span>' + esc(section) + '</span></span>')
      .join("");
    return '<li class="project-folder project-folder--' + slug + '" data-slug="' + slug +
      '" style="--folder-index:' + index + ';--folder-tone:' + tone + ';--folder-on:' + onColor + '">' +
      '<a class="project-folder__link" href="' + href + '" aria-label="View ' + title + ' case study">' +
      '<span class="project-folder__back" aria-hidden="true"><span class="project-folder__tab">' +
      '<span class="project-folder__tab-title">' + title + '</span></span></span>' +
      papers +
      '<span class="project-folder__front"><span class="project-folder__overline">CASE STUDY / ' +
      esc(project.year) + '</span><strong class="project-folder__title">' + title +
      '</strong><span class="project-folder__bottom"><span>' + esc(project.category) +
      '</span><span class="project-folder__view">View project <span aria-hidden="true">↗</span></span></span></span>' +
      '</a></li>';
  }).join("");

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
