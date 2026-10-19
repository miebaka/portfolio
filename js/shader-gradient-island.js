import React, { createElement } from "react";
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
    shader: "defaults", type: "waterPlane",
    uAmplitude: 0, uDensity: 1, uFrequency: 5.5,
    uSpeed: 0.3, uStrength: 3, uTime: 0.2,
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
