import { test, expect } from "@playwright/test";

const routes = [
  ["/work/tedx-rsu.html", "Next project", "Rivo Studio"],
  ["/work/rivo.html", "Next project", "ChopBox"],
  ["/essays/designing-for-disability-in-nigeria.html", "Next essay", "When the Swoosh Lost Its Soul"],
  ["/essays/when-the-swoosh-lost-its-soul.html", "Next essay", "Making the World More Accessible"]
];

for (const [route, label, title] of routes) {
  test(`shared next-content handoff: ${route}`, async ({ page }) => {
    await page.goto(route);
    const section = page.getByRole("region", { name: label, exact: true });
    await expect(section).toHaveCount(1);
    const link = section.getByRole("link");
    const name = link.locator(".case-next__name");
    await expect(name).toHaveText(title);
    await expect(link).toHaveAttribute("href", /\.html$/);
    await link.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    const fine = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches);
    if (fine) {
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).color)).toBe("rgba(0, 0, 0, 0)");
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).transform)).toContain("matrix3d");
      await link.hover();
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).transform)).toBe("matrix(1, 0, 0, 1, 0, 0)");
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).color)).not.toBe("rgba(0, 0, 0, 0)");
      await page.mouse.move(0, 0);
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).color)).toBe("rgba(0, 0, 0, 0)");
    } else {
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).transform)).toBe("none");
      await expect.poll(() => name.evaluate(el => getComputedStyle(el).color)).not.toBe("rgba(0, 0, 0, 0)");
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect.poll(() => name.evaluate(el => getComputedStyle(el).transform)).toBe("none");
    await expect.poll(() => name.evaluate(el => getComputedStyle(el).color)).not.toBe("rgba(0, 0, 0, 0)");
    await link.focus();
    await expect(link).toBeFocused();
    await expect(section).toBeInViewport();
    const target = await link.evaluate(el => el.href);
    await link.press("Enter");
    await expect(page).toHaveURL(target);
  });
}
