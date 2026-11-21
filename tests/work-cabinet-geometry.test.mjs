import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createBowedPaperGeometry,
  createSuspensionHardware,
  createTabReinforcement,
} from "../js/three/work-cabinet-geometry.js";

test("calendered paper has nonplanar physical curvature and full-size PBR UVs", () => {
  const geometry = createBowedPaperGeometry(950, 148, {
    seed: 11, segmentsX: 24, segmentsY: 9,
  });
  const positions = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv");
  const normals = geometry.getAttribute("normal");
  assert.equal(positions.count, 250);
  let lowest = Infinity, highest = -Infinity, maxU = 0, maxV = 0;
  for (let i = 0; i < positions.count; i++) {
    lowest = Math.min(lowest, positions.getZ(i));
    highest = Math.max(highest, positions.getZ(i));
    maxU = Math.max(maxU, uv.getX(i));
    maxV = Math.max(maxV, uv.getY(i));
    assert.ok(Number.isFinite(normals.getZ(i)));
  }
  assert.ok(highest - lowest > .35, "paper needs measurable curvature");
  assert.ok(highest < 2.9 && lowest > .85, "no exaggerated CGI paper waves");
  assert.equal(maxU, 950, "albedo and bump must use world-sized UV");
  assert.equal(maxV, 148, "roughness must use world-sized UV");
  geometry.dispose();
});

test("mobile paper preserves geometry detail with bounded tessellation", () => {
  const low = createBowedPaperGeometry(320, 100, {
    segmentsX: 12, segmentsY: 5, seed: 29,
  });
  assert.equal(low.getAttribute("position").count, 78);
  assert.throws(() => createBowedPaperGeometry(0, 100), RangeError);
  assert.throws(() => createBowedPaperGeometry(350, -10), RangeError);
  low.dispose();
});

test("hanging folder suspension hardware reaches rails on both sides", () => {
  const metal = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const shade = new THREE.MeshStandardMaterial({ color: 0x404040 });
  for (const detail of [true, false]) {
    const group = createSuspensionHardware(950, { metal, shade, detail });
    assert.equal(group.children.length, 4);
    assert.ok(group.getObjectByName("left-hanger"));
    assert.ok(group.getObjectByName("right-hanger"));
    group.updateMatrixWorld(true);
    const left = new THREE.Box3().setFromObject(group.getObjectByName("left-hanger"));
    const right = new THREE.Box3().setFromObject(group.getObjectByName("right-hanger"));
    assert.ok(left.min.x < -14, "left hook must extend into the drawer rail");
    assert.ok(right.max.x > 950 + 14, "right hook must extend into the drawer rail");
    group.traverse(mesh => mesh.geometry?.dispose());
  }
  metal.dispose();
  shade.dispose();
});

test("tab reinforcement contains a folded crown and impressed rule", () => {
  const stock = new THREE.MeshStandardMaterial();
  const crease = new THREE.MeshBasicMaterial();
  const group = createTabReinforcement(140, 210, -26, { stock, crease });
  assert.equal(group.children.length, 2);
  assert.ok(group.getObjectByName("tab-folded-edge"));
  assert.ok(group.getObjectByName("tab-embossed-reinforcement"));
  group.traverse(mesh => mesh.geometry?.dispose());
  stock.dispose();
  crease.dispose();
});


test("suspension hooks can meet responsive rails inside a narrow drawer", () => {
  const metal = new THREE.MeshStandardMaterial();
  const shade = new THREE.MeshStandardMaterial();
  const group = createSuspensionHardware(360, {
    metal, shade, detail: false,
    leftRailX: -5, rightRailX: 365,
  });
  const left = new THREE.Box3().setFromObject(group.getObjectByName("left-hanger"));
  const right = new THREE.Box3().setFromObject(group.getObjectByName("right-hanger"));
  assert.ok(left.min.x <= -3 && left.min.x > -20);
  assert.ok(right.max.x >= 363 && right.max.x < 380);
  group.traverse(node => node.geometry?.dispose());
  metal.dispose();
  shade.dispose();
});
