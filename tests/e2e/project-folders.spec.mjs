import { test, expect } from "@playwright/test";

test("project archive is a branded stack, without a filing drawer or WebGL", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.locator(".project-folder")).toHaveCount(3);
  await expect(page.locator(".project-folder__paper")).toHaveCount(15);
  for (const sheet of [1, 2, 3, 4, 5])
    await expect(page.locator(`.project-folder__paper--${sheet}`)).toHaveCount(3);
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

test("landscape folder titles remain fully visible at narrow widths", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work.html");
    const geometry = await page.locator(".project-folder__title").evaluateAll(nodes =>
      nodes.map(node => {
        const title = node.getBoundingClientRect();
        const face = node.closest(".project-folder__front").getBoundingClientRect();
        return { width: node.clientWidth, scrollWidth: node.scrollWidth,
          titleBottom: title.bottom, faceBottom: face.bottom,
          titleTop: title.top, faceTop: face.top };
      }));
    expect(geometry).toHaveLength(3);
    for (const rect of geometry) {
      expect(rect.width).toBeGreaterThan(60);
      expect(rect.scrollWidth).toBeLessThanOrEqual(rect.width + 2);
      expect(rect.titleTop).toBeGreaterThanOrEqual(rect.faceTop - 1);
      expect(rect.titleBottom).toBeLessThanOrEqual(rect.faceBottom + 1);
    }
    await expect(page.locator(".project-folder__tab-number")).toHaveText(["01", "02", "03"]);
    await expect(page.locator(".project-folder__paper")).toHaveText(Array(15).fill(""));
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

test("overlapping folders follow painted hit areas rather than displaced click boxes", async ({ page }) => {
  await page.goto("/work.html");
  const folders = page.locator(".project-folder");
  const positions = await folders.evaluateAll(items => items.map(el => {
    const box = el.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, width: box.width };
  }));
  expect(positions[1].top).toBeLessThan(positions[0].bottom);
  expect(positions[2].top).toBeLessThan(positions[1].bottom);
  expect(positions[1].top).toBeGreaterThan(positions[0].top);
  const target = folders.nth(1).locator(".project-folder__link");
  await target.focus();
  await expect(target).toBeFocused();
  await expect(folders.nth(1)).toHaveCSS("z-index", "10");
});
