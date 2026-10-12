import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function setupPreferences(nav) {
  const root = document.documentElement;
  const theme = nav.querySelector('[data-preference="theme"]');
  const motion = nav.querySelector('[data-preference="motion"]');
  let storedMotion = null;
  try { storedMotion = localStorage.getItem("motion-preference"); } catch {}
  root.dataset.motion = storedMotion || (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "regular");
  const sync = () => {
    const dark = root.dataset.theme === "dark";
    const reduced = root.dataset.motion === "reduced";
    theme.querySelector('[data-theme-name="print"]')?.toggleAttribute("data-active", !dark);
    theme.querySelector('[data-theme-name="screen"]')?.toggleAttribute("data-active", dark);
    nav.querySelector(".portfolio-nav__theme-help").textContent = dark ? "Screen mode is active. Switch to Print mode." : "Print mode is active. Switch to Screen mode.";
    theme.setAttribute("aria-pressed", String(dark));
    if (motion) {
      const label = reduced ? "ENABLE MOTION" : "REDUCE MOTION";
      const icon = reduced
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
      motion.querySelector(".motion-fab__icon").innerHTML = icon;
      motion.querySelector(".motion-fab__label").textContent = label;
      motion.setAttribute("aria-label", label.toLowerCase().replace(/^./, char => char.toUpperCase()));
      motion.setAttribute("aria-pressed", String(reduced));
    }
    document.dispatchEvent(new CustomEvent("motionpreferencechange", { detail: { reduced } }));
  };
  theme.addEventListener("click", () => {
    const apply = () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("color-theme", root.dataset.theme); } catch {}
      sync();
    };
    if (document.startViewTransition && root.dataset.motion !== "reduced") document.startViewTransition(apply); else apply();
  });
  motion?.addEventListener("click", () => {
    root.dataset.motion = root.dataset.motion === "reduced" ? "regular" : "reduced";
    try { localStorage.setItem("motion-preference", root.dataset.motion); } catch {}
    sync();
  });
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
  const link = item => '<a href="' + base + safeURL(item.href) + '"' + (current === item.key ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a>';
  const all = SITE.menu.map((item, index) => '<li><span>' + String(index + 1).padStart(2, "0") + '</span>' + link(item) + '</li>').join("");
  const desktopRoutes = SITE.menu.filter(item => ["work", "explorations", "community"].includes(item.key)).map(link).join("");
  const currentAttr = active => active ? ' aria-current="page"' : '';
  el.className = "portfolio-nav";
  el.innerHTML =
    '<nav class="portfolio-nav__bar" aria-label="Primary"><a class="portfolio-nav__brand" href="' + base + 'index.html" aria-label="Miebaka Joshua home"' + currentAttr(current === "home") + '><img src="' + base + 'assets/images/miebaka-joshua-logo.svg" width="28" height="28" alt=""><span>MIEBAKA JOSHUA</span></a><div class="portfolio-nav__routes">' + desktopRoutes + '</div><button class="portfolio-nav__theme" data-preference="theme" type="button" aria-describedby="theme-help"><span data-theme-name="print">PRINT</span><span>/</span><span data-theme-name="screen">SCREEN</span></button><span class="sr-only portfolio-nav__theme-help" id="theme-help"></span><button class="portfolio-nav__index" data-index-trigger type="button" aria-controls="portfolio-index" aria-expanded="false">INDEX <span aria-hidden="true">＋</span></button></nav>' +
    '<nav class="mobile-nav" aria-label="Mobile"><a href="' + base + 'index.html"' + currentAttr(current === "home") + '>HOME</a><a href="' + base + 'work.html"' + currentAttr(current === "work") + '>WORK</a><a href="' + base + 'explorations.html"' + currentAttr(current === "explorations") + '>EXPLORE</a><a href="' + base + 'contact.html"' + currentAttr(current === "contact") + '>CONTACT</a><button data-index-trigger type="button" aria-controls="portfolio-index" aria-expanded="false">INDEX</button></nav>' +
    '<button class="motion-fab" data-preference="motion" type="button"><span class="motion-fab__icon"></span><span class="motion-fab__label"></span></button>' +
    '<div class="portfolio-index" id="portfolio-index" role="dialog" aria-modal="true" aria-label="Site index" hidden><div class="portfolio-index__head"><span>INDEX / 01—07</span><button type="button" data-index-trigger aria-controls="portfolio-index">CLOSE ×</button></div><div class="portfolio-index__body"><ol>' + all + '</ol><aside><p class="portfolio-index__label">CONTACT</p><a href="' + base + 'contact.html">WORK WITH ME ↗</a><a href="' + base + safeURL(SITE.cv) + '" download>DOWNLOAD CV · PDF ↘</a><a href="https://linkedin.com/in/miebakajoshua" target="_blank" rel="noopener noreferrer">VIEW LINKEDIN ↗</a></aside></div></div>';
  setupPreferences(el);
  setupIndex(el);
}
