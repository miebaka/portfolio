const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export const SHADER_BACKDROP_PRESETS = Object.freeze({
  light: Object.freeze({
    name: "Editorial press",
    colors: Object.freeze(["#f8f9fc", "#b1c5ff", "#002080"]),
  }),
  dark: Object.freeze({
    name: "04 Nighty night — Ultramarine",
    colors: Object.freeze(["#002080", "#1c3da4", "#b1c5ff"]),
  }),
});

function resolvedState(root, reducedQuery, navigatorObject, allowWebdriverMotion = false) {
  const theme = root.dataset.theme === "dark" ? "dark" : "light";
  const explicit = root.dataset.motionPreference;
  const reduced = explicit === "reduce" ||
    (explicit !== "full" && reducedQuery?.matches) ||
    navigatorObject?.connection?.saveData === true ||
    (navigatorObject?.webdriver === true && !allowWebdriverMotion);
  return { theme, reduced };
}

function waitForActivation(win, immediate, cursorCapable) {
  if (immediate) return Promise.resolve();
  return new Promise(resolve => {
    const events = cursorCapable ? ["pointermove", "pointerdown", "keydown", "scroll"] : ["pointerdown", "keydown", "scroll"];
    const activate = () => {
      win.clearTimeout(timer);
      events.forEach(type => win.removeEventListener(type, activate));
      resolve();
    };
    events.forEach(type => win.addEventListener(type, activate, { once: true, passive: true }));
    const timer = win.setTimeout(activate, 6000);
  });
}

export async function initShaderBackdrop({
  document: doc = globalThis.document,
  window: win = globalThis.window,
  navigator: navigatorObject = globalThis.navigator,
  loadRenderer = () => import("../../assets/runtime/shader-gradient.js"),
} = {}) {
  const parameters = new URLSearchParams(win?.location?.search || "");
  const testOptIn = parameters.has("shader-test");
  const forceStatic = parameters.has("shader-static");
  const automationOptIn = testOptIn || parameters.has("shader-perf");
  if (!doc?.body || !win || doc.body.dataset.page !== "home" ||
      (navigatorObject?.webdriver === true && !automationOptIn) ||
      doc.querySelector("[data-shader-backdrop]")) return null;

  const finePointerQuery = win.matchMedia?.(FINE_POINTER);
  await waitForActivation(win, testOptIn, finePointerQuery?.matches === true);

  const root = doc.documentElement;
  const reducedQuery = win.matchMedia?.(REDUCED_MOTION);
  const getState = () => {
    const state = resolvedState(root, reducedQuery, navigatorObject, testOptIn);
    return forceStatic ? { ...state, reduced: true } : state;
  };
  const host = doc.createElement("div");
  host.className = "shader-backdrop";
  host.dataset.shaderBackdrop = "";
  host.setAttribute("aria-hidden", "true");
  doc.body.prepend(host);
  const content = doc.querySelector(".home-content");
  const overlayHost = content ? doc.createElement("div") : null;
  if (overlayHost) {
    overlayHost.className = "shader-backdrop shader-backdrop--overlay";
    overlayHost.dataset.shaderOverlay = "";
    overlayHost.setAttribute("aria-hidden", "true");
    content.prepend(overlayHost);
  }

  let rendererModule;
  try { rendererModule = await loadRenderer(); }
  catch (error) { host.remove(); console.warn("Shader backdrop unavailable", error); return null; }

  let island;
  let overlayIsland;
  try {
    island = rendererModule.mountShaderGradient(host, getState());
    if (overlayHost) overlayIsland = rendererModule.mountShaderGradient(overlayHost, getState());
  }
  catch (error) {
    host.remove();
    overlayHost?.remove();
    console.warn("Shader backdrop unavailable", error);
    return null;
  }

  let destroyed = false;
  let pointerFrame = 0;
  let pendingPointer = { x: 0, y: 0 };
  const applyPointer = () => {
    pointerFrame = 0;
    const state = getState();
    const interactive = !state.reduced && finePointerQuery?.matches === true;
    const pointer = interactive ? pendingPointer : { x: 0, y: 0 };
    host.dataset.interaction = interactive ? "cursor" : "static";
    if (testOptIn) {
      host.dataset.cursorX = pointer.x.toFixed(3);
      host.dataset.cursorY = pointer.y.toFixed(3);
    }
    // Older cached renderer modules did not expose pointer control. Keep the
    // backdrop healthy while Vercel's stale-while-revalidate window rolls
    // clients onto the interactive renderer.
    for (const renderer of [island, overlayIsland]) {
      if (typeof renderer?.setPointer === "function") renderer.setPointer(pointer.x, pointer.y);
    }
  };
  const onPointerMove = event => {
    pendingPointer = {
      x: Math.max(-1, Math.min(1, (event.clientX / win.innerWidth) * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY / win.innerHeight) * 2 - 1)),
    };
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(applyPointer);
  };
  const resetPointer = event => {
    if (event?.type === "pointerout" && event.relatedTarget) return;
    pendingPointer = { x: 0, y: 0 };
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(applyPointer);
  };
  const sync = () => {
    if (destroyed) return;
    const state = getState();
    const preset = SHADER_BACKDROP_PRESETS[state.theme];
    host.dataset.preset = preset.name;
    island.update(state);
    if (overlayHost && overlayIsland) {
      overlayHost.dataset.preset = preset.name;
      overlayIsland.update(state);
    }
    applyPointer();
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion", "data-motion-preference"] });
  reducedQuery?.addEventListener?.("change", sync);
  finePointerQuery?.addEventListener?.("change", sync);
  win.addEventListener("pointermove", onPointerMove, { passive: true });
  win.addEventListener("pointerout", resetPointer, { passive: true });
  win.addEventListener("blur", resetPointer);

  const markReady = () => {
    if (destroyed || !host.querySelector("canvas") || (overlayHost && !overlayHost.querySelector("canvas"))) return win.requestAnimationFrame(markReady);
    root.classList.add("has-shader-backdrop");
    host.classList.add("is-ready");
    overlayHost?.classList.add("is-ready");
  };
  win.requestAnimationFrame(markReady);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    reducedQuery?.removeEventListener?.("change", sync);
    finePointerQuery?.removeEventListener?.("change", sync);
    win.removeEventListener("pointermove", onPointerMove);
    win.removeEventListener("pointerout", resetPointer);
    win.removeEventListener("blur", resetPointer);
    if (pointerFrame) win.cancelAnimationFrame(pointerFrame);
    win.removeEventListener("pagehide", destroy);
    island.destroy();
    overlayIsland?.destroy();
    host.remove();
    overlayHost?.remove();
    root.classList.remove("has-shader-backdrop");
  };
  win.addEventListener("pagehide", destroy, { once: true });
  sync();
  return { destroy, get preset() { return host.dataset.preset; } };
}
