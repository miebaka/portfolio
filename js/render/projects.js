/* Project presentation for the editorial home index and cinematic work rail. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function projectMarkup(project, i = 0, base = "") {
  if (project.status === "private") return "";
  const published = project.status === "published";
  const tag = published ? "a" : "article";
  const href = published ? ' href="' + safeURL(base + (project.href || 'work/' + safeToken(project.slug) + '.html')) + '"' : '';
  const src = project.cover ? base + 'assets/images/optimized/' + safeToken(project.cover) : '';
  const media = src
    ? '<img class="work-flick__image" src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 760px) 100vw, 64vw" alt="' + esc(project.tagline) + '" width="810" height="1080" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
    : '<div class="work-flick__placeholder" aria-hidden="true"></div>';
  return '<' + tag + ' class="work-flick__item' + (published ? '' : ' work-flick__item--locked') + '"' + href + ' aria-label="' + esc(project.title) + (published ? ', view project' : ', coming soon') + '">' +
    '<div class="work-flick__media">' + media + '</div>' +
    '<span class="work-flick__bar" aria-hidden="true">' + (published ? '<span class="work-flick__bar-arrow">↗</span>' : '') + '<span class="work-flick__bar-copy"><strong>' + esc(project.title) + '</strong>' + (published ? '<span>View project</span>' : '') + '</span></span>' +
    (published ? '' : '<span class="work-flick__status">Coming soon</span>') +
    '<div class="work-flick__content"><h3>' + esc(project.title) + '</h3></div></' + tag + '>';
}

function moreWorkMarkup(i, base) {
  return '<a class="work-flick__item work-flick__item--more" href="' + base + 'work.html" aria-label="See more work">' +
    '<div class="work-flick__content"><h3>See more</h3><span class="work-flick__more-arrow" aria-hidden="true">→</span></div></a>';
}

function bindExpansion(scope) {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const groups = [...scope.querySelectorAll('.work-flick__pair')];
  (groups.length ? groups : [scope]).forEach(group => {
    const items = [...group.querySelectorAll('.work-flick__item')];
    const activate = item => items.forEach(panel => panel.classList.toggle('is-active', panel === item));
    items.forEach(item => {
      item.addEventListener('pointerenter', event => {
        if (finePointer.matches && document.documentElement.dataset.motion !== 'reduced' && event.pointerType !== 'touch') activate(item);
      });
      item.addEventListener('focus', () => activate(null));
    });
    group.addEventListener('pointerleave', () => activate(null));
    finePointer.addEventListener('change', () => activate(null));
  });

}

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const archive = document.body.dataset.page === 'work';
  if (!archive) {
    el.className = 'home-project-list';
    el.innerHTML = renderHomeProjectList(basePath());
    return;
  }
  el.className = 'work-flick work-flick--archive';
  if (el.dataset.prerendered !== 'true') el.innerHTML = renderWorkMarkup(SITE.projects, basePath(), true);
  bindExpansion(el);
}

export function renderHomeProjectList(base = "") {
  const projects = [
    { title: "TEDx RSU", href: base + "work/tedx-rsu.html" },
    { title: "Rivo Studio", status: "Case study in progress" },
    { title: "Chop Box", status: "Case study in progress" },
    { title: "Detour", status: "Case study in progress" },
    { title: "Out Of Office", status: "Case study in progress" }
  ];
  return '<ol>' + projects.map(project => {
    const content = '<span class="home-project-list__title">' + esc(project.title) + '</span>' + (project.status ? '<span class="home-project-list__status">' + esc(project.status) + '</span>' : '<span class="home-project-list__arrow" aria-hidden="true">↗</span>');
    return '<li>' + (project.href ? '<a href="' + safeURL(project.href) + '">' + content + '</a>' : '<div class="home-project-list__pending">' + content + '</div>') + '</li>';
  }).join('') + '</ol>';
}

export function renderWorkMarkup(allProjects = SITE.projects, base = "", archive = false) {
  const projects = allProjects.filter(p => p.status !== 'private' && p.featured && p.caseReady !== false);
  if (archive) {
    const pairs = [];
    for (let i = 0; i < projects.length; i += 2) {
      pairs.push('<div class="work-flick__pair">' + projects.slice(i, i + 2).map((p, j) => projectMarkup(p, i + j, base)).join('') + '</div>');
    }
    return pairs.join('');
  } else {
    return projects.map((p, i) => projectMarkup(p, i, base)).join('') + moreWorkMarkup(projects.length, base);
  }
}

export function renderProjectArchive() {
  const el = document.querySelector('[data-project-archive]');
  if (!el) return;
  el.className = 'project-archive__list';
  if (el.dataset.prerendered !== 'true') el.innerHTML = renderProjectArchiveMarkup(SITE.projects, basePath());
}

export function renderProjectArchiveMarkup(projects = SITE.projects, base = "") {
  const bySlug = new Map(projects.map(project => [project.slug, project]));
  const workIndex = [
    { ...bySlug.get('tedx-rsu'), title: 'TEDx Rivers State University' },
    bySlug.get('rivo'),
    { ...bySlug.get('chopbox'), title: 'Chop Box' },
    { slug: 'detour', title: 'Detour', tagline: 'Case study in progress.', year: '2026', status: 'coming-soon' },
    { slug: 'out-of-office', title: 'Out Of Office', tagline: 'Case study in progress.', year: '2026', status: 'coming-soon' }
  ].filter(Boolean);
  return workIndex.map(project => {
    const published = project.status === 'published';
    const tag = published ? 'a' : 'article';
    const href = published ? ' href="' + safeURL(base + (project.href || 'work/' + safeToken(project.slug) + '.html')) + '"' : '';
    const label = esc(project.title) + (published ? ', view project' : ', project preview');
    return '<' + tag + ' class="project-archive__item project-archive__item--' + safeToken(project.slug) + '"' + href + ' aria-label="' + label + '"><div class="project-archive__row"><div class="project-archive__identity"><h2>' + esc(project.title) + '</h2><p>' + esc(project.tagline) + '</p><time>' + esc(project.year) + '</time></div><div class="project-archive__media" aria-hidden="true"></div></div></' + tag + '>';
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
  const style = ' style="--logo-scale:' + scale.toFixed(3) + ';--logo-aspect:' + aspect.toFixed(3) + '"';
  return '<li class="marquee__item"' + style + ">" + inner + "</li>";
}

export function renderClients() {
  const el = mount(MOUNT.CLIENTS);
  if (!el || !SITE.clients || !SITE.clients.length) return;
  const items = SITE.clients.map(clientItem).join("");
  el.className = 'client-marquee';
  el.innerHTML = '<button class="client-marquee__control" type="button" aria-label="Pause client logos" aria-pressed="false"><span data-marquee-label>Pause</span></button><div class="client-marquee__track"><ul class="client-proof">' + items + '</ul><ul class="client-proof" aria-hidden="true">' + items + '</ul></div>';
  const controller = createMarqueeController(el);
  addEventListener('pagehide', () => controller.destroy(), { once: true });
}

export function createMarqueeController(root, deps = {}) {
  const doc = deps.document || root.ownerDocument || document;
  const button = deps.button || root.querySelector('.client-marquee__control');
  const Observer = deps.IntersectionObserver === undefined ? globalThis.IntersectionObserver : deps.IntersectionObserver;
  const reduced = deps.reduced || (() => doc.documentElement?.dataset.motion === 'reduced');
  let visible = !Observer, userPaused = false, destroyed = false;
  const sync = () => {
    const isReduced = reduced();
    const running = !destroyed && !isReduced && !userPaused && visible && !doc.hidden;
    root.classList.toggle('is-running', running);
    root.dataset.marqueeState = isReduced ? 'static' : running ? 'playing' : 'paused';
    button.setAttribute('aria-disabled', String(isReduced));
    button.setAttribute('aria-pressed', String(userPaused));
    button.setAttribute('aria-label', userPaused ? 'Play client logos' : 'Pause client logos');
    const label = button.querySelector?.('[data-marquee-label]');
    if (label) label.textContent = userPaused ? 'Play' : 'Pause';
  };
  const play = () => { userPaused = false; sync(); };
  const pause = ({ user = true } = {}) => { if (user) userPaused = true; sync(); };
  const toggle = () => userPaused ? play() : pause();
  const onVisibility = () => sync();
  const onMotion = () => sync();
  button.addEventListener('click', toggle);
  doc.addEventListener('visibilitychange', onVisibility);
  doc.addEventListener('motionpreferencechange', onMotion);
  const observer = Observer ? new Observer(([entry]) => { visible = Boolean(entry?.isIntersecting); sync(); }, { threshold: 0.1 }) : null;
  observer?.observe(root);
  sync();
  return {
    play, pause,
    destroy() {
      if (destroyed) return; destroyed = true; observer?.disconnect();
      button.removeEventListener('click', toggle); doc.removeEventListener('visibilitychange', onVisibility); doc.removeEventListener('motionpreferencechange', onMotion); sync();
    },
    isPaused: () => userPaused
  };
}
