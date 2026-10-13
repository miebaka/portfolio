# Portfolio Design Engineering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the restored portfolio's proof, navigation, accessibility, conversion and engineering quality without changing its approved visual character.

**Architecture:** Keep the static HTML, CSS and ES-module platform. Add validated build-time content domains and one narrow Vercel contact endpoint. Prerender essential content and use JavaScript only for enhancement.

**Tech Stack:** HTML, CSS, ES modules, Node.js build scripts and tests, Vercel Functions, Resend, infrastructure-backed rate limiting, Playwright and Lighthouse.

**Spec:** `docs/superpowers/specs/2026-10-13-portfolio-design-engineering-review.md`

## Global Constraints

- Commit `54dcc41` is the visual baseline.
- Preserve the current palette, typography, spacing character, imagery and restrained motion.
- Do not invent content, outcomes, testimonials, collaborators or community entries.
- Core navigation and narrative must work without JavaScript.
- Work on a `codex/` branch and use a preview deployment; do not merge to `main` without explicit approval.
- Maintain WCAG 2.2 AA, 320px support and the performance budgets in the specification.

---

### Task 1: Freeze the approved visual baseline

**Files:**
- Create: `tests/visual-contract/route-contract.mjs`
- Create: `tests/visual-contract/README.md`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test:contract`, a non-screenshot contract check for protected visual and structural primitives.

- [ ] Record the protected route, font, token, image-treatment and footer-signature assertions from the specification.
- [ ] Add failing assertions for the visual baseline and required structural changes.
- [ ] Run `npm run test:contract` and confirm failures describe only missing new contracts.
- [ ] Add the script to `package.json` and make `npm test` run it after the existing integrity suite.
- [ ] Run the full suite and commit with `test: freeze approved portfolio visual contract`.

### Task 2: Replace obsolete integrity contracts

**Files:**
- Modify: `scripts/site-integrity.test.mjs`
- Modify: `data/site.js`

**Interfaces:**
- Produces: tests that allow mixed `published` and `coming-soon` project states.

- [ ] Replace the assertion that every project is locked with explicit state validation.
- [ ] Add failing tests requiring one published flagship and truthful unfinished states.
- [ ] Update project data minimally so TEDx RSU is the only initial published flagship.
- [ ] Run `npm test` and confirm the new state contract passes without changing presentation.
- [ ] Commit with `test: align project publication contract`.

### Task 3: Introduce validated content domains

**Files:**
- Create: `data/site-config.js`
- Create: `data/navigation.js`
- Create: `data/projects.js`
- Create: `data/case-studies.js`
- Create: `data/services.js`
- Create: `data/writing.js`
- Create: `scripts/validate-content.mjs`
- Modify: `scripts/build-site.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `validateContent(): { routes, projects, caseStudies, services, writing }`.
- Validates: unique slugs, publication states, route ownership, media dimensions, next-project references and required metadata.

- [ ] Write fixture-based failing tests for duplicate slugs, missing dimensions and invalid project references.
- [ ] Implement the validator with explicit error messages.
- [ ] Split public data without changing rendered output.
- [ ] Generate the route manifest and sitemap from validated data.
- [ ] Run `npm test` and compare the production HTML output with the baseline except for intentional metadata ordering.
- [ ] Commit with `refactor: validate portfolio content domains`.

### Task 4: Add Explorations and Community routes

**Files:**
- Create: `explorations.html`
- Create: `community.html`
- Modify: `data/navigation.js`
- Modify: `js/render/navigation.js`
- Modify: `js/render/footer.js`
- Modify: `scripts/build-site.mjs`
- Modify: `sitemap.xml`
- Modify: `styles/pages-v4.css`

**Interfaces:**
- Produces: prerendered routes with truthful empty or real-entry states.

- [ ] Write failing route, metadata, navigation and no-JavaScript content tests.
- [ ] Add the two routes using existing page-shell and typography patterns.
- [ ] Add destinations to the full Index and footer without crowding the persistent bar.
- [ ] Add only the minimum route-specific CSS needed.
- [ ] Verify at 320px, 390px and 1440px with both themes.
- [ ] Commit with `feat: add explorations and community routes`.

### Task 5: Strengthen navigation without changing its character

**Files:**
- Modify: `js/render/navigation.js`
- Modify: `styles/components-v4.css`
- Modify: `styles/pages-v4.css`
- Modify: root HTML files for prerendered fallback links

**Interfaces:**
- Produces: `openIndex(trigger)`, `closeIndex({ restoreFocus })` and complete static fallback navigation.

- [ ] Write failing tests for Index destinations, Escape handling, focus containment and focus restoration.
- [ ] Implement the editorial Index using existing type, colour and spacing roles.
- [ ] Keep the persistent desktop and compact controls visually quiet.
- [ ] Verify all destinations remain available without JavaScript.
- [ ] Complete keyboard, touch and reduced-motion checks.
- [ ] Commit with `feat: strengthen portfolio index navigation`.

### Task 6: Reorder homepage proof and repair project entry points

**Files:**
- Modify: `index.html`
- Modify: `js/render/projects.js`
- Modify: `js/render/sections.js`
- Modify: `styles/pages-v4.css`

**Interfaces:**
- Consumes: validated project publication state.
- Produces: accessible project anchors for published work and truthful disabled states for unfinished work.

- [ ] Write failing tests for the approved homepage order and published-project links.
- [ ] Move Selected Work before the profile section without changing section styling.
- [ ] Render published projects as anchors and unfinished projects as non-interactive entries.
- [ ] Gate hover transforms behind `(hover: hover) and (pointer: fine)` and provide equivalent focus treatment.
- [ ] Verify geometry, reading order and focus order at every required width.
- [ ] Commit with `feat: put portfolio proof before biography`.

### Task 7: Publish the TEDx RSU flagship case study

**Files:**
- Modify: `data/case-studies.js`
- Modify: `work/tedx-rsu.html`
- Modify: `js/render/case-markup.js`
- Modify: `js/render/case-study.js`
- Modify: `styles/pages-v4.css`
- Add: supplied TEDx media under `assets/images/projects/tedx-rsu/`

**Interfaces:**
- Produces: `renderCaseStudy(caseStudy)` supporting facts, narrative chapters, media and next-project transition.

- [ ] Add a failing structural test for proposition, facts, required narrative chapters, media dimensions and next project.
- [ ] Populate only verified owner-supplied content and omit unavailable outcomes.
- [ ] Prerender the complete narrative before JavaScript enhancement.
- [ ] Add restrained chapter orientation that does not resemble application navigation.
- [ ] Verify media loading, alt text, focus, no-JavaScript use and responsive measure.
- [ ] Commit with `feat: publish TEDx RSU flagship case study`.

### Task 8: Restore CV delivery and audit evidence claims

**Files:**
- Add: `assets/documents/miebaka-joshua-cv.pdf`
- Modify: `about.html`
- Modify: `js/render/navigation.js`
- Modify: `data/site-config.js`
- Modify: `scripts/site-integrity.test.mjs`

**Interfaces:**
- Produces: stable `DOWNLOAD CV` link with PDF type and file size.

- [ ] Verify the approved resume source and copy it to the stable public filename.
- [ ] Add failing tests for file presence, link text, MIME type and size metadata.
- [ ] Add the action to About and the Index without adding a top-level destination.
- [ ] Audit every numerical claim and remove or qualify unsupported claims.
- [ ] Run link and content verification.
- [ ] Commit with `feat: restore verified CV delivery`.

### Task 9: Implement the contact service boundary

**Files:**
- Create: `api/contact.js`
- Create: `api/lib/contact-schema.js`
- Create: `api/lib/rate-limit.js`
- Create: `api/lib/mail-service.js`
- Create: `api/lib/resend-mail-service.js`
- Create: `tests/contact-api.test.mjs`
- Modify: `vercel.json`
- Modify: `package.json`

**Interfaces:**
- Consumes: `{ name: string, email: string, message: string, interest?: string, website?: string, startedAt?: number }`.
- Produces: `{ ok: true, requestId: string }` or `{ ok: false, code: string, requestId: string, retryAfter?: number }`.

- [ ] Write failing schema tests for valid input, blank message, excessive lengths, malformed JSON, unexpected values and oversized bodies.
- [ ] Implement the pure schema validator.
- [ ] Define the mail-service interface and mock it in tests.
- [ ] Implement same-origin checks, accessible abuse signals and infrastructure-backed rate limiting.
- [ ] Implement the Resend adapter with `AbortSignal.timeout(8000)`.
- [ ] Add privacy-safe structured logs and stable error responses.
- [ ] Run unit and integration tests without contacting the real provider.
- [ ] Commit with `feat: add secure contact delivery endpoint`.

### Task 10: Upgrade the contact client and privacy contract

**Files:**
- Modify: `contact.html`
- Modify: `js/core/form.js`
- Modify: `privacy.html`
- Modify: `styles/components-v4.css`
- Create: `tests/contact-form.test.mjs`

**Interfaces:**
- Consumes: the contact endpoint response envelope from Task 9.
- Produces: submitting, success, validation, rate-limit and provider-failure states while preserving values.

- [ ] Write failing tests for required message, merged `aria-describedby`, double-submit prevention, retained values and focus on first error.
- [ ] Implement client validation as a convenience while keeping server validation authoritative.
- [ ] Submit to `/api/contact` with an abort timeout and explicit recovery messages.
- [ ] Preserve visible email and a truthful no-JavaScript fallback.
- [ ] Update privacy copy for fields, purpose, processors and operational retention.
- [ ] Commit with `feat: complete accessible contact flow`.

### Task 11: Repair motion, accessibility and the client marquee

**Files:**
- Modify: `js/render/projects.js`
- Modify: `styles/foundations.css`
- Modify: `styles/components-v4.css`
- Modify: `styles/pages-v4.css`
- Modify: `scripts/site-integrity.test.mjs`

**Interfaces:**
- Produces: user-controlled marquee state and purpose-specific reduced motion.

- [ ] Write failing tests for Pause or Play control semantics and reduced-motion static rendering.
- [ ] Add the visible control and persist its state only for the current visit.
- [ ] Replace the global one-millisecond animation kill with component-specific reduced-motion rules.
- [ ] Expand small interactive hit regions to a practical 44 by 44 pixels without visual bulk.
- [ ] Verify keyboard, touch, forced colours, text spacing and 200 percent zoom.
- [ ] Commit with `fix: complete accessible motion controls`.

### Task 12: Consolidate tokens and CSS ownership

**Files:**
- Modify: `styles/foundations.css`
- Modify: `styles/components-v4.css`
- Modify: `styles/pages-v4.css`
- Modify: `styles/main.css`
- Modify: `scripts/site-integrity.test.mjs`

**Interfaces:**
- Produces: one bundled production stylesheet with semantic interface colour usage and reduced selector duplication.

- [ ] Add tests that reject raw interface colours outside reference-token declarations and approved project media.
- [ ] Inventory repeated selectors and assign each to one owning source section.
- [ ] Remove obsolete override strata in small, reviewable groups.
- [ ] Confirm computed styles against the baseline after every group.
- [ ] Verify compressed CSS stays below 45KB and no route regresses.
- [ ] Commit with `refactor: consolidate portfolio style contracts`.

### Task 13: Add deployment and browser quality gates

**Files:**
- Create: `.github/workflows/quality.yml`
- Create: `tests/e2e/portfolio.spec.mjs`
- Create: `tests/e2e/contact.spec.mjs`
- Create: `lighthouse.config.cjs`
- Modify: `package.json`
- Modify: `vercel.json`
- Modify: `netlify.toml`

**Interfaces:**
- Produces: `npm run test:e2e` and `npm run test:lighthouse`.

- [ ] Add CI jobs for build, unit, integrity and dependency audit checks.
- [ ] Add route checks at 320px, 390px, tablet, 1280px and 1440px.
- [ ] Assert no horizontal overflow, broken assets, duplicate IDs or console errors.
- [ ] Test Index keyboard behavior and contact success and failure with mocked provider responses.
- [ ] Enforce LCP, INP, CLS, CSS, JavaScript and homepage-media budgets.
- [ ] Make Vercel canonical and test header parity if Netlify remains supported.
- [ ] Commit with `test: add portfolio release quality gates`.

### Task 14: Preview review and release

**Files:**
- Modify only files required by verified defects found during final QA.

**Interfaces:**
- Produces: approved preview deployment and releasable branch.

- [ ] Run `npm test`, `npm audit --audit-level=moderate`, `npm run test:e2e`, `npm run test:lighthouse` and `git diff --check`.
- [ ] Inspect every route, both themes, reduced motion, forced colours, touch, keyboard and JavaScript-disabled content.
- [ ] Verify the preview deployment headers, API behavior, privacy copy, performance and asset integrity.
- [ ] Present the preview and named material changes for owner approval.
- [ ] Merge only after explicit approval.
- [ ] Verify the production deployment against the approved commit.
- [ ] Use `superpowers:finishing-a-development-branch` to close the branch safely.

