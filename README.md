# Miebaka Joshua — Portfolio

A fast, scalable portfolio site built from static HTML, CSS and vanilla ES
modules. A small Node build validates content, generates the Experiments index,
bundles production CSS and emits the deployable site. Direction: a warm editorial frame that stays neutral so the work
supplies the colour. [`engineering-specification.md`](engineering-specification.md)
is the single governing document, covering positioning, art direction and voice
as well as the engineering contract.

## Run it

Install dependencies once, then use the project development command:

```bash
npm install
npm run dev
# then visit http://localhost:4000
```

`npm run dev` refreshes the generated Experiments manifest and shader bundle
before serving the site with development-safe caching.

## Structure

```
Portfolio/
├── index.html              # Home: hero → proof marquee → work → capabilities → about → contact
├── work.html               # Full work index
├── about.html              # About page
├── explorations.html       # Experiments: draggable spatial archive
├── playground.html         # Notes index
├── contact.html            # Contact page
├── 404.html                # Styled not-found page (noindex)
├── robots.txt · sitemap.xml
├── work/                   # Case studies — thin shells, body rendered from data
│   ├── rivo.html · chopbox.html · tedx-rsu.html · christian-poster-a-week.html
├── styles/                 # Layered CSS (see below). Single entry: main.css
│   ├── main.css            # @imports everything in cascade order
│   ├── foundations.css     # Tokens, reset, type, layout primitives, platform baseline
│   ├── components-v4.css   # Navigation, controls, footer and shared components
│   └── pages-v4.css        # Page and section composition
├── data/
│   └── site.js             # Single source of truth (ESM export): profile, projects, case studies…
├── js/                     # ES modules, one entry per page: <script type="module" src="js/main.js">
│   ├── main.js             # Entry — renders from data, then wires behaviour
│   ├── render/             # navigation · experiments · projects · sections · case-study · footer
│   ├── core/               # scroll · navigation · menu · year · form
│   └── utilities/dom.js    # escapeHTML · mount · basePath
└── assets/
    ├── experiments/        # Dedicated image/video source folder + generated manifest
    ├── fonts/              # Self-hosted woff/woff2 (3 type roles)
    └── images/             # Portrait, logo (SVG), client logos
```

## Architecture

- **CSS cascade layers** are imported by `styles/main.css`: foundations →
  components → pages. Rules: semantic tokens, shallow selectors, no inline styles.
- **Design tokens** live at the top of `styles/foundations.css`. Change colour,
  type, spacing, motion, and layout roles there before changing component rules.
- **Data-driven rendering.** `data/site.js` exports `SITE`. On load, `js/main.js`
  renders markup into `[data-mount="…"]` points, then attaches behaviour. The nav,
  menu, work grid, capabilities, testimonial, footer, and case-study bodies are all
  built from data.
- **Motion.** Shared timing comes from the duration and easing roles in
  `styles/foundations.css`; interface motion honours `prefers-reduced-motion`.
- **Navigation.** The shared route registry exposes Work, About, Experiments,
  Notes and Contact. Mobile adds a persistent five-destination bottom bar and a
  focus-trapped full-screen Index.
- **Experiments.** `scripts/build-experiments.mjs` turns media placed in
  `assets/experiments/` into a deterministic spatial archive. Drag, wheel,
  arrow-key and tab navigation all reach the same work.

## Documentation workflow

Critical documents are registered in
[`docs/critical-documents.json`](docs/critical-documents.json). When the product,
design system, architecture or release process changes, edit the owning document
in the same commit and run:

```bash
npm run docs:update
npm run docs:check
```

`docs:update` refreshes the index below. `docs:check` verifies required sections,
local Markdown links and release-version alignment; CI runs it as part of
`npm run quality`.

<!-- critical-docs:start -->
| Document | Owns |
| --- | --- |
| [`README.md`](README.md) | Setup, repository map and contributor entry point |
| [`engineering-specification.md`](engineering-specification.md) | Current implementation, quality and release contract |
| [`DESIGN.md`](DESIGN.md) | Concise creative direction and interaction rules |
| [`docs/design-system-v3.md`](docs/design-system-v3.md) | Detailed foundations, components and state contract |
| [`CHANGELOG.md`](CHANGELOG.md) | Release history |
| [`assets/experiments/README.md`](assets/experiments/README.md) | Experiment asset and metadata authoring guide |
<!-- critical-docs:end -->

## Add an experiment

1. Place an image or video in `assets/experiments/`.
2. Run `npm run build:experiments`, `npm run dev`, or `npm run build`.
3. Optionally add `assets/experiments/metadata.json` to override the generated
   title, category, alternative text, link, position or width.

See [`assets/experiments/README.md`](assets/experiments/README.md) for the
supported formats and metadata shape.

## Progressive enhancements

All opt-in and degrade gracefully — the editorial base never depends on them:

- **Theme transitions** — the navigation renderer uses the browser View Transition
  API when available. Unsupported browsers switch immediately.
- **Container queries** — the work grid responds to its container's width, not the
  viewport (`#work` is the query container). Falls back to a single column where
  `@container` is unsupported.
- **Theme** — `color-scheme: light` by default, `dark` on case pages, so native UI
  (scrollbars, controls) matches. Re-theme by editing the role tokens in
  `styles/foundations.css`; the whole palette flows from a few role values.
- **Film grain** — a faint, non-interactive `soft-light` texture over the dark
  hero and case pages.

## How to add a project

1. Add an entry to `projects` in [`data/site.js`](data/site.js) — this drives the
   home/work grids:

   ```js
   {
     slug: "new-project",          // must match work/new-project.html
     title: "New Project",
     category: "Fintech",
     tags: ["Brand identity"],
     year: "2025",
     tone: "#1f4d3a",              // tile colour until a cover image exists
     featured: true
   }
   ```

2. Add a matching entry to `caseStudies` in the same file, following the shared
   narrative shape: `overview` (question + body), `challenge`, `process`,
   `solution`, `outcome` (body + metrics + optional note), three `media` bands,
   and `next`.

3. Copy any `work/*.html` to `work/new-project.html` and update only the static
   `<head>` (title, description, canonical/OG/Twitter, JSON-LD) and the body's
   `data-case="new-project"` + accent class `case-page--new-project`
   (define any project-specific presentation in `styles/pages-v4.css`). The
   `<article data-mount="case">` is filled automatically from the data.

## Customise

- **Colours / type / spacing / motion:** `styles/foundations.css` first.
- **Name, email, socials, availability, projects, case studies:** `data/site.js`.
- **Reading measures / touch targets:** `--measure-*`, `--tap-min` tokens; helpers
  `.measure-hero` / `.measure-lead` / `.measure-reading` cap line length.

## Contact form

JavaScript submits JSON to `/api/contact`; the Vercel function validates input,
applies abuse controls and sends through Resend. Configure the environment
variables documented in [`.env.example`](.env.example). The authored HTML keeps
a `mailto:` action and direct email link as the no-JavaScript fallback.

## SEO & deploy

- Every page has a unique title/description, canonical, Open Graph, Twitter Card,
  and JSON-LD (`Person` + `WebSite` on home, `BreadcrumbList` everywhere,
  `CreativeWork` on case studies). Plus `robots.txt`, `sitemap.xml`, SVG favicon.
- **Canonical host:** `https://miebaka-portfolio.vercel.app` is the current public
  production URL. `miebaka.design` is not owned or active and must not be used in
  metadata, documentation, release notes, or deployment reporting unless that
  changes and the owner explicitly confirms it.

## Accessibility & performance

- Semantic landmarks, skip link, single `<h1>` per page, visible focus rings,
  labelled form with `aria-describedby`, focus-trapped overlay menu, ≥44px touch
  targets, `prefers-reduced-motion` respected, content usable with JS off.
- Self-hosted fonts with `font-display: swap` and preloaded critical faces;
  images carry explicit dimensions + `decoding`.

## Image optimization

The production build uses Node. When a project master changes, regenerate its
responsive AVIF/WebP/JPG variants:

```bash
npm install            # once — pulls in sharp
npm run optimize:images
```

This writes the responsive variants into `assets/images/optimized/` (see
[`scripts/optimize-images.mjs`](scripts/optimize-images.mjs)). The production
builder copies only variants referenced by published pages.
