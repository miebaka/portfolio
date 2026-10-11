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
  const explore = (SITE.menu || []).map((item) =>
    '<a href="' + basePath() + esc(item.href) + '">' + esc(item.label) + '</a>'
  ).join('') + '<a href="' + basePath() + 'privacy.html">Privacy</a>';
  const socials = (SITE.socials || []).map((item) =>
    '<a href="' + safeURL(item.href) + '" target="_blank" rel="noopener noreferrer">' + esc(item.label) + '</a>'
  ).join('');
  const group = (className, label, content) =>
    '<div class="site-footer__group ' + className + '"><p class="site-footer__label">' + esc(label) + '</p><div class="site-footer__links">' + content + '</div></div>';
  el.className = "site-footer site-footer--seasats";
  el.innerHTML =
    '<div class="site-footer__panel">' +
      '<nav class="site-footer__groups" aria-label="Footer">' +
        group('site-footer__location', 'Based in', '<span>' + esc(SITE.location) + '</span>') +
        group('site-footer__explore', 'Explore', explore) +
        group('site-footer__socials', 'Social', socials) +
      '</nav>' +
    '</div>' +
    '<div class="site-footer__signature" aria-hidden="true"></div>';

}
