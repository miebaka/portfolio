/* Shared landscape-folder rack interaction. Logical hit-testing means
   overlapped folders remain individually reachable while their positions animate.
   Native links and static folders work without JavaScript. */
import { navigateToCase } from "./case-route-transition.js";

function enhance(list) {
  const folders = [...list.children].filter(el => el.matches(".project-folder"));
  if (!folders.length) return;
  const standing = list.dataset.orientation === "portrait";
  const viewport = standing ? list.closest(".home-folder-stack__viewport") : list.parentElement;
  const sizeOf = () => standing ? folders[0].offsetWidth : folders[0].offsetHeight;
  let active = -1;
  let pitch = 0;
  let size = 0;
  let origin = 0;
  let lastPointer = "mouse";
  let touchPreview = -1;
  let frame = 0;
  let pending = 0;
  let entering = false;

  const local = e => {
    const rect = list.getBoundingClientRect();
    return (standing ? e.clientX - rect.left : e.clientY - rect.top) - origin;
  };

  function indexAt(value) {
    if (value < 0 || !size) return -1;
    const n = folders.length;
    if (n === 1) return value < size ? 0 : -1;
    const lastLeft = (n - 1) * pitch + (active >= 0 && active < n - 1 ? size - pitch : 0);
    if (active < 0) {
      const index = Math.floor(value / pitch);
      if (index < n - 1) return Math.max(0, index);
      return value < (n - 1) * pitch + size ? n - 1 : -1;
    }
    const left = active * pitch;
    const right = left + size;
    if (value < left) return Math.max(0, Math.floor(value / pitch));
    if (value < right) return active;
    if (active === n - 1) return -1;
    const index = active + 1 + Math.floor((value - right) / pitch);
    if (index < n - 1) return index;
    return value < lastLeft + size ? n - 1 : -1;
  }

  function layout(index) {
    if (entering) return;
    active = index;
    const reveal = size - pitch;
    folders.forEach((folder, i) => {
      const offset = origin + i * pitch + (index >= 0 && i > index ? reveal : 0);
      folder.style.setProperty("--folder-x", standing ? offset + "px" : "0px");
      folder.style.setProperty("--folder-y", standing ? "0px" : offset + "px");
      folder.classList.toggle("is-active", i === index);
    });
    list.classList.toggle("has-active", index >= 0);
    list.dataset.activeIndex = String(index);
  }

  function measure() {
    const n = folders.length;
    if (standing) {
      size = sizeOf();
      if (!size) return;
      const available = viewport.clientWidth;
      pitch = n > 2 ? Math.max(52, Math.min(88, (available - 2 * size) / (n - 2))) : 72;
      const expanded = n === 1 ? size : 2 * size + (n - 2) * pitch;
      origin = Math.max(0, (available - expanded) / 2);
      list.style.width = Math.ceil(Math.max(available, origin + expanded + 4)) + "px";
    } else {
      // Use the ACTUAL space below the heading, not a width-derived file height.
      // A fully opened middle/first folder takes 2 file-heights plus the
      // visible pitches of any other folders. Reserve room for hover lift.
      const home = document.body.dataset.page === "home";
      const top = home
        ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 75) + 24
        : Math.max(0, viewport.getBoundingClientRect().top);
      const available = Math.max(210, window.innerHeight - top - 22);
      const height = Math.min(300, Math.max(92, (available - 20) / 2.4));
      list.style.setProperty("--work-folder-height", height.toFixed(2) + "px");
      size = sizeOf();
      if (!size) return;
      const free = Math.max(0, available - 2 * size - 12);
      pitch = n > 2
        ? Math.max(18, Math.min(90, size * .34, free / (n - 2)))
        : Math.min(90, size * .34);
      origin = 0;
      const expanded = n === 1 ? size : 2 * size + (n - 2) * pitch;
      list.style.height = Math.ceil(expanded + 2) + "px";
    }
    layout(active);
  }

  function enter(index) {
    const folder = folders[index];
    const link = folder?.querySelector(".project-folder__link");
    if (!link || entering) return;
    layout(index);
    entering = true;
    list.classList.add("is-opening");
    folder.classList.add("is-going");
    navigateToCase(link.href);
  }

  const pointerMove = event => {
    lastPointer = event.pointerType || "mouse";
    if (lastPointer === "touch" || entering) return;
    touchPreview = -1;
    pending = local(event);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = indexAt(pending);
      if (index !== active) layout(index);
    });
  };

  const pointerLeave = event => {
    if (event.pointerType !== "touch" && !entering &&
        !list.contains(document.activeElement)) layout(-1);
  };

  const pointerDown = event => {
    lastPointer = event.pointerType || "mouse";
  };

  const click = event => {
    if (entering || event.defaultPrevented ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        (event.button !== undefined && event.button !== 0)) return;
    const link = event.target instanceof Element
      ? event.target.closest(".project-folder__link") : null;
    const focusIndex = link ? folders.indexOf(link.closest(".project-folder")) : -1;
    // A real keyboard activation selects the focused native link, not a
    // coordinate inherited from a previous pointer.
    const keyboard = event.detail === 0 && focusIndex >= 0;
    const index = keyboard ? focusIndex : indexAt(local(event));
    if (index < 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (!keyboard && lastPointer === "touch" && index !== touchPreview) {
      // Touch focus may activate the anchor before click. A separate
      // preview marker guarantees the first tap NEVER navigates.
      touchPreview = index;
      layout(index);
      return;
    }
    enter(index);
  };

  list.classList.add("is-folder-interactive");
  list.addEventListener("pointermove", pointerMove);
  list.addEventListener("pointerleave", pointerLeave);
  list.addEventListener("pointerdown", pointerDown);
  list.addEventListener("click", click);

  folders.forEach((folder, index) => {
    folder.querySelector(".project-folder__link")?.addEventListener("focus", () => layout(index));
  });
  list.addEventListener("focusout", event => {
    if (!list.contains(event.relatedTarget) && !entering) layout(-1);
  });
  measure();

  if (typeof ResizeObserver !== "undefined") {
    let priorWidth = viewport.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const width = viewport.getBoundingClientRect().width;
      if (Math.abs(width - priorWidth) < .5) return;
      priorWidth = width;
      measure();
    });
    observer.observe(viewport);
    addEventListener("pagehide", () => observer.disconnect(), { once: true });
  }

  // Remeasure Work and Home on viewport height/width changes and font load.
  {
    const refresh = () => measure();
    window.addEventListener("resize", refresh, { passive: true });
    document.fonts?.ready?.then(refresh);
    window.addEventListener("pagehide", () => {
      window.removeEventListener("resize", refresh);
    }, { once: true });
  }

  addEventListener("pagehide", () => {
    if (frame) cancelAnimationFrame(frame);
  }, { once: true });
}

export function initProjectFolderInteractions() {
  document.querySelectorAll(".project-folder-stack__cards").forEach(enhance);
}
