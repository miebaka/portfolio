import { test, expect } from "@playwright/test";

const valid = { name: "Ada Okafor", email: "ada@example.com", interest: "brand-identity", message: "I need help with a brand identity system." };

async function fill(page) {
  await page.getByLabel("Name").fill(valid.name);
  await page.getByLabel("Email").fill(valid.email);
  await page.getByLabel("What can I help with?").selectOption({ index: 1 });
  await page.getByLabel("Message").fill(valid.message);
}

async function mock(page, status, body) {
  await page.route("**/api/contact", route => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) }));
}

const fields = page => ({
  name: page.getByLabel("Name"), email: page.getByLabel("Email"),
  interest: page.getByLabel("What can I help with?"), message: page.getByLabel("Message")
});

async function expectRetained(page) {
  const input = fields(page);
  for (const [name, value] of Object.entries(valid)) await expect(input[name]).toHaveValue(value);
}

function expectNoLeak(page, consoleMessages, values = Object.values(valid)) {
  for (const value of values) {
    expect(page.url()).not.toContain(value);
    expect(page.url()).not.toContain(encodeURIComponent(value));
    expect(consoleMessages.join(" ")).not.toContain(value);
  }
}

test.beforeEach(async ({ page }) => { await page.goto("/contact.html"); });

test("202 confirms delivery, clears values and prevents a duplicate in flight", async ({ page }) => {
  let requests = 0;
  const consoleMessages = [];
  page.on("console", message => consoleMessages.push(message.text()));
  await page.route("**/api/contact", async route => {
    requests += 1;
    await new Promise(resolve => setTimeout(resolve, 200));
    await route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await fill(page);
  const button = page.getByRole("button", { name: "Work with me" });
  await button.dblclick();
  await expect(page.getByRole("status")).toHaveText("Message sent. I’ll reply by email.");
  expect(requests).toBe(1);
  for (const field of Object.values(fields(page))) await expect(field).toHaveValue("");
  await expect(page.locator('[name="website"]')).toHaveValue("");
  await expect(page.locator('[name="startedAt"]')).not.toHaveValue("");
  expectNoLeak(page, consoleMessages);
});

test("422 exposes field feedback and retains input", async ({ page }) => {
  const consoleMessages = [];
  page.on("console", message => consoleMessages.push(message.text()));
  await mock(page, 422, { fieldErrors: { email: "Use a work email address." } });
  await fill(page);
  await page.getByRole("button", { name: "Work with me" }).click();
  await expect(page.getByRole("status")).toHaveText("Check the highlighted fields.");
  await expect(page.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
  await expectRetained(page);
  expectNoLeak(page, consoleMessages);
});

for (const outcome of [
  { status: 429, body: { code: "RATE_LIMITED" }, copy: /Too many attempts/ },
  { status: 503, body: { code: "PROVIDER_UNAVAILABLE" }, copy: /temporarily unavailable/ }
]) {
  test(`${outcome.status} retains the message and gives a recovery path`, async ({ page }) => {
    const consoleMessages = [];
    page.on("console", message => consoleMessages.push(message.text()));
    await mock(page, outcome.status, outcome.body);
    await fill(page);
    await page.getByRole("button", { name: "Work with me" }).click();
    await expect(page.getByRole("status")).toHaveText(outcome.copy);
    await expectRetained(page);
    expectNoLeak(page, consoleMessages);
  });
}
