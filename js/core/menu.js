/* Fullscreen menu — open/close, Escape, focus return, scroll lock. */
export function initMenu() {
  const openBtn = document.querySelector("[data-menu-open]");
  const menu = document.getElementById("site-menu");
  if (!openBtn || !menu) return;
  let lastFocus = null;

  const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  // Keep Tab focus inside the open dialog (no keyboard escape to the page behind).
  function trapTab(e) {
    if (e.key !== "Tab") return;
    const items = Array.from(menu.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onKey(e) {
    if (e.key === "Escape") close();
    else trapTab(e);
  }

  function open() {
    lastFocus = document.activeElement;
    menu.classList.add("is-open");
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");
    const closeBtn = menu.querySelector("[data-menu-close]");
    if (closeBtn) closeBtn.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openBtn.addEventListener("click", open);
  menu.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", close));
  menu.querySelectorAll(".site-menu__list a, .site-menu__cta").forEach((a) =>
    a.addEventListener("click", close)
  );
}
