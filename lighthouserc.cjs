module.exports = {
  ci: {
    collect: {
      staticDistDir: "./dist",
      url: ["http://localhost/index.html?shader-perf=1", "http://localhost/work.html", "http://localhost/work/tedx-rsu.html"],
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless --no-sandbox --disable-dev-shm-usage", preset: "desktop" }
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        // Use the median of three runs so a cold shared runner cannot fail an
        // otherwise stable release. The Core Web Vitals threshold stays strict.
        "largest-contentful-paint": ["error", { maxNumericValue: 2500, aggregationMethod: "median" }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05, aggregationMethod: "pessimistic" }],
        "total-blocking-time": ["error", { maxNumericValue: 200, aggregationMethod: "pessimistic" }]
      }
    },
    upload: { target: "filesystem", outputDir: ".lighthouseci/reports" }
  }
};
