# Miebaka Portfolio Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the restored portfolio a complete, credible senior-design portfolio by opening a flagship case study, strengthening proof and navigation, adding truthful missing destinations, shipping reliable contact delivery and meeting explicit quality gates without changing its approved visual character.

**Architecture:** Keep the static HTML, CSS and native ES-module platform. Split public content into validated domain modules, prerender essential content at build time, and use client JavaScript only for enhancement. Add one narrow Vercel contact function composed from pure validation, abuse protection, a replaceable mail adapter and privacy-safe logging.

**Tech Stack:** HTML5, CSS custom properties, native ES modules, Node.js 24 built-in tests, Sharp, Playwright, axe-core, Lighthouse CI, Vercel Functions, Resend and Upstash Redis.

**Spec:** `docs/superpowers/specs/2026-10-13-portfolio-design-engineering-review.md`; product requirements: [Miebaka Portfolio Product Requirements Document](https://docs.google.com/document/d/1TYrrwcmAMMtSWzWsPiT-L6p4MLDqYGQIY_dWHLc7Ma4/edit?usp=drivesdk)

## Global Constraints

- Commit `54dcc41` is the visual baseline. Preserve its Ultramarine/paper/ink palette, typography, spaciousness, sharp geometry, authored imagery, portrait treatment, footer signature and quiet interaction language.
- The current `DESIGN.md` describes a superseded forest-green direction. The approved PRD and commit `54dcc41` override it for this project. Do not use it to justify visual changes.
- Do not add a framework, CMS, database, authentication, analytics suite, custom cursor, smooth-scroll library, animation library or fourth typeface.
- Do not invent outcomes, metrics, testimonials, collaborators, community work, explorations or working principles.
- Essential copy, navigation, project state and case-study narrative must exist before JavaScript runs.
- WCAG 2.2 AA is the floor. Verify 320px, 390px, 768px, 1280px and 1440px; 200% zoom; increased text spacing; forced colours; keyboard; touch; pointer; reduced motion; Save-Data; and JavaScript disabled.
- LCP target ≤2.0s/hard gate ≤2.5s; INP target ≤150ms/hard gate ≤200ms; CLS ≤0.05; compressed initial JS ≤75KB; compressed CSS ≤45KB; homepage pre-interaction media ≤1.5MB.
- UI motion needs a purpose. Never use `transition: all` or `ease-in` for entrances. Frequent UI transitions stay under 300ms. Predetermined motion uses CSS/WAAPI; reduced motion removes continuous/spatial movement but keeps brief opacity/colour feedback.
- Work on a `codex/` branch, produce a preview and obtain explicit owner approval before merging to `main`.

## File Ownership Map

- `data/site-config.js`: identity, contact, canonical URL, CV metadata and feature switches.
- `data/navigation.js`: primary, Index and footer destinations.
- `data/projects.js`: project summaries and publication states.
- `data/case-studies.js`: case-study narrative and media metadata.
- `data/services.js`, `data/writing.js`, `data/clients.js`: their named content domains.
- `scripts/content-schema.mjs`: pure validation; `scripts/validate-content.mjs`: CLI build gate.
- `js/render/*.js`: pure markup; `js/core/*.js`: browser behavior and state.
- `api/contact.js`: HTTP composition; `api/lib/*`: validation, abuse, mail and logging boundaries.
- `tests/e2e/*`, `tests/visual/*`, `scripts/check-budgets.mjs`: release evidence.

---

### Task 1: Replace the obsolete product contract and freeze the visual baseline

**Files:**
- Create: `tests/fixtures/visual-contract.json`
- Create: `scripts/visual-contract.test.mjs`
- Modify: `scripts/site-integrity.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run test:contract`.
- No production UI changes in this task.

- [ ] **Step 1: Add the protected contract fixture**

```json
{
  "baselineCommit": "54dcc41",
  "fonts": ["BIZ UDPMincho", "Schibsted Grotesk", "Josefin Sans"],
  "tokens": { "--ref-ultramarine": "#002080", "--ref-paper": "#f8f9fc" },
  "protectedCopy": ["I design brand systems, then build the tools that keep them intact.", "Hi, I’m Miebaka"],
  "forbiddenCopy": ["Independent practice", "Position 01", "Three decisions. Three systems."],
  "forbiddenCss": ["transition:all", "gradient(", "filter:saturate"]
}
```

- [ ] **Step 2: Write the failing visual-contract test**

Read `dist/styles/main.css`, `dist/index.html` and all production HTML. Assert fixture tokens/fonts/copy, the three-typeface ceiling, footer signature, one bundled stylesheet and the forbidden patterns.

```js
test("approved visual contract remains intact", async () => {
  const css = (await readFile(cssUrl, "utf8")).replaceAll(" ", "").toLowerCase();
  assert.match(css, /--ref-ultramarine:#002080/);
  assert.match(css, /--ref-paper:#f8f9fc/);
  assert.doesNotMatch(css, /transition:all|gradient\(|filter:saturate/);
});
```

- [ ] **Step 3: Remove assertions that require every case study to be locked**

Replace them with a forward contract: one featured project is `published`; other unfinished projects are explicitly `coming-soon`; private projects never render.

```js
test("project publication states are explicit", () => {
  assert.equal(SITE.projects.filter(p => p.featured && p.status === "published").length, 1);
  assert.ok(SITE.projects.some(p => p.status === "coming-soon"));
});
```

- [ ] **Step 4: Register and run the suite**

```json
"test:integrity": "node --test scripts/site-integrity.test.mjs",
"test:contract": "node --test scripts/visual-contract.test.mjs",
"test": "npm run build && npm run test:integrity && npm run test:contract"
```

Run: `npm test`

Expected: FAIL only for missing `project.status` and new routes; no visual-contract failure.

- [ ] **Step 5: Commit**

```bash
git add tests/fixtures/visual-contract.json scripts/visual-contract.test.mjs scripts/site-integrity.test.mjs package.json
git commit -m "test: define approved portfolio contract"
```

---

### Task 2: Split and validate public content domains

**Files:**
- Create: `data/site-config.js`, `data/navigation.js`, `data/projects.js`, `data/case-studies.js`, `data/services.js`, `data/writing.js`, `data/clients.js`
- Create: `scripts/content-schema.mjs`, `scripts/validate-content.mjs`
- Create: `tests/content-schema.test.mjs`
- Modify: `data/site.js`, `scripts/build-site.mjs`, `package.json`

**Interfaces:**
- `validateContent(content)` returns `{ ok: true, value }` or `{ ok: false, errors: { path, code, message }[] }`.
- `PROJECT_STATUS = { PUBLISHED: "published", COMING_SOON: "coming-soon", PRIVATE: "private" }`.
- Project: `{ slug, title, category, tagline, tags, year, tone, cover, featured, status, href? }`.
- Media: `{ label, src, w, h, alt, loading? }`.

- [ ] **Step 1: Write failing validator tests**

Cover duplicate slugs, invalid status, missing media dimensions/alt, broken `next.slug`, duplicate routes and a published project without a case study.

```js
test("published projects require a case study", () => {
  const result = validateContent(fixture({ projects: [{ slug: "missing", status: "published" }], caseStudies: {} }));
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "PUBLISHED_CASE_MISSING");
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `node --test tests/content-schema.test.mjs`

Expected: `ERR_MODULE_NOT_FOUND` for `scripts/content-schema.mjs`.

- [ ] **Step 3: Implement explicit validators without a schema dependency**

```js
export function validateContent(content) {
  const errors = [
    ...validateRoutes(content.navigation),
    ...validateProjects(content.projects, content.caseStudies),
    ...validateCaseStudies(content.caseStudies, content.projects),
    ...validateMedia(content.caseStudies)
  ];
  return errors.length ? { ok: false, errors } : { ok: true, value: content };
}
```

- [ ] **Step 4: Move data without changing displayed values**

Set TEDx RSU to `published`; Rivo and ChopBox to `coming-soon`; retain private/unready work as `private` or `coming-soon` according to the PRD. Remove global `workLocked` as product logic.

- [ ] **Step 5: Keep `data/site.js` as a temporary compatibility facade**

```js
export const SITE = {
  ...siteConfig,
  menu: navigation.primary,
  projects,
  caseStudies,
  capabilities: services,
  writing,
  clients
};
```

- [ ] **Step 6: Fail the build before writing `dist` when content is invalid**

Add `validate:content` and make `build` run it before `scripts/build-site.mjs`.

- [ ] **Step 7: Verify and commit**

Run: `node --test tests/content-schema.test.mjs && npm test`

```bash
git add data scripts/content-schema.mjs scripts/validate-content.mjs scripts/build-site.mjs tests/content-schema.test.mjs package.json
git commit -m "refactor: validate portfolio content domains"
```

---

### Task 3: Add the route registry, Explorations and Community

**Files:**
- Create: `explorations.html`, `community.html`, `js/render/collection.js`
- Modify: `data/navigation.js`, `scripts/build-site.mjs`, `sitemap.xml`, `js/render/footer.js`, `styles/pages-v4.css`
- Modify: fallback navigation in all root, `work/` and `writing/` HTML shells

**Interfaces:**
- Navigation records: `{ key, label, href, includeIn: string[] }`.
- `renderCollectionState({ title, introduction, entries, emptyMessage })` renders real entries or a truthful empty state.

- [ ] **Step 1: Add failing tests for unique routes, canonical URLs and fallback links**

For every Index route, assert every production page exposes a usable fallback link without JavaScript.

- [ ] **Step 2: Create the two semantic page shells**

Use existing hero/container/footer patterns. Until approved entries exist, use:

```html
<h1>Explorations</h1>
<p>Self-initiated studies in image, type and systems. The first entries are being prepared for publication.</p>
```

```html
<h1>Community</h1>
<p>Resources, contributions and shared work will appear here when they are ready to be useful.</p>
```

Do not add empty cards, fake dates or disabled calls to action.

- [ ] **Step 3: Generate the build route list and sitemap from validated navigation**

Replace hand-written `rootFiles`; keep sitemap free of unmaintained `<lastmod>` claims.

- [ ] **Step 4: Add links to Index/fallback/footer without crowding persistent navigation**

Resolve relative paths correctly from root, `work/` and `writing/` pages.

- [ ] **Step 5: Add only route-shell CSS**

Reuse current typography and measures; no cards, pills, gradients, new accents or decorative borders.

- [ ] **Step 6: Verify and commit**

Run: `npm test`; inspect both routes at 320px, 390px and 1440px with JavaScript disabled.

```bash
git add explorations.html community.html data/navigation.js js/render/collection.js js/render/footer.js scripts/build-site.mjs sitemap.xml styles/pages-v4.css *.html work/*.html writing/*.html
git commit -m "feat: add truthful explorations and community routes"
```

---

### Task 4: Build the complete editorial Index

**Files:**
- Modify: `js/render/navigation.js`, `js/core/navigation.js`, `styles/components-v4.css`, `styles/pages-v4.css`
- Create: `tests/navigation.test.mjs`

**Interfaces:**
- `createIndexController({ root, trigger })` returns `{ open({ source }), close({ restoreFocus }), destroy(), isOpen }`.
- `source` is `pointer | keyboard | programmatic`; keyboard opening is immediate.

- [ ] **Step 1: Write failing focus and keyboard tests**

Assert `aria-expanded`, background inertness, initial focus, Tab wrap, Escape close, focus restoration and no duplicated listeners.

- [ ] **Step 2: Render all eight destinations, email, CV when available and preferences**

Use a native `<dialog>` only if it passes the target matrix; otherwise implement a labelled fixed region with explicit inert and focus management.

- [ ] **Step 3: Implement controller behavior**

Store the active trigger; close only restores focus if it remains connected. Hidden links must leave the tab order.

- [ ] **Step 4: Apply restrained motion**

Pointer open: opacity plus short clip reveal, 220ms `cubic-bezier(.25,1,.5,1)`; exit 160ms. Keyboard open: immediate. Reduced motion: opacity only, 120ms.

- [ ] **Step 5: Verify and commit**

Check 320–1440px, landscape mobile, safe areas, keyboard, touch, screen-reader naming and scroll lock.

```bash
git add js/render/navigation.js js/core/navigation.js styles/components-v4.css styles/pages-v4.css tests/navigation.test.mjs
git commit -m "feat: build complete editorial index"
```

---

### Task 5: Put proof before biography and implement honest project states

**Files:**
- Modify: `index.html`, `work.html`, `js/render/projects.js`, `js/render/sections.js`, `styles/pages-v4.css`, `scripts/site-integrity.test.mjs`

**Interfaces:**
- `projectMarkup(project, index, base)` returns an anchor for `published`, a non-interactive article for `coming-soon`, and nothing for `private`.

- [ ] **Step 1: Add failing homepage-order and project-state tests**

```js
assert.ok(html.indexOf('id="selected-work"') < html.indexOf('id="profile"'));
assert.match(projectMarkup(publishedProject), /<a\b[^>]*href="work\/tedx-rsu.html"/);
assert.doesNotMatch(projectMarkup(comingSoonProject), /<a\b/);
```

- [ ] **Step 2: Move the existing Selected Work section before profile**

Change order only; do not redesign either section. DOM and visual order must match.

- [ ] **Step 3: Render state-specific markup**

TEDx opens. Unfinished entries are visibly “Coming soon” and non-interactive. Private entries are absent from pages and sitemap.

- [ ] **Step 4: Repair hover/focus behavior**

Gate pointer expansion behind `(hover: hover) and (pointer: fine)`. Focus reveals equivalent information without surprising sibling geometry. Avoid motion if underline/colour is enough.

- [ ] **Step 5: Verify and commit**

Run `npm test`; inspect Home and Work across the required matrix.

```bash
git add index.html work.html js/render/projects.js js/render/sections.js styles/pages-v4.css scripts/site-integrity.test.mjs
git commit -m "feat: put published work before biography"
```

---

### Task 6: Publish the TEDx RSU flagship case study

**Files:**
- Modify: `data/case-studies.js`, `work/tedx-rsu.html`, `js/render/case-markup.js`, `js/render/case-study.js`, `styles/pages-v4.css`
- Create: `tests/case-study.test.mjs`
- Add only owner-supplied media: `assets/images/work/tedx-rsu/*`

**Interfaces:**
- `renderCaseMarkup(site, slug, basePath)` serves prerender and enhancement.
- Chapters: `{ id, label, title?, body: string[], media?: string[] }`.
- Required IDs: `context`, `problem`, `process`, `decision`, `system`, `applications`, `production`, `reflection`; outcomes optional when verified.

- [ ] **Step 1: Write the failing case contract**

Assert proposition, hero, role/year/deliverables/collaborators, ordered chapters, intrinsic media dimensions, meaningful alt, reflection and next project.

- [ ] **Step 2: Map only verified content into the new model**

Use existing final-system evidence; omit unsupported outcomes and collaborators rather than guessing.

- [ ] **Step 3: Render semantic, prerendered markup**

Use a proposition, hero figure, facts `<dl>`, labelled chapter sections, figures/captions and next-project link. All essential content remains when JavaScript is disabled.

- [ ] **Step 4: Apply proof-sheet logic selectively**

Use `PLATE 01` numbering, factual captions and restrained chapter orientation where they clarify sequence. Reject crop marks, press stamps, CMYK decoration and the proof sheet’s one-page/locked architecture.

- [ ] **Step 5: Keep reading still**

Optional one-time image reveals may use opacity plus ≤8px translation over 240ms. Remove them if they delay reading or fail reduced-motion/performance tests. No parallax.

- [ ] **Step 6: Verify and commit**

Run `node --test tests/case-study.test.mjs && npm test`; review all widths, both themes, 200% zoom, text spacing, reduced motion, Save-Data and no-JS.

```bash
git add data/case-studies.js work/tedx-rsu.html js/render/case-markup.js js/render/case-study.js styles/pages-v4.css tests/case-study.test.mjs assets/images/work/tedx-rsu
git commit -m "feat: publish TEDx RSU flagship case study"
```

---

### Task 7: Add professional evidence and the five-service swatch system

**Files:**
- Add when supplied: `assets/documents/miebaka-joshua-cv.pdf`
- Modify: `data/site-config.js`, `data/services.js`, `about.html`, `services.html`, `index.html`, `js/render/sections.js`, `js/render/navigation.js`, `styles/components-v4.css`, `styles/pages-v4.css`
- Create: `tests/professional-evidence.test.mjs`

**Interfaces:**
- `siteConfig.cv = { href, label, mimeType, sizeLabel } | null`.
- `renderExperienceLedger(entries)` consumes `{ organisation, role, period, contribution }[]`.
- `createServiceSwatches(root)` enhances native content; all services remain readable without JS.

- [ ] **Step 1: Write failing tests**

Assert CV presence/metadata when configured and truthful omission when null; exactly five service records; About/Home/Services consume the same data; experience has no unsupported metrics.

- [ ] **Step 2: Gate CV delivery**

Do not create a placeholder PDF. Copy the approved file only when supplied, then show it in About and Index—not top-level navigation.

- [ ] **Step 3: Render the experience ledger**

Keep organisation, role and period scannable; one evidence-bounded contribution sentence. No decorative timeline/cards.

- [ ] **Step 4: Build service swatches**

Desktop may use an overlapping fan. Mobile uses an accessible horizontal snap list or stack. Native buttons/tabs, visible focus and non-colour selection cues are required.

- [ ] **Step 5: Apply Emil motion discipline**

Press: `scale(.97)` for 100–160ms. Hover only on fine pointers. No keyboard-selection animation. Reduced motion removes fan translation and retains selected-state colour/border.

- [ ] **Step 6: Audit claims, test and commit**

Remove or qualify unsupported numeric/outcome claims. Run `npm test` and no-JS checks.

```bash
git add assets/documents data/site-config.js data/services.js about.html services.html index.html js/render/sections.js js/render/navigation.js styles/components-v4.css styles/pages-v4.css tests/professional-evidence.test.mjs
git commit -m "feat: add professional evidence and service system"
```

---

### Task 8: Implement the contact service boundary

**Files:**
- Create: `api/contact.js`, `api/lib/contact-schema.js`, `api/lib/origin.js`, `api/lib/abuse-guard.js`, `api/lib/rate-limit.js`, `api/lib/mail-service.js`, `api/lib/resend-mail-service.js`, `api/lib/safe-log.js`
- Create: `tests/contact-api.test.mjs`, `.env.example`
- Modify: `package.json`, `vercel.json`

**Interfaces:**
- Request: `{ name, email, message, interest?, website?, startedAt }`.
- Success: HTTP 202 `{ ok: true, requestId }`.
- Errors: `INVALID_REQUEST`, `RATE_LIMITED`, `PROVIDER_UNAVAILABLE`, `INTERNAL_ERROR` plus `requestId` and optional `fieldErrors`/`retryAfter`.
- `createContactHandler(deps)` injects `now`, `createRequestId`, `checkOrigin`, `guard`, `mailer`, `logger`.
- `mailer.sendContact(contact, { signal, requestId })` returns `{ providerId }`.

- [ ] **Step 1: Write validation tests**

Cover blank/oversized fields, malformed email/JSON, unknown interest, non-object body, body >16KB, honeypot and submission faster than three seconds.

```js
test("rejects blank message", () => {
  assert.deepEqual(validateContact({ name: "Ada", email: "ada@example.com", message: " ", startedAt: 1 }), {
    ok: false, fieldErrors: { message: "Add a message." }
  });
});
```

- [ ] **Step 2: Implement pure validation and run tests**

Trim display fields, retain message line breaks, reject NUL/control characters and never echo submitted values in errors.

- [ ] **Step 3: Write handler tests**

Cover method/content-type/origin rejection, 422, honeypot no-send, 429 + `Retry-After`, 202, provider timeout/failure 503 and unexpected 500.

- [ ] **Step 4: Implement origin and abuse boundaries**

Accept only same-origin JSON POST. Use honeypot, minimum-fill time and Upstash sliding-window rate limit: five accepted attempts per 15 minutes per privacy-preserving keyed hash. Never persist raw IP/email.

- [ ] **Step 5: Implement the Resend adapter**

Use direct `fetch` with `AbortSignal.timeout(8000)`, escaped minimal HTML plus text, configured recipient/sender and visitor reply-to.

- [ ] **Step 6: Add safe logs and stable responses**

Log only `{ event, requestId, status, latencyMs, providerClass }`; never name/email/message/body/provider payload. Set `Cache-Control: no-store`.

- [ ] **Step 7: Document environment names**

```text
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
CONTACT_ALLOWED_ORIGINS=https://miebaka.design
RATE_LIMIT_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- [ ] **Step 8: Test, audit and commit**

Run `node --test tests/contact-api.test.mjs && npm audit --audit-level=moderate`.

```bash
git add api tests/contact-api.test.mjs package.json package-lock.json vercel.json .env.example
git commit -m "feat: add secure contact delivery endpoint"
```

---

### Task 9: Build the contact-form state machine and privacy contract

**Files:**
- Modify: `contact.html`, `js/core/form.js`, `styles/components-v4.css`, `privacy.html`
- Create: `tests/contact-form.test.mjs`

**Interfaces:**
- `createContactForm(form, { submitContact, now })` exposes `destroy()` and states `idle | validating | submitting | success | validation-error | rate-limited | unavailable | error`.
- `submitContact(payload, { signal })` returns the Task 8 response envelope.

- [ ] **Step 1: Write failing behavior tests**

Cover required message, merged `aria-describedby`, first-invalid focus, retained values after failure, duplicate-submit prevention, success clearing, server field errors, 429, 503, timeout and direct-email fallback.

- [ ] **Step 2: Update markup**

Make message required; add persistent help nodes, hidden honeypot, `startedAt`, polite status and visible copyable email. Replace “opens a draft” with truthful server-delivery copy.

- [ ] **Step 3: Implement the state machine**

Validate → focus first invalid → submit with ten-second client timeout → map response → clear only after 202. Preserve values for every failure.

- [ ] **Step 4: Use exact recovery copy**

- Success: “Message sent. I’ll reply by email.”
- Rate limit: “Too many attempts just now. Please wait and try again, or email me directly.”
- Provider: “The form is temporarily unavailable. Your message is still here; email me directly or try again.”
- Network: “That didn’t send. Your message is still here; try again or email me directly.”

- [ ] **Step 5: Keep feedback calm**

Button press 120ms; “Sending…” text instead of a perpetual spinner; status opacity 120ms; no error shake.

- [ ] **Step 6: Update privacy**

State fields, purpose, Resend, rate-limit data, enforceable retention period and deletion/contact route. Do not publish an unenforced retention promise.

- [ ] **Step 7: Verify and commit**

Run `node --test tests/contact-form.test.mjs && npm test`; verify direct email with JS disabled.

```bash
git add contact.html js/core/form.js styles/components-v4.css privacy.html tests/contact-form.test.mjs
git commit -m "feat: complete accessible contact journey"
```

---

### Task 10: Make motion, marquee and preferences operable

**Files:**
- Modify: `js/render/projects.js`, `js/main.js`, `styles/foundations.css`, `styles/components-v4.css`, `styles/pages-v4.css`, `scripts/site-integrity.test.mjs`
- Create or modify: `js/core/preferences.js`

**Interfaces:**
- `createMarqueeController(root, deps)` returns `{ play, pause, destroy, isPaused }`.
- Preference keys: `color-theme`; `motion-preference = system | reduce | full`.

- [ ] **Step 1: Write failing tests**

Assert visible pause/play control, correct accessible name, static reduced-motion state, off-screen/tab-hidden pause, user pause priority and `aria-hidden` duplicate list.

- [ ] **Step 2: Implement one transformable play/pause control**

Do not crossfade two semantic controls. User pause wins for the visit; visibility changes must not override it.

- [ ] **Step 3: Replace blanket 1ms motion suppression**

Marquee static; Index opacity only; swatches no translation; case images no reveal; short colour/opacity feedback retained.

- [ ] **Step 4: Audit every transition**

Reject `transition: all`, `ease-in`, >300ms frequent UI motion, coarse-pointer hover transforms, layout-property animation and unmeasured `will-change`.

- [ ] **Step 5: Verify lifecycle and commit**

Test system preference changes, explicit preference, localStorage failure, tab visibility, off-screen behavior and listener cleanup.

```bash
git add js/render/projects.js js/main.js js/core/preferences.js styles/foundations.css styles/components-v4.css styles/pages-v4.css scripts/site-integrity.test.mjs
git commit -m "fix: make portfolio motion user-controlled"
```

---

### Task 11: Consolidate style ownership without visual drift

**Files:**
- Modify: `styles/foundations.css`, `styles/components-v4.css`, `styles/pages-v4.css`, `styles/main.css`, `scripts/visual-contract.test.mjs`
- Create: `scripts/check-css-contract.mjs`

**Interfaces:**
- Foundations: tokens/reset/type/global focus/containers/motion variables.
- Components: navigation, Index, buttons, fields, swatches, projects, marquee, footer.
- Pages: composition only, scoped by `body[data-page]` or named page block.
- Production remains one CSS request.

- [ ] **Step 1: Add a CSS contract checker**

Reject `transition: all`, duplicate `.btn{` ownership, raw baseline colours outside token declarations, unscoped route selectors and historical imports.

- [ ] **Step 2: Capture computed-style checkpoints**

For representative elements on Home, Work, TEDx, About, Services and Contact at 390px/1440px, record font, line-height, colour, background, radius, gap, max-width and grid columns.

- [ ] **Step 3: Consolidate one group at a time**

Order: tokens/reset → controls → navigation → projects → forms → page composition. After each group run contract, computed-style comparison and screenshots; restore any unintended value.

- [ ] **Step 4: Add only the required motion tokens**

```css
:root {
  --motion-press: 120ms;
  --motion-hover: 160ms;
  --motion-panel-in: 220ms;
  --motion-panel-out: 160ms;
  --ease-out-ui: cubic-bezier(.25, 1, .5, 1);
  --ease-in-out-ui: cubic-bezier(.65, 0, .35, 1);
}
```

- [ ] **Step 5: Verify budget and commit**

Run `npm run build && node scripts/check-css-contract.mjs && gzip -c dist/styles/main.css | wc -c`.

Expected: ≤45KB compressed; one CSS file; no computed-style drift.

```bash
git add styles scripts/check-css-contract.mjs scripts/visual-contract.test.mjs
git commit -m "refactor: consolidate portfolio style ownership"
```

---

### Task 12: Add browser, accessibility, visual and performance gates

**Files:**
- Create: `playwright.config.mjs`, `tests/e2e/portfolio.spec.mjs`, `tests/e2e/contact.spec.mjs`, `tests/visual/portfolio.spec.mjs`, `scripts/check-budgets.mjs`, `lighthouserc.cjs`, `.github/workflows/quality.yml`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Produces: `test:e2e`, `test:visual`, `test:a11y`, `test:budgets`, `test:lighthouse`, `quality`.

- [ ] **Step 1: Install pinned Playwright, axe and Lighthouse CI dev dependencies**

Configure `webServer` to run the built `dist` on port 4173; projects cover desktop, mobile and reduced motion.

- [ ] **Step 2: Write route and overflow tests**

Every route: 200, one `h1`, no console errors, no failed local resource, no horizontal overflow at required widths.

- [ ] **Step 3: Write priority journeys**

Home → TEDx → next project; Index open/navigate/close; About → CV when present; Work states; empty routes; theme; marquee pause; no-JS navigation.

- [ ] **Step 4: Add accessibility evidence**

Run axe per route and explicit tests for focus, restoration, form descriptions, forced colours, reduced motion, 200% zoom and increased text spacing.

- [ ] **Step 5: Add contact interception tests**

Mock 202, 422, 429, 503; verify copy, retained input, duplicate prevention and no values in URL/console.

- [ ] **Step 6: Capture selected visual baselines**

Home, Work, TEDx, Index, About, Services and Contact at 390px/1440px, both themes. Mask only genuinely live Last.fm text. Human review is required for baseline updates.

- [ ] **Step 7: Enforce budgets**

```js
assertBudget("initial CSS", cssGzip, 45 * 1024);
assertBudget("initial JavaScript", jsGzip, 75 * 1024);
assertBudget("homepage media", homepageMedia, 1.5 * 1024 * 1024);
```

Lighthouse gates LCP 2500ms and CLS 0.05; use TBT as controlled-test proxy for INP and preserve the 150/200ms INP target for field/manual evidence.

- [ ] **Step 8: Register quality scripts and CI**

```json
"test:e2e": "playwright test tests/e2e",
"test:visual": "playwright test tests/visual",
"test:budgets": "node scripts/check-budgets.mjs",
"test:lighthouse": "lhci autorun",
"quality": "npm test && npm run test:e2e && npm run test:budgets && npm run test:lighthouse && npm audit --audit-level=moderate"
```

CI uses `npm ci`, caches browsers, uploads reports on failure and never deploys a failing build.

- [ ] **Step 9: Run and commit**

Run: `npm run quality`

```bash
git add package.json package-lock.json playwright.config.mjs tests scripts/check-budgets.mjs lighthouserc.cjs .github/workflows/quality.yml
git commit -m "test: add portfolio release quality gates"
```

---

### Task 13: Harden deployment and production output

**Files:**
- Modify: `vercel.json`, `netlify.toml`, `scripts/build-site.mjs`, `scripts/site-integrity.test.mjs`, `privacy.html`
- Modify if retained: `js/render/now-playing.js`

**Interfaces:**
- Vercel is canonical. Netlify either matches static headers or is documented as not supporting contact.
- CSP changes ship report-only before enforcement.

- [ ] **Step 1: Test output hygiene and cache truth**

Assert no source maps/drafts/reports/docs in `dist`, `no-store` for API, revalidation for mutable HTML, and `immutable` only for content-hashed assets.

- [ ] **Step 2: Do not mark stable filenames immutable**

Either add content hashing first or retain revalidation/stale-while-revalidate.

- [ ] **Step 3: Inventory CSP dependencies**

Recompute theme bootstrap hash when changed. Remove avoidable inline styles only if output remains identical. Add reporting only when an approved receiver exists.

- [ ] **Step 4: Bound Last.fm behavior**

If retained: restrict/document key, timeout, quiet failure, no blocking and privacy disclosure. If restriction is insufficient, remove live fetching and keep a static listening link/state.

- [ ] **Step 5: Verify preview headers, audit and commit**

Use `curl -I` on HTML, CSS, assets and API; run `npm audit --audit-level=moderate && npm test`.

```bash
git add vercel.json netlify.toml scripts/build-site.mjs scripts/site-integrity.test.mjs privacy.html js/render/now-playing.js
git commit -m "chore: harden portfolio deployment boundary"
```

---

### Task 14: Preview review and controlled release

**Files:**
- Create: `reports/release/portfolio-prd-release-evidence.md`
- Modify only files required by verified final-QA defects.

**Interfaces:**
- Produces: preview URL, evidence report and approved commit SHA.
- Never merges without explicit owner approval.

- [ ] **Step 1: Establish a clean release candidate**

```bash
git status --short
git log --oneline --decorate -15
npm ci
npm run quality
git diff --check
```

- [ ] **Step 2: Complete the manual browser/device matrix**

Latest Chrome/Safari/Firefox/Edge; current iOS Safari/Android Chrome; both themes; keyboard/touch/pointer; reduced motion; forced colours; 200% zoom; text spacing; Save-Data; no JS.

- [ ] **Step 3: Review motion with fresh eyes**

Inspect Index, swatches, button feedback, case reveals and marquee at normal speed and 25%. Confirm purpose, transform origin, asymmetric timing and absence of decorative delay; repeat next day.

- [ ] **Step 4: Deploy a Vercel preview**

Use preview-only contact/rate-limit credentials. Safely verify 202, 422, 429 and provider-unavailable paths without logging content.

- [ ] **Step 5: Write exact release evidence**

Record SHA, URL, commands/results, browser matrix, Web Vitals, bundle/media sizes, accessibility findings, headers, supplied/withheld content and known omissions.

- [ ] **Step 6: Conduct visual-preservation review**

Compare existing routes against `54dcc41`; review new routes for continuity. Any proof-sheet skin, generic cards, increased density or new visual system blocks release.

- [ ] **Step 7: Present the preview for explicit approval**

Summarise material structural changes, omissions and evidence. A green deployment is not approval.

- [ ] **Step 8: Fix only verified defects**

Add a regression test, make the smallest fix, rerun the affected gate and update evidence. Do not expand scope.

- [ ] **Step 9: Commit evidence**

```bash
git add reports/release/portfolio-prd-release-evidence.md
git commit -m "docs: record portfolio release evidence"
```

- [ ] **Step 10: Merge only after approval**

Use `superpowers:finishing-a-development-branch`; preserve user-owned changes. Verify production SHA, priority routes, contact, headers and assets once after deployment.

---

## Traceability

| PRD requirement | Tasks |
| --- | --- |
| Preserve restored visual character | 1, 11, 12, 14 |
| Published TEDx flagship | 2, 5, 6 |
| Proof before biography | 5 |
| Explorations and Community | 3 |
| Complete Index | 4 |
| CV, experience and services | 7 |
| Operable client loop | 10 |
| Contact and privacy | 8, 9, 13 |
| Validated content domains | 2 |
| Accessibility/no-JS resilience | 3–12 |
| Performance budgets | 11, 12 |
| Security/output hygiene | 8, 12, 13 |
| Preview approval gate | 14 |

## Execution Order

Tasks 1–5 are sequential. After Task 5, Task 6 (case study), Task 7 (professional evidence) and Task 8 (backend) may run in parallel if file ownership remains isolated. Task 9 depends on Task 8. Task 10 follows Task 5. Task 11 follows feature styling. Tasks 12–14 are sequential release gates.

Recommended ownership:

- Frontend/design-engineering: Tasks 3–7 and 9–11.
- Backend/platform: Tasks 8 and 13.
- QA/release: Tasks 1, 2, 12 and 14.

Every worker must read the PRD, local specification, Global Constraints and assigned files before editing. A task is complete only after its named verification passes and its commit exists.
