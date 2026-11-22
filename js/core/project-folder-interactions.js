/* Both Home and Work use one vertical landscape-folder interaction.
   Logical hit-testing keeps the overlapped native links reachable as folders
   slide into view. Touch previews once, then navigates on the second tap. */
import { navigateToCase } from "./case-route-transition.js";

function enhance(list) {
  const folders = [...list.children].filter(el => el.matches(".project-folder"));
  if (!folders.length) return;
  const viewport = list.parentElement;
  const home = document.body.dataset.page === "home";
  let active = -1;
  let pitch = 0;
  let reveal = 0;
  let size = 0;
  let lastPointer = "mouse";
  let touchPreview = -1;
  let frame = 0;
  let pending = 0;
  let entering = false;

  const local = event => event.clientY - list.getBoundingClientRect().top;

  function indexAt(value) {
    if (value < 0 || !size) return -1;
    const n = folders.length;
    if (home) {
      // The next sheet always remains painted ABOVE the preceding folder,
      // including while the preceding folder is hovered or keyboard-focused.
      // Use the same measured offsets as layout(), so concealed surfaces
      // never steal hover or pointer activation from the visible folder.
      let hit = -1;
      for (let i = 0; i < n; i++) {
        const offset = i * pitch + (active >= 0 && i > active ? reveal : 0);
        const lift = i === active ? -14 : 0;
        if (value >= offset + lift && value < offset + size + lift) hit = i;
      }
      return hit;
    }
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
    const shift = home ? reveal : size - pitch;
    folders.forEach((folder, i) => {
      const offset = i * pitch + (index >= 0 && i > index ? shift : 0);
      folder.style.setProperty("--folder-y", offset + "px");
      folder.classList.toggle("is-active", i === index);
    });
    list.classList.toggle("has-active", index >= 0);
    list.dataset.activeIndex = String(index);
  }

  function measure() {
    // Work measures the space below its heading; Home is below the fold so
    // measuring its initial absolute Y would make every folder far too short.
    const top = home
      ? (document.querySelector('header[data-mount="nav"]')?.getBoundingClientRect().height || 72) + 24
      : Math.max(0, viewport.getBoundingClientRect().top);
    const available = Math.max(210, window.innerHeight - top - 22);
    const compactHeight = Math.min(300, Math.max(92, (available - 20) / 2.4));
    const height = home ? compactHeight * 2 : compactHeight;
    list.style.setProperty("--work-folder-height", height.toFixed(2) + "px");
    size = folders[0].offsetHeight;
    if (!size) return;
    const count = folders.length;
    if (home) {
      // Home folders are twice as tall as Work's compact versions, but
      // opening one only spreads later folders enough to expose its upper
      // portion. The next folder still conceals most of its lower face.
      pitch = Math.min(170, Math.max(65, size * .26));
      reveal = size * .22;
    } else {
      const free = Math.max(0, available - 2 * size - 12);
      pitch = count > 2
        ? Math.max(18, Math.min(90, size * .34, free / (count - 2)))
        : Math.min(90, size * .34);
      reveal = size - pitch;
    }
    const expanded = home
      ? size + (count - 1) * pitch + (count > 1 ? reveal : 0)
      : count === 1 ? size : 2 * size + (count - 2) * pitch;
    list.style.height = Math.ceil(expanded + 2) + "px";
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

  const refresh = () => measure();
  window.addEventListener("resize", refresh, { passive: true });
  document.fonts?.ready?.then(refresh);
  window.addEventListener("pagehide", () => {
    window.removeEventListener("resize", refresh);
  }, { once: true });

  addEventListener("pagehide", () => {
    if (frame) cancelAnimationFrame(frame);
  }, { once: true });
}

export function initProjectFolderInteractions() {
  document.querySelectorAll(".project-folder-stack__cards").forEach(enhance);
}
