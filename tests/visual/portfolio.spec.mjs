import { test, expect } from "@playwright/test";

const pages = [
  ["home", "/index.html"], ["work", "/work.html"], ["tedx", "/work/tedx-rsu.html"],
  ["about", "/about.html"], ["services", "/services.html"], ["contact", "/contact.html"]
];

test.beforeEach(async ({ page }) => {
  await page.route("https://ws.audioscrobbler.com/**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ recenttracks: { track: [] } }) }));
});

for (const [name, route] of pages) {
  for (const theme of ["light", "dark"]) {
    test(`${name} — ${theme}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name === "reduced-motion", "Viewport baselines are captured by desktop and mobile projects");
      await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
      await page.goto(name === "home" ? `${route}?shader-test=1` : route);
      await page.evaluate(async () => { await document.fonts?.ready; window.scrollTo(0, 0); });
      await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { fullPage: true });
    });
  }
}

for (const theme of ["light", "dark"]) {
  test(`index — ${theme}`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "reduced-motion", "Viewport baselines are captured by desktop and mobile projects");
    await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
    await page.goto("/index.html");
    await page.getByRole("button", { name: "Index" }).click();
    await expect(page.getByRole("dialog", { name: "Index" })).toBeVisible();
    await expect(page).toHaveScreenshot(`index-${theme}.png`, { fullPage: true });
  });
}
