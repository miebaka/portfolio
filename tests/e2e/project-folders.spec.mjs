import { test, expect } from "@playwright/test";

test("project archive is a branded stack, without a filing drawer or WebGL", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.locator(".project-folder")).toHaveCount(3);
  await expect(page.locator(".project-folder__paper--left")).toHaveCount(3);
  await expect(page.locator(".project-folder__paper--right")).toHaveCount(3);
  await expect(page.locator(".filing-cabinet,.filing-cabinet__three-canvas")).toHaveCount(0);
  await expect(page.locator(".project-folder").nth(0)).toHaveAttribute("style", /#000041/);
  await expect(page.locator(".project-folder").nth(1)).toHaveAttribute("style", /#6e2962/);
  await expect(page.locator(".project-folder").nth(2)).toHaveAttribute("style", /#c2531c/);
});

test("keyboard links move to their correct case studies", async ({ page }) => {
  await page.goto("/work.html");
  const link = page.locator(".project-folder__link").nth(1);
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveAttribute("href", "work/tedx-rsu.html");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("Work folder labels survive small screens and 200% zoom", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work.html");
    const geometry = await page.locator(".project-folder__tab-title").evaluateAll(nodes =>
      nodes.map(node => ({ width: node.clientWidth, scrollWidth: node.scrollWidth,
        height: node.getBoundingClientRect().height })));
    expect(geometry).toHaveLength(3);
    for (const rect of geometry) {
      expect(rect.width).toBeGreaterThan(60);
      expect(rect.scrollWidth).toBeLessThanOrEqual(rect.width + 2);
      expect(rect.height).toBeGreaterThan(18);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
});

test("no-JS visitors see complete project folders", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work.html");
  await expect(page.locator(".project-folder__link")).toHaveCount(3);
  await expect(page.locator(".project-archive__progress li")).toHaveCount(3);
  await context.close();
});
