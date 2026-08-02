/* Render — projects: the work grid (Saint-Louvent cards) and the client marquee. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

/* Colour field on top, caption underneath — the editorial treatment. The
   title sits outside the tile rather than centred inside it, so the colour
   field reads as the work and the type reads as the label for it. */
/* Grid tiles never exceed roughly half the page width, so the cover ladder
   stops at 1080 even where wider variants exist for the full-bleed bands. */
const COVER_WIDTHS = [540, 810, 1080];

function coverHTML(project) {
  if (!project.cover) return "";
  const src = basePath() + "assets/images/optimized/" + safeToken(project.cover);
  const set = (ext) =>
    COVER_WIDTHS.map((w) => src + "-" + w + "." + ext + " " + w + "w").join(", ");
  /* Decorative: the card's own name and category sit right below it in the
     caption, so alt text here would just repeat them to a screen reader. */
  return (
    "<picture>" +
      '<source type="image/avif" srcset="' + set("avif") + '" sizes="(max-width: 56rem) 100vw, 50vw">' +
      '<source type="image/webp" srcset="' + set("webp") + '" sizes="(max-width: 56rem) 100vw, 50vw">' +
      '<img class="sl-card__img" src="' + src + '-810.jpg" alt="" aria-hidden="true"' +
        ' loading="lazy" decoding="async">' +
    "</picture>"
  );
}

function workCard(project) {
  const base = basePath();
  const services = project.tags.map((t) => "<li>" + esc(t) + "</li>").join("");
  const inner =
    '<span class="sl-card__frame" data-wipe>' +
      '<span class="sl-card__bg"></span>' +
      coverHTML(project) +
      '<span class="sl-card__scrim"></span>' +
    "</span>" +
    /* One row, pinned to the foot of the card. The title holds the left edge
       in both states; the scope arrives on the right of that same row on
       hover, so the two are always on one baseline rather than the scope
       appearing somewhere else in the frame. */
    '<span class="sl-card__meta">' +
      '<span class="sl-card__name">' + esc(project.title) + "</span>" +
      '<span class="sl-card__scope">' + esc(project.tags.join(", ")) + "</span>" +
    "</span>";
  /* No case study yet. This is a <div>, not an <a>, so there is nothing for
     aria-disabled to apply to — it was announcing nothing. A visible caption
     states the status instead, which reaches everyone rather than only AT. */
  if (project.caseReady === false) {
    return (
      '<div class="sl-card sl-card--pending">' +
      inner +
      '<span class="sl-card__pending">Case study in progress</span>' +
      "</div>"
    );
  }
  return '<a class="sl-card" href="' + base + "work/" + esc(project.slug) + '.html">' + inner + "</a>";
}

/* A side-scrolling row of squares. The scrolling is the browser's; the sizing
   is a CSS hover rule. js/core/work-rail.js adds only the caption and the
   pointer pill, the two things CSS cannot express.

   touch-action: pan-y tells the browser to keep vertical panning for itself,
   so a downward drag scrolls the page rather than being absorbed by the
   horizontal scroller under the finger. */
export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const items = SITE.projects || [];
  el.classList.add("sl-rail");

  el.innerHTML =
    '<div class="sl-rail__viewport" tabindex="0" role="group"' +
      ' aria-roledescription="carousel" aria-label="Selected work"' +
      ' style="touch-action: pan-y">' +
      '<div class="sl-track">' + items.map(workCard).join("") + "</div>" +
    "</div>" +
    '<span class="sl-rail__pill" aria-hidden="true"></span>';

  el.querySelectorAll(".sl-card").forEach((card, i) => {
    const p = items[i];
    card.style.setProperty("--tile", p.tone);
    /* Only the mobile stack uses this; the desktop row is square by rule. */
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
