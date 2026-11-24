/* Render — home sections: capabilities list and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, safeToken, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderServiceSwatchesMarkup(items = SITE.capabilities) {
  // Stacked services, inspired by the user's supplied 16-second video.
  // The source content and evidence links stay truthful and keyboard accessible.
  const marks = ["✦", "✳", "◉", "❖", "▧"];
  return '<ul class="service-journeys service-stack">' + items.map((service, index) => {
    const outputs = String(service.outputs || "").split(",").map(value => value.trim()).filter(Boolean).slice(0, 4);
    const tags = outputs.map(item => '<span class="service-stack__tag">' + esc(item) + '</span>').join("");
    return '<li class="service-journey service-stack__item service-journey--' + safeToken(service.id) + '" style="--stack-index:' + index + '">' +
      '<article class="service-stack__card">' +
      '<div class="service-stack__heading"><span class="service-stack__symbol" aria-hidden="true">' + marks[index % marks.length] + '</span>' +
      '<h3>' + esc(service.title) + '</h3></div>' +
      '<div class="service-stack__bottom"><div class="service-stack__description"><p>' + esc(service.description) + '</p>' +
      '<a class="service-stack__evidence service-journey__evidence" href="' + safeURL(service.evidenceHref) + '">See the proof: ' + esc(service.evidenceLabel) + ' </a></div>' +
      '<div class="service-stack__tags" aria-label="Typical deliverables">' + tags + '</div></div>' +
      '</article></li>';
  }).join("") + '</ul>';
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

export function renderCapabilities() {
  const el = mount(MOUNT.CAPABILITIES);
  if (!el) return;
  el.className = "process-sequence";
  if (el.dataset.prerendered !== "true") el.innerHTML = renderServiceSwatchesMarkup(SITE.capabilities);
}

export function renderExperienceLedger(entries = []) {
  return '<ol class="career-index experience-fallback" role="list">' + entries.map((entry, index) =>
    '<li class="career-index__entry"><div class="career-index__meta"><span class="career-index__number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span><p class="career-index__period">' + esc(entry.period) + '</p></div>' +
    '<div class="career-index__identity"><h3 class="career-index__organisation">' + esc(entry.organisation) + '</h3><p class="career-index__role">' + esc(entry.role) + '</p></div>' +
    '<p class="career-index__contribution">' + esc(entry.contribution) + '</p></li>'
  ).join("") + '</ol>';
}

export function renderCvMarkup(cv, base = "") {
  if (!cv?.href) return "";
  return '<a class="about-cv btn" href="' + base + safeURL(cv.href) + '" type="' + esc(cv.mimeType) + '" download>' + esc(cv.label) + '<span>PDF · ' + esc(cv.sizeLabel) + '</span></a>';
}

export function renderProfessionalEvidence() {
  const experience = document.querySelector('[data-mount="experience"]');
  if (experience && experience.dataset.prerendered !== "true" && SITE.experience?.length) experience.innerHTML = renderExperienceLedger(SITE.experience);
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
