/* Two listings, one source of project data. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function cover(project, base) {
  if (!project.cover) return '<div class="project-no-image"><span>' + esc(project.caseReady === false ? 'In progress' : 'Image archive forthcoming') + '</span><span aria-hidden="true">' + esc(project.title) + '</span></div>';
  const src = base + 'assets/images/optimized/' + safeToken(project.cover);
  return '<img src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 25vw" alt="' + esc(project.tagline) + '" width="810" height="1080" loading="lazy" decoding="async">';
}
function projectMarkup(project, i, base, archive) {
  const number = String(i + 1).padStart(2, '0');
  const pending = project.caseReady === false;
  const element = pending ? 'article' : 'a';
  const href = pending ? '' : ' href="' + base + 'work/' + safeToken(project.slug) + '.html"';
  if (!archive) {
    return '<' + element + href + ' class="swiss-work-row"><span class="swiss-work-name" data-fill-color="' + ['#1649ed','#9b37d9','#e53924','#008870'][i % 4] + '">' + esc(project.title) + '</span><span class="swiss-work-arrow" aria-hidden="true">↗</span></' + element + '>';
  }
  return '<' + element + href + ' class="project-column" data-project="' + safeToken(project.slug) + '"><div class="project-column__head"><span>' + number + '</span><h2>' + esc(project.title) + '</h2><span aria-hidden="true">' + (pending ? '—' : '↗') + '</span></div><p class="project-column__category">(' + esc(project.category) + ')</p><ul class="project-column__tags">' + project.tags.map(tag => '<li>' + esc(tag) + '</li>').join('') + '</ul><div class="project-column__image">' + cover(project, base) + '</div><div class="project-column__foot"><span>' + esc(project.year) + '</span><span>' + (pending ? 'In progress' : 'View project') + '</span></div></' + element + '>';
}
export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const archive = document.body.dataset.page === 'work';
  const projects = archive ? SITE.projects : SITE.projects.filter(p => p.featured);
  el.classList.add(archive ? 'project-catalogue' : 'swiss-work-list');
  el.innerHTML = projects.map((p,i) => projectMarkup(p,i,basePath(),archive)).join('');
  if (!archive) return;
  const filters = document.querySelector('.swiss-filters');
  filters.hidden = false;
  const count = filters.querySelector('.swiss-filter-count');
  count.textContent = projects.length + ' projects';
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const filter = button.dataset.filter;
    let shown = 0;
    projects.forEach(p => {
      const tags = p.tags.join(' ').toLowerCase();
      const matches = filter === 'all' || (filter === 'brand' && tags.includes('brand')) || (filter === 'direction' && /direction|graphic|typography/.test(tags)) || (filter === 'digital' && /ui |product|web/.test(tags));
      el.querySelector('[data-project="' + safeToken(p.slug) + '"]').hidden = !matches;
      if (matches) shown++;
    });
    filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    count.textContent = shown + (shown === 1 ? ' project' : ' projects');
  });
}

function clientItem(client) {
  const dims = client.logoW ? ' width="' + client.logoW + '" height="' + client.logoH + '"' : ' height="32"';
  const inner = client.logo
    ? '<img src="' + esc(client.logo) + '" alt="' + esc(client.name) + '"' + dims + ' decoding="async">'
    : '<span class="marquee__wordmark">' + esc(client.name) + "</span>";
  /* Optical-balance multiplier, applied to the mark's height in CSS. Numbers
     only; guarded so a bad value can never inject a style. */
  const scale = typeof client.scale === "number" && client.scale > 0 ? client.scale : 1;
  const style = scale !== 1 ? ' style="--logo-scale:' + scale + '"' : "";
  return '<li class="marquee__item"' + style + ">" + inner + "</li>";
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
