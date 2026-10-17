import React, { createElement } from "react";
import { createRoot } from "react-dom/client";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils } from "three";
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

function CursorCamera({ interaction, reduced }) {
  const controls = useThree(state => state.controls);
  useFrame((_, delta) => {
    if (!controls) return;
    const targetX = reduced ? 0 : interaction.targetX;
    const targetY = reduced ? 0 : interaction.targetY;
    interaction.currentX = MathUtils.damp(interaction.currentX, targetX, 7, delta);
    interaction.currentY = MathUtils.damp(interaction.currentY, targetY, 7, delta);
    controls.rotateTo(
      MathUtils.degToRad(NIGHTY_NIGHT.cAzimuthAngle + interaction.currentX * 7),
      MathUtils.degToRad(NIGHTY_NIGHT.cPolarAngle - interaction.currentY * 4),
      false,
    );
  });
  return null;
}

function Backdrop({ theme, reduced, interaction }) {
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
    createElement(React.Fragment, null,
      createElement(ShaderGradient, {
        ...NIGHTY_NIGHT,
        ...palette,
        control: "props",
        animate: reduced ? "off" : "on",
        uTime: 8,
        enableTransition: false,
        enableCameraUpdate: false,
      }),
      createElement(CursorCamera, { interaction, reduced }),
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
