/* interactions.js — ink-bleed spotlight on work cards + magnetic nav buttons.
   Both effects are pointer-only and degrade cleanly on touch devices. */

const MAG_THRESH   = 80;   /* px from button centre — enter magnetic zone */
const MAG_STRENGTH = 0.38; /* fraction of cursor offset applied to button */
const MAG_LERP     = 0.12; /* lerp speed toward/away from magnetic target */

export function initInteractions() {
  initInkBleed();
  initMagneticButtons();
}

/* ── Ink bleed ────────────────────────────────────────────────────────
   Tracks cursor position within each card as CSS custom properties
   (--mx / --my in %). The CSS ::after radial-gradient uses these to
   position a soft spotlight that follows the cursor. */

function initInkBleed() {
  const cards = document.querySelectorAll(".sl-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left)  / r.width)  * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top)   / r.height) * 100}%`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });
}

/* ── Magnetic buttons ─────────────────────────────────────────────────
   Global mousemove updates a shared cursor position; a rAF loop lerps
   each button toward the cursor when inside MAG_THRESH, and back to
   origin when outside. No CSS transition needed — rAF lerp IS the
   easing, which avoids fighting the browser's own transition timing. */

function initMagneticButtons() {
  const btns = [
    ...document.querySelectorAll(".btn"),
    ...document.querySelectorAll(".back-btn"),
  ];
  if (!btns.length) return;

  const state   = btns.map(() => ({ tx: 0, ty: 0, cx: 0, cy: 0 }));
  const pressed = new Set();
  let mouseX    = 0;
  let mouseY    = 0;
  let hasPtr    = false;

  btns.forEach(btn => {
    btn.addEventListener("pointerdown",   () => pressed.add(btn),    { passive: true });
    btn.addEventListener("pointerup",     () => pressed.delete(btn), { passive: true });
    btn.addEventListener("pointercancel", () => pressed.delete(btn), { passive: true });
    btn.addEventListener("pointerleave",  () => pressed.delete(btn), { passive: true });
  });

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasPtr = true;
  }, { passive: true });

  (function tick() {
    requestAnimationFrame(tick);
    if (!hasPtr) return;

    btns.forEach((btn, i) => {
      const s  = state[i];
      const r  = btn.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = mouseX - cx;
      const dy = mouseY - cy;

      if (Math.hypot(dx, dy) < MAG_THRESH) {
        s.tx = dx * MAG_STRENGTH;
        s.ty = dy * MAG_STRENGTH;
      } else {
        s.tx = 0;
        s.ty = 0;
      }

      s.cx += (s.tx - s.cx) * MAG_LERP;
      s.cy += (s.ty - s.cy) * MAG_LERP;

      const scale = pressed.has(btn) ? " scale(0.97)" : "";
      const hasMag = Math.abs(s.cx) > 0.05 || Math.abs(s.cy) > 0.05;
      btn.style.transform = hasMag
        ? `translate(${s.cx.toFixed(2)}px,${s.cy.toFixed(2)}px)${scale}`
        : scale || "";
    });
  })();
}
