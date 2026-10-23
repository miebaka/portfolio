## [1.2.0] - 2026-10-23

### Added
- Added an Oyin-inspired, focus-trapped full-screen mobile Index and a persistent five-item mobile bottom navigation.
- Added a full-viewport Experiments spatial archive with drag, wheel, arrow-key and tab navigation for image and video work.
- Added a dedicated `assets/experiments/` source folder and build-time manifest generator with optional metadata overrides.

### Changed
- Standardized global navigation as Work, About, Experiments, Notes and Contact across mastheads, footers and no-JavaScript fallbacks.
- Renamed the public Explorations destination to Experiments and Writing to Notes while retaining stable file URLs.
- Updated the build and development commands to generate the Experiments manifest before serving or publishing.

### Fixed
- Preserved safe-area spacing, visible current-page state and accessible labels in the mobile bottom navigation.
- Kept the Experiments canvas readable in both themes and exposed a truthful empty state before owner assets are added.
- Kept source and built footer fallbacks aligned with the five approved destinations when JavaScript is unavailable.
- Validated experiment metadata during builds, encoded media filenames safely and removed false button semantics from non-linked images.

## [1.1.3] - 2026-10-11

### Fixed
- Restored the footer's Based in and Social information inside the current horizontal information architecture.
- Standardized every primary action on the contact form's single `.btn` interaction contract.
- Added safe-area, mobile viewport, touch, form zoom, compact navigation, and narrow-screen layout safeguards across every route.

### Refactored
- Removed the empty global kinetic initializer and retired primary-button modifier markup.
- Added regression coverage for footer content, scheme-aware browser colours, mobile viewport behavior, safe areas, and button ownership.

## [1.1.2] - 2026-09-22

### Added
- Added a clear role-first availability line, print and production design services, and authorship details for every published case study.
- Added a production build that emits complete case-study HTML and validates public links, assets, metadata, CSP hashes, and sitemap integrity.

### Changed
- Made remote roles the primary conversion path while retaining selected independent projects as a secondary offer.
- Differentiated the homepage project index from the cinematic Work page and improved project identification, service-page rhythm, mobile touch targets, logo balance, and Now Playing restraint.
- Rewrote generic experience and case-study copy with clearer responsibilities, constraints, decisions, and delivered scope.
- Bundled production CSS and restricted deployment output to referenced imagery, fonts, published writing, and active JavaScript modules.

### Fixed
- Preserved useful navigation and project links when JavaScript fails, removed inaccurate sitemap dates, and kept the production CSP synchronized with the shared theme bootstrap.

### Removed
- Removed unpublished Poster A Week content from production, placeholder testimonials, decorative pseudo-metrics, obsolete reveal and scene systems, unused Three.js code, and other dead runtime assets.

## [1.1.1] - 2026-09-16

### Fixed
- Restored the About biography to its readable responsive portrait-and-copy layout and removed the rejected perspective crawl.
- Made project navigation single-flight, immediate for keyboard and reduced-motion users, and capped pointer transitions at 420ms.
- Prevented intentional full-bleed homepage artwork from creating a horizontal document scroll range.
- Completed sitemap coverage for Services, Contact, Playground, and both writing articles.
- Replaced year-long immutable caching on stable asset filenames with bounded revalidation.
- Clarified that the contact form opens the visitor's local email application.
- Upgraded Sharp to 0.35.4, resolving the current high-severity development dependency advisory.

### Refactored
- Gated page behaviours by actual page/feature presence and isolated initializer failures so optional enhancements cannot stop unrelated UI.
- Removed the Three.js snake page-transition implementation and its stylesheet.

## [1.1.0] - 2026-07-02

### Fixed
- 404.html: dark-theme persistence now applied on the error page (prevented flash of light mode for users with dark mode saved)
- 404.html: added missing `librebaskerville-regular.woff2` preload (matches all other pages)
- about.html, contact.html: `mailto:` href added as baseline on email links (works without JS)
- index.html: `hero-noir__media-label` span is now `hidden` before JS runs (prevents raw placeholder text flash)
- work cards: `kiki-joshua-notepad` and `kigoma-hotels` no longer link to non-existent pages (`caseReady: false` guard)
- data/site.js: removed placeholder testimonial content and Rivo outcome placeholder note from live site data

### Changed
- All pages: added `twitter:image:alt` meta tag (accessibility for Twitter/X card images)
- writing pages: added `og:image:alt`; article dates now use semantic `<time>` elements
- work/ case pages: removed stale `data-nav-theme="dark"` (case pages use paper background, not dark hero)
- playground.html: removed empty "Design explorations" section (static placeholder, no content)
- about.html: added `aria-label="Mission"` to mission section landmark

### Refactored
- js/core/menu.js: removed dead `.site-menu__cta` selector (class never rendered)
- js/render/footer.js, js/render/writing.js: `rel="noopener noreferrer"` on all `target="_blank"` links
- data/site.js: `city` and `timezone` fields annotated as reserved for planned nav clock feature
