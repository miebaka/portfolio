/**
 * Work cabinet: progressive, on-demand Three.js material layer.
 *
 * The DOM remains the source of truth for links, labels, keyboard focus,
 * scroll position, motion preferences and page-to-page navigation.
 * The canvas is decorative, never a pointer or accessibility target.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { createPaperMaps, createContactShadow, createMetalRoughness, createDrawerFloorMap } from "./three/work-cabinet-materials.js";
import { createBowedPaperGeometry, createSuspensionHardware, createTabReinforcement } from "./three/work-cabinet-geometry.js";

const SELECTOR = "[data-project-archive]";
const MAX_DPR = 1.5;
const MOBILE_DPR = 1.25;
const TRANSITION_WINDOW_MS = 240;

export function cabinetQuality({
  width = 0,
  devicePixelRatio = 1,
  saveData = false,
  hardwareConcurrency = 4,
  deviceMemory = 4,
  reducedMotion = false,
  forcedColors = false,
} = {}) {
  if (saveData || hardwareConcurrency <= 2 || deviceMemory <= 2 ||
      reducedMotion || forcedColors) {
    return { enabled: false, pixelRatio: 1, environment: false };
  }
  const mobile = width < 700;
  return {
    enabled: true,
    pixelRatio: Math.min(Math.max(devicePixelRatio || 1, 1), mobile ? MOBILE_DPR : MAX_DPR),
    environment: !mobile && hardwareConcurrency >= 4,
  };
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
  // A real 250–300gsm archival folder is much thinner than cardboard:
  // softened die-cut edges, less than one display unit of stock thickness.
  return new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: 0.52,
    bevelEnabled: true,
    bevelSize: 0.22,
    bevelThickness: 0.14,
    bevelSegments: 2,
    curveSegments: 5,
  });
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
    deviceMemory: win.navigator?.deviceMemory ?? 4,
    reducedMotion: doc.documentElement.dataset.motion === "reduced" ||
      win.matchMedia("(prefers-reduced-motion: reduce)").matches,
    forcedColors: win.matchMedia("(forced-colors: active)").matches,
  });
  if (!quality.enabled || !win.WebGLRenderingContext || !win.WebGL2RenderingContext) {
    return { destroy() {} };
  }

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
  let contactShadowMaterial;
  let files = [];
  let frame = 0;
  let activeUntil = 0;
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

  // HTML transforms are authoritative. Reading them avoids the former drift
  // between CSS easing, focus-visible, extraction scaling and the 3D mesh.
  // Only redraw for the duration of the underlying CSS/WAAPI transition.
  function scheduleFrame() {
    if (destroyed || !started || hidden || !inView || contextFailed || frame) return;
    frame = win.requestAnimationFrame(render);
  }

  function invalidate() {
    activeUntil = Math.max(activeUntil,
      (win.performance?.now?.() ?? Date.now()) + TRANSITION_WINDOW_MS);
    scheduleFrame();
  }

  function render(now) {
    frame = 0;
    if (destroyed || hidden || !inView || contextFailed || !renderer) return;
    const bounds = well.getBoundingClientRect();
    for (const file of files) {
      const face = file.face.getBoundingClientRect();
      if (!face.width || !file.faceWidth) continue;
      const scale = face.width / file.faceWidth;
      const x = face.left - bounds.left;
      const y = face.top - bounds.top;
      const lift = Math.max(0, file.y - y);
      // The tab, paper edges and HTML label now share the *same* transform.
      // Scale origin is aligned to the transformed HTML face's top-left.
      file.group.position.set(x, y, file.baseZ + lift * 1.65);
      file.group.scale.set(scale, scale, 1);
      if (file.occlusion) {
        // A physical cast shadow remains on the drawer as the leaf lifts;
        // it cannot travel glued to the moving paper surface.
        file.occlusion.material.opacity = Math.max(.16, .72 - lift * .022);
      }
    }
    renderer.render(scene, camera);
    if (now < activeUntil) scheduleFrame();
  }

  function disposeGeometry(group) {
    group.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.userData?.ownsMaterial) object.material?.dispose();
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

    // A physical powder-coated drawer floor is visible between honest gaps
    // in the real project roster. Unlike a flat CSS fill, its raking-light
    // response continues the cabinet construction through empty space.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(Math.max(1, width - 3), height),
      materials[11]
    );
    floor.position.set(width / 2, height / 2, -13);
    // The separate ShadowMaterial plane handles shadows without double-darkening.
    floor.receiveShadow = false;
    sceneContents.add(floor);

    // Soft dynamic cast shadows still fall onto a transparent receiver
    // just above the metal floor; links and labels remain native HTML.
    const receiver = new THREE.Mesh(new THREE.PlaneGeometry(width, height), shadowMaterial);
    receiver.position.set(width / 2, height / 2, -7);
    receiver.receiveShadow = true;
    sceneContents.add(receiver);

    // Powder-coated steel slide rails with a rolled outer edge, recessed
    // running channel and countersunk steel fixings. They are intentionally
    // small enough to stay peripheral to the actual case studies.
    const railMaterial = materials[5];
    const railShade = materials[6];
    const railHeight = Math.max(20, height - 9);
    for (const x of [8, width - 8]) {
      const side = x < width / 2 ? 1 : -1;
      const rail = new THREE.Mesh(
        new RoundedBoxGeometry(7.2, railHeight, 12.5, 2, 1.15),
        railMaterial
      );
      rail.position.set(x, height / 2, 18);
      rail.castShadow = true;
      rail.receiveShadow = true;
      sceneContents.add(rail);
      const groove = new THREE.Mesh(
        new RoundedBoxGeometry(1.35, Math.max(8, railHeight - 6), 0.9, 2, .35),
        railShade
      );
      groove.position.set(x + side * 1.05, height / 2, 24.65);
      sceneContents.add(groove);
      const count = height >= 660 ? 4 : 3;
      for (let i = 0; i < count; i++) {
        const y = 25 + (height - 50) * (i + .5) / count;
        const head = new THREE.Mesh(
          new THREE.CylinderGeometry(1.65, 1.65, .48, 14),
          materials[9]
        );
        head.rotation.x = Math.PI / 2;
        head.position.set(x - side * 1.35, y, 24.75);
        sceneContents.add(head);
        const drive = new THREE.Mesh(
          new THREE.BoxGeometry(2.35, .28, .16),
          materials[10]
        );
        drive.position.set(x - side * 1.35, y, 25.13);
        drive.rotation.z = i % 2 ? -.12 : .12;
        sceneContents.add(drive);
      }
    }
    // The narrower interior support rods carry hanging folders behind the
    // visible faces. They also visually connect the drawer across sparse gaps
    // without inventing fake projects or sealed files.
    for (const x of [22, width - 22]) {
      const support = new THREE.Mesh(
        new RoundedBoxGeometry(3.6, Math.max(8, railHeight - 3), 3.3, 2, .65),
        materials[9]
      );
      support.position.set(x, height / 2, 10.5);
      support.receiveShadow = true;
      sceneContents.add(support);
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
        // Folder tone is keyed to its real staggered tab, not its DOM index:
        // year dividers sit between folders and would otherwise shift colours.
        const stock = { a: 0, b: 1, c: 2 }[element.dataset.tab] ?? 0;
        const shape = folderOutline(width, faceHeight, {
          left: tab.offsetLeft,
          width: tab.offsetWidth,
          top: tab.offsetTop,
        });
        // Micro-occlusion is baked into a diffuse, soft contact patch, while
        // directional shadows move naturally with the entire lifted sheet.
        let occlusion = null;
        if (contactShadowMaterial) {
          occlusion = new THREE.Mesh(
            new THREE.PlaneGeometry(width + 22, faceHeight + 24),
            contactShadowMaterial.clone()
          );
          occlusion.userData.ownsMaterial = true;
          occlusion.position.set(
            x + width / 2 + 3, y + faceHeight / 2 + 7, baseZ - 6.5
          );
          sceneContents.add(occlusion);
        }
        // Two real paper leaves, not one thick block. A small lateral shift
        // reveals the lower leaf and makes the bottom binding physically legible.
        const back = new THREE.Mesh(
          extrudedPaper(rectangle(width - 3.5, faceHeight - 3.5)),
          [materials[stock], materials[4]]
        );
        back.position.set(2, 5.1, -2.05);
        back.castShadow = true;
        back.receiveShadow = true;
        group.add(back);
        const front = new THREE.Mesh(
          extrudedPaper(shape),
          [materials[stock], materials[4]]
        );
        front.castShadow = true;
        front.receiveShadow = true;
        group.add(front);

        // The thin cut silhouette remains an actual extrusion. An inset
        // subdivided paper face adds restrained curl and distributed tension:
        // highlights now change through the stock instead of staying flat.
        const bowedFace = new THREE.Mesh(
          createBowedPaperGeometry(
            Math.max(16, width - 12), Math.max(20, faceHeight - 14), {
              seed: index * 17 + stock,
              segmentsX: quality.environment ? 24 : 12,
              segmentsY: quality.environment ? 9 : 5,
            }
          ),
          materials[stock]
        );
        bowedFace.name = "calendered-paper-face";
        bowedFace.position.set(width / 2, faceHeight / 2 + 2.5, 0);
        bowedFace.castShadow = true;
        bowedFace.receiveShadow = true;
        group.add(bowedFace);

        // Metal suspensions show the actual means by which a file rests
        // on the drawer rods; these are decorative, not click targets.
        const hanger = createSuspensionHardware(width, {
          metal: materials[9], shade: materials[6],
          detail: quality.environment,
        });
        group.add(hanger);
        const reinforcedTab = createTabReinforcement(
          tab.offsetLeft, tab.offsetWidth, tab.offsetTop, {
            stock: materials[8], crease: materials[7],
          }
        );
        group.add(reinforcedTab);

        // Calendering/folding creates a darker pressure crease followed by
        // a tiny raised, warm edge. These are true 3D layers with soft light
        // response, not a painted CSS separator or a plastic-looking bevel.
        const foldY = faceHeight - 9;
        const crease = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.max(1, width - 14), .92),
          materials[7]
        );
        crease.position.set(width / 2, foldY, 2.27);
        group.add(crease);
        const foldHighlight = new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(1, width - 14), .34, .25),
          materials[8]
        );
        foldHighlight.position.set(width / 2, foldY - 1.15, 2.31);
        group.add(foldHighlight);
        const exposedLeaf = new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(1, width - 7), .52, .76),
          materials[4]
        );
        exposedLeaf.position.set(width / 2, faceHeight + 3.2, -1.35);
        group.add(exposedLeaf);
        files.push({ node: element, face, faceWidth: face.offsetWidth, group, x, y, baseZ, occlusion });
      } else {
        const height = Math.max(20, hit.offsetHeight);
        // Satin archival partition sheet, more rigid than manila stock.
        const divider = new THREE.Mesh(
          extrudedPaper(rectangle(width, height)),
          [materials[3], materials[4]]
        );
        divider.castShadow = true;
        divider.receiveShadow = true;
        group.add(divider);
        const rolledEdge = new THREE.Mesh(
          new THREE.BoxGeometry(Math.max(4, width - 7), .52, .38),
          materials[9]
        );
        rolledEdge.position.set(width / 2, height - 2.3, 1.05);
        group.add(rolledEdge);
      }
    });

    // A large, high key light keeps contact shadows near the paper edges.
    light.position.set(width * 0.23, height * 0.16, 620);
    light.target.position.set(width / 2, height / 2, 0);
    light.target.updateMatrixWorld();
    const extent = Math.max(width, height) * 1.6;
    Object.assign(light.shadow.camera, {
      left: -extent,
      right: extent,
      top: extent,
      bottom: -extent,
    });
    // The key sits more than 500 units from the drawer. Three.js's default
    // directional shadow-camera far plane is 500, which clips every folder.
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1400;
    light.shadow.camera.updateProjectionMatrix();
    invalidate();
  }

  // One idempotent cleanup path for initialization failure, context loss and
  // explicit teardown. No orphaned GPU objects or observers after fallback.
  function cleanup() {
    startupObserver?.disconnect();
    visibilityObserver?.disconnect();
    resizeObserver?.disconnect();
    mutationObserver?.disconnect();
    motionObserver?.disconnect();
    if (frame) win.cancelAnimationFrame(frame);
    frame = 0;
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
    sceneContents = null;
    textures.forEach(texture => texture.dispose());
    materials.forEach(material => material.dispose());
    textures = [];
    materials = [];
    shadowMaterial?.dispose();
    shadowMaterial = null;
    contactShadowMaterial?.dispose();
    contactShadowMaterial = null;
    environmentTarget?.dispose();
    environmentTarget = null;
    pmrem?.dispose();
    pmrem = null;
    try { renderer?.dispose(); } catch { /* WebGL context may already be lost. */ }
    renderer = null;
    canvas?.remove();
    canvas = null;
    files = [];
    delete cabinet.dataset.cabinet3d;
  }

  function fallback() {
    contextFailed = true;
    cleanup();
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
      renderer.toneMappingExposure = 1.18;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 2000);
      camera.position.set(0, 0, 1000);
      camera.lookAt(0, 0, 0);
      // Warm softbox + cool reflected fill, like real window light falling
      // across an archival drawer. Avoid a flat, omnidirectional CGI wash.
      const fill = new THREE.HemisphereLight(0xfff4e8, 0x52627d, 1.25);
      const bounce = new THREE.DirectionalLight(0xcddcf2, 0.46);
      bounce.position.set(900, 420, 530);
      scene.add(fill, bounce);
      light = new THREE.DirectionalLight(0xffe9ce, 2.1);
      light.castShadow = true;
      light.shadow.mapSize.set(quality.environment ? 2048 : 1024, quality.environment ? 2048 : 1024);
      light.shadow.bias = -0.00004;
      light.shadow.normalBias = 0.8;
      light.shadow.radius = 2;
      scene.add(light, light.target);
      shadowMaterial = new THREE.ShadowMaterial({ color: 0x090e1c, opacity: 0.27 });
      const textureSize = quality.environment ? 384 : 256;
      const paperMaps = [];
      for (const [hex, seed] of [["#f7efdf", 11], ["#f2e6d4", 29], ["#e9dbc4", 43]]) {
        const maps = createPaperMaps(doc, { tone: hex, seed, size: textureSize });
        if (maps) {
          paperMaps.push(maps);
          textures.push(maps.albedo, maps.height, maps.roughness);
        }
        materials.push(new THREE.MeshStandardMaterial({
          color: maps ? 0xffffff : hex,
          map: maps?.albedo ?? null,
          roughnessMap: maps?.roughness ?? null,
          bumpMap: maps?.height ?? null,
          bumpScale: 0.46,
          roughness: 0.93,
          metalness: 0,
          envMapIntensity: 0.32,
          side: THREE.DoubleSide,
        }));
      }
      const primary = paperMaps[0];
      materials.push(new THREE.MeshStandardMaterial({
        color: 0xd1d0ca, roughness: 0.84, metalness: 0,
        bumpMap: primary?.height ?? null, bumpScale: 0.25,
        roughnessMap: primary?.roughness ?? null, side: THREE.DoubleSide,
      }));
      materials.push(new THREE.MeshStandardMaterial({
        color: 0xc9b79f, roughness: 0.98, metalness: 0,
        bumpMap: primary?.height ?? null, bumpScale: 0.34, side: THREE.DoubleSide,
      }));
      const metalRoughness = createMetalRoughness(doc);
      if (metalRoughness) textures.push(metalRoughness);
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x293850, roughness: 0.76, roughnessMap: metalRoughness,
        metalness: 0.29, envMapIntensity: 0.22,
      }));
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x131d2c, roughness: 0.81, roughnessMap: metalRoughness,
        metalness: 0.25, envMapIntensity: 0.12,
      }));
      materials.push(new THREE.MeshBasicMaterial({
        color: 0x8d7661, transparent: true, opacity: 0.28,
        depthWrite: false,
      }));
      // Fine paper-edge highlights are visible only at the grazing-light seam.
      materials.push(new THREE.MeshStandardMaterial({
        color: 0xf3e7d2, roughness: 0.94, metalness: 0,
        side: THREE.DoubleSide,
      }));
      // Fasteners are properly metallic but deliberately subdued.
      materials.push(new THREE.MeshStandardMaterial({
        color: 0x7d8190, roughness: 0.37, metalness: 0.86,
        roughnessMap: metalRoughness, envMapIntensity: 1.1,
      }));
      materials.push(new THREE.MeshBasicMaterial({
        color: 0x0a1727, transparent: true, opacity: 0.78,
        depthWrite: false,
      }));
      // The recessed drawer floor uses calibrated, locally authored
      // powder-coat pigment. A baked directional rim response is stable in
      // desktop HDR and mobile non-HDR tiers; the physically lit rails and
      // folders continue to cast real moving shadows above it.
      const floorMap = createDrawerFloorMap(doc);
      if (floorMap) textures.push(floorMap);
      materials.push(new THREE.MeshBasicMaterial({
        color: floorMap ? 0xffffff : 0x101b2c,
        map: floorMap,
        toneMapped: false,
        side: THREE.DoubleSide,
      }));
      const contactShadow = createContactShadow(doc, quality.environment ? 192 : 128);
      if (contactShadow) {
        textures.push(contactShadow);
        contactShadowMaterial = new THREE.MeshBasicMaterial({
          map: contactShadow, transparent: true, opacity: 0.72,
          depthWrite: false, toneMapped: false,
          polygonOffset: true, polygonOffsetFactor: -1,
        });
      }

      if (quality.environment) {
        const room = new RoomEnvironment();
        try {
          pmrem = new THREE.PMREMGenerator(renderer);
          environmentTarget = pmrem.fromScene(room);
          scene.environment = environmentTarget.texture;
        } catch (error) {
          // Environment reflections are optional; keep geometry and navigation.
          console.warn("Studio reflections unavailable; continuing without HDR lighting", error);
        } finally {
          room.dispose();
        }
      }

      well.prepend(canvas);
      rebuild();
      renderer.render(scene, camera);
      cabinet.dataset.cabinet3d = "ready";
      // Late font swaps and line wrapping can change tab geometry without
      // changing the cabinet width; rebuild against the settled document.
      if (doc.fonts?.ready) {
        void doc.fonts.ready.then(() => {
          if (!destroyed && !contextFailed && renderer) rebuild();
        });
      }
      if (typeof win.ResizeObserver === "function") {
        resizeObserver = new win.ResizeObserver(rebuild);
        resizeObserver.observe(well);
        const drawer = well.querySelector(".filing-cabinet__drawer");
        if (drawer) resizeObserver.observe(drawer);
      }
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
      if (typeof win.IntersectionObserver === "function") {
        visibilityObserver = new win.IntersectionObserver(entries => {
          inView = entries[0]?.isIntersecting ?? true;
          if (inView) invalidate();
        }, { rootMargin: "200px" });
        visibilityObserver.observe(well);
      }
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
      cleanup();
    },
  };
}

if (typeof document !== "undefined" && document.body?.dataset.page === "work") {
  initWorkCabinetThree();
}
