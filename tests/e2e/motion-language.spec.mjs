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

test("selected-work image preview changes on desktop hover without pointer displacement", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveClass(/motion-language-ready/);
  const first = page.locator(".home-project-list .editorial-index__row").first();
  await first.scrollIntoViewIfNeeded();

  if (isMobile) {
    await expect(first.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
    await first.focus();
    await expect(first).toBeFocused();
  } else {
    await first.hover();
    await expect(first.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
  }

  expect(await first.evaluate(el => el.style.getPropertyValue("--motion-preview-x"))).toBe("");
  expect(await first.evaluate(el => el.style.getPropertyValue("--motion-preview-y"))).toBe("");
});

test("on-page switch from Full to Reduce preserves the large visual and stops transitions", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  const active = page.locator(".home-project-list .editorial-index__row").nth(isMobile ? 0 : 1);
  await active.scrollIntoViewIfNeeded();
  if (!isMobile) await active.focus();
  await expect(active.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");

  await page.evaluate(() => { document.documentElement.dataset.motion = "reduced"; });
  await expect(page.locator("html")).not.toHaveClass(/motion-language-ready/);
  await expect(active.locator(".home-project-list__visual")).toHaveCSS("opacity", "1");
  await expect(active.locator(".home-project-list__visual")).toHaveCSS("transition-duration", "0s");
  await expect(page.locator("#selected-title")).toHaveCSS("opacity", "1");
});
