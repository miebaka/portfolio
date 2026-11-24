import {test,expect} from "@playwright/test";

const widths=[320,390,768,1024,1440,1920];
const routes=[
  ["/",[".home-landing","#selected-work",".service-stack__card",".home-beyond"]],
  ["/work.html",[".project-archive"]],
  ["/about.html",[".about-hero",".service-stack__card"]],
  ["/essays.html",["main > .hero"]],
  ["/essays/designing-for-disability-in-nigeria.html",[".article-hero",".article-reading"]],
  ["/work/tedx-rsu.html",[".metadata-strip",".article-reading"]],
  ["/experiments.html",[".experiments-spatial"]],
  ["/contact.html",[".contact-page"]],
  ["/process.html",["main > .hero"]]
];
const near=(a,b)=>Math.abs(a-b)<2;
test("editorial geometry follows the shared fluid frame and rhythm",async({page},testInfo)=>{
  test.setTimeout(180000);
  for(const colorScheme of ["light","dark"]){
    await page.emulateMedia({colorScheme,reducedMotion:"reduce"});
    for(const width of widths){
      await page.setViewportSize({width,height:900});
      for(const [route,selectors] of routes){
        const response=await page.goto(route,{waitUntil:"domcontentloaded"});
        expect(response?.ok(),route).toBe(true);
        await page.evaluate(()=>document.fonts.ready);
        const geometry=await page.evaluate(({selectors})=>{
          const frame=document.querySelector(".site-nav__inner").getBoundingClientRect();
          return {
            frame:{left:frame.left,right:frame.right,width:frame.width},
            viewport:document.documentElement.clientWidth,
            overflow:document.documentElement.scrollWidth,
            elements:selectors.flatMap(selector=>[...document.querySelectorAll(selector)].map(el=>{const r=el.getBoundingClientRect();return {selector,left:r.left,right:r.right,width:r.width}}))
          };
        },{selectors});
        expect(geometry.overflow,route+" "+width).toBeLessThanOrEqual(geometry.viewport+1);
        const gutter=20+36*Math.min(1,Math.max(0,(width-320)/1120));
        const expectedWidth=Math.min(width-2*gutter,1600);
        expect(near(geometry.frame.width,expectedWidth),route+" frame "+width).toBe(true);
        for(const element of geometry.elements){
          expect(near(element.left,geometry.frame.left)&&near(element.right,geometry.frame.right),route+" "+width+" "+element.selector).toBe(true);
        }
        if(route==="/"){
          const gaps=await page.evaluate(()=>({
            a:parseFloat(getComputedStyle(document.querySelector(".disciplines-heading")).marginBottom),
            b:parseFloat(getComputedStyle(document.querySelector(".home-beyond__grid")).marginTop),
            section:parseFloat(getComputedStyle(document.querySelector(".home-content")).rowGap)
          }));
          expect(near(gaps.a,gaps.b)).toBe(true);
          expect(near(gaps.a,24+8*Math.min(1,(width-320)/1120))).toBe(true);
          expect(near(gaps.section,64+32*Math.min(1,(width-320)/1120))).toBe(true);
        }
        if(route.includes("/essays/")){
          const ratio=await page.locator(".article-body").evaluate(el=>{const s=getComputedStyle(el);return parseFloat(s.lineHeight)/parseFloat(s.fontSize)});
          expect(ratio).toBeCloseTo(1.6,1);
        }
        if(route.startsWith("/work/")){
          const cover=await page.locator(".case-cover").boundingBox();
          expect(cover?.x).toBeCloseTo(0,0);
          expect(cover?.width).toBeCloseTo(width,0);
        }
      }
    }
  }
});

test("reading and contact layouts reflow with larger user text and custom spacing",async({page})=>{
  await page.setViewportSize({width:320,height:850});
  await page.emulateMedia({reducedMotion:"reduce"});
  for(const route of ["/","/essays/designing-for-disability-in-nigeria.html","/contact.html"]){
    await page.goto(route);
    await page.addStyleTag({content:"html{font-size:125%} *{line-height:1.5 !important;letter-spacing:.12em !important;word-spacing:.16em !important} p{margin-bottom:2em !important}"});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(321);
    if(route==="/contact.html") {
      const bounds=await page.locator(".contact__form").boundingBox();
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x+bounds.width).toBeLessThanOrEqual(321);
    }
  }
});
