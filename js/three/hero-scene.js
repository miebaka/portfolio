/* ==========================================================================
   hero-scene.js — Parallax pan on the portrait using CSS transform.

   No WebGL — the browser renders the <img> with full native colour management
   so the photo looks exactly as shot. Mouse/gyro moves translate the img
   within its overflow-hidden container to create the depth effect.
   ========================================================================== */

export function initHeroScene() {
  const portrait = document.querySelector("[data-hero-portrait]");
  if (!portrait) return;

  let cx = 0, cy = 0, tx = 0, ty = 0;
  const RANGE = 20;  // px of travel at full deflection (image oversized by this)
  const EASE  = 0.06;

  window.addEventListener("pointermove", (e) => {
    tx = (e.clientX / window.innerWidth  - 0.5) * RANGE * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * RANGE * 2;
  });

  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    tx = clamp(e.gamma  / 45, -1, 1) * RANGE;
    ty = clamp((e.beta - 45) / 45, -1, 1) * RANGE;
  });

  const tick = () => {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    portrait.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(tick);
  };
  tick();
}
