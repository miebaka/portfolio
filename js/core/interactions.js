/* interactions.js — ink-bleed spotlight on work cards + magnetic buttons.
   Both effects are pointer-only and degrade cleanly on touch devices. */

const MAG_STRENGTH = 0.28; /* fraction of cursor offset applied to the button */
const MAG_LERP     = 0.16; /* lerp speed toward/away from the magnetic target */

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
   caption below the field, so using its box would put the spotlight's origin
   off by the caption's height. */

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
   Scoped to primary CTAs and the floating back button. The effect means
   "this is the thing to press", which it stops meaning if everything on the
   page does it.

   Everything is driven by the button's own pointer events. There is no global
   mousemove handler, no scroll listener, and no per-frame getBoundingClientRect
   across every button — the geometry is read once on pointerenter and is valid
   for the whole hover, because leaving the button (including because the page
   scrolled out from under the cursor) fires pointerleave and ends it.

   The rAF loop only runs while a button is actually engaged, and stops itself
   once every button has settled back to rest. */

function initMagneticButtons() {
  const btns = [
    ...document.querySelectorAll(".btn--primary"),
    ...document.querySelectorAll(".back-btn"),
  ];
  if (!btns.length) return;

  const active = new Map(); /* button -> { cx, cy, tx, ty, pressed } */
  let raf = 0;

  function frame() {
    raf = 0;
    let moving = false;

    active.forEach((s, btn) => {
      s.cx += (s.tx - s.cx) * MAG_LERP;
      s.cy += (s.ty - s.cy) * MAG_LERP;

      const settled = Math.abs(s.cx) < 0.05 && Math.abs(s.cy) < 0.05 &&
                      s.tx === 0 && s.ty === 0;
      if (settled) {
        btn.style.transform = s.pressed ? "scale(0.97)" : "";
        active.delete(btn);
        return;
      }

      moving = true;
      const scale = s.pressed ? " scale(0.97)" : "";
      btn.style.transform =
        `translate(${s.cx.toFixed(2)}px,${s.cy.toFixed(2)}px)${scale}`;
    });

    if (moving) raf = requestAnimationFrame(frame);
  }

  function ensureFrame() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function stateFor(btn) {
    let s = active.get(btn);
    if (!s) {
      s = { cx: 0, cy: 0, tx: 0, ty: 0, pressed: false, rect: null };
      active.set(btn, s);
    }
    return s;
  }

  btns.forEach((btn) => {
    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      const s = stateFor(btn);
      /* One layout read per hover, not one per frame */
      s.rect = btn.getBoundingClientRect();
    });

    btn.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const s = stateFor(btn);
      if (!s.rect) s.rect = btn.getBoundingClientRect();
      s.tx = (e.clientX - (s.rect.left + s.rect.width  / 2)) * MAG_STRENGTH;
      s.ty = (e.clientY - (s.rect.top  + s.rect.height / 2)) * MAG_STRENGTH;
      ensureFrame();
    }, { passive: true });

    btn.addEventListener("pointerleave", () => {
      const s = active.get(btn);
      if (!s) return;
      s.tx = 0;
      s.ty = 0;
      s.pressed = false;
      s.rect = null;
      ensureFrame();
    }, { passive: true });

    const press = (on) => () => {
      const s = stateFor(btn);
      s.pressed = on;
      ensureFrame();
    };
    btn.addEventListener("pointerdown", press(true), { passive: true });
    btn.addEventListener("pointerup", press(false), { passive: true });
    btn.addEventListener("pointercancel", press(false), { passive: true });
  });
}
