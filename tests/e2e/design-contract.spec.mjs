import { captureState } from "../helpers/interaction-evidence.mjs";
import { test, expect } from "@playwright/test";

// Every canonical public template must remain readable, scroll-safe, and
// reachable at the narrow and wide sizes specified by DESIGN.md.
const routes = [
  ["/index.html", "Home"],
  ["/work.html", "Work"],
  ["/about.html", "About"],
  ["/experiments.html", "Experiments"],
  ["/essays.html", "Essays"],
  ["/contact.html", "Contact"],
  ["/privacy.html", "Privacy"],
  ["/404.html", "404"],
  ["/work/rivo.html", "Rivo"],
  ["/work/chopbox.html", "ChopBox"],
  ["/work/tedx-rsu.html", "TEDx"],
  ["/essays/when-the-swoosh-lost-its-soul.html", "Nike essay"],
  ["/essays/designing-for-disability-in-nigeria.html", "Accessibility essay"],
];

for (const [route, label] of routes) {
  test(`${label}: stable content and no horizontal viewport overflow at 320px and 1440px`, async ({ page }) => {
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator("main h1").first()).toBeVisible();
      const metrics = await page.evaluate(() => ({
        overflow: Math.ceil(document.documentElement.scrollWidth - document.documentElement.clientWidth),
        heading: document.querySelector("main h1")?.textContent?.trim().length || 0
      }));
      expect(metrics.heading).toBeGreaterThan(0);
      expect(metrics.overflow, `${label} overflows at ${width}px`).toBeLessThanOrEqual(1);
    }
  });
}

test("Experiments has a functioning, art-rich and navigable no-script fallback", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.goto("/experiments.html");
    await expect(page.getByRole("heading", { name: "Selected visual studies" })).toBeVisible();
    await expect(page.locator(".experiments-static__grid li")).toHaveCount(7);
    for (const path of ["work.html", "about.html", "essays.html", "contact.html"]) {
      await expect(page.locator(`.experiments-static__nav a[href="${path}"]`)).toBeVisible();
    }
    const thumbnails = await page.locator(".experiments-static__grid img").all();
    for (const thumbnail of thumbnails) await expect(thumbnail).toHaveAttribute("alt", /\S/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  } finally {
    await context.close();
  }
});

test("@interaction essays: Essay table of contents links to real headings and exposes the current section", async ({ page }, testInfo) => {
  await page.goto("/essays/when-the-swoosh-lost-its-soul.html");
  const toc = page.locator(".article-toc");
  await expect(toc).toBeVisible();
  const links = toc.locator("a[href^='#']");
  expect(await links.count()).toBeGreaterThan(1);
  const chapters = await links.evaluateAll(items => items.map(item => ({
    href: item.getAttribute("href"), text: item.textContent.trim(),
    present: Boolean(document.getElementById(item.getAttribute("href").slice(1)))
  })));
  for (const chapter of chapters) {
    expect(chapter.text.length).toBeGreaterThan(0);
    expect(chapter.present).toBe(true);
  }
  await expect(toc.locator('a[aria-current="location"]')).toHaveCount(1);
  await links.nth(1).click();
  await expect.poll(() => links.nth(1).getAttribute("aria-current")).toBe("location");
  await captureState(testInfo, toc, "essay-active-section");
});
