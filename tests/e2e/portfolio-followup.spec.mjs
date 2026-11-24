import { test, expect } from "@playwright/test";

test("shared frame, case metadata and home-only loader", async ({page}) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  for (const width of [320,390,1024,1440,1920]) {
    await page.setViewportSize({width,height:900});
    await page.goto("/");
    await expect(page.locator(".service-stack__card")).toHaveCount(5);
    const home = await page.evaluate(() => {
      const frame = document.querySelector(".home-landing").getBoundingClientRect();
      const cards = [...document.querySelectorAll(".service-stack__card")].map(el => el.getBoundingClientRect());
      return cards.every(r => Math.abs(r.left-frame.left)<2 && Math.abs(r.right-frame.right)<2);
    });
    expect(home).toBe(true);
    await expect(page.locator(".marquee__sep")).toHaveCount(0);
    await page.goto("/work/tedx-rsu.html");
    await expect(page.locator(".page-loader")).toHaveCount(0);
    await expect(page.locator(".metadata-strip dt")).toHaveText(["Year","Deliverables","Credits"]);
    const caseBounds = await page.evaluate(() => {
      const cover = document.querySelector(".case-cover").getBoundingClientRect();
      const title = document.querySelector(".case-cover h1").getBoundingClientRect();
      const back = document.querySelector(".case-back").getBoundingClientRect();
      return {center:Math.abs((title.top+title.bottom-cover.top-cover.bottom)/2), separated:back.bottom<=title.top+1, width:document.documentElement.scrollWidth};
    });
    expect(caseBounds.center).toBeLessThan(3);
    expect(caseBounds.separated).toBe(true);
    expect(caseBounds.width).toBeLessThanOrEqual(width+1);
    await expect(page.locator(".next-content .case-next__name")).toHaveCSS("text-align","right");
  }
});
