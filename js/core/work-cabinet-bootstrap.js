/**
 * Optional Work-only 3D enhancement. Real links and CSS paper render first;
 * expensive WebGL compilation never runs on the initial navigation.
 */
const cabinet = document.querySelector("[data-project-archive]");
const well = cabinet?.querySelector(".filing-cabinet__well");
const reducedMotion = document.documentElement.dataset.motion === "reduced" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const constrained = navigator.connection?.saveData ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) ||
  (navigator.deviceMemory && navigator.deviceMemory <= 2) ||
  reducedMotion ||
  window.matchMedia("(forced-colors: active)").matches;

if (well && !constrained && window.WebGLRenderingContext && window.WebGL2RenderingContext) {
  let started = false;
  let settleTimer = 0;

  function inViewport() {
    const bounds = well.getBoundingClientRect();
    return bounds.bottom > 0 && bounds.top < window.innerHeight &&
      document.visibilityState !== "hidden";
  }

  function disposeTriggers() {
    well.removeEventListener("pointerenter", onPointerEnter);
    well.removeEventListener("focusin", load);
    window.removeEventListener("scroll", onScroll);
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = 0;
  }

  function load() {
    if (started) return;
    started = true;
    disposeTriggers();
    const importScene = () => {
      void import("../../assets/runtime/work-cabinet-three.js").catch(error => {
        // Navigation, focus and responsive CSS remain independent of WebGL.
        console.warn("Optional 3D Work cabinet failed to load", error);
      });
    };
    // Let the browser paint the immediate hover/focus/scroll response before
    // parsing Three.js, allocating textures and compiling shaders.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(importScene, { timeout: 1500 });
    } else {
      setTimeout(importScene, 64);
    }
  }

  function onPointerEnter() {
    // Scrolling can place the drawer under a stationary cursor: don't compile.
    if (!cabinet.classList.contains("is-scrolling")) load();
  }

  function onScroll() {
    if (started) return;
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = 0;
    if (!inViewport()) return;
    // The visitor must still be looking at this drawer after scroll settles.
    settleTimer = setTimeout(() => {
      settleTimer = 0;
      if (inViewport()) load();
    }, 220);
  }

  well.addEventListener("pointerenter", onPointerEnter, { passive: true });
  well.addEventListener("focusin", load);
  window.addEventListener("scroll", onScroll, { passive: true });
}
