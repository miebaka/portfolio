import { test, expect } from "@playwright/test";

const channels = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
const luminance = color => {
  const [r, g, b] = channels(color).map(value => {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

for (const [name, path, selector] of [
  ["Home", "/index.html", ".editorial-index--work"],
  ["Work", "/work.html", ".editorial-index--archive"],
  ["Notes", "/playground.html", ".editorial-index--notes"]
]) {
  test(`${name} uses the shared padded AAA editorial-index interaction`, async ({ page }) => {
    await page.goto(path);
    const rows = page.locator(`${selector} .editorial-index__row`);
    await expect(rows.first()).toBeVisible();
    const padding = await rows.first().evaluate(element => {
      const style = getComputedStyle(element);
      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(parseFloat);
    });
    expect(padding.every(value => value >= 16)).toBe(true);

    await rows.first().focus();
    await expect(rows.first()).toHaveCSS("opacity", "1");
    await expect(rows.first().locator(".editorial-index__title")).toHaveCSS("font-weight", "700");
    if (await rows.count() > 1) await expect(rows.nth(1)).toHaveCSS("opacity", "0.28");
    const focusColors = await rows.first().evaluate(element => ({
      foreground: getComputedStyle(element).color,
      background: getComputedStyle(element, "::before").backgroundColor
    }));
    expect(contrast(focusColors.foreground, focusColors.background)).toBeGreaterThanOrEqual(7);

    const canHover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (!canHover) return;
    for (const row of await rows.all()) {
      await row.hover();
      const colors = await row.evaluate(element => ({
        foreground: getComputedStyle(element).color,
        background: getComputedStyle(element, "::before").backgroundColor
      }));
      expect(contrast(colors.foreground, colors.background)).toBeGreaterThanOrEqual(7);
    }
  });
}
