import { basePath, escapeHTML as esc, safeURL } from "../utilities/dom.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const layout = [[90,110,520,0],[710,40,430,2],[1240,180,610,1],[1880,70,470,3],[320,760,570,2],[1030,680,500,4],[1640,760,640,1],[50,1240,460,3],[690,1190,590,1],[1420,1240,520,2],[2030,1160,430,4]];
const mediaMarkup = (entry, base) => entry.type === "video"
  ? `<video src="${base}assets/experiments/${encodeURIComponent(entry.file)}" muted playsinline loop preload="metadata" aria-label="${esc(entry.title)}"></video>`
  : `<img src="${base}assets/experiments/${encodeURIComponent(entry.file)}" alt="${esc(entry.alt || entry.title)}" loading="eager" decoding="async">`;

export async function initExperimentsSpatial() {
  const root = document.querySelector("[data-experiments-spatial]");
  if (!root) return;
  const viewport = root.querySelector("[data-experiments-viewport]");
  const stage = root.querySelector("[data-experiments-stage]");
  const status = root.querySelector("[data-experiments-status]");
  const base = basePath();
  let entries = [];
  try {
    const response = await fetch(`${base}assets/experiments/manifest.json`);
    if (response.ok) entries = await response.json();
  } catch {}
  if (!Array.isArray(entries) || !entries.length) {
    status.textContent = "No experiments are currently available.";
    return;
  }

  const virtual = { width: 2500, height: 1780 };
  stage.style.setProperty("--stage-w", `${virtual.width}px`);
  stage.style.setProperty("--stage-h", `${virtual.height}px`);
  stage.innerHTML = entries.map((entry, index) => {
    const [x, y, width, depth] = layout[index % layout.length];
    const cycle = Math.floor(index / layout.length);
    const tag = entry.href ? "a" : entry.type === "video" ? "button" : "figure";
    const external = /^https?:/i.test(entry.href || "");
    const attrs = entry.href
      ? ` href="${safeURL(entry.href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}`
      : entry.type === "video"
        ? ` type="button" aria-label="Play or pause ${esc(entry.title)}"`
        : ` tabindex="0" role="img" aria-label="${esc(entry.alt || entry.title)}"`;
    return `<${tag} class="experiment-object"${attrs} style="--x:${x + cycle * 170}px;--y:${y + cycle * 120}px;--w:${width}px;--z:${depth + 2}" data-depth="${depth}">${mediaMarkup(entry, base)}</${tag}>`;
  }).join("");

  const objects = [...stage.querySelectorAll(".experiment-object")];
  const camera = { x: 0, y: 0, scale: 1, vx: 0, vy: 0 };
  let pointer = null;
  let frame = 0;
  let interacted = false;
  const bounds = () => ({ minX: Math.min(0, viewport.clientWidth - virtual.width * camera.scale), minY: Math.min(0, viewport.clientHeight - virtual.height * camera.scale) });
  const paint = () => { stage.style.transform = `translate3d(${camera.x}px,${camera.y}px,0) scale(${camera.scale})`; };
  const contain = () => { const { minX, minY } = bounds(); camera.x = clamp(camera.x, minX, 0); camera.y = clamp(camera.y, minY, 0); };
  const move = (dx, dy) => {
    camera.x += dx; camera.y += dy; contain(); paint();
    if (!interacted) { interacted = true; root.classList.add("has-interacted"); }
  };
  const centre = () => {
    const minimum = viewport.clientWidth < 640 ? .38 : .72;
    camera.scale = clamp(Math.min(viewport.clientWidth / 1550, viewport.clientHeight / 980), minimum, 1);
    const { minX, minY } = bounds(); camera.x = minX / 2; camera.y = minY / 2; paint();
  };
  const coast = () => {
    cancelAnimationFrame(frame);
    const tick = () => {
      camera.vx *= .91; camera.vy *= .91;
      if (Math.abs(camera.vx) + Math.abs(camera.vy) < .12) return;
      move(camera.vx, camera.vy); frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };

  objects.forEach(object => {
    const video = object.querySelector("video");
    for (const name of ["pointerenter", "focus"]) object.addEventListener(name, () => video?.play().catch(() => {}));
    for (const name of ["pointerleave", "blur"]) object.addEventListener(name, () => video?.pause());
    if (video && object.tagName === "BUTTON") object.addEventListener("click", () => video.paused ? video.play().catch(() => {}) : video.pause());
    object.addEventListener("focus", () => {
      const x = Number.parseFloat(object.style.getPropertyValue("--x")) * camera.scale;
      const y = Number.parseFloat(object.style.getPropertyValue("--y")) * camera.scale;
      camera.x = viewport.clientWidth / 2 - x - object.offsetWidth * camera.scale / 2;
      camera.y = viewport.clientHeight / 2 - y - object.offsetHeight * camera.scale / 2;
      contain(); paint();
    });
  });

  centre();
  requestAnimationFrame(() => root.classList.add("is-ready"));
  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    const dx = -event.deltaX - (event.shiftKey ? event.deltaY : 0);
    const dy = event.shiftKey ? 0 : -event.deltaY;
    camera.vx = dx * .36; camera.vy = dy * .36; move(dx, dy); coast();
  }, { passive: false });
  viewport.addEventListener("pointerdown", event => {
    cancelAnimationFrame(frame); camera.vx = camera.vy = 0;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
    viewport.setPointerCapture(event.pointerId); viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const now = performance.now(); const elapsed = Math.max(8, now - pointer.time);
    const dx = event.clientX - pointer.x; const dy = event.clientY - pointer.y;
    camera.vx = dx * (16 / elapsed); camera.vy = dy * (16 / elapsed); move(dx, dy);
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: now };
  });
  const release = event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    pointer = null; viewport.classList.remove("is-dragging"); coast();
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener("keydown", event => {
    const amount = event.shiftKey ? 220 : 84;
    const vector = { ArrowLeft:[amount,0], ArrowRight:[-amount,0], ArrowUp:[0,amount], ArrowDown:[0,-amount] }[event.key];
    if (!vector) return;
    event.preventDefault(); move(...vector);
  });
  window.addEventListener("resize", centre, { passive: true });
}
