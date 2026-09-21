/* Render — navigation bar (wordmark · inline links · theme toggle). */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

/* The two theme glyphs share one compact circular control. */
function themeToggleHTML() {
  return (
    '<button class="theme-toggle" type="button" id="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<span class="theme-toggle__icon-wrap">' +
      '<svg class="theme-toggle__disc" aria-hidden="true" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="theme-toggle__disc-core"><path d="M120 67.5C149.25 67.5 172.5 90.75 172.5 120C172.5 149.25 149.25 172.5 120 172.5" fill="var(--paper)"/><path d="M120 67.5C90.75 67.5 67.5 90.75 67.5 120C67.5 149.25 90.75 172.5 120 172.5" fill="var(--ink)"/></g>' +
        '<path d="M120 3.75C55.5 3.75 3.75 55.5 3.75 120C3.75 184.5 55.5 236.25 120 236.25C184.5 236.25 236.25 184.5 236.25 120C236.25 55.5 184.5 3.75 120 3.75ZM120 214.5V172.5C90.75 172.5 67.5 149.25 67.5 120C67.5 90.75 90.75 67.5 120 67.5V25.5C172.5 25.5 214.5 67.5 214.5 120C214.5 172.5 172.5 214.5 120 214.5Z" fill="var(--paper)"/>' +
      "</svg>" +
      "</span>" +
    "</button>"
  );
}

/* Reads current theme state and syncs the toggle's aria-pressed attribute. */
function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const html = document.documentElement;
  function isDark() { return html.dataset.theme === "dark"; }
  function sync() {
    btn.setAttribute("aria-pressed", String(isDark()));
    btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
  }
  sync();
  btn.addEventListener("click", function () {
    const next = isDark() ? "light" : "dark";
    const apply = () => { html.dataset.theme = next; sync(); };
    html.dataset.themeTransition = "circle-blur";
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.startViewTransition(apply).finished.finally(() => { delete html.dataset.themeTransition; });
    } else {
      apply();
      delete html.dataset.themeTransition;
    }
    /* Persisting is best-effort. setItem throws when storage is blocked
       (Safari private browsing, quota, enterprise policy); unguarded, that
       exception fired after the theme had already flipped but before sync(),
       leaving the button's aria-pressed permanently out of step with the
       theme the visitor can see. */
    try { localStorage.setItem("color-theme", next); } catch (e) {}
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
        '<img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="Miebaka Joshua" width="52" height="52">' +
      "</a>" +
      /* Shown only below the mobile breakpoint; toggles the links panel. */
      '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-nav-links">Menu</button>' +
      '<nav class="site-nav__links" id="site-nav-links" aria-label="Primary">' + links + "</nav>" +
      themeToggleHTML() +
    "</div>";
  setupThemeToggle();
  setupMobileMenu(el);
}

/* Compact mobile menu. Desktop shows the links inline and the button is
   hidden; below the breakpoint the button toggles a small dropdown panel (all
   CSS state, driven by one class). Closes on link click, Escape, or an outside
   click. Not the old fullscreen overlay. */
function setupMobileMenu(nav) {
  const btn = nav.querySelector(".site-nav__menu-btn");
  const links = nav.querySelector(".site-nav__links");
  if (!btn || !links) return;

  /* Bound only while the menu is open, and torn down on close, so nothing
     global stays registered on desktop or after the menu is dismissed. Clicks
     on the button (or anywhere in the nav) are ignored here — the button's own
     handler owns the toggle. */
  function onDocClick(e) { if (!nav.contains(e.target)) setOpen(false); }
  function onKeydown(e) { if (e.key === "Escape") setOpen(false); }

  function setOpen(open) {
    nav.classList.toggle("is-menu-open", open);
    btn.setAttribute("aria-expanded", String(open));
    const bind = open ? "addEventListener" : "removeEventListener";
    document[bind]("click", onDocClick);
    document[bind]("keydown", onKeydown);
  }

  btn.addEventListener("click", () => setOpen(!nav.classList.contains("is-menu-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}
