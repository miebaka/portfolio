const WIDTHS = [540, 810, 1080, 1440, 1920];
const esc = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const token = value => String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
const paras = list => (list || []).map(p => `<p>${esc(p)}</p>`).join("");
const upright = media => Boolean(media?.w && media?.h && media.w / media.h < 1.2);

function shot(media, kind, base, eager = false) {
  if (!media?.src) return "";
  const stem = `${base}assets/images/optimized/${token(media.src)}`;
  const widths = WIDTHS.filter(width => !media.w || width <= media.w);
  const fallback = widths.includes(1080) ? 1080 : widths.at(-1);
  const srcset = ext => widths.map(width => `${stem}-${width}.${ext} ${width}w`).join(", ");
  const sizes = kind === "pair" ? "(max-width: 50rem) 100vw, 43vw" : "100vw";
  const loading = kind === "hero" ? ' fetchpriority="high"' : eager ? ' loading="eager"' : ' loading="lazy"';
  return `<figure class="case-shot case-shot--${kind}"><picture><source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img src="${stem}-${fallback}.jpg" alt="${esc(media.alt || media.label)}" width="${media.w}" height="${media.h}"${loading} decoding="async"></picture>${media.label ? `<figcaption>${esc(media.label)}</figcaption>` : ""}</figure>`;
}

function sequence(media, base, eager = false) {
  let html = "";
  for (let index = 0; index < media.length; index++) {
    if (upright(media[index]) && upright(media[index + 1])) html += `<div class="case-pair">${shot(media[index], "pair", base, eager)}${shot(media[++index], "pair", base, eager)}</div>`;
    else html += shot(media[index], upright(media[index]) ? "upright" : "band", base, eager);
  }
  return html;
}

function factsBlock(study, project) {
  const facts = study.facts || {};
  const rows = [["Context", facts.context], ["My role", facts.role], ["Event", facts.event], ["Collaborators", facts.collaborators], ["Year", project?.year], ["Delivered", facts.delivered]].filter(([, value]) => value);
  return `<dl class="case-facts">${rows.map(([label, value]) => `<div class="case-facts__cell"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function chapter(id, label, heading, body, media, featured, base, eager = false) {
  const visual = media?.length ? `<div class="case-chapter__media${featured ? " case-chapter__media--feature" : ""}">${sequence(media, base, eager)}</div>` : "";
  return `<section class="case-chapter" id="${id}" aria-labelledby="${id}-title"><div class="case-chapter__copy container"><p class="case-chapter__label">${esc(label)}</p><h2 id="${id}-title">${esc(heading)}</h2><div class="case-chapter__body">${paras(body)}</div></div>${visual}</section>`;
}

export function renderCaseMarkup(site, slug, base = "../") {
  const study = site.caseStudies?.[slug];
  if (!study) return "";
  const project = site.projects?.find(item => item.slug === slug);
  if (site.workLocked) return `<section class="case-locked container"><p class="case-locked__label">Selected work</p><h1>${esc(project?.title || study.title)}</h1><span class="btn" aria-disabled="true">Coming soon</span></section>`;
  const [hero, ...rest] = study.media || [];
  const chapterIds = ["problem", "decision", "system", "applications", "result"];
  const groups = [[], [], [], [], []];
  rest.forEach((item, index) => {
    const assigned = chapterIds.indexOf(item.chapter);
    groups[assigned >= 0 ? assigned : Math.min(4, Math.floor(index * 5 / Math.max(1, rest.length)))].push(item);
  });
  const sources = study.sources?.length ? `<div class="case-sources">${study.sources.map(source => `<a href="${esc(source.href)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} <span aria-hidden="true">↗</span></a>`).join("")}</div>` : "";
  const next = study.next?.slug ? `<section class="case-next container" aria-label="Next project">${sources}<p class="case-next__label">Next project</p><a class="case-next__link" href="${base}work/${token(study.next.slug)}.html">${esc(study.next.title)}</a></section>` : "";
  const index = '<nav class="case-index" aria-label="Case study chapters"><a href="#problem"><span>01</span>Problem</a><a href="#decision"><span>02</span>Decision</a><a href="#system"><span>03</span>System</a><a href="#applications"><span>04</span>Applications</a><a href="#result"><span>05</span>Outcome</a></nav>';
  const titleLabel = slug === "tedx-rsu" ? "" : `<p class="case-title__label">${esc(project?.category || "PROJECT")} / ${esc(project?.year || "")}</p>`;
  const title = `<div class="case-title">${titleLabel}<p class="case-title__name">${esc(study.title)}</p></div>`;
  const lens = study.thesis ? `<section class="case-thesis container" aria-label="Creative thesis"><p>${esc(study.thesis)}</p>${study.lenses?.length ? `<ol>${study.lenses.map((item, index) => `<li><span>0${index + 1}</span><h2>${esc(item.title)}</h2><p>${esc(item.body)}</p></li>`).join("")}</ol>` : ""}</section>` : "";
  const headings = study.chapterHeadings || {};
  const eager = slug === "tedx-rsu";
  return `${title}${shot(hero, "hero", base)}<header class="case-lede container">${factsBlock(study, project)}<div class="case-lede__main"><h1 class="case-statement">${esc(study.tagline)}</h1><div class="case-brief">${paras(study.overview?.body)}</div>${index}</div></header>${lens}${chapter("problem", "01 / Problem", headings.problem || study.overview?.question || "The problem", study.challenge, groups[0], false, base, eager)}${chapter("decision", "02 / Decision", headings.decision || "The idea underneath the form", study.process, groups[1], true, base, eager)}${chapter("system", "03 / System", headings.system || "The choices that shaped it", study.solution, groups[2], false, base, eager)}${chapter("applications", "04 / Applications", headings.applications || "Where the work appeared", study.applications, groups[3], false, base, eager)}${chapter("result", "05 / Outcome", headings.result || "What the system enabled", study.outcome?.body, groups[4], false, base, eager)}${next}`;
}
