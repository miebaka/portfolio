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
    await expect(chapters).toHaveCount(5);
    await expect(chapters.locator(".case-chapter__eyebrow")).toHaveText([
      "The Call","The System","What Survived","First Contact","The Results"
    ]);
    await expect(chapters.locator("h2.case-chapter__heading")).toHaveCount(5);
    await expect(chapters.first().locator("h2")).toHaveText(title);
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
    await expect(page.locator(".case-chapter h2")).toHaveCount(5);
  }
  await context.close();
});
