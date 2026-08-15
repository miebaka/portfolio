/* hero-parallax.js — a subtle depth drift on the hero portrait.

   As the page scrolls, the portrait lags the content by a few pixels, so the
   two read as separate planes (the layered-parallax trick, one element). The
   drift is written to a custom property the CSS turns into a transform; the
   scroll listener only runs while the hero is on screen, and reduced motion
   opts out entirely. Transform only — compositor-friendly, no layout. */

const MAX_DRIFT = 24; /* px the portrait lags at the point the hero leaves view */

export function initHeroParallax() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* Desktop only: the mobile hero is a short stacked column where drifting the
     portrait would crop it against its own overflow. */
  if (window.matchMedia("(max-width: 760px)").matches) return;
  const hero = document.querySelector(".hero-noir");
  const picture = hero && hero.querySelector(".hero-noir__picture");
  if (!picture) return;

  let raf = 0;
  let active = false;

  function update() {
    raf = 0;
    const rect = hero.getBoundingClientRect();
    /* 0 while the hero fills the top of the viewport, 1 once it has scrolled a
       full viewport height up. Clamped so it never overshoots. */
    const progress = Math.min(Math.max(-rect.top / window.innerHeight, 0), 1);
    picture.style.setProperty("--parallax-y", (progress * MAX_DRIFT).toFixed(1) + "px");
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(update); }

  /* Only listen while the hero is anywhere near the viewport. */
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !active) {
      active = true;
      window.addEventListener("scroll", onScroll, { passive: true });
      update();
    } else if (!entry.isIntersecting && active) {
      active = false;
      window.removeEventListener("scroll", onScroll);
    }
  });
  io.observe(hero);
}
