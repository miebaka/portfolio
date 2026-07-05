/* ==========================================================================
   logo-scene.js — 3D spinning glass logo for the 404 page.

   Loads miebaka-joshua-logo.svg via SVGLoader, extrudes each path shape
   into geometry, applies a MeshPhysicalMaterial glass look, and rotates
   the whole group clockwise (negative Y) at 2π / 8 rad/s.
   ========================================================================== */
import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

export function initLogoScene(container) {
  if (!container) return;

  const rect = container.getBoundingClientRect();
  let W = rect.width  || 280;
  let H = rect.height || 280;

  /* Renderer — transparent so the page background shows behind the canvas */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping      = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  /* Scene & Camera */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 50);
  camera.position.set(0, 0, 7);

  /* Lights */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const sun = new THREE.DirectionalLight(0xfff5e0, 3.5);
  sun.position.set(4, 6, 5);
  scene.add(sun);

  const accent = new THREE.DirectionalLight(0xc2531c, 1.0);  /* clay fill */
  accent.position.set(-5, -2, 3);
  scene.add(accent);

  const rim = new THREE.PointLight(0xe8e0d8, 2.5, 20);
  rim.position.set(0, 4, -3);
  scene.add(rim);

  /* Glass material */
  const mat = new THREE.MeshPhysicalMaterial({
    color:           0xf0ebe0,  /* warm white tint */
    transmission:    0.88,      /* glass pass-through */
    opacity:         1.0,
    roughness:       0.08,
    metalness:       0.05,
    thickness:       0.4,       /* refraction depth */
    ior:             1.5,       /* standard glass */
    transparent:     true,
    side:            THREE.DoubleSide,
    envMapIntensity: 0.8,
  });

  /* Logo group — all extruded shapes land here */
  const logoGroup = new THREE.Group();
  scene.add(logoGroup);

  /* Load SVG — viewBox 0 0 400 400 */
  const svgUrl = new URL("../../assets/images/miebaka-joshua-logo.svg", import.meta.url).href;
  const loader  = new SVGLoader();
  loader.load(
    svgUrl,
    (data) => {
      const extrudeOpts = {
        depth:          0.28,
        bevelEnabled:   true,
        bevelThickness: 0.025,
        bevelSize:      0.02,
        bevelSegments:  4,
      };

      data.paths.forEach((path) => {
        SVGLoader.createShapes(path).forEach((shape) => {
          const geo  = new THREE.ExtrudeGeometry(shape, extrudeOpts);
          const mesh = new THREE.Mesh(geo, mat);
          logoGroup.add(mesh);
        });
      });

      /* SVG Y-axis is flipped vs Three.js; scale down to ~3.5 world units wide */
      const scale = 3.5 / 400;
      logoGroup.scale.set(scale, -scale, scale);
      /* Offset so the SVG centre (200, 200) maps to the scene origin */
      logoGroup.position.set(-200 * scale, 200 * scale, 0);
    },
    undefined,
    (err) => console.warn("[logo-scene] SVG load failed", err)
  );

  /* Clockwise rotation — negative Y in Three.js = clockwise from front */
  const ROT_SPEED = (Math.PI * 2) / 8;  /* 2π/8 rad/s → full cycle in 8 s */

  let prev = 0;
  function animate(ts) {
    requestAnimationFrame(animate);
    const dt = Math.min((ts - prev) / 1000, 0.05);
    prev = ts;
    logoGroup.rotation.y -= ROT_SPEED * dt;
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  /* Resize */
  window.addEventListener("resize", () => {
    W = container.clientWidth;
    H = container.clientHeight;
    if (!W || !H) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  }, { passive: true });
}
