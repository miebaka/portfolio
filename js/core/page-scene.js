/* ==========================================================================
   page-scene.js — Ambient pixel field across all pages.

   Sparse 2 × 2 px cells on a 10 px pitch, driven by a slow organic
   flow-field. A 60-second left→right traveling wave periodically sweeps
   a brighter band across the field like a subtle progress timer.

   Canvas sits at z-index 0 with pointer-events: none; the nav (z=50) and
   menu overlay (z=100) both paint above it.
   ========================================================================== */

const CELL  = 2;
const GAP   = 8;
const PITCH = CELL + GAP;  /* 10 px pitch — sparser than the menu (4 px) */
const HALF  = CELL >> 1;   /* 1 */

/* Physics — very lazy, dust-mote feel */
const SPRING  = 0.007;
const DAMPING = 0.96;
const DRIFT   = 0.003;

/* Opacity */
const REST_A     = 0.055;  /* visible grain at rest                  */
const PULSE_AMP  = 0.008;  /* per-cell breathe ±0.8 %                */
const SHIMMER_A  = 0.012;  /* extra opacity from displacement         */

/* 60-second sweep wave */
const WAVE_PERIOD = 60_000;   /* ms — full left-to-right cycle         */
const WAVE_HW_F   = 0.08;     /* half-width as fraction of viewport    */
const WAVE_BOOST  = 0.20;     /* peak extra opacity at wave crest      */

export function initPageScene() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position:      "fixed",
    inset:         "0",
    width:         "100%",
    height:        "100%",
    zIndex:        "0",
    pointerEvents: "none",
  });

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  document.body.prepend(canvas);

  let w = 0, h = 0;
  let imageData, buf;
  let cells   = [];
  let fg      = [22, 20, 15];
  let raf     = 0;
  let running = false;

  function themeColor() {
    return document.documentElement.dataset.theme === "dark"
      ? [237, 233, 225]
      : [22, 20, 15];
  }

  function buildGrid() {
    cells = [];
    const ox = PITCH / 2;
    const oy = PITCH / 2;
    for (let hy = oy; hy < h; hy += PITCH) {
      for (let hx = ox; hx < w; hx += PITCH) {
        cells.push({
          hx, hy,
          x:  hx + (Math.random() - 0.5) * PITCH,
          y:  hy + (Math.random() - 0.5) * PITCH,
          vx: 0, vy: 0,
          ph: Math.random() * Math.PI * 2,
          sp: SPRING  + (Math.random() - 0.5) * 0.002,
          dm: DAMPING + (Math.random() - 0.5) * 0.015,
        });
      }
    }
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width  = w;
    canvas.height = h;
    imageData = ctx.createImageData(w, h);
    buf = imageData.data;
    buildGrid();
  }

  function loop(t) {
    if (!running) return;

    buf.fill(0);
    const [r8, g8, b8] = fg;

    /* 60-second traveling wave — bell sweeps from left edge to right */
    const waveHW    = WAVE_HW_F * w;
    const waveTravel = w + 2 * waveHW;
    const waveFront  = ((t % WAVE_PERIOD) / WAVE_PERIOD) * waveTravel - waveHW;

    for (const c of cells) {
      /* Organic flow-field drift */
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph)       * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

      /* Spring toward home */
      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;

      /* Damp + integrate */
      c.vx *= c.dm;
      c.vy *= c.dm;
      c.x  += c.vx;
      c.y  += c.vy;

      /* Hard clamp */
      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      /* Per-cell breathe pulse */
      const pulse = Math.sin(t * 0.00035 + c.ph) * PULSE_AMP;

      /* Displacement shimmer */
      const disp    = Math.hypot(c.x - c.hx, c.y - c.hy);
      const shimmer = Math.min(disp / 10, 1) * SHIMMER_A;

      /* Wave contribution — cosine bell centred on waveFront */
      const dd = c.hx - waveFront;
      const wave = Math.abs(dd) < waveHW
        ? (0.5 + 0.5 * Math.cos((dd / waveHW) * Math.PI)) * WAVE_BOOST
        : 0;

      const alpha = Math.max(0, REST_A + pulse + shimmer + wave);

      /* Write 2 × 2 pixel block */
      const px = Math.round(c.x) - HALF;
      const py = Math.round(c.y) - HALF;
      const a8 = Math.min(255, (alpha * 255 + 0.5) | 0);

      let i = (py * w + px) << 2;
      buf[i] = r8; buf[i + 1] = g8; buf[i + 2] = b8; buf[i + 3] = a8;
      i += 4;
      buf[i] = r8; buf[i + 1] = g8; buf[i + 2] = b8; buf[i + 3] = a8;
      i = ((py + 1) * w + px) << 2;
      buf[i] = r8; buf[i + 1] = g8; buf[i + 2] = b8; buf[i + 3] = a8;
      i += 4;
      buf[i] = r8; buf[i + 1] = g8; buf[i + 2] = b8; buf[i + 3] = a8;
    }

    ctx.putImageData(imageData, 0, 0);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    fg = themeColor();
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
    else start();
  });

  new MutationObserver(() => { fg = themeColor(); })
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  window.addEventListener("resize", () => {
    if (!running) return;
    pause();
    resize();
    start();
  }, { passive: true });

  resize();
  start();
}
