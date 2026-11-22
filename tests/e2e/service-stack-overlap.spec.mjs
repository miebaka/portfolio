import { test, expect } from "@playwright/test";

test("What I Do has a genuinely overlapping native-scroll stack with usable proof links", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index.html");
    const items = page.locator(".service-stack__item");
    await expect(items).toHaveCount(5);
    const before = await items.evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();
      return {
        top: box.top, bottom: box.bottom, position: getComputedStyle(node).position,
        margin: parseFloat(getComputedStyle(node).marginBottom),
      };
    }));
    for (let i = 1; i < before.length; i++) {
      if (width >= 896) {
        expect(before[i].top, "desktop cards overlap at " + width).toBeLessThan(before[i - 1].bottom);
      } else {
        expect(before[i].top, "mobile rows never overlap at " + width).toBeGreaterThanOrEqual(before[i - 1].bottom - 1);
      }
      expect(before[i].top).toBeGreaterThan(before[i - 1].top);
    }
    expect(before[0].position).toBe(width >= 896 ? "sticky" : "relative");
    if (width >= 896) expect(before[0].margin).toBeLessThan(0);
    else expect(before[0].margin).toBeGreaterThanOrEqual(0);

    // Link targets may not be hidden beneath the following card.
    for (const item of await items.all()) {
      const link = item.locator(".service-stack__evidence");
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await link.focus();
      await expect(link).toBeFocused();
      const hit = await link.evaluate(node => {
        const r = node.getBoundingClientRect();
        const target = document.elementFromPoint(r.left + Math.min(r.width / 2, 32), r.top + r.height / 2);
        return node === target || node.contains(target);
      });
      expect(hit, "proof link remains in the painted hit area").toBe(true);
    }
  }
});

test("reduced motion preserves readable non-sticky service cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  await expect(page.locator(".service-stack__item")).toHaveCount(5);
  await expect(page.locator(".service-stack__item").first()).toHaveCSS("position", "relative");
  for (const link of await page.locator(".service-stack__evidence").all()) {
    await expect(link).toHaveAttribute("href", /work\/.*\.html#/);
  }
});

test("mobile capability proof reads as a calm nonsticky list with no empty scroll runway", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/index.html");
    const section = page.locator("#what-i-do");
    await expect(section.locator(".service-stack__item")).toHaveCount(5);
    for (const item of await section.locator(".service-stack__item").all()) {
      await expect(item).toHaveCSS("position", "relative");
      await expect(item.locator(".service-stack__tags")).toBeHidden();
      await expect(item.locator(".service-stack__symbol")).toBeHidden();
      await expect(item.locator(".service-stack__evidence")).toBeVisible();
    }
    const mobile = await page.evaluate(() => ({
      runway: getComputedStyle(document.querySelector("#what-i-do .service-stack"), "::after").display,
      heroMeta: getComputedStyle(document.querySelector(".home-landing__meta p:nth-child(2)")).display,
      secondaryRole: getComputedStyle(document.querySelector(".home-landing__secondary-role")).display,
      location: getComputedStyle(document.querySelector(".home-landing__meta p:first-child")).display,
      overscroll: document.documentElement.scrollWidth - innerWidth
    }));
    expect(mobile.runway).toBe("none");
    expect(mobile.heroMeta).not.toBe("none");
    expect(mobile.secondaryRole).toBe("none");
    expect(mobile.location).toBe("none");
    expect(mobile.overscroll).toBeLessThanOrEqual(2);
  }
});
