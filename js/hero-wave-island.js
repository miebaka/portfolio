/* Minimal authored water-plane shader. Native WebGL replaces the entire
   scene-graph dependency; the semantic HTML hero remains the fallback. */
const FRAME_MS=1000/30;
const VERTEX="attribute vec2 aPosition;\nvarying vec2 vUv;\nvoid main(){vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition,0.,1.);}";
const FRAGMENT="precision highp float;\nuniform float uTime;\nuniform float uMotion;\nuniform vec2 uPointer;\nuniform vec2 uAspect;\nuniform vec3 uColorA;\nuniform vec3 uColorB;\nuniform vec3 uColorC;\nvarying vec2 vUv;\n\nvec2 hash22(vec2 p) {\n  vec2 q=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));\n  return fract(sin(q)*43758.5453);\n}\n\n// F2-F1 produces interconnected luminous seams rather than flat moving waves.\nfloat network(vec2 p,float t) {\n  vec2 cell=floor(p),local=fract(p);\n  float f1=10.0,f2=10.0;\n  for(int y=-1;y<=1;y++){\n    for(int x=-1;x<=1;x++){\n      vec2 offset=vec2(float(x),float(y));\n      vec2 seed=hash22(cell+offset);\n      vec2 feature=offset+0.5+0.32*sin(seed*6.2831853+vec2(t*0.71,-t*0.56));\n      vec2 delta=feature-local;\n      float d=dot(delta,delta);\n      if(d<f1){f2=f1;f1=d;}\n      else if(d<f2){f2=d;}\n    }\n  }\n  float seam=sqrt(f2)-sqrt(f1);\n  float core=1.0-smoothstep(0.015,0.095,seam);\n  float halo=1.0-smoothstep(0.025,0.26,seam);\n  return core*0.76+halo*0.24;\n}\n\nvoid main(){\n  vec2 p=(vUv-0.5)*uAspect;\n  float t=uTime*0.21;\n  vec2 warp=0.075*vec2(\n    sin(p.y*4.2+t*1.1)+0.5*sin(p.x*6.1-t*0.7),\n    cos(p.x*3.8-t*0.9)+0.5*cos(p.y*5.7+t*0.6)\n  );\n  vec2 q=p+warp;\n  float broad=network(q*3.5+vec2(2.3,0.8),t);\n  float detail=network(q*6.0+vec2(9.4,3.7),-t*0.73);\n  float caustic=broad*0.74+detail*0.26;\n  // Preserve a dim field around the headline; concentrate the light off-centre.\n  float envelope=1.0-smoothstep(0.27,1.25,length(p-vec2(0.25,0.09)));\n  float textShield=1.0-0.58*exp(-pow((vUv.y-0.28)/0.18,2.0));\n  float cursor=exp(-12.0*distance(vUv,0.5+uPointer*0.15));\n  float intensity=clamp((caustic*0.24*envelope*textShield+cursor*0.025)*uMotion,0.0,0.28);\n  vec3 base=mix(uColorA,uColorB,0.18+0.12*(p.y+0.5));\n  vec3 color=mix(base,uColorC,intensity);\n  gl_FragColor=vec4(color,1.0);\n}";

const compile=(gl,type,source)=>{
 const shader=gl.createShader(type);
 gl.shaderSource(shader,source);
 gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
   const message=gl.getShaderInfoLog(shader)||"Shader compilation failed";
   gl.deleteShader(shader);
   throw new Error(message);
 }
 return shader;
};
const rgb=(value,fallback)=>{
 const color=String(value||"").trim();
 const hex=/^#([0-9a-f]{6})$/i.exec(color);
 if(hex) return [0,2,4].map(index=>parseInt(hex[1].slice(index,index+2),16)/255);
 const css=/^rgba?\(\s*(\d+)[ ,]+\s*(\d+)[ ,]+\s*(\d+)/i.exec(color);
 return css?css.slice(1,4).map(channel=>Math.min(255,Number(channel))/255):fallback;
};

export function mountHeroWave(host,initialState){
 const canvas=document.createElement("canvas");
 canvas.className="hero-wave__canvas";
 canvas.setAttribute("aria-hidden","true");
 const gl=canvas.getContext("webgl",{
   alpha:false,antialias:false,depth:false,stencil:false,
   preserveDrawingBuffer:false,powerPreference:"low-power",
 });
 if(!gl) throw new Error("WebGL is unavailable");
 const vertex=compile(gl,gl.VERTEX_SHADER,VERTEX);
 const fragment=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT);
 const program=gl.createProgram();
 gl.attachShader(program,vertex);
 gl.attachShader(program,fragment);
 gl.linkProgram(program);
 gl.deleteShader(vertex);
 gl.deleteShader(fragment);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))
   throw new Error(gl.getProgramInfoLog(program)||"Shader link failed");
 gl.useProgram(program);
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,"aPosition");
 gl.enableVertexAttribArray(position);
 gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const names=["uTime","uMotion","uPointer","uAspect","uColorA","uColorB","uColorC"];
 const uniforms=Object.fromEntries(names.map(name=>[name,gl.getUniformLocation(program,name)]));
 host.append(canvas);
 let state={...initialState},visible=true,destroyed=false,frame=0;
 let elapsed=0,lastFrame=0,pointer=[0,0],nextPointer=[0,0];
 const palette=()=>{
   const values=state.colors||[];
   const fallbacks=[[7/255,17/255,43/255],[0,32/255,128/255],[177/255,197/255,1]];
   ["uColorA","uColorB","uColorC"].forEach((name,index)=>{
     gl.uniform3fv(uniforms[name],rgb(values[index],fallbacks[index]));
   });
 };
 const draw=()=>{
   if(destroyed)return;
   gl.useProgram(program);
   gl.uniform1f(uniforms.uTime,elapsed/1000);
   gl.uniform1f(uniforms.uMotion,state.animate?1:.72);
   gl.uniform2fv(uniforms.uPointer,pointer);
   gl.uniform2fv(uniforms.uAspect,[canvas.width/canvas.height,1]);
   palette();
   gl.drawArrays(gl.TRIANGLES,0,6);
 };
 const resize=()=>{
   if(destroyed)return;
   const pixelRatio=Math.min(window.devicePixelRatio||1,1.25);
   const scale=Math.min(pixelRatio,1600/Math.max(host.clientWidth,host.clientHeight,1));
   const width=Math.max(1,Math.round(host.clientWidth*scale));
   const height=Math.max(1,Math.round(host.clientHeight*scale));
   if(canvas.width!==width||canvas.height!==height){
     canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);
   }
   draw();
 };
 const shouldAnimate=()=>state.animate&&visible&&!document.hidden;
 const renderFrame=timestamp=>{
   frame=0;
   if(destroyed)return;
   if(lastFrame&&timestamp-lastFrame<FRAME_MS){
     frame=requestAnimationFrame(renderFrame);return;
   }
   const delta=lastFrame?Math.min(timestamp-lastFrame,50):FRAME_MS;
   lastFrame=timestamp;
   if(shouldAnimate())elapsed+=delta;
   pointer=pointer.map((value,index)=>value+(nextPointer[index]-value)*.15);
   draw();
   if(shouldAnimate())frame=requestAnimationFrame(renderFrame);
 };
 const requestRender=()=>{
   if(!destroyed&&!frame&&visible&&!document.hidden)frame=requestAnimationFrame(renderFrame);
 };
 const resizeObserver=new ResizeObserver(resize);
 resizeObserver.observe(host);
 const intersectionObserver=new IntersectionObserver(([entry])=>{
   visible=Boolean(entry?.isIntersecting);
   if(visible)requestRender();
   else if(frame){cancelAnimationFrame(frame);frame=0;lastFrame=0;}
 },{threshold:.01});
 intersectionObserver.observe(host);
 resize();
 requestRender();
 return {
   ready:Promise.resolve(),
   update(next){
     state={...state,...next};draw();
     if(!state.animate&&frame){cancelAnimationFrame(frame);frame=0;}
     if(state.animate)requestRender();
   },
   setPointer(x,y){
     nextPointer=[x,y];
       requestRender();
   },
   destroy(){
     if(destroyed)return;
     destroyed=true;
     if(frame)cancelAnimationFrame(frame);
     resizeObserver.disconnect();
     intersectionObserver.disconnect();
     gl.deleteBuffer(buffer);
     gl.deleteProgram(program);
     gl.getExtension("WEBGL_lose_context")?.loseContext();
     canvas.remove();
   },
 };
}
