import { test, expect } from "@playwright/test";

test("scroll enhancement is desktop-only and keeps content visible on both devices", async ({ page, isMobile }) => {
  await page.goto("/?motion-test=1");
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", isMobile ? "native" : "active");
  if (isMobile) {
    await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
  } else {
    await expect(page.locator("html")).toHaveAttribute("data-scroll-engine", "lenis-gsap");
  }
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".home-project-list .project-roster__row")).toHaveCount(3);
  await page.locator(".home-profile").scrollIntoViewIfNeeded();
  await expect(page.locator(".home-profile")).toBeVisible();
});

test("motion preference changes preserve correct native or enhanced scrolling", async ({ page, isMobile }) => {
  await page.goto("/?motion-test=1");
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", isMobile ? "native" : "active");
  await page.evaluate(() => { document.documentElement.dataset.motion = "reduced"; });
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", "native");
  await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
  await page.evaluate(() => { document.documentElement.dataset.motion = "full"; });
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", isMobile ? "native" : "active");
  if (isMobile) {
    await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
  } else {
    await expect(page.locator("html")).toHaveAttribute("data-scroll-engine", "lenis-gsap");
  }
});

test("a system reduced-motion preference leaves native scroll intact", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?motion-test=1");
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", "native");
  await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

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
