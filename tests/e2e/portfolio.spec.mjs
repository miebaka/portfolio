import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export const routes = [
  "/index.html", "/work.html", "/experiments.html", "/about.html",
  "/essays.html", "/contact.html", "/privacy.html", "/404.html",
  "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html", "/work/christian-poster-a-week.html",
  "/essays/designing-for-disability-in-nigeria.html", "/essays/when-the-swoosh-lost-its-soul.html"
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
    await expect(page.locator("h1")).toHaveCount(1);
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
  for (const width of [320, 390, 430]) {
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

test("critical mobile proof remains readable without JavaScript or motion", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/index.html");
  const criticalProof = [
    ["Brand & visual designer", ".home-landing__meta > p:nth-child(2)"],
    ["Brand Identity & Systems", "#what-i-do .service-fallback li:nth-child(1) :is(h2,h3)"],
    ["Art Direction", "#what-i-do .service-fallback li:nth-child(2) :is(h2,h3)"],
    ["Design Systems & Production", "#what-i-do .service-fallback li:nth-child(5) :is(h2,h3)"],
    ["Hi, I’m Miebaka.", "#about-title"],
  ];
  for (const [text, selector] of criticalProof) {
    const locator = page.locator(selector);
    await expect(locator).toBeVisible();
    await expect(locator).toContainText(text);
    const box = await locator.boundingBox();
    expect(box?.x ?? -1, text).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 999), text).toBeLessThanOrEqual(391);
  }
  // Section names remain accessible headings without reintroducing visual micro-labels.
  await expect(page.locator("#selected-title")).toHaveText("Selected work");
  await expect(page.locator(".swiss-selected .swiss-section-head")).toHaveCSS("clip-path", "inset(50%)");
  await context.close();
});

test("desktop display headings respect the editorial line and grid contracts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const route of routes.filter(route => route !== "/experiments.html")) {
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
    // Long essay headlines are allowed three deliberate editorial lines.
    // Other page titles must remain within two; overflow is always prohibited.
    const maxLines = route === "/index.html" || route.startsWith("/essays/") ? 3 : 2;
    expect(geometry.lines, `${route} primary heading line count`).toBeLessThanOrEqual(maxLines);
    expect(geometry.left, `${route} primary heading left grid edge`).toBeGreaterThanOrEqual(geometry.containerLeft - 1);
    expect(geometry.right, `${route} primary heading right grid edge`).toBeLessThanOrEqual(geometry.containerRight + 1);
    expect(geometry.overflow, `${route} primary heading overflow`).toBe(false);
  }
});

test("Home → TEDx → next project preserves the intended journey", async ({ page }) => {
  await page.goto("/index.html");
  await page.getByRole("link", { name: "TEDx Rivers State University" }).click();
  await expect(page).toHaveURL(/work\/tedx-rsu(?:\.html)?$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("TEDx Rivers State University");
  await expect(page.locator(".case-opening__summary, .case-lede, .case-index")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Next project" })).toContainText("ChopBox");
});

test("published case studies preserve the editorial reading order", async ({ page }) => {
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    await page.goto(`/work/${slug}.html`);
    await settle(page);
    const positions = await page.locator(".case").evaluate(caseStudy => {
      const top = selector => caseStudy.querySelector(selector)?.getBoundingClientRect().top + scrollY;
      return [".case-opening", ".case-shot--hero", ".case-chapter"].map(top);
    });
    expect(positions, `${slug} title, hero and narrative order`).toEqual([...positions].sort((a, b) => a - b));
  }
});

test("every published case uses the same five labeled questions without an intro index or side rail", async ({ page }) => {
  for (const slug of ["tedx-rsu", "rivo", "chopbox"]) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/work/${slug}.html`);
    const chapters = page.locator(".case-chapter");
    await expect(chapters).toHaveCount(5);
    expect(await chapters.evaluateAll(items => items.map(item => item.id))).toEqual(["decision", "system", "survival", "encounter", "results"]);
    expect(await chapters.locator("h2").allTextContents()).toEqual(["The Call", "The System", "What Survived", "First Contact", "The Results"]);
    expect(await chapters.locator(".case-chapter__descriptor").allTextContents()).toEqual([
      "What did I decide, and what did I turn down to get there?",
      "What did I build so the decision outlived the first week?",
      "What did the deadline and the budget leave standing?",
      "How did the people it was made for first meet it?",
      "What changed because this existed, and how do I know?",
    ]);
    await expect(page.locator(".case-index, .case-lede, .case-proof, .case-scroll-index, .case-opening__summary")).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator(".case-index, .case-lede, .case-proof, .case-scroll-index, .case-opening__summary")).toHaveCount(0);
    await expect(chapters.first()).toBeVisible();
  }
});

test("Essays inherits the Selected Work editorial-list interaction", async ({ page }) => {
  await page.goto("/essays.html");
  await settle(page);
  const rows = page.locator(".editorial-index--notes .editorial-index__row");
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toHaveCSS("min-height", /\d+px/);
  const canHover = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  if (!canHover) return;
  await rows.first().hover();
  await expect(rows.nth(1)).toHaveCSS("opacity", "1");
  await expect(rows.first().locator(".editorial-index__title")).toHaveCSS("font-weight", "400");
  await expect(rows.first().locator(".editorial-index__title")).not.toHaveCSS("transform", "none");
});

test("long-form notes expose contents, progress and a next article", async ({ page }) => {
  await page.goto("/essays/designing-for-disability-in-nigeria.html");
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

test("Home mounts the authored Three.js hero wave", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "dark"));
  await page.goto("/index.html?shader-test=1&shader-static=1");
  const wave = page.locator('[data-hero-wave][data-preset="Dark water plane"]');
  await expect(wave).toBeVisible();
  await expect(wave.locator("canvas")).toHaveCount(1);
  await expect(page.locator('[data-hero-wave]')).toHaveCount(1);
  await expect(wave).toHaveAttribute("data-interaction", "static");
});

test("Home content preserves the unblurred hero field", async ({ page }) => {
  await page.goto("/index.html?shader-test=1");
  const wave = page.locator("[data-hero-wave]");
  await expect(wave).toHaveAttribute("data-interaction", /cursor|static/);
  await page.locator(".home-close").scrollIntoViewIfNeeded();
  await expect(wave.locator("canvas")).toBeVisible();
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
  const menu = page.getByRole("button", { name: "Index", exact: true });
  await expect(menu).toBeVisible();
  await menu.click();
  const navigation = page.getByRole("navigation", { name: "All destinations" });
  const labels = await navigation.locator(".site-index__link > span:last-child").allTextContents();
  expect(labels).toEqual(["Work", "Experiments", "About", "Essays", "Contact"]);
});

test("Index navigation rows have deliberate inner padding and clear hit areas", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/essays.html");
    const menu = page.getByRole("button", { name: "Index", exact: true });
    if (!(await menu.isVisible())) continue;
    await menu.click();
    const rows = page.locator(".site-index__destinations .site-index__link");
    await expect(rows).toHaveCount(5);
    const dimensions = await rows.evaluateAll(items => items.map(item => {
      const style = getComputedStyle(item);
      const rect = item.getBoundingClientRect();
      return { left: parseFloat(style.paddingLeft), right: parseFloat(style.paddingRight), height: rect.height };
    }));
    for (const row of dimensions) {
      expect(row.left).toBeGreaterThanOrEqual(12);
      expect(row.right).toBeGreaterThanOrEqual(12);
      expect(row.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
  }
});

test("Essay cards maintain internal padding at mobile and desktop widths", async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/essays.html");
    const cards = page.locator(".editorial-index--notes .editorial-index__row");
    await expect(cards).toHaveCount(2);
    for (const card of await cards.all()) {
      const geometry = await card.evaluate(element => {
        const cs = getComputedStyle(element);
        const card = element.getBoundingClientRect();
        const title = element.querySelector(".writing-item__title").getBoundingClientRect();
        return { left: parseFloat(cs.paddingLeft), right: parseFloat(cs.paddingRight),
          titleInset: title.left - card.left };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(16);
      expect(geometry.right).toBeGreaterThanOrEqual(16);
      expect(geometry.titleInset).toBeGreaterThanOrEqual(16);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test("Mobile navigation has a focus-trapped index", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/index.html");
  const menu = page.getByRole("button", { name: "Index" });
  const dialog = page.getByRole("dialog", { name: "Index" });
  await expect(menu).toBeVisible();
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

test("Mobile Work folders are readable without horizontal overflow", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/work.html");
    const titles = page.locator(".project-folder__tab-title");
    await expect(titles).toHaveCount(3);
    for (const element of await titles.all()) {
      const geometry = await element.evaluate(node => ({
        scrollWidth: node.scrollWidth,
        width: node.clientWidth,
        height: node.getBoundingClientRect().height,
      }));
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width + 2);
      expect(geometry.height).toBeGreaterThan(20);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
  }
});

test("Work folders separate published cases from unfinished projects", async ({ page }) => {
  await page.goto("/work.html");
  const links = page.locator(".project-folder__link");
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveAttribute("href", "work/rivo.html");
  await expect(links.nth(1)).toHaveAttribute("href", "work/tedx-rsu.html");
  await expect(links.nth(2)).toHaveAttribute("href", "work/chopbox.html");
  await expect(page.locator(".project-folder__tab-title")).toHaveText([
    "Rivo Studio", "TEDx Rivers State University", "ChopBox",
  ]);
  await expect(page.locator(".project-archive__progress li")).toHaveText([
    "Poster A Week2024", "Kiki-Joshua2022", "Kigoma Hotels2021",
  ]);
  await expect(page.locator(".filing-cabinet,.filing-cabinet__three-canvas")).toHaveCount(0);
});

test("Work folder is raised on hover or keyboard focus", async ({ page, isMobile }) => {
  await page.goto("/work.html");
  const first = page.locator(".project-folder__link").first();
  await expect(first).toBeVisible();
  await first.focus();
  await expect(first).toBeFocused();
  await expect(first.locator(".project-folder__front")).toBeVisible();
  if (!isMobile) {
    await first.locator(".project-folder__tab").hover();
    const transform = await first.locator("xpath=..").evaluate(el => getComputedStyle(el).transform);
    expect(transform).not.toBe("none");
  }
});

test("Experiments exposes a full-screen 4:5 poster archive", async ({ page }) => {
  await page.goto("/experiments.html");
  await expect(page.locator("[data-experiments-viewport]")).toBeVisible();
  await expect(page.locator(".experiment-poster")).toHaveCount(7);
  await expect(page.locator(".experiment-poster__face").first()).toHaveCSS("aspect-ratio", "4 / 5");
  await expect(page.getByRole("navigation", { name: "Experiments navigation" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Index/ })).toBeVisible();
  await expect(page.locator("[data-experiment-title]")).toContainText("Wada Sanzō");
});

test("retired community route redirects to Experiments", async ({ page }) => {
  await page.goto("/community.html");
  await expect(page).toHaveURL(/\/experiments\.html$/);
  await expect(page.locator(".experiment-poster")).toHaveCount(7);
});

test("stored theme preference persists", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "dark"));
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("liquid theme switch exposes and changes the light/dark state", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("color-theme", "light"));
  await page.goto("/index.html");
  const control = page.getByRole("switch", { name: "Switch to dark mode" });
  await expect(control).toHaveAttribute("aria-checked", "false");
  await control.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".theme-liquid-toggle")).toHaveAttribute("aria-checked", "true");
  await expect(page.locator(".theme-liquid-toggle")).toHaveAccessibleName("Switch to light mode");
});

test("client marquee runs without an unnecessary pause control", async ({ page }) => {
  await page.goto("/index.html");
  await expect(page.locator(".client-marquee__control")).toHaveCount(0);
  await page.locator(".client-marquee").scrollIntoViewIfNeeded();
  await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "playing");
});

test("client marquee responds to the site motion preference immediately", async ({ page }) => {
  await page.goto("/index.html");
  const marquee = page.locator(".client-marquee");
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee).toHaveAttribute("data-marquee-state", "playing");
  await page.evaluate(() => document.documentElement.dataset.motion = "reduced");
  await expect(marquee).toHaveAttribute("data-marquee-state", "paused");
  await page.evaluate(() => document.documentElement.dataset.motion = "full");
  await expect(marquee).toHaveAttribute("data-marquee-state", "playing");
});

test("@a11y explicit focus and field descriptions", async ({ page }) => {
  await page.goto("/contact.html");
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  for (const name of ["name", "email", "interest", "message"]) {
    const field = page.locator(`[name="${name}"]`);
    const ids = (await field.getAttribute("aria-describedby"))?.split(/\s+/) || [];
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) await expect(page.locator(`#${id}`)).toBeAttached();
  }
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
