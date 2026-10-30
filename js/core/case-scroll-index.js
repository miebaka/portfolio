/* A compact static-site adaptation of Kokonut UI's MIT-licensed Scroll Index. */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export function initCaseScrollIndex() {
  const chapters = [...document.querySelectorAll(".case-chapter[id]")];
  if (chapters.length < 2) return { destroy() {} };

  const nav = document.createElement("nav");
  nav.className = "case-scroll-index";
  nav.setAttribute("aria-label", "Case study progress");
  nav.innerHTML = '<span class="case-scroll-index__label" aria-hidden="true"></span><div class="case-scroll-index__rail"><span class="case-scroll-index__head" aria-hidden="true"></span></div>';
  const rail = nav.querySelector(".case-scroll-index__rail");
  const label = nav.querySelector(".case-scroll-index__label");
  const head = nav.querySelector(".case-scroll-index__head");
  const buttons = chapters.map((chapter, index) => {
    const text = document.querySelector(`.case-index a[href="#${chapter.id}"]`)?.textContent?.replace(/^\d+\s*/, "").trim() || chapter.querySelector("h2")?.textContent?.trim() || `Chapter ${index + 1}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-scroll-index__tick";
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Go to ${text}`);
    button.style.setProperty("--position", String(index / Math.max(chapters.length - 1, 1)));
    rail.append(button);
    return { button, chapter, text };
  });
  document.body.append(nav);

  let positions = [];
  let active = -1;
  let frame = 0;
  let dragging = false;
  let hideTimer = 0;
  const reduced = () => document.documentElement.dataset.motion === "reduced";
  const measure = () => {
    positions = chapters.map(chapter => chapter.getBoundingClientRect().top + scrollY);
  };
  const showLabel = (index, persist = false) => {
    const item = buttons[index];
    if (!item) return;
    label.textContent = item.text;
    label.style.setProperty("--position", String(index / Math.max(buttons.length - 1, 1)));
    nav.classList.add("is-label-visible");
    clearTimeout(hideTimer);
    if (!persist) hideTimer = window.setTimeout(() => nav.classList.remove("is-label-visible"), 900);
  };
  const paint = () => {
    frame = 0;
    const start = positions[0] || 0;
    const end = Math.max((positions.at(-1) || start + 1) - innerHeight * 0.25, start + 1);
    const progress = clamp((scrollY + innerHeight * 0.32 - start) / (end - start), 0, 1);
    head.style.setProperty("--progress", progress.toFixed(4));
    let next = 0;
    positions.forEach((position, index) => { if (position <= scrollY + innerHeight * 0.38) next = index; });
    if (next !== active) {
      active = next;
      buttons.forEach(({ button }, index) => {
        if (index === active) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      if (!dragging) showLabel(active);
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
  const jump = (index, immediate = false) => chapters[index]?.scrollIntoView({ behavior: immediate || reduced() ? "auto" : "smooth", block: "start" });
  const onClick = event => jump(Number(event.currentTarget.dataset.index));
  const onEnter = event => showLabel(Number(event.currentTarget.dataset.index), true);
  const onLeave = () => nav.classList.remove("is-label-visible");
  buttons.forEach(({ button }) => {
    button.addEventListener("click", onClick);
    button.addEventListener("pointerenter", onEnter);
    button.addEventListener("focus", onEnter);
    button.addEventListener("pointerleave", onLeave);
    button.addEventListener("blur", onLeave);
  });
  const railIndex = event => {
    const box = rail.getBoundingClientRect();
    const fraction = clamp((event.clientY - box.top) / box.height, 0, 1);
    return Math.round(fraction * (chapters.length - 1));
  };
  const onPointerDown = event => {
    if (event.button !== 0 || event.target.closest("button")) return;
    dragging = true;
    rail.setPointerCapture(event.pointerId);
    nav.classList.add("is-dragging");
    const index = railIndex(event);
    showLabel(index, true);
    jump(index, true);
  };
  const onPointerMove = event => {
    const box = rail.getBoundingClientRect();
    const y = event.clientY - box.top;
    buttons.forEach(({ button }) => {
      const tickY = Number(button.style.getPropertyValue("--position")) * box.height;
      button.style.setProperty("--swell", (1 + 1.25 * Math.exp(-((y - tickY) ** 2) / 900)).toFixed(3));
    });
    if (dragging) {
      const index = railIndex(event);
      showLabel(index, true);
      jump(index, true);
    }
  };
  const onPointerUp = () => {
    dragging = false;
    nav.classList.remove("is-dragging", "is-label-visible");
  };
  const onRailLeave = () => {
    if (!dragging) buttons.forEach(({ button }) => button.style.removeProperty("--swell"));
  };
  rail.addEventListener("pointerdown", onPointerDown);
  rail.addEventListener("pointermove", onPointerMove);
  rail.addEventListener("pointerup", onPointerUp);
  rail.addEventListener("pointercancel", onPointerUp);
  rail.addEventListener("pointerleave", onRailLeave);
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", measure);
  measure(); paint();

  return { destroy() {
    cancelAnimationFrame(frame); clearTimeout(hideTimer);
    removeEventListener("scroll", schedule); removeEventListener("resize", measure);
    nav.remove();
  } };
}
