/* Progressive enhancement, not a replacement for native browser scrolling.
   GSAP and Lenis load on capable desktop devices only; reduced-motion or
   touch-first visitors retain ordinary scrolling, anchors and focus. */
import { isMotionReduced } from "./motion-language.js";

const DESKTOP = "(min-width: 48.001rem) and (hover: hover) and (pointer: fine)";

export function initScrollExperience({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  loadEngine = () => import("../../assets/runtime/motion-experience.js"),
} = {}) {
  if (!doc?.documentElement || !win) return { destroy() {} };
  const root = doc.documentElement;
  const screen = win.matchMedia?.(DESKTOP);
  const reduce = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const preview = new URLSearchParams(win.location?.search || "").has("motion-test");
  let instance = null, pending = false, revision = 0, destroyed = false;
  // Playwright exercises this separately through ?motion-test; normal CI
  // routes stay native so GPU and motion tests remain deterministic.
  const allowed = () => !destroyed && doc.body?.dataset.page !== "work" && screen?.matches === true &&
    !isMotionReduced(root, reduce) && (preview || win.navigator?.webdriver !== true);

  const disable = () => {
    revision++;
    instance?.destroy();
    instance = null;
    pending = false;
    root.dataset.scrollExperience = "native";
  };
  const enable = async () => {
    if (instance || pending || !allowed()) return;
    pending = true;
    root.dataset.scrollExperience = "loading";
    const token = ++revision;
    try {
      const module = await loadEngine();
      if (destroyed || token !== revision || !allowed()) return;
      instance = module.mountMotionExperience({ doc, win });
      root.dataset.scrollExperience = "active";
    } catch (error) {
      if (token === revision) {
        root.dataset.scrollExperience = "native";
        console.warn("Motion enhancement unavailable; native scroll retained", error);
      }
    } finally {
      if (token === revision) pending = false;
    }
  };
  const sync = () => { if (allowed()) void enable(); else disable(); };
  const observer = win.MutationObserver ? new win.MutationObserver(sync) : null;
  observer?.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  screen?.addEventListener?.("change", sync);
  reduce?.addEventListener?.("change", sync);
  win.addEventListener("pagehide", disable, { once: true });
  sync();
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      disable();
      observer?.disconnect();
      screen?.removeEventListener?.("change", sync);
      reduce?.removeEventListener?.("change", sync);
      win.removeEventListener("pagehide", disable);
      delete root.dataset.scrollExperience;
    },
  };
}
