/* Proof-sheet lift: progress, rotating identity, then upward curtain.
   No permanent overlay: reduced motion, BFCache and timeout all release it. */
export function renderPageLoaderMarkup() {
  return '<div class="page-loader" aria-hidden="true"><div class="page-loader__panel"></div><div class="page-loader__ui"><span class="page-loader__mark"></span><span class="page-loader__count">0%</span></div></div>';
}
export function initPageLoader() {
  const root = document.documentElement;
  let el = document.querySelector(".page-loader");
  if (root.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches || location.hash) { el?.remove(); return; }
  if (!el) {
    document.body.insertAdjacentHTML("afterbegin", renderPageLoaderMarkup());
    el = document.querySelector(".page-loader");
  }
  const count = el.querySelector(".page-loader__count");
  const start = performance.now();
  let ready = false, opened = false, frame = 0, progress = 0;
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
    const target = ready ? 100 : Math.min(94, elapsed / 16);
    progress += (target - progress) * .12;
    count.textContent = Math.floor(progress) + "%";
    if ((elapsed >= 600 && ready && progress >= 98) || elapsed > 2500) release();
    else frame = requestAnimationFrame(tick);
  };
  Promise.race([Promise.all([document.fonts?.ready, document.readyState === "complete" ? Promise.resolve() : new Promise(resolve => addEventListener("load", resolve, {once:true}))]), new Promise(resolve => setTimeout(resolve, 1800))]).then(() => { ready = true; });
  frame = requestAnimationFrame(tick);
  setTimeout(release, 2600);
  addEventListener("pageshow", event => { if (event.persisted) { cancelAnimationFrame(frame); el.remove(); opened = true; } });
}
