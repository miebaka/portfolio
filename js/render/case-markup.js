const WIDTHS = [540, 810, 1080, 1440, 1920];
const esc = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const token = value => String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
const paras = list => (list || []).map(p => `<p>${esc(p)}</p>`).join("");
const upright = media => Boolean(media?.w && media?.h && media.w / media.h < 1.2);

function shot(media, kind, base) {
  if (!media?.src) return "";
  const stem = `${base}assets/images/optimized/${token(media.src)}`;
  const widths = WIDTHS.filter(width => !media.w || width <= media.w);
  const fallback = widths.includes(1080) ? 1080 : widths.at(-1);
  const srcset = ext => widths.map(width => `${stem}-${width}.${ext} ${width}w`).join(", ");
  const sizes = kind === "pair" ? "(max-width: 50rem) 100vw, 43vw" : "100vw";
  const loading = kind === "hero" ? ' fetchpriority="high"' : ' loading="lazy"';
  return `<figure class="case-shot case-shot--${kind}"><picture><source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img src="${stem}-${fallback}.jpg" alt="${esc(media.alt || media.label)}" width="${media.w}" height="${media.h}"${loading} decoding="async"></picture></figure>`;
}

function sequence(media, base) {
  let html = "";
  for (let index = 0; index < media.length; index++) {
    if (upright(media[index]) && upright(media[index + 1])) html += `<div class="case-pair">${shot(media[index], "pair", base)}${shot(media[++index], "pair", base)}</div>`;
    else html += shot(media[index], upright(media[index]) ? "upright" : "band", base);
  }
  return html;
}

function factsBlock(study, project) {
  const facts = study.facts || {};
  const rows = [["Context", facts.context], ["My role", facts.role], ["Year", project?.year], ["Delivered", facts.delivered]].filter(([, value]) => value);
  return `<dl class="case-facts">${rows.map(([label, value]) => `<div class="case-facts__cell"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function chapter(id, label, heading, body, media, featured, base) {
  const visual = media?.length ? `<div class="case-chapter__media${featured ? " case-chapter__media--feature" : ""}">${sequence(media, base)}</div>` : "";
  return `<section class="case-chapter" id="${id}" aria-labelledby="${id}-title"><div class="case-chapter__copy container"><p class="case-chapter__label">${esc(label)}</p><h2 id="${id}-title">${esc(heading)}</h2><div class="case-chapter__body">${paras(body)}</div></div>${visual}</section>`;
}

export function renderCaseMarkup(site, slug, base = "../") {
  const study = site.caseStudies?.[slug];
  if (!study) return "";
  const project = site.projects?.find(item => item.slug === slug);
  const [hero, ...rest] = study.media || [];
  const groups = [[], [], [], [], []];
  rest.forEach((item, index) => groups[Math.min(4, Math.floor(index * 5 / Math.max(1, rest.length)))].push(item));
  const next = study.next?.slug ? `<section class="case-next container" aria-label="Next project"><p class="case-next__label">Next project</p><a class="case-next__link" href="${base}work/${token(study.next.slug)}.html">${esc(study.next.title)}</a></section>` : "";
  const index = '<nav class="case-index" aria-label="Case study chapters"><a href="#problem"><span>01</span>Problem</a><a href="#decision"><span>02</span>Decision</a><a href="#system"><span>03</span>Direction</a><a href="#applications"><span>04</span>Applications</a><a href="#result"><span>05</span>Delivery</a></nav>';
  const view = '<div class="case-view" role="group" aria-label="Case study reading mode"><button type="button" data-case-view="brief" aria-pressed="false">Brief view</button><button type="button" data-case-view="full" aria-pressed="true">Full study</button></div>';
  return `${shot(hero, "hero", base)}<header class="case-lede container">${factsBlock(study, project)}<div class="case-lede__main"><div class="case-lede__top"><p class="case-kicker">Case study · ${esc(project?.year || "")}</p>${view}</div><h1 class="case-statement">${esc(study.tagline)}</h1><div class="case-brief">${paras(study.overview?.body)}</div>${index}</div></header>${chapter("problem", "01 / Problem", study.overview?.question || "The problem", study.challenge, groups[0], false, base)}${chapter("decision", "02 / Decision", "The idea underneath the form", study.process, groups[1], true, base)}${chapter("system", "03 / Direction", "The choices that shaped it", study.solution, groups[2], false, base)}${chapter("applications", "04 / Applications", "Where the work appeared", study.applications, groups[3], false, base)}${chapter("result", "05 / Delivery", "What the system enabled", study.outcome?.body, groups[4], false, base)}${next}`;
}
