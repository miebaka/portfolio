import { isMotionReduced } from "./motion-language.js";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const isSoftwareRenderer = name =>
  /swiftshader|llvmpipe|softpipe|lavapipe|software raster|microsoft basic render/i.test(String(name || ""));

export const HERO_WAVE_PRESETS = Object.freeze({
  light: Object.freeze({
    name: "Light water plane",
  }),
  dark: Object.freeze({
    name: "Dark water plane",
  }),
});

function resolvedColors(win, root) {
  const styles = win.getComputedStyle?.(root);
  const token = name => styles?.getPropertyValue(name).trim();
  return {
    colors: [token("--hero-wave-color-1"), token("--hero-wave-color-2"), token("--hero-wave-color-3")],
  };
}

function resolvedState(root, reducedMotionQuery) {
  const theme = root.dataset.theme === "dark" ? "dark" : "light";
  return { theme, animate: !isMotionReduced(root, reducedMotionQuery) };
}

export async function initHeroWave({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  navigator: navigatorObject = globalThis.navigator,
  loadRenderer = () => import("../../assets/runtime/hero-wave.js"),
} = {}) {
  const parameters = new URLSearchParams(win?.location?.search || "");
  const testOptIn = parameters.has("shader-test");
  const forceStatic = parameters.has("shader-static");
  const automationOptIn = testOptIn || parameters.has("shader-perf");
  if (!doc?.body || !win || doc.body.dataset.page !== "home" ||
      (navigatorObject?.webdriver === true && !automationOptIn) ||
      doc.querySelector("[data-hero-wave]")) return null;

  if (testOptIn) doc.documentElement.classList.add("shader-test-mode");

  const finePointerQuery = win.matchMedia?.(FINE_POINTER);
  const reducedMotionQuery = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const root = doc.documentElement;
  const getState = () => {
    const state = resolvedState(root, reducedMotionQuery);
    const colors = resolvedColors(win, root);
    return { ...state, ...colors, animate: state.animate && !forceStatic && !userPaused };
  };
  let userPaused = false;
  const landing = doc.querySelector(".home-landing");
  if (!landing) return null;

  // Only reject confirmed software rendering. Missing GPU-identification
  // details are normal on mobile and must not suppress a working WebGL2 device.
  // Explicit shader-test routes retain software GL for deterministic QA.
  if (!testOptIn) {
    let probeContext;
    try {
      const probe = doc.createElement("canvas");
      probeContext = probe.getContext("webgl2", {
        alpha: false, antialias: false, powerPreference: "high-performance",
      });
      if (!probeContext) return null;
      const info = probeContext.getExtension("WEBGL_debug_renderer_info");
      const name = info
        ? probeContext.getParameter(info.UNMASKED_RENDERER_WEBGL)
        : probeContext.getParameter(probeContext.RENDERER);
      const software = isSoftwareRenderer(name);
      // Mobile Safari and privacy-conscious browsers often report only
      // "WebKit WebGL" or "WebGL" and hide WEBGL_debug_renderer_info.
      // An unrecognized name is NOT evidence of a software renderer.
      if (software) return null;
    } catch {
      return null;
    } finally {
      // Do not retain an extra GPU context after the capability probe.
      probeContext?.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }
  const host = doc.createElement("div");
  host.className = "hero-wave";
  host.dataset.heroWave = "";
  host.setAttribute("aria-hidden", "true");
  landing.prepend(host);
  const control = doc.createElement("button");
  control.type = "button";
  control.className = "hero-wave__control";
  control.textContent = "Pause background motion";
  control.setAttribute("aria-pressed", "false");
  landing.append(control);
  let rendererModule;
  try { rendererModule = await loadRenderer(); }
  catch (error) { control.remove(); host.remove(); console.warn("Hero wave unavailable", error); return null; }

  let island;
  try {
    island = rendererModule.mountHeroWave(host, getState());
  }
  catch (error) {
    island?.destroy();
    control.remove();
    host.remove();
    console.warn("Hero wave unavailable", error);
    return null;
  }

  let destroyed = false;
  let pointerFrame = 0;
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
  landing.addEventListener("pointerleave", resetPointer, { passive: true });
  win.addEventListener("blur", resetPointer);
  const markReady = async () => {
    await island?.ready;
    if (destroyed) return;
    if (!host.querySelector("canvas")) return;
    root.classList.add("has-hero-wave");
    host.classList.add("is-ready");
  };
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
    landing.removeEventListener("pointerleave", resetPointer);
    win.removeEventListener("blur", resetPointer);
    if (pointerFrame) win.cancelAnimationFrame(pointerFrame);
    win.removeEventListener("pagehide", destroy);
    island.destroy();
    host.remove();
    root.classList.remove("has-hero-wave");
    root.classList.remove("shader-test-mode");
  };
  win.addEventListener("pagehide", destroy, { once: true });
  sync();
  return { destroy, get preset() { return host.dataset.preset; } };
}
