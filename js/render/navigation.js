/* Render — navigation bar (wordmark · inline links · theme toggle). */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

/* The theme toggle markup — a pill track with sun/moon icons either side.
   Kept as its own function so the nav render below reads as structure. */
function themeToggleHTML() {
  return (
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
      "</svg>" +
      '<span class="theme-toggle__track"><span class="theme-toggle__knob"></span></span>' +
      '<svg class="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>' +
      "</svg>" +
    "</button>"
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

/* Header: wordmark left, inline primary links and the theme toggle right.
   The fullscreen overlay menu was retired in favour of these always-visible
   links — one fewer interaction between a visitor and any page. */
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  const base = basePath();
  const page = document.body.dataset.page || "";

  const links = (SITE.menu || [])
    .filter((m) => m && m.href && m.label)
    .map((m) => {
      const current = m.key === page ? ' aria-current="page"' : "";
      return '<a class="site-nav__link" href="' + base + safeURL(m.href) + '"' + current + ">" + esc(m.label) + "</a>";
    })
    .join("");

  el.className = "site-nav";
  el.innerHTML =
    '<div class="container site-nav__inner">' +
      '<a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home">' +
        '<span class="site-nav__logo" aria-hidden="true"></span>' +
      "</a>" +
      '<nav class="site-nav__links" aria-label="Primary">' + links + "</nav>" +
      themeToggleHTML() +
    "</div>";
  setupThemeToggle();
}

/* Floating pill — always links home on every page except home.

   The pill is opaque ink-on-paper (16.3:1 internally) with a hairline ring, so
   it stays legible over the page background AND over the coloured case-study
   media bands without needing to know what is behind it. */
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
