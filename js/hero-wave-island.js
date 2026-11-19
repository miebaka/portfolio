/* Minimal authored water-plane shader. Native WebGL replaces the entire
   scene-graph dependency; the semantic HTML hero remains the fallback. */
const MAX_AUTOPLAY_MS=2400, POINTER_WAKE_MS=650, FRAME_MS=1000/30;
const VERTEX="attribute vec2 aPosition;\nvarying vec2 vUv;\nvoid main(){vUv = aPosition * .5 + .5; gl_Position = vec4(aPosition,0.,1.);}";
const FRAGMENT="precision mediump float;\nuniform float uTime;\nuniform float uMotion;\nuniform vec2 uPointer;\nuniform vec2 uAspect;\nuniform vec3 uColorA;\nuniform vec3 uColorB;\nuniform vec3 uColorC;\nvarying vec2 vUv;\nvoid main() {\n vec2 p = (vUv - .5)*uAspect;\n float broad = sin(p.x*7.8+uTime*.43)*.38;\n float cross = sin(p.y*8.2-p.x*2.3-uTime*.31)*.26;\n float detail = sin((p.x+p.y)*18.+uTime*.20)*.07;\n float pointerLight = exp(-9.*distance(vUv,uPointer*.15+.5));\n float relief = (broad+cross+detail+pointerLight*.16)*uMotion;\n float fold = smoothstep(-.67,.67,relief);\n float sheen = pow(max(0.,1.-abs(relief)),6.)*.16;\n float edge = .10*(1.-smoothstep(0.,.6,distance(vUv,vec2(.55,.5))));\n vec3 color = mix(uColorA,uColorB,fold);\n color = mix(color,uColorC,clamp(sheen+edge+pointerLight*.12,0.,.32));\n gl_FragColor = vec4(color,1.);\n}";

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
   preserveDrawingBuffer:true,powerPreference:"low-power",
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
 let elapsed=0,lastFrame=0,wakeUntil=0,pointer=[0,0],nextPointer=[0,0];
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
   const width=Math.max(1,Math.round(host.clientWidth));
   const height=Math.max(1,Math.round(host.clientHeight));
   if(canvas.width!==width||canvas.height!==height){
     canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);
   }
   draw();
 };
 const shouldAnimate=()=>state.animate&&visible&&!document.hidden&&
    (elapsed<MAX_AUTOPLAY_MS||performance.now()<wakeUntil);
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
     if(state.animate)wakeUntil=performance.now()+POINTER_WAKE_MS;
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
