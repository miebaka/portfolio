import { test, expect } from "@playwright/test";

/* Verify actual geometry, not just whether an em declaration exists. */
const routes = [
  "/index.html", "/work.html", "/about.html", "/contact.html",
  "/essays.html", "/experiments.html", "/work/rivo.html",
  "/work/tedx-rsu.html", "/work/chopbox.html"
];
const widths = [320, 390, 768, 1024, 1440];

for (const route of routes) {
  test(`route ${route} has no horizontal overflow at responsive widths`, async ({ page }) => {
    test.setTimeout(90_000);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator("main h1").first(), route).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        main: document.querySelector("main")?.getBoundingClientRect().width || 0
      }));
      expect(metrics.overflow, `${route} at ${width}px horizontally overflows`).toBeLessThanOrEqual(2);
      expect(metrics.main, `${route} at ${width}px has an empty main`).toBeGreaterThan(100);
    }
  });
}

test("mobile hero, editorial biography and footer honor the reading order", async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/index.html");
    const measure = await page.evaluate(() => {
      const box = selector => document.querySelector(selector)?.getBoundingClientRect().toJSON();
      return {
        hero: box(".home-landing"), profile: box(".home-profile"),
        introduction: box(".home-profile__introduction"),
        portrait: box(".home-profile__media"),
        footer: box(".site-footer__panel"),
        links: box(".site-footer__links")
      };
    });
    expect(measure.hero).toBeTruthy();
    expect(measure.profile).toBeTruthy();
    expect(measure.footer).toBeTruthy();
    expect(measure.links).toBeTruthy();
    expect(measure.hero.right).toBeLessThanOrEqual(width + 1);
    expect(measure.footer.right).toBeLessThanOrEqual(width + 1);
    if (width < 896) {
      expect(measure.introduction.right).toBeLessThanOrEqual(width + 1);
      expect(measure.portrait.right).toBeLessThanOrEqual(width + 1);
      expect(measure.introduction.bottom <= measure.portrait.top ||
        measure.portrait.bottom <= measure.introduction.top).toBe(true);
    }
  }
});

test("relative layout survives larger text without cutting off page headings", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/index.html", "/about.html", "/contact.html", "/work.html"]) {
    await page.goto(route);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    const title = page.locator("main h1").first();
    await expect(title).toBeVisible();
    const measured = await title.evaluate(element => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, width: box.width };
    });
    expect(measured.left, route).toBeGreaterThanOrEqual(-2);
    expect(measured.right, route).toBeLessThanOrEqual(392);
  }
});

test("the five approved breakpoint boundaries control responsive grids without overlap", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/about.html");
  const thresholds = [24, 40, 56, 72, 88];
  const points = thresholds.flatMap(em => [em * 16 - 1, em * 16]);
  for (const width of points) {
    await page.setViewportSize({ width, height: 900 });
    const result = await page.evaluate(steps => {
      const host = document.createElement("div");
      host.style.width = "100%";
      host.style.position = "absolute";
      host.style.visibility = "hidden";
      host.innerHTML = '<div class="grid"><span></span></div><div class="editorial-grid"><span></span></div>';
      document.body.append(host);
      const trackCount = selector => getComputedStyle(host.querySelector(selector))
        .gridTemplateColumns.split(/\s+/).filter(Boolean).length;
      const media = steps.map(value => matchMedia(`(min-width: ${value}em)`).matches);
      const info = { grid: trackCount(".grid"), editorial: trackCount(".editorial-grid"), media };
      host.remove();
      return info;
    }, thresholds);
    expect(result.media, `media boundaries at ${width}px`)
      .toEqual(thresholds.map(value => width >= value * 16));
    expect(result.grid, `generic grid at ${width}px`).toBe(width >= 896 ? 12 : 4);
    expect(result.editorial, `editorial grid at ${width}px`)
      .toBe(width >= 1152 ? 12 : width >= 896 ? 8 : 4);
  }
});
