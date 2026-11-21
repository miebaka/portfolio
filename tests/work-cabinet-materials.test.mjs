import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createPaperMaps, createContactShadow, createMetalRoughness }
  from "../js/three/work-cabinet-materials.js";

function canvasDocument() {
  return {
    createElement(tag) {
      assert.equal(tag, "canvas");
      const canvas = { width: 0, height: 0 };
      canvas.getContext = type => {
        assert.equal(type, "2d");
        return {
          createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
          putImageData(image) { canvas.pixels = image.data; },
          createRadialGradient: () => ({ addColorStop() {} }),
          fillRect() {},
          beginPath() {},
          moveTo() {},
          lineTo() {},
          stroke() {},
        };
      };
      return canvas;
    },
  };
}

test("archival paper has reproducible non-uniform albedo, relief and roughness maps", () => {
  const doc = canvasDocument();
  const a = createPaperMaps(doc, { tone: "#f2e7d7", size: 48, seed: 11 });
  const b = createPaperMaps(doc, { tone: "#f2e7d7", size: 48, seed: 11 });
  const c = createPaperMaps(doc, { tone: "#f2e7d7", size: 48, seed: 29 });
  assert.ok(a?.albedo?.isTexture && a?.height?.isTexture && a?.roughness?.isTexture);
  assert.equal(a.albedo.colorSpace, THREE.SRGBColorSpace);
  assert.equal(a.height.colorSpace, THREE.NoColorSpace);
  assert.equal(a.roughness.colorSpace, THREE.NoColorSpace);
  assert.equal(a.albedo.wrapS, THREE.RepeatWrapping);
  assert.equal(a.height.repeat.x, a.albedo.repeat.x);
  assert.equal(a.height.repeat.y, a.roughness.repeat.y);
  assert.deepEqual([...a.albedo.image.pixels], [...b.albedo.image.pixels]);
  assert.notDeepEqual([...a.albedo.image.pixels], [...c.albedo.image.pixels]);
  const heights = new Set();
  const gloss = new Set();
  for (let i = 0; i < a.height.image.pixels.length; i += 4) {
    heights.add(a.height.image.pixels[i]);
    gloss.add(a.roughness.image.pixels[i]);
  }
  assert.ok(heights.size > 20, "paper must have real microsurface variation");
  assert.ok(gloss.size > 20, "surface roughness must not be a uniform CGI value");
  for (const material of [a, b, c]) {
    material.albedo.dispose();
    material.height.dispose();
    material.roughness.dispose();
  }
});

test("metal roughness and contact shadow are local optional GPU assets", () => {
  const doc = canvasDocument();
  const metal = createMetalRoughness(doc, 32);
  const occlusion = createContactShadow(doc, 32);
  assert.ok(metal?.isTexture);
  assert.ok(occlusion?.isTexture);
  assert.equal(metal.colorSpace, THREE.NoColorSpace);
  assert.equal(metal.wrapS, THREE.RepeatWrapping);
  assert.equal(metal.repeat.x, 1 / 80);
  metal.dispose();
  occlusion.dispose();
});
