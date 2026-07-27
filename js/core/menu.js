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
    /* is-open + focus must both happen after the rAF tick. Reading offsetHeight
       after classList.add forces a style recalc so visibility:visible is
       computed before focus() — without it the browser hasn't yet processed
       the CSS change and treats the element as still visibility:hidden. */
    requestAnimationFrame(() => {
      menu.classList.add("is-open");
      menu.offsetHeight; // force style recalculation
      const closeBtn = menu.querySelector("[data-menu-close]");
      if (closeBtn) closeBtn.focus();
    });
  }

  function close() {
    menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    openBtn.setAttribute("aria-expanded", "false");

    /* Wait for the fade before dialog.close() so the overlay animates out
       rather than snapping away. The dialog transitions several properties;
       only opacity marks the end of the visible exit, and a timeout backstop
       covers the case where the transition never fires (reduced motion, a
       backgrounded tab) and would otherwise strand the dialog open. */
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      menu.removeEventListener("transitionend", onEnd);
      menu.close();
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    const onEnd = (e) => {
      if (e.target === menu && e.propertyName === "opacity") finish();
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
