/* Project presentation for the editorial home index and cinematic work rail. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function projectMarkup(project, i, base) {
  const src = project.cover ? base + 'assets/images/optimized/' + safeToken(project.cover) : '';
  const media = src
    ? '<img class="work-flick__image" src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 760px) 100vw, 64vw" alt="' + esc(project.tagline) + '" width="810" height="1080" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
    : '<div class="work-flick__placeholder" aria-hidden="true"></div>';
  const href = safeURL(project.href || ('work/' + safeToken(project.slug) + '.html'));
  return '<article class="work-flick__item" style="--project-tone:' + esc(project.tone) + '">' +
    '<a class="work-flick__link" href="' + base + href + '">' +
    '<div class="work-flick__media">' + media + '</div>' +
    '<div class="work-flick__content"><span class="work-flick__number">' + String(i + 1).padStart(2, '0') + '</span><div><p>' + esc(project.category) + ' / ' + esc(project.year) + '</p><h3>' + esc(project.title) + '</h3></div><span class="work-flick__arrow" aria-hidden="true">↗</span></div></a></article>';
}

function bindExpansion(scope) {
  const groups = [...scope.querySelectorAll('.work-flick__pair')];
  (groups.length ? groups : [scope]).forEach(group => {
    const items = [...group.querySelectorAll('.work-flick__item')];
    const activate = item => items.forEach(panel => panel.classList.toggle('is-active', panel === item));
    items.forEach(item => {
      item.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') activate(item); });
      item.addEventListener('focus', () => activate(item));
    });
  });

}

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const archive = document.body.dataset.page === 'work';
  const projects = SITE.projects.filter(p => p.featured && p.caseReady !== false);
  if (!archive) projects.sort((a, b) => Number(b.slug === 'tedx-rsu') - Number(a.slug === 'tedx-rsu'));
  el.className = archive ? 'work-flick work-flick--archive' : 'work-flick work-flick--home';
  if (archive) {
    const pairs = [];
    for (let i = 0; i < projects.length; i += 2) {
      pairs.push('<div class="work-flick__pair">' + projects.slice(i, i + 2).map((p, j) => projectMarkup(p, i + j, basePath())).join('') + '</div>');
    }
    el.innerHTML = pairs.join('');
  } else {
    const base = basePath();
    el.innerHTML = projects.map((p, i) => projectMarkup(p, i, base)).join('') + '<a class="work-flick__item work-flick__item--more" href="' + base + 'work.html"><span class="work-flick__more-label">ARCHIVE / ' + String(SITE.projects.length).padStart(2, '0') + '</span><strong>SEE THE WORK</strong><span aria-hidden="true">→</span></a>';
  }
  bindExpansion(el);
}

export function renderProjectArchive() {
  const el = document.querySelector('[data-project-archive]');
  if (!el) return;
  el.className = 'project-archive__list system-list';
  el.innerHTML = SITE.projects.filter(project => project.caseReady !== false && !project.href?.startsWith('writing/') && !(project.tags || []).includes('Writing')).map((project, index) => {
    const action = '<a class="project-archive__action" href="' + basePath() + safeURL(project.href || 'work/' + safeToken(project.slug) + '.html') + '">VIEW CASE STUDY <span aria-hidden="true">↗</span></a>';
    return '<details class="project-archive__item system-list__item"><summary class="system-list__row"><span>' + String(index + 1).padStart(2, '0') + '</span><strong>' + esc(project.title) + '</strong><span>' + esc(project.category) + '</span><time>' + esc(project.year) + '</time><span class="project-archive__toggle system-list__toggle" aria-hidden="true"></span></summary><div class="project-archive__reveal system-list__panel"><p>' + esc(project.tagline) + '</p><p>' + (project.tags || []).map(esc).join(' · ') + '</p>' + action + '</div></details>';
  }).join('');
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
  const separator = '<li class="client-registration" aria-hidden="true"><span></span></li>';
  const items = SITE.clients.map(client => clientItem(client) + separator).join("");
  el.className = 'client-marquee';
  el.innerHTML = '<div class="client-marquee__head container"><button class="client-marquee__control" type="button" aria-pressed="false"><span aria-hidden="true">Ⅱ</span><span>PAUSE LOGOS</span></button></div><div class="client-marquee__track"><ul class="client-proof">' + items + '</ul><ul class="client-proof" aria-hidden="true">' + items + '</ul></div>';

  const control = el.querySelector('.client-marquee__control');
  control.addEventListener('click', () => {
    const paused = el.classList.toggle('is-paused');
    control.setAttribute('aria-pressed', String(paused));
    control.innerHTML = paused ? '<span aria-hidden="true">▶</span><span>PLAY LOGOS</span>' : '<span aria-hidden="true">Ⅱ</span><span>PAUSE LOGOS</span>';
  });

  if (!('IntersectionObserver' in window)) return;
  let visible = false;
  const sync = () => el.classList.toggle('is-running', visible && !document.hidden && !el.classList.contains('is-paused'));
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
  observer.observe(el);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  }, { once: true });
}
