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
    '<fieldset class="site-index__preferences"><legend>Theme</legend><div class="site-index__themes"><button type="button" data-theme-choice="light" aria-pressed="false">Print<span>Light</span></button><button type="button" data-theme-choice="dark" aria-pressed="false">Screen<span>Dark</span></button></div><div class="site-index__motion" role="group" aria-label="Motion"><button type="button" data-motion-choice="system" aria-pressed="false">System</button><button type="button" data-motion-choice="reduce" aria-pressed="false">Reduce</button><button type="button" data-motion-choice="full" aria-pressed="false">Full</button></div></fieldset></div></div></div></section>';
}

function setupPreferences(index, preferences) {
  const choices = [...index.querySelectorAll("[data-theme-choice]")];
  const motionChoices = [...index.querySelectorAll("[data-motion-choice]")];
  const chooseTheme = event => preferences.setTheme(event.currentTarget.dataset.themeChoice);
  const chooseMotion = event => preferences.setMotion(event.currentTarget.dataset.motionChoice);
  choices.forEach(btn => btn.addEventListener("click", chooseTheme));
  motionChoices.forEach(btn => btn.addEventListener("click", chooseMotion));
  return () => { choices.forEach(btn => btn.removeEventListener("click", chooseTheme)); motionChoices.forEach(btn => btn.removeEventListener("click", chooseMotion)); };
}

let activeIndex, cleanupPreferences, themeButton;
export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  activeIndex?.destroy(); cleanupPreferences?.(); document.getElementById("site-index")?.remove();
  const base = basePath(), page = document.body.dataset.page || "";
  const links = navigation.primary.map(route => '<a class="site-nav__link" href="' + base + safeURL(route.href) + '"' + (route.key === page ? ' aria-current="page"' : "") + '>' + esc(route.label) + '</a>').join("");
  el.className = "site-nav";
  el.innerHTML = '<div class="site-nav__inner"><div class="site-nav__leading"><a class="site-nav__brand site-nav__balance" href="' + base + 'index.html" aria-label="' + esc(SITE.name) + ', home"><img class="nav-logo" src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="40" height="40"></a>' +
    '<div class="site-nav__listening" data-mount="now-playing"></div></div>' +
    '<button class="site-nav__menu-btn" type="button" aria-expanded="false" aria-controls="site-index"><span class="site-nav__menu-mark" aria-hidden="true"></span>Index</button>' +
    '<nav class="site-nav__links" id="site-nav-links" aria-label="Primary" aria-hidden="true">' + links + '</nav>' +
    '<div class="site-nav__themes"><button class="theme-liquid-toggle" type="button" role="switch" aria-checked="false" aria-label="Switch to dark mode"><span class="theme-liquid-toggle__track" aria-hidden="true"><span class="theme-liquid-toggle__sun">☀</span><span class="theme-liquid-toggle__moon">☾</span><span class="theme-liquid-toggle__thumb"></span></span><span class="theme-liquid-toggle__mode" data-theme-mode>Light</span></button></div></div>';
  document.body.insertAdjacentHTML("beforeend", renderIndexMarkup({ base, page }));
  const index = document.getElementById("site-index");
  const menuButton = el.querySelector(".site-nav__menu-btn");
  activeIndex = createIndexController({ root: index, trigger: menuButton });
  themeButton = el.querySelector(".theme-liquid-toggle");
  let preferences;
  const toggleTheme = () => preferences.setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  preferences = createPreferencesController({
    root: document.documentElement,
    onChange: ({ theme, resolvedTheme, motion }) => {
      themeButton.setAttribute("aria-checked", String(resolvedTheme === "dark"));
      themeButton.setAttribute("aria-label", resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      themeButton.querySelector("[data-theme-mode]").textContent = resolvedTheme === "dark" ? "Dark" : "Light";
      index.querySelectorAll("[data-theme-choice]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.themeChoice === theme || (theme === "system" && btn.dataset.themeChoice === resolvedTheme))));
      index.querySelectorAll("[data-motion-choice]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.motionChoice === motion)));
      document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", resolvedTheme === "dark" ? "oklch(35.7% 0.159 264.8)" : "oklch(98% 0.006 264.5)"));
    }
  });
  themeButton.addEventListener("click", toggleTheme);
  const cleanupIndexPreferences = setupPreferences(index, preferences);
  cleanupPreferences = () => {
    cleanupIndexPreferences();
    preferences.destroy();
  };
}
