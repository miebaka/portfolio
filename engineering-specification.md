# Engineering Specification — Miebaka Joshua Portfolio

Updated 24 October 2026. This is the governing implementation contract. Visual
decisions live in [`DESIGN.md`](DESIGN.md) and the detailed token/component
contract lives in [`docs/design-system-v3.md`](docs/design-system-v3.md).

## Product contract

The portfolio presents Miebaka Joshua’s brand and visual-design practice to
hiring teams and selected clients. It must make the work, the decisions behind
it and a clear contact path available without depending on JavaScript.

Public navigation is Work, About, Experiments, Notes and Contact. The identity
mark returns Home; Privacy is a footer destination. Experiments uses
`explorations.html` and media from `assets/experiments/`.

## Architecture

- Static HTML is the resilient page shell and SEO source.
- `data/site.js` composes the domain modules in `data/`; authored portfolio
  content is not duplicated in render modules.
- `js/main.js` is the browser entry point. It imports only the renderers and
  behaviours used by live pages.
- `styles/main.css` is the single CSS entry and imports foundations,
  components and page composition in that order.
- `scripts/build-site.mjs` validates content, prerenders data-driven sections,
  bundles CSS, follows the JavaScript import graph and copies only referenced
  production assets into `dist/`.
- `api/contact.js` and `api/now-playing.js` are the only server boundaries.
- Vercel is the sole deployment target; `vercel.json` owns headers, caching,
  function limits and the `dist/` output contract.

## Source-of-truth rules

| Concern | Owner |
| --- | --- |
| Profile, projects, services, case studies and writing | `data/` |
| Routes and their build/sitemap placement | `data/navigation.js` |
| Design tokens and type loading | `styles/foundations.css` |
| Shared components | `styles/components-v4.css` |
| Page composition | `styles/pages-v4.css` |
| Experiments media metadata | `assets/experiments/metadata.json` when needed |
| Hosting and security headers | `vercel.json` |
| Critical documentation registry | `docs/critical-documents.json` |

Do not add a second source for any concern above. Historical reports, exported
mockups, generated review files and application working files do not belong in
Git. Keep them in ignored local folders or an external archive.

## Build contract

`npm run build` must, in order:

1. validate public content and local references;
2. generate the Experiments manifest;
3. bundle the ShaderGradient island;
4. recreate `dist/` from a strict allow-list;
5. fail if review, source or map files leak into production.

The built site must contain complete HTML fallbacks, one bundled stylesheet,
only reachable JavaScript modules, only referenced image variants and the
self-hosted fonts used by that stylesheet. Generated runtime/vendor files are
build artifacts and are not committed.

## Performance contract

- Initial CSS: at most 45 KiB gzip.
- Initial JavaScript: at most 75 KiB gzip.
- Lazy shader island: at most 375 KiB gzip.
- Eager homepage media: at most 1.5 MiB.
- Lighthouse performance and LCP gates are defined in `lighthouserc.cjs` and
  run in CI.
- Images use intrinsic dimensions, responsive variants where useful and lazy
  loading below the fold.

## Accessibility and resilience

- Pages retain landmarks, one visible `h1`, skip navigation and useful content
  with JavaScript disabled.
- Keyboard access, focus visibility, modal focus management and focus return
  are release requirements.
- Pointer targets are at least 44px where they are controls.
- Motion respects `prefers-reduced-motion`; essential state changes remain
  immediate and understandable.
- WebGL, View Transitions, clipboard and Last.fm are enhancements. Failure in
  one enhancement must not block unrelated page behaviour.

## Security and privacy

- Keep the production Content Security Policy synchronized with executable
  inline scripts; the integrity suite verifies their hashes.
- Secrets stay in server-side environment variables and never enter `data/`,
  client JavaScript or generated HTML.
- Contact input is validated, rate-limited and safely logged at the API boundary.
- External links opened in a new tab use `noopener noreferrer`.

## Quality and release

Run `npm run quality` before merging. It checks critical documentation,
content, unit/integration contracts, browser behaviour, visual baselines,
accessibility, production budgets, Lighthouse and dependency advisories.

GitHub Actions runs the same gate on pull requests and pushes to `main`.
Vercel deploys `main`; a release is complete only after the deployment is ready
and the live Home, Experiments and Contact routes pass a smoke check.

## Change discipline

When behaviour, architecture, public routes, design tokens or deployment rules
change, update the owning critical document in the same commit. Run
`npm run docs:update` to refresh the generated documentation index, then
`npm run docs:check` to catch stale versions, missing sections and broken local
links.
