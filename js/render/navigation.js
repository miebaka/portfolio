import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function setupPreferences(nav) {
  const root = document.documentElement;
  const themes = [...nav.querySelectorAll('[data-preference="theme"]')];
  const motions = [...nav.querySelectorAll('[data-preference="motion"]')];
  let storedMotion = null;
  try { storedMotion = localStorage.getItem("motion-preference"); } catch {}
  root.dataset.motion = storedMotion || (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "regular");
  const sync = () => {
    const dark = root.dataset.theme === "dark";
    const reduced = root.dataset.motion === "reduced";
    themes.forEach(theme => {
      theme.querySelector('[data-theme-name="print"]')?.toggleAttribute("data-active", !dark);
      theme.querySelector('[data-theme-name="screen"]')?.toggleAttribute("data-active", dark);
      theme.setAttribute("aria-pressed", String(dark));
    });
    nav.querySelector(".portfolio-nav__theme-help").textContent = dark ? "Screen mode is active. Switch to Print mode." : "Print mode is active. Switch to Screen mode.";
    motions.forEach(motion => {
      const label = reduced ? "ENABLE MOTION" : "REDUCE MOTION";
      const icon = reduced
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
      motion.querySelector(".preference-motion__icon").innerHTML = icon;
      motion.querySelector(".preference-motion__label").textContent = label;
      motion.setAttribute("aria-label", label.toLowerCase().replace(/^./, char => char.toUpperCase()));
      motion.setAttribute("aria-pressed", String(reduced));
    });
    document.dispatchEvent(new CustomEvent("motionpreferencechange", { detail: { reduced } }));
  };
  themes.forEach(theme => theme.addEventListener("click", () => {
    const apply = () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("color-theme", root.dataset.theme); } catch {}
      sync();
    };
    if (document.startViewTransition && root.dataset.motion !== "reduced") document.startViewTransition(apply); else apply();
  }));
  motions.forEach(motion => motion.addEventListener("click", () => {
    root.dataset.motion = root.dataset.motion === "reduced" ? "regular" : "reduced";
    try { localStorage.setItem("motion-preference", root.dataset.motion); } catch {}
    sync();
  }));
  sync();
}

function setupIndex(nav) {
  const triggers = [...nav.querySelectorAll('[data-index-trigger]')];
  const menu = nav.querySelector(".portfolio-index");
  const openTriggers = triggers.filter(button => !menu.contains(button));
  const closeTrigger = menu.querySelector('[data-index-trigger]');
  let previousFocus = null;
  const focusables = () => [...menu.querySelectorAll('a,button:not([disabled])')];
  const setOpen = open => {
    document.documentElement.classList.toggle("portfolio-index-open", open);
    triggers.forEach(button => button.setAttribute("aria-expanded", String(open)));
    menu.hidden = !open;
    menu.inert = !open;
    if (open) { previousFocus = document.activeElement; focusables()[0]?.focus(); }
    else requestAnimationFrame(() => previousFocus?.focus?.());
  };
  openTriggers.forEach(button => button.addEventListener("click", () => setOpen(true)));
  closeTrigger?.addEventListener("click", () => setOpen(false));
  menu.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", event => {
    if (menu.hidden) return;
    if (event.key === "Escape") return setOpen(false);
    if (event.key !== "Tab") return;
    const items = focusables(), first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
}

export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  const base = basePath();
  const current = document.body.dataset.page;
  const link = item => '<a href="' + base + safeURL(item.href) + '"' + (current === item.key ? ' aria-current="page"' : '') + '>' + esc(item.label.toUpperCase()) + '</a>';
  const indexRoutes = [
    { label: "Home", href: "index.html", key: "home" },
    ...SITE.menu,
    { label: "Privacy", href: "privacy.html", key: "privacy" },
  ];
  const all = indexRoutes.map(item => '<li>' + link(item) + '</li>').join("");
  const currentAttr = active => active ? ' aria-current="page"' : '';
  el.className = "portfolio-nav";
  el.innerHTML =
    '<nav class="portfolio-nav__bar" aria-label="Primary"><a class="portfolio-nav__brand" href="' + base + 'index.html" aria-label="Miebaka Joshua home"' + currentAttr(current === "home") + '><img src="' + base + 'assets/images/miebaka-joshua-logo.svg" width="42" height="42" alt=""></a><button class="portfolio-nav__theme" data-preference="theme" type="button" aria-describedby="theme-help"><span data-theme-name="print">PRINT</span><span aria-hidden="true">/</span><span data-theme-name="screen">SCREEN</span></button><span class="sr-only portfolio-nav__theme-help" id="theme-help"></span><button class="portfolio-nav__index" data-index-trigger type="button" aria-controls="portfolio-index" aria-expanded="false">INDEX <span aria-hidden="true">＋</span></button></nav>' +
    '<div class="portfolio-index" id="portfolio-index" role="dialog" aria-modal="true" aria-label="Site index" hidden inert><div class="portfolio-index__head"><span>INDEX</span><button class="portfolio-index__close" type="button" data-index-trigger aria-controls="portfolio-index">CLOSE <span aria-hidden="true">×</span></button></div><div class="portfolio-index__body"><ol>' + all + '</ol><aside><div class="portfolio-index__preferences"><p class="portfolio-index__label">APPEARANCE</p><button class="portfolio-index__theme" data-preference="theme" type="button" aria-describedby="theme-help"><span data-theme-name="print">PRINT</span><span>/</span><span data-theme-name="screen">SCREEN</span></button><p class="portfolio-index__label">MOTION</p><button class="portfolio-index__motion" data-preference="motion" type="button"><span class="preference-motion__icon"></span><span class="preference-motion__label"></span></button></div><div class="portfolio-index__contact"><p class="portfolio-index__label">CONTACT</p><a href="' + base + 'contact.html">WORK WITH ME ↗</a><a href="' + base + safeURL(SITE.cv) + '" download>DOWNLOAD CV · PDF ↘</a><a href="https://linkedin.com/in/miebakajoshua" target="_blank" rel="noopener noreferrer">VIEW LINKEDIN ↗</a></div></aside></div></div>';
  setupPreferences(el);
  setupIndex(el);
}
