import { test, expect } from "@playwright/test";

test("homepage has no listening widget or request and compact navigation stays within its masthead", async ({page}) => {
  const requests = [];
  page.on("request", request => { if (request.url().includes("/api/now-playing")) requests.push(request.url()); });
  for (const width of [320,390,1024,1440]) {
    await page.setViewportSize({width,height:800});
    await page.goto("/");
    await expect(page.locator(".site-nav__brand")).toBeVisible();
    await expect(page.locator(".now-playing,.hero-listening")).toHaveCount(0);
    const bounds = await page.locator(".site-nav").evaluate(header => {
      const outer = header.getBoundingClientRect();
      return [...header.querySelectorAll("a,button")].filter(el => el.getClientRects().length).every(el => {
        const r = el.getBoundingClientRect();
        return r.left >= outer.left - 1 && r.right <= outer.right + 1 && r.bottom <= outer.bottom + 1;
      });
    });
    expect(bounds).toBe(true);
  }
  expect(requests).toHaveLength(0);
});
