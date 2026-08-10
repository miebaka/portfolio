/* Footer scene — bioluminescent pixel grid that forms the script signature.
   Cell home positions are sampled from the SVG watermark so at rest the
   pixels spell the name; cursor proximity scatters them and they spring back.
   Progressive enhancement: if the SVG fails to load the scene is silent;
   the CSS ::before watermark remains as fallback. */

const CELL        = 2;
const GAP         = 2;
const PITCH       = CELL + GAP;   /* 4 px pitch */
const HALF        = CELL >> 1;    /* 1 */
const REPEL_DIST  = 160;          /* wide radius — scatter starts before cursor touches */
const REPEL_FORCE = 5.5;          /* explosive — cells fling well away from home */
const SPRING      = 0.035;        /* very soft — cells hang scattered, reform slowly */
const DAMPING     = 0.82;         /* higher damping — long drifting coast before return */
const DRIFT       = 0.004;        /* minimal — cells are tied to letter positions */
const REST_A      = 0.35;         /* clearly visible at rest — cells form the name */
const GLOW_A      = 0.70;         /* brighter mid-scatter glow */
const TRAIL_A     = 0.40;         /* strong kinetic trail while flying */

const SVG_SRC = "/assets/images/miebaka-joshua-script-name.svg";
const SVG_VW  = 705.67;  /* viewBox width  */
const SVG_VH  = 280;     /* viewBox height */

export function createFooterScene(host) {
  let canvas    = null;
  let ctx       = null;
  let imageData = null;
  let buf       = null;
  let raf       = 0;
  let running   = false;
  let failed    = false;
  let w = 0, h = 0;
  let cells     = [];
  let fg        = [22, 20, 15];
  let buildGen  = 0;  /* incremented on each buildGrid call; stale builds bail out */

  const mouse = { x: -9999, y: -9999 };

  function build() {
    canvas = document.createElement("canvas");
    canvas.className = "site-footer__canvas";
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      zIndex: "0",
      pointerEvents: "none",
    });
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unavailable");
    host.prepend(canvas);
    /* Fade out the static ::before watermark — inject inline so this works
       even when the stylesheet is stale-cached. */
    host.classList.add("scene-active");
    if (!document.getElementById("footer-scene-style")) {
      const s = document.createElement("style");
      s.id = "footer-scene-style";
      s.textContent = ".site-footer.scene-active::before{opacity:0;transition:opacity .8s}";
      document.head.appendChild(s);
    }
  }

  /* Mirrors the CSS mask rule in components/footer.css:
       mask-size: 100% auto; mask-position: center
     The signature now runs end to end — full footer width, height by ratio,
     centred vertically — and the footer clips any vertical overflow. Keep this
     in step with that rule. */
  function signatureRect() {
    const svgW = w;
    const svgH = (SVG_VH / SVG_VW) * svgW;
    if (svgH <= 0) return null;
    return { w: svgW, h: svgH, x: 0, y: (h - svgH) / 2 };
  }

  /* Horizontal edge fade matching the CSS gradient mask
     (transparent → 9% → 91% → transparent): the outermost cells dissolve so
     the particle signature bleeds into the margins like the static one. */
  function edgeAlpha(hx) {
    const fx = hx / w;
    let e = 1;
    if (fx < 0.09) e = fx / 0.09;
    else if (fx > 0.91) e = (1 - fx) / 0.09;
    return e < 0 ? 0 : e > 1 ? 1 : e;
  }

  /* Sample the SVG to find which grid positions fall inside the signature.
     Checks a 3×3 neighbourhood so thin strokes (which may be narrower than
     PITCH) still get cells. */
  async function buildGrid() {
    const gen = ++buildGen;

    let img;
    try {
      img = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = SVG_SRC;
      });
    } catch (_) {
      return; /* leave cells = [] — animation runs but draws nothing */
    }
    if (gen !== buildGen) return;

    const rect = signatureRect();
    if (!rect) return;

    /* Rasterize to offscreen canvas */
    const off    = document.createElement("canvas");
    off.width    = w;
    off.height   = h;
    const offCtx = off.getContext("2d");
    offCtx.drawImage(img, rect.x, rect.y, rect.w, rect.h);

    if (gen !== buildGen) return;

    const pixels  = offCtx.getImageData(0, 0, w, h).data;
    const newCells = [];
    const ox = PITCH / 2;
    const oy = PITCH / 2;

    for (let gy = oy; gy < h; gy += PITCH) {
      for (let gx = ox; gx < w; gx += PITCH) {
        const px = Math.round(gx);
        const py = Math.round(gy);
        /* Check 3×3 neighbourhood — catches strokes thinner than PITCH */
        let maxA = 0;
        outer: for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const a = pixels[(ny * w + nx) * 4 + 3];
              if (a > maxA) {
                maxA = a;
                if (maxA >= 20) break outer;
              }
            }
          }
        }
        if (maxA >= 20) {
          newCells.push({
            hx: gx, hy: gy,
            /* Slight initial jitter so cells drift into place on first appear */
            x:  gx + (Math.random() - 0.5) * PITCH * 2,
            y:  gy + (Math.random() - 0.5) * PITCH * 2,
            vx: 0, vy: 0,
            ph: Math.random() * Math.PI * 2,
            sp: SPRING  + (Math.random() - 0.5) * 0.012,
            dm: DAMPING + (Math.random() - 0.5) * 0.028,
            edge: edgeAlpha(gx),
          });
        }
      }
    }

    if (gen !== buildGen) return;
    cells = newCells;
  }

  function resize() {
    if (!canvas) return;
    w = host.clientWidth;
    h = host.clientHeight;
    canvas.width  = w;
    canvas.height = h;
    imageData = ctx.createImageData(w, h);
    buf = imageData.data;
    cells = [];      /* clear while async rebuild runs */
    buildGrid();
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
  }

  function loop(t) {
    if (!running) return;

    buf.fill(0);
    const [r8, g8, b8] = fg;

    for (const c of cells) {
      /* 1. Organic drift */
      c.vx += Math.sin(c.hy * 0.018 + t * 0.00027 + c.ph) * DRIFT;
      c.vy += Math.cos(c.hx * 0.018 + t * 0.00021 + c.ph * 1.4) * DRIFT;

      /* 2. Cursor repulsion (swirling twist) */
      const dx   = c.x - mouse.x;
      const dy   = c.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < REPEL_DIST && dist > 0) {
        const force = (1 - dist / REPEL_DIST) * REPEL_FORCE;
        const twist = Math.sin(t * 0.00038 + c.ph) * 0.25;
        const ct    = Math.cos(twist);
        const st    = Math.sin(twist);
        c.vx += ((dx / dist) * ct - (dy / dist) * st) * force;
        c.vy += ((dx / dist) * st + (dy / dist) * ct) * force;
      }

      /* 3. Spring to home position */
      c.vx += (c.hx - c.x) * c.sp;
      c.vy += (c.hy - c.y) * c.sp;

      /* 4. Soft boundary repulsion */
      const MARGIN = PITCH * 3;
      const WALL_F = 0.14;
      if (c.x < MARGIN)     c.vx += (1 - c.x / MARGIN)     * WALL_F;
      if (c.x > w - MARGIN) c.vx -= (1 - (w - c.x) / MARGIN) * WALL_F;
      if (c.y < MARGIN)     c.vy += (1 - c.y / MARGIN)     * WALL_F;
      if (c.y > h - MARGIN) c.vy -= (1 - (h - c.y) / MARGIN) * WALL_F;

      /* 5. Damp + integrate */
      c.vx *= c.dm;
      c.vy *= c.dm;
      c.x  += c.vx;
      c.y  += c.vy;

      /* 6. Hard clamp (safety net) */
      if (c.x < HALF)     { c.x = HALF;     c.vx = 0; }
      if (c.x > w - HALF) { c.x = w - HALF; c.vx = 0; }
      if (c.y < HALF)     { c.y = HALF;     c.vy = 0; }
      if (c.y > h - HALF) { c.y = h - HALF; c.vy = 0; }

      /* 7. Bioluminescent opacity — recomputed from final position */
      const pdx   = c.x - mouse.x;
      const pdy   = c.y - mouse.y;
      const pdist = Math.hypot(pdx, pdy);
      const prox  = pdist < REPEL_DIST ? (1 - pdist / REPEL_DIST) ** 1.5 : 0;
      const disp  = Math.hypot(c.x - c.hx, c.y - c.hy);
      const trail = Math.min(disp / 28, 1);
      const alpha = (REST_A + prox * GLOW_A + trail * TRAIL_A) * c.edge;

      /* 8. Write 2×2 pixel block */
      const px = Math.round(c.x) - HALF;
      const py = Math.round(c.y) - HALF;
      const a8 = (alpha * 255 + 0.5) | 0;

      let i = (py * w + px) << 2;
      buf[i] = r8; buf[i+1] = g8; buf[i+2] = b8; buf[i+3] = a8;
      i += 4;
      buf[i] = r8; buf[i+1] = g8; buf[i+2] = b8; buf[i+3] = a8;
      i = ((py+1) * w + px) << 2;
      buf[i] = r8; buf[i+1] = g8; buf[i+2] = b8; buf[i+3] = a8;
      i += 4;
      buf[i] = r8; buf[i+1] = g8; buf[i+2] = b8; buf[i+3] = a8;
    }

    ctx.putImageData(imageData, 0, 0);
    raf = requestAnimationFrame(loop);
  }

  async function start() {
    if (running || failed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!canvas) build();
    } catch (_) {
      failed = true;
      return;
    }
    const dark = document.documentElement.dataset.theme === "dark";
    fg = dark ? [237, 233, 225] : [22, 20, 15];
    mouse.x = -9999;
    mouse.y = -9999;

    w = host.clientWidth;
    h = host.clientHeight;
    canvas.width  = w;
    canvas.height = h;
    imageData = ctx.createImageData(w, h);
    buf = imageData.data;

    running = true;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    host.addEventListener("mouseleave", onMouseLeave);
    raf = requestAnimationFrame(loop);

    await buildGrid(); /* SVG loads async; loop already running, picks up cells when ready */
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("mousemove", onMouseMove);
    host.removeEventListener("mouseleave", onMouseLeave);
  }

  return { start, stop };
}

export function initFooterScene() {
  const footer = document.querySelector("footer.site-footer");
  if (!footer) return;

  const scene = createFooterScene(footer);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) scene.start();
        else scene.stop();
      });
    },
    { threshold: 0.01 }
  );

  observer.observe(footer);
}
