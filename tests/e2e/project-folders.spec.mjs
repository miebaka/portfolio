import { test, expect } from "@playwright/test";

const routes = [
  { slug: "tedx-rsu", title: "TEDx Rivers State University", href: "work/tedx-rsu.html" },
  { slug: "rivo", title: "Rivo Studio", href: "work/rivo.html" },
  { slug: "chopbox", title: "ChopBox", href: "work/chopbox.html" }
];

test("published files lead with TEDx and expose numbered tabs", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.locator(".project-folder")).toHaveCount(3);
  await expect(page.locator(".project-folder__paper")).toHaveCount(15);
  await expect(page.locator(".project-folder__title")).toHaveText(routes.map(item => item.title));
  await expect(page.locator(".project-folder__visual img")).toHaveCount(0);
  for (const [index, item] of routes.entries()) {
    const folder = page.locator(".project-folder").nth(index);
    await expect(folder).toHaveAttribute("data-slug", item.slug);
    await expect(folder.locator(".project-folder__link")).toHaveAttribute("href", item.href);
    await expect(folder.locator(".project-folder__link")).toHaveAttribute("aria-label", "View " + item.title + " case study");
    await expect(folder.locator(".project-folder__tab")).toBeVisible();
    await expect(folder.locator(".project-folder__paper")).toHaveCount(5);
  }
});

test("keyboard focus and Enter reach the named case directly", async ({ page }) => {
  for (const item of routes) {
    await page.goto("/work.html");
    const link = page.locator('.project-folder[data-slug="' + item.slug + '"] .project-folder__link');
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp("/" + item.href.replace(".", "\\.") + "$"));
  }
});

test("one touch opens the named case, without preview and without a second tap", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/work.html");
  const target = page.locator('.project-folder[data-slug="rivo"] .project-folder__link');
  await target.locator(".project-folder__tab").tap();
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
  await context.close();
});

test("all three fronts remain readable and reachable across breakpoints", async ({ page }) => {
  for (const width of [320, 390, 640, 768, 900, 1152, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/work.html");
    await page.evaluate(() => document.fonts.ready);
    const proof = await page.locator(".project-folder").evaluateAll(nodes => nodes.map(node => {
      const link = node.querySelector(".project-folder__link");
      const face = node.querySelector(".project-folder__front");
      const title = node.querySelector(".project-folder__title");
      const tab = node.querySelector(".project-folder__tab");
      const rect = element => element.getBoundingClientRect();
      return { named: Boolean(link.getAttribute("aria-label")),
        inFace: rect(title).left >= rect(face).left - 2 && rect(title).right <= rect(face).right + 2,
        visible: rect(title).height > 0 && rect(tab).height > 0 };
    }));
    expect(proof).toHaveLength(3);
    for (const item of proof) {
      expect(item.named).toBe(true);
      expect(item.inFace, "title remains on the folder face at "+width).toBe(true);
      expect(item.visible).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(2);
    const stacked = await page.locator(".project-folder-stack__cards").evaluate(list => {
      const [first, second] = Array.from(list.children, node => node.getBoundingClientRect());
      return getComputedStyle(list).flexDirection === "column" && second.top > first.top && second.top < first.bottom;
    });
    expect(stacked).toBe(true);
  }
});

test("five blank sheets are non-intercepting; case link is a single focus target", async ({ page }) => {
  await page.goto("/work.html");
  for (const folder of await page.locator(".project-folder").all()) {
    await expect(folder.locator(".project-folder__link")).toHaveCount(1);
    const materials = await folder.locator(".project-folder__paper").evaluateAll(nodes =>
      nodes.map(el => ({ pointer: getComputedStyle(el).pointerEvents, text: el.textContent })));
    expect(materials).toHaveLength(5);
    for (const sheet of materials) { expect(sheet.pointer).toBe("none"); expect(sheet.text).toBe(""); }
  }
});

test("JavaScript-off Work still exposes all three full links and project names", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/work.html");
  await expect(page.locator(".project-folder__link")).toHaveCount(3);
  await expect(page.locator(".project-folder__title")).toHaveText(routes.map(item => item.title));
  await context.close();
});

test("reduced-motion users can open every case without folder animations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work.html");
  const link = page.locator(".project-folder__link").first();
  await link.focus();
  await expect(link).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});
