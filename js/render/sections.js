/* Render — home sections: capabilities list and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderServiceSwatchesMarkup(items = SITE.capabilities) {
  // Stacked services, inspired by the user's supplied 16-second video.
  // The source content and evidence links stay truthful and keyboard accessible.
  const marks = ["✦", "✳", "◉", "❖", "▧"];
  return '<ol class="service-journeys service-stack">' + items.map((service, index) => {
    const outputs = String(service.outputs || "").split(",").map(value => value.trim()).filter(Boolean).slice(0, 4);
    const tags = outputs.map(item => '<span class="service-stack__tag">' + esc(item) + '</span>').join("");
    return '<li class="service-journey service-stack__item service-journey--' + safeToken(service.id) + '" style="--stack-index:' + index + '">' +
      '<article class="service-stack__card">' +
      '<div class="service-stack__heading"><span class="service-stack__symbol" aria-hidden="true">' + marks[index % marks.length] + '</span>' +
      '<h3>' + esc(service.title) + '</h3><span class="service-journey__number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span><span class="service-stack__count" aria-hidden="true">/ ' + String(items.length).padStart(2, "0") + '</span></div>' +
      '<div class="service-stack__bottom"><div class="service-stack__description"><p>' + esc(service.description) + '</p>' +
      '<a class="service-stack__evidence service-journey__evidence" href="' + safeURL(service.evidenceHref) + '">See the proof: ' + esc(service.evidenceLabel) + ' <span class="service-journey__arrow" aria-hidden="true">↗</span></a></div>' +
      '<div class="service-stack__tags" aria-label="Typical deliverables">' + tags + '</div></div>' +
      '</article></li>';
  }).join("") + '</ol>';
}

export function renderServiceFallbackMarkup(items = SITE.capabilities) {
  return '<ol class="service-fallback">' + items.map(service =>
    '<li><h2>' + esc(service.title) + '</h2><p>' + esc(service.description) + '</p><dl><div><dt>Typical outputs</dt><dd>' + esc(service.outputs) + '</dd></div><div><dt>Good fit</dt><dd>' + esc(service.fit) + '</dd></div></dl><a href="' + safeURL(service.evidenceHref) + '">See the proof: ' + esc(service.evidenceLabel) + '</a></li>'
  ).join("") + '</ol>';
}

export function renderServiceAccordionMarkup(items = SITE.capabilities) {
  return '<div class="home-services__list">' + items.map((service, index) =>
    '<details class="home-service"' + (index === 0 ? ' open' : '') + '><summary><span>' + esc(service.title) + '</span><span class="home-service__toggle" aria-hidden="true"></span></summary><div class="home-service__panel"><p>' + esc(service.description) + '</p><div class="home-service__facts"><p>' + esc(service.outputs) + '</p><p>' + esc(service.fit) + '</p><a href="' + safeURL(service.evidenceHref) + '">See the proof: ' + esc(service.evidenceLabel) + '</a></div></div></details>'
  ).join('') + '</div>';
}

export function createServiceSwatches(root) {
  if (!root) return () => {};
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[role="tabpanel"]')];
  const select = (next, { focus = false, keyboard = false } = {}) => {
    root.dataset.input = keyboard ? "keyboard" : "pointer";
    tabs.forEach((tab, index) => {
      const selected = index === next;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[index].hidden = !selected;
    });
    if (focus) tabs[next]?.focus();
  };
  const cleanups = tabs.map((tab, index) => {
    const click = () => select(index);
    const keydown = event => {
      let next;
      if (["ArrowRight", "ArrowDown"].includes(event.key)) next = (index + 1) % tabs.length;
      if (["ArrowLeft", "ArrowUp"].includes(event.key)) next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(next, { focus: true, keyboard: true });
    };
    tab.addEventListener("click", click);
    tab.addEventListener("keydown", keydown);
    return () => { tab.removeEventListener("click", click); tab.removeEventListener("keydown", keydown); };
  });
  return () => cleanups.forEach(cleanup => cleanup());
}

export function renderCapabilities() {
  const el = mount(MOUNT.CAPABILITIES);
  if (!el) return;
  if (document.body.dataset.page === "home") {
    el.className = "process-sequence";
    el.innerHTML = renderServiceSwatchesMarkup(SITE.capabilities);
    return;
  }
  el.className = "home-services";
  el.innerHTML = renderServiceAccordionMarkup(SITE.capabilities);
}

export function renderExperienceLedger(entries = []) {
  const firstYear = Math.min(...entries.map(entry => entry.startYear));
  const lastYear = Math.max(new Date().getFullYear(), ...entries.map(entry => entry.endYear));
  const scale = Math.max(1, lastYear - firstYear + 1);
  const years = Array.from({ length: scale }, (_, index) => firstYear + index);
  const ruler = '<div class="experience-ruler__scale" aria-hidden="true">' + years.map(year => '<span>' + year + '</span>').join('') + '</div>';
  const jobs = entries.map(entry => {
    const start = ((entry.startYear - firstYear) / scale) * 100;
    const span = ((Math.max(entry.endYear, entry.startYear) - entry.startYear + 1) / scale) * 100;
    return '<li class="experience-ruler__item" style="--experience-start:' + start.toFixed(3) + '%;--experience-span:' + span.toFixed(3) + '%"><div class="experience-ruler__track" role="img" aria-label="' + esc(entry.organisation) + ', ' + entry.startYear + ' to ' + entry.endYear + '"><span aria-hidden="true"></span></div><div class="experience-ruler__copy"><div><p class="experience-ruler__organisation">' + esc(entry.organisation) + '</p><p class="experience-ruler__role">' + esc(entry.role) + '</p></div><p class="experience-ruler__period">' + esc(entry.period) + '</p><p class="experience-ruler__contribution">' + esc(entry.contribution) + '</p></div></li>';
  }).join('');
  return '<div class="experience-ruler"><div class="experience-ruler__viewport" tabindex="0" aria-label="Work experience timeline from ' + firstYear + ' to ' + lastYear + '"><div class="experience-ruler__canvas" style="--experience-columns:' + scale + '">' + ruler + '<ol class="experience-ruler__jobs">' + jobs + '</ol></div></div></div>';
}

export function renderCvMarkup(cv, base = "") {
  if (!cv?.href) return "";
  return '<a class="about-cv btn" href="' + base + safeURL(cv.href) + '" type="' + esc(cv.mimeType) + '" download>' + esc(cv.label) + '<span>PDF · ' + esc(cv.sizeLabel) + '</span></a>';
}

export function renderProfessionalEvidence() {
  const experience = document.querySelector('[data-mount="experience"]');
  if (experience && SITE.experience?.length) experience.innerHTML = renderExperienceLedger(SITE.experience);
  const cv = document.querySelector('[data-mount="cv"]');
  if (cv) cv.innerHTML = renderCvMarkup(SITE.cv, basePath());
}

/* Fill simple text slots ([data-fill]) and email links.

   The hero portrait is plain markup in index.html rather than being built
   here: it is the LCP element, so it has to be in the HTML the browser
   receives, discoverable by the preload scanner, not appended by a module
   that only runs after the whole graph has parsed. */
export function fillSlots() {
  document.querySelectorAll("[data-fill]").forEach((node) => {
    const key = node.dataset.fill;
    if (SITE[key] != null) node.textContent = SITE[key];
  });
  document.querySelectorAll('[data-href="email"]').forEach((node) => {
    node.setAttribute("href", "mailto:" + SITE.email);
  });
}
