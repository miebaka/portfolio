/* Footer scene — bioluminescent pixel grid backdrop for the footer.
   Identical physics to menu-scene.js; two differences:
   1. Canvas is position:absolute inside the footer (not fullscreen fixed).
   2. Mouse coords are converted relative to the canvas bounds so the repulsion
      field maps correctly to the footer's local coordinate space. */

const CELL        = 2;
const GAP         = 2;
const PITCH       = CELL + GAP;
const HALF        = CELL >> 1;
const REPEL_DIST  = 100;
const REPEL_FORCE = 1.4;
const SPRING      = 0.09;
const DAMPING     = 0.76;
const DRIFT       = 0.008;
const REST_A      = 0.04;
const GLOW_A      = 0.55;
const TRAIL_A     = 0.20;

export function createFooterScene(host) {
  let canvas    = null;
  let ctx       = null;
  let imageData = null;
  let buf       = null;
  let raf       = 0;
  let running   = false;
  let failed    = false;
  let w = 0, h = 0;
  let cells     = [];
  let fg        = [22, 20, 15];

  /* Mouse position in canvas-local coordinates */
  const mouse = { x: -9999, y: -9999 };

  function build() {
    canvas = document.createElement("canvas");
    canvas.className = "site-footer__canvas";
    canvas.setAttribute("aria-hidden", "true");
    /* Position and clip inline — works regardless of stylesheet cache.
       Same SVG mask as the footer ::before watermark so pixels are
       confined to the script-signature shape only. */
    const MASK = "url('/assets/images/miebaka-joshua-script-name.svg') no-repeat center bottom / auto calc(100% - var(--space-4))";
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "0",
      pointerEvents: "none",
    });
    canvas.style.setProperty("-webkit-mask", MASK);
    canvas.style.setProperty("mask", MASK);
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
          sp: SPRING  + (Math.random() - 0.5) * 0.016,
          dm: DAMPING + (Math.random() - 0.5) * 0.036,
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

  /* Convert window-level clientX/Y to canvas-local coords.
     The footer canvas is position:absolute so its origin is offset
     from the viewport — getBoundingClientRect gives us that offset. */
  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function loop(t) {
    if (!running) return;

    buf.fill(0);

    const [r8, g8, b8] = fg;

    for (const c of cells) {
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph) * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

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

      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;

      const MARGIN = PITCH * 3;
      const WALL_F = 0.14;
      if (c.x < MARGIN)     c.vx += (1 - c.x / MARGIN)     * WALL_F;
      if (c.x > w - MARGIN) c.vx -= (1 - (w - c.x) / MARGIN) * WALL_F;
      if (c.y < MARGIN)     c.vy += (1 - c.y / MARGIN)     * WALL_F;
      if (c.y > h - MARGIN) c.vy -= (1 - (h - c.y) / MARGIN) * WALL_F;

      c.vx *= c.dm;
      c.vy *= c.dm;
      c.x  += c.vx;
      c.y  += c.vy;

      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      const pdx   = c.x - mouse.x;
      const pdy   = c.y - mouse.y;
      const pdist = Math.hypot(pdx, pdy);
      const prox  = pdist < REPEL_DIST ? (1 - pdist / REPEL_DIST) ** 1.5 : 0;
      const disp  = Math.hypot(c.x - c.hx, c.y - c.hy);
      const trail = Math.min(disp / 28, 1);
      const alpha = REST_A + prox * GLOW_A + trail * TRAIL_A;

      const px = Math.round(c.x) - HALF;
      const py = Math.round(c.y) - HALF;
      const a8 = (alpha * 255 + 0.5) | 0;

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
    const dark = document.documentElement.dataset.theme === "dark";
    fg = dark ? [237, 233, 225] : [22, 20, 15];
    mouse.x = -9999;
    mouse.y = -9999;
    resize();
    running = true;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    host.addEventListener("mouseleave", onMouseLeave);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    host.removeEventListener("mouseleave", onMouseLeave);
  }

  return { start, stop };
}

export function initFooterScene() {
  const footer = document.querySelector("footer.site-footer");
  if (!footer) return;

  const scene = createFooterScene(footer);

  /* Start only when the footer is visible — saves CPU while user is at the top. */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          scene.start();
        } else {
          scene.stop();
        }
      });
    },
    { threshold: 0.01 }
  );

  observer.observe(footer);
}
