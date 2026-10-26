import { test, expect } from "@playwright/test";

const pages = [
  ["home", "/index.html"], ["work", "/work.html"],
  ["about", "/about.html"], ["services", "/services.html"], ["contact", "/contact.html"],
  ["notes", "/playground.html"], ["case", "/work/rivo.html"],
  ["article", "/writing/designing-for-disability-in-nigeria.html"], ["privacy", "/privacy.html"]
];

for (const [name, route] of pages) {
  for (const theme of ["light", "dark"]) {
    test(`${name} — ${theme}`, async ({ page }, testInfo) => {
      // Software WebGL on hosted runners needs time to capture the full-height
      // homepage canvas. Keep the same pixel comparison and approved baseline.
      if (name === "home") test.setTimeout(120_000);
      test.skip(testInfo.project.name === "reduced-motion", "Viewport baselines are captured by desktop and mobile projects");
      await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
      await page.goto(name === "home" ? `${route}?shader-test=1&shader-static=1&visual-static=1` : `${route}?visual-static=1`);
      await page.addStyleTag({ content: `
        *{content-visibility:visible!important}
        .case-chapter :is(.case-chapter__label,.case-chapter__copy h2,.case-chapter__body){opacity:1!important;transform:none!important}
      ` });
      await page.evaluate(async () => {
        await document.fonts?.ready;
        for (const image of document.images) {
          image.loading = "eager";
          const source = image.currentSrc || image.src;
          image.srcset = "";
          image.src = source;
        }
        await Promise.all([...document.images].map(image => image.decode?.().catch(() => {}) || Promise.resolve()));
        window.scrollTo(0, 0);
      });
      await expect.poll(() => page.locator("img").evaluateAll(images => images
        .filter(image => !image.complete || image.naturalWidth === 0)
        .map(image => image.currentSrc || image.src)), { timeout: 20_000 }).toEqual([]);
      if (name === "case") {
        // Chromium can report lazy images complete before offscreen tiles have
        // been painted. Traverse the document once so the baseline captures
        // the actual case rather than intermittent blank compositor tiles.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
            scrollTo(0, y);
            await new Promise(resolve => requestAnimationFrame(resolve));
          }
          scrollTo(0, 0);
          await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        });
      }
      if (name === "home") {
        await expect(page.locator('[data-shader-backdrop]')).toHaveClass(/is-ready/);
        await expect(page.locator('[data-shader-overlay]')).toHaveClass(/is-ready/);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      }
      await page.waitForTimeout(500);
      await expect(page.locator(".site-footer__signature")).toHaveClass(/is-enhanced/);
      const masks = [page.locator('img[src$=".gif"]')];
      if (name === "case") masks.push(page.locator(".case-shot img"));
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, {
        fullPage: true,
        // The animated portrait and Chromium's offscreen image tiles are
        // nondeterministic in full-page captures. Asset integrity and loading
        // are tested separately; these masks retain exact rendered geometry.
        mask: masks,
        maskColor: "#eceef3",
        timeout: name === "home" ? 60_000 : name === "case" ? 30_000 : 10_000,
      });
    });
  }
}
