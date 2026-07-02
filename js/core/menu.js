/* Fullscreen menu — open/close, Escape, focus return, scroll lock.
   The menu element is a native <dialog>, so focus trapping, AT announcement,
   and Escape handling are all provided by the browser. We only add:
   - animated open/close (class-toggled CSS transition + showModal/close)
   - scroll lock on <body>
   - focus return to the trigger on close */
import { createMenuScene } from "./menu-scene.js";

export function initMenu() {
  const openBtn = document.querySelector("[data-menu-open]");
  const menu = document.getElementById("site-menu");
  if (!openBtn || !menu) return;
  let lastFocus = null;
  const scene = createMenuScene(menu);

  function open() {
    lastFocus = document.activeElement;
    menu.showModal();                          /* native: focus trap + AT announce */
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");
    /* is-open + focus must both happen after the rAF tick; until that tick
       the dialog is visibility:hidden (CSS), so closeBtn.focus() would fail. */
    requestAnimationFrame(() => {
      menu.classList.add("is-open");
      const closeBtn = menu.querySelector("[data-menu-close]");
      if (closeBtn) closeBtn.focus();
    });
    scene.start();                             /* async, non-blocking */
  }

  function close() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");
    scene.stop();
    /* Wait for the CSS opacity/visibility transition before calling dialog.close()
       so the overlay fades out rather than snapping away. */
    menu.addEventListener(
      "transitionend",
      () => {
        menu.close();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      },
      { once: true }
    );
  }

  /* The native dialog fires a "cancel" event on Escape before closing itself.
     Prevent the default snap-close so our animated close() runs instead. */
  menu.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });

  openBtn.addEventListener("click", open);
  menu.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", close));
  menu.querySelectorAll(".site-menu__list a, .site-menu__cta").forEach((a) =>
    a.addEventListener("click", close)
  );
}
