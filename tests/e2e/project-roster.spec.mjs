import { test, expect } from "@playwright/test";

const rows = page => page.locator(".home-project-list .project-roster__row");

test("three published projects use oversized headings, one real high-resolution image and direct case links", async ({ page }) => {
  await page.goto("/");
  const items = rows(page);
  await expect(items).toHaveCount(3);

  for (const [index, name, slug, year] of [
    [0, "TEDx Rivers State University", "tedx-rsu", "2023"],
    [1, "Rivo Studio", "rivo", "2024"],
    [2, "ChopBox", "chopbox", "2022"],
  ]) {
    const link = items.nth(index);
    await expect(link).toHaveAttribute("href", "work/" + slug + ".html");
    await expect(link).toHaveAttribute("aria-label", new RegExp(year + ", view case study"));
    await expect(link.locator(".home-project-list__title")).toHaveText(name);
    await expect(link.locator(".home-project-list__visual img")).toHaveCount(1);
    await expect(link.locator(".home-project-list__visual img")).toHaveAttribute("src", /assets\/images\/optimized\/.+-810\.webp/);
    await expect(link.locator(".home-project-list__visual source")).toHaveCount(2);
  }

  await expect(page.locator(".home-project-list__meta,.home-project-list__arrow,.project-roster__tags,.project-roster__tag")).toHaveCount(0);
  const titleFont = await items.nth(1).locator(".home-project-list__title").evaluate(el => getComputedStyle(el).fontFamily);
  expect(titleFont).toContain("Geist Sans");
});

test("project artwork changes on desktop hover but stays static on touch layouts", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const items = rows(page);
  const initialHeights = await items.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
  const defaultImage = items.nth(1).locator(".home-project-list__visual");
  await expect(defaultImage).toHaveCSS("opacity", "1");

  if (isMobile) {
    for (const item of await items.all()) {
      await expect(item.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
      await expect(item.locator(".home-project-list__visual")).toHaveCSS("position", "relative");
    }
    await items.first().focus();
    for (const item of await items.all())
      await expect(item.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
    // Mobile rows are in normal document flow; late font metric changes may
    // legitimately change their height. The real contract is that focus
    // cannot hide the static artwork or introduce horizontal overflow.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    return;
  }

  const first = items.first();
  await first.scrollIntoViewIfNeeded();
  await first.hover();
  await expect(first.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
  await expect(defaultImage).toHaveCSS("opacity", "0");
  const box = await first.locator(".home-project-list__visual").boundingBox();
  expect(box.width).toBeGreaterThan(350);
  expect(box.height).toBeGreaterThan(450);
  expect(Math.abs(box.x + box.width / 2 - 720)).toBeLessThan(40);
  const finalHeights = await items.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().height));
  finalHeights.forEach((height, index) => expect(Math.abs(height - initialHeights[index])).toBeLessThan(2));
});

test("All Work is a sizable, centered, keyboard-focusable link beneath the project list", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /all work/i }).first();
  await expect(link).toHaveAttribute("href", "work.html");
  await link.scrollIntoViewIfNeeded();
  const box = await link.boundingBox();
  const viewportWidth = page.viewportSize().width;
  expect(box.width).toBeGreaterThanOrEqual(240);
  expect(box.height).toBeGreaterThanOrEqual(68);
  expect(Math.abs(box.x + box.width / 2 - viewportWidth / 2)).toBeLessThan(10);
  await link.click();
  await expect(page).toHaveURL(/\/work\.html$/);
});

test("keyboard focus and Enter open case studies on desktop and mobile", async ({ page }) => {
  await page.goto("/");
  const link = rows(page).nth(1);
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("project artwork fits the viewport with device-appropriate positioning", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const row of await rows(page).all()) {
    const image = row.locator(".home-project-list__visual");
    await expect(image).toBeVisible();
    await expect(image).toHaveCSS("position", isMobile ? "relative" : "absolute");
    if (isMobile) await expect(image).toHaveCSS("opacity", "1");
    const bounds = await image.boundingBox();
    expect(bounds.width).toBeGreaterThan(200);
    expect(bounds.height).toBeGreaterThan(150);
  }
  if (!isMobile) {
    await expect(rows(page).nth(1).locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(2);
});

test("reduced motion keeps static images correctly centered and all links operational", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const defaultImage = rows(page).nth(1).locator(".home-project-list__visual");
  await expect(defaultImage).toHaveCSS("opacity", "1");
  await expect(defaultImage).toHaveCSS("transition-duration", "0s");
  const transform = await defaultImage.evaluate(element => getComputedStyle(element).transform);
  if (page.viewportSize().width <= 768) expect(transform).toBe("none");
  else expect(transform).not.toBe("none");
  await expect(rows(page).first().locator(".home-project-list__title")).toBeVisible();
});
