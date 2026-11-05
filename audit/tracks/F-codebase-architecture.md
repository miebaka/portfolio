# Track F — Codebase architecture

## Stack

Multi-page static HTML with ES modules and a small Node build (`package.json:7-34`, `scripts/build-site.mjs:1-172`), deployed from `dist` on Vercel (`vercel.json:2-4`). React/Three/ShaderGradient dependencies exist only for the generated shader asset, not page rendering (`package.json:38-45`). No framework migration is justified.

## Root cause and recommendation

The build centralizes data and post-processes shells, but `<head>`, fallback header and fallback footer remain duplicated in every authored HTML file (`index.html:5-57,99-113`; `work.html:5-55,66-80`). `renderShell()` regex-replaces canonical/nav/footer fragments (`scripts/build-site.mjs:97-108`), which is brittle and leaves Explorations with an empty no-JS footer.

| Option | Benefit | Cost / risk | Verdict |
|---|---|---|---|
| Extend current Node build with explicit partial/template functions | Zero framework runtime; smallest migration; preserves static output and current data modules | Must replace regex shell surgery with deterministic templates | **Recommended** |
| Eleventy | Mature includes/collections; clean content templates | New dependency/config and migration surface for only 15 pages | Not justified yet |
| Astro static output | Strong component model and image tooling | Largest migration; easy to reintroduce client JS; source churn | Reject for this refactor |

## Other findings

- CSS is bundled recursively but has no cascade layers (`scripts/build-site.mjs:16-37`; `styles/main.css:1-4`). Introduce required layer order.
- Source CSS totals 153,566 bytes and built gzip is 27,600 bytes (`audit/raw/recon.txt`; `audit/raw/npm-test.txt`). Dead-CSS percentage is **unverified**; measure with coverage before deleting.
- Source JS totals 115,883 bytes (`audit/raw/recon.txt`) and is already ES-module based. Several behaviors are appropriately split, but class/data coupling must be mapped before component renames.
- Tooling includes build, tests, Playwright, axe and Lighthouse, but lacks `.editorconfig`, Prettier, Stylelint and HTMLHint (`package.json:7-34`; repository inventory).
- Existing `README.md`, `DESIGN.md` and design-system docs are present, so update rather than duplicate them.
- Assets include unused font families and non-WOFF2 formats (`audit/raw/recon.txt`). Prove usage before cleanup.

