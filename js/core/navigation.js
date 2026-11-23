const indexControllers = new WeakMap();
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* The body-level region avoids fixed-position containment by the masthead. */
export function createIndexController({ root, trigger }) {
  if (indexControllers.has(root)) return indexControllers.get(root);
  const doc = root.ownerDocument, view = doc.defaultView;
  let opened = false, destroyed = false, timer, activeTrigger, background = [], scroll, styles;
  const controls = () => [...root.querySelectorAll(FOCUSABLE)].filter(el => !el.hidden && !el.inert && el.getClientRects().length);
  const focusFirst = () => (controls()[0] || root).focus({ preventScroll: true });
  const onKey = event => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key !== "Tab") return;
    const list = controls(), first = list[0], last = list.at(-1);
    if (!list.length) { event.preventDefault(); root.focus(); return; }
    if (!root.contains(doc.activeElement) || (!event.shiftKey && doc.activeElement === last) || (event.shiftKey && doc.activeElement === first)) {
      event.preventDefault(); (event.shiftKey ? last : first).focus();
    }
  };
  const onFocus = event => { if (opened && !root.contains(event.target)) focusFirst(); };
  const onTrigger = event => opened ? close() : open({ source: event.detail === 0 ? "keyboard" : "pointer" });
  const onClick = event => {
    if (event.target.closest('[data-index-close]')) close();
    else if (event.target.closest('a[href]')) close({ restoreFocus: false });
  };
  function open({ source = "programmatic" } = {}) {
    if (opened || destroyed) return;
    clearTimeout(timer); opened = true; activeTrigger = trigger;
    root.dataset.source = source; root.dataset.state = "open";
    root.hidden = false; root.inert = false; root.removeAttribute("aria-hidden");
    trigger.setAttribute("aria-expanded", "true");
    background = [...doc.body.children].filter(el => el !== root).map(el => [el, el.inert]);
    background.forEach(([el]) => { el.inert = true; });
    scroll = { x: view.scrollX, y: view.scrollY };
    styles = ["position", "top", "left", "width", "overflow", "paddingRight"].map(key => [key, doc.body.style[key]]);
    styles.push(["htmlOverflow", doc.documentElement.style.overflow]);
    const gutter = view.innerWidth - doc.documentElement.clientWidth;
    Object.assign(doc.body.style, { position: "fixed", top: `-${scroll.y}px`, left: `-${scroll.x}px`, width: "100%", overflow: "hidden" });
    if (gutter > 0) doc.body.style.paddingRight = `${gutter}px`;
    doc.documentElement.style.overflow = "hidden";
    doc.addEventListener("keydown", onKey); doc.addEventListener("focusin", onFocus);
    focusFirst();
  }
  function close({ restoreFocus = true } = {}) {
    if (!opened) return;
    opened = false; root.inert = true; root.setAttribute("aria-hidden", "true");
    root.dataset.state = "closing"; trigger.setAttribute("aria-expanded", "false");
    doc.removeEventListener("keydown", onKey); doc.removeEventListener("focusin", onFocus);
    background.forEach(([el, inert]) => { el.inert = inert; }); background = [];
    styles.forEach(([key, value]) => { if (key === "htmlOverflow") doc.documentElement.style.overflow = value; else doc.body.style[key] = value; });
    view.scrollTo({ left: scroll.x, top: scroll.y, behavior: "instant" });
    if (restoreFocus && activeTrigger?.isConnected) activeTrigger.focus({ preventScroll: true });
    const finish = () => { root.hidden = true; root.dataset.state = "closed"; };
    if (root.dataset.source === "keyboard" || destroyed) finish();
    else timer = setTimeout(finish, 160);
  }
  const controller = {
    open, close,
    destroy() {
      destroyed = true; close(); clearTimeout(timer); root.hidden = true; root.inert = true;
      trigger.removeEventListener("click", onTrigger); root.removeEventListener("click", onClick);
      indexControllers.delete(root);
    },
    get isOpen() { return opened; }
  };
  trigger.addEventListener("click", onTrigger); root.addEventListener("click", onClick);
  indexControllers.set(root, controller); return controller;
}
