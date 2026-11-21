/**
 * Deterministic studio material library for the Work archive.
 *
 * Everything is generated once at first engagement. No third-party texture
 * URLs, no unlicensed scans, no runtime network requests. Height/roughness
 * maps are linear data; only the photographic albedo uses sRGB.
 */
import * as THREE from "three";

function seeded(seed) {
  let x = seed >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

const clamp = (v, low = 0, high = 255) => Math.min(high, Math.max(low, v));
function tex(canvas, { color = false, repeat = false, anisotropy = 2 } = {}) {
  const result = new THREE.CanvasTexture(canvas);
  if (color) result.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    result.wrapS = THREE.RepeatWrapping;
    result.wrapT = THREE.RepeatWrapping;
    // ExtrudeGeometry's UVs are specified in geometry space, not 0–1.
    // One tile covers about one sheet, avoiding high-frequency repeats.
    result.repeat.set(1 / 490, 1 / 325);
  }
  result.anisotropy = anisotropy;
  return result;
}

function rgb(hex) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function createCanvas(doc, size) {
  const canvas = doc.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Procedural calendered archival stock: broad unevenness, tiny flecks,
 * anisotropic pulp fibres and independent microsurface response.
 *
 * Pixel-scale variations are deliberately weak: paper should resolve as
 * tactile at glancing light, not as dirty, noisy camouflage.
 */
export function createPaperMaps(doc, { tone = "#f2e7d7", seed = 21, size = 384 } = {}) {
  const random = seeded(seed);
  const c = createCanvas(doc, size);
  const h = createCanvas(doc, size);
  const r = createCanvas(doc, size);
  const cc = c.getContext("2d", { willReadFrequently: true });
  const hc = h.getContext("2d", { willReadFrequently: true });
  const rc = r.getContext("2d", { willReadFrequently: true });
  if (!cc || !hc || !rc) return null;

  const albedo = cc.createImageData(size, size);
  const height = hc.createImageData(size, size);
  const roughness = rc.createImageData(size, size);
  const [red, green, blue] = rgb(tone);
  const block = Math.max(12, Math.floor(size / 16));
  const grid = Math.ceil(size / block) + 1;
  const coarse = new Float32Array(grid * grid);
  for (let i = 0; i < coarse.length; i++) coarse[i] = random() * 2 - 1;
  function filtered(x, y) {
    const u = x / block, v = y / block;
    const ix = Math.floor(u), iy = Math.floor(v);
    const fx = u - ix, fy = v - iy;
    const smoothX = fx * fx * (3 - 2 * fx);
    const smoothY = fy * fy * (3 - 2 * fy);
    const a = coarse[iy * grid + ix];
    const b = coarse[iy * grid + ix + 1];
    const d = coarse[(iy + 1) * grid + ix];
    const e = coarse[(iy + 1) * grid + ix + 1];
    return (a + (b - a) * smoothX) * (1 - smoothY) +
      (d + (e - d) * smoothX) * smoothY;
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const k = y * size + x;
      const i = k * 4;
      const grain = random() - 0.5;
      const swell = filtered(x, y);
      const direction = Math.sin(y * 0.26 + Math.sin(x * 0.033) * 3) * 0.65;
      const variation = swell * 4 + grain * 6 + direction;
      albedo.data[i] = clamp(red + variation);
      albedo.data[i + 1] = clamp(green + variation * .9);
      albedo.data[i + 2] = clamp(blue + variation * .77);
      albedo.data[i + 3] = 255;
      const bump = clamp(125 + swell * 12 + grain * 30 + direction * 3);
      height.data[i] = height.data[i + 1] = height.data[i + 2] = bump;
      height.data[i + 3] = 255;
      const microRoughness = clamp(209 + swell * 19 + grain * 36);
      roughness.data[i] = roughness.data[i + 1] =
        roughness.data[i + 2] = microRoughness;
      roughness.data[i + 3] = 255;
    }
  }
  cc.putImageData(albedo, 0, 0);
  hc.putImageData(height, 0, 0);
  rc.putImageData(roughness, 0, 0);

  // Sparse actual pulp filaments: mostly aligned with manufacturing grain.
  // They register in bump response, but never look like printed scratches.
  for (let i = 0; i < Math.round(size * 4); i++) {
    const x = random() * size;
    const y = random() * size;
    const dy = 1 + random() * 17;
    const dx = (random() - .5) * 2.5;
    const opacity = .012 + random() * .034;
    cc.strokeStyle = random() > .5
      ? "rgba(101,75,53," + opacity + ")"
      : "rgba(255,255,255," + opacity + ")";
    cc.lineWidth = .25 + random() * .75;
    cc.beginPath();
    cc.moveTo(x, y);
    cc.lineTo(x + dx, y + dy);
    cc.stroke();
    hc.strokeStyle = random() > .5 ? "rgba(242,242,242,.045)" : "rgba(22,22,22,.037)";
    hc.lineWidth = .5;
    hc.beginPath();
    hc.moveTo(x, y);
    hc.lineTo(x + dx, y + dy);
    hc.stroke();
  }

  const opts = { repeat: true, anisotropy: size > 300 ? 4 : 2 };
  return {
    albedo: tex(c, { ...opts, color: true }),
    height: tex(h, opts),
    roughness: tex(r, opts),
  };
}

/**
 * A baked, transparent contact occlusion patch. It sits under each leaf;
 * physically cast PCF shadows remain independent for lifted sheets.
 */
export function createContactShadow(doc, size = 192) {
  const canvas = createCanvas(doc, size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const inner = ctx.createRadialGradient(size / 2, size / 2, size * .11,
    size / 2, size / 2, size * .71);
  inner.addColorStop(0, "rgba(10,12,20,.42)");
  inner.addColorStop(.50, "rgba(10,12,20,.28)");
  inner.addColorStop(.82, "rgba(10,12,20,.085)");
  inner.addColorStop(1, "rgba(10,12,20,0)");
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, size, size);
  return tex(canvas);
}

/**
 * Reproducible baked finish for the deep drawer interior. No environment
 * reflection is mixed into this map: from the overhead editorial camera,
 * powder-coated steel must remain reliably midnight navy on both mobile
 * and desktop. Subtle side-rim bounce and tiny pigment variation read as
 * physical paint without the old pale showroom effect.
 */
export function createDrawerFloorMap(doc, size = 256) {
  const canvas = createCanvas(doc, size);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const pixels = context.createImageData(size, size);
  const random = seeded(72049);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const edge = Math.min(x, size - 1 - x) / size;
      const sideBounce = 7 * Math.exp(-edge * 34);
      const depth = 2 * (y / size);
      const grain = (random() - .5) * 4.6;
      const k = (y * size + x) * 4;
      pixels.data[k] = clamp(14 + sideBounce + depth + grain);
      pixels.data[k + 1] = clamp(25 + sideBounce + depth + grain);
      pixels.data[k + 2] = clamp(43 + sideBounce + depth + grain);
      pixels.data[k + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  return tex(canvas, { color: true, anisotropy: 2 });
}

/** Subtle stamped powder coat, not a polished chrome showroom surface. */
export function createMetalRoughness(doc, size = 128) {
  const canvas = createCanvas(doc, size);
  const context = canvas.getContext("2d");
  if (!context) return null;
  const pixels = context.createImageData(size, size);
  const rand = seeded(5015);
  for (let i = 0; i < size * size; i++) {
    const p = i * 4;
    const value = clamp(158 + (rand() - .5) * 52);
    pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = value;
    pixels.data[p + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);
  const texture = tex(canvas, { repeat: true, anisotropy: 2 });
  texture.repeat.set(1 / 80, 1 / 80);
  return texture;
}
