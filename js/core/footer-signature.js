/* Interactive dot matrix sampled from Miebaka's actual script-name artwork. */
const PITCH = 4.2;
const DOT = 1.15;
const RADIUS = 128;

export function initFooterSignature() {
  const host = document.querySelector(".site-footer__signature");
  if (!host) return;
  const canvas = document.createElement("canvas");
  canvas.className = "site-footer__signature-canvas";
  host.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) return;
  const pointer = { x: -9999, y: -9999, active: false };
  let points = [], width = 0, height = 0, frame = 0, running = false, generation = 0;
  let restColor = "rgba(255,255,255,.48)";
  let accentColor = "#FFA08F";

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
    accentColor = getComputedStyle(document.documentElement).getPropertyValue("--sys-color-tertiary").trim() || accentColor;
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    const artwork = new Image();
    artwork.src = host.dataset.signatureSrc;
    try { await artwork.decode(); } catch { return; }
    if (current !== generation) return;
    const scale = Math.min(width * .96 / artwork.naturalWidth, height * .84 / artwork.naturalHeight);
    const drawWidth = artwork.naturalWidth * scale;
    const drawHeight = artwork.naturalHeight * scale;
    sampleContext.drawImage(artwork, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
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
    start();
  }

  function draw() {
    if (!running) return;
    context.clearRect(0, 0, width, height);
    let energy = 0;
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
      energy += Math.abs(point.vx) + Math.abs(point.vy) + Math.abs(point.homeX - point.x) * .08 + Math.abs(point.homeY - point.y) * .08;
      context.fillStyle = proximity > .08 ? accentColor : restColor;
      const size = DOT + proximity * 1.8;
      context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
    if (document.documentElement.dataset.motion === "reduced") { running = false; return; }
    if (pointer.active || energy > points.length * .008) frame = requestAnimationFrame(draw);
    else running = false;
  }
  const start = () => { if (!running) { running = true; frame = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(frame); };
  host.addEventListener("pointermove", event => {
    const rect = host.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
    start();
  }, { passive: true });
  host.addEventListener("pointerleave", () => { pointer.active = false; start(); });
  new ResizeObserver(rebuild).observe(host);
  new MutationObserver(rebuild).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-motion"] });
  new IntersectionObserver(([entry]) => entry.isIntersecting && !document.hidden ? start() : stop(), { threshold: .01 }).observe(host);
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  rebuild();
}
