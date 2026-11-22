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

test("caustic animation can be paused and resumed without removing the canvas", async ({ page }) => {
  await page.goto("/?shader-test=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveClass(/is-ready/);
  const control = page.getByRole("button", { name: "Pause background motion" });
  await expect(control).toBeVisible();
  await control.click();
  await expect(page.getByRole("button", { name: "Resume background motion" })).toHaveAttribute("aria-pressed", "true");
  await expect(wave.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Resume background motion" }).click();
  await expect(page.getByRole("button", { name: "Pause background motion" })).toHaveAttribute("aria-pressed", "false");
});

test("system reduced-motion preference suppresses the motion toggle", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?shader-test=1");
  await expect(page.locator("[data-hero-wave]")).toHaveClass(/is-ready/);
  await expect(page.locator(".hero-wave__control")).toBeHidden();
});

test("light-front caustics show clear overhead daylight and restrained moonlight", async ({ page }) => {
  await page.goto("/?shader-test=1&shader-static=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveClass(/is-ready/);
  await expect(wave).toHaveAttribute("data-caustics", "refracted-lightfront");
  await expect(wave).toHaveAttribute("data-light-source", "sun");
  const sunlight = await sharp(await wave.screenshot({ scale: "css" })).stats();

  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await expect(wave).toHaveAttribute("data-light-source", "moon");
  const moonlight = await sharp(await wave.screenshot({ scale: "css" })).stats();

  const luminance = stats => stats.channels.slice(0, 3)
    .reduce((sum, channel) => sum + channel.mean, 0) / 3;
  expect(luminance(sunlight)).toBeGreaterThan(luminance(moonlight) + 15);
  await expect(wave.locator("canvas")).toHaveCount(1);
});

test("privacy-restricted mobile renderer works without the shader-test bypass", async ({ page }) => {
  // Chromium is instrumented to expose the generic GPU identity common on
  // Safari. shader-perf opts automation in but does NOT bypass GPU detection.
  await page.addInitScript(() => {
    const context = WebGL2RenderingContext.prototype;
    const getExtension = context.getExtension;
    const getParameter = context.getParameter;
    context.getExtension = function (name) {
      if (name === "WEBGL_debug_renderer_info") return null;
      return getExtension.call(this, name);
    };
    context.getParameter = function (name) {
      if (name === this.RENDERER) return "WebKit WebGL";
      return getParameter.call(this, name);
    };
  });
  await page.goto("/?shader-perf=1&shader-static=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveClass(/is-ready/);
  await expect(wave.locator("canvas")).toHaveCount(1);
  await expect(wave).toHaveAttribute("data-caustics", "refracted-lightfront");
});

test("a lost Three.js context shows water fallback instead of a blank canvas", async ({ page }) => {
  await page.goto("/?shader-test=1&shader-static=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveAttribute("data-renderer", "threejs");
  await wave.locator("canvas").evaluate(canvas => {
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  await expect(wave).toHaveClass(/is-fallback/);
  await expect(wave).toHaveAttribute("data-renderer", "fallback");
});
