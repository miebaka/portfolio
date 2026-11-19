/* Three.js pool caustics: refracted sunlight focused by a deforming shallow-water surface.
   Static CSS remains the fallback. No simulated fluid particles or postprocessing chain. */
import { WebGLRenderer, Scene, OrthographicCamera, Mesh, PlaneGeometry, ShaderMaterial, Vector2, Vector3 } from "three";

const VERTEX = [
  "varying vec2 vUv;",
  "void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
].join("\n");

const FRAGMENT = [
  "precision highp float;",
  "varying vec2 vUv;",
  "uniform float uTime;",
  "uniform float uTransmission;",
  "uniform float uMotion;",
  "uniform vec2 uResolution;",
  "uniform vec2 uPointer;",
  "uniform vec3 uFloor;",
  "uniform vec3 uDepth;",
  "uniform vec3 uLight;",
  "const float PI = 3.141592653589793;",
  "float wave(vec2 p, float t) {",
  "  float a = sin(dot(p,vec2(1.13,.62))*5.8 + t*.73);",
  "  float b = sin(dot(p,vec2(-.58,1.20))*8.7 - t*.92);",
  "  float c = sin(dot(p,vec2(.96,-.79))*13.4 + t*1.31);",
  "  float d = sin(dot(p,vec2(-1.25,-.48))*18.2 - t*.48);",
  "  return .070*a + .039*b + .022*c + .010*d;",
  "}",
  "vec2 gradient(vec2 p, float t) {",
  "  const float h = .008;",
  "  return vec2(wave(p+vec2(h,0.),t)-wave(p-vec2(h,0.),t),",
  "              wave(p+vec2(0.,h),t)-wave(p-vec2(0.,h),t))/(2.*h);",
  "}",
  "vec2 refractedHit(vec2 p, float t) {",
  "  vec2 g = gradient(p,t);",
  "  vec3 normal = normalize(vec3(-g.x,-g.y,1.));",
  "  vec3 sun = normalize(vec3(.26,.21,-1.));",
  "  vec3 ray = refract(sun,normal,1.0/1.333);",
  "  float depth = 1.18 + .06*sin(p.x*.65);",
  "  return p + ray.xy / max(.28,abs(ray.z))*depth;",
  "}",
  "float caustics(vec2 p, float t) {",
  "  const float d=.012;",
  "  vec2 a=refractedHit(p,t);",
  "  vec2 dx=(refractedHit(p+vec2(d,0.),t)-refractedHit(p-vec2(d,0.),t))/(2.*d);",
  "  vec2 dy=(refractedHit(p+vec2(0.,d),t)-refractedHit(p-vec2(0.,d),t))/(2.*d);",
  "  float jac=abs(dx.x*dy.y-dx.y*dy.x);",
  "  float focus=pow(clamp(1./max(jac,.14),0.,7.),1.65);",
  "  return clamp((focus-.78)*.49,0.,3.);",
  "}",
  "void main(){",
  "  vec2 p=(vUv-.5)*vec2(uResolution.x/max(uResolution.y,1.),1.)*5.4;",
  "  vec2 pointer=uPointer*.25;",
  "  p+=pointer*(.24+.08*sin(uTime*.5));",
  "  float t=uTime*.63;",
  "  float mainLight=caustics(p,t);",
  "  float secondary=caustics(p*1.41+vec2(4.7,2.3),t*.77);",
  "  float shafts=pow(clamp(.5+.5*sin(p.x*.55+p.y*.23+t*.12),0.,1.),2.);",
  "  float focus=mainLight*.71+secondary*.29;",
  "  float attenuation=exp(-.30*(1.15+.2*length(p)*.17));",
  "  float transmission=uTransmission*attenuation;",
  "  float illumination=(.15+focus*.82+shafts*.09)*transmission;",
  "  vec3 floorColor=mix(uFloor,uDepth,smoothstep(-2.5,3.5,p.y)*.28);",
  "  vec3 color=floorColor+uLight*illumination;",
  "  color=mix(color,floorColor,.10*smoothstep(1.5,4.,length(p)));",
  "  color=1.-exp(-max(color,vec3(0.))*1.04);",
  "  gl_FragColor=vec4(color,1.);",
  "}",
].join("\n");

const FALLBACK_COLORS = ["#07112b","#002080","#b1c5ff"];
function colorToVec3(input, fallback) {
  const value = /^#[\da-f]{6}$/i.test(String(input||"").trim()) ? String(input).trim() : fallback;
  return new Vector3(...[1,3,5].map(i => parseInt(value.slice(i,i+2),16)/255));
}
export function mountHeroWave(host, initialState) {
  const canvas=document.createElement("canvas");
  canvas.className="hero-wave__canvas";
  canvas.setAttribute("aria-hidden","true");
  let renderer;
  try {
    renderer=new WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:"high-performance"});
  } catch(error) {canvas.remove();throw error;}
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x07112b,1);
  host.append(canvas);
  const scene=new Scene();
  const camera=new OrthographicCamera(-1,1,1,-1,0,1);
  const uniforms={
    uTime:{value:0},uTransmission:{value:1.0},uMotion:{value:1.0},
    uResolution:{value:new Vector2(1,1)},uPointer:{value:new Vector2()},
    uFloor:{value:new Vector3()},uDepth:{value:new Vector3()},uLight:{value:new Vector3()}
  };
  const geometry=new PlaneGeometry(2,2);
  const material=new ShaderMaterial({vertexShader:VERTEX,fragmentShader:FRAGMENT,uniforms,depthTest:false,depthWrite:false});
  const mesh=new Mesh(geometry,material);
  mesh.frustumCulled=false;scene.add(mesh);
  let state={...initialState}, destroyed=false, visible=true, frame=0, elapsed=0, last=0;
  let pointerX=0,pointerY=0,targetX=0,targetY=0;
  const reduced=window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const quality=()=>Math.min(1.35,Math.max(.65,window.devicePixelRatio||1));
  const resize=()=>{
    if(destroyed)return;
    const max=window.innerWidth<700?720:1280;
    const scale=Math.min(quality(),max/Math.max(host.clientWidth,host.clientHeight,1));
    const w=Math.max(1,Math.round(host.clientWidth*scale));
    const h=Math.max(1,Math.round(host.clientHeight*scale));
    renderer.setSize(w,h,false);
    uniforms.uResolution.value.set(w,h);
    render();
  };
  const render=()=>{
    if(destroyed)return;
    uniforms.uTime.value=elapsed*.001;
    renderer.render(scene,camera);
  };
  const animate=()=>Boolean(state.animate)&&!reduced?.matches&&visible&&!document.hidden;
  const frameStep=t=>{
    frame=0;
    if(destroyed)return;
    if(last&&t-last<1000/30){frame=requestAnimationFrame(frameStep);return;}
    const dt=last?Math.min(t-last,50):1000/30;
    last=t;
    if(animate())elapsed+=dt;
    pointerX+=(targetX-pointerX)*.065;
    pointerY+=(targetY-pointerY)*.065;
    uniforms.uPointer.value.set(pointerX,pointerY);
    render();
    if(animate())frame=requestAnimationFrame(frameStep);
  };
  const request=()=>{if(!destroyed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(frameStep);};
  const update=next=>{
    state={...state,...next};
    const colors=state.colors||FALLBACK_COLORS;
    const dark=state.theme==="dark";
    // Light changes the water optics, not merely a CSS filter: shallow water
    // transmits considerably more of the refracted sun than deep-night water.
    uniforms.uFloor.value.copy(dark ? colorToVec3(colors[0],FALLBACK_COLORS[0]) : new Vector3(.018,.12,.27));
    uniforms.uDepth.value.copy(dark ? colorToVec3(colors[1],FALLBACK_COLORS[1]) : new Vector3(.009,.06,.16));
    uniforms.uLight.value.copy(dark ? colorToVec3(colors[2],FALLBACK_COLORS[2]) : new Vector3(.64,.88,1.));
    uniforms.uTransmission.value=dark?.18:1.35;
    uniforms.uMotion.value=state.animate?1:0;
    host.dataset.waterTheme=dark?"dark":"light";
    render();
    if(!animate()&&frame){cancelAnimationFrame(frame);frame=0;last=0;}
    if(animate())request();
  };
  const onVisibility=()=>{if(!document.hidden)request();else if(frame){cancelAnimationFrame(frame);frame=0;last=0;}};
  const onContextLost=event=>{event.preventDefault();if(frame)cancelAnimationFrame(frame);frame=0;};
  const onContextRestored=()=>{renderer.forceContextRestore?.();resize();request();};
  canvas.addEventListener("webglcontextlost",onContextLost);
  canvas.addEventListener("webglcontextrestored",onContextRestored);
  document.addEventListener("visibilitychange",onVisibility);
  const ro=typeof ResizeObserver!=="undefined"?new ResizeObserver(resize):null;
  ro?.observe(host);
  window.addEventListener("resize",resize,{passive:true});
  const io=typeof IntersectionObserver!=="undefined"?new IntersectionObserver(([entry])=>{
    visible=Boolean(entry?.isIntersecting);
    if(visible)request();else if(frame){cancelAnimationFrame(frame);frame=0;last=0;}
  },{threshold:.01}):null;
  io?.observe(host);
  update(state);resize();request();
  return {
    ready:Promise.resolve(),
    update,
    setPointer(x,y){targetX=x;targetY=y;if(!animate())request();},
    destroy(){
      if(destroyed)return;
      destroyed=true;if(frame)cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange",onVisibility);
      canvas.removeEventListener("webglcontextlost",onContextLost);
      canvas.removeEventListener("webglcontextrestored",onContextRestored);
      window.removeEventListener("resize",resize);
      ro?.disconnect();io?.disconnect();
      geometry.dispose();material.dispose();renderer.dispose();canvas.remove();
    }
  };
}
