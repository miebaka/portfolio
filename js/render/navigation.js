/* Render — navigation bar (logo · menu) and the fullscreen overlay menu. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount, basePath } from "../utilities/dom.js";

function brandHTML() {
  const base = basePath();
  return (
    '<a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ' — home">' +
    '<span class="site-nav__logo" role="img" aria-label="' + esc(SITE.name) + '"></span>' +
    "</a>"
  );
}

/* Reads current theme state and syncs the toggle's aria-pressed attribute. */
function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const html = document.documentElement;
  function isDark() { return html.dataset.theme === "dark"; }
  function sync() { btn.setAttribute("aria-pressed", String(isDark())); }
  sync();
  btn.addEventListener("click", function () {
    const next = isDark() ? "light" : "dark";
    html.dataset.theme = next;
    localStorage.setItem("color-theme", next);
    sync();
  });
}

export function renderNavigation() {
  const el = mount("nav");
  if (!el) return;
  el.className = "site-nav";
  /* Three-column grid: Logo (left) | Menu (centre, auto-width) | Toggle (right) */
  el.innerHTML =
    '<div class="container site-nav__inner">' +
    brandHTML() +
    '<button class="site-nav__menu-btn" type="button" data-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu">Menu</button>' +
    '<button class="theme-toggle" type="button" id="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<svg class="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<circle cx="12" cy="12" r="4" fill="currentColor"/>' +
        '<line x1="12" y1="2" x2="12" y2="5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="12" y1="18.5" x2="12" y2="22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="4.22" y1="4.22" x2="6.64" y2="6.64" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="17.36" y1="17.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="2" y1="12" x2="5.5" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="18.5" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="4.22" y1="19.78" x2="6.64" y2="17.36" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
        '<line x1="17.36" y1="6.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      '</svg>' +
      '<span class="theme-toggle__track">' +
        '<span class="theme-toggle__knob"></span>' +
      "</span>" +
      '<svg class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>' +
      '</svg>' +
    "</button>" +
    "</div>";
  setupThemeToggle();
}

/* Floating pill — always links home on every page except home. */
export function renderBackButton() {
  const page = document.body.dataset.page || "";
  if (page === "home") return;
  const base = basePath();
  const btn = document.createElement("a");
  btn.className = "back-btn";
  btn.href = base + "index.html";
  btn.innerHTML = "&larr;&ensp;Home";
  document.body.appendChild(btn);
  setupThemeTracking(btn);
}

/* Toggles .back-btn--dark whenever the button's centre overlaps a dark surface.
   Uses visibility:hidden for one rAF tick so elementFromPoint finds what's below,
   then restores. Throttled to one rAF per scroll event to stay on the fast path. */
function setupThemeTracking(btn) {
  function lum(rgba) {
    const m = rgba.match(/[\d.]+/g);
    if (!m) return 1;
    const r = +m[0], g = +m[1], b = +m[2];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }
  function update() {
    const rect = btn.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width  / 2);
    const y = Math.round(rect.top  + rect.height / 2);
    btn.style.visibility = "hidden";
    let el = document.elementFromPoint(x, y);
    btn.style.visibility = "";
    el = el || document.body;
    while (el && el !== document.documentElement) {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)") {
        btn.classList.toggle("back-btn--dark", lum(bg) < 0.5);
        return;
      }
      el = el.parentElement;
    }
    btn.classList.remove("back-btn--dark");
  }
  let tick = false;
  window.addEventListener("scroll", function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { update(); tick = false; });
  }, { passive: true });
  update();
}

export function renderMenu() {
  if (document.getElementById("site-menu")) return;
  const base = basePath();
  const page = document.body.dataset.page || "";

  const items = (SITE.menu || [])
    .map((m) => {
      const current = m.key === page ? ' aria-current="page"' : "";
      return '<a href="' + base + esc(m.href) + '"' + current + ">" + esc(m.label) + "</a>";
    })
    .join("");

  const menu = document.createElement("dialog");
  menu.className = "site-menu";
  menu.id = "site-menu";
  menu.setAttribute("aria-label", "Site menu");
  /* Native <dialog> provides built-in focus trap, AT announcement, and
     Escape handling — no role/aria-modal needed (implicit on dialog element). */
  /* Bar mirrors the site-nav's 3-column grid so Close sits exactly where the
     Menu trigger is — the crossfade reads as one button morphing in place. */
  menu.innerHTML =
    '<div class="container site-menu__bar">' +
      brandHTML() +
      '<button class="site-menu__close" type="button" data-menu-close aria-label="Close menu">Close</button>' +
      '<span class="site-menu__bar-spacer" aria-hidden="true"></span>' +
    "</div>" +
    '<nav class="site-menu__nav" aria-label="Primary">' +
      '<div class="site-menu__list">' + items + "</div>" +
    "</nav>" +
    '<div class="container site-menu__foot">' +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
    "</div>";
  document.body.appendChild(menu);
}
