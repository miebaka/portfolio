import { test, expect } from "@playwright/test";

const rows = page => page.locator(".home-project-list .project-roster__row");

test("selected projects keep real case-study links and three real images", async ({ page }) => {
  await page.goto("/");
  const items = rows(page);
  await expect(items).toHaveCount(3);
  for (const [index, name, slug] of [
    [0, "TEDx Rivers State University", "tedx-rsu"],
    [1, "Rivo Studio", "rivo"],
    [2, "ChopBox", "chopbox"],
  ]) {
    const item = items.nth(index);
    await expect(item).toHaveAttribute("href", "work/" + slug + ".html");
    await expect(item.locator(".home-project-list__title")).toHaveText(name);
    await expect(item.locator(".project-roster__photo")).toHaveCount(3);
    await expect(item.locator(".project-roster__photo img").first()).toHaveAttribute("src", /assets\/images\/optimized\/.+-540\.webp/);
  }
  const titleFamily = await items.first().locator(".home-project-list__title").evaluate(el => getComputedStyle(el).fontFamily);
  const tagFamily = await items.first().locator(".home-project-list__meta").evaluate(el => getComputedStyle(el).fontFamily);
  expect(titleFamily).toContain("Geist Sans");
  expect(tagFamily).toContain("Geist Mono");
});

test("desktop hover elastically expands a project and drops metadata capsules", async ({ page, isMobile }) => {
  test.skip(isMobile, "Physics reveal is desktop-only; mobile preserves visible covers.");
  await page.goto("/");
  const row = rows(page).first();
  await row.scrollIntoViewIfNeeded();
  const initialHeight = await row.evaluate(el => el.getBoundingClientRect().height);
  await row.hover();
  await expect(row).toHaveClass(/is-open/);
  await expect(row.locator(".project-roster__tag")).toHaveCount(4, { timeout: 5000 });
  await expect.poll(() => row.evaluate(el => el.getBoundingClientRect().height)).toBeGreaterThan(initialHeight + 75);
  await page.mouse.move(0, 0);
  await expect(row).not.toHaveClass(/is-open/);
  await expect(row.locator(".project-roster__tag")).toHaveCount(0);
});

test("project links expand on keyboard focus and remain navigable", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch pages use static, fully linked project cards.");
  await page.goto("/");
  const row = rows(page).nth(1);
  await row.focus();
  await expect(row).toHaveClass(/is-open/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("touch layout shows the featured artwork without hover", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile composition assertion.");
  await page.goto("/");
  for (const row of await rows(page).all()) {
    await expect(row.locator(".project-roster__photo--1")).toBeVisible();
    await expect(row.locator(".project-roster__photo--1 img")).toBeVisible();
    await expect(row).not.toHaveClass(/is-open/);
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test("reduced-motion leaves roster collapsed and accessible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const row = rows(page).first();
  await row.scrollIntoViewIfNeeded();
  await row.hover();
  await expect(row).not.toHaveClass(/is-open/);
  await expect(row.locator(".project-roster__tag")).toHaveCount(0);
  await expect(row.locator(".home-project-list__title")).toBeVisible();
});
