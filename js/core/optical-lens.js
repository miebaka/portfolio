/* Kexsio-inspired optical tension for the existing Selected Work artwork.
   No React, second WebGL context, infinite RAF loop, or altered link target. */
import { isMotionReduced } from "./motion-language.js";
export function initHomeOpticalLens({
  document: doc = document, window: win = window,
} = {}) {
  const list = doc.querySelector('body[data-page="home"] .home-project-list .editorial-index');
  if (!list) return null;
  const pairs = [...list.querySelectorAll(".editorial-index__row")]
    .map(row => ({ row, image: row.querySelector(".home-project-list__visual") }))
    .filter(item => item.image);
  if (!pairs.length) return null;

  const motion = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const mouse = win.matchMedia?.("(hover: hover) and (pointer: fine)");
  const isReduced = () => isMotionReduced(doc.documentElement, motion);
  let scheduled = 0;
  let destroyed = false;
  const paint = () => {
    scheduled = 0;
    if (destroyed) return;
    const half = Math.max(win.innerHeight * .75, 1);
    for (const { row, image } of pairs) {
      const rect = row.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const near = 1 - Math.min(1, Math.abs(center - win.innerHeight * .52) / half);
      const intensity = isReduced() ? 0 : near;
      image.style.setProperty("--optical-shoulder", (1 + intensity * 1.4).toFixed(2) + "%");
      image.style.setProperty("--optical-waist", (2 + intensity * 3.5).toFixed(2) + "%");
    }
  };
  const schedule = () => {
    if (!scheduled && !destroyed) scheduled = win.requestAnimationFrame(paint);
  };
  const onMove = event => {
    if (!mouse?.matches || isReduced() || event.pointerType === "touch") return;
    const row = event.target.closest?.(".editorial-index__row");
    if (!row || !list.contains(row)) return;
    const image = row.querySelector(".home-project-list__visual");
    if (!image) return;
    const rect = row.getBoundingClientRect();
    image.style.setProperty("--optical-x", ((event.clientX - rect.left) / Math.max(1, rect.width) - .5) * 12 + "px");
    image.style.setProperty("--optical-y", ((event.clientY - rect.top) / Math.max(1, rect.height) - .5) * 12 + "px");
  };
  const onLeave = event => {
    const image = event.target.closest?.(".editorial-index__row")?.querySelector(".home-project-list__visual");
    if (image) {
      image.style.removeProperty("--optical-x");
      image.style.removeProperty("--optical-y");
    }
  };
  win.addEventListener("scroll", schedule, { passive: true });
  win.addEventListener("resize", schedule, { passive: true });
  list.addEventListener("pointermove", onMove, { passive: true });
  list.addEventListener("pointerout", onLeave, { passive: true });
  motion?.addEventListener?.("change", schedule);
  mouse?.addEventListener?.("change", schedule);
  const attrObserver = new MutationObserver(schedule);
  attrObserver.observe(doc.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  const destroy = () => {
    destroyed = true;
    win.cancelAnimationFrame(scheduled);
    win.removeEventListener("scroll", schedule);
    win.removeEventListener("resize", schedule);
    list.removeEventListener("pointermove", onMove);
    list.removeEventListener("pointerout", onLeave);
    motion?.removeEventListener?.("change", schedule);
    mouse?.removeEventListener?.("change", schedule);
    attrObserver.disconnect();
    pairs.forEach(({ image }) => ["--optical-shoulder", "--optical-waist", "--optical-x", "--optical-y"].forEach(key => image.style.removeProperty(key)));
  };
  win.addEventListener("pagehide", destroy, { once: true });
  schedule();
  return { destroy };
}
