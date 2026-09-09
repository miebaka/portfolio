/* The homepage logo is the only 3D object. A shared renderer also paints
   a flat, glyph-masked colour fill over the selected-work names on interaction. */
export async function initSwissScene() {
  const hosts = [...document.querySelectorAll('[data-swiss-scene]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!hosts.length || motion.matches || navigator.connection?.saveData) return;
  // Pages whose only scene is in the footer do not download Three until needed.
  await new Promise(resolve => {
    const preload = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { preload.disconnect(); resolve(); }
    }, { rootMargin: '180px' });
    hosts.forEach(host => preload.observe(host));
  });
  if (motion.matches || !hosts[0].isConnected) return;
  let renderer, cleanup = () => {};
  try {
    const T = await import('../vendor/three/three.module.min.js');
    if (motion.matches) return;
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const canvas = renderer.domElement;
    canvas.className = 'enquiry-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);

    // Authored light cards produce a lacquered surface without an HDR download.
    const studio = new T.Scene();
    studio.background = new T.Color(0x70665a);
    const cards = [];
    [[-4, 3, 4, 4, 7], [3, 4, 1, 5, 3], [2, -3, -4, 2, 7]].forEach(([x,y,z,w,h]) => {
      const card = new T.Mesh(new T.PlaneGeometry(w,h), new T.MeshBasicMaterial({color:new T.Color(4,4,4), side:T.DoubleSide}));
      card.position.set(x,y,z); card.lookAt(0,0,0); studio.add(card); cards.push(card);
    });
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, .02);
    cards.forEach(card => {card.geometry.dispose();card.material.dispose();});
    pmrem.dispose();
    const material = new T.MeshPhysicalMaterial({color:0xc2531c, metalness:.62, roughness:.23, clearcoat:1, clearcoatRoughness:.16, envMap:environment.texture, envMapIntensity:1.25});
    const { SVGLoader } = await import('../vendor/three/SVGLoader.js');
    const response = await fetch(new URL('../../assets/images/miebaka-joshua-logo.svg', import.meta.url));
    if (!response.ok) throw new Error('Logo unavailable');
    const logo = new SVGLoader().parse(await response.text());
    const geometries = logo.paths.flatMap(path => SVGLoader.createShapes(path)).map(shape => {
      const geometry = new T.ExtrudeGeometry(shape, {depth:34,bevelEnabled:true,bevelThickness:1.5,bevelSize:1.1,bevelSegments:3,curveSegments:14,steps:1});
      geometry.translate(-200,-200,-17);
      geometry.scale(.011,.011,.011);
      geometry.rotateX(Math.PI);
      return geometry;
    });
    let paused = false;
    try { paused = sessionStorage.getItem('enquiry-paused') === 'true'; } catch {}
    let frame = 0, previous = 0, phase = 0, disposed = false, inPage = true;
    const removers = [];
    function on(target,event,fn,options) {target.addEventListener(event,fn,options);removers.push(() => target.removeEventListener(event,fn,options));}
    const views = hosts.map(host => {
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(34,1,.1,40);
      const group = new T.Group();
      geometries.forEach(geometry => group.add(new T.Mesh(geometry,material)));
      group.rotation.set(.12,-.3,0);
      scene.add(group,new T.HemisphereLight(0xffffff,0x665344,1.5));
      const key=new T.DirectionalLight(0xffffff,2);key.position.set(-2,4,5);scene.add(key);
      const view = {host,scene,camera,group,pointer:{x:0,y:0}};
      on(host,'pointermove',event => {const r=host.getBoundingClientRect();view.pointer.x=((event.clientX-r.left)/r.width-.5)*2;view.pointer.y=((event.clientY-r.top)/r.height-.5)*2;request();},{passive:true});
      on(host,'pointerleave',() => {view.pointer.x=0;view.pointer.y=0;request();});
      return view;
    });
    const buttons=[...document.querySelectorAll('.scene-toggle')];
    function syncButtons() {buttons.forEach(button => {button.hidden=motion.matches;button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(paused));});}
    buttons.forEach(button => on(button,'click',() => {paused=!paused;try{sessionStorage.setItem('enquiry-paused',String(paused));}catch{}syncButtons();request();}));
    const textViews = [];
    await document.fonts.ready;
    for (const host of document.querySelectorAll('.swiss-work-name')) {
      const row=host.closest('a'); if(!row) continue;
      const textureCanvas=document.createElement('canvas');
      const maskContext=textureCanvas.getContext('2d');
      if(!maskContext || !('letterSpacing' in maskContext)) continue;
      const texture=new T.CanvasTexture(textureCanvas);
      const uniforms={mask:{value:texture},progress:{value:0},time:{value:0},ink:{value:new T.Color(host.dataset.fillColor)}};
      const shader=new T.ShaderMaterial({transparent:true,depthTest:false,uniforms,
        vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
        fragmentShader:`uniform sampler2D mask; uniform float progress; uniform float time; uniform vec3 ink; varying vec2 vUv;
          void main(){float glyph=texture2D(mask,vUv).a;
          float edge=progress*1.35-.16 + sin(vUv.y*11.+time*2.)*.065*sin(progress*3.14159);
          float fill=1.-smoothstep(edge-.035,edge+.035,vUv.x);
          gl_FragColor=vec4(ink,glyph*fill);
          #include <colorspace_fragment>
        }`});
      const scene=new T.Scene();const geometry=new T.PlaneGeometry(2,2);scene.add(new T.Mesh(geometry,shader));
      const view={host,scene,camera:new T.Camera(),uniforms,texture,textureCanvas,shader,geometry,active:row.matches(':hover') || document.activeElement===row,progress:0,width:0,height:0};
      const enter=()=>{view.active=true;request();};const leave=()=>{view.active=false;request();};
      on(row,'pointerenter',enter);on(row,'pointerleave',leave);on(row,'focus',enter);on(row,'blur',leave);
      host.classList.add('webgl-fill');textViews.push(view);
    }
    function updateMask(view,r) {
      if(view.width===r.width&&view.height===r.height)return;
      view.width=r.width;view.height=r.height;
      const ctx=view.textureCanvas.getContext('2d');const scale=2;
      view.textureCanvas.width=Math.ceil(r.width*scale);view.textureCanvas.height=Math.ceil(r.height*scale);
      ctx.scale(scale,scale);
      const style=getComputedStyle(view.host),size=parseFloat(style.fontSize);
      ctx.font=style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
      ctx.letterSpacing=style.letterSpacing;ctx.fillStyle='#fff';ctx.textBaseline='alphabetic';
      const m=ctx.measureText(view.host.textContent);
      const ascent=m.fontBoundingBoxAscent??size*.8,descent=m.fontBoundingBoxDescent??size*.2;
      ctx.fillText(view.host.textContent,0,(r.height-ascent-descent)/2+ascent);
      view.texture.needsUpdate=true;
    }
    function request() {if(!frame && !disposed && !document.hidden && inPage) frame=requestAnimationFrame(draw);}
    function draw(time) {
      frame=0;
      if(disposed) return;
      const dt=previous?Math.min((time-previous)/1000,.05):0;previous=time;
      if(!paused&&!motion.matches) phase+=dt;
      renderer.setScissorTest(false);renderer.clear();renderer.setScissorTest(true);
      let anyVisible=false;
      const width=window.innerWidth,height=window.innerHeight;
      for(const view of [...views,...textViews]) {
        if(view.uniforms) {
          const target=view.active?1:0;
          view.progress+=(target-view.progress)*.12;
          if(Math.abs(target-view.progress)<.001)view.progress=target;
          view.uniforms.progress.value=view.progress;view.uniforms.time.value=time/1000;
        }
        const r=view.host.getBoundingClientRect();
        if(r.bottom<=0||r.top>=height||r.right<=0||r.left>=width||!r.width||!r.height) continue;
        if(!view.uniforms)anyVisible=true;
        if(view.uniforms) {
          updateMask(view,r);

        } else if(!paused&&!motion.matches) {
          view.group.rotation.y += (-.24+view.pointer.x*.45+Math.sin(phase*.22)*.15-view.group.rotation.y)*.07;
          view.group.rotation.x += (view.pointer.y*.25-view.group.rotation.x)*.07;
          view.group.rotation.z = Math.sin(phase*.18)*.045;
        }
        if(!view.uniforms) { view.camera.aspect=r.width/r.height;
        view.camera.position.z= Math.max(8.8, 5.1/(2*Math.tan(17*Math.PI/180)*view.camera.aspect));
        view.camera.updateProjectionMatrix(); }
        renderer.setViewport(r.left,height-r.bottom,r.width,r.height);
        renderer.setScissor(Math.max(0,r.left),Math.max(0,height-r.bottom),Math.min(width,r.right)-Math.max(0,r.left),Math.min(height,r.bottom)-Math.max(0,r.top));
        renderer.render(view.scene,view.camera);
        if(!view.uniforms)view.host.classList.toggle('scene-ready',!motion.matches);
      }
      if(!motion.matches && ((anyVisible&&!paused) || textViews.some(view=>view.progress!==(view.active?1:0)))) request();
    }
    function resize() {renderer.setSize(window.innerWidth,window.innerHeight,false);request();}
    const observer=new ResizeObserver(request);hosts.forEach(host => observer.observe(host));
    on(window,'resize',resize,{passive:true});on(window,'scroll',request,{passive:true});
    on(document,'visibilitychange',() => {previous=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
    on(motion,'change',() => {canvas.hidden=motion.matches;hosts.forEach(host=>host.classList.remove('scene-ready'));textViews.forEach(view=>view.host.classList.toggle('webgl-fill',!motion.matches));syncButtons();request();});
    cleanup = () => {
      if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer.disconnect();removers.forEach(remove=>remove());
      geometries.forEach(geometry=>geometry.dispose());textViews.forEach(view=>{view.texture.dispose();view.shader.dispose();view.geometry.dispose();view.host.classList.remove('webgl-fill');});material.dispose();environment.dispose();renderer.dispose();canvas.remove();hosts.forEach(host=>host.classList.remove('scene-ready'));buttons.forEach(button=>button.hidden=true);
    };
    on(canvas,'webglcontextlost',event => {event.preventDefault();cleanup();});
    on(window,'pagehide',event => {inPage=false;if(event.persisted){cancelAnimationFrame(frame);frame=0;}else cleanup();});
    on(window,'pageshow',event => {if(event.persisted){inPage=true;previous=0;request();}});
    syncButtons();resize();
  } catch {
    cleanup();renderer?.dispose();renderer?.domElement.remove();hosts.forEach(host=>host.classList.remove('scene-ready'));
  }
}
