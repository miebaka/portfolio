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
      ? `${viewportQueries.tabletMax} calc(100vw - 2rem), calc((100vw - 6.5rem) / 2)`
      : kind === "upright"
        ? `${viewportQueries.tabletMax} calc(100vw - 2rem), 50em`
        : `${viewportQueries.compact} calc(100vw - 2rem), calc(100vw - 5rem)`;
  const loading = kind === "hero" ? ' loading="eager"' : ' loading="lazy"';
  const caption = kind !== "hero" && media.caption
    ? `<figcaption class="case-shot__caption">${plate ? `<span class="case-shot__plate">PLATE ${String(plate).padStart(2, "0")}</span>` : ""}<p>${esc(media.caption)}</p></figcaption>`
    : "";
  if (media.remoteSrc && /^https:\/\/mir-s3-cdn-cf\.behance\.net\/project_modules\//.test(media.remoteSrc))
    return `<figure class="case-shot case-shot--${kind}"><picture><img src="${esc(media.remoteSrc)}" alt="${esc(media.alt || media.label)}" width="${media.w}" height="${media.h}" loading="${kind === "hero" ? "eager" : "lazy"}" referrerpolicy="no-referrer" decoding="async"></picture>${caption}</figure>`;
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
    ["Year", project?.year || "Not documented"],
    ["Deliverables", facts.delivered || "Not documented"],
    ["Credits", facts.collaborators || facts.role || "Not documented"],
  ];
  return `<dl class="case-facts container">${rows.map(([label, value]) => `<div class="case-facts__cell"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
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
  const opening = `<header class="case-opening container" id="case-top"><p class="case-back"><a href="${base}work.html">← All work</a></p><h1>${esc(project?.title || study.title)}</h1></header>`;
  const toc = `<nav class="article-toc case-toc" aria-label="Case study contents"><p>The story</p><ol>${study.chapters.map((item, index) => `<li><a href="#${token(item.id)}"><span class="article-toc__index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span><strong class="article-toc__title">${esc(item.label)}</strong></a></li>`).join("")}</ol></nav>`;
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
  return opening + heroMarkup + factsBlock(study, project) +
    `<div class="article-reading case-narrative container">${toc}<div class="article-body case-narrative__copy">${featured || ""}${study.chapters.map(chapter).join("")}</div></div>` +
    `<section id="case-gallery" class="case-gallery-flow" aria-label="Project gallery">${leadGallery}${gallery}</section>` +
    (study.source && /^https:\/\/www\.behance\.net\/gallery\//.test(study.source) ? `<p class="container"><a class="link" href="${esc(study.source)}" rel="noopener noreferrer">Original project on Behance ↗</a></p>` : "") +
    nextBlock(site, study, base) +
    `<nav class="case-end-actions container" aria-label="Case study navigation"><a href="${base}contact.html">Send an inquiry ↗</a><a href="mailto:miebakakiki@gmail.com">Email directly ↗</a><a href="${base}work.html">All work ↗</a><a href="#case-top">Back to top ↑</a></nav>`;

}
