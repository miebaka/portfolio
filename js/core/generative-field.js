/* generative-field.js — a slow generative point-field behind the home page.

   A dependency-free port of a p5 "dwitter" sketch: each frame plots ~10k
   translucent points whose positions come from nested trig over time `t`,
   forming an organic drifting bloom. Rendered ink-on-paper at very low opacity
   as a fixed full-viewport layer behind the content, so it reads as a living
   texture rather than a picture, and it flips ink/paper with the theme.

   Points are written straight into one ImageData buffer (a single putImageData
   per frame) rather than 10k canvas calls, and the buffer renders at a fraction
   of device resolution and is CSS-scaled up — cheap, and the softening suits a
   background. Guards: reduced motion never runs it, and it pauses when the tab
   is hidden. Home page only. */

const COUNT = 1e4;         /* points per frame */
const POINT_ALPHA = 12;    /* 0-255 added per point; overlaps accumulate into density */
const FILL = 1.3;          /* how much of the viewport the bloom spans */
const RES = 0.6;           /* internal buffer scale vs the viewport */

export function initGenerativeField() {
  if (document.body.dataset.page !== "home") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "generative-field";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.body.prepend(canvas);

  let W = 0, H = 0, cx = 0, cy = 0, S = 1, img = null, buf = null;
  let ink = [22, 20, 15];
  let t = 0, raf = 0, running = false;

  function syncTheme() {
    ink = document.documentElement.dataset.theme === "dark"
      ? [237, 233, 225]   /* paper — light points on the dark ground */
      : [22, 20, 15];     /* ink  — dark points on paper */
  }

  function resize() {
    W = canvas.width = Math.max(1, Math.floor(window.innerWidth * RES));
    H = canvas.height = Math.max(1, Math.floor(window.innerHeight * RES));
    cx = W / 2;
    cy = H / 2;
    S = Math.min(W, H) / 400 * FILL;
    img = ctx.createImageData(W, H);
    buf = img.data;
  }

  function frame() {
    if (!running) return;
    t += Math.PI / 80;
    buf.fill(0);
    const r = ink[0], g = ink[1], b = ink[2];
    for (let i = COUNT; i--; ) {
      const y = i / 253;
      const k = 5 * Math.cos(i / 44);
      const e = y / 2 - 15;
      const d = Math.hypot(k, e) / 3;
      const c = d / 2 - t / 3 + (i % 2) * 3;
      const rx = (79 + d * d + k * k) * Math.sin(c) + (d ** 3) / 4 * Math.cos(t * 3 - d * d / 4);
      const ry = 99 * Math.cos(c / 2) + 4 * Math.sin(k * 2) + y / (77 * Math.sin(e / 2) + 1e-4) * k * e;
      const x = (cx + rx * S) | 0;
      const yy = (cy + ry * S) | 0;
      if (x < 0 || x >= W || yy < 0 || yy >= H) continue;
      const idx = (yy * W + x) * 4;
      buf[idx] = r; buf[idx + 1] = g; buf[idx + 2] = b;
      buf[idx + 3] = Math.min(255, buf[idx + 3] + POINT_ALPHA);
    }
    ctx.putImageData(img, 0, 0);
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
  function stop()  { running = false; cancelAnimationFrame(raf); }

  resize();
  syncTheme();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true, attributeFilter: ["data-theme"],
  });
  start();
}
