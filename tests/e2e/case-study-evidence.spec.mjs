import { test, expect } from "@playwright/test";

const cases = ["/work/rivo.html", "/work/tedx-rsu.html", "/work/chopbox.html"];
const labels = ["The Call", "The System", "What Survived", "First Contact", "The Results"];
const descriptors = [
  "What did I decide, and what did I turn down to get there?",
  "What did I build so the decision outlived the first week?",
  "What did the deadline and the budget leave standing?",
  "How did the people it was made for first meet it?",
  "What changed because this existed, and how do I know?"
];

test("all five PR #46 chapters and their exact questions actually become visible", async ({ page }) => {
  for (const route of cases) {
    await page.goto(route);
    const chapters = page.locator(".case-chapter");
    await expect(chapters).toHaveCount(5);
    await expect(chapters.locator(".case-chapter__intro h2")).toHaveText(labels);
    await expect(chapters.locator(".case-chapter__descriptor")).toHaveText(descriptors);
    for (let i = 0; i < 5; i++) {
      const chapter = chapters.nth(i);
      await chapter.scrollIntoViewIfNeeded();
      await expect(chapter).toHaveClass(/is-revealed/);
      const visible = await chapter.evaluate(node => {
        const parts = [".case-chapter__intro", ".case-chapter__heading", ".case-chapter__body"];
        return parts.map(selector => {
          const element = node.querySelector(selector);
          const style = getComputedStyle(element);
          return { opacity: Number(style.opacity), visible: style.visibility, height: element.getBoundingClientRect().height };
        });
      });
      for (const part of visible) {
        expect(part.opacity, route + " chapter " + i + " must actually reveal").toBeGreaterThan(.98);
        expect(part.visible).toBe("visible");
        expect(part.height).toBeGreaterThan(0);
      }
    }
  }
});

test("case-study chapters remain readable with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of cases) {
    await page.goto(route);
    await expect(page.locator(".case-chapter__intro h2")).toHaveText(labels);
    await expect(page.locator(".case-chapter__descriptor")).toHaveText(descriptors);
    await expect(page.locator(".case-chapter__heading")).toHaveCount(5);
  }
  await context.close();
});
