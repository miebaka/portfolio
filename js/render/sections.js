/* Render — home sections: capabilities list, testimonial, and text/portrait slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";

export function renderCapabilities() {
  const el = mount("capabilities");
  if (!el) return;
  el.classList.add("cap-list");
  el.innerHTML = SITE.capabilities
    .map((c) =>
      '<div class="cap-row reveal">' +
      '<span class="cap-row__name">' + esc(c.title) + "</span>" +
      '<span class="cap-row__meta">' + esc(c.meta || "") + "</span>" +
      "</div>"
    )
    .join("");
  el.querySelectorAll(".cap-row").forEach((row, i) => {
    row.style.setProperty("--reveal-i", i);
  });
}

/* Renders nothing at all unless there is a real quote with a real attributor.
   The seed entry in site.js has empty strings, which previously produced an
   empty blockquote and an empty <cite> sitting in the middle of the home page
   as a visible gap. An unfilled section should not reserve space. */
export function renderTestimonial() {
  const el = mount("testimonial");
  if (!el) return;

  const t = (SITE.testimonials || []).find(
    (q) => q && q.text && q.text.trim() && q.author && q.author.trim()
  );

  if (!t) {
    /* Remove the wrapper block too, so its section padding collapses with it */
    const block = el.closest(".about-home__block");
    (block || el).remove();
    return;
  }

  el.className = "testimonial";
  el.innerHTML =
    '<blockquote class="testimonial__text">' + esc(t.text.trim()) + "</blockquote>" +
    '<figcaption class="testimonial__author"><cite>' + esc(t.author.trim()) + "</cite>" +
    (t.detail && t.detail.trim() ? ", " + esc(t.detail.trim()) : "") + "</figcaption>";
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
