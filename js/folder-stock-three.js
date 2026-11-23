import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer } from "three";

// One offscreen pass shades the cover at grazing incidence. The HTML rack
// still supplies the printed cover, sheet edges, hit areas and navigation.
export function renderFolderStock(covers) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: false });
  if (!context) return;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    transparent: true,
    vertexShader: `
      varying vec2 surface;
      void main() {
        surface = uv;
        gl_Position = vec4(position.xy, 0., 1.);
      }`,
    fragmentShader: `
      varying vec2 surface;
      float fiber(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      void main() {
        vec2 p = surface * vec2(960., 384.);
        float grain = (fiber(floor(p)) - .5) * .065;
        float threads = (fiber(floor(p * vec2(.19, .74))) - .5) * .015;
        float bevel = exp(-pow((1. - surface.y) / .012, 2.)) * .12;
        float fold = exp(-pow((surface.y - .032) / .022, 2.)) * .055;
        float incidence = .055 * exp(-length((surface - vec2(.22, .86)) * vec2(2., 4.)));
        float shade = grain + threads + bevel + incidence - fold;
        gl_FragColor = vec4(vec3(step(0., shade)), abs(shade));
      }`,
  });
  const scene = new Scene();
  scene.add(new Mesh(geometry, material));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  camera.position.z = 1;
  try {
    renderer.setSize(960, 384, false);
    renderer.render(scene, camera);
    for (const cover of covers) {
      const surface = document.createElement("canvas");
      surface.className = "project-folder__stock";
      surface.setAttribute("aria-hidden", "true");
      surface.width = canvas.width;
      surface.height = canvas.height;
      const paint = surface.getContext("2d");
      if (!paint) continue;
      paint.drawImage(canvas, 0, 0);
      cover.prepend(surface);
    }
  } finally {
    material.dispose();
    geometry.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
}
