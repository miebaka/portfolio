/**
 * Lazy Work-only rendering entry. Normal HTML stays interactive while the
 * optional Three.js bundle is fetched near the filing cabinet viewport.
 */
const cabinet = document.querySelector("[data-project-archive]");
const well = cabinet?.querySelector(".filing-cabinet__well");
const constrained = navigator.connection?.saveData ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
if (well && !constrained && window.WebGLRenderingContext) {
  let started = false;
  let observer;
  const load = () => {
    if (started) return;
    started = true;
    observer?.disconnect();
    void import("../../assets/runtime/work-cabinet-three.js").catch(error => {
      console.warn("Optional 3D Work cabinet failed to load; native links remain available", error);
    });
  };
  if (typeof IntersectionObserver === "function") {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) load();
    }, { rootMargin: "300px" });
    observer.observe(well);
  } else load();
}
