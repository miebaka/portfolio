import { test, expect } from "@playwright/test";

// The server-rendered logo must survive the client navigation renderer.
for (const path of ["/index.html", "/work.html", "/about.html"]) {
  test(`the nav logo survives hydration on ${path}`, async ({ page }) => {
    await page.goto(path);
    const link = page.locator(".site-nav__brand");
    await expect(link).toBeVisible();
    await expect(link.locator("img.nav-logo")).toBeVisible();
    await expect(link).toHaveAccessibleName(/Miebaka Joshua.*home/i);
    await expect(link).toHaveAttribute("href", "index.html");
  });
}
