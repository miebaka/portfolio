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
      expect(before[i].top, "cards overlap at " + width).toBeLessThan(before[i - 1].bottom);
      expect(before[i].top).toBeGreaterThan(before[i - 1].top);
    }
    expect(before[0].position).toBe("sticky");
    expect(before[0].margin).toBeLessThan(0);

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
