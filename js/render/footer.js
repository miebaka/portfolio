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
  const footerOrder = ["work", "about", "explorations", "writing", "contact", "privacy"];
  const explore = footerOrder.map(key => navigation.routes.find(item => item.key === key)).filter(Boolean).map((item) =>
    '<a href="' + basePath() + esc(item.href) + '">' + esc(item.label) + '</a>'
  ).join('');
  const socials = (SITE.socials || []).filter(item => ["LinkedIn", "Instagram", "Twitter"].includes(item.label)).map((item) =>
    '<a href="' + safeURL(item.href) + '" target="_blank" rel="noopener noreferrer">' + esc(item.label) + '</a>'
  ).join('');
  const group = (className, label, content) =>
    '<div class="site-footer__group ' + className + '" role="group" aria-label="' + esc(label) + '"><div class="site-footer__links">' + content + '</div></div>';
  const compact = ["contact", "privacy", "404"].includes(document.body.dataset.page);
  el.className = "site-footer site-footer--seasats" + (compact ? " site-footer--compact" : "");
  el.innerHTML =
    '<div class="site-footer__panel">' +
      '<nav class="site-footer__groups" aria-label="Footer">' +
        group('site-footer__explore', 'Explore', explore) +
        group('site-footer__socials', 'Social', socials) +
      '</nav>' +
    '</div>' +
    '<div class="site-footer__signature" aria-hidden="true"></div>';

}
