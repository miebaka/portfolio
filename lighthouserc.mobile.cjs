// Repeatable mobile-only SEO and performance baseline. Lab data is not field CWV.
// Keep performance as informational while the real mobile baseline is being established.
module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: [
        "http://localhost/index.html?shader-perf=1",
        "http://localhost/experiments.html",
        "http://localhost/work/tedx-rsu.html"
      ],
      numberOfRuns: 2,
      settings: {
        chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage",
        formFactor: "mobile"
      }
    },
    assert: {
      assertions: {
        "categories:seo": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500, aggregationMethod: "median" }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1, aggregationMethod: "median" }],
        "total-blocking-time": ["warn", { maxNumericValue: 200, aggregationMethod: "median" }]
      }
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/mobile-reports" }
  }
};
