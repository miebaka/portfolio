/* Project presentation for the editorial home index and cinematic work rail. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function projectMarkup(project, i, base) {
  const src = project.cover ? base + 'assets/images/optimized/' + safeToken(project.cover) : '';
  const media = src
    ? '<img class="work-flick__image" src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 760px) 100vw, 64vw" alt="' + esc(project.tagline) + '" width="810" height="1080" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
    : '<div class="work-flick__placeholder" aria-hidden="true"></div>';
  return '<article class="work-flick__item work-flick__item--locked" aria-label="' + esc(project.title) + ', coming soon">' +
    '<div class="work-flick__media">' + media + '</div>' +
    '<span class="work-flick__bar" aria-hidden="true"><span class="work-flick__bar-copy"><strong>' + esc(project.title) + '</strong></span></span>' +
    '<span class="work-flick__status" aria-hidden="true"><span class="btn">Coming soon</span></span>' +
    '<div class="work-flick__content"><h3>' + esc(project.title) + '</h3></div></article>';
}

function moreWorkMarkup(i, base) {
  return '<a class="work-flick__item work-flick__item--more" href="' + base + 'work.html" aria-label="See more work">' +
    '<div class="work-flick__content"><h3>See more</h3><span class="work-flick__more-arrow" aria-hidden="true">→</span></div></a>';
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
  el.className = archive ? 'work-flick work-flick--archive' : 'work-flick work-flick--home';
  if (archive) {
    const pairs = [];
    for (let i = 0; i < projects.length; i += 2) {
      pairs.push('<div class="work-flick__pair">' + projects.slice(i, i + 2).map((p, j) => projectMarkup(p, i + j, basePath())).join('') + '</div>');
    }
    el.innerHTML = pairs.join('');
  } else {
    const base = basePath();
    el.innerHTML = projects.map((p, i) => projectMarkup(p, i, base)).join('') + moreWorkMarkup(projects.length, base);
  }
  bindExpansion(el);
}

export function renderProjectArchive() {
  const el = document.querySelector('[data-project-archive]');
  if (!el) return;
  el.className = 'project-archive__list system-list';
  el.innerHTML = SITE.projects.filter(project => !project.href?.startsWith('writing/') && !(project.tags || []).includes('Writing')).map((project, index) => {
    const action = '<span class="project-archive__status" aria-disabled="true"><span class="btn">Coming soon</span></span>';
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
  el.innerHTML = '<div class="client-marquee__track"><ul class="client-proof">' + items + '</ul><ul class="client-proof" aria-hidden="true">' + items + '</ul></div>';

  if (!('IntersectionObserver' in window)) return;
  let visible = false;
  const sync = () => el.classList.toggle('is-running', visible && !document.hidden);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
  observer.observe(el);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  }, { once: true });
}
