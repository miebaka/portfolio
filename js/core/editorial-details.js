/* Original line-field treatment; no third-party texture code or assets. */
export function initEditorialDetails() {
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = new URL('../../styles/editorial-details.css', import.meta.url).href;
  document.head.append(css);
  const gate = matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
  let cleanup = () => {};
  function setup() {
    cleanup();
    if (!gate.matches || navigator.connection?.saveData) return;
    const cursor = document.createElement('span');
    cursor.className = 'editorial-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    const field = document.body.dataset.page !== 'home' ? document.createElement('canvas') : null;
    const ctx = field?.getContext('2d');
    if (ctx) { field.className = 'editorial-field'; field.setAttribute('aria-hidden', 'true'); document.body.append(field); }
    let x = -1000, y = -1000, previousX = x, previousY = y, frame = 0, scrolling = false, timer;
    function draw() {
      frame = 0;
      if (!ctx || document.hidden) return;
      ctx.clearRect(0, 0, field.width, field.height);
      ctx.strokeStyle = getComputedStyle(document.body).color;
      ctx.globalAlpha = .045;
      ctx.lineWidth = 1;
      const angle = Math.atan2(y - previousY, x - previousX);
      for (let py = 14; py < field.height; py += 30) for (let px = 12; px < field.width; px += 28) {
        const strength = scrolling ? 0 : Math.max(0, 1 - Math.hypot(px - x, py - y) / 110);
        const a = angle * strength * .35;
        ctx.beginPath(); ctx.moveTo(px - Math.cos(a) * 4, py - Math.sin(a) * 4);
        ctx.lineTo(px + Math.cos(a) * 4, py + Math.sin(a) * 4); ctx.stroke();
      }
    }
    function queue() { if (!frame) frame = requestAnimationFrame(draw); }
    function resize() { if (ctx) { field.width = innerWidth; field.height = innerHeight; queue(); } }
    function move(event) {
      previousX = x; previousY = y; x = event.clientX; y = event.clientY;
      cursor.style.transform = `translate3d(${x}px,${y}px,0)`;
      cursor.dataset.link = String(Boolean(event.target.closest('a,button')));
      cursor.hidden = Boolean(event.target.closest('input,textarea,select,[contenteditable],p'));
      queue();
    }
    function leave() { cursor.hidden = true; x = y = -1000; queue(); }
    function scroll() { scrolling = true; queue(); clearTimeout(timer); timer = setTimeout(() => { scrolling = false; queue(); }, 150); }
    document.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', scroll, { passive: true });
    document.addEventListener('visibilitychange', leave);
    resize();
    cleanup = () => {
      cursor.remove(); field?.remove(); cancelAnimationFrame(frame); clearTimeout(timer);
      document.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize); window.removeEventListener('scroll', scroll);
      document.removeEventListener('visibilitychange', leave);
    };
  }
  gate.addEventListener('change', setup);
  setup();
}
