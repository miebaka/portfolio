import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { siteConfig } from "../data/site-config.js";

const run = (command, args) => execFileSync(command, args, { encoding: "utf8" }).trim();
const api = path => JSON.parse(run("gh", ["api", path]));

async function receipt() {
  const [requestedBase, ...extra] = process.argv.slice(2);
  if (extra.length || (requestedBase && !/^[a-f0-9]{7,40}$/i.test(requestedBase))) {
    throw new Error("Usage: npm run release:receipt -- [base-commit-sha]");
  }

  const repository = JSON.parse(run("gh", ["repo", "view", "--json", "nameWithOwner,defaultBranchRef"]));
  const branch = repository.defaultBranchRef.name;
  const repo = `repos/${repository.nameWithOwner}`;
  const localHead = run("git", ["rev-parse", "HEAD"]);
  const trackedChanges = Boolean(run("git", ["status", "--porcelain", "--untracked-files=no"]));
  const head = api(`${repo}/git/ref/heads/${encodeURIComponent(branch)}`).object.sha;
  const commit = api(`${repo}/commits/${head}`);
  const parent = commit.parents[0]?.sha;
  const base = requestedBase
    ? api(`${repo}/commits/${requestedBase}`)
    : parent && api(`${repo}/commits/${parent}`);
  const parentTree = base && (base.sha === parent ? base.commit.tree.sha : api(`${repo}/commits/${parent}`).commit.tree.sha);
  const checkRuns = api(`${repo}/commits/${head}/check-runs`).check_runs;
  const checks = ["quality", "typography"].map(name => {
    const check = checkRuns.find(run => run.app?.slug === "github-actions" && run.name === name);
    return { name, state: check?.conclusion || check?.status || "missing", url: check?.html_url ?? null };
  });
  const vercel = api(`${repo}/commits/${head}/status`).statuses
    .find(status => status.context === "Vercel");
  const production = new URL(siteConfig.canonicalUrl);
  const browser = await chromium.launch();
  const productionSmoke = [];
  try {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.route("**/*", route => {
      const url = new URL(route.request().url());
      return route.request().isNavigationRequest() && url.origin === production.origin
        ? route.continue()
        : route.abort();
    });
    for (const path of ["/", "/work.html"]) {
      try {
        const response = await page.goto(new URL(path, production).href, { waitUntil: "commit", timeout: 15_000 });
        const heading = await page.getByRole("main").getByRole("heading", { level: 1 }).textContent({ timeout: 5000 });
        productionSmoke.push({ path, http: response.status(), heading, passed: response.ok() && Boolean(heading.trim()) });
      } catch (error) {
        productionSmoke.push({ path, passed: false, error: error.message });
      }
    }
  } finally {
    await browser.close();
  }

  const report = {
    repository: repository.nameWithOwner,
    branch, localHead, trackedChanges, remoteHead: head, localMatchesRemote: localHead === head,
    base: base?.sha ?? null,
    parent: parent ?? null,
    baseMatchesParentTree: base ? base.commit.tree.sha === parentTree : null,
    checks,
    vercel: vercel ? { state: vercel.state, url: vercel.target_url } : null,
    productionSmoke
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.localMatchesRemote || trackedChanges || report.baseMatchesParentTree === false ||
      checks.some(check => check.state !== "success") || vercel?.state !== "success" ||
      productionSmoke.some(result => !result.passed)) process.exitCode = 1;
}

receipt().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
