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
  const cv = site.cv?.href
    ? '<a class="site-index__cv" href="' + base + safeURL(site.cv.href) + '" type="' + esc(site.cv.mimeType) + '" download>' + esc(site.cv.label) + '<span>PDF · ' + esc(site.cv.sizeLabel) + '</span></a>'
    : '<a class="site-index__cv" href="' + safeURL('mailto:' + (site.email || "") + '?subject=CV%20request') + '">Request CV<span>Available by email</span></a>';
  return '<section class="site-index" id="site-index" role="dialog" aria-modal="true" aria-labelledby="site-index-title" tabindex="-1" hidden inert>' +
    '<div class="site-index__inner container"><div class="site-index__heading"><h2 id="site-index-title">Index</h2><button class="site-index__close" type="button" data-index-close>Close<span aria-hidden="true"> ×</span></button></div>' +
    '<div class="site-index__body"><nav class="site-index__destinations" aria-label="All destinations">' + destinations + '</nav>' +
    '<div class="site-index__aside"><a class="site-index__home" href="' + base + 'index.html">Home <span aria-hidden="true">↗</span></a><div class="site-index__contact"><a href="' + safeURL('mailto:' + (site.email || "")) + '">' + esc(site.email) + '</a>' + cv + '</div>' +
    '<fieldset class="site-index__preferences"><legend>Theme</legend><div class="site-index__themes"><button type="button" data-theme-choice="system" aria-pressed="false">System</button><button type="button" data-theme-choice="light" aria-pressed="false">Light</button><button type="button" data-theme-choice="dark" aria-pressed="false">Dark</button></div><div class="site-index__motion" role="group" aria-label="Motion"><button type="button" data-motion-choice="system" aria-pressed="false">Follow device</button><button type="button" data-motion-choice="reduce" aria-pressed="false">Reduce motion</button><button type="button" data-motion-choice="full" aria-pressed="false">Full motion</button></div></fieldset></div></div></div></section>';
}

function setupPreferences(index, themePicker, preferences) {
  const choices = [...index.querySelectorAll("[data-theme-choice]")];
  const chooseNavTheme = event => preferences.setTheme(event.target.value);
  themePicker.addEventListener("change", chooseNavTheme);
  const motionChoices = [...index.querySelectorAll("[data-motion-choice]")];
  const chooseTheme = event => preferences.setTheme(event.currentTarget.dataset.themeChoice);
  const chooseMotion = event => preferences.setMotion(event.currentTarget.dataset.motionChoice);
  choices.forEach(btn => btn.addEventListener("click", chooseTheme));
  motionChoices.forEach(btn => btn.addEventListener("click", chooseMotion));
  return () => { themePicker.removeEventListener("change", chooseNavTheme); choices.forEach(btn => btn.removeEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.removeEventListener("click", chooseMotion)); };
}

const themeIcons = {
  light: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  dark: '<path d="M20.8 14.1A9 9 0 0 1 9.9 3.2a9 9 0 1 0 10.9 10.9Z"/>',
  system: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v3m-4 0h8"/>'
};

function renderThemePicker() {
  return '<fieldset class="theme-picker" aria-label="Theme">' +
    Object.entries(themeIcons).map(([mode, icon]) =>
      `<label class="theme-picker__option"><input type="radio" name="nav-theme" value="${mode}" aria-label="${mode[0].toUpperCase() + mode.slice(1)} theme"><span class="theme-picker__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span></label>`
    ).join("") + '</fieldset>';
}

let activeIndex, cleanupPreferences;
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  activeIndex?.destroy(); cleanupPreferences?.(); document.getElementById("site-index")?.remove();
  const base = basePath(), page = document.body.dataset.page || "";
  el.className = "site-nav";
  el.innerHTML = '<div class="site-nav__inner"><div class="site-nav__leading"><a class="site-nav__brand site-nav__balance" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home"><img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a>' +
    '<div class="site-nav__listening" data-mount="now-playing"></div></div>' +
    '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-index"><span class="site-nav__menu-mark" aria-hidden="true"></span>Index</button>' +
    '<div class="site-nav__themes">' + renderThemePicker() + '</div></div>';
  document.body.insertAdjacentHTML("beforeend", renderIndexMarkup({ base, page }));
  const index = document.getElementById("site-index");
  const menuButton = el.querySelector(".site-nav__menu-btn");
  activeIndex = createIndexController({ root: index, trigger: menuButton });
  const themePicker = el.querySelector(".theme-picker");
  const preferences = createPreferencesController({
    root: document.documentElement,
    onChange: ({ theme, resolvedTheme, motion }) => {
      themePicker.querySelectorAll("input").forEach(input => { input.checked = input.value === theme; });
      index.querySelectorAll("[data-theme-choice]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === theme)));
      index.querySelectorAll("[data-motion-choice]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.motionChoice === motion)));
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", resolvedTheme === "dark" ? "#07112B" : "#F8F9FC"));
    }
  });
  const cleanupIndexPreferences = setupPreferences(index, themePicker, preferences);
  cleanupPreferences = () => {
    cleanupIndexPreferences();
    preferences.destroy();
  };
}
