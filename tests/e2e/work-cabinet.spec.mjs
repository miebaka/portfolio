import { test, expect } from "@playwright/test";

test("Work's visual drawer has exactly three real files in true year order", async ({ page }) => {
  await page.goto("/work.html");
  const drawer = page.locator(".filing-cabinet__drawer");
  await expect(drawer).toBeVisible();
  await expect(drawer.locator(".filing-cabinet__folder")).toHaveCount(3);
  await expect(drawer.locator(".filing-cabinet__divider")).toHaveCount(3);
  await expect(drawer.locator(".filing-cabinet__folder").nth(0)).toHaveAttribute("data-year", "2024");
  await expect(drawer.locator(".filing-cabinet__folder").nth(1)).toHaveAttribute("data-year", "2023");
  await expect(drawer.locator(".filing-cabinet__folder").nth(2)).toHaveAttribute("data-year", "2022");
  await expect(drawer.locator(".filing-cabinet__folder").nth(0)).toHaveAttribute("data-tab", "a");
  await expect(drawer.locator(".filing-cabinet__folder").nth(1)).toHaveAttribute("data-tab", "b");
  await expect(drawer.locator(".filing-cabinet__folder").nth(2)).toHaveAttribute("data-tab", "c");
  await expect(drawer.locator(".filing-cabinet__tab-title")).toHaveText([
    "Rivo Studio", "TEDx Rivers State University", "ChopBox",
  ]);
  await expect(drawer.locator(".filing-cabinet__folder--sealed")).toHaveCount(0);
  const links = await drawer.locator("a").evaluateAll(elements =>
    elements.map(element => ({ href: new URL(element.href).pathname, label: element.textContent })));
  expect(links.map(({ href }) => href)).toEqual([
    "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html",
  ]);
  for (const { label } of links) expect(label).toMatch(/case study/i);
});

test("Work cabinet remains real HTML when JavaScript is disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto("/work.html");
    const drawer = page.locator(".filing-cabinet__drawer");
    await expect(drawer).toBeVisible();
    await expect(drawer.locator(".filing-cabinet__link")).toHaveCount(3);
    await expect(drawer.locator(".filing-cabinet__tab-title")).toHaveText([
      "Rivo Studio", "TEDx Rivers State University", "ChopBox",
    ]);
    await expect(page.locator(".filing-cabinet__register-title")).toHaveText("Rivo Studio");
    await expect(page.locator(".project-archive__progress li")).toHaveCount(3);
    // The raised physical tab remains a direct link target, even when
    // its paper face extends underneath the next folder.
    await page.locator(".filing-cabinet__tab").first().click();
    await expect(page).toHaveURL(/\/work\/rivo\.html$/);
  } finally {
    await context.close();
  }
});

test("Work cabinet keeps full project labels and native links at narrow widths and 200% zoom", async ({ page }) => {
  await page.goto("/work.html");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const values = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      links: [...document.querySelectorAll(".filing-cabinet__link")].map(link => {
        const rect = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        return { width: rect.width, height: rect.height, display: style.display };
      }),
    }));
    expect(values.overflow).toBeLessThanOrEqual(1);
    for (const link of values.links) {
      expect(link.display).toBe("block");
      expect(link.height).toBeGreaterThanOrEqual(44);
      expect(link.width).toBeGreaterThanOrEqual(44);
    }
  }
  await page.setViewportSize({ width: 768, height: 900 });
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth))
    .toBeLessThanOrEqual(1);
});

test("Work uses native scrolling rather than Lenis, including explicit motion opt-in", async ({ page }) => {
  await page.goto("/work.html?motion-test=1");
  await expect(page.locator("html")).toHaveAttribute("data-scroll-experience", "native");
  await expect(page.locator("html")).not.toHaveAttribute("data-scroll-engine", "lenis-gsap");
});


test("reading-axis register follows the nearest real folder, never a year divider", async ({ page }) => {
  await page.goto("/work.html");
  const drawer = page.locator(".filing-cabinet__drawer");
  await expect(drawer).toBeVisible();
  await expect(page.locator("[data-project-archive]")).toHaveAttribute("data-cabinet-interactive", "true");
  for (const [index, name, year] of [
    [0, "Rivo Studio", "2024"],
    [1, "TEDx Rivers State University", "2023"],
    [2, "ChopBox", "2022"],
  ]) {
    await drawer.locator(".filing-cabinet__link").nth(index).evaluate(link => {
      const box = link.getBoundingClientRect();
      window.scrollTo({ top: scrollY + box.top + box.height / 2 - innerHeight * .4, behavior: "instant" });
    });
    await expect(drawer.locator(".filing-cabinet__folder").nth(index))
      .toHaveAttribute("data-reading", "true");
    await expect(page.locator(".filing-cabinet__register-title")).toHaveText(name);
    await expect(page.locator(".filing-cabinet__register-year")).toHaveText(year);
    await expect(drawer.locator('[data-reading="true"]')).toHaveCount(1);
    await expect(page.locator(".filing-cabinet__register")).toHaveAttribute("aria-hidden", "true");
  }
});

test("scroll temporarily suppresses decorative pointer hover and clears after 140ms", async ({ page, isMobile }) => {
  test.skip(isMobile, "Pointer hover applies only to fine-pointer devices");
  await page.goto("/work.html");
  const cabinet = page.locator("[data-project-archive]");
  const link = page.locator(".filing-cabinet__link").first();
  await link.hover();
  await expect(link.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "1");
  await page.evaluate(() => window.dispatchEvent(new Event("scroll")));
  await expect(cabinet).toHaveClass(/is-scrolling/);
  await expect(link.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "0");
  await expect(cabinet).not.toHaveClass(/is-scrolling/, { timeout: 2000 });
  await expect(link.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "1");
});

test("keyboard focus lifts the face instantly and keeps the ring visible", async ({ page }) => {
  await page.goto("/work.html");
  const link = page.locator(".filing-cabinet__link").nth(1);
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "1");
  const state = await link.evaluate(element => {
    const face = element.querySelector(".filing-cabinet__face");
    const transform = new DOMMatrixReadOnly(getComputedStyle(face).transform);
    const ring = getComputedStyle(element);
    return { y: transform.m42, duration: getComputedStyle(face).transitionDuration,
      outline: ring.outlineStyle, outlineWidth: ring.outlineWidth };
  });
  expect(state.y).toBeCloseTo(-20, 0);
  expect(state.duration).toBe("0s");
  expect(state.outline).toBe("solid");
  expect(parseFloat(state.outlineWidth)).toBeGreaterThanOrEqual(2);
});

test("touch reading-axis folder exposes its lip and opens on one tap", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch affordance tested on mobile project");
  await page.goto("/work.html");
  const second = page.locator(".filing-cabinet__folder").nth(1);
  await second.locator(".filing-cabinet__link").evaluate(link => {
    const rect = link.getBoundingClientRect();
    window.scrollTo({ top: scrollY + rect.top + rect.height / 2 - innerHeight * .4, behavior: "instant" });
  });
  await expect(second).toHaveAttribute("data-reading", "true");
  await expect(second.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "1");
  await second.locator(".filing-cabinet__tab").click();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
});

test("browser Back re-files the correct folder with native scroll and focus", async ({ page }) => {
  await page.goto("/work.html");
  const second = page.locator(".filing-cabinet__folder").nth(1);
  await second.locator(".filing-cabinet__link").evaluate(link => {
    const rect = link.getBoundingClientRect();
    window.scrollTo({ top: scrollY + rect.top + rect.height / 2 - innerHeight * .4, behavior: "instant" });
  });
  await expect(second).toHaveAttribute("data-reading", "true");
  const startingY = await page.evaluate(() => scrollY);
  await second.locator(".filing-cabinet__tab").click();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/work\.html$/);
  await expect(page.locator('.filing-cabinet__folder[data-slug="tedx-rsu"] .filing-cabinet__link'))
    .toBeFocused({ timeout: 5000 });
  await expect.poll(() => page.evaluate(() => Math.abs(scrollY - startingY))).toBeLessThan(25);
  await expect(page.locator(".filing-cabinet__register-title")).toHaveText("TEDx Rivers State University");
  await expect(page.locator(".filing-cabinet__drawer").locator('[data-reading="true"]')).toHaveCount(1);
  await expect(page.locator(".filing-cabinet")).not.toHaveClass(/is-scrolling/);
});

test("reduced motion keeps folder details visible without travel", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work.html");
  const link = page.locator(".filing-cabinet__link").first();
  await link.focus();
  await expect(link.locator(".filing-cabinet__lip")).toHaveCSS("opacity", "1");
  const face = link.locator(".filing-cabinet__face");
  await expect(face).toHaveCSS("transform", "none");
  await expect(face).toHaveCSS("transition-duration", "0s");
  await link.press("Enter");
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
});

test("reading-axis fallback works when IntersectionObserver is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { value: undefined, configurable: true });
  });
  await page.goto("/work.html");
  const last = page.locator('.filing-cabinet__folder[data-slug="chopbox"]');
  await last.locator(".filing-cabinet__link").evaluate(link => {
    const rect = link.getBoundingClientRect();
    window.scrollTo({ top: scrollY + rect.top + rect.height / 2 - innerHeight * .4, behavior: "instant" });
  });
  await expect(last).toHaveAttribute("data-reading", "true");
  await expect(page.locator(".filing-cabinet__register-title")).toHaveText("ChopBox");
});


test("a fresh Work visit never restores an unrelated or stale folder", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => {
    sessionStorage.setItem("portfolio.workCabinet.return.v2", JSON.stringify({
      slug: "tedx-rsu", source: "/work.html", scrollY: 450, savedAt: Date.now(),
    }));
  });
  await page.goto("/work.html");
  await expect(page.locator("[data-project-archive]"))
    .toHaveAttribute("data-cabinet-interactive", "true");
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("portfolio.workCabinet.return.v2")))
    .toBeNull();
  await expect(page.locator('.filing-cabinet__folder[data-slug="tedx-rsu"] .filing-cabinet__link'))
    .not.toBeFocused();
});
