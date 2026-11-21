import {test,expect} from "@playwright/test";

test("Geist Sans typography roles and full-screen editorial Index are consistent on every viewport",async({page})=>{
 await page.goto("/index.html");
 const fonts=await page.evaluate(()=>{
  const get=selector=>getComputedStyle(document.querySelector(selector)).fontFamily;
  return {display:get(".home-landing h1"),body:get(".home-profile__introduction p:not(.home-profile__lead)"),label:get(".site-nav__menu-btn")};
 });
 expect(fonts.display).toContain("Geist Sans");
 expect(fonts.body).toContain("Geist Sans");
 expect(fonts.label).toContain("Geist Mono");
 const brand=page.getByRole("link",{name:/Miebaka Joshua, home/i});
 await expect(brand).toBeVisible();
 const menu=page.getByRole("button",{name:"Index",exact:true});
 await expect(menu).toBeVisible();
 await expect(page.locator(".site-nav__links")).toBeHidden();
 const menuBox=await menu.boundingBox();
 expect(menuBox.width).toBeGreaterThanOrEqual(44);
 expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(page.viewportSize().width);
 await menu.click();
 const dialog=page.getByRole("dialog",{name:"Index"});
 await expect(dialog).toBeVisible();
 const labels=dialog.locator(".site-index__link");
 await expect(labels).toHaveCount(5);
 for(const link of await labels.all())await expect(link).toHaveCSS("text-transform","uppercase");
 await page.keyboard.press("Escape");
 await expect(menu).toBeFocused();
});

test("One original interactive dot-matrix footer is present and theme-aware on key routes",async({page})=>{
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

test("Published project folders are readable at mobile and desktop widths", async ({page}) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({width, height: 900});
    await page.goto("/work.html");
    const bands = await page.locator(".project-folder__link").evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      const tab = node.querySelector(".project-folder__tab-title");
      return {display: getComputedStyle(node).display, width: rect.width, height: rect.height,
        title: tab?.textContent?.trim(), tabWidth: tab?.getBoundingClientRect().width || 0};
    }));
    expect(bands).toHaveLength(3);
    expect(bands.map(b => b.title)).toEqual(["Rivo Studio","TEDx Rivers State University","ChopBox"]);
    for (const band of bands) {
      expect(band.display).not.toBe("none");
      expect(band.width).toBeGreaterThan(120);
      expect(band.height).toBeGreaterThanOrEqual(44);
      expect(band.tabWidth).toBeGreaterThan(60);
    }
  }
});

test("404 recovery links remain valid from nested routes",async({page})=>{
 await page.goto("/404.html");
 const paths=await page.locator(".hero--404__copy a").evaluateAll(links=>links.map(link=>new URL(link.getAttribute("href"),"https://example.com/essays/missing.html").pathname));
 expect(paths).toEqual(["/work.html","/index.html","/contact.html"]);
 await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute("href","/styles/main.css");
});

test("What I Do has no numbers or card gradients and all UI labels are uppercase",async({page})=>{
 await page.goto("/index.html");
 const section=page.locator("#what-i-do");
 await expect(section.locator(".service-stack__card")).toHaveCount(5);
 await expect(section.locator(".service-journey__number,.service-stack__count")).toHaveCount(0);
 const visuals=await section.locator(".service-stack__card").evaluateAll(cards=>cards.map(card=>{
   const cs=getComputedStyle(card),pseudo=getComputedStyle(card,"::before");
   return {image:cs.backgroundImage,pseudo: pseudo.content,pseudoImage:pseudo.backgroundImage};
 }));
 for(const visual of visuals){
  expect(visual.image).toBe("none");
  expect(["none","normal"]).toContain(visual.pseudo);
  expect(visual.pseudoImage).toBe("none");
 }
 for(const selector of [".site-footer__eyebrow",".service-stack__tag"]){
  await expect(page.locator(selector).first()).toHaveCSS("text-transform","uppercase");
 }
});
test("Footer is a masked dot matrix, never an embossed relief", async ({page}) => {
  await page.goto("/index.html");
  const sig = page.locator(".site-footer__signature");
  const layers = await sig.evaluate(node => ({
    width: node.getBoundingClientRect().width,
    height: node.getBoundingClientRect().height,
    frontMask: getComputedStyle(node, "::before").maskImage,
    frontBackground: getComputedStyle(node, "::before").backgroundImage,
    backContent: getComputedStyle(node, "::after").content,
  }));
  expect(layers.width).toBeGreaterThan(200);
  expect(layers.height).toBeGreaterThan(100);
  expect(layers.frontMask).toContain("miebaka-joshua-script-name.svg");
  expect(layers.frontBackground).toContain("radial-gradient");
  expect(["none", "normal"]).toContain(layers.backContent);
  await sig.scrollIntoViewIfNeeded();
  await expect(sig.locator("canvas")).toHaveCount(1);
});
