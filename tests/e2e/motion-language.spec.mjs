import { test, expect } from "@playwright/test";

test("explicit Reduce keeps every Home proof chapter readable without staged motion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("motion-preference", "reduce"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator("#selected-title")).toHaveCSS("opacity", "1");
  await expect(page.locator("#about-title")).toHaveCSS("opacity", "1");
  await expect(page.locator(".service-stack__item").first()).toHaveCSS("position", "relative");
  await expect(page.locator(".home-landing h1 > span").first()).toHaveCSS("animation-name", "none");
});

test("selected-work image preview reacts to pointer on a fine-pointer desktop", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveClass(/motion-language-ready/);
  const row = page.locator(".home-project-list .editorial-index__row").first();
  await row.scrollIntoViewIfNeeded();
  if (isMobile) {
    // On touch the image is persistently visible: assert meaningful equivalent behavior.
    await expect(row.locator(".home-project-list__visual")).toBeVisible();
    await row.focus();
    await expect(row).toBeFocused();
    expect(await row.evaluate(el => el.style.getPropertyValue("--motion-preview-x"))).toBe("");
    return;
  }
  const bounds = await row.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .5);
  await expect.poll(() => row.evaluate(element =>
    Number.parseFloat(element.style.getPropertyValue("--motion-preview-x")) || 0
  )).toBeGreaterThan(1);
});

test("an on-page switch from Full to Reduce clears animated previews", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  const row = page.locator(".home-project-list .editorial-index__row").first();
  await row.scrollIntoViewIfNeeded();
  if (!isMobile) {
    const box = await row.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + box.width * .8, box.y + box.height * .5);
    await expect.poll(() => row.evaluate(element => element.style.getPropertyValue("--motion-preview-x"))).not.toBe("");
  } else {
    await expect(row.locator(".home-project-list__visual")).toBeVisible();
  }
  await page.evaluate(() => { document.documentElement.dataset.motion = "reduced"; });
  await expect(page.locator("html")).not.toHaveClass(/motion-language-ready/);
  await expect.poll(() => row.evaluate(element => element.style.getPropertyValue("--motion-preview-x"))).toBe("");
  await expect(page.locator("#selected-title")).toHaveCSS("opacity", "1");
  if (isMobile) await expect(row.locator(".home-project-list__visual")).toBeVisible();
});
