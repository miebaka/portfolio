/* Interactive dot-matrix positioning statement. The words, rather than the
   designer's name, are the footer's final and most memorable expression. */
const PITCH = 6;
const DOT = 2.2;
const RADIUS = 128;

export function initFooterSignature() {
  const host = document.querySelector(".site-footer__signature");
  if (!host) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const statement = host.dataset.text || "I design brand systems, then build the tools that keep them intact.";

  const canvas = document.createElement("canvas");
  canvas.className = "site-footer__signature-canvas";
  host.append(canvas);
  const context = canvas.getContext("2d");
  if (!context) return;

  const pointer = { x: -9999, y: -9999, active: false };
  let points = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let generation = 0;
  let restColor = "rgba(255,255,255,.48)";

  function textLines(context, text, maxWidth, maxLines) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach(word => {
      const next = line ? line + " " + word : word;
      if (line && context.measureText(next).width > maxWidth && lines.length < maxLines - 1) {
        lines.push(line);
        line = word;
      } else line = next;
    });
    lines.push(line);
    return lines;
  }

  function rebuild() {
    const current = ++generation;
    width = Math.max(1, Math.round(host.clientWidth));
    height = Math.max(1, Math.round(host.clientHeight));
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const channels = getComputedStyle(host).color.match(/[\d.]+/g)?.slice(0, 3) || [255, 255, 255];
    restColor = `rgba(${channels.join(",")},.48)`;

    if (current !== generation) return;
    const sample = document.createElement("canvas");
    sample.width = width;
    sample.height = height;
    const sampleContext = sample.getContext("2d", { willReadFrequently: true });
    const maxLines = width < 640 ? 4 : 2;
    const maxWidth = width - Math.max(32, width * .06);
    let fontSize = Math.min(height / (maxLines * 1.04), width / 10);
    let lines = [];
    do {
      sampleContext.font = `600 ${fontSize}px Schibsted Grotesk, sans-serif`;
      lines = textLines(sampleContext, statement, maxWidth, maxLines);
      if (lines.every(line => sampleContext.measureText(line).width <= maxWidth)) break;
      fontSize -= 1;
    } while (fontSize > 18);
    const lineHeight = fontSize * 1.02;
    const blockHeight = lines.length * lineHeight;
    sampleContext.fillStyle = "#000";
    sampleContext.textBaseline = "middle";
    lines.forEach((line, index) => {
      sampleContext.fillText(line, Math.max(16, width * .03), (height - blockHeight) / 2 + lineHeight * (index + .5));
    });
    const pixels = sampleContext.getImageData(0, 0, width, height).data;
    const next = [];
    for (let y = PITCH / 2; y < height; y += PITCH) {
      for (let x = PITCH / 2; x < width; x += PITCH) {
        const alpha = pixels[(Math.round(y) * width + Math.round(x)) * 4 + 3];
        if (alpha > 32) next.push({ homeX: x, homeY: y, x, y, vx: 0, vy: 0 });
      }
    }
    points = next;
    host.classList.add("is-enhanced");
    if (reducedMotion) {
      running = true;
      draw();
      running = false;
    }
  }

  function draw() {
    if (!running) return;
    context.clearRect(0, 0, width, height);
    for (const point of points) {
      const dx = point.x - pointer.x;
      const dy = point.y - pointer.y;
      const distance = Math.hypot(dx, dy) || 1;
      const proximity = pointer.active && distance < RADIUS ? 1 - distance / RADIUS : 0;
      if (!reducedMotion && proximity) {
        const force = proximity * proximity * 1.9;
        point.vx += dx / distance * force;
        point.vy += dy / distance * force;
      }
      point.vx += (point.homeX - point.x) * .055;
      point.vy += (point.homeY - point.y) * .055;
      point.vx *= .79;
      point.vy *= .79;
      point.x += point.vx;
      point.y += point.vy;
      context.fillStyle = proximity > .08 ? "rgba(255,160,143,.92)" : restColor;
      const size = DOT + proximity * 1.8;
      context.fillRect(point.x - size / 2, point.y - size / 2, size, size);
    }
    if (!reducedMotion) frame = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(draw);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }
  function move(event) {
    const rect = host.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  }
  function leave() { pointer.active = false; }

  if (!reducedMotion) {
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
  }
  const resize = new ResizeObserver(rebuild);
  resize.observe(host);
  const theme = new MutationObserver(rebuild);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  if (!reducedMotion) {
    const visibility = new IntersectionObserver(([entry]) => entry.isIntersecting && !document.hidden ? start() : stop(), { threshold: .01 });
    visibility.observe(host);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else if (host.getBoundingClientRect().top < innerHeight) start();
    });
  }
  rebuild();
}
