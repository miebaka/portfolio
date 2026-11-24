/* Proof-sheet lift: progress, rotating identity, then upward curtain.
   No permanent overlay: reduced motion, BFCache and timeout all release it. */
export function initPageLoader() {
  const root = document.documentElement;
  if (root.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches || location.hash) return;
  const el = document.createElement("div");
  el.className = "page-loader";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = '<div class="page-loader__panel"></div><div class="page-loader__ui"><span class="page-loader__mark"></span><span class="page-loader__count">0%</span></div>';
  document.body.prepend(el);
  const count = el.querySelector(".page-loader__count");
  const start = performance.now();
  let ready = false, opened = false, frame = 0;
  const release = () => {
    if (opened) return;
    opened = true;
    cancelAnimationFrame(frame);
    count.textContent = "100%";
    el.classList.add("is-opening");
    setTimeout(() => el.remove(), 1650);
  };
  const tick = now => {
    const elapsed = now - start;
    count.textContent = Math.min(ready ? 100 : 95, Math.floor(elapsed / 12)) + "%";
    if (elapsed >= 600 && ready || elapsed > 2500) release();
    else frame = requestAnimationFrame(tick);
  };
  Promise.race([Promise.all([document.fonts?.ready, document.readyState === "complete" ? Promise.resolve() : new Promise(resolve => addEventListener("load", resolve, {once:true}))]), new Promise(resolve => setTimeout(resolve, 1800))]).then(() => { ready = true; });
  frame = requestAnimationFrame(tick);
  setTimeout(release, 2600);
  addEventListener("pageshow", event => { if (event.persisted) { cancelAnimationFrame(frame); el.remove(); opened = true; } });
}
