import { readdir } from "node:fs/promises";
import { test, expect } from "@playwright/test";

test("every generated page preserves its reading path at narrow widths and without JS", async ({ browser, baseURL }) => {
  test.setTimeout(120_000);
  const routes = (await readdir("dist", { recursive: true }))
    .filter(path => path.endsWith(".html")).sort();
  expect(routes.length).toBeGreaterThan(0);
  const modes = [
    { label: "320px", width: 320, javaScriptEnabled: true },
    { label: "200% text", width: 640, javaScriptEnabled: true, fontSize: "200%" },
    { label: "320px without JS", width: 320, javaScriptEnabled: false }
  ];
  const titles = new Map();

  for (const { label, width, javaScriptEnabled, fontSize } of modes) {
    const context = await browser.newContext({
      baseURL, javaScriptEnabled, reducedMotion: "reduce", viewport: { width, height: 900 }
    });
    try {
      if (fontSize) await context.addInitScript(size => {
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.fontSize = size;
        }, { once: true });
      }, fontSize);
      const page = await context.newPage();
      for (const route of routes) await test.step(`${route} / ${label}`, async () => {
        const response = await page.goto("/" + route, { waitUntil: "domcontentloaded" });
        expect(response.ok()).toBe(true);
        if (route === "community.html") await expect(page).toHaveURL(/\/experiments\.html$/);
        else await expect(page).toHaveURL(new URL(route, baseURL).href);

        if (javaScriptEnabled) await expect(page.locator(".theme-picker")).toBeAttached();
        if (fontSize) await expect(page.locator("html")).toHaveCSS("font-size", "32px");
        const title = page.getByRole("main").getByRole("heading", { level: 1 });
        await expect(title).toHaveCount(1);
        await expect(title).toBeVisible();
        if (!titles.has(route)) titles.set(route, (await title.textContent()).trim());
        else await expect(title).toHaveText(titles.get(route));

        if (!javaScriptEnabled) await expect(page.locator(".site-nav__links a[href$='work.html']").first()).toBeVisible();
        const overflow = await page.evaluate(async () => {
          await document.fonts.ready;
          return document.documentElement.scrollWidth - document.documentElement.clientWidth;
        });
        expect(overflow).toBeLessThanOrEqual(1);
        const { x, width: titleWidth } = await title.boundingBox();
        expect(x).toBeGreaterThanOrEqual(-1);
        expect(x + titleWidth).toBeLessThanOrEqual(width + 1);
      });
    } finally {
      await context.close();
    }
  }
});
