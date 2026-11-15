# Engineered Complexity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's personality and visual system around warm, engineered complexity while preserving truthful evidence, accessibility, performance and the static-site architecture.

**Architecture:** Extend the current token and static-rendering system instead of introducing a framework. Ship the redesign in independent vertical slices: foundations and contracts, homepage pilot, About/secondary journeys, case-study evidence components, then global verification.

**Tech Stack:** Static HTML, CSS custom properties, ES modules, Node test runner, Playwright, Stylelint, HTMLHint.

**Spec:** `docs/superpowers/specs/2026-11-15-engineered-complexity-design.md`

## Global Constraints

- The Takaosan interchange is a structural metaphor, not a recurring visual theme.
- Use no new client framework or animation dependency.
- Keep complete HTML fallbacks and progressive enhancement.
- Do not invent outcomes, leadership scope or project reasoning.
- Preserve project-owned colour inside case studies.
- Meet WCAG 2.2 AA and respect `prefers-reduced-motion`.
- Use the approved headline and core colour values exactly.
- Do not ship an unlicensed Takaosan photograph; use an original abstract route study until rights are verified.

## Review Focus

- JavaScript disabled: navigation, homepage thesis, practice sequence, work evidence and contact paths remain complete.
- Reduced motion: route and reveal components remain clear without transitions.
- 320px viewport: no clipped route geometry, horizontal overflow or unreadable labels.
- Dark theme: warm text and burgundy accents retain AA contrast.
- Missing project evidence: the UI omits unsupported fields instead of rendering empty or invented claims.

---

### Task 1: Foundation tokens and visual contracts

**Files:**
- Modify: `styles/foundations.css`
- Create: `styles/engineered-complexity.css`
- Modify: `styles/main.css`
- Modify: `scripts/check-css-contract.mjs`
- Modify: `scripts/visual-contract.test.mjs`

**Interfaces:**
- Consumes: existing semantic colour and motion tokens.
- Produces: `--ec-*` palette, route primitives, warm surface roles and reduced-motion contract.

- [ ] Add failing contract assertions for the approved token values, the new stylesheet import and a reduced-motion rule.
- [ ] Run `npm run test:css && npm run test:contract`; confirm failure identifies the missing engineered-complexity contract.
- [ ] Add the exact core tokens and semantic aliases to `foundations.css`.
- [ ] Add focused route, junction, annotation and warm-surface primitives to `engineered-complexity.css`.
- [ ] Import the new stylesheet after existing v4 page styles so changes remain isolated and removable.
- [ ] Run `npm run lint:css && npm run test:css && npm run test:contract`; expect PASS.
- [ ] Commit with `feat: add engineered complexity foundations`.

### Task 2: Homepage personality pilot

**Files:**
- Modify: `index.html`
- Modify: `styles/engineered-complexity.css`
- Modify: `tests/professional-evidence.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: Task 1 tokens and route primitives.
- Produces: `.ec-thesis`, `.ec-practice-route`, evidence-first work preview markup and new homepage copy.

- [ ] Add tests asserting the approved hero headline, thesis heading, five practice stages and complete non-JS fallback content.
- [ ] Add an E2E assertion that the thesis precedes selected work, the page has no horizontal overflow at 320px and reduced motion disables route transitions.
- [ ] Run the targeted tests; confirm they fail on missing content.
- [ ] Rewrite the hero with the approved positioning and evidence line.
- [ ] Add the thesis section using an original inline SVG route study; mark the SVG decorative and keep the thesis text semantic.
- [ ] Restructure “How I work” as Question → Decide → Design → Test → Equip with an ordered-list fallback.
- [ ] Add the interdisciplinary profile paragraph and “Bring me the complicated part” closing.
- [ ] Style desktop/mobile compositions without hiding essential text behind interaction.
- [ ] Run `npm run lint && npm run test:professional && npm run test:e2e -- --grep "homepage|mobile|reduced motion"`; expect PASS.
- [ ] Commit with `feat: introduce engineered complexity homepage`.

### Task 3: About page as an interconnected practice

**Files:**
- Modify: `about.html`
- Modify: `styles/engineered-complexity.css`
- Modify: `tests/professional-evidence.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: Task 1 route and annotation primitives.
- Produces: `.ec-practice-history`, `.ec-interest-thread` and four evidence-linked working principles.

- [ ] Add tests for the approved opening, shaped-practice milestones, four principles and privacy-safe interests.
- [ ] Run targeted tests; confirm failure.
- [ ] Replace the About opening with the approved long-route statement.
- [ ] Add a semantic timeline connecting environmental study, design, marketing, production, leadership and tool-building.
- [ ] Add the fourth principle “Let the system handle repetition” and keep each principle evidence-bounded.
- [ ] Add a short “Away from the file” section using specific interests without private context.
- [ ] Verify timeline order and readability at 320px and 1800px.
- [ ] Run `npm run test:professional && npm run test:e2e -- --grep "about"`; expect PASS.
- [ ] Commit with `feat: connect the paths behind the practice`.

### Task 4: Decision-led project model

**Files:**
- Modify: `data/case-studies.js`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/content-schema.test.mjs`
- Modify: `js/render/work.js` or the current project-rendering module discovered in the repository
- Modify: `work.html`
- Modify: `styles/engineered-complexity.css`

**Interfaces:**
- Consumes: current case-study schema and documented evidence inventory.
- Produces optional `problem`, `governingDecision`, `contribution`, `evidenceStatus` and `paths` fields plus safe render omission.

- [ ] Locate the canonical renderer and record its exact path before editing.
- [ ] Add schema tests for valid values, omission of optional fields and rejection of empty published evidence.
- [ ] Run `npm run test:content`; confirm failure.
- [ ] Extend validation with the exact optional field contracts.
- [ ] Populate only facts already supported by published case content or the evidence inventory.
- [ ] Render problem, decision, role and evidence on published project previews; omit missing fields without empty labels.
- [ ] Add path labels only where at least two published projects support a path.
- [ ] Run `npm run test:content && npm run test:case && npm run test:professional`; expect PASS.
- [ ] Commit with `feat: make project decisions visible`.

### Task 5: Case-study route and reflection components

**Files:**
- Modify: canonical case-study renderer discovered in Task 4
- Modify: `styles/engineered-complexity.css`
- Modify: `tests/case-study.test.mjs`
- Modify: flagship files under `work/*.html` only when static fallbacks require synchronization

**Interfaces:**
- Consumes: Task 4 project fields.
- Produces: `.ec-decision-map`, `.ec-reflection-pair` and contextual next-route links.

- [ ] Add tests that decision maps render only from real fields and that incomplete reflections are omitted.
- [ ] Add keyboard/current-state tests for case chapter navigation.
- [ ] Run `npm run test:case`; confirm failure.
- [ ] Render Signal/Interpretation only when documented; always render the factual Problem → Decision → System → Application subset available.
- [ ] Add “What I would protect” and “What I would improve” only to cases with source-backed content.
- [ ] Align chapter navigation with route styling without changing its semantic controls.
- [ ] Add one recommended next project and one alternate content path.
- [ ] Run `npm run test:case && npm run test:navigation && npm run test:e2e -- --grep "case study"`; expect PASS.
- [ ] Commit with `feat: add decision-led case study routes`.

### Task 6: Notes, experiments and contact continuity

**Files:**
- Modify: `notes.html`
- Modify: `explorations.html`
- Modify: `contact.html`
- Modify: relevant data/render modules discovered for these mounts
- Modify: `styles/engineered-complexity.css`
- Modify: `tests/navigation.test.mjs`
- Modify: `tests/e2e/portfolio.spec.mjs`

**Interfaces:**
- Consumes: global route primitives.
- Produces: thematic note paths, experiment-learning context and decisive contact close.

- [ ] Add tests for the four note paths, experiment introduction, complete fallback navigation and contact action hierarchy.
- [ ] Run targeted tests; confirm failure.
- [ ] Group Notes into Design decisions, Creative leadership, Systems and tools, and Looking closely without fabricating entries.
- [ ] Add the approved experiments introduction and optional learning metadata.
- [ ] Rewrite contact framing around fit, thought and follow-through while preserving form behaviour.
- [ ] Add contextual “take another route” links with ordinary-link fallbacks.
- [ ] Run `npm run test:navigation && npm run test:contact-form && npm run test:e2e -- --grep "notes|experiments|contact"`; expect PASS.
- [ ] Commit with `feat: connect secondary portfolio journeys`.

### Task 7: Full verification and release evidence

**Files:**
- Modify: `DESIGN.md`
- Modify: `docs/design-system-v3.md`
- Modify: `CHANGELOG.md`
- Modify: `VERSION` only if repository release policy requires it

**Interfaces:**
- Consumes: all prior tasks.
- Produces: current documentation and verified release candidate.

- [ ] Update the design-system source of truth with the governing idea, approved tokens, metaphor limits and component contracts.
- [ ] Run `npm run docs:check` and resolve only documentation drift introduced by this branch.
- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run test:e2e`.
- [ ] Run `npm run test:a11y`.
- [ ] Run `npm run test:budgets`.
- [ ] Run `npm run test:lighthouse`.
- [ ] Run `npm run audit:shipped`.
- [ ] Review desktop, 320px mobile, keyboard-only, dark theme, reduced-motion and JavaScript-disabled journeys.
- [ ] Confirm no unlicensed Takaosan photograph is present and no private shared-chat content is exposed.
- [ ] Record results in the pull request and commit with `docs: record engineered complexity system`.
