import { test, expect } from "@playwright/test";

test("upright rack stays readable and does not overflow at five viewport widths", async ({ page }, testInfo) => {
  for (const width of [320, 390, 900, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/work.html");
    await page.evaluate(() => document.fonts.ready);
    const folders = page.locator(".folder-rack__folder");
    await expect(folders).toHaveCount(3);
    await expect(page.locator(".folder-rack__sheet")).toHaveCount(15);
    const measurements = await folders.evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      const face = node.querySelector(".folder-rack__front").getBoundingClientRect();
      return {
        href: node.getAttribute("href"),
        height: rect.height, width: rect.width,
        papers: node.querySelectorAll(".folder-rack__sheet").length,
        faceInside: face.bottom <= rect.bottom + 1,
        sheetTransitions: [...node.querySelectorAll(".folder-rack__sheet")].map(
          paper => getComputedStyle(paper).transitionDuration)
      };
    }));
    expect(measurements.map(item => item.href)).toEqual([
      "work/rivo.html", "work/tedx-rsu.html", "work/chopbox.html",
    ]);
    for (const item of measurements) {
      expect(item.height).toBeGreaterThan(item.width);
      expect(item.papers).toBe(5);
      expect(item.faceInside).toBe(true);
      expect(item.sheetTransitions).toEqual(["0s", "0s", "0s", "0s", "0s"]);
    }
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "unexpected overflow at " + width).toBeLessThanOrEqual(1);
    if (width === 1440)
      await page.locator(".folder-rack--work").screenshot({
        path: "test-results/folder-rack-" + testInfo.project.name + ".png",
        animations: "disabled",
      });
  }
});