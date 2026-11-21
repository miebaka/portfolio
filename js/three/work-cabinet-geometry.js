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
/**
 * A hanging folder is suspended by one continuous wire through a folded hem,
 * not by two unattached pins. Keep the actual rail contact points in DOM
 * coordinates so this assembly works at desktop and narrow mobile widths.
 *
 * The entire assembly shares the parent file's transform and is decorative;
 * native anchors remain responsible for interaction and accessible labels.
 */
export function createSuspensionHardware(width, {
  metal, shade, detail = true,
  leftRailX = -23,
  rightRailX = width + 23,
} = {}) {
  finitePositive(width, "width");
  if (!metal || !shade) throw new TypeError("metal and shade materials required");
  if (!Number.isFinite(leftRailX) || !Number.isFinite(rightRailX) ||
      rightRailX <= leftRailX) {
    throw new RangeError("suspension rail coordinates must be ordered and finite");
  }
  const group = new THREE.Group();
  group.name = "folder-suspension-hardware";

  const span = rightRailX - leftRailX;
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.1, span, detail ? 12 : 8),
    metal
  );
  rod.name = "full-width-suspension-rod";
  rod.geometry.rotateZ(Math.PI / 2);
  rod.position.set((leftRailX + rightRailX) / 2, 8, -1);
  rod.castShadow = detail;
  group.add(rod);

  // The central hem visually encases the suspension rod. Thin cardstock
  // remains visible along the shoulder; only notched tips extend onto rails.
  const hem = new THREE.Mesh(
    new THREE.BoxGeometry(Math.max(12, width - 14), 4.3, .72),
    shade
  );
  hem.name = "folded-suspension-hem";
  hem.position.set(width / 2, 9.7, .64);
  group.add(hem);

  for (const side of [-1, 1]) {
    const right = side === 1;
    const railX = right ? rightRailX : leftRailX;
    const insideX = right ? width - 13 : 13;
    // The bent end is a shallow U whose notch is directly over the measured
    // support rail rather than a free-floating pin beside the file.
    const hookPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(insideX, 8, -1),
      new THREE.Vector3(railX - side * 5, 8, -1),
      new THREE.Vector3(railX, 10.1, -1.1),
      new THREE.Vector3(railX + side * 1.6, 12.6, -1.2),
      new THREE.Vector3(railX - side * 1.3, 14.1, -1.4),
    ], false, "centripetal");
    const hook = new THREE.Mesh(
      new THREE.TubeGeometry(hookPath, detail ? 18 : 10,
        detail ? .9 : .85, detail ? 8 : 5, false),
      metal
    );
    hook.name = right ? "right-hanger" : "left-hanger";
    hook.castShadow = detail;
    group.add(hook);

    const sleeve = new THREE.Mesh(
      new THREE.BoxGeometry(11, 2.2, .48),
      shade
    );
    sleeve.name = right ? "right-sleeve" : "left-sleeve";
    sleeve.position.set(insideX, 9.7, .98);
    group.add(sleeve);
  }
  return group;
}

/**
 * Three extremely shallow, continuous expansion scores across the lower
 * paper leaf. Separate narrow meshes keep creases visible at any viewport
 * width; coarse mobile tessellation cannot accidentally erase them.
 */
export function createExpansionScoreGeometry(width, height, { crease, highlight } = {}) {
  finitePositive(width, "width");
  finitePositive(height, "height");
  if (!crease || !highlight) throw new TypeError("crease and highlight materials required");
  const group = new THREE.Group();
  group.name = "folder-expansion-scores";
  const length = Math.max(1, width - 16);
  for (let index = 0; index < 3; index++) {
    const y = height - 9 - index * 4.2;
    const rule = new THREE.Mesh(
      new THREE.BoxGeometry(length, .26, .14), crease
    );
    rule.position.set(width / 2, y, 2.35);
    rule.name = "score-" + (index + 1);
    group.add(rule);

    const lightEdge = new THREE.Mesh(
      new THREE.BoxGeometry(length, .16, .12), highlight
    );
    lightEdge.position.set(width / 2, y - .55, 2.36);
    group.add(lightEdge);
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
