import { basePath, escapeHTML as esc, safeURL } from "../utilities/dom.js";

// Only authored media filenames may enter an asset URL; never allow path segments.
const validMediaFile = file => typeof file === "string" &&
  !file.includes("/") && !file.includes("\\") &&
  !/[\x00-\x1f]/.test(file) &&
  /\.(?:avif|webp|jpe?g|png|gif|mp4|webm)$/i.test(file);

export const renderExperimentMediaMarkup = (entry, base = "", index = 0) => {
  if (!validMediaFile(entry?.file)) return "";
  const source = base + "assets/experiments/" + encodeURIComponent(entry.file);
  return entry.type === "video"
    ? `<video src="${source}" muted playsinline loop preload="metadata" aria-label="${esc(entry.title)}"></video>`
    : `<img src="${source}" alt="${esc(entry.alt || entry.title)}" loading="${index < 2 ? "eager" : "lazy"}" decoding="async">`;
};

export async function initExperimentsSpatial() {
  const root = document.querySelector("[data-experiments-spatial]");
  const viewport = root?.querySelector("[data-experiments-viewport]");
  const stage = root?.querySelector("[data-experiments-stage]");
  const status = root?.querySelector("[data-experiments-status]");
  const title = root?.querySelector("[data-experiment-title]");
  const caption = root?.querySelector("[data-experiment-caption]");
  const counter = root?.querySelector("[data-experiments-counter]");
  const indexButton = root?.querySelector("[data-experiments-index]");
  const indexPanel = root?.querySelector("[data-experiments-list]");
  const closeButton = root?.querySelector("[data-experiments-close]");
  const previousButton = root?.querySelector("[data-experiments-previous]");
  const nextButton = root?.querySelector("[data-experiments-next]");
  if (!root || !viewport || !stage || !status) return;
  const base = basePath();
  let entries = [];
  try {
    const response = await fetch(`${base}assets/experiments/manifest.json`);
    if (response.ok) entries = await response.json();
  } catch {}
  if (Array.isArray(entries)) entries = entries.filter(entry =>
    entry && validMediaFile(entry.file) && typeof entry.title === "string" &&
    (entry.type === "image" || entry.type === "video"));
  if (!Array.isArray(entries) || !entries.length) {
    status.textContent = "Experiments could not be loaded.";
    stage.innerHTML = '<p class="experiments-empty">The visual archive is unavailable. <a href="work.html">Explore selected work</a>.</p>';
    return;
  }

  stage.innerHTML = entries.map((entry, index) => {
    // Every artwork is an honest link to its complete original file.
    const tag = "a";
    const source = base + "assets/experiments/" + encodeURIComponent(entry.file);
    const attrs = ' href="' + (entry.href ? safeURL(entry.href) : source) + '" target="_blank" rel="noopener noreferrer" aria-label="View ' + esc(entry.title) + ' full artwork"';
    return `<${tag} class="experiment-poster"${attrs} style="--i:${index}" data-experiment-card data-title="${esc(entry.title)}"><span class="experiment-poster__face">${renderExperimentMediaMarkup(entry, base, index)}</span><span class="experiment-poster__label"><b>${esc(entry.title)}</b><i>${String(index + 1).padStart(2, "0")}</i></span></${tag}>`;
  }).join("");

  const cards = [...stage.querySelectorAll("[data-experiment-card]")];
  const reducedMotion = () => document.documentElement.dataset.motion === "reduced" ||
    (document.documentElement.dataset.motion !== "full" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const wrap = value => (value % cards.length + cards.length) % cards.length;
  const readHash = () => {
    const match = location.hash.match(/^#study-(\d{2})$/);
    const number = match ? Number(match[1]) : 1;
    return Number.isInteger(number) && number >= 1 && number <= cards.length ? number - 1 : 0;
  };
  let position = readHash();
  let target = position;
  let frame = 0;
  let dragging = null;
  let wheelTotal = 0;
  let wheelTimer = 0;
  let activeIndex = -1;
  const paint = () => {
    cards.forEach((card, index) => {
      let offset = index - position;
      while (offset > cards.length / 2) offset -= cards.length;
      while (offset < -cards.length / 2) offset += cards.length;
      const distance = Math.abs(offset);
      card.style.setProperty("--offset", offset.toFixed(3));
      card.style.setProperty("--distance", Math.min(distance, 5).toFixed(3));
      const active = distance < .5;
      // Wake just the selected poster and its neighbors; the rest remain lazy.
      if (distance < 1.6) {
        const image = card.querySelector("img");
        if (image) image.loading = "eager";
      }
      card.toggleAttribute("data-active", active);
      card.setAttribute("aria-hidden", distance > 3 ? "true" : "false");
      card.tabIndex = active ? 0 : -1;
      if (active && activeIndex !== index) {
        activeIndex = index;
        if (title) title.textContent = card.dataset.title;
        if (caption) caption.textContent = card.dataset.title;
        if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        status.textContent = `${card.dataset.title}, ${index + 1} of ${cards.length}`;
      }
    });
  };
  const animate = () => {
    position += (target - position) * (reducedMotion() ? 1 : .09);
    paint();
    if (Math.abs(target - position) > .001) frame = requestAnimationFrame(animate);
    else {
      // Keep indefinitely browsable indices small after many loops.
      position = wrap(Math.round(target));
      target = position;
      paint();
      frame = 0;
    }
  };
  const moveTo = (next, record = true) => {
    const current = wrap(Math.round(target));
    const chosen = wrap(next);
    const forward = wrap(chosen - current);
    const delta = forward > cards.length / 2 ? forward - cards.length : forward;
    target = Math.round(target) + delta;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
    root.classList.add("has-interacted");
    if (record && chosen !== current) history.pushState({ study: chosen }, "", "#study-" + String(chosen + 1).padStart(2, "0"));
  };
  const go = delta => moveTo(Math.round(target) + delta);
  const onHistory = () => moveTo(readHash(), false);
  addEventListener("popstate", onHistory);
  addEventListener("hashchange", onHistory);
  viewport.addEventListener("wheel", event => {
    // Only horizontal trackpad gestures browse art. Vertical wheel input
    // remains native so the visitor can reach the next section and footer.
    const sideways = Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (event.ctrlKey || (!sideways && !event.shiftKey)) return;
    event.preventDefault();
    wheelTotal += sideways ? event.deltaX : event.deltaY;
    clearTimeout(wheelTimer);
    if (Math.abs(wheelTotal) >= 36) {
      go(Math.sign(wheelTotal));
      wheelTotal = 0;
    }
    wheelTimer = setTimeout(() => { wheelTotal = 0; }, 140);
  }, { passive: false });
  viewport.addEventListener("keydown", event => {
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[event.key];
    if (!delta) return;
    event.preventDefault(); go(delta);
  });
  let blockClick = false;
  viewport.addEventListener("pointerdown", event => {
    if (event.button !== 0 || (event.pointerType === "mouse" && event.target.closest("a,button") && event.detail === 0)) return;
    dragging = { x: event.clientX, y: event.clientY, startX: event.clientX,
      target, time: performance.now(), lastX: event.clientX, velocity: 0, moved: false };
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;
    if (!dragging.moved) {
      if (Math.abs(event.clientY - dragging.y) > Math.abs(event.clientX - dragging.startX) + 8) { dragging = null; return; }
      if (Math.abs(event.clientX - dragging.startX) < 8) return;
      dragging.moved = true;
      viewport.classList.add("is-dragging");
      if (event.pointerType !== "touch") viewport.setPointerCapture(event.pointerId);
    }
    const now = performance.now();
    const elapsed = Math.max(1, now - dragging.time);
    dragging.velocity = (dragging.lastX - event.clientX) / elapsed;
    dragging.lastX = event.clientX;
    dragging.time = now;
    target = dragging.target + (dragging.x - event.clientX) / Math.max(180, innerWidth * .3);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
  });
  const release = event => {
    if (!dragging) return;
    if (dragging.moved) {
      blockClick = true;
      // A completed drag may suppress the synthetic click entirely. Do not
      // make the next independent click a dead interaction.
      setTimeout(() => { blockClick = false; }, 180);
      const velocity = reducedMotion() ? 0 : dragging.velocity * 1.8;
      moveTo(Math.round(target + velocity));
    }
    dragging = null;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener("pointerup", release);
  viewport.addEventListener("pointercancel", release);
  cards.forEach((card, index) => {
    const video = card.querySelector("video");
    card.addEventListener("focus", () => moveTo(index, false));
    card.addEventListener("click", event => {
      if (blockClick) { blockClick = false; event.preventDefault(); return; }
      if (index !== activeIndex) { event.preventDefault(); moveTo(index); return; }
      if (video) video.pause();
    });
  });
  previousButton?.addEventListener("click", () => go(-1));
  nextButton?.addEventListener("click", () => go(1));
  if (indexPanel && indexButton) {
    const list = indexPanel.querySelector("ol");
    list.innerHTML = entries.map((entry, index) => `<li><button type="button" data-experiment-jump="${index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${esc(entry.title)}</b><i>${esc(entry.category || "Experiment")}</i></button></li>`).join("");
    const closeIndex = (restore = true) => { indexPanel.hidden = true; root.removeAttribute("data-index-open"); indexButton.setAttribute("aria-expanded", "false"); if (restore) indexButton.focus(); };
    const openIndex = () => { indexPanel.hidden = false; root.setAttribute("data-index-open", ""); indexButton.setAttribute("aria-expanded", "true"); closeButton?.focus(); };
    indexButton.addEventListener("click", () => indexPanel.hidden ? openIndex() : closeIndex());
    closeButton?.addEventListener("click", () => closeIndex());
    indexPanel.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); closeIndex(); return; }
      if (event.key !== "Tab") return;
      const focusable = [...indexPanel.querySelectorAll("button")];
      const first = focusable[0]; const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    list.addEventListener("click", event => {
      const button = event.target.closest("[data-experiment-jump]");
      if (!button) return;
      moveTo(Number(button.dataset.experimentJump));
      closeIndex(false);
      viewport.focus();
    });
  }
  paint();
  addEventListener("pagehide", () => { removeEventListener("popstate", onHistory); removeEventListener("hashchange", onHistory); cancelAnimationFrame(frame); }, { once: true });
}
