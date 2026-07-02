/* Menu scene — cursor-reactive WebGL backdrop behind the fullscreen menu.
   Three.js loads lazily from CDN on the first open, so it never touches the
   critical path. Progressive enhancement throughout: a failed import, missing
   WebGL, or prefers-reduced-motion all leave the flat overlay untouched. */

const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.js";

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}`;

/* Domain-warped smoke drifting toward the cursor, plus a movement-charged
   torch glow. Alpha stays low so the blurred overlay (and type) read through. */
const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;
uniform float u_vel;
uniform vec3  u_base;
uniform vec3  u_accent;
varying vec2  vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),                 hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 asp = vec2(u_res.x / u_res.y, 1.0);
  vec2 p = vUv * asp;
  vec2 m = u_mouse * asp;
  float t = u_time * 0.05;

  /* smoke field, gently pulled toward the cursor */
  vec2 pull = (m - p) * 0.22;
  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t * 1.3 + 4.7));
  float f = fbm(p * 1.8 + q * 1.6 + pull + t);

  /* torch: tight core + wide halo, charged by pointer velocity */
  float d = length(p - m);
  float vel = min(u_vel * 26.0, 1.4);
  float torch = exp(-d * d * 7.0) * (0.45 + vel) + exp(-d * 2.2) * 0.20;

  vec3 col = u_base;
  col = mix(col, u_accent * 0.55, smoothstep(0.45, 0.95, f) * 0.35);
  col += u_accent * torch * (0.45 + f * 0.8);
  col += u_accent * pow(max(1.0 - d, 0.0), 6.0) * vel * 0.5;

  /* grain keeps the gradient from banding */
  col += (hash(vUv * u_res + u_time) * 2.0 - 1.0) * 0.015;

  float a = clamp(smoothstep(0.4, 1.0, f) * 0.30 + torch * 0.85, 0.0, 0.9);
  gl_FragColor = vec4(col, a);
}`;

function cssHexToRGB(varName, fallback) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw) ? raw.slice(1) : fallback;
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = parseInt(full, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function createMenuScene(host) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let uniforms = null;
  let raf = 0;
  let running = false;
  let failed = false;
  let hasPointer = false;

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, vel: 0 };

  function onPointerMove(e) {
    hasPointer = true;
    const rect = host.getBoundingClientRect();
    mouse.tx = (e.clientX - rect.left) / rect.width;
    mouse.ty = 1 - (e.clientY - rect.top) / rect.height;
  }

  function resize() {
    if (!renderer) return;
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    uniforms.u_res.value.set(w, h);
  }

  async function build() {
    const THREE = await import(THREE_CDN);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "site-menu__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");

    uniforms = {
      u_time:   { value: 0 },
      u_res:    { value: new THREE.Vector2(1, 1) },
      u_mouse:  { value: new THREE.Vector2(0.5, 0.5) },
      u_vel:    { value: 0 },
      u_base:   { value: new THREE.Vector3() },
      u_accent: { value: new THREE.Vector3() },
    };
    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        transparent: true,
        depthTest: false,
      })
    ));
    host.prepend(renderer.domElement);
  }

  function loop(now) {
    if (!running) return;
    const t = now * 0.001;

    /* Ambient drift until a pointer shows up (touch devices stay alive) */
    if (!hasPointer) {
      mouse.tx = 0.5 + 0.32 * Math.sin(t * 0.30);
      mouse.ty = 0.5 + 0.26 * Math.cos(t * 0.23);
    }
    const dx = mouse.tx - mouse.x, dy = mouse.ty - mouse.y;
    mouse.vel += (Math.hypot(dx, dy) - mouse.vel) * 0.08;
    mouse.x += dx * 0.07;
    mouse.y += dy * 0.07;

    uniforms.u_time.value = t;
    uniforms.u_mouse.value.set(mouse.x, mouse.y);
    uniforms.u_vel.value = mouse.vel;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }

  async function start() {
    if (failed || running) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      if (!renderer) await build();
    } catch (_) {
      failed = true; /* CDN or WebGL unavailable — flat overlay stands */
      return;
    }
    /* Theme may have flipped since last open — re-read the palette tokens.
       The overlay is dark in both themes: base = its dark surface tone. */
    const dark = document.documentElement.dataset.theme === "dark";
    uniforms.u_base.value.fromArray(cssHexToRGB(dark ? "--paper" : "--ink", "16140f"));
    uniforms.u_accent.value.fromArray(cssHexToRGB("--clay", "c2531c"));

    running = true;
    hasPointer = false;
    mouse.x = mouse.tx = 0.5;
    mouse.y = mouse.ty = 0.5;
    mouse.vel = 0;
    resize();
    window.addEventListener("resize", resize);
    host.addEventListener("pointermove", onPointerMove);
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    host.removeEventListener("pointermove", onPointerMove);
  }

  return { start, stop };
}
