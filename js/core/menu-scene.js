/* Menu scene — cursor-reactive pixel grid backdrop.
   Pure canvas 2D — no external dependencies.
   A regular grid of small squares scatters on cursor proximity
   and springs back home. Resting cells are near-invisible; displaced
   cells flash brighter, making the scatter readable without clutter.
   Progressive enhancement: prefers-reduced-motion or canvas failure
   leaves the flat overlay untouched. */

const CELL        = 6;     /* square side length (px) */
const GAP         = 5;     /* gap between squares */
const PITCH       = CELL + GAP;   /* 11 px grid pitch */
const REPEL_DIST  = 100;   /* cursor repulsion radius (px) */
const REPEL_FORCE = 3.5;   /* peak repulsion push per frame */
const SPRING      = 0.08;  /* spring constant pulling cell home */
const DAMPING     = 0.72;  /* velocity damping per frame */

export function createMenuScene(host) {
  let canvas  = null;
  let ctx     = null;
  let raf     = 0;
  let running = false;
  let failed  = false;
  let w = 0, h = 0;
  let cells = [];
  let fg = [22, 20, 15];   /* RGB — matched to --ink light mode */

  const mouse = { x: -9999, y: -9999 };

  function rgba(a) {
    return `rgba(${fg[0]},${fg[1]},${fg[2]},${a})`;
  }

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
        cells.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0 });
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

  function onPointerMove(e) {
    const r = host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }

  function onPointerLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (const c of cells) {
      /* Cursor repulsion */
      const dx   = c.x - mouse.x;
      const dy   = c.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (1 - dist / REPEL_DIST) * REPEL_FORCE;
        c.vx += (dx / dist) * force;
        c.vy += (dy / dist) * force;
      }

      /* Spring toward home */
      c.vx += (c.hx - c.x) * SPRING;
      c.vy += (c.hy - c.y) * SPRING;

      c.vx *= DAMPING;
      c.vy *= DAMPING;
      c.x  += c.vx;
      c.y  += c.vy;

      /* Opacity scales with displacement: resting ≈ 7%, fully scattered ≈ 42% */
      const disp  = Math.hypot(c.x - c.hx, c.y - c.hy);
      const alpha = 0.07 + Math.min(disp / 40, 1) * 0.35;

      ctx.fillStyle = rgba(alpha);
      ctx.fillRect(Math.round(c.x - CELL / 2), Math.round(c.y - CELL / 2), CELL, CELL);
    }

    raf = requestAnimationFrame(loop);
  }

  /* ── public API ──────────────────────────────────────────────── */

  function start() {
    if (running || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!canvas) build();
    } catch (_) {
      failed = true;
      return;
    }
    /* Theme-aware cell colour: dark ink on light bg / light ink on dark bg */
    const dark = document.documentElement.dataset.theme === "dark";
    fg = dark ? [237, 233, 225] : [22, 20, 15];

    mouse.x = -9999; mouse.y = -9999;
    resize();
    running = true;
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    host.removeEventListener("pointermove", onPointerMove);
    host.removeEventListener("pointerleave", onPointerLeave);
  }

  return { start, stop };
}
