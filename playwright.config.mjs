import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results",
  snapshotPathTemplate: "{testDir}/{testFilePath}-snapshots/{arg}{-projectName}{ext}",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // Shared macOS runners serialize GPU work poorly; one CI worker keeps the
  // WebGL assertions deterministic without weakening coverage or timeouts.
  workers: process.env.CI ? 1 : 2,
  reporter: process.env.CI
    ? [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]]
    : [["line"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.002,
    },
  },
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
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "reduced-motion", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" } }
  ],
  webServer: {
    command: "npm run build && node scripts/serve-static.mjs dist 4173",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
