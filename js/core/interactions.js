/* interactions.js — ink-bleed spotlight on work cards + magnetic buttons.
   Both effects are pointer-only and degrade cleanly on touch devices. */

const MAG_THRESH   = 64;   /* px from button centre — enter magnetic zone */
const MAG_STRENGTH = 0.24; /* fraction of cursor offset applied to button */
const MAG_LERP     = 0.14; /* lerp speed toward/away from magnetic target */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initInteractions() {
  initInkBleed();
  if (!reduceMotion) initMagneticButtons();
}

/* ── Ink bleed ────────────────────────────────────────────────────────
   Tracks cursor position within each card's colour field as CSS custom
   properties (--mx / --my in %). The ::after radial-gradient uses these to
   position a soft spotlight that follows the cursor.

   Measured against the frame, not the card: the card also contains the
   caption below the field, and using its box would put the spotlight's
   origin off by the caption's height. */

function initInkBleed() {
  const cards = document.querySelectorAll(".sl-card");
  if (!cards.length) return;

  cards.forEach((card) => {
    const frame = card.querySelector(".sl-card__frame");
    if (!frame) return;

    card.addEventListener("pointermove", (e) => {
      const r = frame.getBoundingClientRect();
      card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width)  * 100}%`);
      card.style.setProperty("--my", `${((e.clientY - r.top)  / r.height) * 100}%`);
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    }, { passive: true });
  });
}

/* ── Magnetic buttons ─────────────────────────────────────────────────
   Scoped deliberately to primary CTAs and the floating back button — the
   effect means "this is the thing to press", which it stops meaning if
   everything on the page does it.

   Geometry is cached and only re-read on scroll/resize. Reading
   getBoundingClientRect() for every button on every frame forces a layout
   flush 60 times a second, which is exactly the kind of jank a magnetic
   button is supposed to be hiding. */

function initMagneticButtons() {
  const btns = [
    ...document.querySelectorAll(".btn--primary"),
    ...document.querySelectorAll(".back-btn"),
  ];
  if (!btns.length) return;

  const state   = btns.map(() => ({ tx: 0, ty: 0, cx: 0, cy: 0, mx: 0, my: 0 }));
  const pressed = new Set();
  let mouseX = 0;
  let mouseY = 0;
  let hasPtr = false;

  /* Cache each button's centre with its transform temporarily cleared, so a
     button already displaced by the effect doesn't report a moving centre and
     chase itself across the screen. */
  function measure() {
    btns.forEach((btn, i) => {
      const prev = btn.style.transform;
      btn.style.transform = "none";
      const r = btn.getBoundingClientRect();
      btn.style.transform = prev;
      state[i].mx = r.left + r.width  / 2;
      state[i].my = r.top  + r.height / 2;
    });
  }

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

  let queued = false;
  const remeasure = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { measure(); queued = false; });
  };
  window.addEventListener("scroll", remeasure, { passive: true });
  window.addEventListener("resize", remeasure, { passive: true });

  measure();

  (function tick() {
    requestAnimationFrame(tick);
    if (!hasPtr) return;

    btns.forEach((btn, i) => {
      const s  = state[i];
      const dx = mouseX - s.mx;
      const dy = mouseY - s.my;

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
