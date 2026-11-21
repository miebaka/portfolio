# Work Filing Cabinet — V2 Implementation Plan

**Status:** Approved-for-planning, not yet implemented. This is the engineering roadmap for [Filing Cabinet V2](./work-filing-cabinet-concept.md).
**Baseline:** \`main\` after the V2 document replacement, 21 November 2026.
**Scope:** \`work.html\`, Work archive rendering, page-scoped CSS/JS, and a small matching arrival treatment on published case-study pages. Preserve all existing project URLs, case content, the rest of the portfolio, and the homepage Projects roster.

## 1. Creative objective and non-negotiables

**Governing thought: the drawer is the system.** The cabinet makes the designer's ability to produce a coherent, retrievable brand system visible through its own construction: three tab cuts, one numbering convention, one register plate, honest year separators, strict type roles and restrained physical behaviour.

Success requires the visitor to understand "filing cabinet" within two seconds, locate the available case studies without guessing, and open one with a single click or tap. A beautiful illusion that makes retrieval harder is a failed interface.

**Approved visual direction:** V2's B-plus: an orthographic, precision-built drawer with a warm paper finish, graphite/ink frame, ultramarine register plate and coral interaction accents. No forced 3D camera, exaggerated perspective, background video, sound, cursor lighting, or parallax. Keep Geist Sans for display and Geist Mono for labels using existing \`--display\` and \`--label\` tokens.

## 2. Source-of-truth corrections before design

The current \`data/projects.js\` establishes the actual published case order:

| File number | Published case | Year | Route | Type |
| --- | --- | --- | --- | --- |
| 01 | Rivo Studio | 2024 | \`work/rivo.html\` | Software studio |
| 02 | TEDx Rivers State University | 2023 | \`work/tedx-rsu.html\` | Event |
| 03 | ChopBox | 2022 | \`work/chopbox.html\` | Food brand |

**Do not use V2's illustrative \`CHOPBOX 2026\` or 2024/2025/2026 divider sequence.** Those dates contradict the content. Initial year dividers should be **2024, 2023, 2022**, generated from the published cases. "No. 02 / 07" must not count structural dividers as case files; use \`NO. 02 / 03\` if numbering published cases, with the correct project/year.

Coming-soon entries currently include Poster A Week (2024), Kiki-Joshua (2022), and Kigoma Hotels (2021). A coming-soon record is **not** evidence of publication within the next quarter. **Default to zero sealed folders in the first prototype** unless completion targets are confirmed and the data includes a public-safe, current preparation status. Do not use unrelated essays, older year dividers, or fabricated projects to thicken the drawer. Three cases and three truthful year dividers are a defensible six-band starting point. Perceived depth can come from paper edges and staggered tabs, not fake content. The in-progress projects can remain in a clearly labelled, non-clickable section outside the drawer.

**Existing fallback mismatch:** the checked-in `work.html` currently lists Detour and Out Of Office (both 2026) under In progress, while the data-driven `renderProjectArchiveMarkup()` derives Poster A Week, Kiki-Joshua and Kigoma Hotels. That means the source HTML and generated page are not the same without JS. PR A must reconcile them and test the actual source/no-JS document as well as the built output; the cabinet cannot depend on client-side replacement for truthful content.

For each live folder, **short tab = actual project title** and **revealed lip = category/year plus a concise case-specific governing decision** already supported by the case-study data. Avoid inventing separate case-study titles. On narrow screens, use wrapping or an explicit two-line lip rather than truncating the essential name to 48 characters.

## 3. Interaction state model

| State | Input | Behaviour | Required fallback |
| --- | --- | --- | --- |
| Rest | Initial load | All case labels visible on three staggered tab cuts; full cabinet readable without JavaScript | Native HTML/CSS |
| Read | Page scroll | One case nearest the 40% viewing axis updates the stationary register without animation; all tabs remain legible | All tab labels remain visible |
| Lift | Fine-pointer hover | Inner folder face translates -20px in 160ms; its lip appears and a pre-rendered shadow fades in | Static wrapper keeps hit target stable |
| Lift | Tab focus | Immediate, non-animated reveal with a 2px coral focus ring visible outside clipping | Native keyboard focus |
| Lift | Touch reading axis | Visible lip for the active folder; **one tap** opens it | Native link |
| Extract | Primary pointer click / tap | Pull face, dim drawer once, expand fixed paper sheet and navigate within a strict total <450ms | Navigate if any animation or JS operation fails |
| Open | Modifier/middle click, keyboard Enter, reduced motion | Standard browser link semantics, no interception or delayed travel | Native link |
| Return | Browser Back | Restore selected case's scroll and focus only on an actual return; clear overlays on \`pageshow\`/bfcache | Native scroll restoration |

**Critical details:**
- The hit target is an unmoving **anchor wrapper**; only its inner visual face is transformed. V2's sample uses \`<a class="folder__face">\`; the production component must separate link target from moving face to prevent hover flicker.
- Do not dim non-current folders below WCAG AA contrast.
- Scroll should disable pointer hover until 140ms after activity ends; keep keyboard focus active throughout. Use a timer with scroll events scoped to Work and clear it on pagehide.
- Let document scroll stay native. Prototype the stationary frame and register as **CSS sticky decoration** over normally flowing folder bands. Avoid an independent inner scrollbox unless testing proves it has no wheel trap, hidden focus or double-scroll problems.
- The reading-axis observer's \`rootMargin: "-40% 0px -59% 0px"\` produces an extremely narrow intersection band. Use \`IntersectionObserver\` as the first signal, but resolve the closest tab to 40% viewport height on scroll/resize in one \`requestAnimationFrame\` callback if no tab intersects. Never update the register every frame.
- Desktop focus changes and keyboard activation are never animated. Reduced-motion navigation is immediate, not an opacity delay that blocks the link.

## 4. Architecture mapped to the existing repository

### Content and static output
- \`data/projects.js\` is the authoritative project/year/status source. Keep the current status model. If sealed items are later approved, add an explicit display policy rather than assuming every \`coming-soon\` item is a sealed folder.
- \`js/render/projects.js\`: add a small pure \`renderFilingCabinetMarkup(projects, caseStudies, base)\` that derives published cases, orders by descending actual year, and emits one semantic \`<ol>\`. Have the existing \`renderProjectArchiveMarkup\` call the new renderer or keep an adapter for compatibility; do not fork publication logic into browser-side code.
- \`work.html\`: replace only the current \`project-archive\` section and its checked-in no-JS fallback with real folder and divider markup. Keep skip link, global navigation, footer, and links to Experiments and Essays outside the cabinet.
- \`scripts/build-site.mjs\`: prerender the exact same cabinet markup into \`dist/work.html\` as the live site currently prerenders the archive. A missing JS module must not produce an empty drawer. Do not modify \`work/[slug].html\` routes.
- \`js/core/contract.js\`: reuse \`[data-project-archive]\` if appropriate; only add a mount constant if an actual new mount is needed. Avoid duplicate state or single-use generic framework abstractions.

### Presentation
- Create \`styles/work-cabinet.css\`, scoped to \`body[data-page="work"]\`; import after existing Work styles in \`styles/main.css\`. Retire or cleanly supersede obsolete Work archive rules in \`styles/pages-v4.css\` rather than leaving conflicting selectors indefinitely. Update the CSS import-count contract as part of the change.
- Build the cabinet frame with CSS borders, gradients, one ambient top light and pseudo-element edge shadows; no image textures in the first pass. Cycle three subtly varied **existing token-derived** stocks. Responsive label typography: Geist Mono \`var(--label)\`, Geist Sans \`var(--display)\`; uppercase metadata, numeric tabular figures, strong contrast.
- Stagger A/B/C cut positions in DOM order. Use about 56px visible folder height on wide screens and at least 64px on phones, while **targets remain >=44px** and grow to fit zoomed text. Honor bottom safe-area insets and the fixed site navigation. Keep the register from covering focused tabs and the footer.
- Use \`:hover\` only in fine-pointer media queries, \`:focus-visible\` for keyboard, and \`data-reading\` for touch. Every folder has a visible static label without hover or JS.
- Create a **small page-scoped** transition opt-in stylesheet for \`work.html\` and published case-study pages. \`@view-transition { navigation: auto; }\` applies to a document, not to a \`body\` selector: do not add it blindly to the globally bundled CSS or it will affect the entire portfolio. Keep normal pages at one CSS request; document the intentional extra scoped resource if required by the existing build pipeline.
- The current \`styles/pages-v4.css\` already assigns image-based \`view-transition-name\` values to archive previews and case heroes. Remove or scope out their old Work-page mapping before introducing the new paper handoff; never give competing elements the same transition name.

### Behavior
- Create \`js/core/work-cabinet.js\`, imported **only on \`body[data-page="work"]\`** after the static DOM exists. It manages reading-axis selection, scroll/hover suppression, extraction, session restoration, and \`pageshow\` cleanup. Use native WAAPI for this short isolated sequence; no GSAP dependency is necessary.
- \`js/core/scroll-experience.js\` currently enables Lenis across eligible desktop pages. Explicitly **exclude \`body[data-page="work"]\`** (including the \`?motion-test\` path) so V2's native-scroll reading and restoration work correctly. Preserve Lenis and GSAP on other pages.
- Use a single \`aria-hidden\`, noninteractive fixed sheet and dim layer only while extracting; animate \`transform\`, \`opacity\`, and the paper \`clip-path\` as V2 specifies. Keep any clip-path animation isolated and measure mid-range hardware. Do not continuously animate box shadows or all folders.
- Intercept only an unmodified primary-pointer activation on a real published case link. Detect keyboard-generated clicks and let them navigate immediately. Preserve open-in-new-tab, middle-click, copy link, direct URL, and disabled JavaScript.
- Use \`animation.finished\` with an immediate \`catch\`/cancel fallback and a maximum navigation deadline below 450ms. Never wait for arbitrary network requests, page-transition events, or a large package to load before following the link.
- Store only the source slug and the relevant drawer scroll coordinate in \`sessionStorage\` when extracting. On Back, prefer browser-managed scroll restoration, then restore focus with \`preventScroll\` only if needed. Clear interrupted sheets and pending state on bfcache \`pageshow\`.
- Add a small case-page arrival controller scoped to published \`body[data-case]\`: it reads an opt-in origin marker, then animates up to four opening elements with the prescribed 40ms stagger and 240ms duration **only if appropriate**. Do not replay it for ordinary direct case visits and never hide the content until the script loads.

## 5. Build order: three reviewable stages

### PR A — Static drawer + data integrity (foundation)
1. Add exact published-case ordering and folder registration labels derived from \`data/projects.js\`.
2. Implement the pure renderer, dividers, and cabinet structure.
3. Replace the authored no-JS \`work.html\` fallback and generated \`dist/work.html\`.
4. Add B-plus CSS with static visible labels, 44px targets, keyboard focus, sticky frame/register, and mobile overhead composition.
5. Keep unverified coming-soon cases outside the active drawer.
6. Deliver desktop and mobile screenshots, including 200% zoom and no-JS states.

**Gate:** Work reads instantly as a filing cabinet; all three published routes work with JavaScript disabled; every label, year, and divider is truthful. Do not proceed if the cabinet is only recognisable during interaction.

### PR B — Read, lift, return (interaction)
1. Native scroll-only on Work; disable Lenis for the archive.
2. Add deterministic reading-axis observer/fallback and instantly updated register.
3. Add pointer-stable lift, non-animated focus, touch axis lip, and scroll-hover suppression.
4. Add \`pageshow\`/bfcache reset, scroll restoration, and context-appropriate focus restoration.
5. Test rapid hover transitions, slow/fast scroll, zoom, reduced motion, and Back.

**Gate:** No hover flicker, double-scroll, layout shift, invisible focus ring or stale active folder; keyboard and touch never require a preview tap.

### PR C — Extract and case-page arrival (polish)
1. Add bounded WAAPI extraction with one sheet and one dimming layer, and a hard navigation fallback.
2. Add matching destination-page paper colour per theme and page-scoped cross-document CSS opt-in.
3. Add a small arrival treatment on the case-study opening; preserve direct-load and reduced-motion cases.
4. Remove conflicting old archive-to-image transition names and obsolete selectors.
5. Exercise link modifiers, keyboard Enter, page-history journeys, bfcache, interrupted animations, and slow network.

**Gate:** Extraction remains under 450ms where animated, while every other navigation path remains a native link. A failed animation cannot block the case study.

## 6. Test files and contract adjustments

Existing tests to deliberately adapt, not delete:
- \`tests/e2e/portfolio.spec.mjs\`: old selectors such as \`.project-archive__item\`, \`.project-archive__media\`, the progress list, and reciprocal-hover expectations must become cabinet-specific checks. Keep existing Work-to-case journeys and accessibility assertions.
- \`tests/e2e/editorial-index.spec.mjs\`: Work will no longer use the shared \`.editorial-index--archive\` presentation. Preserve the Home and Essays editorial index tests while replacing Work's expectation with a dedicated cabinet contract.
- \`scripts/site-integrity.test.mjs\`, \`scripts/visual-contract.test.mjs\`, \`scripts/check-css-contract.mjs\`: update hard-coded archive or stylesheet assumptions to accurately reflect the new page; do not loosen unrelated assertions.
- \`tests/content-schema.test.mjs\`: verify that new folder numbering, true years, safe destinations and sealed-folder eligibility are derived from public-safe content.

Add \`tests/e2e/work-cabinet.spec.mjs\` for the following:
- Published cases in order: **Rivo 2024, TEDx 2023, ChopBox 2022**; correct 2024/2023/2022 dividers.
- Work title and every project label readable without JS; no duplicate title announced by the register; no sealed folder masquerades as a link.
- Pointer lift remains stable when entering/exiting a folder and scrolling under a stationary pointer.
- Register tracks viewport reading axis, updates without a visual tween, and does not obscure content.
- Keyboard Tab reveals instantly; Enter takes a real link; touch opens with one tap.
- Modified click, middle-click and context menu retain native browser actions.
- Extract success, interrupted/rejected animation fallback, direct case navigation, browser Back and bfcache reset.
- Motion preferences: system and site reduce; no travel and no navigation delay.
- 320px, 390px, 768px, 1440px, 200% zoom and text spacing; no horizontal overflow.
- Focus visibility, semantic links, WCAG text 4.5:1, focus indicator 3:1, and no serious Axe findings.
- Browser matrix: Chromium, WebKit/Safari and Firefox where available; use real mid-range Android testing to validate the **60fps target** rather than reporting desktop simulation as phone hardware proof.

Run \`npm run quality\` on Node 24 and preserve existing production CSS/JS/Lighthouse budgets. Require a **passing commit-specific CI run** for each merge; inspect actual screenshots/traces, not only green unit tests.

## 7. Risks, trade-offs, and release controls

1. **Perceived density vs honesty:** Six real bands may feel short. Tune the physical cabinet depth and composition before introducing additional sealed folders. Never falsify work history.
2. **Scroll mechanics:** A nested scrolling drawer looks easy but can trap wheel/keyboard focus and fight navigation. Prefer page scroll plus sticky noninteractive furniture; prototype both only if the visual demands it.
3. **Cross-document view transition fragility:** Both documents must opt in, but browsers may skip the transition. Treat CSS as polish, never a navigation requirement. See [Chrome guidance](https://developer.chrome.com/docs/web-platform/view-transitions/cross-document) and [MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).
4. **Existing theme:** \`--paper\` changes by theme. Derive the animated sheet and case-page first-paint background from the current theme so dark mode does not flash white.
5. **Global CSS and motion conflicts:** Existing Work selectors are substantial; replace them deliberately. Avoid reusing the homepage \`project-roster\` animation or starting another perpetual loop.
6. **Recruiter usability:** Keep project names visible; an animation may delight for a moment, but retrieval and proof of work must remain immediate.
7. **Rollback:** Keep the original archival renderer in Git history and feature PRs until the full Work replacement passes its gates. No case-study URL changes.

## 8. Decisions and practical defaults

These are decisions for production—not blockers to beginning the static prototype:

- **Art direction:** B-plus as chosen in V2. Do not reopen the A/B decision without a new objection.
- **Live folders:** The three real published cases only.
- **Sealed folders:** None initially. Add later only with a confirmed, publicly safe completion window; do not infer schedule from \`coming-soon\`.
- **Lip copy:** Existing project title, real category and year, plus a short, verified case decision—not invented headlines.
- **Scope:** Work page plus a narrowly scoped arrival include on case-study pages, without changing case content or URLs.
- **Drawer length:** Let truthful content define it. No blank bands designed only to force extra scrolling.
- **Go/no-go:** Begin with **PR A**. Do not ship the visual cabinet without the Read, Lift, Extract, Return, no-JS and reduced-motion guarantees; continue through PR C before declaring the redesign complete.
