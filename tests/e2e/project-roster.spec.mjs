import { test, expect } from "@playwright/test";

const homeFolders = page => page.locator(".home-folder-stack__cards .project-folder");
const homeTrack = page => page.locator(".home-folder-stack__cards");

test("Home renders the landscape folder material from Work, not standing versions", async ({ page }) => {
  await page.goto("/");
  await expect(homeTrack(page)).toHaveClass(/is-folder-interactive/);
  await expect(homeFolders(page)).toHaveCount(3);
  const cases = [
    ["tedx-rsu", "TEDx Rivers State University"],
    ["rivo", "Rivo Studio"],
    ["chopbox", "ChopBox"],
  ];
  for (const [i, [slug, title]] of cases.entries()) {
    const folder = homeFolders(page).nth(i);
    await expect(folder.locator(".project-folder__link")).toHaveAttribute("href", "work/" + slug + ".html");
    await expect(folder.locator(".project-folder__title")).toHaveText(title);
    await expect(folder.locator(".project-folder__paper")).toHaveCount(5);
    const bounds = await folder.boundingBox();
    expect(bounds.width).toBeGreaterThan(bounds.height);
    expect(bounds.height, "Home folders must be twice the old compact height").toBeGreaterThan(310);
  }
  await expect(page.locator(".home-folder-stack .project-folder__spine")).toHaveCount(0);
});

test("Home folders are approximately twice as tall as the compact Work folders", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const homeHeight = await homeFolders(page).first().evaluate(el => el.offsetHeight);
  await page.goto("/work.html");
  const workHeight = await page.locator(".project-folder").first().evaluate(el => el.offsetHeight);
  expect(homeHeight).toBeGreaterThan(workHeight * 1.7);
  expect(homeHeight).toBeLessThan(workHeight * 2.8);
  await expect(page.locator(".project-folder__paper")).toHaveCount(15);
  await expect(page.locator(".project-folder__spine")).toHaveCount(0);
});

test("hover opens the right Home landscape folder and moves subsequent folders down", async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const folders = homeFolders(page);
  if (isMobile) {
    await folders.nth(1).locator(".project-folder__link").focus();
    await expect(homeTrack(page)).toHaveAttribute("data-active-index", "1");
    await expect(folders.nth(1)).toHaveClass(/is-active/);
    return;
  }
  await folders.first().scrollIntoViewIfNeeded();
  const first = await folders.first().boundingBox();
  await page.mouse.move(first.x + 25, first.y + 12);
  await expect(homeTrack(page)).toHaveAttribute("data-active-index", "0");
  const activeFirst = await folders.first().boundingBox();
  const second = await folders.nth(1).boundingBox();
  const layering = await folders.evaluateAll(nodes => nodes.map(el => Number(getComputedStyle(el).zIndex)));
  expect(layering[1], "following folder must paint above the hovered folder").toBeGreaterThan(layering[0]);
  expect(second.y, "next folder is still below the hovered folder's top").toBeGreaterThan(activeFirst.y);
  expect(second.y, "next folder still hides the lower portion of the hovered folder")
    .toBeLessThan(activeFirst.y + activeFirst.height * .75);
  await page.mouse.move(second.x + 25, second.y + 12);
  await expect(homeTrack(page)).toHaveAttribute("data-active-index", "1");
  await expect(folders.nth(1)).toHaveClass(/is-active/);
});

test("the first touch previews a landscape folder; the second opens the case", async ({ page }) => {
  await page.goto("/");
  const first = homeFolders(page).first();
  await first.scrollIntoViewIfNeeded();
  const bounds = await first.boundingBox();
  const point = { x: bounds.x + 25, y: bounds.y + 14 };
  async function tap() {
    await page.evaluate(({ x, y }) => {
      const list = document.querySelector(".home-folder-stack__cards");
      list.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true, pointerType: "touch", clientX: x, clientY: y
      }));
      list.dispatchEvent(new MouseEvent("click", {
        bubbles: true, cancelable: true, detail: 1, clientX: x, clientY: y
      }));
    }, point);
  }
  await tap();
  await expect(homeTrack(page)).toHaveAttribute("data-active-index", "0");
  await expect(page).toHaveURL(/\/(?:index\.html)?$/);
  await tap();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("keyboard focus and Enter navigate the shared case-study route transition", async ({ page }) => {
  await page.goto("/");
  const link = homeFolders(page).nth(1).locator(".project-folder__link");
  await link.focus();
  await expect(homeTrack(page)).toHaveAttribute("data-active-index", "1");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("the Home folder section fills a screen without a heading or All Work button", async ({ page }) => {
  for (const size of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await page.goto("/");
    const section = page.locator("#selected-work");
    await expect(section).toHaveAttribute("aria-label", "Selected work");
    await expect(section.locator("h2, .swiss-section-head")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^all work$/i })).toHaveCount(0);
    const sectionHeight = await section.evaluate(el => el.getBoundingClientRect().height);
    expect(sectionHeight).toBeGreaterThanOrEqual(size.height - 5);
  }
});

test("responsive landscape folders do not overflow the document and honor reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(homeFolders(page)).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(homeFolders(page).first()).toHaveCSS("transition-duration", "0s");
  }
});

test("Home keeps native case-study links when JavaScript is off", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".home-folder-stack__cards .project-folder__link")).toHaveCount(3);
  await context.close();
});

test("Selected Work folders and What I Do cards match the water rectangle's horizontal edges", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index.html");
    await expect(homeTrack(page)).toHaveClass(/is-folder-interactive/);
    await expect(page.locator("#what-i-do .service-stack__card")).toHaveCount(5);
    const edges = await page.evaluate(() => {
      const box = selector => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      };
      return {
        water: box(".home-landing"),
        selected: box("#selected-work"),
        folder: box(".home-folder-stack__cards .project-folder"),
        service: box("#what-i-do .service-stack__card"),
      };
    });
    for (const target of ["selected", "folder", "service"]) {
      expect(Math.abs(edges[target].left - edges.water.left),
        target + " left edge at " + width).toBeLessThanOrEqual(2);
      expect(Math.abs(edges[target].right - edges.water.right),
        target + " right edge at " + width).toBeLessThanOrEqual(2);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  }
});
