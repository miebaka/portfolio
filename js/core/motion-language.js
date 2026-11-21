/* Shared motion preference. The Selected Work preview is CSS-driven:
   no pointer tracking, forced animation frames or inline position updates. */

export function isMotionReduced(root, systemQuery) {
  const setting = root?.dataset?.motion;
  return setting === "reduced" || (setting !== "full" && systemQuery?.matches === true);
}

export function initMotionLanguage({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  if (!doc?.documentElement || !win) return { destroy() {} };

  const root = doc.documentElement;
  const systemQuery = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  let destroyed = false;

  const sync = () => {
    if (!destroyed) root.classList.toggle("motion-language-ready", !isMotionReduced(root, systemQuery));
  };

  systemQuery?.addEventListener?.("change", sync);
  const PreferenceObserver = win.MutationObserver;
  const preferences = PreferenceObserver ? new PreferenceObserver(sync) : null;
  preferences?.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  sync();

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.classList.remove("motion-language-ready");
      systemQuery?.removeEventListener?.("change", sync);
      preferences?.disconnect();
    },
  };
}
