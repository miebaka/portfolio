import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import { ShaderGradient } from "../node_modules/@shadergradient/react/dist/ShaderGradient/index.mjs";
import { ShaderGradientCanvas } from "../node_modules/@shadergradient/react/dist/ShaderGradientCanvas.mjs";

/* ShaderGradient preset 04, Nighty night. Only its three colour inputs are
   replaced below; mesh, camera, light, grain and motion remain canonical. */
const NIGHTY_NIGHT = Object.freeze({
  range: "disabled", rangeStart: 0, rangeEnd: 40,
  animate: "on", brightness: 1,
  cAzimuthAngle: 180, cDistance: 2.8, cPolarAngle: 80, cameraZoom: 9.1,
  envPreset: "city", grain: "on", lightType: "3d",
  positionX: 0, positionY: 0, positionZ: 0,
  reflection: 0.1,
  rotationX: 50, rotationY: 0, rotationZ: -60,
  shader: "defaults", type: "waterPlane",
  uAmplitude: 0, uDensity: 1.5, uFrequency: 0,
  uSpeed: 0.3, uStrength: 1.5, uTime: 8,
  wireframe: false, fov: 45,
});
const PALETTES = Object.freeze({
  light: Object.freeze({ color1: "#f8f9fc", color2: "#b1c5ff", color3: "#002080" }),
  dark: Object.freeze({ color1: "#002080", color2: "#1c3da4", color3: "#b1c5ff" }),
});

function Backdrop({ theme, reduced }) {
  const palette = PALETTES[theme] || PALETTES.light;
  return createElement(
    ShaderGradientCanvas,
    {
      className: "shader-backdrop__canvas",
      style: { position: "absolute", inset: 0 },
      pixelDensity: 1,
      fov: NIGHTY_NIGHT.fov,
      pointerEvents: "none",
      lazyLoad: false,
      powerPreference: "low-power",
    },
    createElement(ShaderGradient, {
      ...NIGHTY_NIGHT,
      ...palette,
      control: "props",
      animate: reduced ? "off" : "on",
      uTime: 8,
      enableTransition: false,
      enableCameraUpdate: false,
    }),
  );
}

export function mountShaderGradient(host, initialState) {
  const root = createRoot(host);
  let state = { ...initialState };
  const render = () => root.render(createElement(Backdrop, state));
  render();
  return {
    update(nextState) { state = { ...state, ...nextState }; render(); },
    destroy() { root.unmount(); },
  };
}
