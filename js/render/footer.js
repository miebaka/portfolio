/* Render — site footer: location, navigation, socials and the legal line. */
import { SITE } from "../../data/site.js";
import { navigation } from "../../data/navigation.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderFooter() {
  const el = mount(MOUNT.FOOTER);
  if (!el) return;
  /* target="_blank" was missing, which made the rel attribute inert and sent
     visitors off-site in the same tab from the footer while the same links in
     the menu opened a new one. */
  const footerOrder = ["work", "explorations", "about", "writing", "process", "contact", "accessibility", "privacy"];
  const explore = footerOrder.map(key => navigation.routes.find(item => item.key === key)).filter(Boolean).map((item) =>
    '<a href="' + basePath() + esc(item.href) + '">' + esc(item.label) + '</a>'
  ).join('');
  const socials = (SITE.socials || []).filter(item => ["Behance", "LinkedIn", "Instagram", "X"].includes(item.label)).map((item) =>
    '<a href="' + safeURL(item.href) + '" target="_blank" rel="noopener noreferrer">' + esc(item.label) + '</a>'
  ).join('');
  const group = (className, label, content) =>
    '<div class="site-footer__group ' + className + '"><div class="site-footer__links" aria-label="' + esc(label) + '">' + content + '</div></div>';
  el.className = "site-footer";
  el.innerHTML =
    '<div class="site-footer__panel">' +
      '<div class="site-footer__top">' +
        '<p class="site-footer__eyebrow">Inquiries</p>' +
        '<a class="site-footer__start" href="' + safeURL('mailto:' + SITE.email + '?subject=Let%27s%20work%20together') + '">' + esc(SITE.email) + ' <span aria-hidden="true">↗</span></a>' +
      '</div>' +
      '<nav class="site-footer__groups" aria-label="Footer links">' +
        group('site-footer__explore', 'Explore', explore) +
        group('site-footer__socials', 'Social', socials) +
      '</nav>' +
      '<div class="site-footer__bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(SITE.name) + '</span></div>' +
    '</div>' +
    '<div class="site-footer__signature" aria-hidden="true"></div>';

}
