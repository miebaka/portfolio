# Track A — Information architecture and navigation

## Findings

| ID | Finding | Evidence | Priority | Fix |
|---|---|---|---|---|
| A-01 | The route registry is a single source, but its public vocabulary conflicts with the requested IA: `Experiments`/`Notes` versus `Explorations`/`Writing`; `Community` is only a legacy redirect; `Services` has no route. | `data/navigation.js:2-11`; `vercel.json:5-7`; source inventory in `audit/raw/recon.txt`. | P0 | Adopt D2 labels and paths, add 301s, and keep legacy URLs out of sitemap/navigation. |
| A-02 | The logo is not exposed as the clear Home control in the fallback nav, while `Home` is omitted from primary placement. With JS disabled, the fallback starts at Work. | `data/navigation.js:3-8`; `scripts/build-site.mjs:99-104`; `index.html:51-57`. | P0 | Make the logo a normal anchor to Home in the shared header; keep Home out of text links if desired. |
| A-03 | Runtime nav correctly adds `aria-current="page"`, but static fallback links do not. JS-disabled users lose orientation. | `js/render/navigation.js:12,41,48`; `scripts/build-site.mjs:99-104`. | P1 | Render the current-page attribute at build time in the same shared partial. |
| A-04 | The mobile implementation is a persistent tab bar, not the requested complete six-link mobile menu; it exposes only the hard-coded subset. | `js/render/navigation.js:42-50`; screenshot `audit/before/index--390--motion-reduce.png`. | P0 | Use one accessible disclosure menu containing the full D2 IA; Escape, focus return, inert background and scroll lock are required. |
| A-05 | Published cases use `Question / Governing decision / System / System in use / Result`, while the requested common anatomy is `Problem / Decision / System / Applications / Outcome`. An older renderer uses yet another `Problem / Decision / Direction / Applications / Delivery` pattern. | `js/render/case-markup.js:90-100`; `work/rivo.html:65`; `data/case-studies.js:73-134,232-332,387-469`. | P0 | Choose one schema and renderer. Preserve collaborator strings verbatim; map labels without rewriting case prose. |
| A-06 | In current published cases, the visible `Result` link points to `#reflection`; the label and anchor are semantically different. | `work/rivo.html:65`; same generated pattern in `work/tedx-rsu.html:65` and `work/chopbox.html:65`. | P1 | Rename the id to `outcome` or the visible label to `Reflection`; requested default is Outcome/`#outcome`. |
| A-07 | The work index correctly separates essays from portfolio projects and places writing under a distinct collection link. | `work.html:61-62`; screenshot `audit/before/work--1440--motion-reduce.png`. | Pass | Preserve this separation. |
| A-08 | All 15 built pages returned HTTP 200 in the baseline, including `404.html`; the test server cannot verify the production 404 status code. | `audit/before/capture-summary.json`; `scripts/serve-static.mjs`. | P2 | Verify the Vercel 404 response independently after deployment. |

## Page inventory

- Exists: `/`, `/work.html`, three published cases, one unpublished case shell, `/about.html`, `/explorations.html`, `/notes.html`, two writing articles, `/contact.html`, `/privacy.html`, `/404.html` (`audit/raw/recon.txt`).
- Legacy/orphan: `/community.html` exists only to announce the move and is redirected by Vercel (`community.html:63`; `vercel.json:6`).
- Missing relative to the requested IA: `/services`, `/writing` index, and a distinct `/community` destination.
- Header/footer fallback markup is repeated in 14 conventional pages; `explorations.html` has empty JS mounts (`explorations.html:56`), so its JS-disabled footer is absent.

