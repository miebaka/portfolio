/* Render — navigation bar (logo · menu) and the fullscreen overlay menu. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount, basePath } from "../utilities/dom.js";

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

  /* Splits a label into per-character spans.

     BOTH copies get split, not just the animated one. Each character becomes
     an inline-block, which suppresses kerning across the boundaries; splitting
     one copy and leaving the other as a continuous run gives the two different
     advance widths, and the accent letters drift out of register with the base
     letters underneath them. Identical treatment keeps them aligned.

     Because the visible text is now a run of separated glyphs, the link
     carries an explicit aria-label so the accessible name stays a clean word. */
  function chars(label) {
    const list = Array.from(label);
    /* GSAP's stagger:{amount:.15} spreads the whole sequence over 150ms
       regardless of length, so the per-character step depends on the count.
       Longer words step faster; every label finishes together. */
    const step = list.length > 1 ? 150 / (list.length - 1) : 0;
    return list
      .map((ch, i) => {
        const c = ch === " " ? "&nbsp;" : esc(ch);
        return '<span class="site-menu__char" style="--char-d:' +
               (i * step).toFixed(1) + 'ms">' + c + "</span>";
      })
      .join("");
  }

  /* Each label is wrapped in a clipping span so the word can rise from behind
     its own baseline on open, reusing the masked reveal vocabulary the page
     headings use.

     No index numbers: a five-item menu is countable at a glance, so numbering
     it is decoration pretending to be structure. The hairline per row already
     gives the list its rhythm. */
  const items = (SITE.menu || [])
    .map((m, i) => {
      const current = m.key === page ? ' aria-current="page"' : "";
      return (
        '<li class="site-menu__item" style="--row-i:' + (i + 1) + '">' +
          '<a class="site-menu__link" href="' + base + esc(m.href) + '"' +
           ' aria-label="' + esc(m.label) + '"' + current + ">" +
            '<span class="site-menu__label" aria-hidden="true">' +
              '<span class="site-menu__label-i">' +
                '<span class="site-menu__face">' + chars(m.label) + "</span>" +
                /* Accent copy, stacked exactly over the base copy. Its
                   characters are the ones that animate. */
                '<span class="site-menu__face site-menu__face--accent">' +
                  chars(m.label) +
                "</span>" +
              "</span>" +
            "</span>" +
          "</a>" +
        "</li>"
      );
    })
    .join("");

  const socials = (SITE.socials || [])
    .map((s) =>
      '<a class="site-menu__social" href="' + esc(s.href) +
      '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + "</a>"
    )
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
      '<button class="site-menu__close" type="button" data-menu-close aria-label="Close menu">' +
        '<span class="site-menu__close-label">Close</span>' +
        '<span class="site-menu__close-mark" aria-hidden="true"></span>' +
      "</button>" +
      '<span class="site-menu__bar-spacer" aria-hidden="true"></span>' +
    "</div>" +
    '<nav class="site-menu__nav" aria-label="Primary">' +
      '<ul class="site-menu__list">' + items + "</ul>" +
    "</nav>" +
    '<div class="container site-menu__foot">' +
      '<a class="site-menu__email" data-href="email" href="mailto:' + esc(SITE.email) + '">' +
        esc(SITE.email) + "</a>" +
      '<div class="site-menu__socials">' + socials + "</div>" +
    "</div>";
  document.body.appendChild(menu);
}
