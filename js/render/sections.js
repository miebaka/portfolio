/* Render — home sections: capabilities list and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderCapabilities() {
  const el = mount(MOUNT.CAPABILITIES);
  if (!el) return;
  el.className = "disciplines-index";
  const heading = document.body.dataset.page === "services" ? "h2" : "h3";
  el.innerHTML = SITE.capabilities.map(c =>
    '<article class="discipline"><' + heading + '>' + esc(c.title) + '</' + heading + '><p>' + esc(c.description) + '</p></article>'
  ).join("");
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
