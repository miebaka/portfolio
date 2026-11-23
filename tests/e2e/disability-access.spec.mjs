import { test, expect } from "@playwright/test";

const currentOverflow = page => page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("hero copy is protected from animated water and the pause button has its own space", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/index.html");
    const copy = page.locator(".home-landing__statement");
    const cta = page.locator('.home-landing__meta a[href="#selected-work"]');
    await expect(copy).toBeVisible();
    await expect(cta).toBeVisible();
    const stable = await copy.evaluate(element => {
      const paint = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return { background: paint.backgroundColor, left: box.left, right: box.right };
    });
    expect(stable.background).toMatch(/rgba?\(/);
    expect(stable.left).toBeGreaterThanOrEqual(0);
    expect(stable.right).toBeLessThanOrEqual(width + 1);
    const pause = page.locator(".hero-wave__control");
    if (await pause.isVisible()) {
      const separated = await page.evaluate(() => {
        const a = document.querySelector(".hero-wave__control")?.getBoundingClientRect();
        const b = document.querySelector(".home-landing__statement")?.getBoundingClientRect();
        return !a || !b || a.right <= b.left || b.right <= a.left ||
          a.bottom <= b.top || b.bottom <= a.top;
      });
      expect(separated, "Pause must not obscure the proposition at " + width).toBe(true);
      await pause.focus();
      await expect(pause).toBeFocused();
      await expect(pause).toHaveAccessibleName(/pause background motion/i);
    }
    expect(await currentOverflow(page)).toBeLessThanOrEqual(2);
  }
});

test("reduced motion starts the water in a still state without requiring a precise target", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator(".home-landing__statement")).toBeVisible();
  await expect(page.locator(".home-landing h1")).toBeVisible();
  const control = page.locator(".hero-wave__control");
  if (await control.count()) await expect(control).toBeHidden();
  const animationCount = await page.locator(".home-landing").evaluate(element =>
    element.getAnimations().filter(animation => animation.playState === "running").length);
  expect(animationCount).toBe(0);
});

test("mobile Index exposes theme and motion choices, and restores keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/index.html");
  const trigger = page.getByRole("button", { name: "Index", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Index" });
  await expect(dialog).toBeVisible();
  const reduce = dialog.getByRole("button", { name: "Reduce motion" });
  await expect(reduce).toBeVisible();
  await reduce.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(dialog.getByRole("button", { name: "Light", exact: true })).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Dark", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("Work is a readable list of separate named targets at rest, including in forced colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/work.html");
  const cards = page.locator(".project-folder");
  await expect(cards).toHaveCount(3);
  await expect(cards.locator(".project-folder__title")).toHaveText([
    "TEDx Rivers State University", "Rivo Studio", "ChopBox"
  ]);
  await expect(cards.locator(".project-folder__outcome")).toHaveCount(3);
  await expect(cards.locator(".project-folder__visual img")).toHaveCount(3);
  for (const [index, slug] of ["tedx-rsu", "rivo", "chopbox"].entries()) {
    const link = cards.nth(index).locator(".project-folder__link");
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toHaveAttribute("href", "work/" + slug + ".html");
    const rect = await link.boundingBox();
    expect(rect.width).toBeGreaterThan(44);
    expect(rect.height).toBeGreaterThan(44);
  }
  expect(await currentOverflow(page)).toBeLessThanOrEqual(2);
});

test("Experiments can be browsed without dragging or trapping focus", async ({ page }) => {
  await page.goto("/experiments.html");
  await expect(page.locator(".experiments-static__grid a")).toHaveCount(7);
  const index = page.getByRole("button", { name: /study index/i });
  await index.click();
  const panel = page.getByRole("region", { name: "Experiment index" });
  await expect(panel).toBeVisible();
  await expect(panel.locator("button[data-experiment-jump]")).toHaveCount(7);
  await panel.locator("button[data-experiment-jump]").nth(2).click();
  await expect(panel).toBeHidden();
  await expect(page.locator("[data-experiment-title]")).toContainText("Party");
  await expect(page.locator(".experiments-controls [data-experiments-next]")).toHaveAccessibleName("Next experiment");
  await page.locator("[data-experiments-next]").click();
  await expect(page.locator("[data-experiments-counter]")).toHaveText("04 / 07");
  await expect(page.locator(".experiments-static__grid a").first()).toHaveAttribute("target", "_blank");
});

test("case studies offer text decisions, evidence meanings and embedded artwork words", async ({ page }) => {
  for (const [slug, words] of [
    ["tedx-rsu", /Reflect\. Reconsider\. Reward/],
    ["rivo", /Software that simply works for all/],
    ["chopbox", /Hello, I am the chef/]
  ]) {
    await page.goto("/work/" + slug + ".html");
    await expect(page.locator(".case-opening h1")).toBeVisible();
    await expect(page.locator(".case-opening__essentials dt")).toHaveText(["My role", "The constraint"]);
    await expect(page.locator(".case-lead-proof h2")).toBeVisible();
    await expect(page.locator(".case-shot__embedded-words").first()).toBeAttached();
    await expect(page.locator(".case-shot__embedded-words").first()).toContainText(words);
    await expect(page.locator(".case-opening__actions a")).toHaveAttribute("href", "../contact.html");
    await expect(page.locator(".case-end-actions a[href^='mailto:']")).toHaveCount(1);
  }
});

test("contact errors are announced and entries survive an unsuccessful request", async ({ page }) => {
  await page.route("**/api/contact", async route => route.fulfill({
    status: 422, contentType: "application/json",
    body: JSON.stringify({ ok: false, code: "INVALID_REQUEST", fieldErrors: { email: "Please review this email address." } })
  }));
  await page.goto("/contact.html");
  await page.locator('[name="name"]').fill("Tester");
  await page.locator('[name="email"]').fill("test@example.com");
  await page.locator('[name="message"]').fill("Testing the form's accessible error recovery.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator('[name="email"]')).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#email-error")).toHaveText("Please review this email address.");
  await expect(page.locator("#form-status")).toHaveAttribute("role", "alert");
  await expect(page.locator('[name="message"]')).toHaveValue("Testing the form's accessible error recovery.");
  await expect(page.locator('[name="email"]')).toBeFocused();
});

test("a simulated accepted response has an accessible status without claiming verified inbox delivery", async ({ page }) => {
  await page.route("**/api/contact", async route => route.fulfill({
    status: 202, contentType: "application/json",
    body: JSON.stringify({ ok: true, requestId: "test_1" })
  }));
  await page.goto("/contact.html");
  await page.locator('[name="name"]').fill("Tester");
  await page.locator('[name="email"]').fill("test@example.com");
  await page.locator('[name="message"]').fill("Testing the accepted inquiry announcement.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.locator("#form-status")).toHaveAttribute("role", "status");
  await expect(page.locator("#form-status")).toContainText("Your inquiry was accepted.");
  await expect(page.locator('[name="message"]')).toHaveValue("");
});

test("reflow and 200 percent text resize preserve the core task routes", async ({ page }) => {
  for (const viewport of [{width:320,height:740}, {width:390,height:844}]) {
    await page.setViewportSize(viewport);
    for (const route of ["/index.html","/work.html","/contact.html","/work/tedx-rsu.html"]) {
      await page.goto(route);
      if (viewport.width === 390) await page.evaluate(() =>
        document.documentElement.style.fontSize = "200%");
      await expect(page.locator("main h1").first()).toBeVisible();
      const overflow = await currentOverflow(page);
      expect(overflow, route + " at " + viewport.width).toBeLessThanOrEqual(2);
    }
  }
});
