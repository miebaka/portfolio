/* Render — navigation bar (logo · menu) and the fullscreen overlay menu. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function brandHTML() {
  const base = basePath();
  return (
    /* The anchor's aria-label is the accessible name; anything inside it is
       overridden and never announced, so the logo span is marked decorative
       rather than carrying a second label that no one hears. */
    '<a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home">' +
    '<span class="site-nav__logo" aria-hidden="true"></span>' +
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
    /* Persisting is best-effort. setItem throws when storage is blocked
       (Safari private browsing, quota, enterprise policy); unguarded, that
       exception fired after the theme had already flipped but before sync(),
       leaving the button's aria-pressed permanently out of step with the
       theme the visitor can see. */
    try { localStorage.setItem("color-theme", next); } catch (e) {}
    sync();
  });
}

export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  el.className = "site-nav";
  /* Three-column grid: Logo (left) | Menu (centre, auto-width) | Toggle (right) */
  el.innerHTML =
    '<div class="container site-nav__inner">' +
    brandHTML() +
    '<button class="site-nav__menu-btn" type="button" data-menu-open aria-haspopup="dialog" aria-expanded="false" aria-controls="site-menu">' +
      '<span class="site-nav__menu-label">Menu</span>' +
      '<span class="site-nav__menu-plus" aria-hidden="true"></span>' +
    "</button>" +
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

/* Floating pill — always links home on every page except home.

   The pill is opaque ink-on-paper (16.3:1 internally) with a hairline ring, so
   it stays legible over the page background AND over the coloured case-study
   media bands without needing to know what is behind it. The previous version
   sampled the underlying surface on every scroll frame with elementFromPoint
   plus a getComputedStyle walk, toggling its own visibility mid-frame to do
   so; an opaque pill removes the need for any of that. */
export function renderBackButton() {
  const page = document.body.dataset.page || "";
  if (page === "home") return;
  const base = basePath();
  const btn = document.createElement("a");
  btn.className = "back-btn";
  btn.href = base + "index.html";
  btn.innerHTML = "&larr;&ensp;Home";
  document.body.appendChild(btn);
}

export function renderMenu() {
  if (document.getElementById("site-menu")) return;
  const base = basePath();
  const page = document.body.dataset.page || "";

  /* Each label is one intact word inside a clipping mask, so it rises from
     behind its own baseline when the panel opens.

     The previous build split every label into per-character spans and stacked
     an accent copy over the base to animate each glyph's scaleY. That is a
     kinetic-type mechanic borrowed from an agency site, and it fought the
     editorial register: it needed an aria-label to repair the accessible name,
     it suppressed kerning across every character boundary, and it drew
     attention to the animation rather than the words. Whole words need no
     repair, keep their kerning, and read as typesetting rather than effect. */
  const items = (SITE.menu || [])
    .filter((m) => m && m.href && m.label)
    .map((m, i) => {
      const current = m.key === page ? ' aria-current="page"' : "";
      return (
        '<li class="site-menu__item" style="--row-i:' + i + '">' +
          '<a class="site-menu__link" href="' + base + safeURL(m.href) + '"' + current + ">" +
            '<span class="site-menu__mask">' +
              '<span class="site-menu__word">' + esc(m.label) + "</span>" +
            "</span>" +
            '<span class="site-menu__num" aria-hidden="true">' +
              String(i + 1).padStart(2, "0") +
            "</span>" +
          "</a>" +
        "</li>"
      );
    })
    .join("");

  const socials = (SITE.socials || [])
    .filter((s) => s && s.href && s.label)
    .map((s) =>
      '<li><a class="site-menu__social" href="' + safeURL(s.href) +
      '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a></li>"
    )
    .join("");

  const menu = document.createElement("dialog");
  menu.className = "site-menu";
  menu.id = "site-menu";
  menu.setAttribute("aria-label", "Site menu");
  /* Native <dialog> provides built-in focus trap, AT announcement, and
     Escape handling — no role/aria-modal needed (implicit on dialog element).

     Layout is an editorial spread, not a centred link stack: the navigation
     list holds the major column and an identity aside (status, email, socials,
     locus) holds the minor one, so the open menu reads as a designed page —
     a contact card and an index at once — rather than a modal list. The bar
     keeps the brand at the left margin and Close at the right. */
  menu.innerHTML =
    '<div class="container site-menu__bar">' +
      brandHTML() +
      '<button class="site-menu__close" type="button" data-menu-close aria-label="Close menu">' +
        '<span class="site-menu__close-label">Close</span>' +
        '<span class="site-menu__close-mark" aria-hidden="true"></span>' +
      "</button>" +
    "</div>" +
    '<div class="container site-menu__spread">' +
      '<nav class="site-menu__nav" aria-label="Primary">' +
        '<ul class="site-menu__list">' + items + "</ul>" +
      "</nav>" +
      '<aside class="site-menu__aside" aria-label="Studio details">' +
        '<p class="site-menu__note">' + esc(SITE.availability) + "</p>" +
        '<div class="site-menu__card">' +
          '<span class="site-menu__card-label">Get in touch</span>' +
          '<a class="site-menu__email" data-href="email" href="' + safeURL('mailto:' + SITE.email) + '">' +
            esc(SITE.email) + "</a>" +
          '<ul class="site-menu__socials">' + socials + "</ul>" +
          '<p class="site-menu__locus">' + esc(SITE.location) +
            '<span class="site-menu__locus-sep" aria-hidden="true"></span>' +
            '<span class="site-menu__locus-tz">' + esc(SITE.timezone) + "</span>" +
          "</p>" +
        "</div>" +
      "</aside>" +
    "</div>";
  document.body.appendChild(menu);
}
