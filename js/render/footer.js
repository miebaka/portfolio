/* Signature-first proof-sheet footer. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

export function renderFooter() {
  const el = mount(MOUNT.FOOTER);
  if (!el) return;
  const base = basePath();
  const explore = SITE.menu.map(item => '<a href="' + base + safeURL(item.href) + '">' + esc(item.label.toUpperCase()) + '</a>').join("") + '<a href="' + base + 'privacy.html">PRIVACY</a>';
  const socials = SITE.socials.map(item => '<a href="' + safeURL(item.href) + '" target="_blank" rel="noopener noreferrer">' + esc((item.label === "Twitter" ? "Twitter / X" : item.label).toUpperCase()) + '</a>').join("");
  el.className = "site-footer proof-footer";
  el.innerHTML =
    '<div class="site-footer__signature" aria-hidden="true" data-signature-src="' + base + 'assets/images/miebaka-joshua-script-name.svg"></div>' +
    '<div class="proof-footer__cols proof-mono">' +
      '<div><span class="proof-footer__key">BASED IN</span><span class="proof-footer__value">' + esc(SITE.location) + '</span></div>' +
      '<div><span class="proof-footer__key">EXPLORE</span><span class="site-footer__links">' + explore + '</span></div>' +
      '<div><span class="proof-footer__key">SOCIAL</span><span class="site-footer__links">' + socials + '</span></div>' +
    '</div>';
}
