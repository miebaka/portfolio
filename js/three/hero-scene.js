/* ==========================================================================
   hero-scene.js — iPhone-style spatial depth effect.

   Three layers from one texture, moving at different rates on mouse/tilt:
   · Background  — counter-drifts, soft Gaussian blur (depth-of-field)
   · Subject     — drifts forward, sharp, large elliptical mask over the face
                   and body; edges feather so the background "behind" it
                   is revealed when the layers separate on mouse move
   · No vignette — colours are preserved exactly as shot
   ========================================================================== */
import * as THREE from "three";

const IMG_ASPECT = 1080 / 1350; // 4:5 portrait

/* ── Shared vertex ────────────────────────────────────────────────────── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* cover() — equivalent to CSS background-size:cover */
const COVER = /* glsl */ `
  vec2 cover(vec2 uv, float imgA, float scrA) {
    vec2 c = uv - 0.5;
    if (scrA > imgA) { c.y *= imgA / scrA; }
    else             { c.x *= scrA / imgA; }
    return c + 0.5;
  }
`;

/* 3×3 Gaussian blur — simulates depth-of-field on the background layer */
const GAUSS = /* glsl */ `
  vec4 gaussBlur(sampler2D tex, vec2 uv, float r) {
    vec4 c  = vec4(0.0);
    c += texture2D(tex, uv + vec2(-r, -r)) * 0.0625;
    c += texture2D(tex, uv + vec2( 0., -r)) * 0.1250;
    c += texture2D(tex, uv + vec2( r,  -r)) * 0.0625;
    c += texture2D(tex, uv + vec2(-r,  0.)) * 0.1250;
    c += texture2D(tex, uv              )   * 0.2500;
    c += texture2D(tex, uv + vec2( r,   0.)) * 0.1250;
    c += texture2D(tex, uv + vec2(-r,   r)) * 0.0625;
    c += texture2D(tex, uv + vec2( 0.,  r)) * 0.1250;
    c += texture2D(tex, uv + vec2( r,   r)) * 0.0625;
    return c;
  }
`;

/* ── Background layer ─────────────────────────────────────────────────── */
const FRAG_BG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2      uMouse;
  uniform float     uImgA;
  uniform float     uScrA;
  varying vec2      vUv;
  ${COVER}
  ${GAUSS}
  void main() {
    vec2 uv = cover(vUv, uImgA, uScrA);
    /* Background recedes: moves strongly against the cursor direction */
    uv += uMouse * -0.040;
    /* Soft Gaussian blur — reinforces that this layer is "further away" */
    gl_FragColor = gaussBlur(uTex, clamp(uv, 0.001, 0.999), 0.0030);
  }
`;

/* ── Subject layer ────────────────────────────────────────────────────── */
const FRAG_SUBJECT = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2      uMouse;
  uniform float     uImgA;
  uniform float     uScrA;
  varying vec2      vUv;
  ${COVER}
  void main() {
    vec2 uv = cover(vUv, uImgA, uScrA);
    /* Subject advances: moves with the cursor — comes toward the viewer */
    uv += uMouse * 0.040;

    /* Large elliptical mask — covers face + torso, feathers at the edges.
       When the layers drift apart you genuinely see the background "behind"
       the subject at the edges, which sells the 3D depth illusion. */
    vec2 d = vUv - vec2(0.50, 0.46); // centred on face/upper body
    d.x *= 1.18;   // compress horizontally (portrait is narrower than tall)
    d.y *= 0.88;   // slight vertical compression
    float dist = length(d);
    /* Inner 0–0.38: fully subject; 0.38–0.56: feathered transition; >0.56: background */
    float mask = 1.0 - smoothstep(0.38, 0.56, dist);

    vec4 col = texture2D(uTex, clamp(uv, 0.001, 0.999));
    gl_FragColor = vec4(col.rgb, col.a * mask);
  }
`;

export function initHeroScene() {
  const canvas = document.querySelector("[data-mount='hero-canvas']");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const geo = new THREE.PlaneGeometry(2, 2);

  const tex = new THREE.TextureLoader().load(
    "assets/images/optimized/miebaka-joshua-portrait-1080.avif"
  );
  tex.colorSpace = THREE.SRGBColorSpace;

  const scrA = () => canvas.clientWidth / canvas.clientHeight;

  const mat = (frag, extra = {}) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uTex:   { value: tex },
        uMouse: { value: new THREE.Vector2() },
        uImgA:  { value: IMG_ASPECT },
        uScrA:  { value: scrA() },
      },
      vertexShader:   VERT,
      fragmentShader: frag,
      ...extra,
    });

  const bgMat  = mat(FRAG_BG);
  const subMat = mat(FRAG_SUBJECT, { transparent: true, depthWrite: false });

  const bgMesh  = new THREE.Mesh(geo, bgMat);  bgMesh.renderOrder  = 0;
  const subMesh = new THREE.Mesh(geo, subMat); subMesh.renderOrder = 1;
  scene.add(bgMesh, subMesh);

  /* Pointer tracking */
  const mouse  = new THREE.Vector2();
  const target = new THREE.Vector2();

  window.addEventListener("pointermove", (e) => {
    target.x =  (e.clientX / window.innerWidth  - 0.5);
    target.y = -(e.clientY / window.innerHeight - 0.5);
  });

  /* Gyroscope for mobile */
  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    target.x = THREE.MathUtils.clamp(e.gamma / 45, -0.5, 0.5);
    target.y = THREE.MathUtils.clamp((e.beta - 45) / 45, -0.5, 0.5);
  });

  /* Resize */
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    const sa = scrA();
    bgMat.uniforms.uScrA.value  = sa;
    subMat.uniforms.uScrA.value = sa;
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  /* Render loop */
  const tick = () => {
    const ease = 0.050;
    mouse.x += (target.x - mouse.x) * ease;
    mouse.y += (target.y - mouse.y) * ease;
    bgMat.uniforms.uMouse.value.copy(mouse);
    subMat.uniforms.uMouse.value.copy(mouse);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
}
