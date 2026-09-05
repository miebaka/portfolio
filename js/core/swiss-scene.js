/* Progressive Three.js enhancement. Content never waits for WebGL. */
export async function initSwissScene() {
  const host = document.querySelector('[data-swiss-scene]');
  if (!host) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  // Keep the authored SVG for reduced motion and data-saving connections.
  if (motion.matches || navigator.connection?.saveData) return;
  let renderer;
  try {
    const THREE = await import('../vendor/three/three.module.min.js');
    if (!host.isConnected || motion.matches) return;
    renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true, powerPreference:'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setClearColor(0x000000,0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.setAttribute('aria-hidden','true');
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32,1,.1,30);
    camera.position.set(0,0,7.4);
    const sculpture = new THREE.Group();
    scene.add(sculpture);
    // A stack of rounded rectangular loops: a grid released into three dimensions.
    const shape = new THREE.Shape();
    const w=1.34,h=.88,r=.26;
    shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);
    shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);
    shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
    const hole = new THREE.Path();
    const a=1.04,b=.58,q=.18;
    hole.moveTo(-a+q,-b);hole.quadraticCurveTo(-a,-b,-a,-b+q);hole.lineTo(-a,b-q);hole.quadraticCurveTo(-a,b,-a+q,b);hole.lineTo(a-q,b);hole.quadraticCurveTo(a,b,a,b-q);hole.lineTo(a,-b+q);hole.quadraticCurveTo(a,-b,a-q,-b);hole.lineTo(-a+q,-b);
    shape.holes.push(hole);
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:16});
    geometry.center();
    const material = new THREE.MeshPhysicalMaterial({color:0x1649ed,metalness:.32,roughness:.24,clearcoat:1,clearcoatRoughness:.2});
    const plates=[];
    for (let i=0;i<13;i++) {
      const mesh = new THREE.Mesh(geometry,material);
      mesh.position.z=(i-6)*.12;
      mesh.rotation.z=(i-6)*.085;
      sculpture.add(mesh);plates.push(mesh);
    }
    scene.add(new THREE.HemisphereLight(0xffffff,0x6979ab,1.6));
    const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,5);scene.add(key);
    const rim=new THREE.DirectionalLight(0x9fbaff,4);rim.position.set(4,-2,-3);scene.add(rim);
    const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(3,1,4);scene.add(fill);
    let pointer={x:0,y:0}, raf=0, visible=true, paused=false, destroyed=false, phase=0, previous=0;
    const button=host.parentElement.querySelector('.scene-toggle');
    button.hidden=false;
    function render(time=0) {
      raf=0;
      if(destroyed) return;
      const dt=previous ? Math.min((time-previous)/1000,.05) : 0;previous=time;
      if (!paused) phase+=dt;
      const targetY=-.45+pointer.x*.3+Math.sin(phase*.25)*.13;
      const targetX=-.35+pointer.y*.18;
      sculpture.rotation.y+=(targetY-sculpture.rotation.y)*.06;
      sculpture.rotation.x+=(targetX-sculpture.rotation.x)*.06;
      sculpture.rotation.z=-.32;
      plates.forEach((plate,i)=>{plate.rotation.z=(i-6)*(.09+Math.sin(phase*.4)*.035)});
      renderer.render(scene,camera);
      host.classList.add('scene-ready');
      if(visible && !document.hidden && !paused && !motion.matches) raf=requestAnimationFrame(render);
    }
    function start(){previous=0;if(!raf&&!destroyed&&visible&&!document.hidden&&!paused&&!motion.matches) raf=requestAnimationFrame(render)}
    function stop(){cancelAnimationFrame(raf);raf=0;previous=0}
    function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=width<400?8.5:7.4;camera.updateProjectionMatrix();renderer.render(scene,camera)}
    const observer=new ResizeObserver(resize);observer.observe(host);
    const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else stop()});intersection.observe(host);
    const move=e=>{const box=host.getBoundingClientRect();pointer={x:(e.clientX-box.left)/box.width*2-1,y:(e.clientY-box.top)/box.height*2-1}};
    const leave=()=>{pointer={x:0,y:0}};
    const visibility=()=>{if(document.hidden)stop();else start()};
    const changeMotion=()=>{if(motion.matches){stop();host.classList.remove('scene-ready');renderer.domElement.hidden=true;button.hidden=true}else{renderer.domElement.hidden=false;button.hidden=false;start()}};
    const toggle=()=>{paused=!paused;button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));if(paused)stop();else start()};
    function destroy(){destroyed=true;stop();observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);motion.removeEventListener('change',changeMotion);host.removeEventListener('pointermove',move);host.removeEventListener('pointerleave',leave);button.removeEventListener('click',toggle);geometry.dispose();material.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('scene-ready');button.hidden=true}
    host.addEventListener('pointermove',move,{passive:true});host.addEventListener('pointerleave',leave);
    button.addEventListener('click',toggle);document.addEventListener('visibilitychange',visibility);motion.addEventListener('change',changeMotion);
    renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();destroy()},{once:true});
    window.addEventListener('pagehide',event=>{if(event.persisted)stop();else destroy()});
    window.addEventListener('pageshow',event=>{if(event.persisted)start()});
    sculpture.rotation.set(-.35,-.45,-.32);resize();start();
  } catch {
    renderer?.dispose();renderer?.domElement.remove();host.classList.remove('scene-ready');
  }
}
