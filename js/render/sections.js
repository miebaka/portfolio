/* Render — home sections: capabilities list and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderServiceSwatchesMarkup(items = SITE.capabilities) {
  const tabs = items.map((service, index) =>
    '<button class="service-swatch" type="button" role="tab" id="service-tab-' + esc(service.id) + '" aria-controls="service-panel-' + esc(service.id) + '" aria-selected="' + String(index === 0) + '" tabindex="' + (index === 0 ? "0" : "-1") + '" data-service-index="' + index + '">' +
      '<span class="service-swatch__number" aria-hidden="true">' + String(index + 1).padStart(2, "0") + '</span><span>' + esc(service.title) + '</span></button>'
  ).join("");
  const panels = items.map((service, index) =>
    '<article class="service-panel" role="tabpanel" id="service-panel-' + esc(service.id) + '" aria-labelledby="service-tab-' + esc(service.id) + '"' + (index ? " hidden" : "") + '>' +
      '<p class="service-panel__description">' + esc(service.description) + '</p><dl><div><dt>Typical outputs</dt><dd>' + esc(service.outputs) + '</dd></div><div><dt>Good fit</dt><dd>' + esc(service.fit) + '</dd></div></dl></article>'
  ).join("");
  return '<div class="service-swatches" data-service-swatches><div class="service-swatches__tabs" role="tablist" aria-label="Services">' + tabs + '</div><div class="service-swatches__panels">' + panels + '</div></div>';
}

export function renderServiceFallbackMarkup(items = SITE.capabilities) {
  return '<ol class="service-fallback">' + items.map(service =>
    '<li><h3>' + esc(service.title) + '</h3><p>' + esc(service.description) + '</p><dl><div><dt>Typical outputs</dt><dd>' + esc(service.outputs) + '</dd></div><div><dt>Good fit</dt><dd>' + esc(service.fit) + '</dd></div></dl></li>'
  ).join("") + '</ol>';
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
  el.className = "disciplines-index";
  el.innerHTML = renderServiceSwatchesMarkup(SITE.capabilities);
  createServiceSwatches(el.querySelector("[data-service-swatches]"));
}

export function renderExperienceLedger(entries = []) {
  return '<ol class="experience-ledger">' + entries.map(entry =>
    '<li class="experience-ledger__item"><div class="experience-ledger__heading"><p class="experience-ledger__organisation">' + esc(entry.organisation) + '</p><p class="experience-ledger__period">' + esc(entry.period) + '</p></div><p class="experience-ledger__role">' + esc(entry.role) + '</p><p class="experience-ledger__contribution">' + esc(entry.contribution) + '</p></li>'
  ).join("") + '</ol>';
}

export function renderCvMarkup(cv, base = "") {
  if (!cv?.href) return "";
  return '<a class="about-cv btn" href="' + base + safeURL(cv.href) + '" type="' + esc(cv.mimeType) + '" download>' + esc(cv.label) + '<span>PDF · ' + esc(cv.sizeLabel) + '</span></a>';
}

export function renderProfessionalEvidence() {
  const experience = document.querySelector('[data-mount="experience"]');
  if (experience) experience.innerHTML = renderExperienceLedger(SITE.experience || []);
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
