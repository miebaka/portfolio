/* ==========================================================================
   hero-scene.js — Parallax pan on the portrait + ambient grain overlay.

   Parallax: mouse/gyro translates the <img> within its overflow-hidden
   container for a depth effect. No WebGL — native colour management.

   Grain: a 2D canvas injected inside .hero-noir__picture with
   mix-blend-mode:multiply composites the same pixel-dot pattern as
   page-scene directly on top of the portrait photo at ~5.5% opacity.
   ========================================================================== */

export function initHeroScene() {
  initParallax();
  initPortraitGrain();
}

function initParallax() {
  const portrait = document.querySelector("[data-hero-portrait]");
  if (!portrait) return;

  let cx = 0, cy = 0, tx = 0, ty = 0;
  const RANGE = 20;
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

function initPortraitGrain() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const picture = document.querySelector(".hero-noir__picture");
  if (!picture) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position:      "absolute",
    inset:         "0",
    width:         "100%",
    height:        "100%",
    zIndex:        "1",
    mixBlendMode:  "multiply",
    pointerEvents: "none",
  });
  picture.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const PITCH = 10, HALF = 1;
  const SPRING = 0.007, DAMPING = 0.96, DRIFT = 0.003;
  const REST_A = 0.055, PULSE_AMP = 0.008, SHIMMER_A = 0.012;
  const WAVE_PERIOD = 60_000, WAVE_HW_F = 0.08, WAVE_BOOST = 0.20;

  let w = 0, h = 0, cells = [], imageData, buf, rafId = 0;

  function buildGrid() {
    cells = [];
    const o = PITCH / 2;
    for (let hy = o; hy < h; hy += PITCH) {
      for (let hx = o; hx < w; hx += PITCH) {
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

  function resize(nw, nh) {
    if (!nw || !nh) return;
    w = nw; h = nh;
    canvas.width  = w;
    canvas.height = h;
    imageData = ctx.createImageData(w, h);
    buf = imageData.data;
    buildGrid();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function loop(t) {
    rafId = 0;
    if (!buf) return;
    buf.fill(0);

    const waveHW    = WAVE_HW_F * w;
    const waveFront = ((t % WAVE_PERIOD) / WAVE_PERIOD) * (w + 2 * waveHW) - waveHW;

    for (const c of cells) {
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph)       * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;
      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;
      c.vx *= c.dm; c.vy *= c.dm;
      c.x  += c.vx; c.y  += c.vy;

      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      const pulse   = Math.sin(t * 0.00035 + c.ph) * PULSE_AMP;
      const disp    = Math.hypot(c.x - c.hx, c.y - c.hy);
      const shimmer = Math.min(disp / 10, 1) * SHIMMER_A;
      const dd      = c.hx - waveFront;
      const wave    = Math.abs(dd) < waveHW
        ? (0.5 + 0.5 * Math.cos((dd / waveHW) * Math.PI)) * WAVE_BOOST : 0;
      const alpha   = Math.max(0, REST_A + pulse + shimmer + wave);

      const px = Math.round(c.x) - HALF;
      const py = Math.round(c.y) - HALF;
      const a8 = Math.min(255, (alpha * 255 + 0.5) | 0);

      let i = (py * w + px) << 2;
      buf[i] = 22; buf[i+1] = 20; buf[i+2] = 15; buf[i+3] = a8; i += 4;
      buf[i] = 22; buf[i+1] = 20; buf[i+2] = 15; buf[i+3] = a8;
      i = ((py + 1) * w + px) << 2;
      buf[i] = 22; buf[i+1] = 20; buf[i+2] = 15; buf[i+3] = a8; i += 4;
      buf[i] = 22; buf[i+1] = 20; buf[i+2] = 15; buf[i+3] = a8;
    }

    ctx.putImageData(imageData, 0, 0);
    rafId = requestAnimationFrame(loop);
  }

  // ResizeObserver fires as soon as the element has layout dimensions,
  // handling both initial sizing and subsequent window resizes.
  new ResizeObserver(entries => {
    const e = entries[0];
    resize(Math.round(e.contentRect.width), Math.round(e.contentRect.height));
  }).observe(picture);
}
