export function initAboutParticle() {
  const root = document.querySelector("[data-about-particle]");
  const canvas = root?.querySelector("[data-about-particle-canvas]");
  if (!root || !canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;
  const particles = [];
  const pointer = { x: -9999, y: -9999 };
  let frame = 0;
  let visible = true;
  let width = 0;
  let height = 0;

  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    width = root.clientWidth;
    height = root.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles.length = 0;
    const spacing = width < 640 ? 18 : 14;
    const radius = Math.min(width, height) * .3;
    for (let y = -radius; y <= radius; y += spacing) {
      for (let x = -radius; x <= radius; x += spacing) {
        const depth = Math.sqrt(Math.max(0, radius * radius - x * x - y * y));
        if (!depth) continue;
        const homeX = width * .64 + x + Math.sin(y * .035) * depth * .08;
        const homeY = height * .48 + y;
        particles.push({ x: homeX, y: homeY, homeX, homeY, size: .65 + depth / radius * 1.5, phase: Math.random() * Math.PI * 2 });
      }
    }
  };
  const render = time => {
    if (!visible) return;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "rgba(177,197,255,.82)";
    for (const particle of particles) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 130) {
        const force = (130 - distance) / 130;
        particle.x += dx / Math.max(distance, 1) * force * 8;
        particle.y += dy / Math.max(distance, 1) * force * 8;
      }
      particle.x += (particle.homeX + Math.sin(time * .0006 + particle.phase) * 3 - particle.x) * .055;
      particle.y += (particle.homeY + Math.cos(time * .0005 + particle.phase) * 2 - particle.y) * .055;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    frame = requestAnimationFrame(render);
  };
  const move = event => { pointer.x = event.clientX; pointer.y = event.clientY - root.getBoundingClientRect().top; };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    cancelAnimationFrame(frame);
    if (visible) frame = requestAnimationFrame(render);
  });
  resize();
  observer.observe(root);
  root.addEventListener("pointermove", move, { passive: true });
  root.addEventListener("pointerleave", () => { pointer.x = pointer.y = -9999; });
  window.addEventListener("resize", resize, { passive: true });
  frame = requestAnimationFrame(render);
}
