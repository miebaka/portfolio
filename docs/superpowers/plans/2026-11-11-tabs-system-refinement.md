# Tabs Design-System Portfolio Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Tabs typography and button scales, then resolve portfolio card alignment, project covers, theme-control clarity, navigation state, opening whitespace, and card-entry motion across every route.

**Architecture:** Keep the static data-render-module architecture. Centralise typography, control, spacing, and motion values in `styles/foundations.css`; keep shared component behaviour in the existing render/core modules; use project data for explicit cover focal points rather than page-specific CSS exceptions.

**Tech Stack:** Static HTML, CSS custom properties, vanilla ES modules, Node test runner, Playwright, esbuild.

**Spec:** `docs/superpowers/specs/2026-11-11-tabs-system-refinement-design.md`

## Global Constraints

- Preserve all existing routes, project content, themes, data-render boundaries, and progressive enhancement.
- OGARANYA is exclusive to display and heading tokens; Atkinson Hyperlegible Next is used for every other text role.
- Copy the audited Tabs token metrics exactly; map colour variants to existing portfolio semantic colours.
- Do not add a runtime dependency for intersection reveal or navigation-indicator motion.
- Every behaviour must remain usable with reduced motion, forced colours, 200% zoom, and JavaScript disabled.
- Use existing project imagery; do not invent or generate replacement artwork.

## Review Focus

- A font failure must fall back without layout collapse or invisible text.
- A long title must wrap inside the shared 48px card inset without overflow or a second left edge.
- A cover focal point must remain intentional at mobile and desktop widths without clipping authored text.
- Print/Screen and active navigation must remain understandable in forced-colour and reduced-motion modes.
- Cards must never remain hidden when IntersectionObserver is absent, JavaScript is disabled, or motion is reduced.

---

### Task 1: Establish the audited typography and button token contract

**Files:**
- Modify: `styles/foundations.css`
- Modify: `tests/fixtures/visual-contract.json`
- Modify: `scripts/visual-contract.test.mjs`
- Modify: `scripts/check-css-contract.mjs`
- Add: `assets/fonts/AtkinsonHyperlegibleNext-Regular.woff2`
- Add: `assets/fonts/AtkinsonHyperlegibleNext-Medium.woff2`
- Add: `assets/fonts/AtkinsonHyperlegibleNext-SemiBold.woff2`
- Add: `assets/fonts/AtkinsonHyperlegibleNext-OFL.txt`

**Interfaces:**
- Consumes: existing semantic colour, motion, and spacing custom properties.
- Produces: `--type-display-1` through `--type-action-xl`, `--font-display`, `--font-interface`, `--button-*`, and semantic button variant tokens.

- [ ] Write failing visual-contract assertions for all audited token values, only two authored font families, local Atkinson files, button dimensions, variants, and disabled state.
- [ ] Run `npm run test:contract`; expect failures for missing Atkinson and new token names.
- [ ] Add local Atkinson files and implement the exact typography/button custom-property contract in `styles/foundations.css`; remove Google Sans Flex and Josefin Sans font roles and faces.
- [ ] Update global heading/body/control rules to consume the new roles without changing document semantics.
- [ ] Run `npm run test:contract && npm run test:css`; expect both to pass.
- [ ] Commit: `feat: adopt tabs typography and button tokens`.

### Task 2: Apply consistent project-card geometry and composed covers

**Files:**
- Modify: `data/projects.js`
- Modify: `js/render/projects.js`
- Modify: `styles/components-v4.css`
- Modify: `styles/pages-v4.css`
- Modify: `tests/content-schema.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: Task 1 typography tokens and existing project image sources.
- Produces: optional project `coverPosition: { desktop: string, mobile: string }`, shared `.project-card__content`, and fixed-ratio `.project-card__cover`.

- [ ] Write failing schema/renderer tests for escaped focal-position data and Playwright tests asserting one shared content inset, one cover ratio, aligned title/description/year, long-title containment, and intact visible cover text.
- [ ] Run `npm run test:content && npm run test:e2e -- --grep "project card|project cover"`; expect failures on missing cover contract.
- [ ] Add focal positions for TEDx, Rivo, and Chop Box using the strongest existing image for each project.
- [ ] Render one semantic cover per project and group title, divider, description, and year inside one content wrapper.
- [ ] Set `--project-card-padding: 48px` on wide screens with a responsive smaller value; remove competing title-only offsets and collage overflow.
- [ ] Run focused tests at desktop and mobile widths; expect alignment, cover, and overflow assertions to pass.
- [ ] Commit: `fix: unify project cards and cover composition`.

### Task 3: Clarify the Print/Screen preference control

**Files:**
- Modify: `js/render/navigation.js`
- Modify: `js/core/theme-pull-cord.js`
- Modify: `styles/components-v4.css`
- Modify: `tests/navigation.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: existing `color-theme` persistence and semantic control tokens.
- Produces: a labelled two-state switch with `aria-checked`, visible Print/Screen labels, selected state, and unchanged storage key.

- [ ] Write failing unit/E2E tests for visible labels, selected-state class, accessible name, keyboard activation, persistence, forced colours, and 44px target size.
- [ ] Run `npm run test:navigation && npm run test:e2e -- --grep "Print|Screen"`; expect the new semantics to fail.
- [ ] Update renderer and controller while preserving the existing theme persistence contract.
- [ ] Style the control as an unmistakable segmented two-state switch using Task 1 button/action tokens.
- [ ] Run focused unit/E2E tests; expect both themes and keyboard behaviour to pass.
- [ ] Commit: `fix: clarify print and screen control`.

### Task 4: Strengthen active navigation and indicator motion

**Files:**
- Modify: `js/render/navigation.js`
- Modify: `js/core/navigation.js`
- Modify: `styles/components-v4.css`
- Modify: `tests/navigation.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: current-route resolution and reduced-motion preference.
- Produces: `aria-current="page"`, `.nav-indicator`, pointer/focus target movement, and immediate reduced-motion state.

- [ ] Write failing tests for exactly one current link on every primary route, visible indicator placement, hover/focus movement, focus return, forced colours, and reduced-motion transition removal.
- [ ] Run navigation and focused E2E tests; expect indicator assertions to fail.
- [ ] Render the indicator once per navigation surface and move it using measured link bounds without changing navigation order.
- [ ] Add underline/dot fallback styles that remain visible before JavaScript and in forced colours.
- [ ] Run focused tests across desktop and mobile navigation.
- [ ] Commit: `feat: add clear active navigation state`.

### Task 5: Tighten the work-page fold and add restrained card reveals

**Files:**
- Modify: `js/core/editorial-reveals.js`
- Modify: `js/main.js`
- Modify: `styles/pages-v4.css`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: project-card markup from Task 2 and existing motion preference.
- Produces: `initProjectCardReveals(root = document)`, once-only IntersectionObserver enhancement, and `.is-revealed`.

- [ ] Write failing Playwright tests asserting the first project intersects a 1440×768 initial viewport; cards start with the enhanced reveal state only after JS initialises; cards resolve to opacity 1, blur 0, and transform none; reduced-motion and no-JS cards are immediately visible.
- [ ] Run `npm run test:e2e -- --grep "fold|reveal"`; expect failures.
- [ ] Reduce only the work-index heading-to-first-card spacing until the first card is visible at 768px height without crowding the heading.
- [ ] Implement `initProjectCardReveals(root = document)` with IntersectionObserver, a 6px offset, 6px blur, once-only reveal, and safe feature detection.
- [ ] Add reduced-motion CSS that removes blur, offset, and transition.
- [ ] Run focused E2E tests at desktop, tablet, and 390px mobile widths.
- [ ] Commit: `feat: reveal work cards on entry`.

### Task 6: Full-route regression, visual inspection, and documentation

**Files:**
- Modify: `DESIGN.md`
- Modify: `CHANGELOG.md`
- Modify: `tests/e2e/portfolio.spec.mjs` only if a regression discovered here needs a test-first fix.

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: documented system contract and verified release candidate.

- [ ] Run `npm test`; require zero failures and report any unrelated pre-existing failure by name.
- [ ] Run `npm run test:e2e`; require all desktop/mobile, accessibility, no-JS, theme, cover, and motion tests to pass.
- [ ] Run `npm run test:budgets && npm run build && npm run docs:check`.
- [ ] Inspect every generated HTML route at 390×844, 768×1024, 1440×900, and 1920×1080; check hierarchy, left edges, first fold, cover crops, focus, both themes, and console errors.
- [ ] Update `DESIGN.md` and `CHANGELOG.md` with the final token roles, controls, cover rule, and motion rule.
- [ ] Re-run the complete verification commands after documentation and any test-first corrections.
- [ ] Commit: `docs: record portfolio system refinement`.
