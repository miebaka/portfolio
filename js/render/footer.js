/* Render — site footer: email, socials and the legal line. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderFooter() {
  const el = mount(MOUNT.FOOTER);
  if (!el) return;
  /* target="_blank" was missing, which made the rel attribute inert and sent
     visitors off-site in the same tab from the footer while the same links in
     the menu opened a new one. */
  const socials = (SITE.socials || [])
    .filter((s) => s && s.href && s.label)
    .map((s) =>
      '<a href="' + safeURL(s.href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(s.label) + "</a>"
    )
    .join("");
  el.className = "site-footer";
  el.innerHTML =
    '<div class="container swiss-footer-top"><span class="swiss-label">Have something in mind?</span><a class="swiss-footer-cta" href="' + basePath() + 'contact.html">Let’s make it matter.<span aria-hidden="true">↗</span></a></div>' +
    '<div class="container site-footer__grid">' +
      '<a class="site-footer__email" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>" +
      '<div class="site-footer__meta">' +
        '<div class="site-footer__socials">' + socials + "</div>" +
      "</div>" +
    "</div>" +
    '<div class="container site-footer__bottom">' +
      "<span>" + esc(SITE.location) + "</span>" +
      '<a class="site-footer__legal" href="' + basePath() + 'privacy.html">Privacy</a>' +
      "<span>&copy; <span data-year></span> " + esc(SITE.name) + "</span>" +
    "</div>";
}
