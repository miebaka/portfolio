/* Render — site footer: location, navigation, socials and the legal line. */
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
  const explore = (SITE.menu || []).map((item) =>
    '<a href="' + basePath() + esc(item.href) + '">' + esc(item.label) + '</a>'
  ).join('') + '<a href="' + basePath() + 'privacy.html">Privacy</a>';
  el.className = "site-footer site-footer--seasats";
  el.innerHTML =
    '<div class="site-footer__panel">' +
      '<div class="site-footer__context"><p class="site-footer__label">Based in</p><p>' + esc(SITE.location) + '</p></div>' +
      '<nav class="site-footer__explore" aria-label="Footer"><p class="site-footer__label">Explore</p>' + explore + '</nav>' +
      '<div class="site-footer__contact"><p class="site-footer__label">Social</p><div class="site-footer__socials">' + socials + '</div><a class="site-footer__top" href="#main">Back to top ↑</a><span>&copy; <span data-year></span> ' + esc(SITE.name) + '</span></div>' +
    '</div>' +
    '<div class="site-footer__signature" data-text="I design brand systems, then build the tools that keep them intact." aria-hidden="true"></div>';

}
