import { test, expect } from "@playwright/test";

test("Experiments exposes site navigation, footer, and natural vertical scrolling", async ({ page }) => {
  await page.goto("/experiments.html");
  await expect(page.locator("header.site-nav")).toBeVisible();
  await expect(page.locator("header.site-nav .site-nav__brand")).toBeVisible();
  await expect(page.locator(".experiments-nav__back")).toHaveAttribute("href", "work.html");
  await expect(page.locator(".experiment-poster")).toHaveCount(7);
  const shell = await page.evaluate(() => ({
    overflow: getComputedStyle(document.body).overflowY,
    height: document.documentElement.scrollHeight,
    viewport: document.documentElement.clientHeight,
    footer: getComputedStyle(document.querySelector("footer.site-footer")).display,
  }));
  expect(shell.overflow).not.toBe("hidden");
  expect(shell.height).toBeGreaterThan(shell.viewport);
  expect(shell.footer).not.toBe("none");
  await page.locator("[data-experiments-viewport]").hover({ position: { x: 15, y: 160 } });
  const top = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 680);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(top);
  await page.locator("footer.site-footer").scrollIntoViewIfNeeded();
  await expect(page.locator("footer.site-footer")).toBeVisible();
  await expect(page.locator("footer.site-footer a[href='work.html']").first()).toBeVisible();
});

test("Experiments arrows, index, and browser history honor deep-linked studies", async ({ page }) => {
  await page.goto("/experiments.html");
  await expect(page.locator(".experiment-poster")).toHaveCount(7);
  await page.locator("[data-experiments-next]").click();
  await expect(page).toHaveURL(/#study-02$/);
  await expect(page.locator("[data-experiment-title]")).toContainText("GCFR Serial Killer");
  await page.goBack();
  await expect(page).toHaveURL(/\/experiments\.html$/);
  await expect(page.locator("[data-experiment-title]")).toContainText("Wada Sanzō");
  await page.goForward();
  await expect(page).toHaveURL(/#study-02$/);
  await page.locator("[data-experiments-index]").click();
  await expect(page.locator("[data-experiments-list]")).toBeVisible();
  await page.locator('[data-experiment-jump="4"]').click();
  await expect(page).toHaveURL(/#study-05$/);
  await expect(page.locator("[data-experiment-title]")).toContainText("Peter Obi Posters, 02");
  await expect(page.locator("[data-experiments-list]")).toBeHidden();
});

test("Experiment gallery supports keyboard navigation and a usable no-JS fallback", async ({ page, browser }) => {
  await page.goto("/experiments.html#study-03");
  await expect(page.locator("[data-experiment-title]")).toContainText("Party");
  await page.locator("[data-experiments-viewport]").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#study-04$/);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJS = await context.newPage();
  await noJS.goto("/experiments.html");
  await expect(noJS.locator(".experiments-static__nav a")).toHaveCount(4);
  await expect(noJS.locator("#experiments-after a")).toHaveCount(3);
  await expect(noJS.locator(".experiments-static__grid a")).toHaveCount(7);
  await context.close();
});

test("Homepage optical lens preserves all project links without another WebGL scene", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const visuals = page.locator(".home-project-list__visual");
  await expect(visuals).toHaveCount(3);
  await expect(visuals.first().locator("img")).toHaveCount(1);
  await expect(page.locator(".home-project-list canvas")).toHaveCount(0);
  const finePointer = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  if (finePointer) await expect.poll(() => visuals.nth(1).evaluate(el => getComputedStyle(el).clipPath)).not.toBe("none");
  const links = page.locator(".home-project-list .editorial-index__row");
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute("href", /work\/.+\.html$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(visuals.nth(1)).toHaveCSS("clip-path", "none");
});
