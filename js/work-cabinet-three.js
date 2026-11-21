/**
 * Work cabinet: progressive, on-demand Three.js material layer.
 *
 * The DOM remains the source of truth for links, labels, keyboard focus,
 * scroll position, motion preferences and page-to-page navigation.
 * The canvas is decorative, never a pointer or accessibility target.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const SELECTOR = "[data-project-archive]";
const MAX_DPR = 1.5;
const MOBILE_DPR = 1.25;
const EPSILON = 0.14;

export function cabinetQuality({
  width = 0,
  devicePixelRatio = 1,
  saveData = false,
  hardwareConcurrency = 4,
} = {}) {
  if (saveData || hardwareConcurrency <= 2) return { enabled: false, pixelRatio: 1, environment: false };
  const mobile = width < 700;
  return {
    enabled: true,
    pixelRatio: Math.min(Math.max(devicePixelRatio || 1, 1), mobile ? MOBILE_DPR : MAX_DPR),
    environment: !mobile && hardwareConcurrency >= 4,
  };
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function paperTexture(doc, hex, seed) {
  const canvas = doc.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = hex;
  context.fillRect(0, 0, 256, 256);
  const random = seededRandom(seed);
  for (let i = 0; i < 6800; i++) {
    const x = random() * 256;
    const y = random() * 256;
    const opacity = 0.012 + random() * 0.045;
    context.fillStyle = random() > 0.55
      ? "rgba(77,57,36," + opacity.toFixed(3) + ")"
      : "rgba(255,255,255," + opacity.toFixed(3) + ")";
    context.fillRect(x, y, random() > 0.9 ? 1.5 : 0.6, 0.6 + random() * 3.3);
  }
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  // ExtrudeGeometry uses world-size UVs, not normalised 0–1 UVs.
  map.repeat.set(1 / 440, 1 / 280);
  map.anisotropy = 4;
  return map;
}

function folderOutline(width, height, tab) {
  const start = Math.max(7, Math.min(width - 30, tab.left));
  const end = Math.max(start + 20, Math.min(width - 7, start + tab.width));
  const rise = Math.min(-12, tab.top);
  const corner = 4;
  const path = new THREE.Shape();
  path.moveTo(0, 0);
  path.lineTo(start, 0);
  path.lineTo(start, rise + corner);
  path.quadraticCurveTo(start, rise, start + corner, rise);
  path.lineTo(end - corner, rise);
  path.quadraticCurveTo(end, rise, end, rise + corner);
  path.lineTo(end, 0);
  path.lineTo(width, 0);
  path.lineTo(width, height);
  path.lineTo(0, height);
  path.closePath();
  return path;
}

function rectangle(width, height) {
  const path = new THREE.Shape();
  path.moveTo(0, 0);
  path.lineTo(width, 0);
  path.lineTo(width, height);
  path.lineTo(0, height);
  path.closePath();
  return path;
}

function extrudedPaper(shape) {
  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 1.4,
    bevelEnabled: true,
    bevelSize: 0.65,
    bevelThickness: 0.6,
    bevelSegments: 2,
    curveSegments: 4,
  });
}

function isMotionReduced(doc, win) {
  const choice = doc.documentElement.dataset.motion;
  return choice === "reduced" ||
    (choice !== "full" && win.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

export function initWorkCabinetThree({
  document: doc = globalThis.document,
  window: win = globalThis.window,
} = {}) {
  const cabinet = doc?.querySelector(SELECTOR);
  const well = cabinet?.querySelector(".filing-cabinet__well");
  if (!well || !win || doc.body?.dataset.page !== "work") return { destroy() {} };
  const quality = cabinetQuality({
    width: win.innerWidth,
    devicePixelRatio: win.devicePixelRatio,
    saveData: Boolean(win.navigator?.connection?.saveData),
    hardwareConcurrency: win.navigator?.hardwareConcurrency ?? 4,
  });
  if (!quality.enabled || !win.WebGLRenderingContext) return { destroy() {} };

  let started = false;
  let destroyed = false;
  let scene;
  let renderer;
  let camera;
  let canvas;
  let sceneContents;
  let pmrem;
  let environmentTarget;
  let light;
  let shadowMaterial;
  let materials = [];
  let textures = [];
  let files = [];
  let frame = 0;
  let lastFrame = 0;
  let inView = true;
  let hidden = false;
  let contextFailed = false;
  let resizeObserver;
  let mutationObserver;
  let visibilityObserver;
  let startupObserver;
  let motionObserver;
  const mq = win.matchMedia("(prefers-reduced-motion: reduce)");
  const pointerMq = win.matchMedia("(hover: hover) and (pointer: fine)");

  function invalidate() {
    if (destroyed || !started || hidden || !inView || contextFailed || frame) return;
    frame = win.requestAnimationFrame(render);
  }

  function currentTarget(file) {
    const focused = file.node.contains(doc.activeElement);
    const extracting = file.node.dataset.extracting === "true";
    const hovered = pointerMq.matches && !cabinet.classList.contains("is-scrolling") &&
      file.node.matches(":hover");
    const reading = !pointerMq.matches && file.node.dataset.reading === "true";
    return extracting ? 48 : focused || hovered ? 20 : reading ? 24 : 0;
  }

  function render(now) {
    frame = 0;
    if (destroyed || hidden || !inView || contextFailed) return;
    const delta = Math.min(48, Math.max(0, now - (lastFrame || now - 16)));
    lastFrame = now;
    const instant = isMotionReduced(doc, win) ||
      Boolean(doc.activeElement?.closest?.(".filing-cabinet__link"));
    const easing = instant ? 1 : 1 - Math.exp(-delta / 62);
    let animating = false;
    for (const file of files) {
      const target = currentTarget(file);
      file.travel += (target - file.travel) * easing;
      if (Math.abs(file.travel - target) < EPSILON) file.travel = target;
      else animating = true;
      file.group.position.set(file.x, file.y - file.travel, file.baseZ + file.travel * 1.65);
      file.group.rotation.z = file.node.dataset.extracting === "true" && !instant
        ? -file.travel * 0.00065 : 0;
    }
    renderer.render(scene, camera);
    if (animating) invalidate();
  }

  function disposeGeometry(group) {
    group.traverse(object => {
      if (object.geometry) object.geometry.dispose();
    });
  }

  function rebuild() {
    if (destroyed || !renderer || contextFailed) return;
    const bounds = well.getBoundingClientRect();
    const width = Math.max(1, Math.round(well.clientWidth));
    const height = Math.max(1, Math.round(well.clientHeight));
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(quality.pixelRatio, win.innerWidth < 700 ? MOBILE_DPR : MAX_DPR));
    renderer.setSize(width, height, false);

    if (sceneContents) {
      scene.remove(sceneContents);
      disposeGeometry(sceneContents);
    }
    sceneContents = new THREE.Group();
    scene.add(sceneContents);
    files = [];

    // Shadows fall onto a transparent plane, leaving the site's navy well visible.
    const receiver = new THREE.Mesh(new THREE.PlaneGeometry(width, height), shadowMaterial);
    receiver.position.set(width / 2, height / 2, -7);
    receiver.receiveShadow = true;
    sceneContents.add(receiver);

    const railMaterial = materials[5];
    const railShade = materials[6];
    for (const x of [8, width - 8]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(6, height - 5, 13), railMaterial);
      rail.position.set(x, height / 2, 18);
      rail.receiveShadow = true;
      sceneContents.add(rail);
      const groove = new THREE.Mesh(new THREE.BoxGeometry(1.25, height - 9, 1), railShade);
      groove.position.set(x + (x < width / 2 ? 1 : -1), height / 2, 25);
      sceneContents.add(groove);
    }

    const entries = [...well.querySelectorAll(
      ".filing-cabinet__drawer > .filing-cabinet__folder, .filing-cabinet__drawer > .filing-cabinet__divider"
    )];
    entries.forEach((element, index) => {
      const isFolder = element.classList.contains("filing-cabinet__folder");
      const hit = isFolder ? element.querySelector(".filing-cabinet__link") : element;
      const rect = hit.getBoundingClientRect();
      const x = rect.left - bounds.left;
      const y = rect.top - bounds.top;
      const width = hit.clientWidth;
      if (width < 8) return;
      const group = new THREE.Group();
      const baseZ = 34 + index * 8;
      group.position.set(x, y, baseZ);
      sceneContents.add(group);

      if (isFolder) {
        const face = element.querySelector(".filing-cabinet__face");
        const tab = element.querySelector(".filing-cabinet__tab");
        if (!face || !tab) return;
        const faceHeight = face.offsetHeight;
        const shape = folderOutline(width, faceHeight, {
          left: tab.offsetLeft,
          width: tab.offsetWidth,
          top: tab.offsetTop,
        });
        // The second leaf, faintly visible at the lower seam, makes it
        // physically read as a folder rather than a flat UI card.
        const back = new THREE.Mesh(
          extrudedPaper(rectangle(width - 4, faceHeight - 3)),
          [materials[(index % 3) + 0], materials[4]]
        );
        back.position.set(2, 7, -3.1);
        back.receiveShadow = true;
        group.add(back);
        const front = new THREE.Mesh(
          extrudedPaper(shape),
          [materials[index % 3], materials[4]]
        );
        front.castShadow = true;
        front.receiveShadow = true;
        group.add(front);

        const crease = new THREE.Mesh(
          new THREE.PlaneGeometry(width - 9, 0.85),
          materials[7]
        );
        crease.position.set(width / 2, faceHeight - 9, 2.2);
        group.add(crease);
        files.push({ node: element, group, x, y, baseZ, travel: 0 });
      } else {
        const height = Math.max(20, hit.offsetHeight);
        const divider = new THREE.Mesh(
          extrudedPaper(rectangle(width, height)),
          [materials[3], materials[4]]
        );
        divider.castShadow = true;
        divider.receiveShadow = true;
        group.add(divider);
      }
    });

    light.position.set(-width * 0.22, -height * 0.35, 400);
    light.target.position.set(width / 2, height / 2, 0);
    light.target.updateMatrixWorld();
    const extent = Math.max(width, height) * 1.6;
    Object.assign(light.shadow.camera, {
      left: -extent,
      right: extent,
      top: extent,
      bottom: -extent,
    });
    light.shadow.camera.updateProjectionMatrix();
    lastFrame = 0;
    invalidate();
  }

  function fallback() {
    contextFailed = true;
    delete cabinet.dataset.cabinet3d;
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
    canvas?.remove();
  }

  function onContextLost(event) {
    event.preventDefault();
    fallback();
  }

  function start() {
    if (started || destroyed) return;
    started = true;
    try {
      canvas = doc.createElement("canvas");
      canvas.className = "filing-cabinet__three-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: true, powerPreference: "high-performance",
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.AgXToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 2000);
      camera.position.set(0, 0, 1000);
      camera.lookAt(0, 0, 0);
      const fill = new THREE.AmbientLight(0xfff5e6, 1.15);
      scene.add(fill);
      light = new THREE.DirectionalLight(0xfff4df, 2.05);
      light.castShadow = true;
      light.shadow.mapSize.set(quality.environment ? 2048 : 1024, quality.environment ? 2048 : 1024);
      light.shadow.bias = -0.00004;
      light.shadow.normalBias = 0.8;
      light.shadow.radius = 2;
      scene.add(light, light.target);
      shadowMaterial = new THREE.ShadowMaterial({ color: 0x090e1c, opacity: 0.33 });
      for (const [hex, seed] of [["#ece4d6", 11], ["#e7dccb", 29], ["#ded0bb", 43]]) {
        const texture = paperTexture(doc, hex, seed);
        if (texture) textures.push(texture);
        materials.push(new THREE.MeshStandardMaterial({
          color: texture ? 0xffffff : hex,
          map: texture,
          roughness: 0.94,
          metalness: 0,
          side: THREE.DoubleSide,
        }));
      }
      materials.push(new THREE.MeshStandardMaterial({
        color: 0xc2c5ca, roughness: 0.79, metalness: 0, side: THREE.DoubleSide,
      }));
      materials.push(new THREE.MeshStandardMaterial({
        color: 0xb5a78f, roughness: 0.96, metalness: 0, side: THREE.DoubleSide,
      }));
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x26334e, roughness: 0.42, metalness: 0.24,
      }));
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x121a2d, roughness: 0.5, metalness: 0.2,
      }));
      materials.push(new THREE.MeshBasicMaterial({
        color: 0xa89a83, transparent: true, opacity: 0.27,
      }));

      if (quality.environment) {
        pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environmentTarget = pmrem.fromScene(room);
        scene.environment = environmentTarget.texture;
        room.dispose();
      }

      well.prepend(canvas);
      rebuild();
      renderer.render(scene, camera);
      cabinet.dataset.cabinet3d = "ready";
      resizeObserver = new win.ResizeObserver(rebuild);
      resizeObserver.observe(well);
      mutationObserver = new win.MutationObserver(invalidate);
      mutationObserver.observe(cabinet, {
        attributes: true, subtree: true,
        attributeFilter: ["data-reading", "data-extracting", "class"],
      });
      cabinet.addEventListener("pointerover", invalidate, { passive: true });
      cabinet.addEventListener("pointerout", invalidate, { passive: true });
      cabinet.addEventListener("focusin", invalidate);
      cabinet.addEventListener("focusout", invalidate);
      win.addEventListener("scroll", invalidate, { passive: true });
      win.addEventListener("resize", rebuild, { passive: true });
      mq.addEventListener("change", invalidate);
      pointerMq.addEventListener("change", invalidate);
      motionObserver = new win.MutationObserver(invalidate);
      motionObserver.observe(doc.documentElement, {
        attributes: true, attributeFilter: ["data-motion"],
      });
      visibilityObserver = new win.IntersectionObserver(entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) invalidate();
      }, { rootMargin: "200px" });
      visibilityObserver.observe(well);
    } catch (error) {
      fallback();
      // Rendering is an enhancement: no error may block the three native links.
      console.warn("Filing cabinet 3D unavailable; retaining CSS cabinet", error);
    }
  }

  function pageHide() {
    hidden = true;
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
  }

  function pageShow() {
    hidden = false;
    lastFrame = 0;
    invalidate();
  }

  function onVisibilityChange() {
    hidden = doc.visibilityState === "hidden";
    if (!hidden) invalidate();
  }
  doc.addEventListener("visibilitychange", onVisibilityChange);
  win.addEventListener("pagehide", pageHide);
  win.addEventListener("pageshow", pageShow);

  if (typeof win.IntersectionObserver === "function") {
    startupObserver = new win.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        startupObserver.disconnect();
        start();
      }
    }, { rootMargin: "300px" });
    startupObserver.observe(well);
  } else start();

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      startupObserver?.disconnect();
      visibilityObserver?.disconnect();
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      motionObserver?.disconnect();
      if (frame) win.cancelAnimationFrame(frame);
      cabinet.removeEventListener("pointerover", invalidate);
      cabinet.removeEventListener("pointerout", invalidate);
      cabinet.removeEventListener("focusin", invalidate);
      cabinet.removeEventListener("focusout", invalidate);
      win.removeEventListener("scroll", invalidate);
      win.removeEventListener("resize", rebuild);
      doc.removeEventListener("visibilitychange", onVisibilityChange);
      win.removeEventListener("pagehide", pageHide);
      win.removeEventListener("pageshow", pageShow);
      mq.removeEventListener("change", invalidate);
      pointerMq.removeEventListener("change", invalidate);
      if (sceneContents) disposeGeometry(sceneContents);
      textures.forEach(texture => texture.dispose());
      materials.forEach(material => material.dispose());
      shadowMaterial?.dispose();
      environmentTarget?.dispose();
      pmrem?.dispose();
      renderer?.dispose();
      canvas?.remove();
      delete cabinet.dataset.cabinet3d;
    },
  };
}

if (typeof document !== "undefined" && document.body?.dataset.page === "work") {
  initWorkCabinetThree();
}
