/* Scroll reveal — adds .is-visible as elements enter the viewport.

   Drives all three reveal primitives in styles/base/motion.css: .reveal,
   [data-wipe], and [data-split]. One observer for all of them keeps the
   sequencing consistent — an image wipe and the heading above it cross the
   same threshold at the same moment.

   Elements are unobserved once revealed; nothing re-animates on scroll-back. */

const SELECTOR = ".reveal, [data-wipe], [data-split]";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initScrollReveal() {
  const items = document.querySelectorAll(SELECTOR);
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    /* Fire slightly before the element is fully on screen, so the reveal is
       already underway by the time it is comfortably in view. */
    { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
  );
  items.forEach((el) => io.observe(el));
}
