/* Expanding project panels with HyperUI-inspired hover content. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function projectMarkup(project, i, base) {
  const src = project.cover ? base + 'assets/images/optimized/' + safeToken(project.cover) : '';
  const media = src
    ? '<img class="work-flick__image" src="' + src + '-810.webp" srcset="' + src + '-540.webp 540w, ' + src + '-810.webp 810w, ' + src + '-1080.webp 1080w" sizes="(max-width: 760px) 100vw, 64vw" alt="' + esc(project.tagline) + '" width="810" height="1080" ' + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async">'
    : '<div class="work-flick__placeholder" aria-hidden="true"></div>';
  return '<a class="work-flick__item' + (i === 0 ? ' is-active' : '') + '" href="' + base + 'work/' + safeToken(project.slug) + '.html" aria-label="View ' + esc(project.title) + ' case study">' +
    '<div class="work-flick__media">' + media + '<span class="work-flick__veil" aria-hidden="true"></span></div><div class="work-flick__content"><p class="work-flick__category">' + esc(project.category) + '</p><h3>' + esc(project.title) + '</h3>' +
    '<div class="work-flick__detail"><p>' + esc(project.tagline) + '</p><span class="work-flick__action">View project <span aria-hidden="true">↗</span></span></div></div></a>';
}
export function renderWork() {
  const el = mount(MOUNT.WORK_GRID);
  if (!el) return;
  const archive = document.body.dataset.page === 'work';
  const projects = (archive ? SITE.projects : SITE.projects.filter(p => p.featured)).filter(p => p.caseReady !== false);
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
