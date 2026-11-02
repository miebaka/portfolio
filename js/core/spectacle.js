export function initSpectacle({ doc = document, win = window, Observer = globalThis.IntersectionObserver } = {}) {
  const root = doc.documentElement;
  const reduced = () => root.dataset.motion === "reduced" || win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const revealTargets = [...doc.querySelectorAll("main section:not(.home-landing), .case-shot, .project-archive__item")];
  revealTargets.forEach(node => node.setAttribute("data-spectacle-reveal", ""));

  const observer = !reduced() && Observer ? new Observer(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: .08 }) : null;
  revealTargets.forEach(node => observer ? observer.observe(node) : node.classList.add("is-visible"));

  [...doc.querySelectorAll(".case-chapter")].forEach((chapter, index) => {
    chapter.querySelector(".case-chapter__copy")?.setAttribute("data-chapter", String(index + 1).padStart(2, "0"));
  });

  let frame = 0;
  const paint = () => {
    frame = 0;
    const range = Math.max(1, doc.documentElement.scrollHeight - win.innerHeight);
    root.style.setProperty("--scroll-progress", String(Math.min(1, win.scrollY / range)));
    root.style.setProperty("--hero-shift", String(Math.min(1, win.scrollY / Math.max(1, win.innerHeight))));
  };
  const onScroll = () => { if (!frame && !reduced()) frame = win.requestAnimationFrame(paint); };
  const onPointer = event => {
    if (reduced() || event.pointerType === "touch") return;
    root.style.setProperty("--pointer-x", `${event.clientX}px`);
    root.style.setProperty("--pointer-y", `${event.clientY}px`);
  };
  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("pointermove", onPointer, { passive: true });
  paint();
  return { destroy() { observer?.disconnect(); win.removeEventListener("scroll", onScroll); win.removeEventListener("pointermove", onPointer); if (frame) win.cancelAnimationFrame(frame); } };
}
