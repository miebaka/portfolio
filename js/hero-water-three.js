/* Persistent GPU shallow-water fluid with incompressible 2D Navier-Stokes
   projection, Jacobi pressure solver, semi-Lagrangian advection, wave integration,
   and air-to-water refraction caustic projection. Not a volumetric 3D simulation. */
import {WebGLRenderer,WebGLRenderTarget,Scene,OrthographicCamera,Mesh,PlaneGeometry,ShaderMaterial,Vector2,Vector3,Vector4,HalfFloatType,NearestFilter,LinearFilter,ClampToEdgeWrapping,NoToneMapping,AdditiveBlending,DoubleSide} from "three";
import { isCompactViewport } from "./core/responsive.js";
const vertex="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
const prefix="precision highp float;varying vec2 vUv;uniform vec2 texel;uniform float dt;uniform vec2 cursor;uniform float impulse;uniform vec2 brushRadius;uniform float swirl;uniform float ringCount;uniform float rippleStrength;";
const advect=prefix+[
 "uniform sampler2D velocity;",
 "void main(){vec2 vel=texture2D(velocity,vUv).xy;",
 "vec2 back=clamp(vUv-vel*dt*.6,texel,1.-texel);",
 "vec2 carried=texture2D(velocity,back).xy*.995;",
 "vec2 delta=vUv-cursor;vec2 scaled=delta/max(brushRadius,vec2(.0001));",
 "float radius=length(scaled);float falloff=exp(-dot(scaled,scaled)*1.8);",
 "float echoes=.82+.18*cos(radius*ringCount*6.283185);",
 "vec2 tangent=vec2(-delta.y,delta.x)*22.*swirl;",
 "vec2 spread=normalize(delta+vec2(.00001))*.055;",
 "vec2 force=(tangent+spread)*impulse*falloff*echoes;",
 "vec2 edge=smoothstep(vec2(0.),texel*3.,vUv)*smoothstep(vec2(0.),texel*3.,1.-vUv);",
 "gl_FragColor=vec4((carried+force)*edge,0.,1.);}"
].join("\n");
const divergence=prefix+[
 "uniform sampler2D velocity;",
 "void main(){float l=texture2D(velocity,vUv-vec2(texel.x,0.)).x;",
 "float r=texture2D(velocity,vUv+vec2(texel.x,0.)).x;",
 "float b=texture2D(velocity,vUv-vec2(0.,texel.y)).y;",
 "float t=texture2D(velocity,vUv+vec2(0.,texel.y)).y;",
 "gl_FragColor=vec4(.5*(r-l+t-b),0.,0.,1.);}"
].join("\n");
const jacobi=prefix+[
 "uniform sampler2D pressure;uniform sampler2D divergence;",
 "void main(){float l=texture2D(pressure,vUv-vec2(texel.x,0.)).x;",
 "float r=texture2D(pressure,vUv+vec2(texel.x,0.)).x;",
 "float b=texture2D(pressure,vUv-vec2(0.,texel.y)).x;",
 "float t=texture2D(pressure,vUv+vec2(0.,texel.y)).x;",
 "float d=texture2D(divergence,vUv).x;",
 "gl_FragColor=vec4((l+r+b+t-d)*.25,0.,0.,1.);}"
].join("\n");
const project=prefix+[
 "uniform sampler2D pressure;uniform sampler2D velocity;",
 "void main(){float l=texture2D(pressure,vUv-vec2(texel.x,0.)).x;",
 "float r=texture2D(pressure,vUv+vec2(texel.x,0.)).x;",
 "float b=texture2D(pressure,vUv-vec2(0.,texel.y)).x;",
 "float t=texture2D(pressure,vUv+vec2(0.,texel.y)).x;",
 "vec2 vel=texture2D(velocity,vUv).xy-.5*vec2(r-l,t-b);",
 "vec2 edge=step(texel*1.5,vUv)*step(texel*1.5,1.-vUv);",
 "gl_FragColor=vec4(vel*edge,0.,1.);}"
].join("\n");
const wave=prefix+[
 "uniform sampler2D surface;uniform sampler2D velocity;",
 "void main(){vec2 vel=texture2D(velocity,vUv).xy;",
 "vec2 p=clamp(vUv-vel*dt*.13,texel,1.-texel);",
 "vec4 s=texture2D(surface,p);",
 "float l=texture2D(surface,p-vec2(texel.x,0.)).r;",
 "float r=texture2D(surface,p+vec2(texel.x,0.)).r;",
 "float b=texture2D(surface,p-vec2(0.,texel.y)).r;",
 "float t=texture2D(surface,p+vec2(0.,texel.y)).r;",
 "float lap=l+r+b+t-4.*s.r;",
 "vec2 brushDelta=(vUv-cursor)/max(brushRadius,vec2(.0001));",
 "float radius=length(brushDelta);",
 "float falloff=exp(-dot(brushDelta,brushDelta)*2.2);",
 "float rings=.82+.18*cos(radius*ringCount*6.283185);",
 "float drop=falloff*rings*impulse*rippleStrength;",
 "float h=(2.*s.r-s.g+lap*.36)*.988+drop;",
 "float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));",
 "h*=mix(.92,1.,smoothstep(0.,.05,edge));",
 "float foam=max(s.b*.96,clamp(abs(h-s.r)*6.,0.,1.));",
 "gl_FragColor=vec4(clamp(h,-1.,1.),s.r,foam,1.);}"
].join("\n");
const waterField=String.raw`
uniform sampler2D surface;
uniform vec2 texel;
uniform float time;

// Continuously moving swell and cross-chop, shared by the light-front and
// the visible water. The fluid simulation adds local pointer-driven ripples.
float waterHeight(vec2 p) {
  vec2 warp = p + .011 * vec2(
    sin(p.y * 13.0 + time * .23),
    cos(p.x * 11.0 - time * .19)
  );
  float swell = sin(dot(warp, vec2(38.0, 13.0)) - time * .69
    + .27 * sin(dot(warp, vec2(-9.0, 18.0)) + time * .16));
  float cross = sin(dot(warp, vec2(-18.0, 41.0)) + time * .48);
  float detail = sin(dot(warp, vec2(68.0, -26.0)) - time * .91);
  float fluid = texture2D(surface, clamp(p, texel * 2.0, 1.0 - texel * 2.0)).r;
  return fluid * .019 + swell * .0034 + cross * .0029 + detail * .0011;
}
vec3 waterNormal(vec2 p) {
  vec2 e = max(texel * .75, vec2(.0032));
  vec2 slope = vec2(
    waterHeight(p + vec2(e.x, 0.0)) - waterHeight(p - vec2(e.x, 0.0)),
    waterHeight(p + vec2(0.0, e.y)) - waterHeight(p - vec2(0.0, e.y))
  ) / (2.0 * e);
  return normalize(vec3(-slope, 1.0));
}
`;
const causticsVertex=String.raw`
precision highp float;
uniform vec3 lightDirection;
uniform float waterDepth;
varying vec2 vSource;
varying vec2 vArrival;
varying float vIrradiance;
`+waterField+String.raw`
void main() {
  vec2 p = uv;
  vec3 n = waterNormal(p);
  vec3 incoming = normalize(lightDirection);
  // Air -> water. Sun and moon are almost perpendicular to the surface.
  vec3 transmitted = refract(incoming, n, 1.0 / 1.333);
  float distanceToFloor = max(.1, waterDepth + waterHeight(p));
  vec2 arrival = p + transmitted.xy / max(.2, -transmitted.z) * distanceToFloor;
  vSource = p;
  vArrival = arrival;
  vIrradiance = max(dot(n, -incoming), 0.0);
  gl_Position = vec4(arrival * 2.0 - 1.0, 0.0, 1.0);
}
`;
const causticsFragment=String.raw`
precision highp float;
varying vec2 vSource;
varying vec2 vArrival;
varying float vIrradiance;
void main() {
  // Evan Wallace's light-front method: the projected area reduction is the
  // actual geometric focusing factor. It also accumulates overlapping rays.
  vec2 sx = dFdx(vSource), sy = dFdy(vSource);
  vec2 ax = dFdx(vArrival), ay = dFdy(vArrival);
  float sourceArea = abs(sx.x * sy.y - sx.y * sy.x);
  float arrivalArea = abs(ax.x * ay.y - ax.y * ay.x);
  float focus = min(sourceArea / max(arrivalArea, 0.00000001), 10.0);
  // Sunlight folds into crisp seams, while the valleys retain their depth.
  float light = pow(max(focus - .80, 0.0), 1.32) * .37 * vIrradiance;
  gl_FragColor = vec4(vec3(min(light, 5.0)), 1.0);
}
`;
const shade=String.raw`
precision highp float;
varying vec2 vUv;
uniform sampler2D caustics;
uniform float transmission, nightFactor, aspectRatio;
uniform vec3 floorColor, deepColor, lightColor, lightDirection, skyColor;
// Four short-lived caustic disturbances supplement the existing fluid field.
uniform vec4 rippleEvents[4];
`+waterField+String.raw`
float grain(vec2 p) {
  return fract(sin(dot(floor(p * vec2(480.0, 510.0)),
    vec2(127.1, 311.7))) * 43758.5453123);
}
void main() {
  vec2 p = clamp(vUv, texel * 2.0, 1.0 - texel * 2.0);
  vec3 normal = waterNormal(p);
  vec3 viewDirection = normalize(vec3(.035, .025, 1.0));
  vec3 toLight = normalize(-lightDirection);

  // Short-lived pointer/touch impulses bend the projected lightfront.
  // Aspect correction keeps the wave rings circular on any viewport.
  vec2 rippleBend = vec2(0.0);
  float rippleGlint = 0.0;
  for (int i = 0; i < 4; i++) {
    vec4 eventWave = rippleEvents[i];
    float age = time - eventWave.z;
    if (eventWave.w <= 0.0 || age < 0.0 || age >= 2.8) continue;
    vec2 offset = p - eventWave.xy;
    float distanceToTouch = length(vec2(offset.x * aspectRatio, offset.y));
    float front = distanceToTouch - age * 0.245;
    float envelope = exp(-front * front * 460.0) * exp(-age * 0.82);
    float crest = cos(front * 92.0);
    rippleBend += offset / max(distanceToTouch, 0.001) *
      (crest * envelope * eventWave.w * 0.0065);
    rippleGlint += max(crest, 0.0) * envelope * eventWave.w;
  }
  vec2 litUV = clamp(p + rippleBend, texel * 2.0, 1.0 - texel * 2.0);

  // The caustic texture is light energy on the floor, not a scrolling
  // pattern. Tiny spectral separation imitates real water dispersion.
  vec2 dispersion = vec2(.0017, -.0010);
  vec3 focused = vec3(
    texture2D(caustics, clamp(litUV + dispersion, 0.0, 1.0)).r,
    texture2D(caustics, litUV).r,
    texture2D(caustics, clamp(litUV - dispersion, 0.0, 1.0)).r
  );
  focused = pow(min(focused, vec3(4.0)), vec3(1.15));

  // Subtle limestone/sand variation stays visible through clear water.
  float stone = .95 + .035 * sin(p.x * 31.0 + sin(p.y * 11.0) * 1.7)
    + .025 * sin(p.y * 27.0 + sin(p.x * 12.0));
  stone += (grain(p) - .5) * .028;
  float shallowDepth = clamp(.36 + .08 * waterHeight(p), 0.0, 1.0);
  // A restrained sunward gradient and refracted limestone joints establish
  // water depth without introducing a second painted water texture.
  float sunward = 0.86 + 0.24 * smoothstep(0.08, 0.95, p.x * 0.58 + p.y * 0.42);
  vec2 floorUV = p + normal.xz * 0.011 + rippleBend * 0.45;
  vec2 tile = abs(fract(floorUV * vec2(12.0, 9.0)) - 0.5);
  float grout = smoothstep(0.478, 0.499, max(tile.x, tile.y));
  vec3 bed = mix(floorColor, deepColor, shallowDepth) * stone
    * mix(1.0, sunward, 1.0 - nightFactor);
  bed *= 1.0 - grout * 0.034;
  // Shallow Beer-Lambert attenuation, keeping the bed legible.
  vec3 clearWater = mix(bed, bed * skyColor, .075 + nightFactor * .035);
  float incidence = max(dot(normal, toLight), 0.0);
  vec3 transmitted = clearWater
    + focused * lightColor * transmission * (.69 + .31 * incidence)
      * mix(0.89, sunward, 1.0 - nightFactor);

  // A top-down camera has only a small Fresnel reflection at normal incidence.
  // Separate highlights on the surface from refraction caustics on the floor.
  float fresnel = .02 + .98 * pow(
    1.0 - clamp(dot(normal, viewDirection), 0.0, 1.0), 5.0
  );
  vec3 reflected = mix(transmitted, skyColor, fresnel * (.55 + nightFactor * .35));
  vec3 halfVector = normalize(toLight + viewDirection);
  float specular = pow(max(dot(normal, halfVector), 0.0),
    mix(220.0, 320.0, nightFactor));
  reflected += lightColor * specular * mix(.26, .15, nightFactor);
  reflected += lightColor * rippleGlint * mix(.105, .045, nightFactor);
  gl_FragColor = vec4(1.0 - exp(-max(reflected, vec3(0.0))), 1.0);
}
`;
const SIZE=144;
const ITERATIONS=10;
export function mountHeroWave(host,initialState){
 const canvas=document.createElement("canvas");canvas.className="hero-wave__canvas";canvas.setAttribute("aria-hidden","true");
 // Use the device default GPU and share ONE WebGL2 context with Three.js.
 // "high-performance" can fail on mobile power-saving browsers.
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,powerPreference:"default"});
 if(!gl)throw new Error("WebGL2 unavailable");
 const renderer=new WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,powerPreference:"default"});
 if(!gl.getExtension("EXT_color_buffer_float")&&!gl.getExtension("EXT_color_buffer_half_float")){renderer.dispose();throw new Error("Half float framebuffer unavailable");}
 renderer.setPixelRatio(1);renderer.toneMapping=NoToneMapping;host.append(canvas);
 const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,0,1),geometry=new PlaneGeometry(2,2);
 const mesh=new Mesh(geometry,new ShaderMaterial({vertexShader:vertex,fragmentShader:shade,depthTest:false,depthWrite:false}));mesh.frustumCulled=false;scene.add(mesh);
 const side=isCompactViewport()?112:SIZE,texel=new Vector2(1/side,1/side),cursor=new Vector2(.55,.5),brushRadius=new Vector2(.075,.075);
 const makeTarget=()=>new WebGLRenderTarget(side,side,{type:HalfFloatType,minFilter:NearestFilter,magFilter:NearestFilter,wrapS:ClampToEdgeWrapping,wrapT:ClampToEdgeWrapping,depthBuffer:false,stencilBuffer:false});
 const pair=()=>({read:makeTarget(),write:makeTarget(),swap(){const a=this.read;this.read=this.write;this.write=a;},dispose(){this.read.dispose();this.write.dispose();}});
 const vel=pair(),press=pair(),height=pair(),div=makeTarget();
 const causticsTarget=new WebGLRenderTarget(side<SIZE?320:512,side<SIZE?320:512,{
  type:HalfFloatType,minFilter:LinearFilter,magFilter:LinearFilter,
  wrapS:ClampToEdgeWrapping,wrapT:ClampToEdgeWrapping,depthBuffer:false,stencilBuffer:false
 });
 const causticsMaterial=new ShaderMaterial({
  vertexShader:causticsVertex,fragmentShader:causticsFragment,
  depthTest:false,depthWrite:false,transparent:true,blending:AdditiveBlending,side:DoubleSide,
  uniforms:{surface:{value:height.read.texture},texel:{value:texel},
   time:{value:0},waterDepth:{value:.56},lightDirection:{value:new Vector3(.025,.035,-1)}}
 });
 const causticsGeometry=new PlaneGeometry(2,2,side<SIZE?96:160,side<SIZE?96:160);
 const causticsScene=new Scene();
 const causticsMesh=new Mesh(causticsGeometry,causticsMaterial);
 causticsMesh.frustumCulled=false;
 causticsScene.add(causticsMesh);
 const makePass=fragmentShader=>new ShaderMaterial({vertexShader:vertex,fragmentShader,depthTest:false,depthWrite:false,uniforms:{texel:{value:texel},dt:{value:1/30},cursor:{value:cursor},impulse:{value:0},velocity:{value:null},pressure:{value:null},divergence:{value:null},surface:{value:null},brushRadius:{value:brushRadius},swirl:{value:1},ringCount:{value:4},rippleStrength:{value:.2}}});
 const ad=makePass(advect),dv=makePass(divergence),jac=makePass(jacobi),proj=makePass(project),wav=makePass(wave),screen=mesh.material;
 const rippleEvents=Array.from({length:4},()=>new Vector4(-2,-2,-10,0));
 screen.uniforms={surface:{value:height.read.texture},caustics:{value:causticsTarget.texture},
  texel:{value:texel},time:{value:0},transmission:{value:1},
  rippleEvents:{value:rippleEvents},aspectRatio:{value:1},
  floorColor:{value:new Vector3()},deepColor:{value:new Vector3()},
  lightColor:{value:new Vector3()},lightDirection:{value:new Vector3(.025,.035,-1)},
  skyColor:{value:new Vector3()},nightFactor:{value:0}};
 let state={...initialState},destroyed=false,visible=true,frame=0,last=0,time=0,impulse=.48,steps=0,lastPointerAt=0;
 let pointerWaveCount=0,lastLightRippleAt=-100;
 // One resolved motion preference controls the shader. Explicit Full must
 // override OS Reduce instead of being blocked by a second matchMedia check.
 const running=()=>Boolean(state.animate)&&visible&&!document.hidden;
 function pass(mat,target,inputs){
  mesh.material=mat;
  mat.uniforms.impulse.value=impulse;
  for(const [name,texture] of Object.entries(inputs))mat.uniforms[name].value=texture;
  renderer.setRenderTarget(target);renderer.render(scene,camera);
 }
 function draw(){if(destroyed)return;mesh.material=screen;screen.uniforms.surface.value=height.read.texture;renderer.setRenderTarget(null);renderer.render(scene,camera);}
 function renderCaustics(){
  causticsMaterial.uniforms.surface.value=height.read.texture;
  causticsMaterial.uniforms.time.value=time;
  screen.uniforms.time.value=time;
  renderer.setRenderTarget(causticsTarget);
  renderer.clear();
  renderer.render(causticsScene,camera);
  renderer.setRenderTarget(null);
 }
 function step(){
  // Natural low-amplitude disturbances keep the surface alive without input.
  steps++;
  if(steps%64===0&&performance.now()-lastPointerAt>1600){
   cursor.set(.18+.64*(.5+.5*Math.sin(steps*.719)),.18+.64*(.5+.5*Math.cos(steps*.453)));
   impulse=.14;
  }
  pass(ad,vel.write,{velocity:vel.read.texture});vel.swap();
  pass(dv,div,{velocity:vel.read.texture});
  for(let i=0;i<ITERATIONS;i++){pass(jac,press.write,{pressure:press.read.texture,divergence:div.texture});press.swap();}
  pass(proj,vel.write,{velocity:vel.read.texture,pressure:press.read.texture});vel.swap();
  pass(wav,height.write,{surface:height.read.texture,velocity:vel.read.texture});height.swap();
  impulse=0;
  renderCaustics();
 }
 function resize(){
  if(destroyed)return;
  const limit=isCompactViewport()?720:1152;
  const scale=Math.min(window.devicePixelRatio||1,1.25,limit/Math.max(host.clientWidth,host.clientHeight,1));
  renderer.setSize(Math.max(1,Math.round(host.clientWidth*scale)),Math.max(1,Math.round(host.clientHeight*scale)),false);
  screen.uniforms.aspectRatio.value=Math.max(.35,Math.min(4,host.clientWidth/Math.max(host.clientHeight,1)));
  // A 150px brush is circular on screen, even on very wide hero viewports.
  brushRadius.set(Math.min(.25,75/Math.max(host.clientWidth,1)),Math.min(.25,75/Math.max(host.clientHeight,1)));
  draw();
 }
 function tick(timestamp){
  frame=0;if(destroyed)return;
  if(last&&timestamp-last<1000/24){frame=requestAnimationFrame(tick);return;}
  if(running()&&last)time+=Math.min(.06,Math.max(0,(timestamp-last)/1000));
  last=timestamp;
  if(running())step();
  draw();if(running())frame=requestAnimationFrame(tick);
 }
 const request=()=>{if(!destroyed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);};
 function update(next){
  state={...state,...next};
  const dark=state.theme==="dark";
  screen.uniforms.floorColor.value.set(dark?.048:.49,dark?.085:.58,dark?.145:.51);
  screen.uniforms.deepColor.value.set(dark?.009:.13,dark?.026:.37,dark?.064:.44);
  screen.uniforms.lightColor.value.set(dark?.72:1.,dark?.83:.965,dark?1.:.86);
  screen.uniforms.transmission.value=dark?.29:1.18;
  // The sun and full moon are both close to the zenith, never near the horizon.
  screen.uniforms.lightDirection.value.set(dark?-.025:.025,.035,-1.).normalize();
  causticsMaterial.uniforms.lightDirection.value.copy(screen.uniforms.lightDirection.value);
  screen.uniforms.skyColor.value.set(dark?.095:.54,dark?.15:.84,dark?.28:.92);
  screen.uniforms.nightFactor.value=dark?1:0;
  host.dataset.simulation="gpu-fluid-heightfield";
  host.dataset.lighting="sunward-caustics";
  host.dataset.pointerLight="refracted-impulses";
  host.dataset.pointerWaveCount=String(Math.min(pointerWaveCount,4));
  host.dataset.caustics="refracted-lightfront";
  host.dataset.lightSource=dark?"moon":"sun";
  host.dataset.waterTheme=dark?"dark":"light";
  host.dataset.rippleBrush="150px";host.dataset.rippleRings="4";host.dataset.rippleSwirl="1";
  renderCaustics();
  draw();
  if(!running()&&frame){cancelAnimationFrame(frame);frame=0;}
  if(running())request();
 }
 function setPointer(x,y,force=0,quiet=false){
  const nx=Math.max(.01,Math.min(.99,(x+1)*.5)),ny=Math.max(.01,Math.min(.99,1-(y+1)*.5));
  const distance=Math.hypot(nx-cursor.x,ny-cursor.y);cursor.set(nx,ny);
  if(!quiet&&(distance>.004||force>0))lastPointerAt=performance.now();
  if(!quiet&&running()&&(force>0||(distance>.004&&distance<.7))){
   impulse=Math.max(impulse,Math.min(.92,Math.max(force,distance*2.6)));
   // Shader uniforms are reused; no render targets or materials are created
   // on movement. Keep the four freshest lightfront impulses.
   if(force>0||(distance>.018&&time-lastLightRippleAt>.16)){
    const strength=Math.min(1,Math.max(.35,force+.32));
    rippleEvents[pointerWaveCount%4].set(nx,ny,time,strength);
    pointerWaveCount++;
    lastLightRippleAt=time;
    host.dataset.pointerWaveCount=String(Math.min(pointerWaveCount,4));
   }
  }
  request();
 }
 const onVisibility=()=>{if(document.hidden&&frame){cancelAnimationFrame(frame);frame=0;}else request();};
 const lost=e=>{e.preventDefault();if(frame)cancelAnimationFrame(frame);frame=0;};
 const ro=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;
 const io=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([e])=>{visible=Boolean(e?.isIntersecting);if(!visible&&frame){cancelAnimationFrame(frame);frame=0;}else request();},{threshold:.01}):null;
 document.addEventListener("visibilitychange",onVisibility);canvas.addEventListener("webglcontextlost",lost);
 window.addEventListener("resize",resize,{passive:true});ro?.observe(host);io?.observe(host);
 renderer.setClearColor(0x000000,0);
 for(const target of [vel.read,vel.write,press.read,press.write,height.read,height.write,div]){renderer.setRenderTarget(target);renderer.clear();}
 step();update(state);resize();request();
 return {ready:Promise.resolve(),update,setPointer,destroy(){
  if(destroyed)return;destroyed=true;if(frame)cancelAnimationFrame(frame);
  document.removeEventListener("visibilitychange",onVisibility);canvas.removeEventListener("webglcontextlost",lost);
  window.removeEventListener("resize",resize);ro?.disconnect();io?.disconnect();
  vel.dispose();press.dispose();height.dispose();div.dispose();causticsTarget.dispose();
  [ad,dv,jac,proj,wav,screen,causticsMaterial].forEach(x=>x.dispose());
  causticsGeometry.dispose();geometry.dispose();renderer.dispose();canvas.remove();
 }};
}