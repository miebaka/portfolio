/**
 * Optional Work-only Three.js enhancement.
 *
 * Loading this bundle during first paint causes expensive GPU shader setup
 * and a measurable main-thread penalty. Native HTML/CSS is the fast, complete
 * first view. Only progressive visitor interaction opts into real-time 3D.
 */
const cabinet = document.querySelector("[data-project-archive]");
const well = cabinet?.querySelector(".filing-cabinet__well");
const constrained = navigator.connection?.saveData ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);

// Three.js r187 requires WebGL2. Browsers with only WebGL1 keep CSS.
if (well && !constrained && window.WebGLRenderingContext && window.WebGL2RenderingContext) {
  let started = false;
  let settleTimer = 0;

  function disposeTriggers() {
    well.removeEventListener("pointerenter", load);
    well.removeEventListener("focusin", load);
    window.removeEventListener("scroll", onScroll);
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = 0;
  }

  function load() {
    if (started) return;
    started = true;
    disposeTriggers();
    void import("../../assets/runtime/work-cabinet-three.js").catch(error => {
      // Ordinary case-study links and the complete CSS archive still work.
      console.warn("Optional 3D Work cabinet failed to load", error);
    });
  }

  function onScroll() {
    if (started) return;
    const bounds = well.getBoundingClientRect();
    if (bounds.bottom < -100 || bounds.top > window.innerHeight + 100) return;
    // Debounce. Do not compile shaders in the middle of an active scroll.
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(load, 180);
  }

  // No observer-only auto-start. Merely visiting Work must not incur the
  // rendering cost, even if a tall desktop viewport includes the drawer.
  well.addEventListener("pointerenter", load, { passive: true });
  well.addEventListener("focusin", load);
  window.addEventListener("scroll", onScroll, { passive: true });
}
