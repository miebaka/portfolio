import { isMotionReduced } from "./motion-language.js";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const HERO_WAVE_PRESETS = Object.freeze({
  light: Object.freeze({
    name: "Light water plane",
  }),
  dark: Object.freeze({
    name: "Dark water plane",
  }),
});

function resolvedState(root, reducedMotionQuery) {
  const theme = root.dataset.theme === "dark" ? "dark" : "light";
  return { theme, animate: !isMotionReduced(root, reducedMotionQuery) };
}

export async function initHeroWave({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  // Revisioned to bypass older cached shader bundles on mobile browsers.
  loadRenderer = () => import("../../assets/runtime/hero-wave.js?rev=20261122-mobile-caustics"),
} = {}) {
  const parameters = new URLSearchParams(win?.location?.search || "");
  const testOptIn = parameters.has("shader-test");
  const forceStatic = parameters.has("shader-static");
  if (!doc?.body || !win || doc.body.dataset.page !== "home" ||
      doc.querySelector("[data-hero-wave]")) return null;


  const finePointerQuery = win.matchMedia?.(FINE_POINTER);
  const reducedMotionQuery = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const root = doc.documentElement;
  const getState = () => {
    const state = resolvedState(root, reducedMotionQuery);
    return { ...state, animate: state.animate && !forceStatic && !userPaused };
  };
  let userPaused = false;
  const landing = doc.querySelector(".home-landing");
  if (!landing) return null;

  // Keep the water surface visible while WebGL loads, and when it cannot run.
  const host = doc.createElement("div");
  host.className = "hero-wave is-fallback";
  host.dataset.heroWave = "";
  host.dataset.renderer = "fallback";
  host.dataset.fallbackReason = "loading";
  host.setAttribute("aria-hidden", "true");
  landing.prepend(host);
  const keepFallback = (error, reason = "renderer-unavailable") => {
    if (error) console.warn("Three.js water unavailable; showing static water", error);
    host.classList.add("is-fallback");
    host.classList.remove("is-ready");
    host.dataset.renderer = "fallback";
    host.dataset.fallbackReason = reason;
    return { destroy() { host.remove(); } };
  };

  // One actual context is created by the renderer, not an extra mobile GPU
  // probe. Reject only a real initialization failure, not a generic GPU name.
  const control = doc.createElement("button");
  control.type = "button";
  control.className = "hero-wave__control";
  control.textContent = "Pause background motion";
  control.setAttribute("aria-pressed", "false");
  landing.append(control);
  let rendererModule;
  try { rendererModule = await loadRenderer(); }
  catch (error) { control.remove(); return keepFallback(error, "module-load"); }

  let island;
  try {
    island = rendererModule.mountHeroWave(host, getState());
  }
  catch (error) {
    island?.destroy();
    control.remove();
    return keepFallback(error, "renderer-init");
  }

  let destroyed = false;
  let pointerFrame = 0;
  let touchReleaseFrame = 0;
  let pendingPointer = { x: 0, y: 0, force: 0, quiet: true, source: "static" };
  const applyPointer = () => {
    pointerFrame = 0;
    const state = getState();
    const pointer = state.animate ? pendingPointer :
      { x: 0, y: 0, force: 0, quiet: true, source: "static" };
    host.dataset.interaction = pointer.source;
    if (testOptIn) {
      host.dataset.cursorX = pointer.x.toFixed(3);
      host.dataset.cursorY = pointer.y.toFixed(3);
    }
    island.setPointer(pointer.x, pointer.y, pointer.force, pointer.quiet);
  };
  const queuePointer = (event, force = 0) => {
    if (!getState().animate) return;
    const rect = landing.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    // Vanta-style controls use the affected element, not the viewport.
    // This keeps the brush directly under the finger/cursor after scrolling.
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    pendingPointer = {
      x: Math.max(-1, Math.min(1, x * 2 - 1)),
      y: Math.max(-1, Math.min(1, y * 2 - 1)),
      force,
      quiet: false,
      source: event.pointerType === "touch" ? "touch" : "cursor",
    };
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(applyPointer);
  };
  const onPointerMove = event => {
    if (event.pointerType === "touch") {
      // Touch movement should never steal the browser's vertical scroll.
      if (!event.buttons) return;
    } else if (!finePointerQuery?.matches) return;
    queuePointer(event);
  };
  const onPointerDown = event => {
    // Tap creates a single ripple. Touch-action remains native pan/zoom.
    queuePointer(event, event.pointerType === "touch" ? .52 : .36);
  };
  const resetPointer = () => {
    pendingPointer = { x: 0, y: 0, force: 0, quiet: true, source: "static" };
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(applyPointer);
  };
  const onPointerLeave = event => {
    if (event.pointerType !== "touch") {
      resetPointer();
      return;
    }
    // Touch browsers dispatch pointerleave as soon as the finger lifts.
    // Resetting immediately can replace a queued pointerdown impulse
    // before its first animation frame: a real tap then produces no ripple.
    // Give the touch impulse one render frame before returning to idle.
    if (touchReleaseFrame) win.cancelAnimationFrame(touchReleaseFrame);
    touchReleaseFrame = win.requestAnimationFrame(() => {
      touchReleaseFrame = win.requestAnimationFrame(() => {
        touchReleaseFrame = 0;
        resetPointer();
      });
    });
  };
  const sync = () => {
    if (destroyed) return;
    const state = getState();
    control.hidden = forceStatic || isMotionReduced(root, reducedMotionQuery);
    const preset = HERO_WAVE_PRESETS[state.theme];
    host.dataset.preset = preset.name;
    island.update(state);
    resetPointer();
  };
  const toggleMotion = () => {
    userPaused = !userPaused;
    control.textContent = userPaused ? "Resume background motion" : "Pause background motion";
    control.setAttribute("aria-pressed", String(userPaused));
    sync();
  };
  control.addEventListener("click", toggleMotion);
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  finePointerQuery?.addEventListener?.("change", sync);
  reducedMotionQuery?.addEventListener?.("change", sync);
  landing.addEventListener("pointermove", onPointerMove, { passive: true });
  landing.addEventListener("pointerdown", onPointerDown, { passive: true });
  landing.addEventListener("pointerleave", onPointerLeave, { passive: true });
  win.addEventListener("blur", resetPointer);
  const canvas = host.querySelector("canvas");
  const markReady = async () => {
    await island?.ready;
    if (destroyed || !canvas?.isConnected) return;
    root.classList.add("has-hero-wave");
    host.classList.remove("is-fallback");
    host.dataset.renderer = "threejs";
    delete host.dataset.fallbackReason;
    host.classList.add("is-ready");
  };
  const onContextLost = () => {
    // A lost GPU context must never leave an invisible or black hero.
    host.classList.add("is-fallback");
    host.classList.remove("is-ready");
    host.dataset.renderer = "fallback";
    host.dataset.fallbackReason = "context-lost";
  };
  const onContextRestored = () => {
    if (destroyed) return;
    island.update(getState());
    void markReady();
  };
  canvas?.addEventListener("webglcontextlost", onContextLost);
  canvas?.addEventListener("webglcontextrestored", onContextRestored);
  void markReady();

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    control.removeEventListener("click", toggleMotion);
    control.remove();
    finePointerQuery?.removeEventListener?.("change", sync);
    reducedMotionQuery?.removeEventListener?.("change", sync);
    landing.removeEventListener("pointermove", onPointerMove);
    landing.removeEventListener("pointerdown", onPointerDown);
    landing.removeEventListener("pointerleave", onPointerLeave);
    win.removeEventListener("blur", resetPointer);
    if (pointerFrame) win.cancelAnimationFrame(pointerFrame);
    if (touchReleaseFrame) win.cancelAnimationFrame(touchReleaseFrame);
    win.removeEventListener("pagehide", destroy);
    canvas?.removeEventListener("webglcontextlost", onContextLost);
    canvas?.removeEventListener("webglcontextrestored", onContextRestored);
    island.destroy();
    host.remove();
    root.classList.remove("has-hero-wave");
  };
  win.addEventListener("pagehide", destroy, { once: true });
  sync();
  return { destroy, get preset() { return host.dataset.preset; } };
}
