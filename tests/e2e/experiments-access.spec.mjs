import { test, expect } from "@playwright/test";

test("Experiments exposes site navigation, footer, and natural vertical scrolling", async ({ page }) => {
  await page.goto("/experiments.html");
  await expect(page.locator("header.site-nav")).toBeVisible();
  await expect(page.locator("header.site-nav .site-nav__brand")).toBeVisible();
  await expect(page.locator(".experiments-nav__back")).toHaveCount(0);
  await expect(page.locator(".metadata-strip dt")).toHaveText(["Study", "Medium"]);
  await expect(page.locator(".experiment-poster")).toHaveCount(7);
  await expect(page.locator(".experiments-static")).toHaveCount(0);
  await expect(page.locator(".experiment-poster[data-active]")).toBeVisible();
  await expect(page.locator("[data-experiments-next]")).toBeVisible();
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

test("Homepage uses accessible physical folders, not the retired image-lens preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const list = page.locator(".home-folder-stack__cards");
  await expect(list).toHaveAttribute("data-navigation", "native");
  const links = list.locator(".project-folder__link");
  await expect(links).toHaveCount(3);
  await expect(list.locator(".project-folder__paper")).toHaveCount(15);
  await expect(list.locator(".project-folder__title")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "ChopBox"
  ]);
  for (const [index, slug] of ["tedx-rsu", "rivo", "chopbox"].entries()) {
    await expect(links.nth(index)).toHaveAttribute("href", "work/" + slug + ".html");
  }
  await expect(page.locator("#selected-work canvas, #selected-work .editorial-index")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(list.locator(".project-folder").first()).toHaveCSS("transition-duration", /^(?:0|1e-05)s$/);
});
