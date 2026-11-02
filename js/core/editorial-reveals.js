/* Rare-page editorial reveals. Motion explains authored process and biography. */
export function initEditorialReveals({ document: doc = document, IntersectionObserver: Observer = globalThis.IntersectionObserver } = {}) {
  const roots = [...doc.querySelectorAll("[data-editorial-reveal], .case-page--tedx .case-chapter")];
  if (!roots.length) return null;
  if (!Observer) {
    roots.forEach(root => root.classList.add("is-revealed"));
    return { destroy() {} };
  }
  const observer = new Observer(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.24, rootMargin: "0px 0px -8%" });
  roots.forEach(root => observer.observe(root));
  return { destroy() { observer.disconnect(); } };
}
