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
    const text = chapter.querySelector("h2")?.textContent?.trim() || `Chapter ${index + 1}`;
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

  let active = -1;
  let dragging = false;
  let hideTimer = 0;
  const showLabel = (index, persist = false) => {
    const item = buttons[index];
    if (!item) return;
    label.textContent = item.text;
    label.style.setProperty("--position", String(index / Math.max(buttons.length - 1, 1)));
    nav.classList.add("is-label-visible");
    clearTimeout(hideTimer);
    if (!persist) hideTimer = window.setTimeout(() => nav.classList.remove("is-label-visible"), 900);
  };
  const activate = next => {
    if (next !== active) {
      active = next;
      buttons.forEach(({ button }, index) => {
        if (index === active) button.setAttribute("aria-current", "step");
        else button.removeAttribute("aria-current");
      });
      if (!dragging) showLabel(active);
    }
  };
  const chapterObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(chapters.indexOf(visible.target));
  }, { rootMargin: "-18% 0px -58%", threshold: [0, .15, .4] }) : null;
  chapterObserver?.disconnect();
  chapters.forEach(chapter => chapterObserver?.observe(chapter));
  activate(0);
  const jump = (index, immediate = false) => chapters[index]?.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
  const onClick = event => { const index = Number(event.currentTarget.dataset.index); activate(index); jump(index); };
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
  return { destroy() {
    clearTimeout(hideTimer); chapterObserver?.disconnect();
    nav.remove();
  } };
}
