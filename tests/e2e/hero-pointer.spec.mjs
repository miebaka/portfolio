import { test, expect } from "@playwright/test";

/* The same hero controller handles mouse movement, tap ripples and
   native mobile scrolling without a second animation engine. */
test("hero pointer input uses cursor on desktop and touch ripples on mobile", async ({ page, isMobile }) => {
  await page.goto("/?shader-test=1");
  const host = page.locator("[data-hero-wave]");
  await expect(host).toHaveClass(/is-ready/);
  const rect = await page.locator(".home-landing").boundingBox();
  expect(rect).toBeTruthy();
  if (isMobile) {
    // Touch pointers leave the element immediately after a tap. Record the
    // actual impulse rather than polling an intentionally transient state.
    await host.evaluate(node => {
      window.__heroTouchSamples = [];
      const observer = new MutationObserver(() => {
        if (node.dataset.interaction === "touch") {
          window.__heroTouchSamples.push({
            x: Number(node.dataset.cursorX),
            y: Number(node.dataset.cursorY),
          });
        }
      });
      observer.observe(node, { attributes: true, attributeFilter: ["data-interaction"] });
    });
    await page.touchscreen.tap(
      Math.round(rect.x + rect.width * .2),
      Math.round(rect.y + rect.height * .25)
    );
    await expect.poll(() => page.evaluate(() => window.__heroTouchSamples.length))
      .toBeGreaterThan(0);
    const sample = await page.evaluate(() => window.__heroTouchSamples[0]);
    expect(sample.x).toBeLessThan(-.5);
    expect(sample.y).toBeLessThan(-.4);
  } else {
    await page.mouse.move(rect.x + rect.width * .2, rect.y + rect.height * .25);
    await expect(host).toHaveAttribute("data-interaction", "cursor");
    await expect.poll(async () => Number(await host.getAttribute("data-cursor-x"))).toBeLessThan(-.5);
    await expect.poll(async () => Number(await host.getAttribute("data-cursor-y"))).toBeLessThan(-.4);
  }
  await expect(host).toHaveAttribute("data-lighting", "sunward-caustics");
  await expect(host).toHaveAttribute("data-pointer-light", "refracted-impulses");
  await expect.poll(async () => Number(await host.getAttribute("data-pointer-wave-count"))).toBeGreaterThan(0);
  await expect(host).toHaveAttribute("data-ripple-brush", "150px");
  await expect(host).toHaveAttribute("data-ripple-rings", "4");
  if (isMobile) {
    // The touch gesture must not disable native vertical scrolling.
    await page.locator(".home-profile").scrollIntoViewIfNeeded();
    await expect(page.locator(".home-profile")).toBeVisible();
  } else {
    await page.mouse.move(rect.x + rect.width + 10, rect.y + rect.height + 10);
    await expect(host).toHaveAttribute("data-interaction", "static");
  }
});
