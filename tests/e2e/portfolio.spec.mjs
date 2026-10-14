import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const routes = [
  "/index.html", "/work.html", "/explorations.html", "/community.html", "/about.html",
  "/services.html", "/playground.html", "/contact.html", "/privacy.html", "/404.html",
  "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html", "/work/christian-poster-a-week.html",
  "/writing/designing-for-disability-in-nigeria.html", "/writing/when-the-swoosh-lost-its-soul.html"
];

const settle = async page => {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
};

for (const route of routes) {
  test(`${route} has a healthy document contract`, async ({ page }) => {
    const consoleErrors = [];
    const failedLocalResources = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", request => {
      const url = new URL(request.url());
      if (url.origin === "http://127.0.0.1:4173") failedLocalResources.push(`${request.method()} ${url.pathname}`);
    });
    page.on("response", response => {
      const url = new URL(response.url());
      if (url.origin === "http://127.0.0.1:4173" && response.status() >= 400) {
        failedLocalResources.push(`${response.request().method()} ${url.pathname} (${response.status()})`);
      }
    });
    const response = await page.goto(route);
    await settle(page);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(overflow.scroll, `horizontal overflow on ${route}`).toBeLessThanOrEqual(overflow.client + 1);
    expect(failedLocalResources).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test(`@a11y ${route} has no serious axe violations in both themes`, async ({ page }) => {
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
      await page.goto(route);
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter(item => ["serious", "critical"].includes(item.impact)), `${route} ${theme}`).toEqual([]);
    }
  });
}

test("Home → TEDx → next project preserves the intended journey", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("link", { name: /TEDx RSU, view project/i }).click();
  await expect(page).toHaveURL(/work\/tedx-rsu(?:\.html)?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("global event system");
  await expect(page.getByRole("region", { name: "Next project" })).toContainText("ChopBox");
});

test("Index opens, navigates, closes, traps focus and restores focus", async ({ page }) => {
  await page.goto("/index.html");
  const trigger = page.getByRole("button", { name: "Index" });
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Index" });
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const controls = dialog.locator('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])').filter({ visible: true });
  const first = controls.first();
  const last = controls.last();
  await expect(first).toBeFocused();
  const count = await controls.count();
  for (let index = 0; index < count; index += 1) await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("link", { name: /Work/ }).click();
  await expect(page).toHaveURL(/work(?:\.html)?$/);
});

test("About exposes the CV only when configured", async ({ page }) => {
  await page.goto("/about.html");
  const cv = page.locator('[data-mount="cv"] a[download]');
  if (await cv.count()) await expect(cv).toHaveAttribute("href", /\.(pdf|docx?)$/i);
  else await expect(page.locator('[data-mount="cv"]')).toBeEmpty();
});

test("Work distinguishes available and coming-soon projects", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.getByRole("link", { name: /TEDx RSU/ })).toHaveAttribute("href", "work/tedx-rsu.html");
  await expect(page.locator(".project-archive__state", { hasText: "Coming soon" })).toHaveCount(5);
});

test("empty routes remain intentional and navigable", async ({ page }) => {
  for (const route of ["/explorations.html", "/community.html"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Index" })).toBeVisible();
  }
});

test("theme selection persists", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("button", { name: "Index" }).click();
  await page.getByRole("button", { name: /Screen.*Dark/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("client marquee can be paused", async ({ page }) => {
  await page.goto("/index.html");
  const control = page.locator(".client-marquee__control");
  await expect(control).toBeAttached();
  if ((await page.locator("html").getAttribute("data-motion")) === "reduced") {
    await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "static");
    await expect(control).toHaveAttribute("aria-disabled", "true");
    return;
  }
  await control.click();
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "paused");
});

test("@a11y explicit focus, descriptions and computed reduced-motion behavior", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact.html");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  for (const name of ["name", "email", "interest", "message"]) {
    const field = page.locator(`[name="${name}"]`);
    const ids = (await field.getAttribute("aria-describedby"))?.split(/\s+/) || [];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) await expect(page.locator(`#${id}`)).toBeAttached();
  }
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.goto("/index.html");
  const motion = await page.locator(".client-marquee__track").evaluate(element => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, animationDuration: style.animationDuration, transform: style.transform };
  });
  expect(motion.animationName).toBe("none");
  expect(motion.animationDuration).toBe("0s");
  expect(motion.transform).toBe("none");
});

test("@a11y full WCAG text spacing does not hide content or create overflow", async ({ page }) => {
  await page.goto("/contact.html");
  await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
  await settle(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Work with me" })).toBeVisible();
});

test("@a11y forced colours retain the primary experience", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Forced colours are asserted in Chromium");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/index.html");
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Index" })).toBeVisible();
  await page.getByRole("button", { name: "Index" }).focus();
  const forced = await page.getByRole("button", { name: "Index" }).evaluate(element => ({ color: getComputedStyle(element).color, adjust: getComputedStyle(element).forcedColorAdjust }));
  expect(forced.color).not.toBe("");
  expect(forced.adjust).toBe("auto");
});

test("@a11y 200% zoom retains content and avoids horizontal overflow", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Index" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("navigation works without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/index.html`);
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/work(?:\.html)?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Selected work");
  await context.close();
});
