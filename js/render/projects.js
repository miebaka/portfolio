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
    '<div class="work-view-controls"><a href="' + basePath() + 'work.html">All work <span aria-hidden="true">↗</span></a></div>';
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const selected = projects
    .filter(project => project.featured === true && project.status === "published" && studies?.[project.slug]?.status === "published")
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER));

  return renderEditorialIndex(selected.map(project => {
    // These are actual case-study images curated alongside the project data.
    // The cover is always the first frame, including on touch and without JS.
    const frames = [...new Set([project.cover, ...(project.rosterImages || [])].filter(Boolean))].slice(0, 3);
    const visual = '<span class="home-project-list__visual" aria-hidden="true">' +
      frames.map((image, index) => {
        const src = base + "assets/images/optimized/" + safeToken(image);
        return '<span class="project-roster__photo project-roster__photo--' + (index + 1) + '"><picture>' +
          '<source type="image/avif" srcset="' + src + '-540.avif 540w, ' + src + '-810.avif 810w" sizes="(max-width:48rem) 88vw, 25vw">' +
          '<source type="image/webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w" sizes="(max-width:48rem) 88vw, 25vw">' +
          '<img src="' + src + '-540.webp" alt="" width="540" height="405" loading="lazy" decoding="async">' +
          '</picture></span>';
      }).join("") + '</span>';

    const tags = [...new Set([...(project.tags || []), project.category].filter(Boolean))];
    const content =
      '<span class="home-project-list__identity"><span class="home-project-list__title editorial-index__title">' +
      esc(project.title) + '</span><span class="home-project-list__meta">' +
      esc(project.category) + ' / ' + esc(project.year) +
      '</span></span>' + visual +
      '<span class="project-roster__tags" data-roster-tags="' + esc(tags.join("|")) + '" aria-hidden="true"></span>' +
      '<span class="home-project-list__arrow" aria-hidden="true">↗</span>';
    return {
      href: base + "work/" + safeToken(project.slug) + ".html",
      label: project.title + ", view case study",
      tone: project.slug,
      className: "project-roster__row",
      content,
    };
  }), { variant: "work", ordered: true });
}


export function renderProjectArchive() {
  const el = document.querySelector("[data-project-archive]");
  if (!el) return;
  el.className = "filing-cabinet";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderProjectArchiveMarkup(SITE.projects, basePath(), SITE.caseStudies);
}

/* Filing Cabinet V2: the source data determines the filing order and truthful
   divider dates; case studies stay ordinary links even if JS fails entirely. */
export function renderFilingCabinetMarkup(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const published = projects
    .filter(project =>
      project.status === "published" &&
      studies?.[project.slug]?.status === "published" &&
      project.cover &&
      !(project.href || "").startsWith("essays/"))
    .sort((a, b) => Number(b.year) - Number(a.year) ||
      (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER) ||
      a.title.localeCompare(b.title));
  const numberOf = number => String(number).padStart(2, "0");
  const count = numberOf(published.length);
  let lastYear = "";
  let folders = 0;

  const drawer = published.map(project => {
    const year = String(project.year);
    const divider = year !== lastYear
      ? '<li class="filing-cabinet__divider" aria-hidden="true">' +
        '<span class="filing-cabinet__divider-year">' + esc(year) + '</span>' +
        '<span class="filing-cabinet__divider-caption">YEAR INDEX</span></li>'
      : "";
    lastYear = year;
    const index = ++folders;
    const tab = ["a", "b", "c"][(index - 1) % 3];
    const number = numberOf(index);
    const href = base + (project.href || "work/" + safeToken(project.slug) + ".html");
    const label = esc(project.title);
    const category = esc(project.category);
    const description = esc(project.tagline);
    const encodedYear = esc(year);
    return divider +
      '<li class="filing-cabinet__folder" data-tab="' + tab +
      '" data-slug="' + safeToken(project.slug) +
      '" data-file-number="' + number + '" data-year="' + encodedYear + '">' +
      '<a class="filing-cabinet__link" href="' + esc(href) + '">' +
      '<span class="filing-cabinet__face" aria-hidden="true">' +
      '<span class="filing-cabinet__tab"><span class="filing-cabinet__number">' + number + '</span>' +
      '<span class="filing-cabinet__tab-title">' + label + '</span></span>' +
      '<span class="filing-cabinet__lip"><strong class="filing-cabinet__lip-title">' + label + '</strong>' +
      '<span class="filing-cabinet__lip-copy">' + description + '</span>' +
      '<span class="filing-cabinet__lip-meta">' + category + ' / ' + encodedYear + '</span>' +
      '</span></span>' +
      '<span class="sr-only">Open ' + label + ' case study, ' + category + ', ' + encodedYear + '</span>' +
      '</a></li>';
  }).join("");

  const current = published[0];
  const active = current
    ? '<span class="filing-cabinet__register-number">NO. 01 / ' + count + '</span>' +
      '<strong class="filing-cabinet__register-title">' + esc(current.title) + '</strong>' +
      '<span class="filing-cabinet__register-year">' + esc(current.year) + '</span>'
    : '<strong class="filing-cabinet__register-title">NO PUBLISHED FILES</strong>';

  return '<div class="filing-cabinet__stage">' +
    '<div class="filing-cabinet__shell">' +
    '<div class="filing-cabinet__chassis" aria-hidden="true"><span>FILING SYSTEM / 001</span><span>' +
      count + ' OPEN FILES</span></div>' +
    '<div class="filing-cabinet__well">' +
    '<ol class="filing-cabinet__drawer" aria-label="Published case studies, newest first">' +
    drawer + '</ol></div>' +
    '<div class="filing-cabinet__register" aria-hidden="true">' +
    '<span class="filing-cabinet__register-label">CURRENT FILE / REGISTER</span>' +
    '<span class="filing-cabinet__register-values">' + active + '</span></div>' +
    '</div>' +
    '<p class="filing-cabinet__caption"><span>DESIGN SYSTEMS / SELECTED WORK</span>' +
    '<span>' + count + ' FILES / ' + count + ' AVAILABLE TO OPEN</span></p>' +
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
  return renderFilingCabinetMarkup(projects, studies, base) + progressMarkup + collectionMarkup;
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
