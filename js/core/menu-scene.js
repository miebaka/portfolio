/* Menu scene — cursor-reactive particle constellation backdrop.
   Pure canvas 2D — no external dependencies, no CDN.
   ~55 particles drift and interconnect; the cursor repels them.
   Progressive enhancement: prefers-reduced-motion or canvas failure
   leaves the flat overlay untouched. */

const COUNT        = 55;
const RADIUS       = 2;          /* particle dot radius (px) */
const CONNECT_DIST = 140;        /* max distance for a connecting line */
const REPEL_DIST   = 110;        /* cursor repulsion radius */
const FRICTION     = 0.91;       /* velocity damping per frame */
const DRIFT_SPEED  = 0.006;      /* amplitude of idle sine drift */

export function createMenuScene(host) {
  let canvas  = null;
  let ctx     = null;
  let raf     = 0;
  let running = false;
  let failed  = false;
  let w = 0, h = 0;
  let particles = [];
  /* fg[0..2] = RGB 0-255, matched to current theme at open time */
  let fg = [244, 241, 234];

  const mouse = { x: -999, y: -999, hasPointer: false };

  /* ── helpers ─────────────────────────────────────────────────── */

  function rgba(a) {
    return `rgba(${fg[0]},${fg[1]},${fg[2]},${a})`;
  }

  function mkParticle() {
    return {
      x:  Math.random() * w,
      y:  Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      ph: Math.random() * Math.PI * 2,   /* phase offset for idle drift */
    };
  }

  /* ── lifecycle ───────────────────────────────────────────────── */

  function resize() {
    if (!canvas) return;
    w = host.clientWidth;
    h = host.clientHeight;
    canvas.width  = w;
    canvas.height = h;
  }

  function onPointerMove(e) {
    const r = host.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.hasPointer = true;
  }

  function build() {
    canvas = document.createElement("canvas");
    canvas.className = "site-menu__canvas";
    canvas.setAttribute("aria-hidden", "true");
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    host.prepend(canvas);
  }

  /* ── frame loop ──────────────────────────────────────────────── */

  function loop(t) {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    const t_s = t * 0.001;

    /* ── update particles ── */
    for (const p of particles) {
      /* Idle drift: gentle sine/cosine wander when no pointer */
      if (!mouse.hasPointer) {
        p.vx += DRIFT_SPEED * Math.sin(t_s * 0.28 + p.ph);
        p.vy += DRIFT_SPEED * Math.cos(t_s * 0.21 + p.ph * 1.4);
      }

      /* Cursor repulsion */
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < REPEL_DIST && d > 0) {
        const f = (1 - d / REPEL_DIST) * 0.55;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }

      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x  += p.vx;
      p.y  += p.vy;

      /* Wrap edges — particles re-enter from the opposite side */
      if (p.x <  0) p.x += w;
      if (p.x > w) p.x -= w;
      if (p.y <  0) p.y += h;
      if (p.y > h) p.y -= h;
    }

    /* ── draw connections ── */
    for (let i = 0; i < particles.length - 1; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b    = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > CONNECT_DIST) continue;
        const alpha = (1 - dist / CONNECT_DIST) * 0.22;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(alpha);
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }
    }

    /* ── draw dots ── */
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = rgba(0.55);
      ctx.fill();
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
    /* Theme-aware particle colour: cream on midnight (light mode), dark on cream (dark mode) */
    const dark = document.documentElement.dataset.theme === "dark";
    fg = dark ? [28, 26, 22] : [244, 241, 234];

    mouse.x = -999; mouse.y = -999; mouse.hasPointer = false;
    resize();
    particles = Array.from({ length: COUNT }, mkParticle);
    running   = true;
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    host.removeEventListener("pointermove", onPointerMove);
  }

  return { start, stop };
}
