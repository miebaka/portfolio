const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const SMALL_SCREEN = "(max-width: 47.99rem)";

function constrainedDevice() {
  const preference = document.documentElement.dataset.motionPreference;
  const reduce = preference === "reduce" || (preference !== "full" && matchMedia(REDUCED_MOTION).matches);
  return reduce || matchMedia(SMALL_SCREEN).matches || navigator.connection?.saveData === true;
}

export async function initDecisionField() {
  const root = document.querySelector("[data-decision-field]");
  const canvas = root?.querySelector("canvas");
  if (!root || !canvas || constrainedDevice()) return;

  let THREE;
  try { THREE = await import("../../assets/vendor/three.module.js"); }
  catch (error) { console.warn("3D identity unavailable", error); return; }

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch (error) { console.warn("3D identity unavailable", error); return; }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  camera.position.set(0, 0, 9);
  const mark = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1.25, .28, .28);
  /* Rare-page delight only: a small custom shader turns the identity bars into
     a responsive ultramarine material. It is decorative, skipped entirely for
     reduced motion, small screens, and save-data devices. */
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBase: { value: new THREE.Color(0x1c3da4) },
      uEdge: { value: new THREE.Color(0xb1c5ff) },
    },
    vertexShader: `
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;
      void main() {
        vec3 transformed = position;
        float wave = sin((position.x + position.y) * 3.5 + uTime * 1.2) * 0.018;
        transformed += normal * wave;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewPosition = mvPosition.xyz;
        vWave = wave;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uBase;
      uniform vec3 uEdge;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying float vWave;
      void main() {
        vec3 viewDir = normalize(-vViewPosition);
        float rim = pow(1.0 - max(0.0, dot(viewDir, normalize(vNormal))), 2.4);
        float lightBand = smoothstep(-0.018, 0.018, vWave);
        vec3 color = mix(uBase, uEdge, clamp(rim * 0.82 + lightBand * 0.12, 0.0, 1.0));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const positions = [
    [-1.35, .9, 0], [-.45, .9, Math.PI / 2], [.45, .9, 0],
    [-1.35, 0, Math.PI / 2], [-.45, 0, 0], [.45, 0, Math.PI / 2],
    [-1.35, -.9, 0], [-.45, -.9, Math.PI / 2], [.45, -.9, 0],
  ];
  positions.forEach(([x, y, rotation]) => {
    const bar = new THREE.Mesh(geometry, material);
    bar.position.set(x, y, 0);
    bar.rotation.z = rotation;
    mark.add(bar);
  });
  mark.rotation.set(-.14, .38, -.05);
  scene.add(mark);
  const target = new THREE.Vector2();
  const current = new THREE.Vector2();
  let frame = 0;
  let active = true;
  let inView = true;
  let lastInteraction = performance.now();
  const resize = () => {
    const { width, height } = root.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  const render = () => {
    if (!active || !inView) return;
    material.uniforms.uTime.value = performance.now() * .001;
    current.lerp(target, .08);
    mark.rotation.y += (.38 + current.x * .28 - mark.rotation.y) * .08;
    mark.rotation.x += (-.14 - current.y * .18 - mark.rotation.x) * .08;
    renderer.render(scene, camera);
    frame = performance.now() - lastInteraction < 900 ? requestAnimationFrame(render) : 0;
  };
  const wake = () => { lastInteraction = performance.now(); if (!frame && active && inView) render(); };
  const onPointerMove = event => {
    const bounds = root.getBoundingClientRect();
    target.set(((event.clientX - bounds.left) / bounds.width - .5) * 2, ((event.clientY - bounds.top) / bounds.height - .5) * 2);
    wake();
  };
  root.addEventListener("pointermove", onPointerMove, { passive: true });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView) wake();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  });
  intersectionObserver.observe(root);
  const onVisibility = () => {
    active = !document.hidden;
    if (active) wake();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  };
  document.addEventListener("visibilitychange", onVisibility);
  resize();
  render();
  root.classList.add("is-webgl");

  window.addEventListener("pagehide", () => {
    active = false;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    root.removeEventListener("pointermove", onPointerMove);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }, { once: true });
}
