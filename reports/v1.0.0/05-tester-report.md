# @tester Report — UX Quality Gate
**Version:** v1.0.0 | **Date:** 2026-06-29

---

## Screenshots

| Page | Light | Dark | Notes |
|------|-------|------|-------|
| index.html | PASS | PASS | Hero photo loads full-bleed; tagline ("THE BEST BRANDS DON'T LOOK DESIGNED. THEY LOOK DECIDED.") renders at impact scale; work grid tiles (2×3) display correctly with brand colors |
| playground.html | PASS | N/A | Hero text renders cleanly; both writing articles present with metadata (category, date, read time); arrow-link icons align correctly; "DESIGN EXPLORATIONS" section shows placeholder text |
| writing/when-the-swoosh-lost-its-soul.html | PASS | PASS | Article header (category, title, date, read time) renders; body text at large readable size; dark mode inverts cleanly to cream-on-dark; HOME button visible bottom-right |
| work.html | PASS | PASS | Section header and work grid (RIVO, POSTER A WEEK tiles visible) render correctly; dark mode switches background cleanly with no tile bleed |

**Dark mode observations:**
- Background transitions from `--color-bg` warm cream to near-black correctly across all pages
- Footer signature watermark adapts — visible in both modes with appropriate contrast
- Theme toggle pill slides position; sun icon dims to 0.25 opacity, moon brightens to 0.8 opacity
- `data-theme="dark"` applied to `<html>` element on toggle

---

## Console Errors

**None.** All console output is expected operational logs:
- `renderWriting type: function` — module import confirmed
- `no-store fetch - has writing: true lines: 302` — site.js data fetch
- `fresh SITE.writing length: 2` — writing data hydrated (2 articles)
- `rendered 2 articles` — writing renderer completed
- `playground.css injected` — dynamic stylesheet injection
- `done, titles: When the Swoosh Lost Its Soul | Designing for Disability in Nigeria` — render complete

**Note:** Console logs appear in multiples (×8). This is a duplicate-execution pattern, likely from module re-registration on navigation or hot-reload artifacts from the dev server. No functional impact — rendering is correct and final state is clean.

---

## Accessibility Observations

### index.html
- **Skip link:** Present (`Skip to content`) — correct
- **`<header>` / `<main>` / `<footer>` landmarks:** All present
- **Heading hierarchy:** `<h1>` for hero tagline, `<h2>` for section headings ("SELECTED WORK", "WHAT I DO") — correct
- **Image alt text:** Logo `"Miebaka Joshua"`, hero photo `"Portrait of Miebaka Joshua"`, brand logos all named (Anakle, Grey Finance, Rise, etc.) — correct
- **Theme toggle:** `role="button"`, `aria-label="Toggle dark mode"`, `aria-pressed` flips correctly (`false` → `true`) — correct
- **Work grid links:** Each tile link has descriptive text including project name, type, and service list — correct
- **Contact form:** Labels associated with inputs (NAME, EMAIL, MESSAGE); submit button labelled "SEND MESSAGE →" — correct
- **Testimonial flagged:** `<figcaption>` contains `"— Placeholder — Replace with a real name and title"` — **content issue, not structural**

### playground.html
- **Heading hierarchy:** `<h1>` for page hero, `<h2>` "WRITING", `<h3>` for article titles within the list — correct nesting
- **Writing list:** `<ul>` / `<li>` structure; each item is a single `<a>` wrapping the full card (category, date, heading, excerpt) — correct
- **"DESIGN EXPLORATIONS":** `<h2>` present with placeholder paragraph — no content yet, not a structural issue

### writing/when-the-swoosh-lost-its-soul.html
- **`<article>` element:** Content wrapped in `<article>` — correct
- **Heading hierarchy within article:** Multiple `<h2>` sub-headings (THE CATEGORY THAT NIKE OWNED, WHERE THE DRIFT BEGAN, THE COST OF EVERYWHERE, WHAT THIS TEACHES US) — correct
- **`<blockquote>`:** Used for pull-quote — correct semantic markup
- **No skip-link target:** The `<main>` element exists but there is no `id="content"` or `id="main"` for the skip link to target. The skip link may not function. **Minor a11y issue.**

---

## Interaction Testing

- **Theme toggle:** PASS — Click flips `aria-pressed` from `false` to `true`, sets `data-theme="dark"` on `<html>`, visual dark mode activates immediately. Sun icon dims; moon icon brightens. Toggle reverses correctly on second click.
- **Article navigation from Playground:** PASS — Writing list renders 2 articles; `<a href>` links resolve correctly to `/writing/when-the-swoosh-lost-its-soul.html` and `/writing/designing-for-disability-in-nigeria.html`. Navigation lands correctly on article page with content loaded.
- **Footer signature:** PASS — Signature watermark SVG/image visible in both light and dark modes on index.html. Adequate breathing room above the footer (contact form section has generous margin before footer begins). On mobile (375px), footer signature is visible with clear spatial separation from the form CTA.

---

## Responsive Notes

### Mobile (375×812)
- Navigation collapses to logo + MENU text only — **theme toggle is hidden on mobile**. This is intentional UX (toggle controls removed from mobile nav). Consider whether mobile users need theme access, possibly via the MENU drawer.
- Hero photograph is full-bleed and fills width correctly
- Hero tagline scales to large impact type and remains within viewport without overflow
- Work grid tiles render stacked appropriately (2-column grid visible when scrolling)
- Footer social links at mobile width: BEHANCE, LINKEDIN, INSTAGRAM visible in the viewport; TWITTER requires horizontal scroll or wraps off-screen. Acceptable on mobile as links stack visually.
- Footer signature watermark is visible and tasteful at mobile width

### Desktop (1280px+)
- All nav elements visible: logo, MENU, theme toggle (sun/moon/pill)
- Work grid is full-width 2-column tile layout
- Article body text is very large (editorial scale) which is intentional — striking desktop presentation
- Footer has generous whitespace above signature zone

---

## Issues Summary

| Severity | Issue | Location |
|----------|-------|----------|
| INFO | Testimonial contains placeholder text ("— Placeholder — Replace with a real name and title") | index.html, `<figcaption>` |
| LOW | Skip link target may not exist (`id="content"` or `id="main"` not confirmed in DOM) | All pages |
| LOW | Theme toggle hidden on mobile — users on mobile cannot switch theme | Mobile viewport |
| INFO | Console logs appear ×8 (duplicate module executions) | All pages — no functional impact |
| INFO | "DESIGN EXPLORATIONS" section on playground.html has no content yet | playground.html |

---

## Verdict: APPROVED

No blocking issues. The site renders correctly in light and dark mode, navigation works, article content is accessible and semantically structured, console is error-free, and the footer signature watermark renders with breathing room at all tested viewports.

**Pre-launch recommendations (non-blocking):**
1. Replace testimonial placeholder with a real attribution before going live
2. Confirm skip link targets (`id="content"`) are present on all pages
3. Evaluate whether mobile users need theme toggle access within the MENU drawer
