# Miebaka Joshua — Portfolio

A static-first design portfolio built with HTML, CSS, vanilla ES modules and a Node.js 24 build. Content stays readable and navigable without JavaScript; scroll motion and the interactive signature enhance that base. Vercel serves the generated `dist/` directory, the contact endpoint and the server-side Last.fm listening-status endpoint.

- **Visual direction and current approved behavior:** [`DESIGN.md`](DESIGN.md) (latest decision appendix takes precedence over historical proposals).
- **Engineering, security and release requirements:** [`engineering-specification.md`](engineering-specification.md).
- **Typography:** [`docs/TYPOGRAPHY-SYSTEM.md`](docs/TYPOGRAPHY-SYSTEM.md), enforced by `styles/tokens.css`.
- **One sizing contract:** [`docs/SIZING-SYSTEM.md`](docs/SIZING-SYSTEM.md), enforcing typography, spacing, container/grid and breakpoint sizing without parallel page scales.

## Run locally

Use Node.js **24** (`.nvmrc`, `.node-version` and `package.json` agree).

```sh
nvm use
npm ci
npm run dev
# Open http://localhost:4000
```

Development serves the authored source pages and rebuilds the experiments manifest. To inspect what Vercel actually deploys, build and serve the generated output:

```sh
npm run build
node scripts/serve-static.mjs dist 4000
```

Do not commit `dist/`: it is generated during the build.

## Where changes belong

| What you need to change | Source of truth |
| --- | --- |
| Profile, role, email, socials, experience | `data/site-config.js` |
| Projects, publication state, featured order | `data/projects.js` |
| Case narratives and evidence | `data/case-studies.js` |
| Five chapter names and descriptors | `data/case-story-structure.js` |
| Service cards and links | `data/services.js` |
| Route names, navigation, build/sitemap inclusion | `data/navigation.js` |
| Essays and experiments | `data/writing.js` and `assets/experiments/` |
| Composition of public data for renderers | `data/site.js` (facade; do **not** duplicate or author content here) |
| Typography, including every font/size/text declaration | `styles/tokens.css` |
| Colour, motion and shared spacing/geometry tokens | `styles/foundations.css` |
| Approved spacing and breakpoint enforcement | `scripts/stylelint-sizing.mjs`, `scripts/sizing-contract.test.mjs` |
| Browser viewport decisions | `js/core/responsive.js` |
| Base layouts, shared UI and page layout | `styles/layout.css`, `styles/components-v4.css`, `styles/pages-v4.css` |
| Global CSS ordering | `styles/main.css` |
| Physical Work and Home folders | `styles/project-folders.css`, `styles/home-folders.css`, `styles/folder-interactions.css`, `js/core/project-folder-interactions.js`, `js/render/projects.js` |
| Homepage, services, marquee and current visual refinements | `styles/home.css`, `styles/services-stack.css`, `styles/home-experience.css`, `styles/portfolio-refinement.css` |
| Navigation, index overlay and theme | `js/render/navigation.js`, `js/core/navigation.js`, `js/core/preferences.js` |
| Server-rendered navigation/footer fallback | `scripts/render-partials.mjs` |
| Footer links above interactive dot-matrix wordmark | `js/render/footer.js`, `styles/footer-layout.css`, `js/core/footer-signature.js` |
| Native service-card scrolling | `styles/services-stack.css`, `styles/portfolio-refinement.css` |
| Contact API, anti-abuse and mail provider | `api/contact.js`, `api/lib/` |
| Public listening-status feed and navbar pill | `api/now-playing.js`, `js/render/now-playing.js`, `data/site-config.js` |
| Deployment redirects, headers, CSP | `vercel.json` |
| Content validation and production bundle | `scripts/validate-content.mjs`, `scripts/build-site.mjs` |

The CSS bundle uses the imports in `styles/main.css`, with the `typography` layer applied last. Both Home and Work use `project-folders.css` through the single `main.css` bundle. Adding a conflicting typography declaration elsewhere is a regression.

Overused Grotesk Regular (400) and Semibold (600) are self-hosted official OpenType files from RandomMaerks/Overused-Grotesk, pinned to upstream commit 749aa2c96c43a4af2d6932607ed42a5709982c5f. The SIL Open Font License is included in assets/fonts. The Material Symbols icon subset is also local. Fonts use font-display: swap and fallback families.

## Work and published case studies

The Work index uses three compact, full-width landscape folders: each has a numbered third-cut tab, five decorative **blank** sheets and a project title. The Home version reuses the same paper materials but matches its height to the rendered *What I Do* cards, rests at the bottom of the Selected Work section and rises into a reserved runway above the stack on hover/focus. Only Home surfaces the honest project category and summary. Both are native links with decorative sheets outside the anchor, functional on keyboard, touch and without JavaScript.

To add a case study:

1. Create or update the project in `data/projects.js`. Use `status: "published"` only when its case and evidence are ready; set `featuredOrder` explicitly when needed.
2. Author the matching `caseStudies[slug]` record in `data/case-studies.js`. Do not invent outcomes. Follow the actual content schema and `data/case-story-structure.js`; the five public chapters are **The Call, The System, What Survived, First Contact, The Results**.
3. Create/update the corresponding `work/<slug>.html` shell, including correct SEO metadata and `data-case`; use `npm run sync:fallbacks` for static case fallbacks, then `npm run validate:content` and `npm run build`.
4. Test native navigation, keyboard focus, images, mobile and no-JavaScript fallbacks. Check the generated sitemap and canonical URLs.

Do not edit `data/site.js` as though it were the source project database, or revive obsolete 3D cabinet documents.

## Experiments and media

Put supported artwork in `assets/experiments/`, optionally update `metadata.json`, then run `npm run build:experiments`. See [`assets/experiments/README.md`](assets/experiments/README.md).

For changed case-study or profile images, run `npm run optimize:images`. The builder copies referenced optimized AVIF/WebP/JPG variants instead of publishing the whole original image library.

## Motion and accessibility

- The homepage has a static dark opening frame and does not load a canvas renderer.
- What I Do uses native CSS sticky scrolling without an external scroll engine; reduced-motion users see a static sequence.
- The Index overlay, theme toggle and footer signature have keyboard/touch paths; the underlying document and contact links remain available without JavaScript.
- `System`, `Reduce` and `Full` motion choices are persisted independently of colour theme. The OS `prefers-reduced-motion: reduce` disables recurring decorative animation.
- Essential content must not depend on decorative animation, GPU capability or hover.

## Last.fm Now Playing

The masthead displays a small vinyl pill directly after the logo. When a Last.fm API key is configured, it reports currently playing tracks or scrobbles from the past 24 hours from the public account in `data/site-config.js`; when the key or upstream is unavailable it simply links to the public listening profile, **never displays a fabricated song**, and pauses polling in background tabs. Successful responses can be edge-cached for 60 seconds. The API key stays in the Vercel server environment as `LASTFM_API_KEY` (see `.env.example`). No key is included in client code or Git.

## Contact, privacy and deployment

`POST /api/contact` validates JSON, checks origin, filters honeypot submissions, applies an Upstash-backed rate limit and delivers accepted messages through Resend. Copy [`.env.example`](.env.example) for **variable names** only; configure real secrets in Vercel or your local environment, never in Git. `CONTACT_ALLOWED_ORIGINS` must list the actual permitted origins (including the canonical Vercel host where applicable). The authored contact page preserves direct email/mailto fallback. Visible email addresses also expose an adjacent keyboard-operable **Copy** button with a screen-reader-announced **Copied** result. Contact intake guides a first brief through goal, scope, deadline and success criteria without changing the validated API payload schema.

The public canonical host is `https://miebaka-portfolio.vercel.app/`. `data/navigation.js` controls public route registry and sitemap inclusion; `vercel.json` controls redirects, security headers and caching. The root `robots.txt` allows public pages to be crawled; the generated sitemap lists indexable canonical routes. Redirect-only and 404 pages retain page-specific `noindex` as appropriate. Privacy claims must match the actual browser requests, including the self-hosted text fonts.

## Quality and release

```sh
npm run lint:html
npm run lint:typography
npm run test:typography
npm run test:tokens
npm run quality
```

`npm run quality` builds the site, runs unit/integrity tests, the full Chromium/Playwright browser matrix (no skipped tests), CSS/JavaScript/font/image budgets, desktop Lighthouse and dependency audits. The JavaScript budget now measures the complete static module graph; module bundling and immutable caching remain open performance work. CI uses Node.js 24. The font and CSS contracts are checked separately in the fast Typography workflow.

**Automated green is necessary, not a live-release sign-off.** Before merge or production promotion, confirm a Vercel preview was built from the **exact PR head SHA**, then check actual Home, Work, case-study, Essays, Experiments, About and Contact routes. Do keyboard and screen-reader sampling, 200% zoom, light/dark and reduced-motion checks, a real touch-device pass, and an end-to-end contact delivery test with properly configured credentials. Verify external links and metadata, plus the ability to roll back to the last known-good deployment. The release checklist in [`engineering-specification.md`](engineering-specification.md) records what is automated versus still manual.

## Repository layout and asset build path

```text
api/                Server-only contact and Last.fm handlers; no browser secrets
assets/images/      Source/reference photography, covers, client SVG marks
assets/experiments/ Authored experiment metadata and originals
data/               Projects, case narratives, service proof and route registry
js/core/            Interaction controllers (folders, motion, contact)
js/render/          Data-driven semantic markup and no-JS-compatible UI
styles/             Layout/decoration; tokens.css owns ALL type declarations
work/               Published and draft case-study HTML shells
essays/             Public essay HTML and assets
scripts/            Build, optimization, validation and contract checks
tests/e2e/          Route, proof-anchor, responsive and interaction assertions
dist/               GENERATED deployment output (never edit/commit)
```

**Build order.** `npm run build` validates authored content, builds the experiments manifest (`scripts/build-experiments.mjs`), then assembles the production site (`scripts/build-site.mjs`). Use `npm run sync:fallbacks` when case-study shells change and `npm run optimize:images` after updating source art. Run `npm run test:css`, `npm run test:typography`, `npm run test:tokens` and `npm run test:e2e` before trusting appearance or links.

**Contact and proof integrity.** `data/services.js` must only point to honest published case-study chapters; every `#decision`, `#system` and `#survival` anchor is generated from the published case-study chapter IDs. The route and deep-link Playwright tests verify local HTTP 200 responses, real anchored content and fallbacks. Production HTTP behavior and external links still require a separate live deployment check.

### Mobile-first cleanup (November 2026)

The homepage keeps the fluid water and a tactile Selected Work cabinet at every size, but its reading path changes below 48rem: the secondary hero job/location repetition is reduced, the biography stays focused, the service disciplines become a neutral non-sticky list with compact proof links, and the marquee uses smaller optical cells. The content and case links remain accessible without hover, animation or JavaScript.

The retired homepage editorial image-row renderer was superseded by the actual physical folders. Its unused `styles/project-roster.css`, `styles/optical-lens.css` and `js/core/optical-lens.js` were deleted instead of carrying an inert enhancement and extra CSS selectors forward. The editorial index renderer and stylesheet **remain in use for Essays and navigation**. Add back a retired effect only when there's a real matching DOM component and a clear benefit for phone readers.

### Release and interaction checks

- `npm run lint && npm run test:typography` runs the same lint and typography gates as GitHub Actions. `npm run quality` runs the broader unit, browser, budget and Lighthouse checks.
- `npm run test:interaction` runs tagged interaction checks and attaches state screenshots to the Playwright HTML report at `reports/interaction/index.html`. Add `-- --grep '@interaction theme'` to capture just the theme control. Other areas are `index`, `work`, `experiments`, `motion`, `essays` and `contact`.
- `npm run test:routes` discovers generated HTML in the build and checks reading paths at 320px, at 200% text size, and with JavaScript disabled.
- `npm run release:receipt -- [base-commit-sha]` reads GitHub Actions and Vercel status for the remote default branch head, compares the requested base tree with the remote head's parent, and checks the live Home and Work HTML with JavaScript disabled. It requires authenticated `gh` and Playwright Chromium. A nonzero exit means at least one condition is unverified or failed. The production smoke check tests the public alias independently of the exact-commit deployment status.
