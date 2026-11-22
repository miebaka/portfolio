import { test, expect } from "@playwright/test";

const homeFolders = page => page.locator(".home-folder-stack__cards .project-folder");

test("explicit Reduce keeps every Home proof chapter readable without staged motion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("motion-preference", "reduce"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".home-landing h1")).toBeVisible();
  await expect(page.locator("#selected-work")).toHaveAttribute("aria-label", "Selected work");
  await expect(homeFolders(page).locator(".project-folder__title")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "ChopBox"
  ]);
  await expect(page.locator("#about-title")).toHaveCSS("opacity", "1");
  await expect(page.locator(".service-stack__item").first()).toHaveCSS("position", "relative");
  await expect(page.locator(".home-landing h1 > span").first()).toHaveCSS("animation-name", "none");
  await expect(homeFolders(page).first()).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "paused");
});

test("selected Home file rises inside the cabinet without becoming the foreground file", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  const stack = page.locator(".home-folder-stack__cards");
  await expect(stack).toHaveClass(/is-folder-interactive/);
  const folders = homeFolders(page);
  const link = folders.first().locator(".project-folder__link");
  await link.focus();
  await expect(folders.first()).toHaveClass(/is-active/);
  const z = await folders.evaluateAll(nodes => nodes.map(node => Number(getComputedStyle(node).zIndex)));
  expect(z[0]).toBeLessThan(z[1]);
  expect(z[1]).toBeLessThan(z[2]);
  const rest = await folders.first().evaluate(node => node.style.getPropertyValue("--folder-y"));
  expect(rest).not.toBe("");
  await expect(folders.first().locator(".project-folder__title")).toHaveText("TEDx Rivers State University");
  expect(await link.evaluate(node => node.style.getPropertyValue("--motion-preview-x"))).toBe("");
  expect(await link.evaluate(node => node.style.getPropertyValue("--motion-preview-y"))).toBe("");
});

test("on-page switch from Full to Reduce preserves selected file and stops transitions", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("motion-preference", "full"));
  await page.goto("/index.html");
  const folders = homeFolders(page);
  await expect(page.locator(".home-folder-stack__cards")).toHaveClass(/is-folder-interactive/);
  await folders.nth(1).locator(".project-folder__link").focus();
  await expect(folders.nth(1)).toHaveClass(/is-active/);
  await page.evaluate(() => { document.documentElement.dataset.motion = "reduced"; });
  await expect(folders.nth(1)).toHaveCSS("transition-duration", "0s");
  await expect(folders.nth(1).locator(".project-folder__title")).toHaveText("Rivo Studio");
  const layering = await folders.evaluateAll(nodes => nodes.map(node => Number(getComputedStyle(node).zIndex)));
  expect(layering[0]).toBeLessThan(layering[1]);
  expect(layering[1]).toBeLessThan(layering[2]);
  await expect(page.locator("#about-title")).toHaveCSS("opacity", "1");
});
