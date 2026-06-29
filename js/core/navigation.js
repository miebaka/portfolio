/* Sticky nav state — solid after the (dark) hero, hairline elsewhere. */
export function initNavigation() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const darkTop = document.body.dataset.navTheme === "dark";
  const threshold = darkTop ? window.innerHeight * 0.85 : 8;
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > threshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
}
