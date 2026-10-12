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
  const marker = document.createElement("span");
  marker.setAttribute("aria-hidden", "true");
  marker.style.cssText = "position:absolute;top:82%;width:1px;height:1px;pointer-events:none";
  hero.append(marker);
  const observer = new IntersectionObserver(([entry]) => {
    document.documentElement.classList.toggle("proof-nav-on-hero", entry.isIntersecting || entry.boundingClientRect.top > 0);
  });
  observer.observe(marker);
  addEventListener("pagehide", () => observer.disconnect(), { once: true });
}

export function initProofSystem() {
  initDisclosures();
  initNavSurface();
}
