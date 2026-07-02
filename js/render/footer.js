/* Render — site footer: email, socials and the legal line. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";

export function renderFooter() {
  const el = mount("footer");
  if (!el) return;
  const socials = SITE.socials
    .map((s) => '<a href="' + esc(s.href) + '" rel="noopener noreferrer">' + esc(s.label) + "</a>")
    .join("");
  el.className = "site-footer";
  el.innerHTML =
    '<div class="container site-footer__grid">' +
      '<a class="site-footer__email" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
      '<div class="site-footer__meta">' +
        '<div class="site-footer__socials">' + socials + "</div>" +
      "</div>" +
    "</div>" +
    '<div class="container site-footer__bottom">' +
      "<span>" + esc(SITE.location) + "</span>" +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
    "</div>";
}
