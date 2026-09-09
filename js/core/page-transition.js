/* Species-specific boomslang transition: a slender taper, narrow neck,
   egg-shaped head, very large eyes, dark-edged green scales and a posteriorly
   travelling lateral wave in which the body follows the head's path. */
const KEY="miebaka-page-transition", DURATION=1750;
const getSaved=()=>{try{return JSON.parse(sessionStorage.getItem(KEY)||"null")}catch{return null}};
const setSaved=v=>{try{sessionStorage.setItem(KEY,JSON.stringify(v))}catch{}};
const clearSaved=()=>{try{sessionStorage.removeItem(KEY)}catch{}};

function isPageLink(a,e){
  if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute("download"))return false;
  const u=new URL(a.href,location.href);
  return u.origin===location.origin&&/\.html$/.test(u.pathname)&&u.href!==location.href&&!u.hash;
}

async function buildBoomslang(canvas){
  const T=await import("../vendor/three/three.module.min.js");
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping; renderer.toneMappingExposure=1.05;
  const scene=new T.Scene(), camera=new T.OrthographicCamera(-8,8,4.5,-4.5,.1,30); camera.position.z=12;

  const count=120, segmentGeometry=new T.SphereGeometry(1,14,10);
  const skin=new T.MeshPhysicalMaterial({color:0x416f32,roughness:.78,clearcoat:.05,clearcoatRoughness:.8});
  const body=new T.InstancedMesh(segmentGeometry,skin,count); body.instanceMatrix.setUsage(T.DynamicDrawUsage); body.frustumCulled=false;
  scene.add(body);

  const headGroup=new T.Group();
  const headMaterial=new T.MeshPhysicalMaterial({color:0x4a7937,roughness:.7,clearcoat:.08});
  const head=new T.Mesh(new T.SphereGeometry(1,32,20),headMaterial); head.scale.set(.56,.28,.235); headGroup.add(head);
  const irisMaterial=new T.MeshPhysicalMaterial({color:0xb79848,roughness:.42,clearcoat:.35});
  const pupilMaterial=new T.MeshBasicMaterial({color:0x080a07});
  for(const side of [-1,1]){
    const iris=new T.Mesh(new T.SphereGeometry(.09,18,12),irisMaterial); iris.position.set(.21,side*.215,.16); iris.scale.set(1,.9,.55); headGroup.add(iris);
    const pupil=new T.Mesh(new T.SphereGeometry(.043,12,8),pupilMaterial); pupil.position.set(.235,side*.222,.215); pupil.scale.set(.85,1,.4); headGroup.add(pupil);
  }
  scene.add(headGroup);

  const tongueMaterial=new T.LineBasicMaterial({color:0x4b1014}), tongueGeometry=new T.BufferGeometry(), tonguePositions=new Float32Array(18);
  tongueGeometry.setAttribute("position",new T.BufferAttribute(tonguePositions,3)); const tongue=new T.LineSegments(tongueGeometry,tongueMaterial); scene.add(tongue);
  scene.add(new T.HemisphereLight(0xf7f3e9,0x718057,2.4)); const key=new T.DirectionalLight(0xffffff,2.7); key.position.set(-2,5,9); scene.add(key);

  const matrix=new T.Matrix4(), quaternion=new T.Quaternion(), scale=new T.Vector3(), position=new T.Vector3(), zAxis=new T.Vector3(0,0,1); let extent=8;
  function resize(){const aspect=innerWidth/innerHeight,vertical=4.5;extent=vertical*aspect;camera.left=-extent;camera.right=extent;camera.top=vertical;camera.bottom=-vertical;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)}
  const pathY=(x,phase)=>Math.sin(x*1.34-phase)*.56+Math.sin(x*.52-phase*.62)*.1;
  function update(progress){
    const spacing=.11, bodyLength=(count-1)*spacing;
    const headX=-extent-1+progress*(extent*2+bodyLength+2.5),phase=progress*7.5;
    for(let i=0;i<count;i++){
      const x=headX-.42-i*spacing,y=pathY(x,phase),angle=Math.atan2(pathY(x+.04,phase)-y,.04),t=i/(count-1),neck=Math.min(1,i/12),radius=.155*(.42+.58*neck)*Math.pow(1-t,.7)+.028;
      position.set(x,y,Math.sin(i*.34-phase)*.028); quaternion.setFromAxisAngle(zAxis,angle); scale.set(Math.max(spacing*.9,radius*1.6),radius,radius*.92); matrix.compose(position,quaternion,scale); body.setMatrixAt(i,matrix);
    }
    body.instanceMatrix.needsUpdate=true;
    const headY=pathY(headX,phase),angle=Math.atan2(pathY(headX+.05,phase)-headY,.05); headGroup.position.set(headX,headY,.04); headGroup.rotation.z=angle;
    const flick=Math.sin(progress*Math.PI*10)>.66?.34:.08;
    tonguePositions.set([headX+.58,headY,0,headX+.58+flick,headY,0,headX+.58+flick,headY,0,headX+.74+flick,headY+.08,0,headX+.58+flick,headY,0,headX+.74+flick,headY-.08,0]); tongueGeometry.attributes.position.needsUpdate=true;
  }
  resize();
  return {resize,render:p=>{update(p);renderer.render(scene,camera)},dispose:()=>{segmentGeometry.dispose();skin.dispose();head.geometry.dispose();headMaterial.dispose();irisMaterial.dispose();pupilMaterial.dispose();tongueGeometry.dispose();tongueMaterial.dispose();renderer.dispose()}};
}

async function playTransition(direction){
  const overlay=document.createElement("div"); overlay.className=`page-transition page-transition--${direction}`; overlay.setAttribute("aria-hidden","true"); overlay.innerHTML='<div class="page-transition__veil"></div><canvas class="page-transition__canvas"></canvas>'; document.body.append(overlay);
  let snake; try{snake=await buildBoomslang(overlay.querySelector("canvas"))}catch{overlay.classList.add("page-transition--fallback")}
  const onResize=()=>snake?.resize(); addEventListener("resize",onResize); const start=performance.now(); overlay.getBoundingClientRect(); overlay.classList.add("is-running");
  return new Promise(resolve=>{function frame(now){const p=Math.min(1,(now-start)/DURATION),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;snake?.render(direction==="out"?e:Math.min(1,.18+e));if(p<1)requestAnimationFrame(frame);else{removeEventListener("resize",onResize);snake?.dispose();if(direction==="in")overlay.remove();resolve()}}requestAnimationFrame(frame)});
}

export function initPageTransition(){
  const reduce=matchMedia("(prefers-reduced-motion: reduce)"),saved=getSaved();
  if(saved&&saved.path===location.pathname&&Date.now()-saved.time<5000){clearSaved();if(!reduce.matches){document.documentElement.classList.add("page-is-entering");document.body.setAttribute("aria-busy","true");setTimeout(()=>{document.documentElement.classList.remove("page-is-entering");document.body.removeAttribute("aria-busy")},780)}}else clearSaved();
  document.addEventListener("click",async e=>{const a=e.target.closest("a[href]");if(!isPageLink(a,e)||reduce.matches)return;e.preventDefault();if(document.documentElement.classList.contains("page-is-leaving"))return;const destination=new URL(a.href,location.href);document.documentElement.classList.add("page-is-leaving");document.body.setAttribute("aria-busy","true");setSaved({path:destination.pathname,time:Date.now()});await playTransition("out");location.assign(destination.href)});
}
