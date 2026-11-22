import { test, expect } from "@playwright/test";

test("wide Work folders retain five blank sheets and readable titles across viewports", async ({ page }, testInfo) => {
  const expected = [
    { href: "work/rivo.html", title: "Rivo Studio", number: "01" },
    { href: "work/tedx-rsu.html", title: "TEDx Rivers State University", number: "02" },
    { href: "work/chopbox.html", title: "ChopBox", number: "03" }
  ];

  for (const width of [320, 390, 900, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/work.html");
    await page.evaluate(async () => { await document.fonts.ready; });

    const folders = page.locator(".project-folder");
    await expect(folders).toHaveCount(expected.length);
    await expect(page.locator(".project-folder__paper")).toHaveCount(15);
    await expect(page.locator(".project-folder__tab-number")).toHaveText(expected.map(item => item.number));
    await expect(page.locator(".project-folder__title")).toHaveText(expected.map(item => item.title));
    await expect(page.locator(".project-folder__paper")).toHaveText(Array(15).fill(""));
    await expect(page.locator(".project-folder__front > :not(.project-folder__title)")).toHaveCount(0);
    await expect(page.locator(".project-folder__tab > :not(.project-folder__tab-number)")).toHaveCount(0);

    const measurements = await folders.evaluateAll(items => items.map(folder => {
      const rect = node => node.getBoundingClientRect();
      const link = folder.querySelector(".project-folder__link");
      const face = rect(folder.querySelector(".project-folder__front"));
      const title = rect(folder.querySelector(".project-folder__title"));
      const papers = [...folder.querySelectorAll(".project-folder__paper")];
      const stage = folder.closest(".project-folder-stack__stage");
      return {
        href: link.getAttribute("href"),
        bounds: rect(folder).toJSON(),
        back: rect(folder.querySelector(".project-folder__back")).toJSON(),
        face: face.toJSON(),
        title: title.toJSON(),
        stageBackground: getComputedStyle(stage).backgroundColor,
        stageImage: getComputedStyle(stage).backgroundImage,
        paperCount: papers.length,
        papers: papers.map(paper => ({
          top: rect(paper).top,
          bottom: rect(paper).bottom,
          pointerEvents: getComputedStyle(paper).pointerEvents,
          transition: getComputedStyle(paper).transitionDuration,
          background: getComputedStyle(paper).backgroundImage
        }))
      };
    }));

    expect(measurements.map(item => item.href)).toEqual(expected.map(item => item.href));
    for (const item of measurements) {
      const ratio = item.bounds.width / item.bounds.height;
      expect(ratio, "folders must be wider than they are tall").toBeGreaterThan(1.3);
      expect(item.bounds.width, "each folder must occupy most of the page width").toBeGreaterThan(width * .75);
      expect(item.bounds.right).toBeLessThanOrEqual(width + 1);
      expect(item.stageBackground).toBe("rgba(0, 0, 0, 0)");
      expect(item.stageImage).toBe("none");
      expect(item.paperCount).toBe(5);
      expect(item.papers[0].top, "first paper must sit inside the rear panel").toBeGreaterThanOrEqual(item.back.top - 1);
      expect(item.papers[4].top, "last paper must sit behind the front pocket").toBeLessThan(item.face.top);
      for (const paper of item.papers) {
        expect(paper.bottom, "papers must stay in the physical folder").toBeLessThanOrEqual(item.bounds.bottom + 1);
        expect(paper.pointerEvents).toBe("none");
        expect(paper.transition).toBe("0s");
        expect(paper.background).toContain("repeating-linear-gradient");
      }
      expect(item.title.top).toBeGreaterThanOrEqual(item.face.top - 1);
      expect(item.title.bottom, "project name must fit the front pocket").toBeLessThanOrEqual(item.face.bottom + 1);
      expect(item.title.left).toBeGreaterThanOrEqual(item.face.left - 1);
      expect(item.title.right).toBeLessThanOrEqual(item.face.right + 1);
    }

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(1);
    await page.locator(".project-folder-stack__stage").screenshot({
      path: `test-results/cabinet-${width}-${testInfo.project.name}.png`,
      animations: "disabled"
    });
  }
});
