/* Project presentation for the shared editorial indexes. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { renderEditorialIndex } from "./editorial-index.js";

export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  el.className = 'home-project-list';
  el.innerHTML = renderHomeProjectList(SITE.projects, SITE.caseStudies, basePath());
}

export function renderHomeProjectList(projects = SITE.projects, studies = SITE.caseStudies, base = "") {
  const bySlug = new Map(projects.map(project => [project.slug, project]));
  const selected = ["tedx-rsu", "rivo", "chopbox"].map(slug => {
    const project = bySlug.get(slug);
    const published = project?.status === "published" && studies?.[slug]?.status === "published";
    return { slug, title: project?.title || slug, href: published ? base + `work/${slug}.html` : "", cover: project?.cover || "" };
  });
  return renderEditorialIndex(selected.map(project => {
    const visual = project.cover ? '<span class="home-project-list__visual" aria-hidden="true"><img src="' + base + 'assets/images/optimized/' + safeToken(project.cover) + '-540.webp" alt="" width="540" height="405" loading="lazy" decoding="async"></span>' : '';
    const content = '<span class="home-project-list__title editorial-index__title">' + esc(project.title) + '</span>' + visual;
    return { href: project.href, tone: project.slug, className: project.href ? '' : 'home-project-list__pending', content };
  }), { variant: 'work', ordered: true });
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
  const previewFrames = {
    rivo: ["rivo-wordmark", "rivo-palette", "rivo-in-use"],
    "tedx-rsu": ["tedx-rsu-typeface", "tedx-rsu-logomark", "tedx-rsu-campus-banner"],
    chopbox: ["chopbox-logo-lockups", "chopbox-packaging", "chopbox-platter"]
  };
  const published = workIndex.filter(project => project.status === 'published');
  const inProgress = workIndex.filter(project => project.status !== 'published');
  const publishedMarkup = renderEditorialIndex(published.map(project => {
    const href = base + (project.href || 'work/' + safeToken(project.slug) + '.html');
    const frames = (previewFrames[project.slug] || []).map((src, index) => '<span class="project-archive__preview-frame" style="--preview-order:' + index + '"><img src="' + base + 'assets/images/optimized/' + safeToken(src) + '-540.webp" alt="" loading="lazy" decoding="async"></span>').join('');
    return { href, label: project.title + ', view project', tone: project.slug, className: 'project-archive__item project-archive__item--' + project.slug, content: '<div class="project-archive__row"><div class="project-archive__identity"><h2 class="editorial-index__title">' + esc(project.title) + '</h2><p class="editorial-index__description">' + esc(project.tagline) + '</p><time>' + esc(project.year) + '</time></div><div class="project-archive__media" aria-hidden="true">' + frames + '</div></div>' };
  }), { variant: 'archive', className: 'project-archive__published' });
  const progressMarkup = inProgress.length ? '<div class="project-archive__progress" role="region" aria-labelledby="in-progress-title"><div class="project-archive__progress-head"><h2 id="in-progress-title">In progress</h2><p>Studies still being edited into complete, evidence-led cases.</p></div><ul>' + inProgress.map(project => '<li><span>' + esc(project.title) + '</span><time>' + esc(project.year) + '</time></li>').join('') + '</ul></div>' : '';
  const collectionMarkup = '<nav class="project-archive__collections" aria-labelledby="more-practice-title"><div><p class="project-archive__eyebrow">Beyond case studies</p><h2 id="more-practice-title">See the practice from another angle</h2></div><ul><li><a href="' + base + 'explorations.html"><span>Experiments</span><small>Posters, tests and unfinished visual questions</small></a></li><li><a href="' + base + 'notes.html"><span>Notes</span><small>Writing on brands, culture and accessible design</small></a></li></ul></nav>';
  return publishedMarkup + progressMarkup + collectionMarkup;
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

export function renderClientProofMarkup(clients = SITE.clients) {
  return '<ul class="client-proof">' + (clients || []).map(clientItem).join("") + "</ul>";
}

export function createMarqueeController(root, deps = {}) {
  const doc = deps.document || root.ownerDocument || document;
  const button = deps.button || root.querySelector('.client-marquee__control');
  const Observer = deps.IntersectionObserver === undefined ? globalThis.IntersectionObserver : deps.IntersectionObserver;
  const reducedMotion = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  let visible = !Observer, userPaused = false, destroyed = false;
  const sync = () => {
    const running = !reducedMotion && !destroyed && !userPaused && visible && !doc.hidden;
    root.classList.toggle('is-running', running);
    root.dataset.marqueeState = running ? 'playing' : 'paused';
    button.setAttribute('aria-disabled', 'false');
    button.setAttribute('aria-pressed', String(userPaused));
    button.setAttribute('aria-label', userPaused ? 'Play client logos' : 'Pause client logos');
    const label = button.querySelector?.('[data-marquee-label]');
    if (label) label.textContent = userPaused ? 'Play' : 'Pause';
  };
  const play = () => { userPaused = false; sync(); };
  const pause = ({ user = true } = {}) => { if (user) userPaused = true; sync(); };
  const toggle = () => userPaused ? play() : pause();
  const onVisibility = () => sync();
  button.addEventListener('click', toggle);
  doc.addEventListener('visibilitychange', onVisibility);
  const observer = Observer ? new Observer(([entry]) => { visible = Boolean(entry?.isIntersecting); sync(); }, { threshold: 0.1 }) : null;
  observer?.observe(root);
  sync();
  return {
    play, pause,
    destroy() {
      if (destroyed) return; destroyed = true; observer?.disconnect();
      button.removeEventListener('click', toggle); doc.removeEventListener('visibilitychange', onVisibility); sync();
    },
    isPaused: () => userPaused
  };
}
