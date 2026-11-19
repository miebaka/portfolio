/* Project presentation for the shared editorial indexes. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderEditorialIndex } from "./editorial-index.js";

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  el.className = "home-project-list";
  el.innerHTML = renderHomeProjectList(SITE.projects, SITE.caseStudies, basePath());
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  // The editorial selection is authored in project data, never duplicated here.
  // An unpublished case must never become a dead featured link.
  const selected = projects
    .filter(project => project.featured === true && project.status === "published" && studies?.[project.slug]?.status === "published")
    .sort((a, b) => (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER))
    .map(project => ({
      slug: project.slug,
      title: project.title,
      category: project.category,
      year: project.year,
      href: base + `work/${safeToken(project.slug)}.html`,
      cover: project.cover || "",
    }));
  return renderEditorialIndex(
    selected.map((project) => {
      const visual = project.cover
        ? '<span class="home-project-list__visual" aria-hidden="true"><picture><source type="image/avif" srcset="' +
          base +
          "assets/images/optimized/" +
          safeToken(project.cover) +
          "-540.avif 540w, " +
          base +
          "assets/images/optimized/" +
          safeToken(project.cover) +
          '-1080.avif 1080w" sizes="(max-width: 48rem) calc(100vw - 2.5rem), 48vw"><source type="image/webp" srcset="' +
          base +
          "assets/images/optimized/" +
          safeToken(project.cover) +
          "-540.webp 540w, " +
          base +
          "assets/images/optimized/" +
          safeToken(project.cover) +
          '-1080.webp 1080w" sizes="(max-width: 48rem) calc(100vw - 2.5rem), 48vw"><img src="' +
          base +
          "assets/images/optimized/" +
          safeToken(project.cover) +
          '-1080.webp" alt="" width="1080" height="810" loading="lazy" decoding="async"></picture></span>'
        : "";
      const content =
        '<span class="home-project-list__identity"><span class="home-project-list__title editorial-index__title">' +
        esc(project.title) +
        '</span><span class="home-project-list__meta">' +
        esc(project.category) +
        " / " +
        esc(project.year) +
        '</span></span><span class="home-project-list__arrow" aria-hidden="true">↗</span>' +
        visual;
      return {
        href: project.href,
        tone: project.slug,
        className: project.href ? "" : "home-project-list__pending",
        content,
      };
    }),
    { variant: "work", ordered: true },
  );
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
  /* Equal perceived area starts with geometry: if height is h and width is
     aspect × h, equal area means h is proportional to 1/sqrt(aspect). The
     optical factor only corrects for unusually light or dense artwork. */
  const aspect = client.logoW && client.logoH ? client.logoW / client.logoH : 1;
  const optical = typeof client.optical === "number" ? client.optical : 1;
  const scale = Math.min(1.25, Math.max(0.45, (1.15 / Math.sqrt(aspect)) * optical));
  const style = ' style="--logo-scale:' + scale.toFixed(3) + ";--logo-aspect:" + aspect.toFixed(3) + '"';
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
  const reducedMotion = doc.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  let visible = !Observer,
    destroyed = false;
  const sync = () => {
    const running = !reducedMotion && !destroyed && visible && !doc.hidden;
    root.classList.toggle("is-running", running);
    root.dataset.marqueeState = running ? "playing" : "paused";
  };
  const onVisibility = () => sync();
  doc.addEventListener("visibilitychange", onVisibility);
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
      doc.removeEventListener("visibilitychange", onVisibility);
      sync();
    },
  };
}
