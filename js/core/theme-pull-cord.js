/* Adapted from Kokonut UI's MIT-licensed Pull Cord by Dorian Baffier.
   The original React card becomes a compact, token-driven masthead control. */
const LINKS = 7;
const LINK = 5.5;
const STEP = 1 / 120;
const GRAVITY = 900;
const DAMPING = 0.986;
const ITERATIONS = 8;
const PULL_THRESHOLD = 10;

function curve(xs, ys) {
  let d = `M${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 1; i < xs.length - 1; i += 1) {
    d += ` Q${xs[i].toFixed(2)} ${ys[i].toFixed(2)} ${((xs[i] + xs[i + 1]) / 2).toFixed(2)} ${((ys[i] + ys[i + 1]) / 2).toFixed(2)}`;
  }
  return `${d} L${xs.at(-1).toFixed(2)} ${ys.at(-1).toFixed(2)}`;
}

function constrain(state) {
  for (let pass = 0; pass < ITERATIONS; pass += 1) {
    for (let i = 0; i < LINKS; i += 1) {
      const dx = state.xs[i + 1] - state.xs[i];
      const dy = state.ys[i + 1] - state.ys[i];
      const distance = Math.hypot(dx, dy) || 0.001;
      const correction = (distance - LINK) / distance;
      const fixedA = i === 0;
      const heldB = state.held === i + 1;
      if (!fixedA && !heldB) {
        state.xs[i] += dx * correction * 0.5;
        state.ys[i] += dy * correction * 0.5;
      }
      if (!heldB) {
        const weight = fixedA ? 1 : 0.5;
        state.xs[i + 1] -= dx * correction * weight;
        state.ys[i + 1] -= dy * correction * weight;
      }
    }
  }
}

export function createThemePullCord(button, { onToggle } = {}) {
  if (!button) return { setChecked() {}, destroy() {} };
  const svg = button.querySelector("svg");
  const line = button.querySelector("[data-cord-line]");
  const hit = button.querySelector("[data-cord-hit]");
  const bead = button.querySelector("[data-cord-bead]");
  if (!svg || !line || !hit || !bead) return { setChecked() {}, destroy() {} };

  const anchor = { x: 34, y: 0 };
  const xs = new Float64Array(LINKS + 1);
  const ys = new Float64Array(LINKS + 1);
  const pxs = new Float64Array(LINKS + 1);
  const pys = new Float64Array(LINKS + 1);
  for (let i = 0; i <= LINKS; i += 1) {
    xs[i] = pxs[i] = anchor.x;
    ys[i] = pys[i] = anchor.y + i * LINK;
  }
  const state = { xs, ys, pxs, pys, held: -1, targetX: 0, targetY: 0, raf: 0, last: 0, carry: 0, still: 0, toggled: false, suppressClick: false };
  const reduced = () => document.documentElement.dataset.motion === "reduced";
  const draw = () => {
    const d = curve(xs, ys);
    line.setAttribute("d", d);
    hit.setAttribute("d", d);
    bead.setAttribute("transform", `translate(${xs[LINKS].toFixed(2)} ${ys[LINKS].toFixed(2)})`);
  };
  const tick = now => {
    state.raf = 0;
    const elapsed = state.last ? Math.min((now - state.last) / 1000, 0.04) : STEP;
    state.last = now;
    state.carry += elapsed;
    let moved = 0;
    while (state.carry >= STEP) {
      for (let i = 1; i <= LINKS; i += 1) {
        if (i === state.held) continue;
        const vx = (xs[i] - pxs[i]) * DAMPING;
        const vy = (ys[i] - pys[i]) * DAMPING;
        pxs[i] = xs[i]; pys[i] = ys[i];
        xs[i] += vx; ys[i] += vy + GRAVITY * STEP * STEP;
        moved = Math.max(moved, Math.abs(vx) + Math.abs(vy));
      }
      if (state.held > 0) {
        const i = state.held;
        pxs[i] = xs[i]; pys[i] = ys[i];
        xs[i] = state.targetX; ys[i] = state.targetY;
      }
      constrain(state);
      state.carry -= STEP;
    }
    draw();
    state.still = moved < 0.012 ? state.still + 1 : 0;
    if (state.held > 0 || state.still < 28) state.raf = requestAnimationFrame(tick);
    else state.last = 0;
  };
  const wake = () => { state.still = 0; if (!state.raf) state.raf = requestAnimationFrame(tick); };
  const point = event => {
    const rect = svg.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * 68, y: ((event.clientY - rect.top) / rect.height) * 58 };
  };
  const pointerDown = event => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    svg.setPointerCapture(event.pointerId);
    state.held = LINKS; state.toggled = false; state.suppressClick = false;
    button.classList.add("is-grabbing");
    const p = point(event); state.targetX = p.x; state.targetY = p.y; wake();
  };
  const pointerMove = event => {
    if (state.held < 0) return;
    const p = point(event);
    const dx = p.x - anchor.x;
    const dy = Math.max(0, p.y - anchor.y);
    const length = LINKS * LINK;
    const distance = Math.hypot(dx, dy) || 1;
    const allowed = Math.min(length + 18, distance);
    state.targetX = anchor.x + (dx / distance) * allowed;
    state.targetY = anchor.y + (dy / distance) * allowed;
    if (!state.toggled && allowed - length >= PULL_THRESHOLD) {
      state.toggled = true; state.suppressClick = true;
      navigator.vibrate?.(8); onToggle?.();
    }
    wake();
  };
  const pointerUp = () => {
    if (state.held < 0) return;
    state.held = -1; button.classList.remove("is-grabbing");
    if (reduced()) {
      for (let i = 0; i <= LINKS; i += 1) { xs[i] = pxs[i] = anchor.x; ys[i] = pys[i] = anchor.y + i * LINK; }
      draw();
    } else wake();
  };
  const click = () => {
    if (state.suppressClick) { state.suppressClick = false; return; }
    onToggle?.();
    if (!reduced()) { pys[LINKS] = ys[LINKS] - 4; wake(); }
  };
  hit.addEventListener("pointerdown", pointerDown);
  bead.addEventListener("pointerdown", pointerDown);
  svg.addEventListener("pointermove", pointerMove);
  svg.addEventListener("pointerup", pointerUp);
  svg.addEventListener("pointercancel", pointerUp);
  svg.addEventListener("lostpointercapture", pointerUp);
  button.addEventListener("click", click);
  draw();

  return {
    setChecked(checked) {
      button.setAttribute("aria-checked", String(checked));
      button.setAttribute("aria-label", checked ? "Switch to Print mode" : "Switch to Screen mode");
      button.dataset.mode = checked ? "screen" : "print";
      button.querySelector("[data-cord-mode]").textContent = checked ? "Screen" : "Print";
    },
    destroy() {
      cancelAnimationFrame(state.raf);
      hit.removeEventListener("pointerdown", pointerDown); bead.removeEventListener("pointerdown", pointerDown);
      svg.removeEventListener("pointermove", pointerMove); svg.removeEventListener("pointerup", pointerUp);
      svg.removeEventListener("pointercancel", pointerUp); svg.removeEventListener("lostpointercapture", pointerUp);
      button.removeEventListener("click", click);
    }
  };
}
