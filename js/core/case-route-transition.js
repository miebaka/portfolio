/* Shared, accessible case-study route handoff for native links and
   the interactive project folders. No animation when reduced motion is set. */
import { isMotionReduced } from "./motion-language.js";

const reducedMotion = () => isMotionReduced(
  document.documentElement, window.matchMedia("(prefers-reduced-motion: reduce)")
);

let leaving = false;

export function navigateToCase(url) {
  if (leaving) return;
  leaving = true;
  if (reducedMotion()) {
    window.location.assign(url);
    return;
  }
  const curtain = document.createElement("div");
  curtain.className = "case-route-transition";
  curtain.setAttribute("aria-hidden", "true");
  curtain.innerHTML = '<span class="case-route-transition__mark"></span>';
  document.body.append(curtain);
  window.setTimeout(() => window.location.assign(url), 450);
}

export function initCaseRouteTransitions() {
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    leaving = false;
    document.querySelector(".case-route-transition")?.remove();
  });
  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!anchor || anchor.hasAttribute("download") ||
        (anchor.target && anchor.target !== "_self")) return;
    const target = new URL(anchor.href, location.href);
    if (target.origin !== location.origin ||
        !/\/work\/[a-z0-9-]+\.html$/i.test(target.pathname) ||
        target.pathname === location.pathname) return;
    if (reducedMotion()) return;
    event.preventDefault();
    navigateToCase(target.href);
  });
}
