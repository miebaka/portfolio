/* Folder Rack interaction, adapted from the user's supplied HTML.
   Hit tests use mathematical logical positions, never animated DOM bounds. */
export function createFolderRackController(root) {
  const scroller = root.querySelector(".folder-rack__scroller");
  const track = root.querySelector(".folder-rack__track");
  const folders = [...track.querySelectorAll(".folder-rack__folder")];
  const n = folders.length;
  if (!n) return { destroy() {} };

  let active = -1, pitch = 72, width = 400, pointerType = "mouse";
  let frame = 0, pointerX = 0, opening = false;
  const reduced = () => document.documentElement.dataset.motion === "reduced" ||
    (document.documentElement.dataset.motion !== "full" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const localX = event => event.clientX - track.getBoundingClientRect().left;
  function measure() {
    width = folders[0].offsetWidth;
    const available = scroller.clientWidth;
    /* Same mathematical rack pitch as the reference, bounded for small viewports. */
    pitch = n > 2
      ? Math.max(44, Math.min(84, (available - 2 * width) / (n - 2)))
      : 72;
    track.style.setProperty("--rack-pitch", pitch + "px");
    track.style.width = Math.max(available, (Math.max(0, n - 2) * pitch + 2 * width + 8)) + "px";
  }
  function layout(index) {
    if (opening) return;
    active = index;
    const reveal = width - pitch;
    folders.forEach((folder, i) => {
      folder.style.setProperty("--rack-x", (i * pitch + (index >= 0 && i > index ? reveal : 0)) + "px");
      folder.classList.toggle("is-active", i === index);
    });
    track.classList.toggle("has-active", index >= 0);
  }
  function indexAt(x) {
    if (x < 0) return -1;
    const lastLeft = (n - 1) * pitch + (active >= 0 && active < n - 1 ? width - pitch : 0);
    if (active < 0) {
      const i = Math.floor(x / pitch);
      if (i < n - 1) return Math.max(0, i);
      return x < (n - 1) * pitch + width ? n - 1 : -1;
    }
    const left = active * pitch, right = left + width;
    if (x < left) return Math.max(0, Math.floor(x / pitch));
    if (x < right) return active;
    if (active === n - 1) return -1;
    const next = active + 1 + Math.floor((x - right) / pitch);
    if (next < n - 1) return next;
    return x < lastLeft + width ? n - 1 : -1;
  }
  function enter(index) {
    const folder = folders[index];
    if (!folder || opening) return;
    layout(index);
    opening = true;
    track.classList.add("is-opening");
    folder.classList.add("is-going");
    const href = folder.getAttribute("href");
    window.setTimeout(() => window.location.assign(href), reduced() ? 0 : 450);
  }
  const onMove = event => {
    pointerType = event.pointerType;
    if (event.pointerType === "touch" || opening) return;
    pointerX = localX(event);
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const index = indexAt(pointerX);
      if (index !== active) layout(index);
    });
  };
  const onLeave = event => {
    if (event.pointerType !== "touch" && !track.contains(document.activeElement)) layout(-1);
  };
  const onDown = event => { pointerType = event.pointerType; };
  const onClick = event => {
    if (event.target.closest(".folder-rack__folder")) return; // Native link is handled below.
    const index = indexAt(localX(event));
    if (index < 0) return;
    if (pointerType === "touch" && index !== active) { layout(index); return; }
    enter(index);
  };
  const onFocusIn = event => {
    const index = folders.indexOf(event.target.closest(".folder-rack__folder"));
    if (index >= 0) layout(index);
  };
  const onFocusOut = event => {
    if (!root.contains(event.relatedTarget)) layout(-1);
  };
  const onKey = event => {
    if (event.key === "Escape") { layout(-1); scroller.focus(); }
    if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
    event.preventDefault();
    const target = Math.min(n - 1, Math.max(0, active + (event.key === "ArrowRight" ? 1 : -1)));
    folders[target].focus({ preventScroll: true });
    layout(target);
    const left = target * pitch;
    scroller.scrollTo({ left: Math.max(0, left - pitch), behavior: reduced() ? "instant" : "smooth" });
  };
  const onNativeClick = folders.map((folder, index) => {
    const handler = event => {
      event.preventDefault();
      event.stopPropagation();
      enter(index);
    };
    folder.addEventListener("click", handler);
    return handler;
  });
  scroller.addEventListener("pointermove", onMove);
  scroller.addEventListener("pointerleave", onLeave);
  scroller.addEventListener("pointerdown", onDown);
  scroller.addEventListener("click", onClick);
  scroller.addEventListener("focusin", onFocusIn);
  scroller.addEventListener("focusout", onFocusOut);
  scroller.addEventListener("keydown", onKey);
  measure(); layout(-1);
  const resize = typeof ResizeObserver === "function"
    ? new ResizeObserver(() => { measure(); layout(active); })
    : null;
  resize?.observe(scroller);
  return {
    destroy() {
      resize?.disconnect();
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("pointermove", onMove);
      scroller.removeEventListener("pointerleave", onLeave);
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("click", onClick);
      scroller.removeEventListener("focusin", onFocusIn);
      scroller.removeEventListener("focusout", onFocusOut);
      scroller.removeEventListener("keydown", onKey);
      folders.forEach((folder, index) => folder.removeEventListener("click", onNativeClick[index]));
    },
    get activeIndex() { return active; }
  };
}

export function initFolderRacks() {
  const racks = [...document.querySelectorAll("[data-folder-rack]")];
  const controllers = racks.map(createFolderRackController);
  window.addEventListener("pagehide", () => controllers.forEach(controller => controller.destroy()), { once: true });
}
