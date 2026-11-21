/**
 * A green Playwright exit code can still hide silently skipped cross-device
 * coverage. Parse the machine-readable reporter instead of scraping CI logs.
 *
 * This intentionally checks the executed Playwright matrix, not just the
 * source files: new conditional skips or environment-dependent GPU skips
 * must fail the quality gate rather than disappear from the headline total.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const reportPath = resolve("test-results/e2e-test-results.json");
let report;
try {
  report = JSON.parse(readFileSync(reportPath, "utf8"));
} catch (error) {
  console.error("No usable Playwright JSON report:", error.message);
  process.exit(1);
}

const executions = [];
function visit(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests || []) {
      executions.push({
        title: spec.title,
        file: spec.file || suite.file || "",
        project: test.projectName || "unknown",
        status: test.status,
        expectedStatus: test.expectedStatus,
        results: test.results || [],
      });
    }
  }
  for (const child of suite.suites || []) visit(child);
}
for (const suite of report.suites || []) visit(suite);

if (executions.length === 0) {
  console.error("The end-to-end report contains no executions; coverage is missing.");
  process.exit(1);
}
const skipped = executions.filter(test =>
  test.status === "skipped" ||
  test.expectedStatus === "skipped" ||
  test.results.some(result => result.status === "skipped")
);
if (skipped.length) {
  for (const test of skipped) {
    console.error("SKIPPED:", test.project, test.file, test.title);
  }
  console.error(`E2E coverage failed: ${skipped.length} skipped executions.`);
  process.exit(1);
}
console.log(`E2E coverage verified: ${executions.length} executions, 0 skipped.`);
