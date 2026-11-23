import { viewportQueries } from "../core/responsive.js";
import { renderNextContent } from "./next-content.js";

const WIDTHS = [540, 810, 1080, 1440, 1920];
const esc = (value) =>
  String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const token = (value) => String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
const paras = (list) => (list || []).map((p) => `<p>${esc(p)}</p>`).join("");
const upright = (media) => Boolean(media?.w && media?.h && media.w / media.h < 1.2);

function shot(media, kind, base, plate) {
  if (!media?.src) return "";
  const stem = `${base}assets/images/optimized/${token(media.src)}`;
  const widths = WIDTHS.filter((width) => !media.w || width <= media.w);
  const fallback = widths.includes(1080) ? 1080 : widths.at(-1);
  const srcset = (ext) => widths.map((width) => `${stem}-${width}.${ext} ${width}w`).join(", ");
  const sizes =
    kind === "pair" || kind === "gallery"
      ? `${viewportQueries.tabletMax} calc(100vw - 2.5em), 43vw`
      : kind === "upright"
        ? `${viewportQueries.tabletMax} calc(100vw - 2.5em), 50em`
        : `${viewportQueries.compact} calc(100vw - 2.5em), ${viewportQueries.wideMax} 90vw, 86em`;
  const loading = ' loading="lazy"';
  const caption = media.caption
    ? `<figcaption class="case-shot__caption">${plate ? `<span class="case-shot__plate">PLATE ${String(plate).padStart(2, "0")}</span>` : ""}<p>${esc(media.caption)}</p></figcaption>`
    : "";
  return `<figure class="case-shot case-shot--${kind}"><picture><source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img src="${stem}-${fallback}.jpg" alt="${esc(media.alt || media.label)}" width="${media.w}" height="${media.h}"${loading} decoding="async"></picture>${caption}</figure>`;
}

function sequence(media, base, nextPlate) {
  if (media.length >= 3) {
    return `<div class="case-gallery">${media.map((item) => shot(item, "gallery", base, nextPlate?.())).join("")}</div>`;
  }
  let html = "";
  for (let index = 0; index < media.length; index++) {
    if (upright(media[index]) && upright(media[index + 1]))
      html += `<div class="case-pair">${shot(media[index], "pair", base, nextPlate?.())}${shot(media[++index], "pair", base, nextPlate?.())}</div>`;
    else html += shot(media[index], upright(media[index]) ? "upright" : "band", base, nextPlate?.());
  }
  return html;
}

function factsBlock(study, project) {
  const facts = study.facts || {};
  const rows = [
    ["Context", facts.context],
    ["Role", facts.role],
    ["Constraint", facts.constraint],
    ["Year", project?.year],
    ["Collaborators", facts.collaborators],
    ["Delivered", facts.delivered],
  ].filter(([, value]) => value);
  return `<dl class="case-facts">${rows.map(([label, value]) => `<div class="case-facts__cell"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function chapter({ id, label, title, body }) {
  return `<section class="case-chapter" id="${token(id)}" aria-labelledby="${token(id)}-title"><div class="case-chapter__copy container"><div class="case-chapter__intro"><p class="case-chapter__eyebrow">${esc(label)}</p></div><h2 id="${token(id)}-title" class="case-chapter__heading">${esc(title || label)}</h2><div class="case-chapter__body">${paras(body)}</div></div></section>`;
}

function nextBlock(site, study, base) {
  const next = study.next;
  const project = site.projects?.find((item) => item.slug === next?.slug);
  if (!next?.slug || !project || project.status === "private") return "";
  const published = project.status === "published" && site.caseStudies?.[next.slug]?.status === "published";
  if (published && next.interactive !== false)
    return renderNextContent({ label: "Next project", title: next.title, href: `${base}work/${token(next.slug)}.html` });
  return `<section class="case-next container" aria-label="Next project"><p class="case-next__title">${esc(next.title)}</p>${published ? "" : '<p class="case-next__state">Coming soon</p>'}</section>`;
}

export function renderCaseMarkup(site, slug, base = "../") {
  const study = site.caseStudies?.[slug];
  if (!study) return "";
  const project = site.projects?.find((item) => item.slug === slug);
  if (study.status !== "published")
    return `<section class="case-locked container"><h1>${esc(project?.title || study.title)}</h1><p class="case-locked__status">Coming soon</p></section>`;
  if (!study.chapters?.length) return "";
  const hero = study.media?.find((media) => media.src === study.hero);
  const lookup = new Map((study.media || []).map((media) => [media.src, media]));
  let plate = 0;
  const nextPlate = () => ++plate;
  const heroMarkup = shot(hero, "hero", base, nextPlate());
  /* Use published artifacts only. The Rivo guidelines image is a cover,
     not a readable page excerpt; applications remain labelled visualisations. */
  const lead = {
    "tedx-rsu": {
      heading: "A local invitation inside a global identity",
      rationale: "TEDx red and its wordmark were fixed. “Pause…” supplied the local idea. The event-day photograph documents the gathering, not audience impact.",
      status: "Theme artwork and a documented event-day photograph.",
      images: ["tedx-rsu-logomark", "tedx-rsu-event"]
    },
    rivo: {
      heading: "One rule, from the kit to the application",
      rationale: "Keep the wordmark open, let Clar blue carry the field, and reserve yellow for the signal. The guidelines cover shows the handoff document; the stationery visualisation shows a proposed application of the rule.",
      status: "Guidelines cover and stationery visualisation; public production is not established.",
      images: ["rivo-guidelines", "rivo-stationery"]
    },
    chopbox: {
      heading: "If it doesn't build appetite, it doesn't belong",
      rationale: "The appetite test favoured a warm, rounded identity over harder delivery-app shorthand. The proposed sauce packaging carries that decision from the logo to a physical format.",
      status: "Brand presentation and proposed packaging; manufacture and sales are unverified.",
      images: ["chopbox-logo-lockups", "chopbox-packaging"]
    }
  }[slug];
  const role = study.facts?.role || project?.category || "";
  const constraint = study.facts?.constraint || "";
  const opening = `<header class="case-opening container" id="case-top">
    <p class="case-back"><a href="${base}work.html">← All work</a></p>
    <p class="case-opening__eyebrow">Selected case study / ${esc(project?.category || "Identity")}</p>
    <h1>${esc(project?.title || study.title)}</h1>
    <p class="case-opening__statement">${esc(study.tagline || project?.tagline || "")}</p>
    <dl class="case-opening__essentials">
      <div><dt>My role</dt><dd>${esc(role)}</dd></div>
      <div><dt>The constraint</dt><dd>${esc(constraint)}</dd></div>
    </dl>
    <div class="case-opening__actions"><a href="#case-gallery">View project gallery ↓</a><a href="${base}contact.html">Discuss a project ↗</a></div>
  </header>`;
  const featured = lead
    ? `<section class="case-lead-proof" aria-labelledby="case-lead-title">
      <div class="case-lead-proof__copy container"><p class="case-lead-proof__eyebrow">The decision</p>
        <h2 id="case-lead-title">${esc(lead.heading)}</h2><p>${esc(lead.rationale)}</p></div>
      <p class="case-lead-proof__status container">${esc(lead.status)}</p>
    </section>`
    : "";
  const leadImages = lead?.images.map(src => lookup.get(src)).filter(Boolean) || [];
  const leadGallery = leadImages.length
    ? `<div class="case-lead-proof__images">${leadImages.map(media => shot(media, "pair", base, nextPlate())).join("")}</div>`
    : "";
  const gallery = study.chapters.map(item => sequence(
    (item.media || []).map(src => lookup.get(src)).filter(Boolean), base, nextPlate,
  )).join("");
  return opening +
    `<div class="case-narrative container"><div class="case-narrative__copy">${featured || ""}${study.chapters.map(chapter).join("")}</div><aside class="case-facts-wrap container" aria-label="Project at a glance">${factsBlock(study, project)}</aside></div>` +
    `<section id="case-gallery" class="case-gallery-flow" aria-label="Project gallery">${heroMarkup}${leadGallery}${gallery}</section>` +
    nextBlock(site, study, base) +
    `<nav class="case-end-actions container" aria-label="Case study navigation"><a href="${base}contact.html">Send an inquiry ↗</a><a href="mailto:miebakakiki@gmail.com">Email directly ↗</a><a href="${base}work.html">All work ↗</a><a href="#case-top">Back to top ↑</a></nav>`;

}
