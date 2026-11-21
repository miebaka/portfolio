/* Filing Cabinet V2 — destination paper arrival.
   Only a recent, matching extraction from Work earns this treatment.
   Normal direct links and keyboard navigation paint immediately. */
const ARRIVAL_KEY = "portfolio.workCabinet.arrival.v2";
const MAX_AGE_MS = 12000;

export function initCaseArrival({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  if (!doc?.body?.dataset.case || !win) return { destroy() {} };
  let marker = null;
  try {
    marker = JSON.parse(win.sessionStorage?.getItem(ARRIVAL_KEY) || "null");
    win.sessionStorage?.removeItem(ARRIVAL_KEY);
  } catch { /* Storage denial must not affect the case study. */ }
  const navigation = win.performance?.getEntriesByType?.("navigation")?.[0];
  const reduced = doc.documentElement.dataset.motion === "reduced" ||
    win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;
  if (!marker || marker.pathname !== win.location.pathname ||
      !Number.isFinite(marker.savedAt) ||
      Date.now() - marker.savedAt < 0 || Date.now() - marker.savedAt > MAX_AGE_MS ||
      navigation?.type === "back_forward" || reduced) return { destroy() {} };

  // A direct visit cannot inherit a previous animation merely because it
  // opens the same URL shortly afterwards.
  if (doc.referrer) {
    try {
      const from = new URL(doc.referrer);
      if (from.origin !== win.location.origin || from.pathname !== "/work.html")
        return { destroy() {} };
    } catch { return { destroy() {} }; }
  }

  const opening = doc.querySelector(".case-opening");
  if (!opening || typeof opening.animate !== "function") return { destroy() {} };
  const items = [
    opening.querySelector(".case-back"),
    opening.querySelector("h1"),
    opening.querySelector(".case-opening__summary"),
    opening.querySelector(".case-facts"),
  ].filter(Boolean).slice(0, 4);
  const animations = [];
  doc.body.dataset.cabinetArrival = "true";
  try {
    items.forEach((element, index) => {
      animations.push(element.animate([
        { opacity: 0.4, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0px)" },
      ], { duration: 240, delay: index * 40,
        easing: "cubic-bezier(.23, 1, .32, 1)" }));
    });
  } catch {
    animations.forEach(animation => { try { animation.cancel(); } catch {} });
    delete doc.body.dataset.cabinetArrival;
  }
  return {
    destroy() {
      animations.forEach(animation => { try { animation.cancel(); } catch {} });
      delete doc.body.dataset.cabinetArrival;
    },
  };
}

// Loaded on published case pages only. All content remains visible if a
// browser does not support WAAPI, view transitions or JavaScript at all.
if (typeof document !== "undefined" && document.body?.dataset.case) {
  try { initCaseArrival(); }
  catch (error) { console.warn("Case arrival enhancement unavailable", error); }
}
