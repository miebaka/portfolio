/* Both Home and Work use one vertical landscape-folder interaction.
   Logical hit-testing keeps the overlapped native links reachable as folders
   slide into view. Touch previews once, then navigates on the second tap. */
import { navigateToCase } from "./case-route-transition.js";

function enhance(list) {
  const folders = [...list.children].filter(el => el.matches(".project-folder"));
  if (!folders.length) return;
  const viewport = list.parentElement;
  const isHome = document.body.dataset.page === "home";
  let active = -1;
  let pitch = 0;
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

  // File-cabinet physics: lift a folder by a bounded amount but leave it
  // behind every folder in front of it. Never promote its paint-order depth.
  // Measured hit areas and transforms use CSS pixels; authored dimensions
  // are converted back into em so browser text scaling remains effective.
  const em = () => Number.parseFloat(getComputedStyle(list).fontSize) || 16;
  const relativeLength = (element, pixels) => {
    const fontSize = Number.parseFloat(getComputedStyle(element).fontSize) || em();
    return (pixels / fontSize).toFixed(4) + "em";
  };
  const homeRise = () => Math.min(9.5 * em(), size * .29);
  const homeBase = () => homeRise() + .5 * em();

  function homeIndexAt(value) {
    if (!size) return -1;
    const y = value - homeBase();
    if (y < 0) return active >= 0 ? active : -1;
    const index = Math.floor(y / pitch);
    if (index < folders.length - 1) return Math.max(0, index);
    return y < (folders.length - 1) * pitch + size ? folders.length - 1 : -1;
  }

  function indexForEvent(event) {
    if (!isHome) return indexAt(local(event));
    const node = event.target instanceof Element ? event.target.closest(".project-folder") : null;
    const targetIndex = folders.indexOf(node);
    return targetIndex >= 0 ? targetIndex : homeIndexAt(local(event));
  }

  function layout(index) {
    if (entering) return;
    active = index;
    const shift = size - pitch;
    folders.forEach((folder, i) => {
      const offset = isHome
        ? homeBase() + i * pitch - (i === index ? homeRise() : 0)
        : i * pitch + (index >= 0 && i > index ? shift : 0);
      folder.style.setProperty("--folder-y", offset + "px");
      folder.classList.toggle("is-active", i === index);
    });
    list.classList.toggle("has-active", index >= 0);
    list.dataset.activeIndex = String(index);
  }

  function measure() {
    // Work stays compact. Home measures the actual What I Do cards rather
    // than assuming a viewport-based size or breaking the native scroll.
    const unit = em();
    const navHeight = document.querySelector('header[data-mount="nav"]')?.getBoundingClientRect().height || 4.5 * unit;
    const reserved = navHeight + Math.min(8 * unit, Math.max(5 * unit, window.innerHeight * .12));
    const available = Math.max(13.125 * unit, window.innerHeight - reserved - 1.375 * unit);
    const mobileHome = isHome && matchMedia("(max-width: 48em)").matches;
    const serviceCards = isHome
      ? [...document.querySelectorAll("#what-i-do .service-stack__card")]
      : [];
    // Clear previous inline sizes before remeasuring, so mobile rotation and
    // responsive text can shrink as well as grow without retaining old heights.
    serviceCards.forEach(card => card.style.removeProperty("min-height"));
    // Desktop retains exact panel-to-folder height parity. On phones the
    // proof is a natural-height reading list; folders become compact files
    // instead of forcing five oversized sticky cards back into the layout.
    const height = mobileHome
      ? Math.max(17 * unit, Math.min(21 * unit, window.innerHeight * .38))
      : serviceCards.length
        ? Math.max(...serviceCards.map(card => card.getBoundingClientRect().height))
        : Math.min(18.75 * unit, Math.max(5.75 * unit, (available - 1.25 * unit) / 2.4));
    if (serviceCards.length && !mobileHome) {
      serviceCards.forEach(card => { card.style.minHeight = relativeLength(card, height); });
    }
    list.style.setProperty("--work-folder-height", relativeLength(list, height));
    size = folders[0].offsetHeight;
    if (!size) return;
    const count = folders.length;
    const free = Math.max(0, available - 2 * size - .75 * unit);
    pitch = isHome
      ? size * .34
      : count > 2
        ? Math.max(1.125 * unit, Math.min(5.625 * unit, size * .34, free / (count - 2)))
        : Math.min(5.625 * unit, size * .34);
    const expanded = count === 1 ? size : 2 * size + (count - 2) * pitch;
    // The Home list reserves opening space above the rest position, not
    // below it. The final folder's bottom therefore meets the section foot.
    const restingHeight = (count - 1) * pitch + size;
    list.style.height = Math.ceil((isHome ? homeBase() + restingHeight : expanded) + 2) + "px";
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
    pending = isHome ? indexForEvent(event) : local(event);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = isHome ? pending : indexAt(pending);
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
    const index = keyboard ? focusIndex : indexForEvent(event);
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
