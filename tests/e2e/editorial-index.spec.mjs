test("Home no longer loads the obsolete editorial image lens", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator("#selected-work .project-folder")).toHaveCount(3);
  await expect(page.locator("#selected-work .editorial-index")).toHaveCount(0);
});

import { test, expect } from "@playwright/test";

const luminance = color => {
  const [r, g, b] = color.map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

// Computed CSS colors can use any color space. Let the browser resolve them to sRGB.
function readColors(element) {
  const context = document.createElement("canvas").getContext("2d");
  const toSRGB = color => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
  };
  return {
    foreground: toSRGB(getComputedStyle(element).color),
    background: toSRGB(getComputedStyle(element, "::before").backgroundColor)
  };
}

for (const [name, path, selector] of [
  ["Essays", "/essays.html", ".editorial-index--notes"]
]) {
  test(`${name} uses the shared full-column AAA editorial-index interaction`, async ({ page }) => {
    await page.goto(path);
    const rows = page.locator(`${selector} .editorial-index__row`);
    await expect(rows.first()).toBeVisible();
    const padding = await rows.first().evaluate(element => {
      const style = getComputedStyle(element);
      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat);
    });
    expect(padding[0]).toBeGreaterThanOrEqual(16);
    expect(padding[2]).toBeGreaterThanOrEqual(16);
    expect(padding[1]).toBeGreaterThanOrEqual(16);
    expect(padding[3]).toBeGreaterThanOrEqual(16);

    await rows.first().focus();
    await expect(rows.first()).toHaveCSS("opacity", "1");
    await expect(rows.first().locator(".editorial-index__title"))
      .toHaveCSS("font-weight", "400");
    if (await rows.count() > 1) await expect(rows.nth(1)).toHaveCSS("opacity", "1");
    const focusColors = await rows.first().evaluate(readColors);
    expect(contrast(focusColors.foreground, focusColors.background)).toBeGreaterThanOrEqual(7);

    const canHover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (!canHover) return;
    for (const row of await rows.all()) {
      await row.hover();
      const colors = await row.evaluate(readColors);
      expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(7);
    }
  });
}
