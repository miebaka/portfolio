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
