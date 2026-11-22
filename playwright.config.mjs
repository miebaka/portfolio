import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // One worker keeps shader and visual assertions deterministic in CI.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }],
      ["json", { outputFile: "test-results/e2e-test-results.json" }]]
    : [["line"], ["html", { outputFolder: "playwright-report", open: "never" }],
      ["json", { outputFile: "test-results/e2e-test-results.json" }]],
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    browserName: "chromium",
    locale: "en-NG",
    timezoneId: "Africa/Lagos",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    { name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } }
  ],
  webServer: {
    command: "npm run build && node scripts/serve-static.mjs dist 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
