/* Press-proof navigation: slug line, full-page index and live production data. */
import { SITE } from "../../data/site.js";
import { escapeHTML as esc, safeURL, mount, basePath } from "../utilities/dom.js";
import { MOUNT } from "../core/contract.js";

function setupThemeToggle() {
  const btn = document.querySelector(".slug__theme");
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => {
    const dark = root.dataset.theme === "dark";
    btn.setAttribute("aria-pressed", String(dark));
    btn.setAttribute("aria-label", dark ? "Switch to print mode" : "Switch to screen mode");
    document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.content = dark ? "#07112B" : "#F8F9FC");
  };
  sync();
  btn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const apply = () => { root.dataset.theme = next; sync(); };
    if (document.startViewTransition && root.dataset.motion !== "reduced") document.startViewTransition(apply); else apply();
    try { localStorage.setItem("color-theme", next); } catch {}
  });
}

function setupMotionToggle() {
  const btn = document.querySelector(".slug__motion");
  if (!btn) return;
  const root = document.documentElement;
  const systemReduced = matchMedia("(prefers-reduced-motion: reduce)");
  let stored = null;
  try { stored = localStorage.getItem("motion-preference"); } catch {}
  root.dataset.motion = stored === "regular" || stored === "reduced" ? stored : (systemReduced.matches ? "reduced" : "regular");
  const sync = () => {
    const reduced = root.dataset.motion === "reduced";
    btn.setAttribute("aria-pressed", String(reduced));
    btn.setAttribute("aria-label", reduced ? "Use regular motion" : "Use reduced motion");
    btn.querySelector(".slug__motion-label").textContent = reduced ? "Reduced" : "Motion";
    document.dispatchEvent(new CustomEvent("motionpreferencechange", { detail: { reduced } }));
  };
  btn.addEventListener("click", () => {
    root.dataset.motion = root.dataset.motion === "reduced" ? "regular" : "reduced";
    try { localStorage.setItem("motion-preference", root.dataset.motion); } catch {}
    sync();
  });
  sync();
}

function setupIndex(nav) {
  const btn = nav.querySelector(".slug__menu");
  const menu = nav.querySelector(".proof-index");
  const label = nav.querySelector(".slug__menu-txt");
  if (!btn || !menu) return;
  let closeTimer = 0;
  const setOpen = (open, immediate = false) => {
    clearTimeout(closeTimer);
    document.documentElement.classList.toggle("proof-index-open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.dataset.cursor = open ? "Close" : "Open";
    label.textContent = open ? "Close" : "Index";
    if (open) {
      menu.hidden = false;
      menu.dataset.state = "opening";
      requestAnimationFrame(() => { menu.dataset.state = "open"; });
      menu.querySelector("a")?.focus({ preventScroll: true });
    } else if (immediate || document.documentElement.dataset.motion === "reduced") {
      menu.dataset.state = "closed";
      menu.hidden = true;
    } else {
      menu.dataset.state = "closing";
      closeTimer = setTimeout(() => { menu.hidden = true; menu.dataset.state = "closed"; }, 280);
    }
  };
  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && btn.getAttribute("aria-expanded") === "true") setOpen(false, true); });
}

export function renderNavigation() {
  const el = mount(MOUNT.NAV);
  if (!el) return;
  const base = basePath();
  const items = [
    { label: "Work", href: "work.html" },
    { label: "About", href: "about.html" },
    { label: "Services", href: "services.html" },
    { label: "Writing", href: "playground.html" },
    { label: "Contact", href: "contact.html" },
  ];
  const links = items.map(item => '<li><a href="' + base + safeURL(item.href) + '"><span class="proof-index__word">' + esc(item.label) + '</span></a></li>').join("");
  el.className = "proof-nav";
  el.innerHTML =
    '<div class="proof-trim-frame" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<header class="slug proof-mono">' +
      '<a class="slug__brand" href="' + base + 'index.html" data-cursor="Top"><img src="' + base + 'assets/images/miebaka-joshua-logo.svg" alt="" width="24" height="24"><span>Miebaka Joshua</span></a>' +
      '<span class="slug__role">Brand &amp; Visual Designer</span>' +
      '<span class="slug__where">Lagos <span>6.52°N 3.38°E</span> · <time class="proof-clock">--:--</time> WAT</span>' +
      '<button class="slug__theme" type="button" aria-pressed="false" data-cursor="Switch"><span class="slug__theme-dot" aria-hidden="true"></span><span class="slug__theme-label"><span>Print</span><i>/</i><span>Screen</span></span></button>' +
      '<button class="slug__motion" type="button" aria-pressed="false" data-cursor="Motion"><span class="slug__motion-mark" aria-hidden="true"></span><span class="slug__motion-label">Motion</span></button>' +
      '<button class="slug__menu" type="button" aria-expanded="false" aria-controls="proof-index" data-cursor="Open"><span class="slug__menu-lines" aria-hidden="true"><i></i><i></i></span><span class="slug__menu-txt">Index</span></button>' +
    '</header>' +
    '<nav class="proof-index" id="proof-index" aria-label="Index" hidden><div class="proof-index__inner"><ol>' + links + '</ol><aside class="proof-index__aside proof-mono"><p>Write<br><a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + '</a></p><p>Elsewhere<br>' + SITE.socials.map(s => '<a href="' + safeURL(s.href) + '" target="_blank" rel="noopener noreferrer">' + esc(s.label) + '</a>').join(' · ') + '</p></aside></div></nav>';
  setupThemeToggle();
  setupMotionToggle();
  setupIndex(el);
}
