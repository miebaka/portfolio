/* Render — home sections: capabilities list, testimonial, and text/portrait slots. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";

export function renderCapabilities() {
  const el = mount("capabilities");
  if (!el) return;
  el.classList.add("cap-list");
  el.innerHTML = SITE.capabilities
    .map((c, i) =>
      '<div class="cap-row reveal" style="--reveal-i:' + i + '">' +
      '<span class="cap-row__name">' + esc(c.title) + "</span>" +
      '<span class="cap-row__meta">' + esc(c.meta || "") + "</span>" +
      "</div>"
    )
    .join("");
}

export function renderTestimonial() {
  const el = mount("testimonial");
  if (!el || !SITE.testimonials.length) return;
  const t = SITE.testimonials[0];
  el.className = "testimonial";
  el.innerHTML =
    '<blockquote class="testimonial__text">' + esc(t.text) + "</blockquote>" +
    '<figcaption class="testimonial__author"><cite>' + esc(t.author) + "</cite>" +
    (t.detail ? " — " + esc(t.detail) : "") + "</figcaption>";
}

/* Fill simple text slots ([data-fill]), email links, and the hero portrait. */
export function fillSlots() {
  document.querySelectorAll("[data-fill]").forEach((node) => {
    const key = node.dataset.fill;
    if (SITE[key] != null) node.textContent = SITE[key];
  });
  document.querySelectorAll('[data-href="email"]').forEach((node) => {
    node.setAttribute("href", "mailto:" + SITE.email);
  });

  const portraitMount = document.querySelector("[data-portrait-mount]");
  if (portraitMount && SITE.portrait) {
    portraitMount.appendChild(buildPortrait());
    const label = portraitMount.querySelector(".hero-noir__media-label");
    if (label) label.remove();
  }
}

/* Portrait element. When SITE.portraitResponsive is configured (after running
   `npm run optimize:images`), emit <picture> with AVIF/WebP + srcset and a JPG
   fallback; otherwise a plain <img> on the original file. */
function buildPortrait() {
  const alt = "Portrait of " + SITE.name;
  const r = SITE.portraitResponsive;
  if (!r) {
    const img = document.createElement("img");
    img.src = SITE.portrait;
    img.alt = alt;
    img.width = 1080;
    img.height = 1350;
    img.loading = "eager";
    img.decoding = "async";
    img.fetchPriority = "high";
    return img;
  }
  const srcset = (ext) =>
    r.widths.map((w) => r.dir + r.base + "-" + w + "." + ext + " " + w + "w").join(", ");
  const largest = r.widths[r.widths.length - 1];
  const pic = document.createElement("picture");
  pic.innerHTML =
    '<source type="image/avif" srcset="' + srcset("avif") + '" sizes="' + esc(r.sizes) + '">' +
    '<source type="image/webp" srcset="' + srcset("webp") + '" sizes="' + esc(r.sizes) + '">' +
    '<img src="' + r.dir + r.base + "-" + largest + '.jpg" srcset="' + srcset("jpg") +
    '" sizes="' + esc(r.sizes) + '" alt="' + esc(alt) + '" width="' + r.width +
    '" height="' + r.height + '" loading="eager" decoding="async" fetchpriority="high">';
  return pic;
}
