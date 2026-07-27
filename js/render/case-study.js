/* Render — case study: one shared template for every project page.
   Reads body[data-case] and fills <article data-mount="case"> from
   SITE.caseStudies. Narrative order: Overview · Challenge · Process ·
   Solution · Outcome, with three media bands interleaved. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";

function paras(list) {
  return (list || []).map((p) => "<p>" + esc(p) + "</p>").join("");
}

/* Renders nothing when the band is absent, so a case study with fewer than
   three media entries still produces a complete page instead of throwing. */
function band(m) {
  if (!m) return "";
  /* Variants land in a class list, where escaping is not enough: a space in
     the value would silently add an unrelated class. */
  const variants = (m.variants || [])
    .map((v) => safeToken(v))
    .filter(Boolean)
    .map((v) => " case-media--" + v)
    .join("");
  return (
    '<figure class="case-media' + variants + ' reveal">' +
    '<span class="case-media__placeholder">' + esc(m.label) + "</span></figure>"
  );
}

/* A standard section: a labelled left rail beside an offset column of prose. */
function section(label, bodyHTML) {
  return (
    '<section class="container case-grid reveal" aria-label="' + esc(label) + '">' +
    '<p class="case-rail__label case-rail">' + esc(label) + "</p>" +
    '<div class="case-col">' + bodyHTML + "</div></section>"
  );
}

function overviewSection(c) {
  const r = c.rail || {};
  const o = c.overview || {};
  return (
    '<section class="container case-grid reveal" aria-label="Overview">' +
    '<div class="case-rail">' +
    '<p class="case-rail__label">' + esc(r.servicesLabel) + "</p>" +
    '<p class="case-rail__text">' + esc(r.services) + "</p>" +
    '<p class="case-rail__label">' + esc(r.metaLabel) + "</p>" +
    '<p class="case-rail__text">' + esc(r.meta) + "</p></div>" +
    '<div class="case-col">' +
    '<p class="case-question">' + esc(o.question) + "</p>" +
    paras(o.body) + "</div></section>"
  );
}

function outcomeSection(outcome) {
  const o = outcome || {};
  const metrics = o.metrics
    ? '<div class="case-metrics">' +
      o.metrics
        .map(
          (m) =>
            '<div class="case-metric"><strong>' + esc(m.value) +
            "</strong><span>" + esc(m.label) + "</span></div>"
        )
        .join("") +
      "</div>"
    : "";
  const note = o.note ? '<p class="case-note"><em>' + esc(o.note) + "</em></p>" : "";
  return section("Outcome", paras(o.body) + metrics + note);
}

export function renderCaseStudy() {
  const slug = document.body.dataset.case;
  if (!slug) return;
  const el = mount("case");
  if (!el) return;

  /* hasOwnProperty rather than a bare lookup: data-case comes from markup, and
     a plain index would happily return inherited members like "constructor"
     or "toString" and then throw partway through building the page. */
  const studies = SITE.caseStudies || {};
  if (!Object.prototype.hasOwnProperty.call(studies, slug)) return;
  const c = studies[slug];
  if (!c) return;

  const base = basePath();
  const media = c.media || [];

  /* The next-project link is optional. Without this guard a study missing
     `next` threw at the very end, after the whole article had been built,
     leaving the mount empty. */
  const next = c.next && c.next.slug
    ? '<section class="case-next container reveal" aria-label="Next project">' +
      '<p class="case-next__label">Next project</p>' +
      '<a class="case-next__link" href="' + base + "work/" + esc(c.next.slug) + '.html">' +
      esc(c.next.title) + " &rarr;</a></section>"
    : "";

  el.innerHTML =
    '<section class="case-hero container" aria-label="' + esc(c.title) + '">' +
    '<p class="case-back reveal"><a href="' + base + 'work.html">&larr; Work</a></p>' +
    '<h1 class="case-title reveal">' + esc(c.title) + "</h1>" +
    '<p class="case-tagline reveal">' + esc(c.tagline) + "</p></section>" +
    band(media[0]) +
    overviewSection(c) +
    section("Challenge", paras(c.challenge)) +
    section("Process", paras(c.process)) +
    band(media[1]) +
    section("Solution", paras(c.solution)) +
    outcomeSection(c.outcome) +
    band(media[2]) +
    next;
}
