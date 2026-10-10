/* Project presentation for the editorial home index and cinematic work rail. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function projectMarkup(project, i, base) {
  const src = project.cover ? base + 'assets/images/optimized/' + safeToken(project.cover) : '';
  const media = src
    ? '<img class="work-flick__image" src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 760px) 100vw, 64vw" alt="' + esc(project.tagline) + '" width="810" height="1080" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
    : '<div class="work-flick__placeholder" aria-hidden="true"></div>';
  const href = project.href ? base + project.href : base + 'work/' + safeToken(project.slug) + '.html';
  return '<a class="work-flick__item' + (i === 0 ? ' is-active' : '') + '" href="' + href + '" aria-label="View ' + esc(project.title) + '">' +
    '<div class="work-flick__media">' + media + '<span class="work-flick__veil" aria-hidden="true"></span></div>' +
    '<span class="work-flick__tab" aria-hidden="true"><span>' + String(i + 1).padStart(2, "0") + '</span><strong>' + esc(project.title) + '</strong></span>' +
    '<div class="work-flick__content"><p class="work-flick__category">' + esc(project.category) + '</p><h3>' + esc(project.title) + '</h3>' +
    '<div class="work-flick__detail"><p>' + esc(project.tagline) + '</p><span class="work-flick__action">View project</span></div></div></a>';
}

function homeProjectMarkup(project, i, base) {
  return '<a class="home-work-index__row' + (i === 0 ? ' is-active' : '') + '" href="' + base + 'work/' + safeToken(project.slug) + '.html" data-project-cover="' + esc(project.cover) + '" data-project-title="' + esc(project.title) + '">' +
    '<span class="home-work-index__number">' + String(i + 1).padStart(2, "0") + '</span>' +
    '<span class="home-work-index__title">' + esc(project.title) + '</span>' +
    '<span class="home-work-index__meta">' + esc(project.category) + ' · ' + esc(project.year) + '</span></a>';
}

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const archive = document.body.dataset.page === 'work';
  const projects = (archive ? SITE.projects : SITE.projects.filter(p => p.featured)).filter(p => p.caseReady !== false);
  if (!archive) {
    const base = basePath();
    const first = projects[0];
    const firstSrc = base + 'assets/images/optimized/' + safeToken(first.cover);
    el.className = 'home-work-showcase';
    el.innerHTML = '<figure class="home-work-preview" aria-hidden="true"><img src="' + firstSrc + '-810.webp" srcset="' + firstSrc + '-540.webp 540w, ' + firstSrc + '-810.webp 810w, ' + firstSrc + '-1080.webp 1080w" sizes="(max-width: 767px) 100vw, 42vw" alt="" width="810" height="1080" decoding="async"></figure>' +
      '<div class="home-work-index">' + projects.map((p, i) => homeProjectMarkup(p, i, base)).join('') + '</div>';
    const preview = el.querySelector('.home-work-preview img');
    const rows = [...el.querySelectorAll('.home-work-index__row')];
    const activate = row => {
      if (!row || row.classList.contains('is-active')) return;
      rows.forEach(item => item.classList.toggle('is-active', item === row));
      const src = base + 'assets/images/optimized/' + safeToken(row.dataset.projectCover);
      preview.src = src + '-810.webp';
      preview.srcset = src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w';
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        preview.animate([{ opacity: .28, transform: 'scale(1.018)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.2,0,0,1)' });
      }
    };
    rows.forEach(row => {
      row.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') activate(row); });
      row.addEventListener('focus', () => activate(row));
    });
    return;
  }
  el.className = 'work-flick';
  el.innerHTML = projects.map((p, i) => projectMarkup(p, i, basePath())).join('');
  const items = [...el.querySelectorAll('.work-flick__item')];
  const activate = item => items.forEach(panel => panel.classList.toggle('is-active', panel === item));
  items.forEach(item => {
    item.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') activate(item); });
    item.addEventListener('focus', () => activate(item));
  });
}

function clientItem(client) {
  const dims = client.logoW ? ' width="' + client.logoW + '" height="' + client.logoH + '"' : ' height="32"';
  const inner = client.logo
    ? '<img src="' + esc(client.logo) + '" alt="' + esc(client.name) + '"' + dims + ' decoding="async">'
    : '<span class="marquee__wordmark">' + esc(client.name) + "</span>";
  /* Equal perceived area starts with geometry: if height is h and width is
     aspect × h, equal area means h is proportional to 1/sqrt(aspect). The
     optical factor only corrects for unusually light or dense artwork. */
  const aspect = client.logoW && client.logoH ? client.logoW / client.logoH : 1;
  const optical = typeof client.optical === "number" ? client.optical : 1;
  const scale = Math.min(1.25, Math.max(0.45, (1.15 / Math.sqrt(aspect)) * optical));
  const style = ' style="--logo-scale:' + scale.toFixed(3) + '"';
  return '<li class="marquee__item"' + style + ">" + inner + "</li>";
}

export function renderClients() {
  const el = mount(MOUNT.CLIENTS);
  if (!el || !SITE.clients || !SITE.clients.length) return;
  el.innerHTML = '<ul class="client-proof">' + SITE.clients.map(clientItem).join("") + '</ul>';
}
