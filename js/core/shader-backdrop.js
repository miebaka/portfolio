const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

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

function resolvedState(root, reducedQuery, navigatorObject) {
  const theme = root.dataset.theme === "dark" ? "dark" : "light";
  const explicit = root.dataset.motionPreference;
  const reduced = explicit === "reduce" ||
    (explicit !== "full" && reducedQuery?.matches) ||
    navigatorObject?.connection?.saveData === true ||
    navigatorObject?.webdriver === true;
  return { theme, reduced };
}

function waitForActivation(win, immediate) {
  if (immediate) return Promise.resolve();
  return new Promise(resolve => {
    const events = ["pointerdown", "keydown", "scroll"];
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
  const automationOptIn = testOptIn || parameters.has("shader-perf");
  if (!doc?.body || !win || doc.body.dataset.page !== "home" ||
      (navigatorObject?.webdriver === true && !automationOptIn) ||
      doc.querySelector("[data-shader-backdrop]")) return null;

  await waitForActivation(win, testOptIn);

  const root = doc.documentElement;
  const reducedQuery = win.matchMedia?.(REDUCED_MOTION);
  const host = doc.createElement("div");
  host.className = "shader-backdrop";
  host.dataset.shaderBackdrop = "";
  host.setAttribute("aria-hidden", "true");
  doc.body.prepend(host);

  let rendererModule;
  try { rendererModule = await loadRenderer(); }
  catch (error) { host.remove(); console.warn("Shader backdrop unavailable", error); return null; }

  let island;
  try { island = rendererModule.mountShaderGradient(host, resolvedState(root, reducedQuery, navigatorObject)); }
  catch (error) { host.remove(); console.warn("Shader backdrop unavailable", error); return null; }

  let destroyed = false;
  const sync = () => {
    if (destroyed) return;
    const state = resolvedState(root, reducedQuery, navigatorObject);
    const preset = SHADER_BACKDROP_PRESETS[state.theme];
    host.dataset.preset = preset.name;
    island.update(state);
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-motion", "data-motion-preference"] });
  reducedQuery?.addEventListener?.("change", sync);

  const markReady = () => {
    if (destroyed || !host.querySelector("canvas")) return win.requestAnimationFrame(markReady);
    root.classList.add("has-shader-backdrop");
    host.classList.add("is-ready");
  };
  win.requestAnimationFrame(markReady);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    observer.disconnect();
    reducedQuery?.removeEventListener?.("change", sync);
    win.removeEventListener("pagehide", destroy);
    island.destroy();
    host.remove();
    root.classList.remove("has-shader-backdrop");
  };
  win.addEventListener("pagehide", destroy, { once: true });
  sync();
  return { destroy, get preset() { return host.dataset.preset; } };
}
