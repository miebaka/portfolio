/* Filing Cabinet V2 — Stages B/C: read, lift, extract and return.
   All folder navigation remains native; the register is decorative and
   never announces scrolling changes to assistive technology. */
const RETURN_KEY = "portfolio.workCabinet.return.v2";
const ARRIVAL_KEY = "portfolio.workCabinet.arrival.v2";
const EXTRACTION_DEADLINE_MS = 390;
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
  let extraction = null;

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


  function clearExtraction() {
    const active = extraction;
    if (!active) return;
    extraction = null;
    if (active.deadline) win.clearTimeout(active.deadline);
    if (active.recovery) win.clearTimeout(active.recovery);
    for (const animation of active.animations) {
      try { animation.cancel(); } catch { /* Finished animations may be inert. */ }
    }
    active.paper.remove();
    active.shade.remove();
    delete active.folder.dataset.extracting;
    cabinet.classList.remove("is-extracting");
  }

  function navigateToCase(active) {
    if (extraction !== active || active.navigating) return;
    active.navigating = true;
    if (active.deadline) win.clearTimeout(active.deadline);
    try {
      win.sessionStorage?.setItem(ARRIVAL_KEY, JSON.stringify({
        pathname: active.url.pathname, savedAt: Date.now(),
      }));
    } catch { /* Navigation must not depend on storage. */ }
    try {
      win.location.assign(active.url.href);
    } catch {
      try { win.location.href = active.url.href; }
      catch { clearExtraction(); }
    }
    // If a navigation is blocked or interrupted, never strand the visitor
    // behind the fixed sheet. A normal pagehide clears it sooner.
    if (extraction === active) active.recovery = win.setTimeout(clearExtraction, 1500);
  }

  function canExtract(event, link, url) {
    return event.detail > 0 &&
      url.origin === win.location.origin &&
      /^\/work\/[a-z0-9_-]+\.html$/i.test(url.pathname) &&
      doc.documentElement.dataset.motion !== "reduced" &&
      win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches !== true &&
      typeof link.querySelector(".filing-cabinet__face")?.animate === "function" &&
      win.CSS?.supports?.("clip-path", "inset(0px round 3px)") === true;
  }

  function extract(event, link, folder) {
    if (extraction) {
      event.preventDefault();
      return;
    }
    let url;
    try { url = new URL(link.href, win.location.href); }
    catch { return; }
    if (!canExtract(event, link, url)) return;
    event.preventDefault();
    const face = link.querySelector(".filing-cabinet__face");
    const bounds = face.getBoundingClientRect();
    const width = win.innerWidth, height = win.innerHeight;
    if (bounds.bottom <= 0 || bounds.top >= height || bounds.right <= 0 || bounds.left >= width) {
      win.location.assign(url.href);
      return;
    }

    const shade = doc.createElement("div");
    shade.className = "cabinet-extraction__shade";
    shade.setAttribute("aria-hidden", "true");
    const paper = doc.createElement("div");
    paper.className = "cabinet-extraction__paper";
    paper.setAttribute("aria-hidden", "true");
    paper.style.backgroundColor = win.getComputedStyle(doc.documentElement).backgroundColor;
    const inset = [
      Math.max(0, bounds.top), Math.max(0, width - bounds.right),
      Math.max(0, height - bounds.bottom), Math.max(0, bounds.left),
    ].map(value => Math.round(value) + "px").join(" ");
    const start = "inset(" + inset + " round 3px)";
    const end = "inset(0px 0px 0px 0px round 0px)";
    paper.style.clipPath = start;
    folder.dataset.extracting = "true";
    cabinet.classList.add("is-extracting");
    doc.body.append(shade, paper);
    const active = {
      folder, shade, paper, url, navigating: false,
      animations: [], deadline: 0, recovery: 0,
    };
    extraction = active;

    try {
      const faceStart = win.getComputedStyle(face).transform;
      const easing = "cubic-bezier(.23, 1, .32, 1)";
      const move = face.animate([
        { transform: faceStart },
        { transform: "translateY(-48px) scale(1.04)" },
      ], { duration: 160, easing, fill: "forwards" });
      const dim = shade.animate([{ opacity: 0 }, { opacity: 1 }],
        { duration: 160, easing, fill: "forwards" });
      const sheet = paper.animate([
        { clipPath: start, opacity: 0 },
        { clipPath: end, opacity: 1 },
      ], { duration: 240, delay: 100,
        easing: "cubic-bezier(.77, 0, .175, 1)", fill: "both" });
      active.animations.push(move, dim, sheet);
      // Navigation begins around 340ms; the hard deadline is 390ms even if
      // a browser never settles an animation.finished promise.
      active.deadline = win.setTimeout(() => navigateToCase(active), EXTRACTION_DEADLINE_MS);
      void sheet.finished.then(
        () => navigateToCase(active),
        () => navigateToCase(active),
      );
    } catch {
      // WAAPI, layout or sheet failure must become native-style navigation.
      navigateToCase(active);
    }
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
    extract(event, link, folder);
  }

  function restoreReturn(event) {
    const navigation = win.performance?.getEntriesByType?.("navigation")?.[0];
    if (!event?.persisted && navigation?.type !== "back_forward") {
      // A fresh visit to Work is not a return from the opened case. Discard
      // any older pending marker so a later Back cannot steal focus.
      try { win.sessionStorage?.removeItem(RETURN_KEY); } catch { /* storage may fail */ }
      return;
    }
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
    clearExtraction();
    suspend();
    observer?.disconnect();
    observerActive = false;
  }

  function onPageShow(event) {
    pageHidden = false;
    clearExtraction();
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

// This module is loaded only by work.html, after its source/prerendered markup.
// An exception here never replaces or intercepts the native case-study links.
if (typeof document !== "undefined" && document.body?.dataset.page === "work") {
  try { initWorkCabinet(); }
  catch (error) { console.warn("Work cabinet enhancement unavailable", error); }
}
