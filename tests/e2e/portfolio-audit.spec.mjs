import { test, expect } from "@playwright/test";
import { services } from "../../data/services.js";

const publicRoutes = [
  "/work.html", "/experiments.html", "/about.html",
  "/essays.html", "/contact.html", "/privacy.html",
  "/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html"
];

test("all requested public routes return HTTP 200 and meaningful main content", async ({ page }) => {
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main h1"), route).toHaveCount(1);
    const reading = (await page.locator("main").innerText()).trim();
    expect(reading.length, route).toBeGreaterThan(100);
  }
});

test("each distinctive capability proof link opens a real published chapter", async ({ page }) => {
  const hrefs = services.map(service => service.evidenceHref);
  expect(new Set(hrefs).size).toBe(hrefs.length);
  for (const href of hrefs) {
    const url = new URL(href, "http://127.0.0.1:4173/");
    const response = await page.goto(url.pathname + url.hash);
    expect(response?.status(), href).toBe(200);
    const chapter = page.locator(url.hash + ".case-chapter");
    await expect(chapter, href).toHaveCount(1);
    await expect(chapter.locator("h2.case-chapter__heading"), href).toHaveCount(1);
    expect((await chapter.innerText()).length, href).toBeGreaterThan(90);
  }
  for (const caseSlug of ["rivo", "tedx-rsu", "chopbox"]) {
    await page.goto("/work/" + caseSlug + ".html");
    for (const anchor of ["decision", "system", "survival", "encounter", "results"]) {
      await expect(page.locator("#" + anchor + ".case-chapter"), caseSlug + "#" + anchor).toHaveCount(1);
    }
  }
});

test("copy email is usable beside the address and in the footer without replacing mailto", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: value => { window.__lastCopiedEmail = value; return Promise.resolve(); } }
    });
  });
  await page.goto("/contact.html");
  const address = page.locator(".contact-info a[href^='mailto:']");
  await expect(address).toHaveAttribute("href", "mailto:miebakakiki@gmail.com");
  const inlineCopy = page.locator(".contact-info .copy-email");
  await expect(inlineCopy).toBeVisible();
  await inlineCopy.click();
  await expect(inlineCopy).toContainText("Copied");
  await expect.poll(() => page.evaluate(() => window.__lastCopiedEmail)).toBe("miebakakiki@gmail.com");
  const footerEmail = page.locator(".site-footer__top a[href^='mailto:']");
  await expect(footerEmail).toHaveCount(1);
  const footerCopy = page.locator(".site-footer__top .copy-email");
  await expect(footerCopy).toBeVisible();
  await footerCopy.click();
  await expect(footerCopy).toContainText("Copied");
});

test("font roles, portrait source widths and OS motion preference remain coherent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const typography = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      faces: [...document.fonts].filter(face => /^Geist (Sans|Mono)$/.test(face.family.replaceAll('"', "")))
        .map(face => [face.family.replaceAll('"', ""), String(face.weight)]),
      synthesis: getComputedStyle(document.body).fontSynthesisWeight,
      headingWeight: getComputedStyle(document.querySelector(".home-landing h1")).fontWeight
    };
  });
  expect(typography.faces).toEqual(expect.arrayContaining([
    ["Geist Sans", "400"], ["Geist Sans", "600"],
    ["Geist Mono", "400"], ["Geist Mono", "600"]
  ]));
  expect(typography.synthesis).toBe("none");
  expect(["400", "600"]).toContain(typography.headingWeight);

  for (const route of ["/index.html", "/about.html"]) {
    await page.goto(route);
    const details = await page.locator("picture:has(img[src*='miebaka-joshua-profile'])").first().evaluate(picture => {
      const img = picture.querySelector("img");
      const avif = picture.querySelector('source[type="image/avif"]');
      const webp = picture.querySelector('source[type="image/webp"]');
      return { width: img.getBoundingClientRect().width, viewport: innerWidth, sizes: avif?.sizes,
        webpSizes: webp?.sizes, naturalRatio: img.getAttribute("width") / img.getAttribute("height") };
    });
    expect(details.width).toBeGreaterThan(0);
    expect(details.sizes).toBe(details.webpSizes);
    expect(details.sizes).toContain("max-width: 48em");
    const desktopFraction = Number(details.sizes.match(/([\d.]+)vw$/)?.[1]) / 100;
    expect(Math.abs(details.width - details.viewport * desktopFraction)).toBeLessThan(details.viewport * .12);
    expect(details.naturalRatio).toBeCloseTo(.8, 3);
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  await expect(page.locator(".client-marquee")).toHaveAttribute("data-marquee-state", "paused");
  const cssMotion = await page.locator(".home-landing").evaluate(element => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(cssMotion).toBeLessThan(.01);
});
