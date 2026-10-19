/* The masthead stays quiet; the Index carries the complete route registry. */
import { SITE } from "../../data/site.js";
import { navigation } from "../../data/navigation.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { createIndexController } from "../core/navigation.js";
import { createPreferencesController } from "../core/preferences.js";

export function renderIndexMarkup({ base = "", page = "", site = SITE } = {}) {
  const destinations = navigation.index.map((route, i) =>
    '<a class="site-index__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : '') + '><span class="site-index__number" aria-hidden="true">' + String(i + 1).padStart(2, "0") + '</span><span>' + esc(route.label) + '</span></a>'
  ).join("");
  const cv = site.cv?.href ? '<a class="site-index__cv" href="' + base + safeURL(site.cv.href) + '" type="' + esc(site.cv.mimeType) + '" download>' + esc(site.cv.label) + '<span>PDF · ' + esc(site.cv.sizeLabel) + '</span></a>' : "";
  return '<section class="site-index" id="site-index" role="dialog" aria-modal="true" aria-labelledby="site-index-title" tabindex="-1" hidden inert>' +
    '<div class="site-index__inner container"><div class="site-index__heading"><h2 id="site-index-title">Index</h2><button class="site-index__close" type="button" data-index-close>Close<span aria-hidden="true"> ×</span></button></div>' +
    '<div class="site-index__body"><nav class="site-index__destinations" aria-label="All destinations">' + destinations + '</nav>' +
    '<div class="site-index__aside"><div class="site-index__contact"><p class="site-index__label">Get in touch</p><a href="' + safeURL('mailto:' + (site.email || "")) + '">' + esc(site.email) + '</a>' + cv + '</div>' +
    '<fieldset class="site-index__preferences"><legend>Preferences</legend><div class="site-index__themes"><button type="button" data-theme-choice="light" aria-pressed="false">Print<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="false">Screen<span>Dark</span></button></div><div class="site-index__motion" role="group" aria-label="Motion"><button type="button" data-motion-choice="system" aria-pressed="false">System</button><button type="button" data-motion-choice="reduce" aria-pressed="false">Reduce</button><button type="button" data-motion-choice="full" aria-pressed="false">Full</button></div></fieldset></div></div></div></section>';
}

function setupPreferences(nav, index) {
  const html = document.documentElement, toggle = nav.querySelector(".theme-toggle");
  const choices = [...index.querySelectorAll("[data-theme-choice]")], motionChoices = [...index.querySelectorAll("[data-motion-choice]")];
  const sync = ({ theme, resolvedTheme, motion }) => {
    const dark = resolvedTheme === "dark";
    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    choices.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === theme || (theme === "system" && btn.dataset.themeChoice === resolvedTheme))));
    motionChoices.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.motionChoice === motion)));
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", dark ? "#07112B" : "#F8F9FC"));
  };
  const preferences = createPreferencesController({ root: html, onChange: sync });
  const toggleTheme = () => preferences.setTheme(html.dataset.theme === "dark" ? "light" : "dark");
  const chooseTheme = event => preferences.setTheme(event.currentTarget.dataset.themeChoice);
  const chooseMotion = event => preferences.setMotion(event.currentTarget.dataset.motionChoice);
  toggle.addEventListener("click", toggleTheme); choices.forEach(btn => btn.addEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.addEventListener("click", chooseMotion));
  return () => {
    toggle.removeEventListener("click", toggleTheme); choices.forEach(btn => btn.removeEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.removeEventListener("click", chooseMotion)); preferences.destroy();
  };
}

function setupMobileMenu(nav) {
  const button = nav.querySelector(".site-nav__menu-btn");
  const links = nav.querySelector(".site-nav__links");
  if (!button || !links) return () => {};
  const setOpen = open => {
    nav.classList.toggle("is-menu-open", open);
    button.setAttribute("aria-expanded", String(open));
  };
  const toggle = () => setOpen(!nav.classList.contains("is-menu-open"));
  const closeFromLink = () => setOpen(false);
  const closeFromKeyboard = event => {
    if (event.key !== "Escape" || !nav.classList.contains("is-menu-open")) return;
    setOpen(false);
    button.focus();
  };
  const closeFromOutside = event => {
    if (!nav.contains(event.target)) setOpen(false);
  };
  button.addEventListener("click", toggle);
  links.addEventListener("click", closeFromLink);
  document.addEventListener("keydown", closeFromKeyboard);
  document.addEventListener("pointerdown", closeFromOutside);
  return () => {
    button.removeEventListener("click", toggle);
    links.removeEventListener("click", closeFromLink);
    document.removeEventListener("keydown", closeFromKeyboard);
    document.removeEventListener("pointerdown", closeFromOutside);
  };
}

let activeIndex, cleanupPreferences, cleanupMobileMenu;
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  activeIndex?.destroy(); cleanupPreferences?.(); cleanupMobileMenu?.(); document.getElementById("site-index")?.remove();
  const base = basePath(), page = document.body.dataset.page || "";
  const order = ["work", "about", "explorations", "writing", "playground", "contact"];
  const links = order.map(key => navigation.routes.find(route => route.key === key)).filter(Boolean).map(route => '<a class="site-nav__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : "") + '>' + esc(route.label) + '</a>').join("");
  el.className = "site-nav";
  el.innerHTML = '<div class="site-nav__inner"><a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home"><img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a>' +
    '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-nav-links">Menu</button>' +
    '<nav class="site-nav__links" id="site-nav-links" aria-label="Primary">' + links + '</nav>' +
    '<fieldset class="site-nav__themes" aria-label="Colour mode"><button type="button" data-nav-theme="light" aria-pressed="false">Print</button><span aria-hidden="true">|</span><button type="button" data-nav-theme="dark" aria-pressed="false">Screen</button></fieldset></div>';
  cleanupMobileMenu = setupMobileMenu(el);
  const themeButtons = [...el.querySelectorAll("[data-nav-theme]")];
  const preferences = createPreferencesController({
    root: document.documentElement,
    onChange: ({ resolvedTheme }) => {
      themeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.navTheme === resolvedTheme)));
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", resolvedTheme === "dark" ? "#07112B" : "#F8F9FC"));
    }
  });
  const chooseTheme = event => preferences.setTheme(event.currentTarget.dataset.navTheme);
  themeButtons.forEach(button => button.addEventListener("click", chooseTheme));
  cleanupPreferences = () => {
    themeButtons.forEach(button => button.removeEventListener("click", chooseTheme));
    preferences.destroy();
  };
}
