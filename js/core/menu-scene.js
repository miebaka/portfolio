/* Menu scene — cursor-reactive pixel grid backdrop.
   Pure canvas 2D — no external dependencies.
   A regular grid of small squares scatters on cursor proximity
   and springs back home. Organic drift via a position+time flow field;
   per-cell spring/damping variance gives each square its own rhythm.
   Progressive enhancement: prefers-reduced-motion or canvas failure
   leaves the flat overlay untouched. */

const CELL        = 4;          /* square side (px) */
const GAP         = 3;          /* gap between squares */
const PITCH       = CELL + GAP; /* 7 px pitch — ~2.5× denser than 11 px */
const REPEL_DIST  = 110;        /* cursor repulsion radius (px) */
const REPEL_FORCE = 3.8;        /* peak push per frame */
const SPRING      = 0.07;       /* mean spring constant toward home */
const DAMPING     = 0.74;       /* mean velocity damping per frame */
const DRIFT       = 0.013;      /* flow-field amplitude */

export function createMenuScene(host) {
  let canvas  = null;
  let ctx     = null;
  let raf     = 0;
  let running = false;
  let failed  = false;
  let w = 0, h = 0;
  let cells = [];
  let fg = [22, 20, 15];

  const mouse = { x: -9999, y: -9999 };

  function rgba(a) { return `rgba(${fg[0]},${fg[1]},${fg[2]},${a})`; }

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
          /* Per-cell variance — different natural frequencies, no lockstep */
          sp: SPRING  + (Math.random() - 0.5) * 0.018,
          dm: DAMPING + (Math.random() - 0.5) * 0.04,
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
    buildGrid();
  }

  /* dialog is position:fixed; inset:0 — clientX/Y maps directly to canvas coords.
     Listening on window (not host) prevents the pointerleave snap that glitches
     cells at the viewport edge when the cursor briefly exits the dialog hitbox. */
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function loop(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const c of cells) {
      /* ── 1. Organic flow-field drift ──────────────────────────────────
         Sine/cosine keyed to home position + time. Adjacent cells flow in
         subtly different directions, creating a slow breathing wave. */
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph) * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

      /* ── 2. Cursor repulsion (swirling) ────────────────────────────────
         A time-varying angular twist on the repulsion direction creates a
         swirl — the scatter looks alive rather than perfectly radial. */
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

      /* ── 5. Wall bounce — cells that escape the canvas edge flip their
         velocity and clamp, preventing the half-pixel edge glitch where a
         partially off-screen cell clips in/out of view each frame. ─────── */
      if (c.x < 0)  { c.x = 0; c.vx *= -0.3; }
      if (c.x > w)  { c.x = w; c.vx *= -0.3; }
      if (c.y < 0)  { c.y = 0; c.vy *= -0.3; }
      if (c.y > h)  { c.y = h; c.vy *= -0.3; }

      /* ── 6. Draw ────────────────────────────────────────────────────── */
      const disp  = Math.hypot(c.x - c.hx, c.y - c.hy);
      const alpha = 0.07 + Math.min(disp / 40, 1) * 0.35;
      ctx.fillStyle = rgba(alpha);
      ctx.fillRect(Math.round(c.x - CELL / 2), Math.round(c.y - CELL / 2), CELL, CELL);
    }

    raf = requestAnimationFrame(loop);
  }

  /* ── public API ──────────────────────────────────────────────────── */

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
