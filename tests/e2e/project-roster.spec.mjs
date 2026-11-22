import { test, expect } from "@playwright/test";

test("Home Selected Work shares the Work page's upright folder construction", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator(".folder-rack--home")).toBeVisible();
  await expect(page.locator(".folder-rack--home .folder-rack__folder")).toHaveCount(3);
  await expect(page.locator(".folder-rack--home .folder-rack__sheet")).toHaveCount(15);
  await expect(page.locator(".folder-rack--home .folder-rack__name")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "ChopBox",
  ]);
  for (const heading of ["The Call", "The System", "What Survived", "First Contact", "The Results"])
    await expect(page.locator(".folder-rack--home .folder-rack__index").first()).toContainText(heading);
  await expect(page.locator(".folder-rack--home .folder-rack__folder").first())
    .toHaveAttribute("href", "work/tedx-rsu.html");
});

test("All Work is a prominent centered link below the rack", async ({ page }) => {
  await page.goto("/index.html");
  const link = page.getByRole("link", { name: /all work/i }).first();
  await expect(link).toHaveAttribute("href", "work.html");
  await link.scrollIntoViewIfNeeded();
  const bounds = await link.boundingBox();
  expect(bounds.width).toBeGreaterThanOrEqual(240);
  expect(bounds.height).toBeGreaterThanOrEqual(68);
  expect(Math.abs(bounds.x + bounds.width / 2 - page.viewportSize().width / 2)).toBeLessThan(10);
  await link.click();
  await expect(page).toHaveURL(/\/work\.html$/);
});

test("keyboard Enter on a Home folder enters the right case", async ({ page }) => {
  await page.goto("/index.html");
  const folder = page.locator(".folder-rack--home .folder-rack__folder").nth(1);
  await folder.focus();
  await expect(folder).toHaveClass(/is-active/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("reduced motion and narrow viewports retain all project links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  const folders = page.locator(".folder-rack--home .folder-rack__folder");
  await expect(folders).toHaveCount(3);
  for (const index of [0, 1, 2])
    await expect(folders.nth(index)).toHaveAttribute("href", /work\/(tedx-rsu|rivo|chopbox)\.html/);
  await expect(folders.first()).toHaveCSS("transition-duration", "0s");
  expect(await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});