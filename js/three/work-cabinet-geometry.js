/**
 * Physical details for the overhead Work archive.
 *
 * These details replace the perfect flat planes of the original version
 * with restrained sheet bowing and real suspension hardware. Everything
 * is generated from measured DOM dimensions, not hardcoded viewport offsets.
 */
import * as THREE from "three";

function finitePositive(value, name) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(name + " must be a finite positive number");
  }
  return value;
}

/**
 * An inset, lightly tensioned face of heavy archival stock.
 * Shape extrusion still owns the precise die-cut silhouette; this surface
 * supplies gentle broad curvature and correct world-sized texture UVs.
 *
 * Shape and PlaneGeometry use different default UV units. Without this fix,
 * the shared paper texture is sampled from a tiny corner of the map and the
 * intended fibres/roughness disappear on the visible face.
 */
export function createBowedPaperGeometry(width, height, {
  seed = 1, segmentsX = 20, segmentsY = 8,
} = {}) {
  finitePositive(width, "width");
  finitePositive(height, "height");
  const sx = Math.max(6, Math.min(32, Math.round(segmentsX)));
  const sy = Math.max(4, Math.min(14, Math.round(segmentsY)));
  const geometry = new THREE.PlaneGeometry(width, height, sx, sy);
  const positions = geometry.getAttribute("position");
  const uvs = geometry.getAttribute("uv");
  const phase = (seed % 17) * .24;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const u = x / width + .5;
    const v = y / height + .5;
    // Real stock bows a little through the middle while its cut edges
    // spring back. Curl is bounded to <2.8 display units in all cases.
    const longitudinalBow = .69 * Math.sin(Math.PI * u) *
      Math.sin(Math.PI * v);
    const edgeSpring = .61 * (
      Math.exp(-u * 18) + Math.exp(-(1 - u) * 18)
    ) * (.4 + .6 * Math.sin(Math.PI * v));
    const fibrousTension = .18 * Math.sin(v * Math.PI * 3.1 + phase) *
      Math.sin(Math.PI * u);
    positions.setZ(i, 1.13 + longitudinalBow + edgeSpring + fibrousTension);
    // ExtrudeGeometry has world-size UVs. Match that projection so the
    // albedo, micro-bump and roughness all register on the front surface.
    uvs.setXY(i, u * width, v * height);
  }
  positions.needsUpdate = true;
  uvs.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/**
 * Two thin, bent metal hanger arms which engage the actual inner rails.
 * They are tiny at normal scale, but expose the hardware during a lift.
 * The user still interacts with real DOM links, never these meshes.
 */
export function createSuspensionHardware(width, {
  metal, shade, detail = true,
  leftRailX = -23,
  rightRailX = width + 23,
} = {}) {
  finitePositive(width, "width");
  if (!metal || !shade) throw new TypeError("metal and shade materials required");
  const group = new THREE.Group();
  group.name = "folder-suspension-hardware";
  for (const side of [-1, 1]) {
    const right = side === 1;
    const innerX = right ? width - 14 : 14;
    // A file's rail distance changes with responsive drawer padding.
    // Measuring the real rail location is essential on narrow screens.
    const outsideX = right ? rightRailX : leftRailX;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(innerX, 10, 2.9),
      new THREE.Vector3(innerX + side * 10, 8.8, 3.1),
      new THREE.Vector3(outsideX - side * 6, 8.4, 3.1),
      new THREE.Vector3(outsideX, 11.6, 2.8),
      new THREE.Vector3(outsideX - side * 1.8, 16.8, 2.1),
    ], false, "centripetal");
    const arm = new THREE.Mesh(
      new THREE.TubeGeometry(curve, detail ? 20 : 10,
        detail ? 1.18 : 1.08, detail ? 7 : 5, false),
      metal
    );
    arm.name = right ? "right-hanger" : "left-hanger";
    arm.castShadow = detail;
    group.add(arm);
    // Reinforced rolled slot at the paper/metal junction.
    const sleeve = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 2.7, .55),
      shade
    );
    sleeve.name = right ? "right-sleeve" : "left-sleeve";
    sleeve.position.set(innerX + side * 2.5, 10, 2.22);
    sleeve.rotation.z = side * .035;
    group.add(sleeve);
  }
  return group;
}

/** A two-ply tab has a rolled crown and an impressed reinforcement line. */
export function createTabReinforcement(left, width, top, {
  stock, crease,
} = {}) {
  finitePositive(width, "width");
  if (!stock || !crease) throw new TypeError("stock and crease materials required");
  const group = new THREE.Group();
  group.name = "reinforced-tab";
  const safeWidth = Math.max(4, width - 9);
  const crown = new THREE.Mesh(
    new THREE.BoxGeometry(safeWidth, .55, .5), stock
  );
  crown.name = "tab-folded-edge";
  crown.position.set(left + width / 2, top + 3.8, 1.52);
  group.add(crown);
  const emboss = new THREE.Mesh(
    new THREE.PlaneGeometry(safeWidth - 1, .42), crease
  );
  emboss.name = "tab-embossed-reinforcement";
  emboss.position.set(left + width / 2, top + 6.7, 1.8);
  group.add(emboss);
  return group;
}
