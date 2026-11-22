# Miebaka Joshua — Portfolio

A static-first design portfolio built with HTML, CSS, vanilla ES modules and a Node.js 24 build. Content stays readable and navigable without JavaScript; Three.js water, scroll motion and the interactive signature enhance that base. Vercel serves the generated `dist/` directory and the contact endpoint.

- **Visual direction and current approved behavior:** [`DESIGN.md`](DESIGN.md) (latest decision appendix takes precedence over historical proposals).
- **Engineering, security and release requirements:** [`engineering-specification.md`](engineering-specification.md).
- **Typography:** [`docs/TYPOGRAPHY-SYSTEM.md`](docs/TYPOGRAPHY-SYSTEM.md), enforced by `styles/tokens.css`.

## Run locally

Use Node.js **24** (`.nvmrc`, `.node-version` and `package.json` agree).

```sh
nvm use
npm ci
npm run dev
# Open http://localhost:4000
```

Development serves the authored source pages and rebuilds the experiments manifest and hero shader. To inspect what Vercel actually deploys, build and serve the generated output:

```sh
npm run build
node scripts/serve-static.mjs dist 4000
```

Do not commit `dist/` or `assets/runtime/`: they are generated during the build.

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
| Colour, spacing, motion and layout tokens | `styles/foundations.css` |
| Base layouts, shared UI and page layout | `styles/layout.css`, `styles/components-v4.css`, `styles/pages-v4.css` |
| Global CSS ordering | `styles/main.css` |
| Physical Work folders | `styles/project-folders.css`, `js/render/projects.js`, `work.html` |
| Homepage, services and current visual refinements | `styles/home.css`, `styles/services-stack.css`, `styles/portfolio-refinement.css` |
| Navigation, index overlay and theme | `js/render/navigation.js`, `js/core/navigation.js`, `js/core/preferences.js` |
| Server-rendered navigation/footer fallback | `scripts/render-partials.mjs` |
| Interactive dot-matrix footer | `js/core/footer-signature.js` |
| Three.js hero and fallback | `js/hero-water-three.js`, `js/core/hero-wave.js` |
| Desktop-only optional Lenis/GSAP scroll engine | `js/motion-experience.js`, `js/core/scroll-experience.js` |
| Contact API, anti-abuse and mail provider | `api/contact.js`, `api/lib/` |
| Deployment redirects, headers, CSP | `vercel.json` |
| Content validation and production bundle | `scripts/validate-content.mjs`, `scripts/build-site.mjs` |

The CSS bundle uses the imports in `styles/main.css`, with the `typography` layer applied last. The Work page also loads the intentionally page-scoped `styles/project-folders.css`. Adding a conflicting typography declaration elsewhere is a regression.

Geist Sans and Geist Mono are pinned to `geist@1.9.2` WOFF2 files on **jsDelivr**; the Material Symbols icon subset is local. The legacy Archivo, Finlandica and Host Grotesk files are removed. Fonts use `font-display: swap` and fallback families. Do not claim that every font is self-hosted.

## Work and published case studies

The Work index uses three full-width, real-world-proportioned folders: each has a numbered third-cut tab, five decorative **blank** sheets, and only the project title on its front. Folders remain native links in light/dark themes, on touch and keyboard, and without JavaScript.

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

- The hero uses a lazy Three.js/WebGL island with a static, usable fallback.
- Lenis and GSAP load **only as a desktop progressive enhancement**; Work, touch-first devices, reduced-motion users and unsupported environments keep native scrolling.
- The Index overlay, theme toggle and footer signature have keyboard/touch paths; the underlying document and contact links remain available without JavaScript.
- `System`, `Reduce` and `Full` motion preferences are persisted independently of the colour theme.
- Essential content must not depend on decorative animation, GPU capability or hover.

## Contact, privacy and deployment

`POST /api/contact` validates JSON, checks origin, rejects spam, applies an Upstash-backed rate limit and delivers accepted messages through Resend. Copy [`.env.example`](.env.example) for **variable names** only; configure real secrets in Vercel or your local environment, never in Git. `CONTACT_ALLOWED_ORIGINS` must list the actual permitted origins (including the canonical Vercel host where applicable). The authored contact page preserves direct email/mailto fallback.

The public canonical host is `https://miebaka-portfolio.vercel.app/`. `data/navigation.js` controls public route registry and sitemap inclusion; `vercel.json` controls redirects, security headers and caching. The root `robots.txt` intentionally blocks indexing until launch approval. Privacy claims must match the actual browser requests, including the remote Geist fonts.

## Quality and release

```sh
npm run lint:html
npm run lint:typography
npm run test:typography
npm run test:tokens
npm run quality
```

`npm run quality` builds the site, runs unit/integrity tests, the full Chromium/Playwright browser matrix (no skipped tests), CSS/JavaScript/font/image budgets, desktop Lighthouse and dependency audits. CI uses Node.js 24. The font and CSS contracts are checked separately in the fast Typography workflow.

**Automated green is necessary, not a live-release sign-off.** Before merge or production promotion, confirm a Vercel preview was built from the **exact PR head SHA**, then check actual Home, Work, case-study, Essays, Experiments, About and Contact routes. Do keyboard and screen-reader sampling, 200% zoom, light/dark and reduced-motion checks, a real touch/GPU pass, and an end-to-end contact delivery test with properly configured credentials. Verify external links and metadata, plus the ability to roll back to the last known-good deployment. The release checklist in [`engineering-specification.md`](engineering-specification.md) records what is automated versus still manual.
