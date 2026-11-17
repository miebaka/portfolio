import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("hero wave uses the authored palette in both themes", async ({ page }) => {
  await page.goto("/?shader-test=1&shader-static=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveClass(/is-ready/);
  for (const theme of ["light", "dark", "light"]) {
    await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
    await expect(wave).toHaveAttribute("data-preset", `${theme === "light" ? "Light" : "Dark"} water plane`);
  }
  const palette = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return ["--hero-wave-color-1", "--hero-wave-color-2", "--hero-wave-color-3"]
      .map(token => styles.getPropertyValue(token).trim().replaceAll(" ", ""));
  });
  expect(palette).toEqual(["#07112b", "#002080", "#b1c5ff"]);
});

test("static hero wave has genuine tonal relief", async ({ page }) => {
  await page.goto("/?shader-test=1&shader-static=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveClass(/is-ready/);
  const shot = await wave.screenshot({ scale: "css" });
  const { data, info } = await sharp(shot).raw().toBuffer({ resolveWithObject: true });
  const levels = new Set();
  for (let index = 0; index < data.length; index += info.channels) levels.add(data[index] + data[index + 1] + data[index + 2]);
  expect(Math.max(...levels) - Math.min(...levels)).toBeGreaterThan(30);
  expect(levels.size).toBeGreaterThan(20);
});

test("hero proof and client proof remain visible", async ({ page }) => {
  await page.goto("/?shader-test=1&shader-static=1");
  await expect(page.locator("[data-hero-wave]")).toHaveClass(/is-ready/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.locator(".journey").scrollIntoViewIfNeeded();
  await expect(page.locator(".marquee__item").first()).toBeVisible();
});
