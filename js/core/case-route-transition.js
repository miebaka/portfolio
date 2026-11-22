/* Preserve the Belonwus-inspired case-study handoff independently of
   the reverted upright folder-rack experiment. */
export function initCaseRouteTransitions() {
  const isReduced = () => document.documentElement.dataset.motion === "reduced" ||
    (document.documentElement.dataset.motion !== "full" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  let navigating = false;

  const onClick = event => {
    if (navigating || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        isReduced()) return;
    const link = event.target instanceof Element
      ? event.target.closest("a[href]")
      : null;
    if (!link || link.hasAttribute("download") ||
        (link.target && link.target !== "_self")) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin ||
        !/^\/work\/[a-z0-9-]+\.html$/i.test(destination.pathname) ||
        destination.pathname === location.pathname) return;

    event.preventDefault();
    navigating = true;
    const curtain = document.createElement("div");
    curtain.className = "case-route-transition";
    curtain.setAttribute("aria-hidden", "true");
    curtain.innerHTML = '<span class="case-route-transition__mark"></span>';
    document.body.append(curtain);
    window.setTimeout(() => location.assign(destination.href), 450);
  };

  document.addEventListener("click", onClick);
  window.addEventListener("pagehide", () => {
    document.removeEventListener("click", onClick);
  }, { once: true });
}
