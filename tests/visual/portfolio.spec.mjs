import { test, expect } from "@playwright/test";

const pages = [
  ["home", "/index.html"], ["work", "/work.html"],
  ["about", "/about.html"], ["services", "/services.html"], ["contact", "/contact.html"]
];

for (const [name, route] of pages) {
  for (const theme of ["light", "dark"]) {
    test(`${name} — ${theme}`, async ({ page }, testInfo) => {
      // Software WebGL on hosted runners needs time to capture the full-height
      // homepage canvas. Keep the same pixel comparison and approved baseline.
      if (name === "home" && process.env.CI) test.setTimeout(120_000);
      test.skip(testInfo.project.name === "reduced-motion", "Viewport baselines are captured by desktop and mobile projects");
      await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
      await page.goto(name === "home" ? `${route}?shader-test=1&shader-static=1&visual-static=1` : `${route}?visual-static=1`);
      await page.addStyleTag({ content: "*{content-visibility:visible!important}" });
      await page.evaluate(async () => {
        await document.fonts?.ready;
        for (const image of document.images) {
          image.loading = "eager";
          const source = image.currentSrc || image.src;
          image.srcset = "";
          image.src = source;
        }
        window.scrollTo(0, 0);
      });
      await expect.poll(() => page.locator("img").evaluateAll(images => images
        .filter(image => !image.complete || image.naturalWidth === 0)
        .map(image => image.currentSrc || image.src)), { timeout: 20_000 }).toEqual([]);
      await page.waitForTimeout(500);
      await expect(page.locator(".site-footer__signature")).toHaveClass(/is-enhanced/);
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
        fullPage: true,
        timeout: name === "home" && process.env.CI ? 60_000 : 10_000,
      });
    });
  }
}
