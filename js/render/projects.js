/* Render — projects: the work grid (Saint-Louvent cards) and the client marquee. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount, basePath } from "../utilities/dom.js";

/* Colour field on top, caption underneath — the editorial treatment. The
   title sits outside the tile rather than centred inside it, so the colour
   field reads as the work and the type reads as the label for it. */
function workCard(project) {
  const base = basePath();
  const services = project.tags.map((t) => "<li>" + esc(t) + "</li>").join("");
  const inner =
    '<span class="sl-card__frame" data-wipe>' +
      '<span class="sl-card__bg"></span>' +
      '<span class="sl-card__services-wrap">' +
        '<ul class="sl-card__services">' + services + "</ul>" +
      "</span>" +
    "</span>" +
    '<span class="sl-card__meta">' +
      '<span class="sl-card__name">' + esc(project.title) + "</span>" +
      '<span class="sl-card__cat">' +
        esc(project.category || "") +
        (project.year ? ' <span class="sl-card__year">' + esc(project.year) + "</span>" : "") +
      "</span>" +
    "</span>";
  if (project.caseReady === false) {
    return '<div class="sl-card" style="cursor:default" aria-disabled="true">' + inner + "</div>";
  }
  return '<a class="sl-card" href="' + base + "work/" + esc(project.slug) + '.html">' + inner + "</a>";
}

export function renderWork() {
  const el = mount("work-grid");
  if (!el) return;
  el.classList.add("sl-grid");
  el.innerHTML = SITE.projects.map(workCard).join("");
  el.querySelectorAll(".sl-card").forEach((card, i) => {
    const p = SITE.projects[i];
    card.style.setProperty("--tile", p.tone);
    /* span (of 12) and ratio drive the asymmetric grid — both already lived in
       the data and were previously unused. */
    if (p.span)  card.style.setProperty("--span", String(p.span));
    if (p.ratio) card.style.setProperty("--ratio", p.ratio);
  });
}

function clientItem(client) {
  const dims = client.logoW ? ' width="' + client.logoW + '" height="' + client.logoH + '"' : ' height="32"';
  const inner = client.logo
    ? '<img src="' + esc(client.logo) + '" alt="' + esc(client.name) + '"' + dims + ' decoding="async">'
    : '<span class="marquee__wordmark">' + esc(client.name) + "</span>";
  return '<li class="marquee__item">' + inner + "</li>";
}

export function renderClients() {
  const el = mount("clients");
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
