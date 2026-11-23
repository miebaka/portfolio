import { test, expect } from "@playwright/test";

test("cardstock folders hold five paper sheets and legible project evidence at every viewport", async ({ page }, testInfo) => {
  const titles = ["TEDx Rivers State University", "Rivo Studio", "ChopBox"];
  for (const width of [320, 390, 900, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/work.html");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator(".project-folder__title")).toHaveText(titles);
    await expect(page.locator(".project-folder__tab-number")).toHaveText(["01","02","03"]);
    const measured = await page.locator(".project-folder").evaluateAll(nodes =>
      nodes.map(node => {
        const front = node.querySelector(".project-folder__front");
        const link = node.querySelector(".project-folder__link");
        const title = node.querySelector(".project-folder__title");
        const tab = node.querySelector(".project-folder__tab");
        const sheets = [...node.querySelectorAll(".project-folder__paper")];
        return {
          width: node.getBoundingClientRect().width,
          titleFits: title.getBoundingClientRect().right <= front.getBoundingClientRect().right + 1,
          tabVisible: tab.getBoundingClientRect().height > 0,
          linkNamed: Boolean(link.getAttribute("aria-label")),
          sheets: sheets.map(sheet => ({
            text: sheet.textContent,
            pointer: getComputedStyle(sheet).pointerEvents,
            surface: getComputedStyle(sheet).backgroundImage
          }))
        };
      }));
    expect(measured).toHaveLength(3);
    for (const m of measured) {
      expect(m.width).toBeGreaterThan(0);
      expect(m.titleFits).toBe(true);
      expect(m.tabVisible).toBe(true);
      expect(m.linkNamed).toBe(true);
      expect(m.sheets).toHaveLength(5);
      for (const sheet of m.sheets) {
        expect(sheet.pointer).toBe("none");
        expect(sheet.text).toBe("");
        expect(sheet.surface).toContain("repeating-linear-gradient");
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(2);
    await page.locator(".project-folder-stack__stage").screenshot({
      path: "test-results/visible-folders-" + width + "-" + testInfo.project.name + ".png",
      animations: "disabled"
    });
  }
});
