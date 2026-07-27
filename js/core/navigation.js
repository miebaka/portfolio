/* Sticky nav state — solid after the (dark) hero, hairline elsewhere.

   Driven by an IntersectionObserver on a zero-width sentinel rather than a
   scroll listener. A scroll handler runs on every scroll frame and has to be
   throttled by hand; the observer fires twice in total, once when the sentinel
   leaves the viewport and once when it comes back. */

export function initNavigation() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;

  const darkTop = document.body.dataset.navTheme === "dark";
  /* How far the page must scroll before the nav goes solid. Over a dark hero
     the nav stays transparent until the hero is nearly past. */
  const trigger = darkTop ? "85vh" : "8px";

  if (!("IntersectionObserver" in window)) {
    nav.classList.add("is-scrolled");
    return;
  }

  const sentinel = document.createElement("div");
  sentinel.setAttribute("aria-hidden", "true");
  sentinel.style.cssText =
    "position:absolute;top:0;left:0;width:1px;height:" + trigger +
    ";pointer-events:none;visibility:hidden;";
  document.body.appendChild(sentinel);

  new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
    { threshold: 0 }
  ).observe(sentinel);
}
