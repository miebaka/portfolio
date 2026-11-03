export function initSpectacle({ doc = document, win = window, Observer = globalThis.IntersectionObserver } = {}) {
  const root = doc.documentElement;
  const revealTargets = [...doc.querySelectorAll("main section:not(.home-landing), .case-shot, .project-archive__item")];
  const staticPresentation = win.location?.search.includes("visual-static=1") || win.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (staticPresentation) revealTargets.forEach(node => node.classList.add("is-visible"));

  const observer = !staticPresentation && Observer ? new Observer(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: .08 }) : null;
  if (observer) root.classList.add("js-reveal");
  revealTargets.forEach(node => node.setAttribute("data-spectacle-reveal", ""));
  if (!staticPresentation) revealTargets.forEach(node => observer ? observer.observe(node) : node.classList.add("is-visible"));

  [...doc.querySelectorAll(".case-chapter")].forEach((chapter, index) => {
    chapter.querySelector(".case-chapter__copy")?.setAttribute("data-chapter", String(index + 1).padStart(2, "0"));
  });

  let frame = 0;
  const paint = () => {
    frame = 0;
    root.style.setProperty("--hero-shift", String(Math.min(1, win.scrollY / Math.max(1, win.innerHeight))));
  };
  const onScroll = () => { if (!frame) frame = win.requestAnimationFrame(paint); };
  win.addEventListener("scroll", onScroll, { passive: true });
  paint();
  return { destroy() { observer?.disconnect(); root.classList.remove("js-reveal"); win.removeEventListener("scroll", onScroll); if (frame) win.cancelAnimationFrame(frame); } };
}
