/* ==========================================================================
   hero-scene.js — Mouse/gyro parallax on the portrait photo.

   Single plane, cover-fit UV, gentle pan on pointer/tilt.
   No blur, no masking, no colour change — the photo renders exactly as shot.
   ========================================================================== */
import * as THREE from "three";

const IMG_ASPECT = 1080 / 1350; // 4:5 portrait

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* cover() — CSS background-size:cover equivalent */
const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2      uMouse;
  uniform float     uImgA;
  uniform float     uScrA;
  varying vec2      vUv;

  vec2 cover(vec2 uv, float imgA, float scrA) {
    vec2 c = uv - 0.5;
    if (scrA > imgA) { c.y *= imgA / scrA; }
    else             { c.x *= scrA / imgA; }
    return c + 0.5;
  }

  void main() {
    vec2 uv = cover(vUv, uImgA, uScrA);
    uv += uMouse * 0.025;
    gl_FragColor = texture2D(uTex, clamp(uv, 0.001, 0.999));
  }
`;

export function initHeroScene() {
  const canvas = document.querySelector("[data-mount='hero-canvas']");
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x1c1a16);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const tex = new THREE.TextureLoader().load(
    "assets/images/optimized/miebaka-joshua-portrait-1080.avif"
  );
  tex.colorSpace = THREE.SRGBColorSpace;

  const scrA = () => canvas.clientWidth / canvas.clientHeight;

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTex:   { value: tex },
      uMouse: { value: new THREE.Vector2() },
      uImgA:  { value: IMG_ASPECT },
      uScrA:  { value: scrA() },
    },
    vertexShader:   VERT,
    fragmentShader: FRAG,
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const mouse  = new THREE.Vector2();
  const target = new THREE.Vector2();

  window.addEventListener("pointermove", (e) => {
    target.x =  (e.clientX / window.innerWidth  - 0.5);
    target.y = -(e.clientY / window.innerHeight - 0.5);
  });

  window.addEventListener("deviceorientation", (e) => {
    if (e.gamma == null) return;
    target.x = THREE.MathUtils.clamp(e.gamma / 45, -0.5, 0.5);
    target.y = THREE.MathUtils.clamp((e.beta - 45) / 45, -0.5, 0.5);
  });

  const resize = () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    mat.uniforms.uScrA.value = scrA();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  const tick = () => {
    mouse.x += (target.x - mouse.x) * 0.050;
    mouse.y += (target.y - mouse.y) * 0.050;
    mat.uniforms.uMouse.value.copy(mouse);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  tick();
}
