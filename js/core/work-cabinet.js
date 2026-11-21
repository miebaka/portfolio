/* Filing Cabinet V2 — Stage B: read, lift and return.
   All folder navigation remains native; the register is decorative and
   never announces scrolling changes to assistive technology. */
const RETURN_KEY = "portfolio.workCabinet.return.v2";
const RETURN_MAX_AGE = 3 * 60 * 60 * 1000;
const SCROLL_SETTLE_MS = 140;

export function initWorkCabinet({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  const cabinet = doc?.querySelector?.("[data-project-archive]");
  if (!cabinet || doc.body?.dataset.page !== "work" || !win) return { destroy() {} };

  const folders = [...cabinet.querySelectorAll(".filing-cabinet__folder[data-slug]")]
    .map(element => ({
      element,
      link: element.querySelector(".filing-cabinet__link"),
      title: element.querySelector(".filing-cabinet__tab-title")?.textContent?.trim(),
      slug: element.dataset.slug,
      number: element.dataset.fileNumber,
      year: element.dataset.year,
    }))
    .filter(file => file.link && file.title && file.slug);
  const number = cabinet.querySelector(".filing-cabinet__register-number");
  const title = cabinet.querySelector(".filing-cabinet__register-title");
  const year = cabinet.querySelector(".filing-cabinet__register-year");
  if (!folders.length || !number || !title || !year) return { destroy() {} };

  let selected = -1;
  let frame = 0;
  let scrollTimer = 0;
  let pageHidden = false;
  let destroyed = false;
  let observerActive = false;

  // Read the actual, untransformed link bands, not the lifted paper faces.
  // If the 40%-height line sits on a divider, choose the nearest band.
  function selectNearest() {
    frame = 0;
    if (destroyed || pageHidden) return;
    const axis = win.innerHeight * 0.4;
    let next = 0;
    let distance = Infinity;
    for (const [index, file] of folders.entries()) {
      const rect = file.link.getBoundingClientRect();
      const gap = Math.max(rect.top - axis, axis - rect.bottom, 0);
      const proximity = gap * 10000 + Math.abs((rect.top + rect.bottom) / 2 - axis);
      if (proximity < distance) {
        distance = proximity;
        next = index;
      }
    }
    if (next === selected) return;
    selected = next;
    const active = folders[next];
    for (const [index, file] of folders.entries()) {
      if (index === next) file.element.dataset.reading = "true";
      else delete file.element.dataset.reading;
    }
    number.textContent = "NO. " + active.number + " / " + String(folders.length).padStart(2, "0");
    title.textContent = active.title;
    year.textContent = active.year;
  }

  function scheduleRead() {
    if (frame || destroyed || pageHidden) return;
    frame = win.requestAnimationFrame(selectNearest);
  }

  // The narrow observer band signals folder crossings. Scroll/resize still
  // schedules a single bounded geometry pass when the line hits a divider.
  const observer = typeof win.IntersectionObserver === "function"
    ? new win.IntersectionObserver(scheduleRead, {
        root: null,
        rootMargin: "-40% 0px -59% 0px",
        threshold: 0,
      })
    : null;

  function observe() {
    if (observerActive || !observer) return;
    folders.forEach(file => observer.observe(file.link));
    observerActive = true;
  }

  function suspend() {
    if (scrollTimer) win.clearTimeout(scrollTimer);
    scrollTimer = 0;
    cabinet.classList.remove("is-scrolling");
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
  }

  function onScroll() {
    if (pageHidden || destroyed) return;
    cabinet.classList.add("is-scrolling");
    if (scrollTimer) win.clearTimeout(scrollTimer);
    scrollTimer = win.setTimeout(() => {
      scrollTimer = 0;
      cabinet.classList.remove("is-scrolling");
    }, SCROLL_SETTLE_MS);
    scheduleRead();
  }

  function rememberOpen(event) {
    const link = event.target?.closest?.(".filing-cabinet__link");
    if (!link || !cabinet.contains(link) || event.defaultPrevented ||
        event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.altKey || event.shiftKey || (link.target && link.target !== "_self") ||
        link.hasAttribute("download")) return;
    const folder = link.closest(".filing-cabinet__folder");
    if (!folder?.dataset.slug) return;
    try {
      win.sessionStorage?.setItem(RETURN_KEY, JSON.stringify({
        slug: folder.dataset.slug,
        scrollY: win.scrollY,
        source: win.location.pathname,
        savedAt: Date.now(),
      }));
    } catch { /* Blocked storage must not affect navigation. */ }
  }

  function restoreReturn(event) {
    const navigation = win.performance?.getEntriesByType?.("navigation")?.[0];
    if (!event?.persisted && navigation?.type !== "back_forward") return;
    let saved;
    try {
      saved = JSON.parse(win.sessionStorage?.getItem(RETURN_KEY) || "null");
    } catch { return; }
    if (!saved || !Number.isFinite(saved.scrollY) ||
        saved.source !== win.location.pathname ||
        Date.now() - saved.savedAt > RETURN_MAX_AGE) return;
    const file = folders.find(item => item.slug === saved.slug);
    if (!file) return;

    // Let native history restoration finish first; only correct a large
    // mismatch on browsers that discarded the document's saved scroll.
    win.requestAnimationFrame(() => win.requestAnimationFrame(() => {
      if (destroyed || pageHidden) return;
      if (Math.abs(win.scrollY - saved.scrollY) > 24) {
        const html = doc.documentElement;
        const previous = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";
        win.scrollTo(0, saved.scrollY);
        html.style.scrollBehavior = previous;
      }
      file.link.focus({ preventScroll: true });
      scheduleRead();
      try { win.sessionStorage?.removeItem(RETURN_KEY); } catch { /* storage may fail */ }
    }));
  }

  function onPageHide() {
    pageHidden = true;
    suspend();
    observer?.disconnect();
    observerActive = false;
  }

  function onPageShow(event) {
    pageHidden = false;
    suspend();
    observe();
    scheduleRead();
    restoreReturn(event);
  }

  cabinet.addEventListener("click", rememberOpen);
  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("resize", scheduleRead, { passive: true });
  win.addEventListener("pagehide", onPageHide);
  win.addEventListener("pageshow", onPageShow);
  observe();
  scheduleRead();
  cabinet.dataset.cabinetInteractive = "true";

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      onPageHide();
      observer?.disconnect();
      cabinet.removeEventListener("click", rememberOpen);
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", scheduleRead);
      win.removeEventListener("pagehide", onPageHide);
      win.removeEventListener("pageshow", onPageShow);
      for (const file of folders) delete file.element.dataset.reading;
      delete cabinet.dataset.cabinetInteractive;
    },
  };
}
