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
      '<span class="theme-toggle__track">' +
        '<span class="theme-toggle__knob"></span>' +
      "</span>" +
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

  const menu = document.createElement("div");
  menu.className = "site-menu";
  menu.id = "site-menu";
  menu.setAttribute("role", "dialog");
  menu.setAttribute("aria-modal", "true");
  menu.setAttribute("aria-label", "Site menu");
  menu.innerHTML =
    '<div class="container site-menu__bar">' +
      brandHTML() +
      '<button class="site-menu__close btn" type="button" data-menu-close aria-label="Close menu">' +
        "<span>Close</span>" +
        '<span class="site-menu__close-icon" aria-hidden="true">&#10005;</span>' +
      "</button>" +
    "</div>" +
    '<nav class="container site-menu__nav" aria-label="Primary">' +
      '<div class="site-menu__list">' + items + "</div>" +
    "</nav>" +
    '<div class="container site-menu__foot">' +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
    "</div>";
  document.body.appendChild(menu);
}
