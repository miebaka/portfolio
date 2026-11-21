import {test,expect} from "@playwright/test";

test("Home keeps the landing restrained and Selected Work list-only",async({page,isMobile})=>{
  await page.goto("/index.html");
  await expect(page.locator("body")).not.toContainText("Available for senior brand and marketing design roles");
  await expect(page.locator(".home-landing")).toHaveCSS("position","sticky");
  await expect(page.locator(".home-content")).toHaveCSS("position","relative");
  const badge=await page.locator(".home-landing").evaluate(node=>getComputedStyle(node,"::before").content);
  expect(["none","normal","\"none\""]).toContain(badge);
  await expect(page.locator('.work-view-controls [data-view="grid"]')).toHaveCount(0);
  await expect(page.locator(".home-project-list__title").first()).toHaveCSS("text-align",isMobile ? "left" : "center");
  await expect(page.getByRole("link",{name:/all work/i}).first()).toBeVisible();
});

test("What I Do uses full-bleed token-coloured cards without the green section",async({page})=>{
  await page.goto("/index.html");
  const section=page.locator("#what-i-do");
  const cards=section.locator(".service-stack__card");
  await expect(cards).toHaveCount(5);
  await expect(section.locator(".service-journey__number,.service-stack__count")).toHaveCount(0);
  const sizes=await page.evaluate(()=>{
    const wrapper=document.querySelector("#what-i-do");
    const card=wrapper.querySelector(".service-stack__card");
    return {viewport:innerWidth,width:card.getBoundingClientRect().width,
      sectionBg:getComputedStyle(wrapper).backgroundColor,bodyBg:getComputedStyle(document.body).backgroundColor};
  });
  expect(sizes.width).toBeGreaterThanOrEqual(sizes.viewport-2);
  expect(sizes.sectionBg).toBe(sizes.bodyBg);
  await expect(cards.first()).toHaveCSS("border-top-left-radius","0px");
});

test("Client marks are fitted mathematically without distortion",async({page})=>{
  await page.goto("/index.html");
  const logos=page.locator(".client-proof").first().locator(".marquee__item img");
  await expect(logos).toHaveCount(6);
  const geometry=await logos.evaluateAll(nodes=>nodes.map(node=>{
    const style=getComputedStyle(node),w=parseFloat(style.width),h=parseFloat(style.height);
    return {w,h,actual:w/h,source:node.getAttribute("width")/node.getAttribute("height")};
  }));
  geometry.forEach(({w,h,actual,source})=>{
    expect(w).toBeGreaterThan(30);
    expect(h).toBeGreaterThan(20);
    expect(Math.abs(actual/source)).toBeGreaterThan(.94);
    expect(Math.abs(actual/source)).toBeLessThan(1.06);
  });
});

test("Footer dot field is keyboard-operable after entering viewport",async({page})=>{
  await page.goto("/index.html");
  const field=page.locator(".site-footer__signature");
  await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("role","button");
  await expect(field).toHaveAttribute("tabindex","0");
  await field.focus();
  await expect(field).toBeFocused();
  await field.press("Enter");
  await expect(field.locator("canvas")).toHaveCount(1);
});
