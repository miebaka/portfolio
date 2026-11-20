/* Elastic Selected Work roster: no framework, no perpetual animation loop.
   Only visible desktop hover/focus interactions run the capsule physics.
   Touch, JS-off and reduced-motion users retain real images and case links. */
import { isMotionReduced } from "./motion-language.js";

const FIXED_DT = 1 / 120;
const GRAVITY = 2050;
const RESTITUTION = .2;
const WALL_RESTITUTION = .25;
const FRICTION = .5;
const EPS = 1e-8;

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const elasticOut = t => t <= 0 ? 0 : t >= 1 ? 1 :
  1 + Math.pow(2, -10 * t) * Math.sin((t - .125) * (2 * Math.PI) / .5);

function closestSegments(a, b) {
  const ax = Math.cos(a.angle) * a.half, ay = Math.sin(a.angle) * a.half;
  const bx = Math.cos(b.angle) * b.half, by = Math.sin(b.angle) * b.half;
  const p1x = a.x - ax, p1y = a.y - ay;
  const p2x = b.x - bx, p2y = b.y - by;
  const d1x = 2 * ax, d1y = 2 * ay, d2x = 2 * bx, d2y = 2 * by;
  const rx = p1x - p2x, ry = p1y - p2y;
  const aa = d1x * d1x + d1y * d1y;
  const ee = d2x * d2x + d2y * d2y;
  const f = d2x * rx + d2y * ry;
  let s = 0, t = 0;
  if (aa < EPS && ee < EPS) return { x1: p1x, y1: p1y, x2: p2x, y2: p2y };
  if (aa < EPS) t = clamp(f / ee, 0, 1);
  else {
    const c = d1x * rx + d1y * ry;
    if (ee < EPS) s = clamp(-c / aa, 0, 1);
    else {
      const bb = d1x * d2x + d1y * d2y;
      const denom = aa * ee - bb * bb;
      if (denom > EPS) s = clamp((bb * f - c * ee) / denom, 0, 1);
      t = (bb * s + f) / ee;
      if (t < 0) { t = 0; s = clamp(-c / aa, 0, 1); }
      else if (t > 1) { t = 1; s = clamp((bb - c) / aa, 0, 1); }
    }
  }
  return {
    x1: p1x + s * d1x, y1: p1y + s * d1y,
    x2: p2x + t * d2x, y2: p2y + t * d2y,
  };
}

function pointVelocity(body, x, y) {
  return { x: body.vx - body.omega * (y - body.y),
    y: body.vy + body.omega * (x - body.x) };
}

function impulse(body, x, y, jx, jy) {
  body.vx += jx * body.invMass;
  body.vy += jy * body.invMass;
  body.omega += body.invInertia * ((x - body.x) * jy - (y - body.y) * jx);
}

function resolve(a, b, x, y, nx, ny, penetration, restitution) {
  const invB = b?.invMass || 0;
  const invSum = a.invMass + invB;
  if (!invSum) return;
  // Correct overlap before velocity impulses. No separate position solver.
  const correction = Math.max(0, penetration - .02) / invSum;
  a.x += nx * correction * a.invMass;
  a.y += ny * correction * a.invMass;
  if (b) { b.x -= nx * correction * invB; b.y -= ny * correction * invB; }

  const va = pointVelocity(a, x, y);
  const vb = b ? pointVelocity(b, x, y) : { x: 0, y: 0 };
  const dx = va.x - vb.x, dy = va.y - vb.y;
  const vn = dx * nx + dy * ny;
  if (vn >= 0) return;
  const rax = x - a.x, ray = y - a.y;
  const raCross = rax * ny - ray * nx;
  let denom = a.invMass + a.invInertia * raCross * raCross;
  const rbx = b ? x - b.x : 0, rby = b ? y - b.y : 0;
  const rbCross = rbx * ny - rby * nx;
  if (b) denom += b.invMass + b.invInertia * rbCross * rbCross;
  if (denom < EPS) return;
  const normalJ = -(1 + restitution) * vn / denom;
  impulse(a, x, y, nx * normalJ, ny * normalJ);
  if (b) impulse(b, x, y, -nx * normalJ, -ny * normalJ);

  const tangX = -ny, tangY = nx;
  const raT = rax * tangY - ray * tangX;
  const rbT = rbx * tangY - rby * tangX;
  const td = a.invMass + a.invInertia * raT * raT +
    (b ? b.invMass + b.invInertia * rbT * rbT : 0);
  if (td < EPS) return;
  const frictionJ = clamp(-(dx * tangX + dy * tangY) / td,
    -FRICTION * normalJ, FRICTION * normalJ);
  impulse(a, x, y, tangX * frictionJ, tangY * frictionJ);
  if (b) impulse(b, x, y, -tangX * frictionJ, -tangY * frictionJ);
}

function simulate(state, dt) {
  const bodies = state.bodies;
  for (const body of bodies) {
    body.vy += GRAVITY * dt;
    body.vx *= 1 - .25 * dt;
    body.vy *= 1 - .25 * dt;
    body.omega *= 1 - .8 * dt;
    body.x += body.vx * dt;
    body.y += body.vy * dt;
    body.angle += body.omega * dt;
  }
  const floor = state.floor;
  const right = state.row.clientWidth - 12;
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const contact = closestSegments(a, b);
        let nx = contact.x1 - contact.x2, ny = contact.y1 - contact.y2;
        const dist = Math.hypot(nx, ny);
        const overlap = a.radius + b.radius - dist;
        if (overlap <= 0) continue;
        if (dist < EPS) { nx = 0; ny = -1; }
        else { nx /= dist; ny /= dist; }
        resolve(a, b, (contact.x1 + contact.x2) / 2,
          (contact.y1 + contact.y2) / 2, nx, ny, overlap, RESTITUTION);
      }
    }
    for (const body of bodies) {
      const dx = Math.cos(body.angle) * body.half;
      const dy = Math.sin(body.angle) * body.half;
      for (const sign of [-1, 1]) {
        const x = body.x + sign * dx, y = body.y + sign * dy;
        if (y + body.radius > floor)
          resolve(body, null, x, floor, 0, -1, y + body.radius - floor, WALL_RESTITUTION);
        if (x - body.radius < 12)
          resolve(body, null, 12, y, 1, 0, 12 + body.radius - x, WALL_RESTITUTION);
        if (x + body.radius > right)
          resolve(body, null, right, y, -1, 0, x + body.radius - right, WALL_RESTITUTION);
      }
    }
  }
}

export function initProjectRoster({ document: doc = globalThis.document, window: win = globalThis.window } = {}) {
  const list = doc?.querySelector('body[data-page="home"] .home-project-list');
  if (!list || !win) return { destroy() {} };
  const root = doc.documentElement;
  const motionQuery = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const desktopQuery = win.matchMedia?.("(min-width: 48.001rem) and (hover: hover) and (pointer: fine)");
  const rows = Array.from(list.querySelectorAll(".project-roster__row"));
  if (!rows.length) return { destroy() {} };
  const states = rows.map(row => ({
    row, tags: row.querySelector(".project-roster__tags"), bodies: [],
    open: false, collapsed: 0, height: 0, expanded: 0, floor: 0,
    tween: null, dropTimer: 0, closeAt: 0, openedAt: 0,
  }));
  const allowed = () => desktopQuery?.matches === true &&
    !isMotionReduced(root, motionQuery) && !doc.hidden;
  let raf = 0, last = 0, accumulator = 0, destroyed = false;
  const cancelTimer = state => {
    if (state.dropTimer) win.clearTimeout(state.dropTimer);
    state.dropTimer = 0;
  };
  const removeTags = state => {
    state.tags.replaceChildren();
    state.bodies.length = 0;
    state.closeAt = 0;
  };
  const animate = () => {
    if (!raf && !destroyed) raf = win.requestAnimationFrame(tick);
  };
  const spawn = state => {
    state.dropTimer = 0;
    if (!state.open || !allowed() || destroyed) return;
    removeTags(state);
    const labels = (state.tags.dataset.rosterTags || "").split("|").filter(Boolean);
    const width = state.row.clientWidth;
    const time = win.performance.now();
    labels.slice(0, 5).forEach((label, index) => {
      const element = doc.createElement("span");
      element.className = "project-roster__tag";
      element.textContent = label;
      state.tags.append(element);
      const bw = element.offsetWidth, bh = element.offsetHeight;
      const radius = bh / 2, half = Math.max(0, bw / 2 - radius);
      const mass = Math.max(1, bw * bh * .002);
      state.bodies.push({
        element, bw, bh, radius, half,
        x: clamp(width * (.28 + Math.random() * .44), bw / 2 + 12, width - bw / 2 - 12),
        y: -bh / 2 - index * 24,
        vx: (Math.random() - .5) * 90, vy: 0,
        angle: (Math.random() - .5) * .5,
        omega: (Math.random() - .5) * 3,
        invMass: 1 / mass,
        invInertia: 12 / (mass * (bw * bw + bh * bh)),
        fadeStart: time + index * 45,
      });
    });
    animate();
  };
  const collapse = (state, immediate = false) => {
    cancelTimer(state);
    if (!state.open && !state.tween && !state.bodies.length) return;
    state.open = false;
    state.row.classList.remove("is-open");
    const now = win.performance.now();
    if (immediate) {
      state.tween = null;
      state.row.style.height = "";
      state.height = 0;
      removeTags(state);
    } else {
      state.tween = { from: state.height || state.expanded, to: state.collapsed, start: now, duration: 480 };
      state.closeAt = state.bodies.length ? now : 0;
      animate();
    }
  };
  const expand = state => {
    if (!allowed() || state.open || destroyed) return;
    for (const other of states) if (other !== state) collapse(other, true);
    state.collapsed = state.row.getBoundingClientRect().height;
    state.height = state.collapsed;
    state.expanded = Math.max(state.collapsed * 2.3, state.collapsed + 190);
    state.floor = state.expanded - 20;
    state.openedAt = win.performance.now();
    state.tween = {
      from: state.collapsed, to: state.expanded,
      start: state.openedAt, duration: 730,
    };
    state.open = true;
    state.row.classList.add("is-open");
    cancelTimer(state);
    state.dropTimer = win.setTimeout(() => spawn(state), 190);
    animate();
  };
  const tick = now => {
    raf = 0;
    const frame = Math.min(.05, last ? (now - last) / 1000 : FIXED_DT);
    last = now;
    accumulator += frame;
    let steps = 0;
    while (accumulator >= FIXED_DT && steps < 7) {
      for (const state of states) {
        if (state.bodies.length && !state.closeAt && now - state.openedAt < 3200)
          simulate(state, FIXED_DT);
      }
      accumulator -= FIXED_DT;
      steps++;
    }
    if (accumulator > FIXED_DT) accumulator = 0;
    let pending = false;
    for (const state of states) {
      if (state.tween) {
        const t = clamp((now - state.tween.start) / state.tween.duration, 0, 1);
        state.height = state.tween.from + (state.tween.to - state.tween.from) * elasticOut(t);
        state.row.style.height = state.height + "px";
        if (t >= 1) {
          state.tween = null;
          if (!state.open) { state.row.style.height = ""; state.height = 0; }
        } else pending = true;
      }
      for (const body of state.bodies) {
        body.element.style.transform = "translate3d(" + (body.x - body.bw / 2).toFixed(2) +
          "px," + (body.y - body.bh / 2).toFixed(2) + "px,0) rotate(" + body.angle.toFixed(3) + "rad)";
        body.element.style.opacity = String(state.closeAt
          ? 1 - clamp((now - state.closeAt) / 240, 0, 1)
          : clamp((now - body.fadeStart) / 280, 0, 1));
      }
      if (state.closeAt && now - state.closeAt >= 240) removeTags(state);
      if (state.bodies.length && !state.closeAt && now - state.openedAt < 3200) pending = true;
      if (state.closeAt) pending = true;
    }
    if (pending) animate();
    else { last = 0; accumulator = 0; }
  };
  const listeners = [];
  for (const state of states) {
    const enter = () => expand(state);
    const leave = () => { if (!state.row.matches(":focus")) collapse(state); };
    const focus = () => expand(state);
    const blur = () => collapse(state);
    for (const [name, fn] of [["mouseenter", enter], ["mouseleave", leave],
      ["focus", focus], ["blur", blur]]) {
      state.row.addEventListener(name, fn);
      listeners.push(() => state.row.removeEventListener(name, fn));
    }
  }
  const reset = () => {
    for (const state of states) collapse(state, true);
    if (raf) win.cancelAnimationFrame(raf);
    raf = 0; last = 0; accumulator = 0;
  };
  const sync = () => { if (!allowed()) reset(); };
  const observer = new MutationObserver(sync);
  observer.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  const onResize = () => reset();
  win.addEventListener("resize", onResize, { passive: true });
  doc.addEventListener("visibilitychange", sync);
  motionQuery?.addEventListener?.("change", sync);
  desktopQuery?.addEventListener?.("change", sync);
  return {
    destroy() {
      if (destroyed) return;
      reset();
      destroyed = true;
      listeners.forEach(off => off());
      observer.disconnect();
      win.removeEventListener("resize", onResize);
      doc.removeEventListener("visibilitychange", sync);
      motionQuery?.removeEventListener?.("change", sync);
      desktopQuery?.removeEventListener?.("change", sync);
    },
  };
}
