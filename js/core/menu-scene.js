/* ==========================================================================
   menu-scene.js — Ambient pixel backdrop for the fullscreen menu overlay.

   Identical physics and wave to page-scene so the transition from page to
   menu feels like the same living surface behind the content.
   ========================================================================== */

const CELL  = 2;
const GAP   = 8;
const PITCH = CELL + GAP;
const HALF  = CELL >> 1;

const SPRING  = 0.007;
const DAMPING = 0.96;
const DRIFT   = 0.003;

const REST_A    = 0.055;
const PULSE_AMP = 0.008;
const SHIMMER_A = 0.012;

const WAVE_PERIOD = 60_000;
const WAVE_HW_F   = 0.08;
const WAVE_BOOST  = 0.20;

export function createMenuScene(host) {
  let canvas    = null;
  let ctx       = null;
  let imageData = null;
  let buf       = null;
  let raf       = 0;
  let running   = false;
  let failed    = false;
  let w = 0, h = 0;
  let cells = [];
  let fg    = [22, 20, 15];

  function build() {
    canvas = document.createElement("canvas");
    canvas.className = "site-menu__canvas";
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    host.prepend(canvas);
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
    if (!canvas) return;
    w = host.clientWidth;
    h = host.clientHeight;
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

    const waveHW    = WAVE_HW_F * w;
    const waveTravel = w + 2 * waveHW;
    const waveFront  = ((t % WAVE_PERIOD) / WAVE_PERIOD) * waveTravel - waveHW;

    for (const c of cells) {
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph)       * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;

      c.vx *= c.dm;
      c.vy *= c.dm;
      c.x  += c.vx;
      c.y  += c.vy;

      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      const pulse   = Math.sin(t * 0.00035 + c.ph) * PULSE_AMP;
      const disp    = Math.hypot(c.x - c.hx, c.y - c.hy);
      const shimmer = Math.min(disp / 10, 1) * SHIMMER_A;

      const dd   = c.hx - waveFront;
      const wave = Math.abs(dd) < waveHW
        ? (0.5 + 0.5 * Math.cos((dd / waveHW) * Math.PI)) * WAVE_BOOST
        : 0;

      const alpha = Math.max(0, REST_A + pulse + shimmer + wave);

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
    if (running || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!canvas) build();
    } catch (_) {
      failed = true;
      return;
    }
    fg = document.documentElement.dataset.theme === "dark"
      ? [237, 233, 225]
      : [22, 20, 15];
    resize();
    running = true;
    window.addEventListener("resize", resize, { passive: true });
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  }

  return { start, stop };
}
