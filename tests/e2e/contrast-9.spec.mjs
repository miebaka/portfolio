import { test, expect } from "@playwright/test";

const routes=["/index.html","/about.html","/work.html","/essays.html","/experiments.html","/contact.html","/process.html","/community.html","/accessibility.html","/privacy.html","/404.html","/work/tedx-rsu.html","/work/rivo.html","/work/chopbox.html","/work/kiki-joshua-notepad.html","/work/christian-poster-a-week.html","/essays/designing-for-disability-in-nigeria.html","/essays/when-the-swoosh-lost-its-soul.html"];

async function audit(page) {
  return page.evaluate(()=>{
    const canvas=document.createElement("canvas");canvas.width=canvas.height=1;
    const context=canvas.getContext("2d",{willReadFrequently:true});
    const rgba=color=>{context.clearRect(0,0,1,1);context.fillStyle=color;context.fillRect(0,0,1,1);return [...context.getImageData(0,0,1,1).data].map(v=>v/255);};
    const composite=(a,b)=>{const alpha=a[3]+b[3]*(1-a[3]);return [...a.slice(0,3).map((v,i)=>alpha?(v*a[3]+b[i]*b[3]*(1-a[3]))/alpha:0),alpha];};
    const lum=rgb=>rgb.slice(0,3).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
    const issues=[],unmeasured=[];let checked=0;
    for(const el of document.querySelectorAll("body *")){
      if(el.closest("[hidden],[inert],[aria-hidden=true],svg,canvas,script,style,template,:disabled") || !el.getClientRects().length)continue;
      if(![...el.childNodes].some(node=>node.nodeType===3&&node.textContent.trim()))continue;
      const style=getComputedStyle(el);
      if(style.visibility!=="visible"||style.display==="none")continue;
      let background=[0,0,0,0],complex=false,opacity=1;
      for(let node=el;node&&background[3]<.999;node=node.parentElement){
        const css=getComputedStyle(node);opacity*=Number(css.opacity);
        if(css.backgroundImage!=="none"){complex=true;break;}
        background=composite(background,rgba(css.backgroundColor));
      }
      const label=el.tagName+"."+String(el.className).slice(0,120)+" "+el.textContent.trim().slice(0,60);
      if(complex||background[3]<.999){unmeasured.push(label);continue;}
      if(opacity===0)continue;
      const fg=rgba(style.color);fg[3]*=opacity;
      const a=lum(composite(fg,background)),b=lum(background);
      const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      checked++;
      if(ratio<9)issues.push({label,ratio:Number(ratio.toFixed(2))});
    }
    return {checked,issues,unmeasured};
  });
}
for(const route of routes){
  test("9:1 solid-surface contrast: "+route,async({page},testInfo)=>{
    const failures=[];
    for(const colorScheme of ["light","dark"]){
      await page.emulateMedia({colorScheme,reducedMotion:"reduce"});
      await page.goto(route);
      await page.locator("body").waitFor();
      const report=await audit(page);
      await testInfo.attach(colorScheme+" contrast",{body:JSON.stringify(report,null,2),contentType:"application/json"});
      expect(report.checked).toBeGreaterThan(0);
      failures.push(...report.issues.map(issue=>({colorScheme,...issue})));
    }
    expect(failures,"Solid-surface text below 9:1. Image/gradient surfaces require separate manual testing.").toEqual([]);
  });
}
