/* The masthead stays quiet; the Index carries the complete route registry. */
import { SITE } from "../../data/site.js";
import { navigation } from "../../data/navigation.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";
import { createIndexController } from "../core/navigation.js";
import { createPreferencesController } from "../core/preferences.js";
import { createThemePullCord } from "../core/theme-pull-cord.js";

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
  const html = document.documentElement;
  const choices = [...index.querySelectorAll("[data-theme-choice]")], motionChoices = [...index.querySelectorAll("[data-motion-choice]")];
  const sync = ({ theme, resolvedTheme, motion }) => {
    const dark = resolvedTheme === "dark";
    choices.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === theme || (theme === "system" && btn.dataset.themeChoice === resolvedTheme))));
    motionChoices.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.motionChoice === motion)));
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", dark ? "#07112B" : "#F8F9FC"));
  };
  const preferences = createPreferencesController({ root: html, onChange: sync });
  const chooseTheme = event => preferences.setTheme(event.currentTarget.dataset.themeChoice);
  const chooseMotion = event => preferences.setMotion(event.currentTarget.dataset.motionChoice);
  choices.forEach(btn => btn.addEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.addEventListener("click", chooseMotion));
  return () => {
    choices.forEach(btn => btn.removeEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.removeEventListener("click", chooseMotion)); preferences.destroy();
  };
}

let activeIndex, cleanupPreferences, themeCord;
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  activeIndex?.destroy(); cleanupPreferences?.(); themeCord?.destroy(); document.getElementById("site-index")?.remove(); document.querySelector(".mobile-tabbar")?.remove();
  const base = basePath(), page = document.body.dataset.page || "";
  const order = ["work", "about", "explorations", "writing", "contact"];
  const links = order.map(key => navigation.routes.find(route => route.key === key)).filter(Boolean).map(route => '<a class="site-nav__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : "") + '>' + esc(route.label) + '</a>').join("");
  el.className = "site-nav";
  el.innerHTML = '<div class="site-nav__inner"><a class="site-nav__brand" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home"><img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a>' +
    '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-index">Index</button>' +
    '<nav class="site-nav__links" id="site-nav-links" aria-label="Primary">' + links + '</nav>' +
    '<div class="site-nav__themes"><span class="theme-cord__prompt" aria-hidden="true">Pull</span><button class="theme-cord" type="button" role="switch" aria-checked="false" aria-label="Switch to Screen mode"><svg viewBox="0 0 68 58" width="68" height="58" aria-hidden="true"><path class="theme-cord__line" data-cord-line fill="none"/><path data-cord-hit fill="none" stroke="transparent" stroke-width="18"/><g class="theme-cord__bead" data-cord-bead><circle r="10" fill="transparent"/><rect x="-4" y="-1" width="8" height="13" rx="4"/></g></svg><span class="theme-cord__mode" data-cord-mode>Print</span></button></div></div>';
  const mobileLinks = order.map(key => navigation.routes.find(route => route.key === key)).filter(Boolean).map((route, index) =>
    '<a class="mobile-tabbar__link" href="' + base + safeURL(route.href) + '" aria-label="' + esc(route.label) + '"' + (route.key === page ? ' aria-current="page"' : '') + '><span class="mobile-tabbar__mark" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span><span>' + esc(route.label) + '</span></a>'
  ).join("");
  document.body.insertAdjacentHTML("beforeend", '<nav class="mobile-tabbar" aria-label="Primary mobile navigation">' + mobileLinks + '</nav>');
  document.body.insertAdjacentHTML("beforeend", renderIndexMarkup({ base, page }));
  const index = document.getElementById("site-index");
  const menuButton = el.querySelector(".site-nav__menu-btn");
  activeIndex = createIndexController({ root: index, trigger: menuButton });
  const cordButton = el.querySelector(".theme-cord");
  let preferences;
  const toggleTheme = () => preferences.setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  preferences = createPreferencesController({
    root: document.documentElement,
    onChange: ({ resolvedTheme }) => {
      themeCord?.setChecked(resolvedTheme === "dark");
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", resolvedTheme === "dark" ? "#07112B" : "#F8F9FC"));
    }
  });
  themeCord = createThemePullCord(cordButton, { onToggle: toggleTheme });
  themeCord.setChecked(document.documentElement.dataset.theme === "dark");
  const cleanupIndexPreferences = setupPreferences(el, index);
  cleanupPreferences = () => {
    cleanupIndexPreferences();
    preferences.destroy();
  };
}
