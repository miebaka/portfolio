/* generative-field.worker.js — the point-field render loop, off the main thread.

   Owns an OffscreenCanvas transferred from the page and draws to it on a worker
   thread, so the ~10k-points-per-frame loop never competes with scrolling, the
   hero parallax, or any interaction. Runs at ~30fps (a slow drift needs no
   more) with a framerate-independent time step, and tints the densest core with
   a whisper of clay. Theme, size, and run/pause come in as messages from the
   page — a worker has no DOM, matchMedia, or visibility of its own. */

const COUNT = 1e4;         /* points per frame */
const POINT_ALPHA = 14;    /* 0-255 added per point; overlaps accumulate */
const FILL = 1.716;        /* how much of the buffer the bloom spans */
const OFFSET_X = 0.62;     /* bloom centre, pushed right as a counterweight to the statement */
const FPS = 30;
const STEP = 1000 / FPS;
const DRIFT = Math.PI / 80; /* t advance per 60fps-frame, scaled by real time below */

let cv = null, ctx = null;
let W = 0, H = 0, cx = 0, cy = 0, S = 1, img = null, buf = null;
let ink = [22, 20, 15];
let clay = [194, 83, 28];
let t = 0, last = 0, running = false, timer = 0;

function resize(w, h) {
  W = cv.width = w;
  H = cv.height = h;
  cx = W * OFFSET_X;
  cy = H / 2;
  S = Math.min(W, H) / 400 * FILL;
  img = ctx.createImageData(W, H);
  buf = img.data;
}

function loop() {
  if (!running) return;
  const now = performance.now();
  const dt = last ? now - last : STEP;
  last = now;
  t += (dt / 16.67) * DRIFT; /* framerate-independent: same drift speed at any fps */

  buf.fill(0);
  const ir = ink[0], ig = ink[1], ib = ink[2];
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
    buf[idx] = ir; buf[idx + 1] = ig; buf[idx + 2] = ib;
    buf[idx + 3] = Math.min(255, buf[idx + 3] + POINT_ALPHA);
  }

  /* Whisper of clay where points pile up densest (high accumulated alpha), so
     the bright core reads warm and on-brand rather than neutral ink. */
  for (let p = 3; p < buf.length; p += 4) {
    const a = buf[p];
    if (a <= 90) continue;
    const m = Math.min((a - 90) / 130, 1) * 0.5;
    const o = p - 3;
    buf[o]     += (clay[0] - buf[o])     * m;
    buf[o + 1] += (clay[1] - buf[o + 1]) * m;
    buf[o + 2] += (clay[2] - buf[o + 2]) * m;
  }

  ctx.putImageData(img, 0, 0);
  timer = setTimeout(loop, STEP);
}

function start() { if (!running) { running = true; last = 0; loop(); } }
function stop()  { running = false; clearTimeout(timer); }

self.onmessage = ({ data }) => {
  switch (data.type) {
    case "init":
      cv = data.canvas;
      ctx = cv.getContext("2d");
      ink = data.ink;
      clay = data.clay;
      resize(data.width, data.height);
      start();
      break;
    case "theme":  ink = data.ink; break;
    case "resize": if (cv) resize(data.width, data.height); break;
    case "run":    data.on ? start() : stop(); break;
  }
};
