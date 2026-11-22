import { test, expect } from "@playwright/test";

const homeFolders = page => page.locator(".home-folder-stack__cards .project-folder");
const track = page => page.locator(".home-folder-stack__cards");

test("Home uses three standing versions of the real landscape Work folders", async ({ page }) => {
  await page.goto("/");
  await expect(track(page)).toHaveClass(/is-folder-interactive/);
  await expect(homeFolders(page)).toHaveCount(3);
  await expect(page.locator(".home-folder-stack .project-folder__paper")).toHaveCount(15);
  const expected = [
    ["tedx-rsu", "TEDx Rivers State University"],
    ["rivo", "Rivo Studio"],
    ["chopbox", "ChopBox"]
  ];
  for (const [i, [slug, title]] of expected.entries()) {
    const folder = homeFolders(page).nth(i);
    await expect(folder.locator(".project-folder__link"))
      .toHaveAttribute("href", "work/" + slug + ".html");
    await expect(folder.locator(".project-folder__title")).toHaveText(title);
    await expect(folder.locator(".project-folder__spine")).toHaveText(title);
    await expect(folder.locator(".project-folder__paper")).toHaveCount(5);
    const ratio = await folder.evaluate(el => el.offsetWidth / el.offsetHeight);
    expect(ratio, "Home folder is physically upright").toBeCloseTo(.66, 1);
  }
  await expect(page.locator(".home-project-list .project-roster__row")).toHaveCount(0);
});

test("Home and Work share paper surfaces but not folder orientation", async ({ page }) => {
  await page.goto("/");
  const homeRatio = await homeFolders(page).first().evaluate(el => el.offsetWidth / el.offsetHeight);
  await page.goto("/work.html");
  const workRatio = await page.locator(".project-folder").first()
    .evaluate(el => el.offsetWidth / el.offsetHeight);
  expect(homeRatio).toBeLessThan(.8);
  expect(workRatio).toBeCloseTo(47 / 38, 2);
  await expect(page.locator(".project-folder__paper")).toHaveCount(15);
  await expect(page.locator(".project-folder__spine")).toHaveCount(0);
});

test("hover logically opens the correct standing folder and moves siblings aside", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch interaction has a separate first-tap preview contract");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const folders = homeFolders(page);
  const list = track(page);
  const first = await folders.first().boundingBox();
  await page.mouse.move(first.x + 20, first.y + first.height * .6);
  await expect(list).toHaveAttribute("data-active-index", "0");
  const later = await folders.nth(1).boundingBox();
  expect(later.x).toBeGreaterThan(first.x + first.width - 20);
  await page.mouse.move(later.x + 18, later.y + later.height * .6);
  await expect(list).toHaveAttribute("data-active-index", "1");
  await expect(folders.nth(1)).toHaveClass(/is-active/);
});

test("first touch previews, second touch opens the selected case", async ({ page }) => {
  await page.goto("/");
  const folder = homeFolders(page).first();
  await folder.scrollIntoViewIfNeeded();
  const box = await folder.boundingBox();
  const x = box.x + Math.min(25, box.width * .2);
  const y = box.y + box.height * .5;
  const tap = async () => {
    await page.evaluate(({ x, y }) => {
      const list = document.querySelector(".home-folder-stack__cards");
      list.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true, pointerType: "touch", clientX: x, clientY: y
      }));
      list.dispatchEvent(new MouseEvent("click", {
        bubbles: true, cancelable: true, detail: 1, clientX: x, clientY: y
      }));
    }, { x, y });
  };
  await tap();
  await expect(track(page)).toHaveAttribute("data-active-index", "0");
  await expect(page).toHaveURL(/\/(?:index\.html)?$/);
  await tap();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("keyboard focus and Enter navigate to the focused standing folder", async ({ page }) => {
  await page.goto("/");
  const link = homeFolders(page).nth(1).locator(".project-folder__link");
  await link.focus();
  await expect(link).toBeFocused();
  await expect(track(page)).toHaveAttribute("data-active-index", "1");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("All Work remains a large centered accessible link below the Home folders", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: /all work/i }).first();
  await expect(link).toHaveAttribute("href", "work.html");
  await link.scrollIntoViewIfNeeded();
  const rect = await link.boundingBox();
  expect(rect.width).toBeGreaterThanOrEqual(240);
  expect(Math.abs(rect.x + rect.width / 2 - page.viewportSize().width / 2)).toBeLessThan(10);
});

test("standing folders avoid document overflow and respect reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(homeFolders(page)).toHaveCount(3);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow, "no document-level horizontal overflow").toBeLessThanOrEqual(2);
    await expect(homeFolders(page).first()).toHaveCSS("transition-duration", "0s");
  }
});

test("no-JavaScript Home still shows each real folder as a native case link", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".home-folder-stack__cards .project-folder__link")).toHaveCount(3);
  await context.close();
});
