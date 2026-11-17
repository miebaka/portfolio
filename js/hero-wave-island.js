import {
  Clock,
  Color,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

const MAX_AUTOPLAY_MS = 4800;
const POINTER_WAKE_MS = 1200;

const vertexShader = `
uniform float uTime;
uniform float uMotion;
uniform vec2 uPointer;
varying vec2 vUv;
varying float vHeight;

void main() {
  vUv = uv;
  vec3 p = position;
  float t = uTime;
  float broad = sin(p.x * 0.72 + t * 0.56) * 0.48;
  float cross = sin(p.y * 1.04 - t * 0.42 + p.x * 0.22) * 0.28;
  float detail = sin((p.x + p.y) * 1.75 + t * 0.34) * 0.10;
  float pointerWave = exp(-4.2 * distance(uv, uPointer * 0.18 + 0.5)) * 0.32;
  p.z = (broad + cross + detail + pointerWave) * uMotion;
  vHeight = p.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const fragmentShader = `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
varying vec2 vUv;
varying float vHeight;

void main() {
  float fold = smoothstep(-0.75, 0.75, vHeight);
  float sheen = pow(1.0 - abs(vHeight), 5.0) * 0.30;
  float pointerLight = exp(-5.0 * distance(vUv, uPointer * 0.12 + 0.5)) * 0.16;
  vec3 colour = mix(uColorA, uColorB, fold);
  colour = mix(colour, uColorC, clamp(sheen + pointerLight, 0.0, 0.42));
  gl_FragColor = vec4(colour, 1.0);
}
`;

const parseColor = (value, fallback) => {
  try { return new Color(value || fallback); }
  catch { return new Color(fallback); }
};

export function mountHeroWave(host, initialState) {
  const renderer = new WebGLRenderer({
    alpha: false,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.domElement.className = "hero-wave__canvas";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.append(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 20);
  camera.position.set(0, 0, 6);

  const geometry = new PlaneGeometry(14, 9, 112, 72);
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uPointer: { value: new Vector2(0, 0) },
      uColorA: { value: new Color("#07112b") },
      uColorB: { value: new Color("#002080") },
      uColorC: { value: new Color("#b1c5ff") },
    },
  });
  const mesh = new Mesh(geometry, material);
  mesh.rotation.x = MathUtils.degToRad(-12);
  mesh.rotation.z = MathUtils.degToRad(-8);
  scene.add(mesh);

  const pointerTarget = new Vector2();
  const clock = new Clock(false);
  let state = { ...initialState };
  let frame = 0;
  let elapsed = 0;
  let wakeUntil = 0;
  let visible = true;
  let destroyed = false;
  let readyResolve;
  const ready = new Promise(resolve => { readyResolve = resolve; });

  const setPalette = next => {
    const palette = next.colors || [];
    material.uniforms.uColorA.value.copy(parseColor(palette[0], "#07112b"));
    material.uniforms.uColorB.value.copy(parseColor(palette[1], "#002080"));
    material.uniforms.uColorC.value.copy(parseColor(palette[2], "#b1c5ff"));
  };

  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    const aspect = width / height;
    const halfHeight = 4.5;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    renderer.render(scene, camera);
  };

  const shouldAnimate = () => state.animate && visible && !document.hidden &&
    (elapsed < MAX_AUTOPLAY_MS / 1000 || performance.now() < wakeUntil);

  const renderFrame = () => {
    frame = 0;
    if (destroyed) return;
    const delta = Math.min(clock.getDelta(), 0.05);
    if (shouldAnimate()) elapsed += delta;
    material.uniforms.uTime.value += delta;
    material.uniforms.uMotion.value = MathUtils.damp(
      material.uniforms.uMotion.value,
      state.animate ? 1 : 0.72,
      4,
      delta,
    );
    material.uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-delta * 5));
    renderer.render(scene, camera);
    if (shouldAnimate()) frame = requestAnimationFrame(renderFrame);
    else clock.stop();
  };

  const requestRender = () => {
    if (destroyed || frame || !visible || document.hidden) return;
    clock.start();
    frame = requestAnimationFrame(renderFrame);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) requestRender();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; clock.stop(); }
  }, { threshold: 0.01 });
  intersectionObserver.observe(host);

  setPalette(state);
  resize();
  renderer.render(scene, camera);
  readyResolve();
  requestRender();

  return {
    ready,
    update(nextState) {
      state = { ...state, ...nextState };
      setPalette(state);
      if (!state.animate) elapsed = MAX_AUTOPLAY_MS / 1000;
      requestRender();
    },
    setPointer(x, y) {
      pointerTarget.set(x, y);
      if (state.animate) wakeUntil = performance.now() + POINTER_WAKE_MS;
      requestRender();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
