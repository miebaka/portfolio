import { CASE_STORY_STRUCTURE } from "../../data/case-story-structure.js";

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
      ? "(max-width: 64em) calc(100vw - 2.5em), 43vw"
      : kind === "upright"
        ? "(max-width: 52.5em) calc(100vw - 2.5em), 50em"
        : "(max-width: 48em) calc(100vw - 2.5em), (max-width: 100em) 90vw, 92em";
  const loading = kind === "hero" ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
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

function chapter(id, label, descriptor, heading, body, media, featured, base, nextPlate) {
  const visual = media?.length
    ? `<div class="case-chapter__media${featured ? " case-chapter__media--feature" : ""}">${sequence(media, base, nextPlate)}</div>`
    : "";
  const title = heading || label;
  return `<section class="case-chapter" id="${token(id)}" aria-labelledby="${token(id)}-title"><div class="case-chapter__copy container"><div class="case-chapter__intro"><h2 id="${token(id)}-title">${esc(label)}</h2><p class="case-chapter__descriptor">${esc(descriptor)}</p></div><h3 class="case-chapter__heading">${esc(title)}</h3><div class="case-chapter__body">${paras(body)}</div></div>${visual}</section>`;
}

function nextBlock(site, study, base) {
  const next = study.next;
  const project = site.projects?.find((item) => item.slug === next?.slug);
  if (!next?.slug || !project || project.status === "private") return "";
  const published = project.status === "published" && site.caseStudies?.[next.slug]?.status === "published";
  const title =
    published && next.interactive !== false
      ? `<a class="case-next__link" href="${base}work/${token(next.slug)}.html">${esc(next.title)}</a>`
      : `<p class="case-next__title">${esc(next.title)}</p>`;
  return `<section class="case-next container" aria-label="Next project">${title}${published ? "" : '<p class="case-next__state">Coming soon</p>'}</section>`;
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
  const chapters = study.chapters
    .map((item) => chapter(
      item.id, item.label, CASE_STORY_STRUCTURE.find((spec) => spec.id === item.id)?.descriptor || "", item.title, item.body,
      (item.media || []).map((src) => lookup.get(src)).filter(Boolean),
      false, base, nextPlate,
    ))
    .join("");
  return `<header class="case-opening container" id="case-top"><p class="case-back"><a href="${base}work.html">Back to Work</a></p><h1>${esc(project?.title || study.title)}</h1><p class="case-opening__statement">${esc(study.tagline || project?.tagline || "")}</p></header>${heroMarkup}<div class="case-facts-wrap container" aria-label="Project at a glance">${factsBlock(study, project)}</div>${chapters}${nextBlock(site, study, base)}<nav class="case-end-actions container" aria-label="Case study navigation"><a href="#case-top">Back to top ↑</a><a href="${base}work.html">All work ↗</a></nav>`;
}
