/* ==========================================================================
   hero-scene.js — Full-screen portrait with mouse-driven depth parallax.

   Technique: two planes, one texture.
   · Background plane  — drifts opposite the cursor (recedes)
   · Subject plane     — drifts with the cursor behind a radial alpha mask
                         centred on the face (advances)
   · Vignette plane    — bottom-dark gradient so text stays readable

   No layer segmentation required; the radial mask and feathered falloff
   sell the depth separation cleanly at the ±1.4 % UV shift range used.
   ========================================================================== */
import * as THREE from "three";

const IMG_W = 1080;
const IMG_H = 1350;
const IMG_ASPECT = IMG_W / IMG_H; // 0.8 — portrait (4:5)

/* ── Shared vertex shader ─────────────────────────────────────────────── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* cover() — maps vUv so the image fills the frame without distortion,
   matching CSS background-size:cover behaviour. */
const COVER = /* glsl */ `
  vec2 cover(vec2 uv, float imgA, float scrA) {
    vec2 c = uv - 0.5;
    if (scrA > imgA) { c.y *= imgA / scrA; }
    else             { c.x *= scrA / imgA; }
    return c + 0.5;
  }
`;

/* ── Background layer — whole portrait, slow counter-drift ────────────── */
const FRAG_BG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2      uMouse;
  uniform float     uImgA;
  uniform float     uScrA;
  varying vec2      vUv;
  ${COVER}
  void main() {
    vec2 uv = cover(vUv, uImgA, uScrA);
    uv += uMouse * -0.008;
    gl_FragColor = texture2D(uTex, clamp(uv, 0.001, 0.999));
  }
`;

/* ── Subject layer — radial mask centred on face, faster drift ────────── */
const FRAG_SUBJECT = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2      uMouse;
  uniform float     uImgA;
  uniform float     uScrA;
  varying vec2      vUv;
  ${COVER}
  void main() {
    vec2 uv = cover(vUv, uImgA, uScrA);
    uv += uMouse * 0.014;

    /* Radial mask: face sits at roughly (0.50, 0.32) in UV space.
       Elongate vertically to match portrait shape; feathered outer edge
       hides the cut cleanly so no hard boundary is visible. */
    vec2 d = vUv - vec2(0.50, 0.32);
    d.y   /= 0.70;
    float dist = length(d);
    float mask = 1.0 - smoothstep(0.16, 0.46, dist);

    vec4 col = texture2D(uTex, clamp(uv, 0.001, 0.999));
    gl_FragColor = vec4(col.rgb, col.a * mask);
  }
`;

/* ── Vignette — bottom gradient for text legibility ──────────────────── */
const FRAG_VIG = /* glsl */ `
  varying vec2 vUv;
  void main() {
    /* vUv.y = 0 at bottom, 1 at top */
    float bottom = smoothstep(0.62, 0.0, vUv.y);
    /* mild side darkening */
    float sides  = (1.0 - smoothstep(0.0, 0.18, vUv.x))
                 + (1.0 - smoothstep(1.0, 0.82, vUv.x));
    float a = bottom * 0.72 + sides * 0.06;
    /* warm-dark ink colour: #1c1a16 */
    gl_FragColor = vec4(0.110, 0.102, 0.086, clamp(a, 0.0, 0.85));
  }
`;

export function initHeroScene() {
  const canvas = document.querySelector("[data-mount='hero-canvas']");
  if (!canvas) return;

  /* Renderer */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  /* Ortho camera: -1..1 maps to clip space → PlaneGeometry(2,2) fills screen */
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  /* Shared full-screen quad geometry */
  const geo = new THREE.PlaneGeometry(2, 2);

  /* Texture — browser has preloaded this; TextureLoader gets a cache hit */
  const tex = new THREE.TextureLoader().load(
    "assets/images/optimized/miebaka-joshua-portrait-1080.avif"
  );
  tex.colorSpace = THREE.SRGBColorSpace;

  const scrA = () => canvas.clientWidth / canvas.clientHeight;

  /* Material factory */
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
  const vigMat = new THREE.ShaderMaterial({
    uniforms:       {},
    vertexShader:   VERT,
    fragmentShader: FRAG_VIG,
    transparent:    true,
    depthWrite:     false,
  });

  /* Meshes — renderOrder controls draw sequence without z-fighting */
  const bgMesh  = new THREE.Mesh(geo, bgMat);  bgMesh.renderOrder  = 0;
  const subMesh = new THREE.Mesh(geo, subMat); subMesh.renderOrder = 1;
  const vigMesh = new THREE.Mesh(geo, vigMat); vigMesh.renderOrder = 2;
  scene.add(bgMesh, subMesh, vigMesh);

  /* Mouse / pointer tracking */
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
    const ease = 0.045;
    mouse.x += (target.x - mouse.x) * ease;
    mouse.y += (target.y - mouse.y) * ease;
    bgMat.uniforms.uMouse.value.copy(mouse);
    subMat.uniforms.uMouse.value.copy(mouse);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
}
