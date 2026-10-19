import React, { createElement, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
import { ShaderGradient } from "../node_modules/@shadergradient/react/dist/ShaderGradient/index.mjs";
import { ShaderGradientCanvas } from "../node_modules/@shadergradient/react/dist/ShaderGradientCanvas.mjs";

/* Authored ShaderGradient URLs are the source of truth. These are separate
   compositions, not one preset with theme colours swapped. */
const PRESETS = Object.freeze({
  light: Object.freeze({
    range: "disabled", rangeStart: 0, rangeEnd: 40,
    brightness: 1.2,
    cAzimuthAngle: 180, cDistance: 2.9, cPolarAngle: 120, cameraZoom: 1,
    envPreset: "city", grain: "off", lightType: "3d",
    positionX: 0, positionY: 1.8, positionZ: 0,
    reflection: 0.1,
    rotationX: 0, rotationY: 0, rotationZ: -90,
    shader: "defaults", type: "waterPlane", loop: "off",
    uAmplitude: 0, uDensity: 1, uFrequency: 5.5,
    // A composed still with visible relief in both portrait and landscape crops.
    uSpeed: 0.3, uStrength: 3, uTime: 2.5,
    wireframe: false, fov: 45,
  }),
  dark: Object.freeze({
    range: "disabled", rangeStart: 0, rangeEnd: 40,
    brightness: 1,
    cAzimuthAngle: 180, cDistance: 2.8, cPolarAngle: 80, cameraZoom: 9.1,
    envPreset: "city", grain: "on", lightType: "3d",
    positionX: 0, positionY: 0, positionZ: 0,
    reflection: 0.1,
    rotationX: 50, rotationY: 0, rotationZ: -60,
    shader: "defaults", type: "waterPlane",
    uAmplitude: 0, uDensity: 1.5, uFrequency: 0,
    uSpeed: 0.3, uStrength: 1.5, uTime: 8,
    wireframe: false, fov: 45,
  }),
});

// The upstream physical water material extrapolates with vPos.z and applies
// lighting. Print must stay inside its delegated palette at every animation frame.
// Preserve displaced-surface relief as a scalar mask, then colour it only
// with Print surface tokens. The upstream vNormal describes the undeformed plane.
const LIGHT_FRAGMENT = `
uniform float uC1r; uniform float uC1g; uniform float uC1b;
uniform float uC2r; uniform float uC2g; uniform float uC2b;
uniform float uC3r; uniform float uC3g; uniform float uC3b;
varying vec3 vPrintNormal;
void main() {
  vec3 paper = vec3(uC1r, uC1g, uC1b);
  vec3 middle = vec3(uC2r, uC2g, uC2b);
  vec3 shade = vec3(uC3r, uC3g, uC3b);
  // Interpolated normals keep the low-contrast folds smooth, without mesh facets.
  vec3 normal = normalize(vPrintNormal);
  vec3 light = normalize(vec3(-0.45, 0.65, 1.0));
  float facing = dot(normal, light);
  float relief = 1.0 - clamp(facing, 0.0, 1.0);
  // Broad folds stay near paper even when the whole wave faces away from the key.
  // A narrow grazing band reserves deeper neutrals for crease accents, not masses.
  float broad = 0.25 * pow(smoothstep(0.12, 0.8, relief), 1.55);
  float crease = 1.0 - smoothstep(0.015, 0.10, abs(facing - 0.30));
  float mask = broad + (1.0 - broad) * pow(crease, 1.5);
  // Stationary sub-tonal dither softens 8-bit bands without an animated grain pass.
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
  mask = clamp(mask + grain * 0.045, 0.0, 1.0);
  vec3 colour = mix(paper, middle, smoothstep(0.0, 0.7, mask));
  colour = mix(colour, shade, smoothstep(0.7, 1.0, mask));
  gl_FragColor = vec4(colour, 1.0);
}`;

function LightPalette({ colors }) {
  const scene = useThree(state => state.scene);
  useLayoutEffect(() => {
    const material = scene.getObjectByName("shadergradient-mesh")?.material;
    if (!material) return;
    const compile = material.onBeforeCompile;
    const cacheKey = material.customProgramCacheKey;
    material.onBeforeCompile = function(shader, renderer) {
      compile.call(this, shader, renderer);
      // The library supplies undeformed normals. Sample its existing noise twice
      // more per vertex, add restrained fine relief, then interpolate across triangles.
      // Light uses the explicitly non-looping authored water preset.
      shader.vertexShader = "varying vec3 vPrintNormal;\n" + shader.vertexShader.replace(
        "vPos = pos;",
        `vPos = pos;
        float stepSize = 0.025;
        float noiseStep = stepSize * 0.43 * uNoiseDensity;
        float heightX = 0.75 * cnoise(noisePos + vec3(noiseStep, 0.0, 0.0) + t);
        float heightY = 0.75 * cnoise(noisePos + vec3(0.0, noiseStep, 0.0) + t);
        // Fine relief rides the same flow, without adding geometry or dark ink.
        vec3 detailPos = noisePos * 3.0 + t * 0.6;
        float detail = 0.12 * cnoise(detailPos);
        float detailX = 0.12 * cnoise(detailPos + vec3(noiseStep * 3.0, 0.0, 0.0));
        float detailY = 0.12 * cnoise(detailPos + vec3(0.0, noiseStep * 3.0, 0.0));
        vPrintNormal = normalize(vec3(
          -((heightX - distortion) * uNoiseStrength + detailX - detail) / stepSize,
          -((heightY - distortion) * uNoiseStrength + detailY - detail) / stepSize,
          1.0));`
      );
      shader.fragmentShader = LIGHT_FRAGMENT;
    };
    material.customProgramCacheKey = () => "portfolio-light-relief-v2";
    material.needsUpdate = true;
    return () => {
      material.onBeforeCompile = compile;
      material.customProgramCacheKey = cacheKey;
      material.needsUpdate = true;
    };
  }, [scene, colors]);
  return null;
}

function CursorCamera({ interaction, reduced, preset }) {
  const controls = useThree(state => state.controls);
  useFrame((_, delta) => {
    if (!controls) return;
    const targetX = reduced ? 0 : interaction.targetX;
    const targetY = reduced ? 0 : interaction.targetY;
    interaction.currentX = MathUtils.damp(interaction.currentX, targetX, 7, delta);
    interaction.currentY = MathUtils.damp(interaction.currentY, targetY, 7, delta);
    controls.rotateTo(
      MathUtils.degToRad(preset.cAzimuthAngle + interaction.currentX * 7),
      MathUtils.degToRad(preset.cPolarAngle - interaction.currentY * 4),
      false,
    );
  });
  return null;
}

function Backdrop({ theme, reduced, interaction, colors, backgrounds }) {
  const preset = {
    ...(PRESETS[theme] || PRESETS.light),
    color1: colors[0], color2: colors[1], color3: colors[2],
    ...(theme === "light" ? { bgColor1: backgrounds[0], bgColor2: backgrounds[1] } : {}),
  };
  return createElement(
    ShaderGradientCanvas,
    {
      className: "shader-backdrop__canvas",
      style: { position: "absolute", inset: 0 },
      pixelDensity: 1,
      fov: preset.fov,
      pointerEvents: "none",
      lazyLoad: false,
      powerPreference: "low-power",
    },
    createElement(React.Fragment, null,
      createElement(ShaderGradient, {
        ...preset,
        control: "props",
        animate: reduced ? "off" : "on",
        enableTransition: false,
        enableCameraUpdate: false,
      }),
      theme === "light" ? createElement(LightPalette, { colors }) : null,
      theme === "dark" ? createElement(CursorCamera, { interaction, reduced, preset }) : null,
    ),
  );
}

export function mountShaderGradient(host, initialState) {
  const root = createRoot(host);
  let state = { ...initialState };
  const interaction = { targetX: 0, targetY: 0, currentX: 0, currentY: 0 };
  const render = () => root.render(createElement(Backdrop, { ...state, interaction }));
  render();
  return {
    update(nextState) { state = { ...state, ...nextState }; render(); },
    setPointer(x, y) { interaction.targetX = x; interaction.targetY = y; },
    destroy() { root.unmount(); },
  };
}
