import { basePath, escapeHTML as esc, safeURL } from "../utilities/dom.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mediaMarkup = (entry, base) => entry.type === "video"
  ? `<video src="${base}assets/experiments/${esc(entry.file)}" muted playsinline loop preload="metadata" aria-label="${esc(entry.title)}"></video>`
  : `<img src="${base}assets/experiments/${esc(entry.file)}" alt="${esc(entry.alt || entry.title)}" loading="lazy" decoding="async">`;

export async function initExperimentsSpatial() {
  const root = document.querySelector("[data-experiments-spatial]");
  if (!root) return;
  const viewport = root.querySelector("[data-experiments-viewport]");
  const stage = root.querySelector("[data-experiments-stage]");
  const empty = root.querySelector("[data-experiments-empty]");
  const title = root.querySelector("[data-experiment-title]");
  const meta = root.querySelector("[data-experiment-meta]");
  const count = root.querySelector("[data-experiment-count]");
  const base = basePath();
  let entries = [];
  try {
    const response = await fetch(`${base}assets/experiments/manifest.json`);
    if (response.ok) entries = await response.json();
  } catch {}

  if (!Array.isArray(entries) || !entries.length) {
    empty.hidden = false;
    count.textContent = "00 works";
    return;
  }

  const virtual = { width: 3200, height: 2200 };
  stage.style.setProperty("--stage-w", `${virtual.width}px`);
  stage.style.setProperty("--stage-h", `${virtual.height}px`);
  stage.innerHTML = entries.map((entry, index) => {
    const tag = entry.href ? "a" : "button";
    const href = entry.href ? ` href="${safeURL(entry.href)}" target="_blank" rel="noopener noreferrer"` : ' type="button"';
    return `<${tag} class="experiment-object"${href} style="--x:${entry.x}px;--y:${entry.y}px;--w:${entry.width}px;--z:${index + 1}" data-title="${esc(entry.title)}" data-meta="${esc(entry.category || "Experiment")}">${mediaMarkup(entry, base)}</${tag}>`;
  }).join("");
  count.textContent = `${String(entries.length).padStart(2, "0")} works`;

  const objects = [...stage.querySelectorAll(".experiment-object")];
  const setCaption = object => {
    title.textContent = object?.dataset.title || "Experiments";
    meta.textContent = object?.dataset.meta || "Self-initiated work";
  };
  objects.forEach(object => {
    object.addEventListener("pointerenter", () => setCaption(object));
    object.addEventListener("focus", () => {
      setCaption(object);
      const x = Number.parseFloat(object.style.getPropertyValue("--x"));
      const y = Number.parseFloat(object.style.getPropertyValue("--y"));
      camera.x = clamp(viewport.clientWidth / 2 - x - object.offsetWidth / 2, viewport.clientWidth - virtual.width, 0);
      camera.y = clamp(viewport.clientHeight / 2 - y - object.offsetHeight / 2, viewport.clientHeight - virtual.height, 0);
      render();
    });
    const video = object.querySelector("video");
    object.addEventListener("pointerenter", () => video?.play().catch(() => {}));
    object.addEventListener("pointerleave", () => video?.pause());
  });

  const camera = { x: 0, y: 0 };
  let pointer = null;
  const bounds = () => ({ minX: Math.min(0, viewport.clientWidth - virtual.width), minY: Math.min(0, viewport.clientHeight - virtual.height) });
  const render = () => { stage.style.transform = `translate3d(${camera.x}px,${camera.y}px,0)`; };
  const move = (dx, dy) => {
    const { minX, minY } = bounds();
    camera.x = clamp(camera.x + dx, minX, 0);
    camera.y = clamp(camera.y + dy, minY, 0);
    render();
  };
  const centre = () => {
    const { minX, minY } = bounds();
    camera.x = minX / 2;
    camera.y = minY / 2;
    render();
  };
  centre();

  viewport.addEventListener("wheel", event => {
    event.preventDefault();
    move(-event.deltaX - (event.shiftKey ? event.deltaY : 0), event.shiftKey ? 0 : -event.deltaY);
  }, { passive: false });
  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".experiment-object")) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    move(event.clientX - pointer.x, event.clientY - pointer.y);
    pointer.x = event.clientX; pointer.y = event.clientY;
  });
  const release = event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    pointer = null; viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  viewport.addEventListener("keydown", event => {
    const amount = event.shiftKey ? 180 : 70;
    const vector = { ArrowLeft: [amount, 0], ArrowRight: [-amount, 0], ArrowUp: [0, amount], ArrowDown: [0, -amount] }[event.key];
    if (!vector) return;
    event.preventDefault(); move(...vector);
  });
  window.addEventListener("resize", centre, { passive: true });
}
