/* Render — navigation bar (wordmark · inline links · theme toggle). */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

/* Material Symbols keep every interface glyph inside one coherent icon set. */
function themeToggleHTML() {
  return (
    '<button class="theme-toggle" type="button" id="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false">' +
      '<span class="material-symbols-outlined theme-toggle__dark" aria-hidden="true">dark_mode</span>' +
      '<span class="material-symbols-outlined theme-toggle__light" aria-hidden="true">light_mode</span>' +
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
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark() ? "#07112B" : "#F8F9FC");
  }
  sync();
  btn.addEventListener("click", function () {
    const next = isDark() ? "light" : "dark";
    const apply = () => { html.dataset.theme = next; sync(); };
    html.dataset.themeTransition = "fade";
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
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  systemTheme.addEventListener?.("change", event => {
    try { if (localStorage.getItem("color-theme")) return; } catch (e) {}
    html.dataset.theme = event.matches ? "dark" : "light";
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
        '<img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="52" height="52">' +
      "</a>" +
      /* Shown only below the mobile breakpoint; toggles the links panel. */
      '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-nav-links"><span class="material-symbols-outlined" aria-hidden="true">menu</span><span>Menu</span></button>' +
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
    if (!open) nav.classList.remove("is-keyboard-open");
    btn.setAttribute("aria-expanded", String(open));
    const bind = open ? "addEventListener" : "removeEventListener";
    document[bind]("click", onDocClick);
    document[bind]("keydown", onKeydown);
  }

  btn.addEventListener("click", (event) => {
    nav.classList.toggle("is-keyboard-open", event.detail === 0);
    setOpen(!nav.classList.contains("is-menu-open"));
  });
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}
