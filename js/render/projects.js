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
  el.className = "project-archive__list";
  if (el.dataset.prerendered !== "true")
    el.innerHTML = renderProjectArchiveMarkup(SITE.projects, basePath(), SITE.caseStudies);
}

export function renderProjectArchiveMarkup(projects = SITE.projects, base = "", studies = SITE.caseStudies) {
  // Only published, documented project cases belong in the primary Work archive.
  // Essays have their own index and private work must never appear as a draft.
  const published = projects
    .filter(project => project.status === "published" && studies?.[project.slug]?.status === "published" && project.cover)
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER));
  const inProgress = projects
    .filter(project => project.status === "coming-soon" && project.featured !== true)
    .sort((a, b) => Number(b.year) - Number(a.year) || a.title.localeCompare(b.title));
  const publishedMarkup = renderEditorialIndex(
    published.map((project) => {
      const href = base + (project.href || "work/" + safeToken(project.slug) + ".html");
      const study = studies?.[project.slug];
      const decision = study?.proof?.find((item) => item.type === "decision")?.statement || project.tagline;
      const role = study?.facts?.role || (project.tags || []).join(", ");
      const frames = project.cover
        ? '<span class="project-archive__preview-frame" style="--preview-order:0"><picture>' +
          '<source type="image/avif" srcset="' + base + "assets/images/optimized/" + safeToken(project.cover) + '-540.avif 540w, ' + base + "assets/images/optimized/" + safeToken(project.cover) + '-1080.avif 1080w" sizes="(max-width:48rem) calc(100vw - 2.5rem), 30vw">' +
          '<source type="image/webp" srcset="' + base + "assets/images/optimized/" + safeToken(project.cover) + '-540.webp 540w, ' + base + "assets/images/optimized/" + safeToken(project.cover) + '-1080.webp 1080w" sizes="(max-width:48rem) calc(100vw - 2.5rem), 30vw">' +
          '<img src="' + base + "assets/images/optimized/" + safeToken(project.cover) + '-540.webp" alt="" width="540" height="405" loading="lazy" decoding="async"></picture></span>'
        : "";
      return {
        href,
        label: project.title + ", view project",
        tone: project.slug,
        className: "project-archive__item project-archive__item--" + project.slug,
        content:
          '<div class="project-archive__row"><div class="project-archive__identity"><p class="project-archive__meta"><span>' +
          esc(project.category) +
          "</span><time>" +
          esc(project.year) +
          '</time></p><h2 class="editorial-index__title">' +
          esc(project.title) +
          '</h2><div class="project-archive__evidence"><small>Governing decision</small><p class="editorial-index__description">' +
          esc(decision) +
          "</p><span>" +
          esc(role) +
          '</span></div></div><div class="project-archive__media" aria-hidden="true">' +
          frames +
          "</div></div>",
      };
    }),
    { variant: "archive", className: "project-archive__published" },
  );
  const progressMarkup = inProgress.length
    ? '<div class="project-archive__progress" role="region" aria-labelledby="in-progress-title"><div class="project-archive__progress-head"><h2 id="in-progress-title">In progress</h2><p>Studies still being edited into complete, evidence-led cases.</p></div><ul>' +
      inProgress
        .map((project) => "<li><span>" + esc(project.title) + "</span><time>" + esc(project.year) + "</time></li>")
        .join("") +
      "</ul></div>"
    : "";
  const collectionMarkup =
    '<nav class="project-archive__collections" aria-labelledby="more-practice-title"><div><p class="project-archive__eyebrow">Beyond case studies</p><h2 id="more-practice-title">See the practice from another angle</h2></div><ul><li><a href="' +
    base +
    'experiments.html"><span>Experiments</span><small>Posters, tests and unfinished visual questions</small></a></li><li><a href="' +
    base +
    'essays.html"><span>Essays</span><small>Writing on brands, culture and accessible design</small></a></li></ul></nav>';
  return publishedMarkup + progressMarkup + collectionMarkup;
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
