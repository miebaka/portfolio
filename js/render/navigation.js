/* The masthead stays quiet; the Index carries the complete route registry. */
import { SITE } from "../../data/site.js";
import { navigation } from "../../data/navigation.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { createIndexController } from "../core/navigation.js";

export function renderIndexMarkup({ base = "", page = "", site = SITE } = {}) {
  const destinations = navigation.index.map((route, i) =>
    '<a class="site-index__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : '') + '><span class="site-index__number" aria-hidden="true">' + String(i + 1).padStart(2, "0") + '</span><span>' + esc(route.label) + '</span></a>'
  ).join("");
  const cv = site.cv?.href ? '<a class="site-index__cv" href="' + base + safeURL(site.cv.href) + '" type="' + esc(site.cv.mimeType) + '" download>' + esc(site.cv.label) + '<span>PDF · ' + esc(site.cv.sizeLabel) + '</span></a>' : "";
  return '<section class="site-index" id="site-index" role="dialog" aria-modal="true" aria-labelledby="site-index-title" tabindex="-1" hidden inert>' +
    '<div class="site-index__inner container"><div class="site-index__heading"><h2 id="site-index-title">Index</h2><button class="site-index__close" type="button" data-index-close>Close<span aria-hidden="true"> ×</span></button></div>' +
    '<div class="site-index__body"><nav class="site-index__destinations" aria-label="All destinations">' + destinations + '</nav>' +
    '<div class="site-index__aside"><div class="site-index__contact"><p class="site-index__label">Get in touch</p><a href="' + safeURL('mailto:' + (site.email || "")) + '">' + esc(site.email) + '</a>' + cv + '</div>' +
    '<fieldset class="site-index__preferences"><legend>Preferences</legend><div class="site-index__themes"><button type="button" data-theme-choice="light" aria-pressed="false">Print<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="false">Screen<span>Dark</span></button></div><label class="site-index__motion"><input type="checkbox" data-motion-preference>Reduce motion</label></fieldset></div></div></div></section>';
}

function setupPreferences(nav, index) {
  const html = document.documentElement, toggle = nav.querySelector(".theme-toggle");
  const choices = [...index.querySelectorAll("[data-theme-choice]")], motion = index.querySelector("[data-motion-preference]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    const dark = html.dataset.theme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    choices.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === (dark ? "dark" : "light"))));
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", dark ? "#07112B" : "#F8F9FC"));
  };
  function setTheme(next) {
    html.dataset.theme = next; sync();
    try { localStorage.setItem("color-theme", next); } catch {}
  }
  const toggleTheme = () => setTheme(html.dataset.theme === "dark" ? "light" : "dark");
  const chooseTheme = event => setTheme(event.currentTarget.dataset.themeChoice);
  toggle.addEventListener("click", toggleTheme);
  choices.forEach(btn => btn.addEventListener("click", chooseTheme));
  let savedMotion = false;
  try { savedMotion = localStorage.getItem("reduced-motion") === "true"; } catch {}
  function syncMotion() {
    motion.checked = reduced.matches || savedMotion; motion.disabled = reduced.matches;
    html.dataset.motion = motion.checked ? "reduced" : "full";
  }
  const chooseMotion = () => {
    savedMotion = motion.checked; syncMotion();
    try { localStorage.setItem("reduced-motion", String(savedMotion)); } catch {}
  };
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  const syncSystemTheme = event => {
    try { if (localStorage.getItem("color-theme")) return; } catch {}
    html.dataset.theme = event.matches ? "dark" : "light"; sync();
  };
  motion.addEventListener("change", chooseMotion);
  reduced.addEventListener?.("change", syncMotion);
  systemTheme.addEventListener?.("change", syncSystemTheme);
  sync(); syncMotion();
  return () => {
    toggle.removeEventListener("click", toggleTheme);
    choices.forEach(btn => btn.removeEventListener("click", chooseTheme));
    motion.removeEventListener("change", chooseMotion);
    reduced.removeEventListener?.("change", syncMotion);
    systemTheme.removeEventListener?.("change", syncSystemTheme);
  };
}

let activeIndex, cleanupPreferences;
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  activeIndex?.destroy(); cleanupPreferences?.(); document.getElementById("site-index")?.remove();
  const base = basePath(), page = document.body.dataset.page || "";
  const links = navigation.primary.map(route => '<a class="site-nav__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : "") + '>' + esc(route.label) + '</a>').join("");
  el.className = "site-nav";
  el.innerHTML = '<div class="container site-nav__inner"><a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home"><img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="52" height="52"></a>' +
    '<nav class="site-nav__links" aria-label="Primary">' + links + '</nav><button class="site-nav__menu-btn" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="site-index">Index</button>' +
    '<button class="theme-toggle" type="button" id="theme-toggle" aria-label="Toggle dark mode" aria-pressed="false"><span class="material-symbols-outlined theme-toggle__dark" aria-hidden="true">dark_mode</span><span class="material-symbols-outlined theme-toggle__light" aria-hidden="true">light_mode</span></button></div>';
  document.body.insertAdjacentHTML("beforeend", renderIndexMarkup({ base, page }));
  const index = document.getElementById("site-index");
  activeIndex = createIndexController({ root: index, trigger: el.querySelector(".site-nav__menu-btn") });
  cleanupPreferences = setupPreferences(el, index);
}
