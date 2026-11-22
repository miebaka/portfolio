import { test, expect } from "@playwright/test";

test("Work exposes three tall physical folders and fifteen static sheets", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.locator(".folder-rack--work")).toHaveCount(1);
  await expect(page.locator(".folder-rack__folder")).toHaveCount(3);
  await expect(page.locator(".folder-rack__sheet")).toHaveCount(15);
  await expect(page.locator(".folder-rack__name")).toHaveText([
    "Rivo Studio", "TEDx Rivers State University", "ChopBox",
  ]);
  await expect(page.locator(".folder-rack__tab")).toHaveText(["01", "02", "03"]);
  const box = await page.locator(".folder-rack__folder").first().boundingBox();
  expect(box.height).toBeGreaterThan(box.width);
  for (const sheet of await page.locator(".folder-rack__sheet").all())
    await expect(sheet).toHaveCSS("pointer-events", "none");
});

test("keyboard focus opens a folder and Enter navigates to the correct case", async ({ page }) => {
  await page.goto("/work.html");
  const link = page.locator(".folder-rack__folder").nth(1);
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toHaveClass(/is-active/);
  await expect(link).toHaveAttribute("href", "work/tedx-rsu.html");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("logical hit testing selects the correct folder while transforms animate", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work.html");
  const scroller = page.locator(".folder-rack__scroller");
  const rect = await scroller.boundingBox();
  const pitch = await page.locator(".folder-rack__track").evaluate(el =>
    parseFloat(getComputedStyle(el).getPropertyValue("--rack-pitch")));
  const origin = await page.locator(".folder-rack__track").evaluate(el =>
    parseFloat(getComputedStyle(el).getPropertyValue("--rack-origin")));
  await page.mouse.move(rect.x + origin + pitch * 1.5, rect.y + rect.height - 100);
  await expect(page.locator(".folder-rack__folder").nth(1)).toHaveClass(/is-active/);
  const width = await page.locator(".folder-rack__folder").first().evaluate(el => el.offsetWidth);
  await page.mouse.move(rect.x + origin + width + pitch * 2, rect.y + rect.height - 100);
  await expect(page.locator(".folder-rack__folder").nth(2)).toHaveClass(/is-active/);
});

test("touch needs one tap to open and another tap to enter", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto("/work.html");
  const rect = await page.locator(".folder-rack__scroller").boundingBox();
  const pitch = await page.locator(".folder-rack__track").evaluate(el =>
    parseFloat(getComputedStyle(el).getPropertyValue("--rack-pitch")));
  const origin = await page.locator(".folder-rack__track").evaluate(el =>
    parseFloat(getComputedStyle(el).getPropertyValue("--rack-origin")));
  const x = rect.x + origin + pitch * 1.35, y = rect.y + rect.height / 2;
  await page.touchscreen.tap(x, y);
  await expect(page.locator(".folder-rack__folder").nth(1)).toHaveClass(/is-active/);
  await expect(page).toHaveURL(/\/work\.html$/);
  await page.touchscreen.tap(x, y);
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
  await context.close();
});

test("no-JS Work still contains native case links and in-progress items", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work.html");
  await expect(page.locator(".folder-rack__folder")).toHaveCount(3);
  await expect(page.locator(".project-archive__progress li")).toHaveCount(3);
  await expect(page.locator(".folder-rack__folder").first()).toHaveCSS("pointer-events", "auto");
  await context.close();
});