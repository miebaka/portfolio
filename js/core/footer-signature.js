/* Interactive name-shaped dot matrix sampled from the authored signature. */
const SVG_SRC = "/assets/images/miebaka-joshua-script-name.svg";
const SVG_RATIO = 280 / 705.67;
const PITCH = 6;
const DOT = 2.2;
const RADIUS = 128;

function enhanceFooterSignature(host) {
  const canvas = document.createElement("canvas");
  canvas.className = "site-footer__signature-canvas";
  host.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) return;
  const pointer = { x: -9999, y: -9999, active: false };
  let points = [], width = 0, height = 0, frame = 0, running = false, generation = 0;
  let restColor = "rgba(255,255,255,.48)";

  const loadImage = () => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = SVG_SRC;
  });

  async function rebuild() {
    const current = ++generation;
    width = Math.max(1, Math.round(host.clientWidth));
    height = Math.max(1, Math.round(host.clientHeight));
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const channels = getComputedStyle(host).color.match(/[\d.]+/g)?.slice(0, 3) || [255, 255, 255];
    restColor = `rgba(${channels.join(",")},.48)`;
    let image;
    try { image = await loadImage(); } catch { return; }
    if (current !== generation) return;
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    const markHeight = width * SVG_RATIO;
    sampleContext.drawImage(image, 0, (height - markHeight) / 2, width, markHeight);
    const pixels = sampleContext.getImageData(0, 0, width, height).data;
    const next = [];
    for (let y = PITCH / 2; y < height; y += PITCH) {
      for (let x = PITCH / 2; x < width; x += PITCH) {
        const alpha = pixels[(Math.round(y) * width + Math.round(x)) * 4 + 3];
        if (alpha > 32) next.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0 });
      }
    }
    points = next;
    host.classList.add("is-enhanced");
  }

  function draw() {
    if (!running) return;
    context.clearRect(0, 0, width, height);
    for (const point of points) {
      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy) || 1;
      const proximity = pointer.active && distance < RADIUS ? 1 - distance / RADIUS : 0;
      if (proximity) {
        const force = proximity * proximity * 1.9;
        point.vx += dx / distance * force;
        point.vy += dy / distance * force;
      }
      point.vx += (point.homeX - point.x) * .055;
      point.vy += (point.homeY - point.y) * .055;
      point.vx *= .79;
      point.vy *= .79;
      point.x += point.vx;
      point.y += point.vy;
      context.fillStyle = proximity > .08 ? "rgba(255,160,143,.92)" : restColor;
      const size = DOT + proximity * 1.8;
      context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
    frame = requestAnimationFrame(draw);
  }
  const start = () => { if (!running) { running = true; frame = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(frame); };
  const onPointerMove = event => {
    const rect = host.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  };
  const onPointerLeave = () => { pointer.active = false; };
  const resizeObserver = new ResizeObserver(rebuild);
  const mutationObserver = new MutationObserver(rebuild);
  host.addEventListener("pointermove", onPointerMove, { passive: true });
  host.addEventListener("pointerleave", onPointerLeave);
  resizeObserver.observe(host);
  mutationObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  rebuild();
  return {
    start() { canvas.hidden = false; start(); },
    stop() { stop(); canvas.hidden = true; context.clearRect(0, 0, width, height); },
    destroy() {
      stop(); generation++; resizeObserver.disconnect(); mutationObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove); host.removeEventListener("pointerleave", onPointerLeave);
      host.classList.remove("is-enhanced"); canvas.remove();
    }
  };
}

export function createFooterSignatureController(host, { document: doc = document, enhance = enhanceFooterSignature, IntersectionObserver: Observer = IntersectionObserver } = {}) {
  let enhanced, visible = false, destroyed = false;
  const reduced = () => doc.documentElement.dataset.motion === "reduced";
  const sync = () => {
    if (destroyed) return;
    if (reduced()) { enhanced?.stop(); return; }
    enhanced ||= enhance(host);
    if (visible && !doc.hidden) enhanced?.start(); else enhanced?.stop();
  };
  const onMotion = () => sync();
  const onVisibility = () => sync();
  doc.addEventListener("motionpreferencechange", onMotion);
  doc.addEventListener("visibilitychange", onVisibility);
  const observer = new Observer(([entry]) => { visible = Boolean(entry?.isIntersecting); sync(); }, { threshold: .01 });
  observer.observe(host);
  sync();
  return {
    destroy() {
      if (destroyed) return; destroyed = true; observer.disconnect();
      doc.removeEventListener("motionpreferencechange", onMotion); doc.removeEventListener("visibilitychange", onVisibility);
      enhanced?.destroy(); enhanced = null;
    }
  };
}

export function initFooterSignature() {
  const host = document.querySelector(".site-footer__signature");
  if (!host) return;
  const controller = createFooterSignatureController(host);
  addEventListener("pagehide", () => controller.destroy(), { once: true });
  return controller;
}
