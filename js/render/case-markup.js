const WIDTHS = [540, 810, 1080, 1440, 1920];
const esc = value => String(value ?? "").replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
const token = value => String(value ?? "").replace(/[^a-z0-9_-]/gi, "");
const paras = list => (list || []).map(p => `<p>${esc(p)}</p>`).join("");
const upright = media => Boolean(media?.w && media?.h && media.w / media.h < 1.2);

function shot(media, kind, base, plate) {
  if (!media?.src) return "";
  const stem = `${base}assets/images/optimized/${token(media.src)}`;
  const widths = WIDTHS.filter(width => !media.w || width <= media.w);
  const fallback = widths.includes(1080) ? 1080 : widths.at(-1);
  const srcset = ext => widths.map(width => `${stem}-${width}.${ext} ${width}w`).join(", ");
  const sizes = kind === "pair" ? "(max-width: 64rem) calc(100vw - 2.5rem), 43vw" : kind === "upright" ? "(max-width: 52.5rem) calc(100vw - 2.5rem), 50rem" : "(max-width: 48rem) calc(100vw - 2.5rem), (max-width: 100rem) 90vw, 92rem";
  const loading = kind === "hero" ? ' loading="eager" fetchpriority="high"' : ' loading="lazy"';
  const caption = media.caption ? `<figcaption class="case-shot__caption">${plate ? `<span class="case-shot__plate">PLATE ${String(plate).padStart(2, "0")}</span>` : ""}<p>${esc(media.caption)}</p></figcaption>` : "";
  return `<figure class="case-shot case-shot--${kind}"><picture><source type="image/avif" srcset="${srcset("avif")}" sizes="${sizes}"><source type="image/webp" srcset="${srcset("webp")}" sizes="${sizes}"><img src="${stem}-${fallback}.jpg" alt="${esc(media.alt || media.label)}" width="${media.w}" height="${media.h}"${loading} decoding="async"></picture>${caption}</figure>`;
}

function sequence(media, base, nextPlate) {
  let html = "";
  for (let index = 0; index < media.length; index++) {
    if (upright(media[index]) && upright(media[index + 1])) html += `<div class="case-pair">${shot(media[index], "pair", base, nextPlate?.())}${shot(media[++index], "pair", base, nextPlate?.())}</div>`;
    else html += shot(media[index], upright(media[index]) ? "upright" : "band", base, nextPlate?.());
  }
  return html;
}

function factsBlock(study, project) {
  const facts = study.facts || {};
  const rows = [["Context", facts.context], ["My role", facts.role], ["Year", project?.year], ["Deliverables", facts.delivered], ["Collaborators", facts.collaborators]].filter(([, value]) => value);
  return `<dl class="case-facts">${rows.map(([label, value]) => `<div class="case-facts__cell"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl>`;
}

function chapter(id, label, heading, body, media, featured, base, nextPlate) {
  const visual = media?.length ? `<div class="case-chapter__media${featured ? " case-chapter__media--feature" : ""}">${sequence(media, base, nextPlate)}</div>` : "";
  const title = heading || label;
  return `<section class="case-chapter" id="${token(id)}" aria-labelledby="${token(id)}-title"><div class="case-chapter__copy container"><p class="case-chapter__label">${esc(label)}</p><h2 id="${token(id)}-title">${esc(title)}</h2><div class="case-chapter__body">${paras(body)}</div></div>${visual}</section>`;
}

function nextBlock(site, study, base) {
  const next = study.next;
  const project = site.projects?.find(item => item.slug === next?.slug);
  if (!next?.slug || !project || project.status === "private") return "";
  const published = project.status === "published" && site.caseStudies?.[next.slug]?.status === "published";
  const title = published && next.interactive !== false
    ? `<a class="case-next__link" href="${base}work/${token(next.slug)}.html">${esc(next.title)}</a>`
    : `<p class="case-next__title">${esc(next.title)}</p>`;
  return `<section class="case-next container" aria-label="Next project"><p class="case-next__label">Next project</p>${title}${published ? "" : '<p class="case-next__state">Coming soon</p>'}</section>`;
}

export function renderCaseMarkup(site, slug, base = "../") {
  const study = site.caseStudies?.[slug];
  if (!study) return "";
  const project = site.projects?.find(item => item.slug === slug);
  if (study.status !== "published") return `<section class="case-locked container"><p class="case-locked__label">Selected work</p><h1>${esc(project?.title || study.title)}</h1><span class="btn" aria-disabled="true">Coming soon</span></section>`;
  if (study.chapters?.length) {
    const hero = study.media?.find(media => media.src === study.hero);
    const lookup = new Map((study.media || []).map(media => [media.src, media]));
    let plate = 0;
    const nextPlate = () => ++plate;
    const heroMarkup = shot(hero, "hero", base, nextPlate());
    const index = `<nav class="case-index" aria-label="Case study chapters"><ol>${study.chapters.map((item, number) => `<li><a href="#${token(item.id)}"><span aria-hidden="true">${String(number + 1).padStart(2, "0")}</span>${esc(item.label)}</a></li>`).join("")}</ol></nav>`;
    const chapters = study.chapters.map((item, number) => chapter(item.id, `${String(number + 1).padStart(2, "0")} / ${item.label}`, item.title, item.body, (item.media || []).map(src => lookup.get(src)).filter(Boolean), false, base, nextPlate)).join("");
    const next = nextBlock(site, study, base);
    return `<header class="case-opening container"><p class="case-back"><a href="${base}work.html">Back to Work</a></p><p class="case-project">${esc(study.title)}</p><h1 class="case-statement">${esc(study.tagline)}</h1></header>${heroMarkup}<div class="case-lede container">${factsBlock(study, project)}<div class="case-lede__main">${index}</div></div>${chapters}${next}`;
  }
  const [hero, ...rest] = study.media || [];
  const groups = [[], [], [], [], []];
  rest.forEach((item, index) => groups[Math.min(4, Math.floor(index * 5 / Math.max(1, rest.length)))].push(item));
  const next = nextBlock(site, study, base);
  const index = '<nav class="case-index" aria-label="Case study chapters"><a href="#problem"><span>01</span>Problem</a><a href="#decision"><span>02</span>Decision</a><a href="#system"><span>03</span>Direction</a><a href="#applications"><span>04</span>Applications</a><a href="#result"><span>05</span>Delivery</a></nav>';
  return `${shot(hero, "hero", base)}<header class="case-lede container">${factsBlock(study, project)}<div class="case-lede__main"><h1 class="case-statement">${esc(study.tagline)}</h1><div class="case-brief">${paras(study.overview?.body)}</div>${index}</div></header>${chapter("problem", "01 / Problem", study.overview?.question || "The problem", study.challenge, groups[0], false, base)}${chapter("decision", "02 / Decision", "The idea underneath the form", study.process, groups[1], true, base)}${chapter("system", "03 / Direction", "The choices that shaped it", study.solution, groups[2], false, base)}${chapter("applications", "04 / Applications", "Where the work appeared", study.applications, groups[3], false, base)}${chapter("result", "05 / Delivery", "What the system enabled", study.outcome?.body, groups[4], false, base)}${next}`;
}
