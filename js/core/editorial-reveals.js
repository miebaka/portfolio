/* Shared one-shot editorial reveals. Content is never gated on high thresholds,
   and the portfolio's explicit Reduce/Full control takes priority over the OS. */
import { isMotionReduced } from "./motion-language.js";

export function initEditorialReveals({
  document: doc = document,
  window: win = globalThis.window,
  IntersectionObserver: Observer = globalThis.IntersectionObserver,
} = {}) {
  const roots = [...doc.querySelectorAll("[data-editorial-reveal], .case-page .case-chapter")];
  if (!roots.length) return null;

  const html = doc.documentElement;
  const media = win?.matchMedia?.("(prefers-reduced-motion: reduce)");
  const revealAll = () => roots.forEach(node => node.classList.add("is-revealed"));
  if (!Observer || isMotionReduced(html, media)) {
    revealAll();
    return { destroy() {} };
  }

  const observer = new Observer(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.01, rootMargin: "0px 0px -8% 0px" });
  roots.forEach(node => observer.observe(node));

  const onMotionChange = () => {
    if (isMotionReduced(html, media)) {
      revealAll();
      observer.disconnect();
    }
  };
  media?.addEventListener?.("change", onMotionChange);
  const Mutation = win?.MutationObserver;
  const preferences = Mutation ? new Mutation(onMotionChange) : null;
  if (html) preferences?.observe(html, { attributes: true, attributeFilter: ["data-motion"] });

  return {
    destroy() {
      observer.disconnect();
      preferences?.disconnect();
      media?.removeEventListener?.("change", onMotionChange);
    },
  };
}
