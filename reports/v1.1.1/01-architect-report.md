# v1.1.1 Architecture Audit

## Intent

Restore the About biography to its pre-crawl layout without reverting unrelated owner edits, then harden the entire static portfolio around a smaller, coherent interaction architecture. The site should remain zero-build HTML/CSS/ES modules, retain its authored editorial identity, and improve reliability, accessibility, security, performance, and crawlability without introducing a backend that the product does not need.

## System boundary

### What this application is

- A static, multi-page portfolio deployed on Netlify.
- Author-owned data in `data/site.js`, rendered into progressive-enhancement mount points by ES modules.
- A client-only contact handoff that opens the visitor's mail client.
- One optional third-party read: Last.fm listening status.
- Local fonts, local images, local Three.js modules, and no runtime package CDN.

### What it is not

The backend-pattern guidance for controllers, repositories, databases, transactions, JWT authentication, role authorization, Redis, queues, server-side validation, and API rate limiting does **not** apply to the current product. There is no application server, database, account system, privileged operation, or first-party API. Adding those layers would increase attack surface and operational burden without solving a current requirement.

The only form is explicitly a `mailto:` handoff (`js/core/form.js:1-2`, `js/core/form.js:108-120`). Client validation here is usability validation, not a security boundary. If this later becomes a hosted form endpoint, server-side validation, spam protection, rate limiting, retention rules, privacy disclosure, structured error responses, and abuse logging become mandatory at that point—not before.

## Architecture assessment

### What is already sound

1. **Progressive HTML fallbacks exist.** Pages retain primary navigation and footer links when the module graph fails.
2. **The render boundary has defensive utilities.** `escapeHTML`, `safeURL`, and `safeToken` in `js/utilities/dom.js` constrain data interpolated into HTML strings. Dynamic Last.fm strings use `textContent`, not `innerHTML`.
3. **Hosting security is unusually strong for a static portfolio.** `netlify.toml:21-30` supplies a restrictive CSP, framing protection, MIME-sniff prevention, referrer policy, permissions policy, and COOP. The executable inline bootstrap hash was verified identical across all 14 HTML files and matches the configured CSP hash.
4. **Dependency exposure is small.** The runtime dependency is pinned Three.js; `npm audit --omit=dev` reports zero known vulnerabilities.
5. **Media has a mature delivery model.** Case-study media uses AVIF/WebP/JPEG source sets, intrinsic dimensions, lazy loading below the fold, and eager high-priority hero loading.
6. **Native interaction primitives are used where appropriate.** Capability and experience disclosures use `<details>/<summary>`; form labels and field-specific error associations are present.

## Findings

### Critical

None found in the reviewed static architecture. There is no evidence of credentials, authentication bypass, database exposure, remote code execution, or an unescaped user-controlled HTML path.

### High priority

#### H1 — The CSS architecture no longer matches its stated cascade contract

`styles/main.css:1-4` promises `Tokens → Base → Components → Sections`, but `styles/main.css:42` appends a 15 KB global `swiss.css` override layer after every section. That file reaches across navigation, hero, work, About, contact, articles, case studies, footer, accessibility, motion, and global section spacing. Examples include `main > section { padding-block: 0 !important; }` at `styles/swiss.css:167`, global section-margin policy at lines 168-170, and a universal reduced-motion reset at lines 179-181.

**Impact:** ownership is unclear, local component rules are routinely overridden, regressions are difficult to isolate, and page-specific improvements require more specificity or `!important`. The latest About crawl is a symptom: a one-page experiment was placed in a global component stylesheet while the previous About system still exists elsewhere.

**Decision:** preserve the visual direction, but move rules to their owning token/base/component/section modules. `swiss.css` should be treated as a migration layer and reduced incrementally; do not rewrite the entire cascade in this patch.

#### H2 — Every page initializes all site behaviours

`js/main.js:29-53` renders and initializes all features on all pages, including Last.fm, WebGL, footer scene, project transition, preloader, form, count-up, and hero parallax. Most modules bail out when mounts are absent, but every page still downloads, parses, and executes the shared graph. `initSkiperInteractions()` also installs a document-level captured click handler everywhere (`js/core/skiper-interactions.js:20-87`).

**Impact:** unnecessary parse/execute cost on reading and case-study pages; greater coupling; a failure in a nonessential import can prevent all downstream initialization; harder lifecycle testing.

**Decision:** retain one entry point for now, but add a declarative initializer registry keyed by `body[data-page]` and feature selectors. Critical renderers run first; optional enhancements run independently behind feature detection and localized `try/catch`, so one animation cannot take down navigation, forms, or content.

#### H3 — Project navigation is intentionally delayed and lacks a robust cancellation/failure path

Project links are intercepted globally, then navigation waits 320 or 930 ms (`js/core/skiper-interactions.js:20-40`, `85-86`). During that interval the body is marked busy, but there is no Escape cancellation, timeout ownership, re-entry guard, `pagehide` cleanup, or immediate path for keyboard activation. The overlay is `aria-hidden`, so assistive technology receives no useful transition status.

**Impact:** navigation can feel broken, rapid activation can schedule competing destinations, and a runtime exception after `preventDefault()` can strand the visitor on the current page.

**Decision:** keep spatial continuity only for pointer activation where the source geometry exists. Keyboard activation and reduced-motion should navigate immediately. Add a single in-flight state, cleanup on `pagehide`, and a fail-open navigation helper. Cap the visual handoff near 300-450 ms; do not hold navigation for a decorative 930 ms sequence.

#### H4 — The About crawl contradicts the established page architecture and the user's explicit direction

`about.html:80-114` replaces the existing `section--tight container > about-grid` biography with a 220-260vh sticky perspective scene whose CSS lives in `styles/components/skiper-interactions.css:156-222`. The original `.about-grid` system remains intact in `styles/sections/about.css`, proving this was an additive wrapper experiment rather than a required content-model change.

**Impact:** excessive scroll cost, reduced reading comfort, hierarchy disruption, and unnecessary coupling between a specific page section and a global animation bundle.

**Decision:** restore only the biography wrapper and classes. Do not reset the file and do not revert copy, metadata, preload, heading-label, CTA, or other owner changes.

### Medium priority

#### M1 — Removed motion imports left stale architecture and dead modules

`styles/main.css` no longer imports `base/motion.css` or `base/view-transitions.css`, while `js/main.js:44` still initializes `initScrollReveal()`, multiple source comments still describe the removed motion stylesheet, and `split-text.js`, `work-preview.js`, and `generative-field.js` are no longer imported. The current `.reveal` behaviour is partly neutralized by late overrides such as `styles/swiss.css:24` and `122`.

**Impact:** misleading documentation, code that appears active but is not, uncertain regression surface, and avoidable maintenance cost.

**Plan:** decide feature by feature whether it is active. Delete genuinely retired code only after reference search and browser verification; otherwise restore its explicit import and tests. Update comments in the same change.

#### M2 — The global arrow-normalization pass is presentation logic in the application entry point

`js/main.js:55-68` walks text nodes in every qualifying link/button and mutates arrows after all rendering. It has no idempotence marker and is unrelated to application boot orchestration.

**Impact:** repeated initialization can duplicate/move arrow spans; the rule is hard to test; it couples typography to every page boot.

**Plan:** emit arrow markup in the owning renderer/static HTML, or extract an idempotent `initDirectionalLinks(root)` utility with a processed flag and scoped tests.

#### M3 — Rendering security is good but the CSP comment overclaims proof

`netlify.toml:16-20` says all innerHTML sinks are escaped. Most dynamic fields are correctly escaped, but that claim is brittle because the sink inventory changes as modules evolve. `style-src 'unsafe-inline'` remains required by per-item style variables.

**Impact:** future maintainers may treat the comment as a permanent guarantee. Trusted Types cannot be safely enforced without first removing or centralizing raw string sinks.

**Plan:** add a test that enumerates render-module `innerHTML` use and exercises hostile fixture strings through each renderer. Treat Trusted Types as a staged, report-only future improvement—not a drop-in patch. Preserve the current CSP until inline styles are deliberately migrated.

#### M4 — Sitemap coverage is incomplete and dates are stale

`sitemap.xml` includes Home, Work, About, four case studies, and Privacy, but omits Services, Contact, Playground, and both writing articles. Existing `lastmod` values remain `2026-06-28` despite current page changes.

**Impact:** weaker crawl discovery and inaccurate freshness signals.

**Plan:** generate or manually reconcile the sitemap against canonical, indexable HTML routes; include Services, Contact, Playground, and writing pages; update `lastmod` only for materially changed content. Exclude 404.

#### M5 — Static assets are marked immutable without content hashes

`netlify.toml:48-57` gives fonts and images a one-year immutable cache, but asset filenames such as `miebaka-joshua-logo.svg` and optimized project images are stable rather than content-hashed.

**Impact:** replacing an asset at the same path can leave returning visitors with the old version for up to a year.

**Plan:** either introduce fingerprinted filenames through a build step, or remove `immutable`/use revalidation for mutable stable-name assets. Do not add a build pipeline solely for this; the lower-complexity cache-policy change is valid.

#### M6 — The contact experience is not a delivery channel

The form has no `action` and JavaScript constructs a `mailto:` URI (`contact.html:95-112`, `js/core/form.js:108-120`). This is disclosed in code but visually resembles a normal submission form.

**Impact:** users without a configured mail client may see no useful result; message length is truncated; conversion cannot be confirmed.

**Plan:** in this release, make the handoff language explicit and keep the direct email address prominent. A future hosted endpoint is a product decision and must not be implied by frontend-only validation.

### Low priority

#### L1 — Version sources disagree

`VERSION` is `v1.1.0`, while `package.json` is `1.0.0`, and the current audit targets `v1.1.1`.

**Plan:** make `VERSION` authoritative for the static release and synchronize package metadata when the release is finalized. Do not version-bump merely to run an audit.

#### L2 — Production CSS is delivered through a long `@import` chain

The single stylesheet imports more than twenty files. This is maintainable in source, but without bundling it creates serial CSS discovery concerns depending on browser/cache state.

**Plan:** measure first. If Lighthouse shows CSS request-chain impact, concatenate/minify at deploy while preserving source modules. Do not collapse authoring files by hand.

## The Fool: pre-mortem

### Steelmanned thesis

The portfolio should feel authored and memorable, and carefully adapted reference interactions can make the work feel more considered than a generic static portfolio.

### Strongest failure modes

1. **Reference accumulation replaces direction.** Six unrelated demos become six competing motion dialects. Early warning: a new global stylesheet or initializer is added per reference. Mitigation: one motion grammar—fast controls, restrained section transitions, one signature project handoff.
2. **Polish delays the primary job.** Visitors wait through preloaders and project theatrics before reaching work. Early warning: a navigation path exceeds 500 ms before the browser starts loading the destination. Mitigation: content and navigation win; animation must be interruptible, bypassable, and never required for comprehension.
3. **Global overrides make every fix fragile.** Early warning: selectors require `!important`, duplicated media queries, or page-specific exceptions in `swiss.css`. Mitigation: restore ownership by layer and page.
4. **A static site acquires enterprise architecture cargo cults.** Early warning: adding APIs, auth abstractions, a database, or an SPA framework without a concrete user requirement. Mitigation: keep the zero-build system; add infrastructure only when a real product capability requires it.
5. **Visual QA passes while navigation or semantics regress.** Early warning: screenshots look correct but keyboard, reduced-motion, no-JS, deep links, or console state are untested. Mitigation: make those paths explicit release gates.

### Synthesis

Keep the expressive editorial identity, but concentrate delight in a few moments and simplify the system underneath. The quality target is not “more animation”; it is immediate navigation, legible hierarchy, consistent interaction physics, resilient fallbacks, and code whose ownership matches the interface.

## Bounded implementation plan

### Phase 1 — Surgical About restoration

Edit only the biography structure in `about.html:80-114`:

```html
<section class="section--tight container">
  <div class="about-grid">
    <picture class="about-portrait reveal">…unchanged picture sources and img…</picture>
    <div class="stack reveal">…unchanged biography copy…</div>
  </div>
</section>
```

Exact mutation:

- Replace `<section class="about-crawl" data-perspective-bio aria-label="About Miebaka">` with `<section class="section--tight container">`.
- Replace the two nested wrappers `about-crawl__sticky container` and `about-crawl__plane` with one `<div class="about-grid">`.
- Remove only `about-crawl__portrait` from the `<picture>` class list.
- Remove only `about-crawl__copy` from the biography `<div>` class list.
- Remove the now-extra wrapper closing tag.
- Leave every word of copy, all image sources/dimensions/alt/loading attributes, metadata, hero, mission, experience, and CTA untouched.
- Do **not** use `git checkout`, `git restore`, or replace `about.html` from `HEAD`; the file contains unrelated dirty changes.

The crawl CSS may be deleted from `styles/components/skiper-interactions.css` after `rg 'about-crawl|perspective-bio'` confirms no consumers. This is safe dead-code removal but should be a separate patch hunk so it can be reviewed independently.

### Phase 2 — Reliability fixes with no visual redesign

1. Introduce a small page/selector-gated initializer registry in `js/main.js`.
2. Move arrow normalization into an idempotent utility or renderer-owned markup.
3. Make project navigation fail-open, single-flight, immediate for keyboard/reduced-motion, and cleaned up on page lifecycle events.
4. Reconcile active versus retired motion modules and delete only proven dead code.
5. Add hostile-string render tests and navigation lifecycle tests.

### Phase 3 — CSS ownership cleanup

Move `swiss.css` rules in small, testable slices:

- navigation rules → `components/navigation.css`
- homepage masthead/selected/about rules → `sections/home.css`
- work catalogue rules → `sections/work.css`
- shared arrow/button rules → their component files
- global spacing/motion rules → tokens/base utilities only when genuinely global

Remove each migrated rule from `swiss.css` in the same patch. No wholesale rewrite.

### Phase 4 — Hosting and SEO hygiene

1. Complete the sitemap and correct meaningful `lastmod` dates.
2. Resolve immutable caching for non-fingerprinted assets.
3. Preserve the verified CSP hash and header suite.
4. Decide explicitly whether the contact path remains mailto or becomes a real form backend; do not blur the two architectures.

## Acceptance gates

- About biography matches the pre-crawl two-column/stacked responsive layout, with current copy preserved.
- No `about-crawl` or `data-perspective-bio` consumer remains after cleanup.
- Every HTML route loads directly at mobile, tablet, and desktop widths.
- Keyboard navigation, Escape behaviour, focus visibility, reduced motion, no-JS fallbacks, and back/forward cache paths work.
- No console errors or unhandled promise rejections.
- All internal links resolve; canonical URLs and sitemap agree.
- `npm test`, `npm audit`, HTML validation, accessibility checks, and performance audits pass within project thresholds.
- No unrelated dirty file is reverted or reformatted.

## Architectural verdict

**Request changes.** The foundation is strong for a static portfolio, and its security posture is better than average. The blocking architectural problems are the rejected About crawl, global late CSS override layer, and globally initialized/delayed interaction system. The correct next move is a surgical rollback plus incremental ownership cleanup—not another visual rewrite and not a backend expansion.
