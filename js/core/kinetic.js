/* A restrained kinetic layer shared by every route. It uses observers and
   pointer variables instead of scroll handlers, and disappears completely for
   reduced-motion and coarse-pointer visitors. */

const REDUCE = "(prefers-reduced-motion: reduce)";
function installProgress() {
  if (!document.body.matches(".article-page, [data-case]")) return;
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  if (!("ScrollTimeline" in window)) {
    const update = () => {
      const distance = document.documentElement.scrollHeight - innerHeight;
      const amount = distance > 0 ? Math.min(1, scrollY / distance) : 1;
      progress.style.transform = `scaleX(${amount})`;
    };
    update();
    addEventListener("scroll", update, { passive: true });
  }
}

export function initKineticSystem() {
  installProgress();
}
