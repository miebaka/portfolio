import { test, expect } from "@playwright/test";

test("Work's visual drawer has exactly three real files in true year order", async ({ page }) => {
  await page.goto("/work.html");
  const drawer = page.locator(".filing-cabinet__drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".filing-cabinet__folder")).toHaveCount(3);
  await expect(drawer.locator(".filing-cabinet__divider")).toHaveCount(3);
  await expect(drawer.locator(".filing-cabinet__folder").nth(0)).toHaveAttribute("data-year", "2024");
  await expect(drawer.locator(".filing-cabinet__folder").nth(1)).toHaveAttribute("data-year", "2023");
  await expect(drawer.locator(".filing-cabinet__folder").nth(2)).toHaveAttribute("data-year", "2022");
  await expect(drawer.locator(".filing-cabinet__folder").nth(0)).toHaveAttribute("data-tab", "a");
  await expect(drawer.locator(".filing-cabinet__folder").nth(1)).toHaveAttribute("data-tab", "b");
  await expect(drawer.locator(".filing-cabinet__folder").nth(2)).toHaveAttribute("data-tab", "c");
  await expect(drawer.locator(".filing-cabinet__tab-title")).toHaveText([
    "Rivo Studio", "TEDx Rivers State University", "ChopBox",
  ]);
  await expect(drawer.locator(".filing-cabinet__folder--sealed")).toHaveCount(0);
  const links = await drawer.locator("a").evaluateAll(elements =>
    elements.map(element => ({ href: new URL(element.href).pathname, label: element.textContent })));
  expect(links.map(({ href }) => href)).toEqual([
    "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html",
  ]);
  for (const { label } of links) expect(label).toMatch(/case study/i);
});

test("Work cabinet remains real HTML when JavaScript is disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto("/work.html");
    const drawer = page.locator(".filing-cabinet__drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator(".filing-cabinet__link")).toHaveCount(3);
    await expect(drawer.locator(".filing-cabinet__tab-title")).toHaveText([
      "Rivo Studio", "TEDx Rivers State University", "ChopBox",
    ]);
    await expect(page.locator(".filing-cabinet__register-title")).toHaveText("Rivo Studio");
    await expect(page.locator(".project-archive__progress li")).toHaveCount(3);
    // The raised physical tab remains a direct link target, even when
    // its paper face extends underneath the next folder.
    await page.locator(".filing-cabinet__tab").first().click();
    await expect(page).toHaveURL(/\/work\/rivo\.html$/);
  } finally {
    await context.close();
  }
});

test("Work cabinet keeps full project labels and native links at narrow widths and 200% zoom", async ({ page }) => {
  await page.goto("/work.html");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const values = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      links: [...document.querySelectorAll(".filing-cabinet__link")].map(link => {
        const rect = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        return { width: rect.width, height: rect.height, display: style.display };
      }),
    }));
    expect(values.overflow).toBeLessThanOrEqual(1);
    for (const link of values.links) {
      expect(link.display).toBe("block");
      expect(link.height).toBeGreaterThanOrEqual(44);
      expect(link.width).toBeGreaterThanOrEqual(44);
    }
  }
  await page.setViewportSize({ width: 768, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(1);
});

test("Work uses native scrolling rather than Lenis, including explicit motion opt-in", async ({ page }) => {
  await page.goto("/work.html?motion-test=1");
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", "native");
  await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
});
