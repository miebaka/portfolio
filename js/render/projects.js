/* Render — projects: the work index (editorial rows) and the client marquee. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

/* The work is an editorial index, not a gallery of cards: numbered rows, the
   project name at display scale, category and year. Full-bleed imagery lives in
   the case studies, so a reference here is a name and a decision, not six
   competing photographs. Rows indent and the name shifts to the accent on
   hover and focus — it looks interactive because it is. */
function workRow(project, i, base) {
  const num = String(i + 1).padStart(2, "0");
  const inner =
    '<span class="work-index__idx">' + num + "</span>" +
    '<span class="work-index__name">' + esc(project.title) + "</span>";

  /* A project with no case study behind it is a real row, but not a link:
     there is nothing to open yet, so it states its status in the meta slot
     rather than promising a page that is not there. */
  if (project.caseReady === false) {
    return (
      '<div class="work-index__row work-index__row--pending reveal">' +
        inner +
        '<span class="work-index__meta">In progress</span>' +
      "</div>"
    );
  }

  const meta = esc(project.category) + " &middot; " + esc(project.year);
  /* The cursor-following hover preview reads this: the small cover variant, so
     the plate is light to fetch. Rows without a cover simply get no preview. */
  const coverAttr = project.cover
    ? ' data-cover="' + base + "assets/images/optimized/" + safeToken(project.cover) + '-540.webp"'
    : "";
  return (
    '<a class="work-index__row reveal" href="' + base + "work/" + esc(project.slug) + '.html"' + coverAttr + ">" +
      inner +
      '<span class="work-index__meta">' + meta + "</span>" +
    "</a>"
  );
}

/* Home shows the featured set; the Work page shows everything. Same data, same
   renderer, differentiated only by which page is asking. */
export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const base = basePath();
  const all = SITE.projects || [];
  const items = document.body.dataset.page === "work" ? all : all.filter((p) => p.featured);
  el.classList.add("work-index");
  el.innerHTML = items.map((project, i) => workRow(project, i, base)).join("");
}

function clientItem(client) {
  const dims = client.logoW ? ' width="' + client.logoW + '" height="' + client.logoH + '"' : ' height="32"';
  const inner = client.logo
    ? '<img src="' + esc(client.logo) + '" alt="' + esc(client.name) + '"' + dims + ' decoding="async">'
    : '<span class="marquee__wordmark">' + esc(client.name) + "</span>";
  /* Optical-balance multiplier, applied to the mark's height in CSS. Numbers
     only; guarded so a bad value can never inject a style. */
  const scale = typeof client.scale === "number" && client.scale > 0 ? client.scale : 1;
  const style = scale !== 1 ? ' style="--logo-scale:' + scale + '"' : "";
  return '<li class="marquee__item"' + style + ">" + inner + "</li>";
}

export function renderClients() {
  const el = mount(MOUNT.CLIENTS);
  if (!el || !SITE.clients || !SITE.clients.length) return;
  const setHTML = SITE.clients.map(clientItem).join("");

  // Render one set, measure it once logos load, then repeat it enough that a
  // single group exceeds the viewport — the two-group / -50% loop stays seamless.
  el.innerHTML = '<div class="marquee__track"><ul class="marquee__group">' + setHTML + "</ul></div>";
  const track = el.querySelector(".marquee__track");
  const measureGroup = el.querySelector(".marquee__group");

  function build() {
    const setWidth = measureGroup.scrollWidth;
    const viewport = el.clientWidth || window.innerWidth || 1440;
    const reps = setWidth > 0 ? Math.max(1, Math.ceil((viewport * 1.5) / setWidth)) : 2;
    let groupHTML = "";
    for (let i = 0; i < reps; i++) groupHTML += setHTML;
    track.innerHTML =
      '<ul class="marquee__group">' + groupHTML + "</ul>" +
      '<ul class="marquee__group" aria-hidden="true">' + groupHTML + "</ul>";
  }

  const images = measureGroup.querySelectorAll("img");
  let pending = images.length;
  if (!pending) { build(); return; }
  const done = () => { if (--pending <= 0) build(); };
  images.forEach((img) => {
    if (img.complete) done();
    else { img.addEventListener("load", done); img.addEventListener("error", done); }
  });
}
