# Miebaka Joshua — Portfolio

A fast, scalable, **zero-build** portfolio site (static HTML + CSS + vanilla ES
modules). Direction: a warm editorial frame that stays neutral so the work
supplies the colour. Art direction lives in
[`creative-direction.md`](creative-direction.md); the governing engineering
contract is [`engineering-specification.md`](engineering-specification.md).

## Run it

No build step, no dependencies. Serve the folder over HTTP (ES modules need a
server — `file://` won't load them):

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
Portfolio/
├── index.html              # Home: hero → proof marquee → work → capabilities → about → contact
├── work.html               # Full work index
├── about.html              # About page
├── 404.html                # Styled not-found page (noindex)
├── robots.txt · sitemap.xml
├── work/                   # Case studies — thin shells, body rendered from data
│   ├── rivo.html · chopbox.html · tedx-rsu.html · christian-poster-a-week.html
├── styles/                 # Layered CSS (see below). Single entry: main.css
│   ├── main.css            # @imports everything in cascade order
│   ├── tokens/             # Design tokens — one concern per file (edit here first)
│   ├── base/               # reset · typography · utilities
│   ├── components/         # navigation · menu · marquee · buttons · forms · footer
│   └── sections/           # hero · work · home · about · contact · case-study
├── data/
│   └── site.js             # Single source of truth (ESM export): profile, projects, case studies…
├── js/                     # ES modules, one entry per page: <script type="module" src="js/main.js">
│   ├── main.js             # Entry — renders from data, then wires behaviour
│   ├── render/             # navigation · projects · sections · case-study · footer
│   ├── core/               # scroll · navigation · menu · year · form
│   └── utilities/dom.js    # escapeHTML · mount · basePath
└── assets/
    ├── fonts/              # Self-hosted woff/woff2 (3 type roles)
    └── images/             # Portrait, logo (SVG), client logos
```

## Architecture

- **CSS cascade layers** (imported by `styles/main.css` in order): Tokens → Base →
  Components → Sections. Rules: semantic tokens only, BEM naming, selector depth
  ≤ 3, **no `!important`, no inline styles**.
- **Design tokens** live in `styles/tokens/`. Change colour, type, spacing, motion,
  radius, shadow, z-index, layout there — never hardcode values in components.
- **Data-driven rendering.** `data/site.js` exports `SITE`. On load, `js/main.js`
  renders markup into `[data-mount="…"]` points, then attaches behaviour. The nav,
  menu, work grid, capabilities, testimonial, footer, and case-study bodies are all
  built from data.
- **Motion.** All timing comes from `--duration-*` / `--ease-*` tokens
  (`styles/tokens/motion.css`). Assignment: Hover→standard, Menus→emphasized,
  Micro→snappy, Reading→gentle. Scroll reveals stagger via a `--reveal-i` index and
  honour `prefers-reduced-motion`.

## Progressive enhancements

All opt-in and degrade gracefully — the editorial base never depends on them:

- **View transitions** — cross-document crossfade on navigation
  (`styles/base/view-transitions.css`); the nav/logo persist across pages.
  Unsupported browsers just navigate; disabled under `prefers-reduced-motion`.
- **Container queries** — the work grid responds to its container's width, not the
  viewport (`#work` is the query container). Falls back to a single column where
  `@container` is unsupported.
- **Theme** — `color-scheme: light` by default, `dark` on case pages, so native UI
  (scrollbars, controls) matches. Re-theme by editing the role tokens in
  `styles/tokens/colors.css`; the whole palette flows from a few values.
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
   (define its `--case-accent` in `styles/sections/case-study.css`). The
   `<article data-mount="case">` is filled automatically from the data.

## Customise

- **Colours / type / spacing / motion:** `styles/tokens/*` only.
- **Name, email, socials, availability, projects, case studies:** `data/site.js`.
- **Reading measures / touch targets:** `--measure-*`, `--tap-min` tokens; helpers
  `.measure-hero` / `.measure-lead` / `.measure-reading` cap line length.

## Contact form

Works out of the box via a `mailto:` handoff (`js/core/form.js`). To collect
submissions server-side, point it at [Formspree](https://formspree.io) or
[Netlify Forms](https://docs.netlify.com/forms/setup/) — swap the handler for a
`fetch()` POST to your endpoint.

## SEO & deploy

- Every page has a unique title/description, canonical, Open Graph, Twitter Card,
  and JSON-LD (`Person` + `WebSite` on home, `BreadcrumbList` everywhere,
  `CreativeWork` on case studies). Plus `robots.txt`, `sitemap.xml`, SVG favicon.
- **Domain:** absolute URLs assume `https://miebaka.design`. If you deploy
  elsewhere, update the base URL in every page `<head>`, `sitemap.xml`, and
  `robots.txt`.

## Accessibility & performance

- Semantic landmarks, skip link, single `<h1>` per page, visible focus rings,
  labelled form with `aria-describedby`, focus-trapped overlay menu, ≥44px touch
  targets, `prefers-reduced-motion` respected, content usable with JS off.
- Self-hosted fonts with `font-display: swap` and preloaded critical faces;
  images carry explicit dimensions + `decoding`.

## Image optimization (optional)

The only step that needs Node. It generates responsive AVIF/WebP/JPG variants —
everything else stays zero-build.

```bash
npm install            # once — pulls in sharp
npm run optimize:images
```

This writes `<base>-540/810/1080.{avif,webp,jpg}` into `assets/images/optimized/`
(see [`scripts/optimize-images.mjs`](scripts/optimize-images.mjs); add project
covers to its `SOURCES` list). Then uncomment `portraitResponsive` in
[`data/site.js`](data/site.js) — the hero portrait is rendered as `<picture>`
with `srcset` and a JPG fallback. Until you run it, the site serves the original
JPG with explicit dimensions; nothing breaks.
```
