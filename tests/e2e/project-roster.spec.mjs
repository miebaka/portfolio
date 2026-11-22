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
    expect(bounds.width).toBeGreaterThan(250);
    if (page.viewportSize().width >= 768) {
      expect(bounds.width).toBeGreaterThan(bounds.height);
    }
    if (page.viewportSize().width <= 768) {
      expect(bounds.height, "phone files should be shorter than full-screen panels").toBeGreaterThanOrEqual(272);
      expect(bounds.height).toBeLessThanOrEqual(337);
    } else {
      expect(bounds.height, "desktop files match the full What I Do panels").toBeGreaterThanOrEqual(395);
    }
  }
  await expect(page.locator(".home-folder-stack .project-folder__spine")).toHaveCount(0);
});

test("Selected Work rests at the bottom of its section with a clear gap after the water hero", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index.html");
    await expect(homeTrack(page)).toHaveClass(/is-folder-interactive/);
    const bounds = await page.evaluate(() => {
      const rect = s => document.querySelector(s).getBoundingClientRect();
      const final = rect(".home-folder-stack__cards .project-folder:last-child");
      const first = rect(".home-folder-stack__cards .project-folder:first-child");
      const hero = rect(".home-landing");
      const section = rect("#selected-work");
      return { gap: first.top - hero.bottom, bottom: section.bottom - final.bottom, viewport: innerHeight };
    });
    expect(bounds.gap).toBeGreaterThan(bounds.viewport * .24);
    expect(bounds.bottom).toBeGreaterThanOrEqual(0);
    expect(bounds.bottom).toBeLessThan(110);
  }
});

test("Desktop files match service card heights; mobile uses compact readable sections", async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(homeTrack(page)).toHaveClass(/is-folder-interactive/);
    const comparison = await page.evaluate(() => {
      const folders = [...document.querySelectorAll(".home-folder-stack__cards .project-folder")];
      const cards = [...document.querySelectorAll("#what-i-do .service-stack__card")];
      return {
        heights: folders.map(el => el.getBoundingClientRect().height),
        services: cards.map(el => el.getBoundingClientRect().height),
        pitches: folders.map(el => el.getBoundingClientRect().top),
        title: folders[0].querySelector(".project-folder__title").getBoundingClientRect().toJSON()
      };
    });
    expect(comparison.services).toHaveLength(5);
    expect(comparison.heights).toHaveLength(3);
    if (viewport.width >= 768) {
      for (const folderHeight of comparison.heights) {
        for (const cardHeight of comparison.services) {
          expect(Math.abs(folderHeight - cardHeight)).toBeLessThanOrEqual(2);
        }
      }
    } else {
      expect(Math.max(...comparison.heights)).toBeLessThanOrEqual(337);
      await expect(page.locator("#what-i-do .service-stack__item").first()).toHaveCSS("position", "relative");
      await expect(page.locator("#what-i-do .service-stack__tags").first()).toBeHidden();
    }
    expect(comparison.pitches[1]).toBeGreaterThan(comparison.pitches[0]);
    expect(comparison.pitches[1]).toBeLessThan(comparison.pitches[0] + comparison.heights[0]);
    await page.goto("/work.html");
    const workHeight = await page.locator(".project-folder").first().evaluate(el => el.getBoundingClientRect().height);
    expect(workHeight).toBeLessThanOrEqual(310);
  }
});

test("hover lifts the right Home folder into reserved space without moving the other folders", async ({ page, isMobile }) => {
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
  // The selected file slides upward *behind* those with a later index.
  // The next folder still covers the lower part of the raised folder.
  await expect.poll(async () => {
    const firstBox = await folders.first().boundingBox();
    return Math.round(first.y - firstBox.y);
  }).toBeGreaterThan(70);
  const activeFirst = await folders.first().boundingBox();
  const second = await folders.nth(1).boundingBox();
  const layering = await folders.evaluateAll(nodes => nodes.map(el => Number(getComputedStyle(el).zIndex)));
  expect(layering[0], "active Home folder must remain behind the next folder").toBeLessThan(layering[1]);
  expect(layering[1], "last folder remains at the front of the file cabinet").toBeLessThan(layering[2]);
  expect(second.y, "next folder remains anchored while the first rises").toBeGreaterThan(first.y);
  const title = await folders.first().locator(".project-folder__title").boundingBox();
  expect(title.y, "project name stays in the raised exposed flap").toBeGreaterThan(activeFirst.y);
  expect(title.y + title.height, "raised name must be readable above the next file")
    .toBeLessThan(second.y - 6);
  expect(activeFirst.y + activeFirst.height, "front folder still hides the lower part of the raised file")
    .toBeGreaterThan(second.y + 20);
  // The active file still covers the next file's top paper edge.
  // Hover the exposed folder body, not the intentionally overlapping lip.
  await page.mouse.move(second.x + 25, second.y + Math.max(48, second.height * .12));
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
    // The water frame intentionally animates from a smaller transform on
    // arrival; compare layout edges only after that entrance has settled.
    await page.locator(".home-landing").evaluate(async el => {
      await Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => null)));
    });
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
