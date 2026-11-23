import { test, expect } from "@playwright/test";
const folders = page => page.locator("#selected-work .project-folder");

test("Home and Work share the same folder order, with a preview on Home", async ({ page }) => {
  await page.goto("/");
  await expect(folders(page)).toHaveCount(3);
  await expect(folders(page).locator(".project-folder__title")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "ChopBox"
  ]);
  await expect(folders(page).locator(".project-folder__visual img")).toHaveCount(0);
  await expect(folders(page).locator(".project-folder__outcome")).toHaveCount(3);
  await expect(folders(page).locator(".project-folder__paper")).toHaveCount(15);
  const homeHrefs = await folders(page).locator(".project-folder__link").evaluateAll(nodes =>
    nodes.map(node => node.getAttribute("href")));
  await page.goto("/work.html");
  expect(await page.locator(".project-folder__link").evaluateAll(nodes =>
    nodes.map(node => node.getAttribute("href")))).toEqual(homeHrefs);
});

test("hero keeps proposition and first-work path readable beside the water on small phones", async ({ page }) => {
  for (const width of [320, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.locator(".home-landing__statement")).toContainText("I ask until the idea is clear");
    const pause = page.locator(".hero-wave__control");
    const statement = page.locator(".home-landing__statement");
    const dimensions = await page.evaluate(() => {
      const rect = sel => document.querySelector(sel)?.getBoundingClientRect();
      const a = rect(".hero-wave__control");
      const b = rect(".home-landing__statement");
      return { intersects: a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top };
    });
    expect(dimensions.intersects, "pause button never covers statement at "+width).toBe(false);
    await expect(page.locator('.home-landing__meta a[href="#selected-work"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
  }
});

test("the first case follows the hero naturally and the selected index stays visible at rest", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const positions = await page.evaluate(() => {
      const bounds = selector => document.querySelector(selector).getBoundingClientRect();
      return { hero: bounds(".home-landing").bottom,
        work: bounds("#selected-work").top,
        first: bounds("#selected-work .project-folder").top };
    });
    expect(positions.work).toBeGreaterThanOrEqual(positions.hero - 2);
    expect(positions.first).toBeGreaterThanOrEqual(positions.work - 2);
    await expect(folders(page).locator(".project-folder__title")).toHaveCount(3);
  }
});

test("a single pointer activation opens the correct Home case", async ({ page }) => {
  await page.goto("/");
  await folders(page).nth(0).locator(".project-folder__tab").click();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("keyboard focus follows the visible order and Enter opens Rivo", async ({ page }) => {
  await page.goto("/");
  const link = folders(page).nth(1).locator(".project-folder__link");
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("Selected Work, services and water retain safe horizontal edges without overflow", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("#what-i-do .service-stack__card")).toHaveCount(5);
    await expect(folders(page)).toHaveCount(3);
    const result = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect();
      return { hero: box(".home-landing").toJSON(), work: box("#selected-work").toJSON(),
        service: box("#what-i-do .service-stack__card").toJSON(),
        overflow: document.documentElement.scrollWidth - innerWidth };
    });
    expect(result.hero.right).toBeLessThanOrEqual(width + 1);
    expect(result.work.right).toBeLessThanOrEqual(width + 1);
    expect(result.service.right).toBeLessThanOrEqual(width + 1);
    expect(result.overflow).toBeLessThanOrEqual(2);
  }
});

test("Home keeps three native case destinations without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#selected-work .project-folder__link")).toHaveCount(3);
  await expect(page.locator("#selected-work .project-folder__outcome")).toHaveCount(3);
  await context.close();
});

test("reduced-motion Home preserves project access and calm service reading order", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(folders(page)).toHaveCount(3);
  await expect(page.locator("#what-i-do .service-stack__item").first()).toHaveCSS("position", "relative");
  await folders(page).nth(2).locator(".project-folder__link").click();
  await expect(page).toHaveURL(/\/work\/chopbox\.html$/);
});
