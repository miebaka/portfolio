const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const SMALL_SCREEN = "(max-width: 47.99rem)";

function constrainedDevice() {
  return matchMedia(REDUCED_MOTION).matches || matchMedia(SMALL_SCREEN).matches || navigator.connection?.saveData === true;
}

export async function initDecisionField() {
  const root = document.querySelector("[data-decision-field]");
  const canvas = root?.querySelector("canvas");
  if (!root || !canvas || constrainedDevice()) return;

  let THREE;
  let SVGLoader;
  try {
    [THREE, { SVGLoader }] = await Promise.all([
      import("../../node_modules/three/build/three.module.js"),
      import("../../node_modules/three/examples/jsm/loaders/SVGLoader.js"),
    ]);
  } catch (error) {
    console.warn("3D logo unavailable", error);
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  } catch (error) {
    console.warn("3D logo unavailable", error);
    return;
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  root.classList.add("is-webgl");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 10);
  const logo = new THREE.Group();
  logo.position.set(1.75, 0, 0);
  scene.add(logo);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xb9d5c2,
    emissive: 0x123524,
    emissiveIntensity: 0.12,
    metalness: 0.16,
    roughness: 0.32,
    clearcoat: 0.72,
    clearcoatRoughness: 0.2,
  });
  const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x7faf8f, transparent: true, opacity: 0.2, side: THREE.BackSide });
  const geometries = [];
  const meshes = [];

  try {
    const data = await new SVGLoader().loadAsync("assets/images/miebaka-joshua-logo.svg");
    data.paths.forEach(path => {
      SVGLoader.createShapes(path).forEach(shape => {
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 12, bevelEnabled: true, bevelThickness: 2.2, bevelSize: 1.8, bevelSegments: 3, curveSegments: 12 });
        geometries.push(geometry);
        const face = new THREE.Mesh(geometry, material);
        const edge = new THREE.Mesh(geometry, edgeMaterial);
        edge.scale.set(1.015, 1.015, 1.025);
        logo.add(face, edge);
        meshes.push(face, edge);
      });
    });
  } catch (error) {
    console.warn("3D logo asset unavailable", error);
    renderer.dispose();
    return;
  }

  const bounds = new THREE.Box3().setFromObject(logo);
  const center = bounds.getCenter(new THREE.Vector3());
  logo.children.forEach(child => {
    child.position.x -= center.x;
    child.position.y -= center.y;
    child.position.z -= center.z;
  });
  logo.scale.set(0.011, -0.011, 0.011);
  logo.rotation.set(-0.18, 0.42, -0.06);

  scene.add(new THREE.HemisphereLight(0xeaf7ee, 0x06140c, 1.75));
  const key = new THREE.DirectionalLight(0xd9efe0, 5.2);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const rim = new THREE.PointLight(0x4f9a68, 18, 20);
  rim.position.set(5, -2, 4);
  scene.add(rim);

  const pointer = new THREE.Vector2();
  const target = new THREE.Vector2();
  let dragging = false;
  let dragX = 0;
  let dragY = 0;
  let spin = 0;
  let frame = 0;
  let active = true;
  let inView = true;
  const startedAt = performance.now();
  let lastInteraction = startedAt;

  const wake = () => {
    lastInteraction = performance.now();
    if (active && inView && !frame) render();
  };
  const onPointerMove = event => {
    target.set((event.clientX / innerWidth - 0.5) * 2, (event.clientY / innerHeight - 0.5) * 2);
    if (dragging) {
      target.x += (event.clientX - dragX) * 0.008;
      target.y += (event.clientY - dragY) * 0.008;
      dragX = event.clientX;
      dragY = event.clientY;
    }
    wake();
  };
  const onPointerDown = event => {
    dragging = true;
    dragX = event.clientX;
    dragY = event.clientY;
    spin += 0.16;
    root.setPointerCapture?.(event.pointerId);
    wake();
  };
  const onPointerUp = event => {
    dragging = false;
    root.releasePointerCapture?.(event.pointerId);
    wake();
  };
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointerup", onPointerUp);
  root.addEventListener("pointercancel", onPointerUp);

  const resize = () => {
    const { width, height } = root.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(height, 1);
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);
  resize();

  function render() {
    if (!active || !inView) return;
    const elapsed = (performance.now() - startedAt) / 1000;
    const entrance = 1 - Math.pow(1 - Math.min(1, elapsed / 0.48), 4);
    pointer.lerp(target, dragging ? 0.15 : 0.055);
    spin *= 0.965;
    logo.rotation.y += (0.42 + pointer.x * 0.34 - logo.rotation.y) * 0.055 + spin;
    logo.rotation.x += (-0.18 - pointer.y * 0.22 - logo.rotation.x) * 0.055;
    logo.rotation.z += (-0.06 + pointer.x * 0.04 - logo.rotation.z) * 0.04;
    logo.scale.setScalar(0.011 * (0.94 + entrance * 0.06));
    logo.scale.y *= -1;
    logo.position.y = Math.sin(elapsed * 0.75) * 0.045;
    renderer.render(scene, camera);
    const entering = elapsed < 0.6;
    const responding = performance.now() - lastInteraction < 900 || Math.abs(spin) > 0.001;
    frame = entering || responding ? requestAnimationFrame(render) : 0;
  }

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    root.classList.toggle("is-visible", inView);
    if (inView && active && !frame) render();
    if (!inView && frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: "10% 0px" });
  intersectionObserver.observe(root);
  const onVisibility = () => {
    active = !document.hidden;
    if (active && inView && !frame) render();
    if (!active && frame) { cancelAnimationFrame(frame); frame = 0; }
  };
  document.addEventListener("visibilitychange", onVisibility);
  render();

  window.addEventListener("pagehide", () => {
    active = false;
    if (frame) cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    geometries.forEach(geometry => geometry.dispose());
    material.dispose();
    edgeMaterial.dispose();
    renderer.dispose();
  }, { once: true });
}
