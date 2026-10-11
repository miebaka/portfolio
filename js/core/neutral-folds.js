/* Lightweight, dependency-free interpretation of the Neutral Folds reference.
   One fixed WebGL surface serves every page and renders only when visible. */
const VERTEX = `
attribute vec2 aPosition;
void main(){gl_Position=vec4(aPosition,0.0,1.0);}
`;

const FRAGMENT = `
precision mediump float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uDark;
float fold(vec2 p,float angle,float frequency,float phase){
  vec2 axis=vec2(cos(angle),sin(angle));
  float wave=sin(dot(p,axis)*frequency+phase);
  return pow(.5+.5*wave,3.0);
}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uResolution)/max(uResolution.y,1.0);
  float drift=uTime*.035;
  float f=fold(uv,2.62,5.2,drift)+fold(uv,-2.35,7.6,-drift*.72);
  f+=fold(uv,2.95,11.0,drift*.44)*.38;
  float ridge=smoothstep(.32,1.72,f);
  float sheen=pow(clamp(f*.48,0.0,1.0),2.1);
  vec3 lightBase=vec3(.965,.969,.985);
  vec3 lightFold=vec3(.68,.72,.84);
  vec3 darkBase=vec3(.027,.067,.169);
  vec3 darkFold=vec3(.22,.31,.58);
  vec3 colour=mix(lightBase,lightFold,ridge*.42+sheen*.15);
  colour=mix(colour,mix(darkBase,darkFold,ridge*.54+sheen*.18),uDark);
  gl_FragColor=vec4(colour,1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

export function initNeutralFolds() {
  if (navigator.connection?.saveData) return;
  const canvas = document.createElement("canvas");
  canvas.className = "neutral-folds";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
  if (!gl) { canvas.remove(); return; }
  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    console.warn("Neutral folds unavailable", error);
    canvas.remove();
    return;
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  gl.useProgram(program);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const resolution = gl.getUniformLocation(program, "uResolution");
  const time = gl.getUniformLocation(program, "uTime");
  const dark = gl.getUniformLocation(program, "uDark");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let last = 0;
  const resize = () => {
    const ratio = Math.min(devicePixelRatio || 1, 1.25);
    const width = Math.max(1, Math.round(innerWidth * ratio));
    const height = Math.max(1, Math.round(innerHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(resolution, width, height);
  };
  const render = now => {
    if (document.hidden) { frame = 0; return; }
    if (!reduced.matches && now - last < 50) { frame = requestAnimationFrame(render); return; }
    last = now;
    resize();
    gl.uniform1f(time, reduced.matches ? 0 : now * .001);
    gl.uniform1f(dark, document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches) ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    frame = reduced.matches ? 0 : requestAnimationFrame(render);
  };
  const wake = () => { if (!frame) frame = requestAnimationFrame(render); };
  addEventListener("resize", wake, { passive: true });
  document.addEventListener("visibilitychange", wake);
  new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  wake();
}
