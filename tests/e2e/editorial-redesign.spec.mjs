import {test,expect} from "@playwright/test";

test("Geist typography roles and reference-centered desktop navigation",async({page,isMobile})=>{
 await page.goto("/index.html");
 const fonts=await page.evaluate(()=>{
  const get=selector=>getComputedStyle(document.querySelector(selector)).fontFamily;
  return {display:get(".home-landing h1"),body:get(".home-profile__introduction p:not(.home-profile__lead)"),label:get(".site-nav__link")};
 });
 expect(fonts.display).toContain("Geist Serif");
 expect(fonts.body).toContain("Geist Sans");
 expect(fonts.label).toContain("Geist Mono");
 const navigation=page.locator(".site-nav__links");
 if(!isMobile){
  await expect(navigation).toBeVisible();
  const box=await navigation.boundingBox();
  const viewport=page.viewportSize();
  expect(Math.abs(box.x+box.width/2-viewport.width/2)).toBeLessThanOrEqual(3);
  expect(box.height).toBeGreaterThanOrEqual(60);
  expect(box.height).toBeLessThan(72);
 }else{
  await expect(page.locator(".site-nav__menu-btn")).toBeVisible();
 }
});

test("One original embossed footer is present and theme-aware on key routes",async({page})=>{
 for(const route of ["/index.html","/work.html","/about.html","/essays.html","/contact.html"]){
  await page.goto(route);
  const footer=page.locator(".site-footer");
  await expect(footer.locator(".site-footer__statement")).toContainText("Ideas made unmistakable");
  await expect(footer.locator(".site-footer__start")).toHaveAttribute("href",/mailto:/);
  await expect(footer.locator(".site-footer__signature")).toHaveCount(1);
  const mask=await footer.locator(".site-footer__signature").evaluate(node=>getComputedStyle(node,"::before").maskImage);
  expect(mask).toContain("miebaka-joshua-script-name.svg");
  const getColors=()=>page.evaluate(()=>{
    const root=document.body,footer=document.querySelector(".site-footer");
    return {body:getComputedStyle(root).backgroundColor,footer:getComputedStyle(footer).backgroundColor};
  });
  const light=await getColors();expect(light.footer).toBe(light.body);
  await page.evaluate(()=>document.documentElement.setAttribute("data-theme","dark"));
  const dark=await getColors();expect(dark.footer).toBe(dark.body);
  await page.evaluate(()=>document.documentElement.setAttribute("data-theme","light"));
 }
});

test("Magazine grid is twelve columns on desktop and four on mobile",async({page,isMobile})=>{
 await page.goto("/index.html");
 const columns=await page.locator(".home-profile").evaluate(node=>getComputedStyle(node).gridTemplateColumns.split(" ").filter(Boolean).length);
 expect(columns).toBe(isMobile?4:12);
});
