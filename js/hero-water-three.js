/* Persistent GPU shallow-water fluid with incompressible 2D Navier-Stokes
   projection, Jacobi pressure solver, semi-Lagrangian advection, wave integration,
   and water-to-air refraction caustic shading. Not a volumetric 3D simulation. */
import {WebGLRenderer,WebGLRenderTarget,Scene,OrthographicCamera,Mesh,PlaneGeometry,ShaderMaterial,Vector2,Vector3,HalfFloatType,NearestFilter,ClampToEdgeWrapping,NoToneMapping} from "three";
const vertex="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}";
const prefix="precision highp float;varying vec2 vUv;uniform vec2 texel;uniform float dt;uniform vec2 cursor;uniform float impulse;";
const advect=prefix+[
 "uniform sampler2D velocity;",
 "void main(){vec2 vel=texture2D(velocity,vUv).xy;",
 "vec2 back=clamp(vUv-vel*dt*.6,texel,1.-texel);",
 "vec2 carried=texture2D(velocity,back).xy*.995;",
 "vec2 delta=vUv-cursor;float falloff=exp(-dot(delta,delta)*160.);",
 "vec2 force=vec2(-delta.y,delta.x)*impulse*falloff*22.;",
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
 "float drop=exp(-dot(vUv-cursor,vUv-cursor)*200.)*impulse*.25;",
 "float h=(2.*s.r-s.g+lap*.36)*.988+drop;",
 "float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));",
 "h*=mix(.92,1.,smoothstep(0.,.05,edge));",
 "float foam=max(s.b*.96,clamp(abs(h-s.r)*6.,0.,1.));",
 "gl_FragColor=vec4(clamp(h,-1.,1.),s.r,foam,1.);}"
].join("\n");
const shade=[
 "precision highp float;varying vec2 vUv;",
 "uniform sampler2D surface;uniform vec2 texel;",
 "uniform float transmission,daylight;",
 "uniform vec3 floorColor,deepColor,lightColor;",
 "vec2 grad(vec2 p){",
 " float l=texture2D(surface,p-vec2(texel.x,0.)).r;",
 " float r=texture2D(surface,p+vec2(texel.x,0.)).r;",
 " float b=texture2D(surface,p-vec2(0.,texel.y)).r;",
 " float t=texture2D(surface,p+vec2(0.,texel.y)).r;",
 " return .5*vec2(r-l,t-b);}",
 "vec3 normalAt(vec2 p){return normalize(vec3(-grad(p)*6.25,1.));}",
 "vec2 hit(vec2 p){",
 " vec3 n=normalAt(p);",
 " // High noon sends near-vertical blue-white sun; the moon is cooler/oblique.",
 " vec3 rayIn=normalize(mix(vec3(.16,.08,-1.),vec3(.37,.18,-1.),1.-daylight));",
 " vec3 rayOut=refract(rayIn,n,1./1.333);",
 " return p+rayOut.xy/max(.2,abs(rayOut.z))*.072;}",
 "void main(){",
 " vec2 p=clamp(vUv,texel*2.,1.-texel*2.);",
 " vec2 x=(hit(p+vec2(texel.x*2.,0.))-hit(p-vec2(texel.x*2.,0.)))/(texel.x*4.);",
 " vec2 y=(hit(p+vec2(0.,texel.y*2.))-hit(p-vec2(0.,texel.y*2.)))/(texel.y*4.);",
 " float jac=abs(x.x*y.y-x.y*y.x);",
 " float focus=pow(clamp(1./max(jac,.075),0.,8.),1.45);",
 " vec4 water=texture2D(surface,p);",
 " vec3 n=normalAt(p);",
 " // Schlick Fresnel gives subtle natural reflection at high viewing angles.",
 " vec3 viewDir=normalize(vec3((p-.5)*.62,1.25));",
 " float cosTheta=clamp(dot(n,viewDir),0.,1.);",
 " float fresnel=.02+.98*pow(1.-cosTheta,5.);",
 " float shallow=clamp(.63+water.r*.16,0.,1.);",
 " vec3 absorption=mix(deepColor,floorColor,shallow);",
 " float depthAttenuation=exp(-mix(.66,.23,daylight)*(1.12+water.r*.15));",
 " float sunCaustic=clamp((focus-.72)*1.15+.11,0.,3.9);",
 " float moonCaustic=clamp((focus-.81)*.37+.045,0.,.62);",
 " float focused=mix(moonCaustic,sunCaustic,daylight);",
 " vec3 brightSky=mix(vec3(.026,.058,.11),vec3(.54,.84,1.),daylight);",
 " float sparkle=pow(max(dot(n,normalize(mix(vec3(.23,.35,1.),vec3(-.11,.04,1.),daylight))),0.),mix(110.,200.,daylight));",
 " vec3 reflected=brightSky*(fresnel*.54+sparkle*mix(.24,.5,daylight));",
 " float pathLight=transmission*focused*depthAttenuation;",
 " vec3 color=absorption+lightColor*pathLight+reflected;",
 " color+=lightColor*water.b*mix(.025,.06,daylight);",
 " float vignette=1.-.2*smoothstep(.35,.77,length(p-.5));",
 " color*=vignette;",
 " gl_FragColor=vec4(1.-exp(-max(color,vec3(0.))),1.);",
 "}"
].join("\\n");
const SIZE=144;
const ITERATIONS=10;
function hex(v,fallback){let s=/^#[a-f0-9]{6}$/i.test(v||"")?v:fallback;return new Vector3(...[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)/255));}
export function mountHeroWave(host,initialState){
 const canvas=document.createElement("canvas");canvas.className="hero-wave__canvas";canvas.setAttribute("aria-hidden","true");
 const renderer=new WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:"high-performance"});
 // Three.js r163+ requires WebGL2 in WebGLRenderer; capability flags may be absent.
 const gl=renderer.getContext();
 if(!gl.getExtension("EXT_color_buffer_float")&&!gl.getExtension("EXT_color_buffer_half_float")){renderer.dispose();throw new Error("Half float framebuffer unavailable");}
 renderer.setPixelRatio(1);renderer.toneMapping=NoToneMapping;host.append(canvas);
 const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,0,1),geometry=new PlaneGeometry(2,2);
 const mesh=new Mesh(geometry,new ShaderMaterial({vertexShader:vertex,fragmentShader:shade,depthTest:false,depthWrite:false}));mesh.frustumCulled=false;scene.add(mesh);
 const side=window.innerWidth<700?112:SIZE,texel=new Vector2(1/side,1/side),cursor=new Vector2(.55,.5);
 const makeTarget=()=>new WebGLRenderTarget(side,side,{type:HalfFloatType,minFilter:NearestFilter,magFilter:NearestFilter,wrapS:ClampToEdgeWrapping,wrapT:ClampToEdgeWrapping,depthBuffer:false,stencilBuffer:false});
 const pair=()=>({read:makeTarget(),write:makeTarget(),swap(){const a=this.read;this.read=this.write;this.write=a;},dispose(){this.read.dispose();this.write.dispose();}});
 const vel=pair(),press=pair(),height=pair(),div=makeTarget();
 const makePass=fragmentShader=>new ShaderMaterial({vertexShader:vertex,fragmentShader,depthTest:false,depthWrite:false,uniforms:{texel:{value:texel},dt:{value:1/30},cursor:{value:cursor},impulse:{value:0},velocity:{value:null},pressure:{value:null},divergence:{value:null},surface:{value:null}}});
 const ad=makePass(advect),dv=makePass(divergence),jac=makePass(jacobi),proj=makePass(project),wav=makePass(wave),screen=mesh.material;
 screen.uniforms={surface:{value:height.read.texture},texel:{value:texel},transmission:{value:1},daylight:{value:1},floorColor:{value:new Vector3()},deepColor:{value:new Vector3()},lightColor:{value:new Vector3()}};
 let state={...initialState},destroyed=false,visible=true,frame=0,last=0,impulse=.7,steps=0,lastPointerAt=0;
 const motion=window.matchMedia?.("(prefers-reduced-motion: reduce)");
 const running=()=>Boolean(state.animate)&&!motion?.matches&&visible&&!document.hidden;
 function pass(mat,target,inputs){
  mesh.material=mat;
  mat.uniforms.impulse.value=impulse;
  for(const [name,texture] of Object.entries(inputs))mat.uniforms[name].value=texture;
  renderer.setRenderTarget(target);renderer.render(scene,camera);
 }
 function draw(){if(destroyed)return;mesh.material=screen;screen.uniforms.surface.value=height.read.texture;renderer.setRenderTarget(null);renderer.render(scene,camera);}
 function step(){
  // Natural low-amplitude disturbances keep the surface alive without input.
  steps++;
  if(steps%38===0&&performance.now()-lastPointerAt>1400){
   cursor.set(.18+.64*(.5+.5*Math.sin(steps*.719)),.18+.64*(.5+.5*Math.cos(steps*.453)));
   impulse=.22;
  }
  pass(ad,vel.write,{velocity:vel.read.texture});vel.swap();
  pass(dv,div,{velocity:vel.read.texture});
  for(let i=0;i<ITERATIONS;i++){pass(jac,press.write,{pressure:press.read.texture,divergence:div.texture});press.swap();}
  pass(proj,vel.write,{velocity:vel.read.texture,pressure:press.read.texture});vel.swap();
  pass(wav,height.write,{surface:height.read.texture,velocity:vel.read.texture});height.swap();
  impulse=0;
 }
 function resize(){
  if(destroyed)return;
  const limit=window.innerWidth<700?720:1152;
  const scale=Math.min(window.devicePixelRatio||1,1.25,limit/Math.max(host.clientWidth,host.clientHeight,1));
  renderer.setSize(Math.max(1,Math.round(host.clientWidth*scale)),Math.max(1,Math.round(host.clientHeight*scale)),false);
  draw();
 }
 function tick(timestamp){
  frame=0;if(destroyed)return;
  if(last&&timestamp-last<1000/24){frame=requestAnimationFrame(tick);return;}
  last=timestamp;
  if(running())step();
  draw();if(running())frame=requestAnimationFrame(tick);
 }
 const request=()=>{if(!destroyed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);};
 function update(next){
  state={...state,...next};const dark=state.theme==="dark",colors=state.colors||["#07112b","#002080","#b1c5ff"];
  screen.uniforms.floorColor.value.copy(dark?new Vector3(.008,.026,.064):new Vector3(.035,.31,.41));
  screen.uniforms.deepColor.value.copy(dark?new Vector3(.003,.01,.034):new Vector3(.012,.12,.24));
  screen.uniforms.lightColor.value.copy(dark?new Vector3(.50,.69,1.):new Vector3(.86,.98,1.));
  screen.uniforms.daylight.value=dark?0:1;
  screen.uniforms.transmission.value=dark?.15:1.5;
  host.dataset.simulation="gpu-fluid-heightfield";host.dataset.waterTheme=dark?"dark":"light";
  draw();
  if(!running()&&frame){cancelAnimationFrame(frame);frame=0;}
  if(running())request();
 }
 function setPointer(x,y){
  const nx=Math.max(.01,Math.min(.99,(x+1)*.5)),ny=Math.max(.01,Math.min(.99,1-(y+1)*.5));
  const distance=Math.hypot(nx-cursor.x,ny-cursor.y);cursor.set(nx,ny);
  if(distance>.006)lastPointerAt=performance.now();
  if(distance>.006&&distance<.7&&running())impulse=Math.min(.9,distance*3.);
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
  vel.dispose();press.dispose();height.dispose();div.dispose();
  [ad,dv,jac,proj,wav,screen].forEach(x=>x.dispose());geometry.dispose();renderer.dispose();canvas.remove();
 }};
}