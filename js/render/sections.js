/* Render — home sections: capabilities list and text slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderCapabilities() {
  const el = mount(MOUNT.CAPABILITIES);
  if (!el) return;
  el.className = "disciplines-index";
  const heading = document.body.dataset.page === "services" ? "h2" : "h3";
  const visuals = [
    { src: "rivo-guidelines", alt: "Rivo identity guidelines" },
    null,
    { src: "chopbox-campaign", alt: "ChopBox campaign design" },
    { src: "tedx-rsu-pattern", alt: "TEDx RSU visual system" },
    null,
  ];
  el.innerHTML = SITE.capabilities.map((c, index) =>
    '<article class="discipline">' +
      (visuals[index] ? '<figure class="discipline__media"><img src="assets/images/optimized/' + visuals[index].src + '-540.webp" alt="' + esc(visuals[index].alt) + '" width="540" height="675" loading="lazy" decoding="async"></figure>' : '') +
      '<div class="discipline__copy"><span class="discipline__number">0' + (index + 1) + '</span><' + heading + '>' + esc(c.title) + '</' + heading + '><p>' + esc(c.description) + '</p></div></article>'
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
