/* Small shared behaviours that remain after the v5 retirements. */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function initDisclosures() {
  $$(".proof-job").forEach(item => item.addEventListener("toggle", () => {
    const summary = $("summary", item);
    if (summary) summary.setAttribute("aria-label", item.open ? "Close experience details" : "Open experience details");
  }));
}

function initNavSurface() {
  const hero = $(".home-landing");
  if (!hero) return;
  let frame = 0;
  const update = () => {
    frame = 0;
    document.documentElement.classList.toggle("proof-nav-on-hero", scrollY < hero.offsetHeight * .82);
  };
  addEventListener("scroll", () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });
  update();
}

export function initProofSystem() {
  initDisclosures();
  initNavSurface();
}
