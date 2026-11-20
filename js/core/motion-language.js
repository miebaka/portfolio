/* Cohesive motion enhancements. No framework, scroll listeners, or content cloning.
   Pointer work is confined to visible interactive surfaces; content stays usable
   without this module. Inspiration: OriginKit hover-image reveal, 21st.dev
   spotlight cards, Kawai's masked/blur entrances, and the existing DESIGN.md. */

const PROJECT = ".home-project-list .editorial-index__row";
const CARD = ".service-stack__card";
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

export function isMotionReduced(root, systemQuery) {
  const setting = root?.dataset?.motion;
  return setting === "reduced" || (setting !== "full" && systemQuery?.matches === true);
}

export function pointerDisplacement(rect, x, y, maxX = 28, maxY = 16) {
  if (!rect || rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
  return {
    x: clamp(((x - rect.left) / rect.width - 0.5) * 2, -1, 1) * maxX,
    y: clamp(((y - rect.top) / rect.height - 0.5) * 2, -1, 1) * maxY,
  };
}

export function initMotionLanguage({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  if (!doc?.documentElement || !win) return { destroy() {} };
  const root = doc.documentElement;
  const projects = doc.querySelector(".home-project-list");
  const services = doc.querySelector(".service-stack");
  const systemQuery = win.matchMedia?.("(prefers-reduced-motion: reduce)");
  const finePointer = win.matchMedia?.("(hover: hover) and (pointer: fine)");
  let enabled = false;
  let destroyed = false;
  let frame = 0;
  let next = null;

  const resetProject = row => {
    row.style.removeProperty("--motion-preview-x");
    row.style.removeProperty("--motion-preview-y");
  };
  const resetCard = card => {
    card.style.removeProperty("--motion-card-x");
    card.style.removeProperty("--motion-card-y");
  };
  const resetPointers = () => {
    projects?.querySelectorAll(PROJECT).forEach(resetProject);
    services?.querySelectorAll(CARD).forEach(resetCard);
  };
  const pointerEnabled = () => enabled && finePointer?.matches === true;
  const clearFrame = () => {
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    next = null;
  };

  const flush = () => {
    frame = 0;
    const current = next;
    next = null;
    if (!current || !pointerEnabled() || !current.target.isConnected) return;
    const { target, x, y, kind } = current;
    const bounds = target.getBoundingClientRect();
    if (kind === "project") {
      const offset = pointerDisplacement(bounds, x, y);
      target.style.setProperty("--motion-preview-x", offset.x.toFixed(1) + "px");
      target.style.setProperty("--motion-preview-y", offset.y.toFixed(1) + "px");
    } else if (bounds.width > 0 && bounds.height > 0) {
      target.style.setProperty("--motion-card-x", clamp((x - bounds.left) / bounds.width * 100, 0, 100).toFixed(1) + "%");
      target.style.setProperty("--motion-card-y", clamp((y - bounds.top) / bounds.height * 100, 0, 100).toFixed(1) + "%");
    }
  };

  const move = (event, selector, kind) => {
    if (!pointerEnabled()) return;
    const target = event.target.closest?.(selector);
    if (!target) return;
    next = { target, x: event.clientX, y: event.clientY, kind };
    if (!frame) frame = win.requestAnimationFrame(flush);
  };
  const onProjectMove = event => move(event, PROJECT, "project");
  const onCardMove = event => move(event, CARD, "card");
  const leave = (event, selector, reset) => {
    const target = event.target.closest?.(selector);
    if (target && !target.contains(event.relatedTarget)) reset(target);
  };
  const onProjectLeave = event => leave(event, PROJECT, resetProject);
  const onCardLeave = event => leave(event, CARD, resetCard);

  const sync = () => {
    if (destroyed) return;
    enabled = !isMotionReduced(root, systemQuery);
    root.classList.toggle("motion-language-ready", enabled);
    if (!pointerEnabled()) {
      clearFrame();
      resetPointers();
    }
  };
  projects?.addEventListener("pointermove", onProjectMove, { passive: true });
  projects?.addEventListener("pointerout", onProjectLeave);
  services?.addEventListener("pointermove", onCardMove, { passive: true });
  services?.addEventListener("pointerout", onCardLeave);
  systemQuery?.addEventListener?.("change", sync);
  finePointer?.addEventListener?.("change", sync);
  const PreferenceObserver = win.MutationObserver;
  const preferences = PreferenceObserver ? new PreferenceObserver(sync) : null;
  preferences?.observe(root, { attributes: true, attributeFilter: ["data-motion"] });
  sync();

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      clearFrame();
      resetPointers();
      root.classList.remove("motion-language-ready");
      projects?.removeEventListener("pointermove", onProjectMove);
      projects?.removeEventListener("pointerout", onProjectLeave);
      services?.removeEventListener("pointermove", onCardMove);
      services?.removeEventListener("pointerout", onCardLeave);
      systemQuery?.removeEventListener?.("change", sync);
      finePointer?.removeEventListener?.("change", sync);
      preferences?.disconnect();
    },
  };
}
