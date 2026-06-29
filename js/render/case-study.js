/* Render — case study: one shared template for every project page.
   Reads body[data-case] and fills <article data-mount="case"> from
   SITE.caseStudies. Narrative order: Overview · Challenge · Process ·
   Solution · Outcome, with three media bands interleaved. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount, basePath } from "../utilities/dom.js";

function paras(list) {
  return (list || []).map((p) => "<p>" + esc(p) + "</p>").join("");
}

function band(m) {
  const variants = (m.variants || []).map((v) => " case-media--" + v).join("");
  return (
    '<figure class="case-media' + variants + ' reveal">' +
    '<span class="case-media__placeholder">' + esc(m.label) + "</span></figure>"
  );
}

/* A standard section: a labelled left rail beside an offset column of prose. */
function section(label, bodyHTML) {
  return (
    '<section class="container case-grid reveal">' +
    '<p class="case-rail__label case-rail">' + esc(label) + "</p>" +
    '<div class="case-col">' + bodyHTML + "</div></section>"
  );
}

function overviewSection(c) {
  const r = c.rail;
  return (
    '<section class="container case-grid reveal">' +
    '<div class="case-rail">' +
    '<p class="case-rail__label">' + esc(r.servicesLabel) + "</p>" +
    '<p class="case-rail__text">' + esc(r.services) + "</p>" +
    '<p class="case-rail__label">' + esc(r.metaLabel) + "</p>" +
    '<p class="case-rail__text">' + esc(r.meta) + "</p></div>" +
    '<div class="case-col">' +
    '<p class="case-question">' + esc(c.overview.question) + "</p>" +
    paras(c.overview.body) + "</div></section>"
  );
}

function outcomeSection(o) {
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
  const c = SITE.caseStudies && SITE.caseStudies[slug];
  if (!el || !c) return;
  const base = basePath();

  el.innerHTML =
    '<section class="case-hero container">' +
    '<p class="case-back reveal"><a href="' + base + 'work.html">&larr; Work</a></p>' +
    '<h1 class="case-title reveal">' + esc(c.title) + "</h1>" +
    '<p class="case-tagline reveal">' + esc(c.tagline) + "</p></section>" +
    band(c.media[0]) +
    overviewSection(c) +
    section("Challenge", paras(c.challenge)) +
    section("Process", paras(c.process)) +
    band(c.media[1]) +
    section("Solution", paras(c.solution)) +
    outcomeSection(c.outcome) +
    band(c.media[2]) +
    '<section class="case-next container reveal">' +
    '<p class="case-next__label">Next project</p>' +
    '<a class="case-next__link" href="' + base + "work/" + esc(c.next.slug) + '.html">' +
    esc(c.next.title) + " &rarr;</a></section>";
}
