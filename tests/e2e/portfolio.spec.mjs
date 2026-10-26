import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const routes = [
  "/index.html", "/work.html", "/explorations.html", "/about.html",
  "/services.html", "/playground.html", "/contact.html", "/privacy.html", "/404.html",
  "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html", "/work/christian-poster-a-week.html",
  "/writing/designing-for-disability-in-nigeria.html", "/writing/when-the-swoosh-lost-its-soul.html"
];

const settle = async page => {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
};

for (const route of routes) {
  test(`${route} has a healthy document contract`, async ({ page }) => {
    const consoleErrors = [];
    const failedLocalResources = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("requestfailed", request => {
      const url = new URL(request.url());
      if (url.origin === "http://127.0.0.1:4173") failedLocalResources.push(`${request.method()} ${url.pathname}`);
    });
    page.on("response", response => {
      const url = new URL(response.url());
      if (url.origin === "http://127.0.0.1:4173" && response.status() >= 400) {
        failedLocalResources.push(`${response.request().method()} ${url.pathname} (${response.status()})`);
      }
    });
    const response = await page.goto(route);
    await settle(page);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(route === "/explorations.html" ? 0 : 1);
    const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(overflow.scroll, `horizontal overflow on ${route}`).toBeLessThanOrEqual(overflow.client + 1);
    expect(failedLocalResources).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test(`@a11y ${route} has no serious axe violations in both themes`, async ({ page }) => {
    for (const theme of ["light", "dark"]) {
      await page.addInitScript(value => localStorage.setItem("color-theme", value), theme);
      await page.goto(route);
      await settle(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter(item => ["serious", "critical"].includes(item.impact)), `${route} ${theme}`).toEqual([]);
    }
  });
}

test("every route fits narrow and large phone viewports", async ({ page }) => {
  for (const width of [320, 360, 430]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of routes) {
      await page.goto(route);
      await settle(page);
      const geometry = await page.evaluate(() => {
        const navigation = document.querySelector('[aria-label="Primary mobile navigation"]');
        const bounds = navigation?.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          navigationLeft: bounds?.left ?? 0,
          navigationRight: bounds?.right ?? innerWidth,
          viewportWidth: innerWidth,
        };
      });
      expect(geometry.overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
      expect(geometry.navigationLeft, `${route} mobile navigation left edge at ${width}px`).toBeGreaterThanOrEqual(0);
      expect(geometry.navigationRight, `${route} mobile navigation right edge at ${width}px`).toBeLessThanOrEqual(geometry.viewportWidth);
    }
  }
});

test("desktop display headings use the shared grid without forced three-line measures", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of routes.filter(route => route !== "/explorations.html")) {
    await page.goto(route);
    await settle(page);
    const geometry = await page.locator("h1").evaluate(element => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      const container = element.closest(".container")?.getBoundingClientRect();
      return {
        lines: Math.round(bounds.height / Number.parseFloat(style.lineHeight)),
        left: bounds.left,
        right: bounds.right,
        containerLeft: container?.left ?? 0,
        containerRight: container?.right ?? innerWidth,
        overflow: element.scrollWidth > element.clientWidth,
      };
    });
    expect(geometry.lines, `${route} primary heading line count`).toBeLessThanOrEqual(2);
    expect(geometry.left, `${route} primary heading left grid edge`).toBeGreaterThanOrEqual(geometry.containerLeft - 1);
    expect(geometry.right, `${route} primary heading right grid edge`).toBeLessThanOrEqual(geometry.containerRight + 1);
    expect(geometry.overflow, `${route} primary heading overflow`).toBe(false);
  }
});

test("Home → TEDx → next project preserves the intended journey", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("link", { name: "TEDx RSU" }).click();
  await expect(page).toHaveURL(/work\/tedx-rsu(?:\.html)?$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("global event system");
  await expect(page.getByRole("region", { name: "Next project" })).toContainText("ChopBox");
});

test("published case studies preserve the editorial reading order", async ({ page }) => {
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    await page.goto(`/work/${slug}.html`);
    await settle(page);
    const positions = await page.locator(".case").evaluate(caseStudy => {
      const top = selector => caseStudy.querySelector(selector)?.getBoundingClientRect().top + scrollY;
      return [".case-opening", ".case-shot--hero", ".case-lede", ".case-proof", ".case-chapter"].map(top);
    });
    expect(positions, `${slug} proposition, hero, context, proof and narrative order`).toEqual([...positions].sort((a, b) => a - b));
  }
});

test("published case studies expose an accessible chapter scroll index on wide screens", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/tedx-rsu.html");
  const index = page.getByRole("navigation", { name: "Case study progress" });
  await expect(index).toBeVisible();
  const ticks = index.getByRole("button");
  await expect(ticks).toHaveCount(5);
  await expect(ticks.first()).toHaveAttribute("aria-current", "step");
  const decision = index.getByRole("button", { name: "Go to Governing decision" });
  await decision.click();
  await expect.poll(() => decision.getAttribute("aria-current")).toBe("step");
  await expect(page.locator("#decision")).toBeInViewport();
});

test("chapter rail yields to the authored mobile chapter index", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/work/tedx-rsu.html");
  await expect(page.getByRole("navigation", { name: "Case study progress" })).toBeHidden();
  await expect(page.locator(".case-index")).toBeVisible();
});

test("Notes inherits the Selected Work editorial-list interaction", async ({ page }) => {
  await page.goto("/playground.html");
  await settle(page);
  const rows = page.locator(".editorial-index--notes .editorial-index__row");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toHaveCSS("min-height", /\d+px/);
  const canHover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  if (!canHover) return;
  await rows.first().hover();
  await expect(rows.nth(1)).toHaveCSS("opacity", "0.28");
  await expect(rows.first().locator(".editorial-index__title")).toHaveCSS("font-weight", "700");
  await expect(rows.first().locator(".editorial-index__title")).not.toHaveCSS("transform", "none");
});

test("long-form notes expose contents, progress and a next article", async ({ page }) => {
  await page.goto("/writing/designing-for-disability-in-nigeria.html");
  const contents = page.getByRole("navigation", { name: "On this page" });
  await expect(contents).toBeVisible();
  await expect(contents.getByRole("link")).toHaveCount(4);
  await expect(page.locator(".article-progress")).toBeAttached();
  await expect(page.getByRole("complementary", { name: "Next article" }).getByRole("link")).toHaveAttribute("href", "when-the-swoosh-lost-its-soul.html");
});

test("visible email addresses can be copied without replacing the mail link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: value => { window.__copiedEmail = value; return Promise.resolve(); } }
    });
  });
  await page.goto("/contact.html");
  const mail = page.locator('a[data-href="email"]').filter({ hasText: "@" });
  await expect(mail).toHaveAttribute("href", /^mailto:/);
  const copy = page.getByRole("button", { name: "Copy address to clipboard" });
  await copy.click();
  await expect(copy).toContainText("Copied");
  await expect.poll(() => page.evaluate(() => window.__copiedEmail)).toBe("miebakakiki@gmail.com");
});

test("Home mounts the authored dark water-plane shader", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "dark"));
  await page.goto("/index.html?shader-test=1&shader-static=1");
  const backdrop = page.locator('[data-shader-backdrop][data-preset="Dark water plane"]');
  await expect(backdrop).toBeVisible();
  await expect(backdrop.locator("canvas")).toHaveCount(1);
  const overlay = page.locator('[data-shader-overlay][data-preset="Dark water plane"]');
  await expect(overlay).toBeVisible();
  await expect(overlay.locator("canvas")).toHaveCount(1);
  await expect(backdrop).toHaveAttribute("data-interaction", "static");
});

test("Home scroll overlay preserves the unblurred shader field", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html?shader-test=1");
  const backdrop = page.locator("[data-shader-backdrop]");
  await expect(backdrop).toHaveAttribute("data-interaction", "static");
  await page.locator(".home-close").scrollIntoViewIfNeeded();
  await expect(backdrop.locator("canvas")).toBeVisible();
  const surfaces = await page.locator(".home-content, .journey").evaluateAll(elements => elements.map(element => ({
    className: element.className,
    background: getComputedStyle(element).backgroundColor,
    blur: getComputedStyle(element).backdropFilter,
  })));
  expect(surfaces).toHaveLength(2);
  for (const surface of surfaces) {
    if (surface.className.includes("home-content")) expect(surface.background).toMatch(/rgb\((?:248, 249, 252|7, 17, 43)\)/);
    expect(surface.blur).toBe("none");
  }
});

test("Global navigation uses the five approved destinations", async ({ page }) => {
  await page.goto("/index.html");
  const navigation = page.viewportSize().width <= 640
    ? page.getByRole("navigation", { name: "Primary mobile navigation" })
    : page.getByRole("navigation", { name: "Primary", exact: true });
  const labels = await navigation.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("aria-label") || link.textContent.trim()));
  expect(labels).toEqual(["Work", "About", "Experiments", "Notes", "Contact"]);
});

test("Mobile navigation has a persistent bottom bar and a focus-trapped index", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  const menu = page.getByRole("button", { name: "Index" });
  const bottom = page.getByRole("navigation", { name: "Primary mobile navigation" });
  const dialog = page.getByRole("dialog", { name: "Index" });
  await expect(menu).toBeVisible();
  await expect(bottom).toBeVisible();
  await expect(bottom.getByRole("link")).toHaveCount(5);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(dialog).toBeHidden();
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Work" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});

test("About exposes the CV only when configured", async ({ page }) => {
  await page.goto("/about.html");
  const cv = page.locator('[data-mount="cv"] a[download]');
  if (await cv.count()) await expect(cv).toHaveAttribute("href", /\.(pdf|docx?)$/i);
  else await expect(page.locator('[data-mount="cv"]')).toBeEmpty();
});

test("Work index separates complete cases from studies in progress", async ({ page }) => {
  await page.goto("/work.html");
  await expect(page.getByRole("link", { name: /TEDx Rivers State University/ })).toHaveAttribute("href", "work/tedx-rsu.html");
  await expect(page.getByRole("link", { name: /Rivo Studio/ })).toHaveAttribute("href", "work/rivo.html");
  await expect(page.locator(".project-archive__item")).toHaveCount(3);
  await expect(page.locator(".project-archive__identity h2")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "Chop Box"
  ]);
  await expect(page.locator(".project-archive__media")).toHaveCount(3);
  await expect(page.locator(".project-archive__progress li")).toHaveText(["Detour2026", "Out Of Office2026"]);
});

test("Work index gives the selected project reciprocal focus", async ({ page, isMobile }) => {
  test.skip(isMobile, "The reciprocal hover treatment is reserved for fine pointers");
  await page.goto("/work.html");
  const archive = page.locator(".editorial-index--archive");
  const rows = archive.locator(".editorial-index__row");
  const rivo = archive.getByRole("link", { name: /Rivo Studio/ });
  await expect(rows).toHaveCount(3);
  await rivo.hover();
  await expect(rivo).toHaveCSS("opacity", "1");
  await expect(rows.first()).toHaveCSS("opacity", "0.28");
  await expect(rows.last()).toHaveCSS("opacity", "0.28");
  await expect(rivo.locator(".editorial-index__title")).toHaveCSS("font-weight", "700");
  await expect(rivo.locator(".project-archive__preview-frame").first()).toHaveCSS("opacity", "1");
});

test("Experiments exposes an art-only spatial canvas", async ({ page }) => {
  await page.goto("/explorations.html");
  await expect(page.locator("[data-experiments-viewport]")).toBeVisible();
  await expect(page.getByText("Drag or Scroll To Explore", { exact: true })).toBeVisible();
  await expect(page.locator(".experiment-object")).toHaveCount(7);
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("retired community route redirects to Experiments", async ({ page }) => {
  await page.goto("/community.html");
  await expect(page).toHaveURL(/\/explorations\.html$/);
  await expect(page.getByText("Drag or Scroll To Explore", { exact: true })).toBeVisible();
});

test("stored theme preference persists", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "dark"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("theme pull cord exposes and changes the Print/Screen state", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "light"));
  await page.goto("/index.html");
  const cord = page.getByRole("switch", { name: "Switch to Screen mode" });
  await expect(cord).toHaveAttribute("aria-checked", "false");
  await cord.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const changedCord = page.locator(".theme-cord");
  await expect(changedCord).toHaveAttribute("aria-checked", "true");
  await expect(changedCord).toHaveAccessibleName("Switch to Print mode");
});

test("client marquee can be paused", async ({ page }) => {
  await page.goto("/index.html");
  const control = page.locator(".client-marquee__control");
  await expect(control).toBeAttached();
  if ((await page.locator("html").getAttribute("data-motion")) === "reduced") {
    await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "static");
    await expect(control).toHaveAttribute("aria-disabled", "true");
    return;
  }
  await control.evaluate(element => element.click());
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "paused");
});

test("@a11y explicit focus, descriptions and computed reduced-motion behavior", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact.html");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  for (const name of ["name", "email", "interest", "message"]) {
    const field = page.locator(`[name="${name}"]`);
    const ids = (await field.getAttribute("aria-describedby"))?.split(/\s+/) || [];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) await expect(page.locator(`#${id}`)).toBeAttached();
  }
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page.goto("/index.html");
  const motion = await page.locator(".client-marquee__track").evaluate(element => {
    const style = getComputedStyle(element);
    return { animationName: style.animationName, animationDuration: style.animationDuration, transform: style.transform };
  });
  expect(motion.animationName).toBe("none");
  expect(motion.animationDuration).toBe("0s");
  expect(motion.transform).toBe("none");
});

test("@a11y full WCAG text spacing does not hide content or create overflow", async ({ page }) => {
  await page.goto("/contact.html");
  await page.addStyleTag({ content: "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}" });
  await settle(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Work with me" })).toBeVisible();
});

test("@a11y forced colours retain the primary experience", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Forced colours are asserted in Chromium");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/index.html");
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const mastheadBrand = page.getByRole("link", { name: /Miebaka Joshua, home/i });
  await expect(mastheadBrand).toBeVisible();
  await mastheadBrand.focus();
  const forced = await mastheadBrand.evaluate(element => ({ color: getComputedStyle(element).color, adjust: getComputedStyle(element).forcedColorAdjust }));
  expect(forced.color).not.toBe("");
  expect(forced.adjust).toBe("auto");
});

test("@a11y 200% zoom retains content and avoids horizontal overflow", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Miebaka Joshua, home/i })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("navigation works without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/index.html`);
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Work" }).click();
  await expect(page).toHaveURL(/work(?:\.html)?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Selected work");
  await context.close();
});
