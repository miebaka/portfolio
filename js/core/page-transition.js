const TRANSITION_KEY = "miebaka-page-transition";
const TRANSITION_DURATION = 820;

function storageGet() {
  try { return JSON.parse(sessionStorage.getItem(TRANSITION_KEY) || "null"); }
  catch { return null; }
}

function storageSet(value) {
  try { sessionStorage.setItem(TRANSITION_KEY, JSON.stringify(value)); }
  catch {}
}

function storageClear() {
  try { sessionStorage.removeItem(TRANSITION_KEY); }
  catch {}
}

function isPageLink(link, event) {
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
      event.ctrlKey || event.shiftKey || event.altKey || link.target ||
      link.hasAttribute("download")) return false;
  const destination = new URL(link.href, location.href);
  if (destination.origin !== location.origin || !/\.html$/.test(destination.pathname)) return false;
  return destination.href !== location.href && destination.hash === "";
}

async function buildSnake(canvas) {
  const T = await import("../vendor/three/three.module.min.js");
  const renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-8, 8, 4.5, -4.5, .1, 30);
  camera.position.z = 10;
  const group = new T.Group();
  const points = Array.from({ length: 13 }, (_, index) => {
    const x = -7.2 + index * 1.2;
    return new T.Vector3(x, Math.sin(index * 1.35) * .72, Math.cos(index * .8) * .12);
  });
  const curve = new T.CatmullRomCurve3(points);
  const skin = new T.MeshPhysicalMaterial({
    color: 0xc2531c, metalness: .15, roughness: .3, clearcoat: 1,
    clearcoatRoughness: .2
  });
  const body = new T.Mesh(new T.TubeGeometry(curve, 120, .24, 12, false), skin);
  group.add(body);

  const headPosition = curve.getPoint(1);
  const head = new T.Mesh(new T.SphereGeometry(.42, 24, 16), skin);
  head.scale.set(1.35, .82, .72);
  head.position.copy(headPosition);
  group.add(head);
  const eyeMaterial = new T.MeshBasicMaterial({ color: 0x16140f });
  for (const y of [-.16, .16]) {
    const eye = new T.Mesh(new T.SphereGeometry(.055, 10, 8), eyeMaterial);
    eye.position.set(headPosition.x + .34, headPosition.y + y, headPosition.z + .25);
    group.add(eye);
  }
  scene.add(group, new T.HemisphereLight(0xffffff, 0x6b6256, 2.2));
  const key = new T.DirectionalLight(0xffffff, 2.6);
  key.position.set(-3, 4, 8);
  scene.add(key);

  function resize() {
    const width = innerWidth;
    const height = innerHeight;
    const aspect = width / height;
    const vertical = 4.5;
    camera.left = -vertical * aspect;
    camera.right = vertical * aspect;
    camera.top = vertical;
    camera.bottom = -vertical;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resize();
  return { T, renderer, scene, camera, group, body, head, eyeMaterial, skin, resize };
}

async function playTransition(direction) {
  const overlay = document.createElement("div");
  overlay.className = `page-transition page-transition--${direction}`;
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = '<div class="page-transition__veil"></div><canvas class="page-transition__canvas"></canvas>';
  document.body.append(overlay);
  const canvas = overlay.querySelector("canvas");
  let snake;
  try { snake = await buildSnake(canvas); }
  catch { overlay.classList.add("page-transition--fallback"); }

  const start = performance.now();
  // Commit the initial clip before changing state so the wipe cannot collapse
  // into one paint on fast local navigations.
  overlay.getBoundingClientRect();
  overlay.classList.add("is-running");
  return new Promise(resolve => {
    function frame(now) {
      const progress = Math.min(1, (now - start) / TRANSITION_DURATION);
      if (snake) {
        const eased = 1 - Math.pow(1 - progress, 3);
        snake.group.position.x = direction === "out" ? -10 + eased * 20 : -4 + eased * 18;
        snake.group.rotation.z = Math.sin(progress * Math.PI * 2) * .035;
        snake.renderer.render(snake.scene, snake.camera);
      }
      if (progress < 1) requestAnimationFrame(frame);
      else {
        if (snake) {
          snake.body.geometry.dispose(); snake.head.geometry.dispose();
          snake.skin.dispose(); snake.eyeMaterial.dispose(); snake.renderer.dispose();
        }
        if (direction === "in") overlay.remove();
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
}

export function initPageTransition() {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const saved = storageGet();
  if (saved && saved.path === location.pathname && Date.now() - saved.time < 5000) {
    storageClear();
    if (!reduceMotion.matches) {
      document.documentElement.classList.add("page-is-entering");
      document.body.setAttribute("aria-busy", "true");
      playTransition("in").finally(() => {
        document.documentElement.classList.remove("page-is-entering");
        document.body.removeAttribute("aria-busy");
      });
    }
  } else storageClear();

  document.addEventListener("click", async event => {
    const link = event.target.closest("a[href]");
    if (!isPageLink(link, event) || reduceMotion.matches) return;
    event.preventDefault();
    if (document.documentElement.classList.contains("page-is-leaving")) return;
    const destination = new URL(link.href, location.href);
    document.documentElement.classList.add("page-is-leaving");
    document.body.setAttribute("aria-busy", "true");
    storageSet({ path: destination.pathname, time: Date.now() });
    await playTransition("out");
    location.assign(destination.href);
  });
}
