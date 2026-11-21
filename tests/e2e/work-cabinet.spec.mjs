import { test, expect } from "@playwright/test";
import sharp from "sharp";

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
  // Capture the transient 140ms suppression synchronously: a polling
  // assertion would outlive that state and report a false failure.
  const during = await page.evaluate(() => {
    window.dispatchEvent(new Event("scroll"));
    return {
      scrolling: document.querySelector("[data-project-archive]").classList.contains("is-scrolling"),
      opacity: Number(getComputedStyle(document.querySelector(".filing-cabinet__lip")).opacity),
    };
  });
  expect(during.scrolling).toBe(true);
  expect(during.opacity).toBe(0);
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
  await expect.poll(() => page.evaluate(y => Math.abs(scrollY - y), startingY)).toBeLessThan(25);
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


test("a primary pointer opens a bounded paper sheet and arrives at the matching case", async ({ page }) => {
  await page.goto("/work.html");
  const state = await page.locator('.filing-cabinet__folder[data-slug="rivo"] .filing-cabinet__link')
    .evaluate(link => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, detail: 1 });
      link.dispatchEvent(event);
      const shade = document.querySelector(".cabinet-extraction__shade");
      const paper = document.querySelector(".cabinet-extraction__paper");
      return {
        prevented: event.defaultPrevented,
        shade: !!shade,
        sheet: !!paper,
        color: paper && getComputedStyle(paper).backgroundColor,
        background: getComputedStyle(document.documentElement).backgroundColor,
        extracting: link.closest(".filing-cabinet__folder")?.dataset.extracting,
        viewTransition: !!document.querySelector('style[data-cabinet-view-transition="true"]'),
      };
    });
  expect(state.prevented).toBe(true);
  expect(state.shade).toBe(true);
  expect(state.sheet).toBe(true);
  expect(state.extracting).toBe("true");
  expect(state.viewTransition).toBe(true);
  expect(state.color).toBe(state.background);
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
  await expect(page.locator("body")).toHaveAttribute("data-cabinet-arrival", "true");
  await expect(page.locator(".case-opening h1")).toContainText("Rivo Studio");
  expect(await page.evaluate(() => sessionStorage.getItem("portfolio.workCabinet.arrival.v2"))).toBeNull();
});

test("a cancelled or stalled paper animation cannot block case navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.classList?.contains("cabinet-extraction__paper")) {
        const animation = original.apply(this, args);
        animation.pause(); // A never-settling finished promise must hit the 390ms deadline.
        return animation;
      }
      return original.apply(this, args);
    };
  });
  await page.goto("/work.html");
  await page.locator('.filing-cabinet__folder[data-slug="tedx-rsu"] .filing-cabinet__tab').click();
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
  await expect(page.locator(".case-opening h1")).toContainText("TEDx Rivers State University");
});

test("a thrown paper animation navigates without leaving the visitor trapped", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.classList?.contains("cabinet-extraction__paper"))
        throw new Error("simulated Web Animations failure");
      return original.apply(this, args);
    };
  });
  await page.goto("/work.html");
  await page.locator('.filing-cabinet__folder[data-slug="chopbox"] .filing-cabinet__tab').click();
  await expect(page).toHaveURL(/\/work\/chopbox\.html$/);
});

test("unexpected overlay construction errors still follow the real link", async ({ page }) => {
  await page.goto("/work.html");
  await page.evaluate(() => {
    const original = document.createElement.bind(document);
    document.createElement = function (tag, ...args) {
      if (tag === "div" && window.__failCabinetOverlay)
        throw new Error("simulated DOM allocation failure");
      return original(tag, ...args);
    };
    window.__failCabinetOverlay = true;
  });
  await page.locator('.filing-cabinet__folder[data-slug="chopbox"] .filing-cabinet__tab').click();
  await expect(page).toHaveURL(/\/work\/chopbox\.html$/);
});

test("keyboard and explicit reduced motion bypass travel and retain normal links", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work.html");
  const link = page.locator(".filing-cabinet__link").first();
  const result = await link.evaluate(anchor => {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, button: 0 });
    anchor.dispatchEvent(event);
    return {
      prevented: event.defaultPrevented,
      overlay: document.querySelector(".cabinet-extraction__paper") !== null,
      viewTransition: !!document.querySelector("style[data-cabinet-view-transition]"),
    };
  });
  expect(result).toEqual({ prevented: false, overlay: false, viewTransition: false });
  await expect(page).toHaveURL(/\/work\/rivo\.html$/);
  await expect(page.locator("body")).not.toHaveAttribute("data-cabinet-arrival", "true");
  await page.goto("/work.html");
  await page.locator(".filing-cabinet__link").nth(1).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/work\/tedx-rsu\.html$/);
  await expect(page.locator("body")).not.toHaveAttribute("data-cabinet-arrival", "true");
});

test("modified and auxiliary clicks are never intercepted", async ({ page }) => {
  await page.goto("/work.html");
  const result = await page.locator(".filing-cabinet__link").first().evaluate(anchor => {
    const ctrl = new MouseEvent("click", {
      bubbles: true, cancelable: true, button: 0, detail: 1, ctrlKey: true,
    });
    anchor.dispatchEvent(ctrl);
    const middle = new MouseEvent("auxclick", {
      bubbles: true, cancelable: true, button: 1, detail: 1,
    });
    anchor.dispatchEvent(middle);
    return {
      ctrlPrevented: ctrl.defaultPrevented,
      middlePrevented: middle.defaultPrevented,
      overlay: document.querySelector(".cabinet-extraction__paper") !== null,
    };
  });
  expect(result).toEqual({ ctrlPrevented: false, middlePrevented: false, overlay: false });
});

test("direct case visits never animate and case pages opt in independently", async ({ page }) => {
  for (const slug of ["rivo", "tedx-rsu", "chopbox"]) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-opening h1")).toBeVisible();
    await expect(page.locator("body")).not.toHaveAttribute("data-cabinet-arrival", "true");
    const rule = await page.evaluate(() => [...document.querySelectorAll("head style")]
      .some(style => /@view-transition\s*\{\s*navigation:\s*auto/.test(style.textContent)));
    expect(rule).toBe(true);
  }
});

test("Back clears the extraction sheet and retains the real folder", async ({ page }) => {
  await page.goto("/work.html");
  await page.locator('.filing-cabinet__folder[data-slug="chopbox"] .filing-cabinet__tab').click();
  await expect(page).toHaveURL(/\/work\/chopbox\.html$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/work\.html$/);
  await expect(page.locator(".filing-cabinet__folder[data-slug='chopbox'] .filing-cabinet__link"))
    .toBeFocused();
  await expect(page.locator(".cabinet-extraction__paper")).toHaveCount(0);
  await expect(page.locator(".cabinet-extraction__shade")).toHaveCount(0);
  await expect(page.locator("[data-extracting]")).toHaveCount(0);
});


test("physical cabinet renders without stealing labels, focus or pointer targets", async ({ page }) => {
  await page.goto("/work.html");
  const well = page.locator(".filing-cabinet__well");
  await well.scrollIntoViewIfNeeded();
  const webgl2 = await page.evaluate(() => {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch { return false; }
  });
  if (webgl2 && await page.evaluate(() => navigator.hardwareConcurrency > 2 && !navigator.connection?.saveData)) {
    await expect(page.locator("[data-project-archive]")).toHaveAttribute("data-cabinet3d", "ready");
    const canvas = well.locator(".filing-cabinet__three-canvas");
    await expect(canvas).toHaveCount(1);
    await expect(canvas).toHaveAttribute("aria-hidden", "true");
    await expect(canvas).toHaveCSS("pointer-events", "none");
  }
  await expect(well.locator(".filing-cabinet__link")).toHaveCount(3);
  await well.locator(".filing-cabinet__link").first().focus();
  await expect(well.locator(".filing-cabinet__link").first()).toBeFocused();
  await expect(well.locator(".filing-cabinet__tab-title")).toHaveText([
    "Rivo Studio", "TEDx Rivers State University", "ChopBox",
  ]);
});

test("Work preserves its CSS filing cabinet when WebGL is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "WebGLRenderingContext", {
      configurable: true, value: undefined,
    });
  });
  await page.goto("/work.html");
  await page.locator(".filing-cabinet__well").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-project-archive]")).not.toHaveAttribute("data-cabinet3d", "ready");
  await expect(page.locator(".filing-cabinet__face").first()).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".filing-cabinet__link")).toHaveCount(3);
});


test("Work first paint does not download or initialise the heavy 3D scene", async ({ page }) => {
  let requests = 0;
  await page.route("**/assets/runtime/work-cabinet-three.js", async route => {
    requests++;
    await route.continue();
  });
  await page.goto("/work.html");
  await expect(page.locator(".filing-cabinet__link")).toHaveCount(3);
  // An eager viewport observer would load/compile shaders without input.
  await page.waitForTimeout(700);
  expect(requests).toBe(0);
  await expect(page.locator("[data-project-archive]")).not.toHaveAttribute("data-cabinet3d", "ready");
});


test("reduced-motion preference keeps the physical layer disabled and labels visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work.html");
  const well = page.locator(".filing-cabinet__well");
  await well.scrollIntoViewIfNeeded();
  await page.locator(".filing-cabinet__link").first().focus();
  await page.waitForTimeout(400);
  await expect(well.locator(".filing-cabinet__three-canvas")).toHaveCount(0);
  await expect(page.locator(".filing-cabinet__face").first()).toHaveCSS("transform", "none");
  await expect(page.locator(".filing-cabinet__tab-title").first()).toBeVisible();
});

test("active WebGL cabinet produces actual physical pixels, not an empty canvas", async ({ page }, testInfo) => {
  await page.goto("/work.html");
  const supported = await page.evaluate(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      const enabled = !!context && (navigator.hardwareConcurrency ?? 4) > 2 &&
        (navigator.deviceMemory ?? 4) > 2 && !navigator.connection?.saveData &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches;
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return enabled;
    } catch { return false; }
  });
  test.skip(!supported, "WebGL2 or the device quality tier is unavailable");
  const well = page.locator(".filing-cabinet__well");
  await well.scrollIntoViewIfNeeded();
  await well.hover();
  await expect(page.locator("[data-project-archive]"))
    .toHaveAttribute("data-cabinet3d", "ready", { timeout: 20_000 });
  const canvas = well.locator(".filing-cabinet__three-canvas");
  const png = await canvas.screenshot();
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const colors = new Set();
  for (let i = 0; i < info.width * info.height; i += 53) {
    const offset = i * info.channels;
    colors.add([data[offset], data[offset + 1], data[offset + 2]].join(","));
  }
  expect(colors.size).toBeGreaterThan(20);
  // Evidence for human art-direction QA, not a brittle automated golden.
  await well.screenshot({ path: "test-results/cabinet-" + testInfo.project.name + "-webgl.png" });

  await canvas.evaluate(node => {
    node.dispatchEvent(new Event("webglcontextlost", { cancelable: true }));
  });
  await expect(page.locator("[data-project-archive]"))
    .not.toHaveAttribute("data-cabinet3d", "ready");
  await expect(canvas).toHaveCount(0);
  await expect(page.locator(".filing-cabinet__face").first())
    .not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".filing-cabinet__link")).toHaveCount(3);
});

test("cabinet visual QA records its CSS-first fallback on every configured viewport", async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "WebGL2RenderingContext", {
      configurable: true, value: undefined,
    });
  });
  await page.goto("/work.html");
  const well = page.locator(".filing-cabinet__well");
  await well.scrollIntoViewIfNeeded();
  await expect(well.locator(".filing-cabinet__three-canvas")).toHaveCount(0);
  await well.screenshot({ path: "test-results/cabinet-" + testInfo.project.name + "-css.png" });
});
