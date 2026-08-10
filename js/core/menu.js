/* Fullscreen menu — open/close, Escape, focus return, scroll lock.
   The menu element is a native <dialog>, so focus trapping, AT announcement,
   and Escape handling are all provided by the browser. We only add:
   - animated open/close (class-toggled CSS transition + showModal/close)
   - scroll lock on <body>
   - focus return to the trigger on close */

export function initMenu() {
  const openBtn = document.querySelector("[data-menu-open]");
  const menu = document.getElementById("site-menu");
  if (!openBtn || !menu) return;
  let lastFocus = null;

  function open() {
    lastFocus = document.activeElement;
    menu.showModal();                          /* native: focus trap + AT announce */
    document.body.classList.add("menu-open");
    openBtn.setAttribute("aria-expanded", "true");

    /* The open class is applied synchronously, not inside requestAnimationFrame.
       rAF does not fire while the tab is backgrounded or the window occluded,
       and the previous version added `is-open` inside one: open the menu, switch
       away before the frame lands, and the dialog is showing with its curtain
       still fully retracted — an invisible overlay that still traps focus.

       Reading offsetHeight first flushes style and layout, so the closed
       clip-path is computed before the open one is set. That is all a CSS
       transition needs in order to run; the frame callback never was. */
    menu.offsetHeight;
    menu.classList.add("is-open");
    const closeBtn = menu.querySelector("[data-menu-close]");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");

    /* Wait for the exit animation before dialog.close() so the overlay animates
       out rather than snapping away. The curtain retracts on clip-path (normal
       motion) and the panel fades on opacity (reduced motion); either marks the
       end of the visible exit. A timeout backstop covers the case where no
       transition fires (a backgrounded tab) and would otherwise strand the
       dialog open. */
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      menu.removeEventListener("transitionend", onEnd);
      menu.close();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const onEnd = (e) => {
      if (e.target === menu && (e.propertyName === "clip-path" || e.propertyName === "opacity")) finish();
    };
    menu.addEventListener("transitionend", onEnd);
    setTimeout(finish, 600);
  }

  /* The native dialog fires a "cancel" event on Escape before closing itself.
     Prevent the default snap-close so our animated close() runs instead. */
  menu.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });

  openBtn.addEventListener("click", open);
  menu.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", close));
  menu.querySelectorAll(".site-menu__list a").forEach((a) =>
    a.addEventListener("click", close)
  );
}
