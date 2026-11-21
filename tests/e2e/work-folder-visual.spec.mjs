import { test, expect } from "@playwright/test";

test("Work folder rack survives mobile, tablet and desktop without clipping or pointer traps", async ({ page }, testInfo) => {
  for (const width of [320, 390, 900, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/work.html");
    await page.evaluate(async () => { await document.fonts.ready; });
    const folders = page.locator(".project-folder");
    await expect(folders).toHaveCount(3);
    const measurements = await folders.evaluateAll(items => items.map(folder => {
      const rect = element => {
        const r = element.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      };
      const front = folder.querySelector(".project-folder__front");
      const link = folder.querySelector(".project-folder__link");
      const title = folder.querySelector(".project-folder__title");
      const bottom = folder.querySelector(".project-folder__bottom");
      const tab = folder.querySelector(".project-folder__tab-title");
      const papers = [...folder.querySelectorAll(".project-folder__paper")];
      return {
        href: link.getAttribute("href"),
        folder: rect(folder),
        front: rect(front),
        title: rect(title),
        bottom: rect(bottom),
        tab: { scrollWidth: tab.scrollWidth, clientWidth: tab.clientWidth },
        paperCount: papers.length,
        paperBottoms: papers.map(paper => rect(paper).bottom),
        paperInteractions: papers.map(paper => ({
          pointerEvents: getComputedStyle(paper).pointerEvents,
          transitionDuration: getComputedStyle(paper).transitionDuration
        }))
      };
    }));
    expect(measurements.map(item => item.href)).toEqual([
      "work/rivo.html", "work/tedx-rsu.html", "work/chopbox.html"
    ]);
    for (const item of measurements) {
      expect(item.folder.width / item.folder.height).toBeCloseTo(.75, 1);
      expect(item.paperCount).toBe(5);
      for (const bottom of item.paperBottoms) {
        expect(bottom, "every sheet must stay inside its file pocket").toBeLessThanOrEqual(item.folder.bottom + 1);
      }
      expect(item.tab.scrollWidth).toBeLessThanOrEqual(item.tab.clientWidth + 2);
      for (const paper of item.paperInteractions) {
        expect(paper.pointerEvents).toBe("none");
        expect(paper.transitionDuration).toBe("0s");
      }
      expect(item.title.left).toBeGreaterThanOrEqual(item.front.left - 1);
      expect(item.title.right).toBeLessThanOrEqual(item.front.right + 1);
      expect(item.bottom.bottom, "case category/CTA must not clip outside pocket").toBeLessThanOrEqual(item.front.bottom + 2);
    }
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);

    // The archive stage is the visual review artifact; tests assert structure, but
    // humans must inspect these screenshots before a production merge.
    await page.locator(".project-folder-stack__stage").screenshot({
      path: `test-results/cabinet-${width}-${testInfo.project.name}.png`,
      animations: "disabled"
    });
  }
});
