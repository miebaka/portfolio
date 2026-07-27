/* ==========================================================================
   cursor-field.js — ink bleed + halftone, merged into one surface.

   A single fixed element follows the pointer. It carries two background
   layers: a soft clay bloom that moves with it, and a dot grid that is
   locked to the viewport via background-attachment. A static radial mask
   gives the whole thing a soft edge. The net effect is a warm patch of paper
   that develops visible grain where you point, and is completely absent
   everywhere else.

   Why the layers are stacked this way: the bloom is the light, and the dots
   are texture the light falls on. If the dots travelled with the pointer they
   would read as a cursor decoration; locked to the viewport they read as
   texture that was always in the paper and is only now being lit.

   Cost: the element never changes size and only ever animates transform and
   opacity, so there is no per-frame repaint of a full-viewport layer and no
   canvas. The rAF loop stops itself once the position has settled.
   ========================================================================== */

/* Fraction of the remaining distance covered per frame. Low enough that the
   patch visibly trails the cursor, which is what sells it as ink soaking
   through rather than a shape pinned to the mouse. */
const LERP = 0.085;
/* Below this, the patch is close enough that further frames are wasted work */
const SETTLE = 0.4;

export function initCursorField() {
  /* Pointer-driven and decorative: no touch, and nothing under reduced
     motion. matchMedia is checked live rather than cached so a user turning
     reduced motion on mid-session is respected on the next page. */
  if (!window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const el = document.createElement("div");
  el.className = "cursor-field";
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);

  let tx = 0, ty = 0;   /* pointer target   */
  let cx = 0, cy = 0;   /* current position */
  let raf = 0;
  let seen = false;     /* has the pointer moved at least once */

  /* Dot pitch, read once from the stylesheet so the two stay in step. */
  const PITCH = parseFloat(getComputedStyle(el).getPropertyValue("--_pitch")) || 10;

  function place() {
    el.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    /* Cancel the element's own movement for the dot layer so the grid stays
       registered to the viewport. Wrapping to one tile keeps the repainted
       region to a single cell instead of the whole element. */
    const gx = (((-cx % PITCH) + PITCH) % PITCH).toFixed(1);
    const gy = (((-cy % PITCH) + PITCH) % PITCH).toFixed(1);
    el.style.setProperty("--gx", gx + "px");
    el.style.setProperty("--gy", gy + "px");
  }

  function frame() {
    raf = 0;
    cx += (tx - cx) * LERP;
    cy += (ty - cy) * LERP;
    place();
    if (Math.abs(tx - cx) > SETTLE || Math.abs(ty - cy) > SETTLE) {
      raf = requestAnimationFrame(frame);
    }
  }

  function tick() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    tx = e.clientX;
    ty = e.clientY;
    if (!seen) {
      /* Jump to the first known position instead of sliding in from 0,0,
         which would drag the patch across the whole page on load. */
      seen = true;
      cx = tx;
      cy = ty;
      place();
      el.classList.add("is-lit");
    }
    tick();
  }, { passive: true });

  /* Leaving the window kills the light rather than stranding it at the edge */
  document.addEventListener("pointerleave", () => el.classList.remove("is-lit"));
  document.addEventListener("pointerenter", () => { if (seen) el.classList.add("is-lit"); });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
}
