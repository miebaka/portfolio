import { basePath, escapeHTML as esc, safeURL } from "../utilities/dom.js";

const mediaMarkup = (entry, base) => entry.type === "video"
  ? `<video src="${base}assets/experiments/${encodeURIComponent(entry.file)}" muted playsinline loop preload="metadata" aria-label="${esc(entry.title)}"></video>`
  : `<img src="${base}assets/experiments/${encodeURIComponent(entry.file)}" alt="${esc(entry.alt || entry.title)}" loading="eager" decoding="async">`;

export async function initExperimentsSpatial() {
  const root = document.querySelector("[data-experiments-spatial]");
  const viewport = root?.querySelector("[data-experiments-viewport]");
  const stage = root?.querySelector("[data-experiments-stage]");
  const status = root?.querySelector("[data-experiments-status]");
  if (!root || !viewport || !stage || !status) return;
  const base = basePath();
  let entries = [];
  try {
    const response = await fetch(`${base}assets/experiments/manifest.json`);
    if (response.ok) entries = await response.json();
  } catch {}
  if (!Array.isArray(entries) || !entries.length) {
    status.textContent = "Experiments could not be loaded.";
    return;
  }

  stage.innerHTML = entries.map((entry, index) => {
    const tag = entry.href ? "a" : entry.type === "video" ? "button" : "figure";
    const attrs = entry.href ? ` href="${safeURL(entry.href)}"` : entry.type === "video" ? ` type="button"` : ` tabindex="0"`;
    return `<${tag} class="experiment-tunnel__card"${attrs} style="--i:${index}" data-experiment-card>${mediaMarkup(entry, base)}<span>${String(index + 1).padStart(2, "0")} · ${esc(entry.title)}</span></${tag}>`;
  }).join("");

  const cards = [...stage.querySelectorAll("[data-experiment-card]")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let position = 0;
  let target = 0;
  let frame = 0;
  let dragging = null;
  const wrap = value => (value % cards.length + cards.length) % cards.length;
  const paint = () => {
    cards.forEach((card, index) => {
      let offset = index - position;
      while (offset > cards.length / 2) offset -= cards.length;
      while (offset < -cards.length / 2) offset += cards.length;
      const distance = Math.abs(offset);
      card.style.setProperty("--offset", offset.toFixed(3));
      card.style.setProperty("--distance", Math.min(distance, 5).toFixed(3));
      card.toggleAttribute("data-active", distance < .5);
      card.setAttribute("aria-hidden", distance > 3 ? "true" : "false");
    });
    status.textContent = `${Math.round(wrap(position)) + 1} of ${cards.length}`;
  };
  const animate = () => {
    position += (target - position) * (reduced ? 1 : .09);
    paint();
    if (Math.abs(target - position) > .001) frame = requestAnimationFrame(animate);
  };
  const go = delta => {
    target += delta;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
    root.classList.add("has-interacted");
  };
  viewport.addEventListener("wheel", event => { event.preventDefault(); go((event.deltaY || event.deltaX) * .0025); }, { passive: false });
  viewport.addEventListener("keydown", event => {
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (!delta) return;
    event.preventDefault(); go(delta);
  });
  viewport.addEventListener("pointerdown", event => { dragging = { x: event.clientX, target }; viewport.setPointerCapture(event.pointerId); });
  viewport.addEventListener("pointermove", event => { if (dragging) { target = dragging.target + (dragging.x - event.clientX) / Math.max(180, innerWidth * .22); cancelAnimationFrame(frame); frame = requestAnimationFrame(animate); } });
  const release = () => { if (!dragging) return; dragging = null; target = Math.round(target); cancelAnimationFrame(frame); frame = requestAnimationFrame(animate); };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  cards.forEach((card, index) => {
    const video = card.querySelector("video");
    card.addEventListener("focus", () => { target = index; cancelAnimationFrame(frame); frame = requestAnimationFrame(animate); });
    card.addEventListener("click", event => {
      if (card.tagName === "BUTTON") { event.preventDefault(); video?.paused ? video.play().catch(() => {}) : video?.pause(); }
    });
  });
  paint();
  requestAnimationFrame(() => root.classList.add("is-ready"));
}
