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
  const hiddenLabels = well.locator(".filing-cabinet__link > .sr-only");
  await expect(hiddenLabels).toHaveCount(3);
  const hiddenStyles = await hiddenLabels.first().evaluate(node => {
    const css = getComputedStyle(node);
    return { width: css.width, height: css.height, clipPath: css.clipPath };
  });
  expect(hiddenStyles.width).toBe("1px");
  expect(hiddenStyles.height).toBe("1px");
  expect(hiddenStyles.clipPath).toBe("inset(50%)");
  // The WebGL die-cut paper must be visible under native text; the HTML
  // label may not look like an opaque rectangular card pasted onto the mesh.
  await expect(well.locator(".filing-cabinet__tab").first())
    .toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  // WebGL also renders the year guide stock: the CSS plate cannot hide
  // a folder tab merely because its crown overlaps the next guide.
  await expect(well.locator(".filing-cabinet__divider").first())
    .toHaveCSS("background-image", "none");
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
  // Verify that the WebGL surface actually contributes visible pixels.
  // Merely counting colours in a screenshot can accidentally count HTML layers.
  // Element screenshots wait for a "stable" layout and can time out under
  // continuous WebGL/scroll activity even when rendering is correct.
  // Capture the same fixed page rectangle in both states instead.
  const clip = await well.boundingBox();
  expect(clip, "The drawer must occupy a measurable viewport rectangle").not.toBeNull();
  const screenshotOptions = { clip, animations: "disabled" };
  const visible = await page.screenshot(screenshotOptions);
  await canvas.evaluate(node => { node.style.visibility = "hidden"; });
  const hidden = await page.screenshot(screenshotOptions);
  await canvas.evaluate(node => { node.style.visibility = ""; });
  const [on, off] = await Promise.all([visible, hidden].map(async png =>
    sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true })));
  expect(on.info.width).toBe(off.info.width);
  // A reflective RoomEnvironment once turned the desktop filing drawer
  // into a bright grey showroom panel, while mobile stayed near black.
  // Sample the exposed floor above the first year card on both renderers.
  const floorX = Math.floor(on.info.width * .5);
  const floorY = Math.min(16, on.info.height - 1);
  const floorOffset = (floorY * on.info.width + floorX) * on.info.channels;
  const floorLuminance = .2126 * on.data[floorOffset] +
    .7152 * on.data[floorOffset + 1] + .0722 * on.data[floorOffset + 2];
  expect(floorLuminance, "Powder-coated drawer floor must stay dark under desktop HDR reflections")
    .toBeLessThan(115);
  let changed = 0, sampled = 0;
  for (let i = 0; i < on.info.width * on.info.height; i += 71) {
    const offset = i * on.info.channels;
    const distance = Math.abs(on.data[offset] - off.data[offset]) +
      Math.abs(on.data[offset + 1] - off.data[offset + 1]) +
      Math.abs(on.data[offset + 2] - off.data[offset + 2]);
    if (distance > 25) changed++;
    sampled++;
  }
  expect(changed / sampled, "Showing the 3D canvas must materially change the rendered drawer")
    .toBeGreaterThan(0.02);
  await page.screenshot({ ...screenshotOptions, path: "test-results/cabinet-gpu-webgl.png" });
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  await page.screenshot({ ...screenshotOptions, path: "test-results/cabinet-gpu-dark.png" });

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
