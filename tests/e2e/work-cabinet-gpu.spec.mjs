import { test, expect } from "@playwright/test";
import sharp from "sharp";

test("software-backed WebGL2 visibly renders the physical cabinet and safely loses context", async ({ page }) => {
  await page.goto("/work.html");
  const supported = await page.evaluate(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      const ok = !!gl;
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      return ok;
    } catch { return false; }
  });
  expect(supported, "GPU QA must have an actual WebGL2 context").toBe(true);
  const well = page.locator(".filing-cabinet__well");
  await well.scrollIntoViewIfNeeded();
  await well.hover();
  await expect(page.locator("[data-project-archive]"))
    .toHaveAttribute("data-cabinet3d", "ready", { timeout: 20_000 });

  const canvas = well.locator(".filing-cabinet__three-canvas");
  await expect(canvas).toHaveAttribute("aria-hidden", "true");
  await expect(canvas).toHaveCSS("pointer-events", "none");
  const png = await canvas.screenshot();
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  for (let i = 0; i < info.width * info.height; i += 37) {
    const p = i * info.channels;
    colors.add([data[p], data[p + 1], data[p + 2]].join(","));
  }
  expect(colors.size, "The 3D canvas should show multiple rendered materials and shadows")
    .toBeGreaterThan(25);
  await well.screenshot({ path: "test-results/cabinet-gpu-webgl.png" });

  await canvas.evaluate(element => {
    element.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  await expect(page.locator("[data-project-archive]"))
    .not.toHaveAttribute("data-cabinet3d", "ready");
  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".filing-cabinet__face").first())
    .not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".filing-cabinet__link")).toHaveCount(3);
});
