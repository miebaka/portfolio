/* Menu scene — bioluminescent pixel grid backdrop.
   2 × 2 px cells on a 4 px pitch drawn via ImageData (one putImageData per
   frame instead of per-cell fillRect calls — handles 100k+ cells at 60 fps).
   Cells are near-invisible at rest; cursor proximity illuminates them with a
   soft proximity glow + kinetic trail as they spring home. Organic breathing
   via a position+time flow-field; per-cell spring/damping variance gives each
   square its own subtle rhythm.
   Progressive enhancement: prefers-reduced-motion or canvas failure leaves
   the flat overlay untouched. */

const CELL        = 2;
const GAP         = 2;
const PITCH       = CELL + GAP;   /* 4 px pitch */
const HALF        = CELL >> 1;    /* 1 — half-cell; used for clamping + draw offset */
const REPEL_DIST  = 100;
const REPEL_FORCE = 1.4;          /* gentle — bioluminescence is soft */
const SPRING      = 0.09;
const DAMPING     = 0.76;
const DRIFT       = 0.008;        /* flow-field amplitude */
const REST_A      = 0.04;         /* near-invisible at rest */
const GLOW_A      = 0.55;         /* peak proximity glow */
const TRAIL_A     = 0.20;         /* fading kinetic trail */

export function createMenuScene(host) {
  let canvas    = null;
  let ctx       = null;
  let imageData = null;
  let buf       = null;   /* Uint8ClampedArray — reused across frames */
  let raf       = 0;
  let running   = false;
  let failed    = false;
  let w = 0, h = 0;
  let cells     = [];
  let fg        = [22, 20, 15];

  const mouse = { x: -9999, y: -9999 };

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
          x: hx, y: hy,
          vx: 0, vy: 0,
          ph: Math.random() * Math.PI * 2,
          sp: SPRING  + (Math.random() - 0.5) * 0.016,   /* per-cell spring variance */
          dm: DAMPING + (Math.random() - 0.5) * 0.036,   /* per-cell damping variance */
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

  /* dialog is position:fixed; inset:0 — clientX/Y maps directly to canvas coords.
     Listening on window (not host) avoids the pointerleave snap that fires when
     the cursor reaches the exact viewport boundary of the fullscreen dialog. */
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function loop(t) {
    if (!running) return;

    /* Reset every pixel to fully transparent */
    buf.fill(0);

    const [r8, g8, b8] = fg;

    for (const c of cells) {
      /* ── 1. Organic flow-field drift ──────────────────────────────────
         Sine/cosine keyed to cell home-position + time creates a slow wave
         where neighbours flow in subtly different directions. */
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph) * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

      /* ── 2. Cursor repulsion (swirling) ────────────────────────────────
         A time-varying angular twist makes scatter non-radial — spiralling
         rather than perfectly symmetric away from the cursor. */
      const dx   = c.x - mouse.x;
      const dy   = c.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (1 - dist / REPEL_DIST) * REPEL_FORCE;
        const twist = Math.sin(t * 0.00038 + c.ph) * 0.25;
        const ct    = Math.cos(twist);
        const st    = Math.sin(twist);
        c.vx += ((dx / dist) * ct - (dy / dist) * st) * force;
        c.vy += ((dx / dist) * st + (dy / dist) * ct) * force;
      }

      /* ── 3. Spring toward home (per-cell constant) ──────────────────── */
      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;

      /* ── 4. Damp + integrate ────────────────────────────────────────── */
      c.vx *= c.dm;
      c.vy *= c.dm;
      c.x  += c.vx;
      c.y  += c.vy;

      /* ── 5. Hard-wall containment ───────────────────────────────────────
         Full stop at walls (not a bounce). Bounce creates a standing
         oscillation that fights the cursor repulsion and makes the glow
         flicker at top/bottom; stopping lets the spring pull the cell back
         smoothly with no velocity reversal. */
      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      /* ── 6. Bioluminescent opacity ──────────────────────────────────────
         Recompute distance from the cell's FINAL position (after integration
         + wall clamp). Using the pre-integration dist caused a frame-to-frame
         mismatch — cells pushed into the top/bottom wall had a pre-clamp dist
         smaller than their actual post-clamp dist, making the glow flicker. */
      const pdx   = c.x - mouse.x;
      const pdy   = c.y - mouse.y;
      const pdist = Math.hypot(pdx, pdy);
      const prox  = pdist < REPEL_DIST ? (1 - pdist / REPEL_DIST) ** 1.5 : 0;
      const disp  = Math.hypot(c.x - c.hx, c.y - c.hy);
      const trail = Math.min(disp / 28, 1);
      const alpha = REST_A + prox * GLOW_A + trail * TRAIL_A;

      /* ── 7. Write 2×2 pixel block to ImageData ──────────────────────────
         Unrolled loop avoids inner-loop overhead for 2-pixel cells.
         Wall clamping guarantees px ∈ [0, w-2] and py ∈ [0, h-2] so every
         index is within buf bounds — no range check needed per cell. */
      const px = Math.round(c.x) - HALF;
      const py = Math.round(c.y) - HALF;
      const a8 = (alpha * 255 + 0.5) | 0;   /* fast float→int, clamped by Uint8ClampedArray */

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

  /* ── public API ──────────────────────────────────────────────────────── */

  function start() {
    if (running || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!canvas) build();
    } catch (_) {
      failed = true;
      return;
    }
    const dark = document.documentElement.dataset.theme === "dark";
    fg = dark ? [237, 233, 225] : [22, 20, 15];
    mouse.x = -9999;
    mouse.y = -9999;
    resize();
    running = true;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
  }

  return { start, stop };
}
