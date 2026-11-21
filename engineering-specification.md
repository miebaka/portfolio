# Engineering Specification — Miebaka Joshua Portfolio

> **Status:** Authoritative engineering implementation contract, aligned to the 19 November 2026 redesign mandate.  
> **Version:** 2.0.0  
> **Updated:** 19 November 2026  
> **Repository:** https://github.com/miebaka/portfolio  
> **Canonical production host:** https://miebaka-portfolio.vercel.app/  
> **Scope:** Every public page, browser interaction, asset, content pipeline, API, build artifact, automated test, and deployment.

## 0. Purpose, authority, and interpretation

This document defines **how** the portfolio must be built, verified, secured, and shipped. `DESIGN.md` defines **what the experience must communicate and look/feel like**. This engineering specification preserves existing static-first infrastructure and converts the 19 November 2026 redesign direction into implementable constraints. A design reference is never an excuse to break production functionality.

**Authority order:**

1. Security, privacy, truthful content, accessibility, and working functionality are mandatory.
2. This file governs build, system architecture, interfaces, data integrity, performance budgets, APIs, automated verification, and deployment.
3. The redesigned `DESIGN.md` version 2.1.0 (19 November 2026) governs editorial, visual, content hierarchy, page and motion requirements **as committed in the feature branch**. That document defines the target experience, not proof that all visual work has shipped.
4. The current `styles/foundations.css` defines shipped token values pending an explicitly tested migration.
5. `data/` remains the factual source for projects, biography, employer/client relationships, case-study evidence, and writing.
6. External websites and ZeroSlop `DESIGN.md` captures are reference material, **not verified interaction specifications, licensed assets, approved token migrations, or evidence of accessibility**.

Use **MUST/MUST NOT** for release-blocking requirements, **SHOULD** for strong defaults (document deviations), and **MAY** for optional improvements. Distinguish **current behavior**, **approved target**, and **proposed change** in reviews and pull requests. Do not claim tests have passed unless they ran.

**Migration note:** The new 19 November design constitution was authored separately from the repository. Updating this engineering file alone does not install that new `DESIGN.md`, change the homepage, or assert that target interactions exist. Merge the new `DESIGN.md` deliberately as the visual-specification step of implementation.

## 1. Product and routes

The portfolio's purpose is to demonstrate Miebaka Joshua's brand, visual, marketing, and creative-direction practice to hiring teams and selected collaborators through credible project evidence and a clear contact path.

**Public canonical URL:** `https://miebaka-portfolio.vercel.app/`. The domain `miebaka.design` is not currently established as active/owned in this repository's engineering contract; **do not** set it as canonical, publish it in structured data, or redirect to it without explicit verified owner control.

The authoritative route registry is `data/navigation.js`:

| Route | File | Role |
| --- | --- | --- |
| Home | `index.html` | Seven-section landing experience |
| Work | `work.html` | Published work, then clearly subordinate work-in-progress |
| About | `about.html` | Background, experience, practice |
| Experiments | `experiments.html` | Spatial creative experiments |
| Essays | `essays.html` | Writing index |
| Contact | `contact.html` | Primary contact path and form |
| Privacy | `privacy.html` | Privacy statement and footer destination |
| Case studies | `work/*.html` | Evidence-led project pages |
| Articles | `essays/*.html` | Full readable articles |
| Legacy | `community.html` | Existing Experiments redirect |
| Not found | `404.html` | Accessible error route; noindex |

Navigation, sitemap placement, static publishing and footer destinations MUST derive from the same registry. Do not duplicate route lists in new modules. The identity mark leads Home. The shared modal Index must trap focus, close with Escape, restore trigger focus and keep the current-page state accurate. If a design calls for fewer visible desktop links, keep routes accessible through the Index.

Home has exactly this editorial order: **Landing → Selected Work → About Me → What I Do → Brands Worked With → CTA → existing dot-matrix Footer**. The footer is a shared global component but the home treatment may differ visually. Do not reorder sections merely to match an external screenshot.

## 2. Architecture: preserve the static-first system

The baseline implementation is **static HTML + CSS + vanilla ES modules**, a Node-based build, optional native WebGL shader island, and Vercel serverless API handlers. No framework migration is authorized by the visual redesign alone.

- HTML contains meaningful first-render content, title/description/canonical/Open Graph metadata, landmarks, a single `h1`, skip link, navigation fallback and useful core page copy.
- `data/site.js` composes separate content modules rather than duplicating authored content.
- `js/main.js` orchestrates rendering and enhancement. Keep faults isolated; a failure in optional motion, Last.fm, or a visual widget MUST NOT take down navigation or primary content.
- `js/core/contract.js` owns `data-mount` names. Add any new mount there and test it.
- `styles/main.css` is the single CSS entry. Its **current** layer order is `foundations.css`, `layout.css`, `components-v4.css`, `pages-v4.css`, and **`home.css`**. Do not omit or bypass the last import in architectural documents.
- `scripts/build-site.mjs` validates, prerenders, bundles CSS, copies the reachable module graph, and generates the deployable `dist/`.
- `api/contact.js` and `api/now-playing.js` are the only existing server-side boundaries. Adding another requires a documented need and security review.
- Keep ESM dependencies intentional; do not introduce GSAP, an animation framework, a router, a UI framework, or a second CSS system just because a reference site uses one. If justified, document bundle impact, fallback, owner and tests.

**Progressive enhancement rule:** Content and navigation work without JavaScript. Video, shader, canvas, cursor response, transitions, and streaming updates may enhance but must not gate meaning. If client-side rendering replaces server-available fallback markup, verify that failure modes retain appropriate content.

## 3. Source of truth and file ownership

| Concern | Authoritative files |
| --- | --- |
| Visual direction and target component behavior | `DESIGN.md` |
| Build, QA, release, privacy and performance requirements | `engineering-specification.md` |
| Public name, verified biography, roles and contact | `data/site-config.js` |
| Featured/published project data | `data/projects.js` |
| Narrative, media and bounded evidence | `data/case-studies.js` |
| Services/capabilities | `data/services.js` |
| Employers, clients and collaborators represented as logos | `data/clients.js` plus accurately labelled presentation |
| Routes | `data/navigation.js` |
| Content facade | `data/site.js` |
| Fonts, semantic design tokens, motion roles | `styles/foundations.css` |
| Global layout | `styles/layout.css` |
| Shared navigation/forms/footer/components | `styles/components-v4.css` |
| Cross-page layouts and articles | `styles/pages-v4.css` |
| Seven homepage sections and scoped behavior | `styles/home.css` |
| Work/index/marquee rendering | `js/render/projects.js` |
| Capabilities and experience | `js/render/sections.js` |
| Case-study markup | `js/render/case-markup.js` |
| Interactive dot-matrix lifecycle | `js/core/footer-signature.js` |
| Shader lifecycle | `js/core/hero-wave.js`, generated `assets/runtime/hero-wave.js` |
| Experiment manifest | `scripts/build-experiments.mjs`, `assets/experiments/` |
| Hosting / CSP / redirects | `vercel.json` |
| Browser contracts and regression | `tests/e2e/`, `scripts/*test*.mjs`, `lighthouserc.cjs` |

Avoid new duplicate content definitions, theme overrides, inline color literals, arbitrary z-index values or page-specific copies of shared navigation. Build artifacts, temporary screenshots, reference downloads, source maps, private files and generated review outputs should not be committed or published unless deliberately required.

## 4. Design-to-engineering contracts

### 4.1 Tokens, CSS and typography

Preserve the existing **Geist Sans display and body / Geist Mono label** roles and **ultramarine / air / paper / midnight** identity unless an explicit approved redesign migration supersedes them. Coral stays a restrained interaction accent. Project identity colors belong inside project-owned surfaces, not global navigation.

Raw color definitions and semantic role assignments belong in `styles/foundations.css`. Components consume role tokens. Maintain the token-integrity checks and both explicit dark/theme fallback paths. Fonts must self-host only where permitted, use `font-display: swap`, and retain usable fallback stacks. Do not distribute font binaries as part of review documents.

The layout is a responsive 12-column editorial grid on wide screens. Verify actual rendered widths, wrapping and alignment rather than treating desktop screenshots as specifications for intermediate sizes. Media queries are content-driven; target widths for visual regression: **320, 390, 430, 768, 1024, 1440 and 1800 CSS pixels**. The site MUST have no unintended horizontal document overflow at any supported width or 200% zoom.

### 4.2 Home section implementation

**Landing:** Keep the semantic HTML hero independent of the shader. The framed opening MAY use scale/opacity animation; avoid animating layout sizes each frame. Maintain a fully legible static state while shader imports or WebGL initialization fail. A one-time reveal is not the same as scroll-driven expansion: document the desired trigger, start/end states, returning-visitor behavior and interruption rules before implementing. The hero must not delay LCP unnecessarily.

**Selected Work:** `renderHomeProjectList` uses `featuredOrder` from `data/projects.js`, filtering for complete published case studies. Do not regress to hard-coded slugs or broken links. Mobile and touch screens MUST retain visible project imagery; hover is enhancement, not the only way to see work.

**About:** Use the optimized authored portrait, ensure correct dimensions/alt/crop and maintain readable biography with a working About link. Do not invent years of practice or achievements.

**What I Do:** Use `data/services.js` for accurate service categories, descriptions, outputs and evidence links. Five discipline labels and published case-study chapter destinations are implemented; preserve their accurate, verifiable links and distinguish evidence from process explanations. Large photographic cards require accessible links, obvious scroll affordances, keyboard access and a layout that does not trap narrow-screen users in horizontal-only browsing.

**Brands:** Existing `renderClients` duplicates the list for seamless marquee looping, calculates optical logo scale and pauses when hidden. Preserve the semantics, deduplicate visible accessibility announcements (`aria-hidden` on the duplicate), and verify real SVG geometry. Apply accurate labelling of client, employer and collaborator relationships; do not imply that every employment relationship was an agency client contract. Pause when `prefers-reduced-motion` or the site motion preference reduces motion, and account for focus/visibility.

**CTA:** Primary contact paths must be real working links or validated forms. A decorative CTA animation cannot block the email link. Ensure text wrapping and target size on phones.

**Footer:** Keep the interactive name-shaped dot matrix and its static SVG fallback. Pointer handlers are owned by the host while the canvas has `pointer-events:none`; do not reverse that architecture. Enhancement starts only when visible, rests when no interaction remains, stops in hidden/offscreen states and honors user/system reduced-motion settings. Keep lifecycle cleanup and theme synchronization tested.

### 4.3 Other chapter contracts

- **Work:** Prioritize complete published cases, with unfinished items subordinate and explicitly marked. Link only to working pages; maintain images on touch.
- **Case studies:** Preserve the evidence-first schema and chapter navigation. Every claim must distinguish documented evidence from bounded qualitative reasoning. Do not fabricate metrics or add decorative pseudo-data.
- **About:** Experience timeline, portrait, text and CV request path must be accurate, keyboard accessible and resilient.
- **Experiments:** Retain accessible keyboard and tab alternatives to dragging/panning; provide bounded inertia, an obvious exit and reduced-motion/static alternatives. Images and metadata load from `assets/experiments/`.
- **Essays:** Provide readable line lengths, semantic headings, article navigation, progress indication only when useful, and functional content without JS.
- **Contact:** Form validates both client- and server-side; errors are announced and focusable, submission states are perceivable and retries do not create duplicate misleading success messages.
- **Privacy/404:** Keep correct routing and semantic navigation. Privacy must describe actually shipped collection and services, not assumptions.

### 4.4 Component state contract

For each interactive component, document and test applicable **idle, hover, focus-visible, active, disabled, expanded, loading, success, error, empty and reduced-motion** states. The requirement is applicable-state coverage, not inventing meaningless states for noninteractive elements. Keyboard behavior and touch are first-class; do not build controls that exist only for pointer hover. Focus indicators must remain legible in both themes and over project imagery. Modal/overlay state owns focus and restores it on close.

## 5. Motion, canvas and lifecycle

Motion is an authored storytelling layer, not a universal effect:

| Family | Typical target | Purpose |
| --- | --- | --- |
| Microinteraction | 120–300ms | Feedback and affordance |
| Scroll/content reveal | 500–800ms | Reading progression |
| Initial framed reveal | 800–1,200ms | Hero orientation |
| Ambient loop | Continuous only when useful | Marquee, water, signature |

These are **design targets**, not mandatory timers. Avoid overlong sequences; use transforms and opacity when possible and profile any `clip-path`, filter, resize, or canvas effects. Keep animation interruptible and preserve native navigation semantics.

Honor both **OS reduced-motion** and the site's explicit `data-motion` preference, not merely one CSS media query. Reduced motion means no forced hero opening, automatic horizontal marquee drift, scrolling parallax, repeated reveals, or shader/canvas motion; show the final static content immediately. The user-selected preference must take effect on already-mounted widgets. The existing `js/core/preferences.js` supports `system`, `reduce`, and `full`; do not silently redefine its meaning.

Every ongoing effect MUST stop or throttle when offscreen or the document is hidden and MUST release timers, observers, WebGL resources, event listeners and frames on teardown/pagehide. Pointer-dependent experiences require keyboard or non-pointer equivalents if they control content. Animations cannot indefinitely hide text when observer setup fails.

## 6. Assets, imagery and media

Use existing `assets/images/optimized` AVIF/WebP/JPEG variants and intrinsic width/height to avoid layout shifts. Media schema should support focal positioning/crop intent where projects need it; don't silently turn a source photo into a badly cropped backdrop. For each asset, define intended editorial role, aspect ratio, alt text, caption (where appropriate), eager/lazy priority and whether it is decorative or evidence.

- Case-study first significant image can be eager/high priority when justified; below-the-fold media is lazy.
- Empty alt text is correct only for redundant decoration, not for project images conveying essential identity or evidence.
- Preserve licensing and authorship; do not scrape and republish design-reference imagery.
- Do not add large autoplay video or extra WebGL instances merely to mimic source sites.
- Measure image payloads on actual responsive paths. Compress without destroying typography, texture, or detailed mockups.

## 7. Build and production artifact

`npm run build` MUST preserve this sequence:

1. Validate structured public content and local references.
2. Rebuild the Experiments manifest.
3. Build the lightweight native WebGL hero-wave island; do not add a scene-graph dependency unless a verified design requirement demands it.
4. Generate `dist/` from the production allow-list.
5. Prevent private documents, original working files, source maps and review artifacts from leaking into output.

Deployable output has complete page HTML, one bundled CSS entry, only reachable JS modules, only referenced image derivatives and required self-hosted fonts. Do not commit generated `dist/` or `assets/runtime/` files where the build intends to generate them.

Build and test commands (as defined in `package.json`):

```bash
npm ci
npm run build
npm test
npm run test:e2e
npm run test:a11y
npm run test:budgets
npm run test:lighthouse
npm run audit:shipped
npm run quality
```

Do not claim `npm run quality` succeeds without executing it. Use CI artifacts and logs as evidence. Keep a fast local feedback loop, but preserve the complete release gate.

### Supported Node.js runtime (standardized)

**Node.js 24 LTS** is the single supported major for local development, CI, build tooling, and Vercel functions. The repository owns `.nvmrc`, `.node-version`, `package.json#engines` and the lockfile; GitHub Actions reads `.nvmrc` through `setup-node@v7` and asserts the major before `npm ci`. The existing Vercel project is configured for `24.x`. Keep these settings in sync. A runtime-version change does not waive lint, browser, static-fallback, Lighthouse, accessibility or dependency gates.

## 8. Performance budgets and measurable targets

**Repository production budgets, maintained unless changed through measurement and review:**

| Resource | Maximum |
| --- | --- |
| Initial CSS | 45 KiB gzip |
| Initial JavaScript | 75 KiB gzip |
| Lazy shader island | 375 KiB gzip |
| Eager homepage media | 1.5 MiB |

The current `lighthouserc.cjs` asserts desktop median **performance ≥0.90**, **accessibility ≥0.95**, **LCP ≤2,500ms**, **CLS ≤0.05** and **TBT ≤200ms** across configured routes. These are *existing configured CI thresholds*, not independently measured passing scores.

Additional user-experience targets, verified with appropriate real-device or field measurement when available:

- Core Web Vitals at p75: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms.
- No significant long main-thread tasks caused by nonessential shader, marquee or footer animation.
- Navigation/scroll works on low-powered devices with optional effects disabled.
- No layout jumps from late fonts, images, card expansion or modal locking.
- No initial blank screen dependent on fetching an animation bundle.

Do not confuse Lighthouse Total Blocking Time with field Interaction to Next Paint. Measure both in their appropriate contexts. Run mobile testing in addition to current desktop CI configuration.

## 9. Accessibility and resilience acceptance

Meet **WCAG 2.2 AA** for applicable components as a release target and preserve existing tests. Required checks include:

- One appropriate `h1`, logical headings, landmarks, skip links, readable labels and correct links/buttons.
- Text contrast **≥4.5:1** for normal body text and **≥3:1** for large text; applicable non-text component boundaries/focus states **≥3:1**.
- Keyboard-only traversal, visible focus, Escape closing appropriate overlays, and focus return.
- Interactive targets at least **44×44 CSS px** as this portfolio's design target, unless an explicitly reviewed exception still meets applicable WCAG criteria.
- Correct alternative text, captions and focus order in project galleries and articles.
- No horizontal page overflow at 320px and other supported widths; verify 200% zoom/reflow.
- Meaningful static presentation in reduced-motion modes and JavaScript-disabled operation.
- Live error/success messages announced appropriately; error recovery does not rely solely on color.
- Interactive spatial Experiments accessible without dragging.

Automated axe audits are necessary but not sufficient. Run manual keyboard, VoiceOver/screen-reader sampling, forced/low contrast inspection and touch testing before release.

## 10. Security, privacy and API boundaries

Existing `api/contact.js` uses server-side schema, origin/abuse controls, rate limits and mail integration. Preserve these rather than substituting a third-party frontend-only form. Validate and normalize user input on the server, restrict lengths and accepted content types, prevent header injection, use safe structured logging and return non-leaking error responses. Do not assert perfect abuse resistance based solely on an in-memory limiter.

Keep credentials and keys in server-only environment variables. Never put them in `data/`, committed config, generated HTML, browser JS, screenshots or error messages. Maintain privacy disclosures aligned with actually active email, analytics and Last.fm functionality.

`vercel.json` owns production CSP/security headers, redirects and caching. Any change to inline executable scripts, imported modules, external origins or API endpoints MUST be checked against the CSP and related integrity tests. External new-tab links must include `rel="noopener noreferrer"`.

## 11. Tests, review gates and required evidence

The existing test suite checks document contracts, content schema, navigation, case studies, accessibility, budget and production integrity. Expand it when implementing the redesign:

| System | Minimum required verification |
| --- | --- |
| All routes | HTTP success, no console errors, correct title/canonical/landmarks and no broken resources |
| Hero | Static readable first paint, full/reduced motion, shader failure fallback, no major LCP regression |
| Selected Work | Featured ordering, valid published links, project image visible at 320/390/430px, keyboard focus |
| Services | Working evidence links, responsive cards, no scroll trap, focus-visible behavior |
| Marquee | Optical logo sizing, hidden duplicate accessibility, reduced motion, visibility pause |
| Footer | Host pointer interaction actually works, no blocked links, static fallback, cleanup on navigation |
| Navigation | Open/close keyboard contract, Escape and focus restoration, theme/motion preference updates |
| Case studies | All required content, truthful evidence status, image captions, next-case path |
| Experiments | Pointer, touch, wheel and keyboard paths; accessible static fallback |
| Essays | Semantic reading flow, article headings, working links, contents navigation |
| Contact | Validation, errors, loading, success, server failure and abuse cases |
| Entire site | 320, 390, 430, 768, 1024, 1440, 1800px; light/dark; full/reduced motion |

A visual comparison process MUST capture **baseline, target, actual result, differences, action taken and final validation** for each major section. Do not use ZeroSlop's measured styles as automatic legal, accessibility or functionality proof. Review computed type, color, spacing and geometry against the locked decision roles, then verify visible screenshots and actual interactions.

A release is blocked by broken routes, inaccessible required navigation, dead primary CTAs, missing essential project proof on mobile, knowingly misleading content, serious/critical automated accessibility violations, security regressions or production budget failures. Deviations from stretch goals require a recorded rationale, not silent acceptance.

## 12. Implementation phases and dependency order

1. **Reconcile documentation** — Commit the 19 November `DESIGN.md` v2.1.0, align this file, update README and resolve canonical configuration. Baseline existing tests and collect screenshots; don't claim new design is live yet.
2. **Preserve verified correctness** — Maintain the repaired footer pointer handling, data-driven featured work ordering and visible mobile imagery. Expand regression tests when those areas change.
3. **Implement home reference lock** — Build framed hero, selected-work presentation, About, services, client marquee, CTA and footer in the required order. Centralize tokens and motion; no reference collage.
4. **Propagate globally** — Work, case studies, About, Experiments, Essays, Contact, shared controls and navigation. Preserve content schemas and static fallbacks.
5. **Prove and release** — Run automated quality suite, screenshot/interaction review, mobile/keyboard/reduced-motion audits, performance measurement, security inspection and live smoke checks.

Avoid doing a massive unsupervised rewrite that simultaneously changes the data schema, rendering system, CSS architecture and visual identity. Make reviewable changes ordered by dependency. Each pull request should identify the design clause implemented, files changed, tests added, screenshots captured and remaining gaps.

## 13. Continuous integration, deployment and rollback

The GitHub Actions quality workflow (`.github/workflows/quality.yml`) is the automated gate for pull requests and `main`. `npm run quality` should run before merge. Vercel serves the `dist/` build; deploy from reviewed `main` according to repository settings.

After deployment, smoke test the **live** Home, Work, an individual Case Study, Experiments and Contact routes, plus theme and motion preferences. Check mobile page load, site-wide links, contact API behavior, correct metadata and absence of broken assets. If a release degrades core navigation, contact, accessibility or performance severely, revert to the most recent working deployment rather than masking the issue with animation fallbacks.

Never call a release “complete” solely because the GitHub API accepted a commit or Vercel returned a build-ready state.

## 14. Documentation and change control

When editing any of these areas, update its governing source in the same change:

- Visual treatment, service taxonomy, component behavior, motion: `DESIGN.md`.
- Build, source ownership, infrastructure, budgets, API/security, tests: this file.
- Tokens and typography: `styles/foundations.css` and token tests.
- Public content and verified evidence: appropriate `data/` module and content validators.
- Route names: `data/navigation.js`, static HTML, sitemap/redirect checks.
- Developer instructions: `README.md` (keep it synchronized with actual section order and current files).

A valid exception log records: **decision, owner, rationale, impacted pages, affected tokens/files, accessibility impact, performance impact, test evidence and date**. No temporary override should become permanent without review.

---

## Appendix A — Known existing issues, not yet automatically fixed

1. `data/site-config.js` contains `canonicalUrl: "https://miebaka-portfolio.vercel.app/"` while the engineering host and homepage HTML use Vercel. Correct the data and generated metadata consistently; this document does not itself change runtime config.
2. Featured projects use `featuredOrder` in data; reject any regression to hard-coded renderer selection.
3. Mobile Selected Work previews are visible; keep them accessible and meaningful.
4. Footer host owns pointer handlers and the canvas is non-interactive; keep reduced-motion, idle and lifecycle tests.
5. Homepage CSS and 800–1,200ms entrance animation need reconciliation with the earlier generic microinteraction duration guidance. Differentiate cinematic entrance vs routine feedback.
6. `README.md` and checked-in `DESIGN.md` are not yet aligned to the new 19 November design constitution.
7. The site-motion preference needs verification across CSS-only animation, marquee, shader and signature—system reduced motion and in-site preference must converge.

These are **audit findings**, not claims that the present branch is broken in all browsing conditions. Each is closed only after an implemented change and verifying test.

## Appendix B — Release checklist

- [ ] Updated `DESIGN.md` v2.1.0 is committed and matches the implementation target.
- [ ] Canonical/OG/JSON-LD/sitemap are consistent with the verified host.
- [ ] All seven homepage sections render in required order with JS enabled and disabled.
- [ ] All published project links, project images and evidence links resolve correctly.
- [ ] No misleading claims, placeholder client relationships or invented case-study metrics.
- [ ] Reduced-motion behavior works for CSS, JS, marquees, shader and footer.
- [ ] Site is usable by keyboard, touch, screen reader and at 200% zoom.
- [ ] Responsive screenshots are reviewed at required breakpoints in light/dark themes.
- [ ] Images are correctly cropped, captioned and optimized.
- [ ] Contact validation and rate-limiting tests pass.
- [ ] No secret or unwanted artifact enters `dist/`.
- [ ] Production size, Lighthouse and accessibility gates pass.
- [ ] CI passes, live smoke check passes and rollback is known.

**Final rule:** Attractive output is not finished output. A design decision is complete only when it is truthful, accessible, performant, consistent with the governing documents, implemented in the right source, and verified on real page behavior.
