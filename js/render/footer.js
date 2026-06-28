/* Render — site footer: closing CTA, contact, socials and the legal line. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, mount } from "../utilities/dom.js";

export function renderFooter() {
  const el = mount("footer");
  if (!el) return;
  const socials = SITE.socials
    .map((s) => '<a href="' + esc(s.href) + '" rel="noopener">' + esc(s.label) + "</a>")
    .join("");
  el.className = "site-footer";
  el.innerHTML =
    '<div class="container site-footer__grid">' +
    '<p class="site-footer__cta">Let&rsquo;s <a href="mailto:' + esc(SITE.email) + '">work together</a>.</p>' +
    '<div class="site-footer__meta">' +
    '<a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
    '<div class="site-footer__socials">' + socials + "</div>" +
    "</div></div>" +
    '<div class="container site-footer__bottom">' +
    "<span>" + esc(SITE.location) + "</span>" +
    "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
    "</div>";
}
