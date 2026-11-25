import { test, expect } from "@playwright/test";

const cases = [
  { slug: "tedx-rsu", title: "Give the event a pause", status: /event-day photograph/i },
  { slug: "rivo", title: "Soften the technical signal", status: /visualisation/i },
  { slug: "chopbox", title: "Use appetite as the filter", status: /proposed packaging/i }
];

test("case opening identifies project, role, constraint, action and lead imagery", async ({ page }) => {
  for (const {slug} of cases) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-opening h1")).toBeVisible();
    await expect(page.locator(".case-opening__essentials dt")).toHaveText(["My role","The constraint"]);
    await expect(page.locator(".case-opening__essentials dd")).toHaveCount(2);
    await expect(page.locator(".case-opening__actions a[href$='contact.html']")).toHaveAttribute("href", "../contact.html");
    await expect(page.locator(".case-shot--hero")).toBeVisible();
    await expect(page.locator(".case-lead-proof__images img")).toHaveCount(2);
    await expect(page.locator(".case-lead-proof__status")).not.toBeEmpty();
  }
});

test("specific decision headings replace generic prompt-led chapter hierarchy", async ({ page }) => {
  for (const {slug,title} of cases) {
    await page.goto("/work/" + slug + ".html");
    const chapters = page.locator(".case-chapter");
    await expect(chapters).toHaveCount(6);
    await expect(chapters.locator(".case-chapter__eyebrow")).toHaveText([
      "The Context","The Decision","The System","What Survived","First Contact","The Results"
    ]);
    await expect(chapters.locator("h2.case-chapter__heading")).toHaveCount(6);
    await expect(page.locator("#decision h2")).toHaveText(title);
    await expect(page.locator(".case-chapter__descriptor")).toHaveCount(0);
  }
});

test("proof status and inquiry path are present before or after every case", async ({ page }) => {
  for (const {slug,status} of cases) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-lead-proof__status")).toContainText(status);
    await expect(page.locator(".case-end-actions a[href='../contact.html']")).toHaveCount(1);
    await expect(page.locator(".case-end-actions a[href^='mailto:']")).toHaveCount(1);
  }
});

test("case-study evidence and chapter labels remain accessible without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  for (const {slug} of cases) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-opening h1")).toBeVisible();
    await expect(page.locator(".case-lead-proof__images img")).toHaveCount(2);
    await expect(page.locator(".case-chapter h2")).toHaveCount(6);
  }
  await context.close();
});


test("all published case studies use six chapters and standard label tracking", async ({ page }) => {
  for (const slug of ["tedx-rsu", "rivo", "chopbox", "kiki-joshua-notepad"]) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-chapter__eyebrow")).toHaveText(["The Context", "The Decision", "The System", "What Survived", "First Contact", "The Results"]);
    await expect(page.locator(".case-toc strong")).toHaveText(["The Context", "The Decision", "The System", "What Survived", "First Contact", "The Results"]);
    const metadata = page.locator(".case-facts dt");
    await expect(metadata).toHaveText(["Year", "Deliverables", "Credits"]);
    for (const label of await metadata.all()) {
      expect(await label.evaluate(el => {
        const style = getComputedStyle(el);
        return Math.abs(parseFloat(style.letterSpacing) / parseFloat(style.fontSize) + 0.015) < 0.001;
      })).toBe(true);
    }
  }
});


test("shared contents align numbers with the first line of wrapped titles", async ({ page }) => {
  test.setTimeout(120_000);
  const routes = [
    "/work/tedx-rsu.html", "/work/rivo.html", "/work/chopbox.html",
    "/work/kiki-joshua-notepad.html",
    "/essays/when-the-swoosh-lost-its-soul.html",
    "/essays/designing-for-disability-in-nigeria.html",
  ];
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator(".article-toc")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const rows = await page.locator(".article-toc a").evaluateAll(links => links.map(link => {
        const index = link.querySelector(".article-toc__index");
        const title = link.querySelector(".article-toc__title");
        const n = index.getBoundingClientRect();
        const t = title.getBoundingClientRect();
        const r = link.getBoundingClientRect();
        return {
          display: getComputedStyle(link).display,
          aligned: Math.abs(n.top - t.top) <= 1,
          equalLineHeight: getComputedStyle(index).lineHeight === getComputedStyle(title).lineHeight,
          titleOffset: t.left - r.left,
          contained: t.right <= r.right + 1 && t.bottom <= r.bottom + 1,
        };
      }));
      expect(rows.length).toBeGreaterThan(1);
      for (const row of rows) {
        expect(row.display).toBe("grid");
        expect(row.aligned).toBe(true);
        expect(row.equalLineHeight).toBe(true);
        expect(row.contained).toBe(true);
        expect(Math.abs(row.titleOffset - rows[0].titleOffset)).toBeLessThanOrEqual(1);
      }
    }
  }
});

test("homepage scroll cue remains inside the landing at maximum travel", async ({ page }) => {
  test.setTimeout(60_000);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    const cue = page.locator(".scroll-cue span:last-child");
    await expect(cue).toBeVisible();
    const bounds = await cue.evaluate(async el => {
      const animation = el.getAnimations().find(a => a.animationName === "work-scroll-nudge");
      if (!animation) return null;
      animation.pause();
      await animation.ready;
      animation.currentTime = Number(animation.effect.getTiming().duration) * 0.3;
      const arrow = el.getBoundingClientRect();
      const frame = el.closest(".home-landing").getBoundingClientRect();
      return { bottom: arrow.bottom, frameBottom: frame.bottom };
    });
    expect(bounds).not.toBeNull();
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.frameBottom + 0.5);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => cue.evaluate(el => el.getAnimations().some(a => a.animationName === "work-scroll-nudge"))).toBe(false);
  }
});
