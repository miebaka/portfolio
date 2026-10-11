/* Shared press-proof behaviours. Colour-separation plate effects are intentionally absent. */
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const systemReduced = matchMedia("(prefers-reduced-motion: reduce)");
const motionReduced = () => document.documentElement.dataset.motion === "reduced" || (!document.documentElement.dataset.motion && systemReduced.matches);

function initClock() {
  const clock = $(".proof-clock");
  if (!clock) return;
  const formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => { clock.textContent = formatter.format(new Date()); };
  tick();
  const timer = setInterval(tick, 1000);
  addEventListener("pagehide", () => clearInterval(timer), { once: true });
}

function initCursor() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.documentElement.classList.add("has-proof-cursor");
  const cursor = document.createElement("div");
  cursor.className = "proof-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<span></span><b class="proof-cursor__label proof-mono"></b>';
  document.body.append(cursor);
  const label = $(".proof-cursor__label", cursor);
  let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, frame = 0;
  const draw = () => {
    x += (tx - x) * .28; y += (ty - y) * .28;
    cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
    if (Math.abs(tx - x) + Math.abs(ty - y) > .1 && !motionReduced()) frame = requestAnimationFrame(draw);
    else frame = 0;
  };
  const wake = () => { if (!frame && !motionReduced()) frame = requestAnimationFrame(draw); };
  addEventListener("pointermove", event => {
    tx = event.clientX; ty = event.clientY;
    if (motionReduced()) { x = tx; y = ty; cursor.style.transform = `translate3d(${x}px,${y}px,0)`; }
    else wake();
  }, { passive: true });
  document.addEventListener("pointerover", event => {
    const target = event.target.closest?.("[data-cursor],a,button,summary");
    const text = event.target.closest?.("[data-cursor]")?.dataset.cursor || "";
    cursor.classList.toggle("is-hover", Boolean(target));
    cursor.classList.toggle("has-label", Boolean(text));
    label.textContent = text;
  }, { passive: true });
  document.addEventListener("pointerdown", () => cursor.classList.add("is-down"), { passive: true });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-down"), { passive: true });
  document.addEventListener("motionpreferencechange", () => { if (motionReduced()) { cancelAnimationFrame(frame); frame = 0; cursor.style.transform = `translate3d(${tx}px,${ty}px,0)`; } else wake(); });
  addEventListener("pagehide", () => cancelAnimationFrame(frame), { once: true });
}

function initPortrait() {
  const frame = $(".proof-portrait__frame"), canvas = $(".proof-portrait__dots"), photo = $(".proof-portrait__photo");
  if (!frame || !canvas || !photo) return;
  const ctx = canvas.getContext("2d");
  let points = [], width = 0, height = 0, dpr = 1, frameId = 0, active = false;
  const pointer = { x: .5, y: .5, tx: .5, ty: .5 };
  const colour = () => getComputedStyle(document.documentElement).getPropertyValue("--sys-color-primary").trim() || "#002080";
  const render = () => {
    pointer.x += (pointer.tx - pointer.x) * .14; pointer.y += (pointer.ty - pointer.y) * .14;
    const px = pointer.x * width, py = pointer.y * height;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = colour(); ctx.beginPath();
    points.forEach(point => {
      const distance = Math.hypot(point.x - px, point.y - py);
      const influence = active ? Math.max(0, 1 - distance / 105) : 0;
      const radius = point.radius * (1 + influence * .72);
      const dx = point.x - px, dy = point.y - py, length = Math.hypot(dx, dy) || 1;
      const x = point.x + dx / length * influence * 3, y = point.y + dy / length * influence * 3;
      ctx.moveTo(x + radius, y); ctx.arc(x, y, radius, 0, Math.PI * 2);
    });
    ctx.fill();
    if (!motionReduced()) {
      photo.style.clipPath = active ? `circle(27% at ${pointer.x * 100}% ${pointer.y * 100}%)` : "circle(0 at 50% 50%)";
      frame.style.transform = active ? `perspective(900px) rotateX(${(pointer.y - .5) * -5}deg) rotateY(${(pointer.x - .5) * 5}deg)` : "none";
    }
    const moving = Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > .002;
    if (active || moving) frameId = requestAnimationFrame(render); else frameId = 0;
  };
  const wake = () => { if (!frameId) frameId = requestAnimationFrame(render); };
  const sample = () => {
    if (!photo.naturalWidth) return;
    const rect = frame.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2); width = rect.width; height = rect.height;
    const cell = width < 380 ? 5 : 6, cols = Math.ceil(width / cell), rows = Math.ceil(height / cell);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px"; canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const off = document.createElement("canvas"); off.width = cols; off.height = rows;
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    const scale = Math.max(cols / photo.naturalWidth, rows / photo.naturalHeight);
    const imageWidth = photo.naturalWidth * scale, imageHeight = photo.naturalHeight * scale;
    offCtx.drawImage(photo, (cols - imageWidth) / 2, (rows - imageHeight) / 2, imageWidth, imageHeight);
    const pixels = offCtx.getImageData(0, 0, cols, rows).data; points = [];
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const i = (row * cols + col) * 4;
      const luminance = (pixels[i] * .299 + pixels[i + 1] * .587 + pixels[i + 2] * .114) / 255;
      const corrected = Math.pow(Math.max(0, Math.min(1, (luminance - .08) / .84)), 1.15);
      const screen = document.documentElement.dataset.theme === "dark";
      const radius = (screen ? corrected : 1 - corrected) * cell * .62;
      if (radius >= .3) points.push({ x: col * cell + cell / 2, y: row * cell + cell / 2, radius });
    }
    wake();
  };
  if (photo.complete) sample(); else photo.addEventListener("load", sample, { once: true });
  new ResizeObserver(sample).observe(frame);
  new MutationObserver(sample).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  frame.addEventListener("pointermove", event => {
    if (motionReduced()) return;
    const rect = frame.getBoundingClientRect();
    pointer.tx = (event.clientX - rect.left) / rect.width; pointer.ty = (event.clientY - rect.top) / rect.height;
    active = true; wake();
  }, { passive: true });
  frame.addEventListener("pointerleave", () => { active = false; pointer.tx = .5; pointer.ty = .5; wake(); });
  frame.addEventListener("click", () => { if (motionReduced()) frame.classList.toggle("is-developed"); });
}

function initReveals() {
  const sections = $$(".home-content > section, main > .section, main > .section--tight");
  sections.forEach(section => section.dataset.reveal = "section");
  if (motionReduced() || !("IntersectionObserver" in window)) { sections.forEach(section => section.classList.add("is-revealed")); return; }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-revealed"); observer.unobserve(entry.target);
  }), { threshold: .12, rootMargin: "0px 0px -8%" });
  sections.forEach(section => observer.observe(section));
}

function initSwatchFan() {
  const fan = $(".proof-fan");
  if (!fan) return;
  if (motionReduced() || !("IntersectionObserver" in window)) { fan.classList.add("is-fanned"); return; }
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    fan.classList.add("is-fanned");
    observer.disconnect();
  }, { threshold: .28 });
  observer.observe(fan);
}

function initDisclosures() {
  $$(".proof-job").forEach(item => item.addEventListener("toggle", () => {
    const summary = $("summary", item); if (summary) summary.dataset.cursor = item.open ? "Close" : "Open";
  }));
}

function initNavSurface() {
  const hero = $(".home-landing");
  if (!hero) return;
  let ticking = false;
  const update = () => {
    ticking = false;
    document.documentElement.classList.toggle("proof-nav-on-hero", scrollY < hero.offsetHeight * .82);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

export function initProofSystem() {
  initClock(); initCursor(); initPortrait(); initReveals(); initSwatchFan(); initDisclosures(); initNavSurface();
}
