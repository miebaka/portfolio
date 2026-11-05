# Portfolio audit — Phase 0–2

Baseline commit: `444e12f9dd3fbcbff690a705787c00535f189e10`  
Audit date: 2026-11-06 (Africa/Lagos)  
Target: convince a creative director or hiring manager within 90 seconds.

## Executive summary

1. The site has strong authored work and honest evidence boundaries, but mobile removes the client-logo proof and several case galleries show blank visual regions.
2. Information architecture conflicts with the requested hiring-oriented model: Experiments/Notes remain, Community is a redirect, and no Writing index or Community destination exists.
3. The current static build is the right stack, but duplicated HTML shells plus regex replacement keep head/header/footer drift alive.
4. Mobile performance misses the target on every route; measured LCP ranges from 2.73s to 11.61s and Home TBT is 371ms.
5. The design system is partly tokenized but fails the requested contract: 51 raw hex, 180 raw px, 89 raw ms and 22 `!important` occurrences remain.
6. Highest leverage: repair mobile proof/gallery rendering before visual polish.
7. Replace duplicated shells with deterministic Node templates; do not migrate frameworks.
8. Normalize IA/case anatomy and redirects while preserving every collaborator credit and all existing prose.
9. Convert to semantic OKLCH/type/space tokens and WOFF2 fonts, then revalidate contrast and CLS.
10. Make staging noindex and switch generated canonicals/metadata to `miebaka.design` before launch.

## Baseline evidence

- 15 built HTML routes; 210 full-page screenshots (15 pages × 7 widths × 2 motion states) in `audit/before/`.
- 105 computed-style dumps (15 × 7 widths) and 15 axe JSON files in `audit/before/`.
- Axe: zero automated violations on all 15 pages at 390px/reduced motion. This is not equivalent to WCAG conformance.
- Existing `npm test`: pass; raw output `audit/raw/npm-test.txt`.
- Mobile Lighthouse performance, one run per route: 0.62–0.91; LCP 2,734–11,612ms; CLS 0–0.083; TBT 0–371ms (`audit/before/lighthouse/summary.json`). No route meets the requested Performance ≥95 baseline.
- Lighthouse accessibility and Best Practices score 100 on all 15 routes; SEO scores 100 except the deliberately non-indexable 404 route at 66 (`audit/before/lighthouse-categories/summary.json`). Manual WCAG checks remain outstanding.
- Source totals: CSS 153,566 bytes; JS 115,883 bytes; built CSS contract reports 27,600 gzip bytes (`audit/raw/recon.txt`, `audit/raw/npm-test.txt`).

## Findings

| ID | Page / component | Evidence | Why it matters | Fix | Priority | Effort | Risk |
|---|---|---|---|---|---|---|---|
| F-01 | Mobile client proof | `audit/before/index--390--motion-reduce.png`; desktop comparison `index--1440--motion-reduce.png`; source `index.html:94` | The strongest credibility strip becomes blank cards for mobile hiring reviewers. | Fix image/filter/layout behavior and add a text fallback that remains meaningful without JS. | P0 | S | Low |
| F-02 | Case galleries | `audit/before/work--rivo--1440--motion-reduce.png`; generated markup `work/rivo.html:65` | Large caption-only voids read as broken work, directly damaging craft credibility. | Diagnose eager asset failures/layout sizing; retain explicit dimensions and responsive sources. | P0 | M | Medium |
| F-03 | Performance | `audit/before/lighthouse/summary.json`: About LCP 11,612ms; Explorations 11,111ms; Home TBT 371ms | A reviewer can leave before proof arrives; all routes miss the requested ≥95 performance gate. | Remove/contain expensive shader work, lazy-load non-LCP case images, optimize portrait/experience assets, retest Slow 4G. | P0 | L | Medium |
| F-04 | Progressive enhancement | `explorations.html:48-56` | The requested JS-disabled contract fails: the experiments and footer are empty mounts. | Emit a complete static gallery/list and footer; enhance it into the tunnel when JS is available. | P0 | M | Low |
| F-05 | IA labels/routes | `data/navigation.js:2-11`; `vercel.json:5-7` | Experiments/Notes/legacy Community do not match the approved hiring-oriented IA. | Implement D2, add redirects and a real Writing index; decide whether Community has publishable content. | P0 | M | Medium |
| F-06 | Case anatomy | `js/render/case-markup.js:90-100`; `work/rivo.html:65` | Two renderer taxonomies make senior reasoning harder to compare across projects; Result links to `#reflection`. | One schema: Context, Role, Year, Collaborators, Delivered; Problem, Decision, System, Applications, Outcome. | P0 | M | Medium |
| F-07 | Shared shell | `index.html:5-57,99-113`; `scripts/build-site.mjs:97-108`; `explorations.html:56` | Regex shell replacement and copied fallbacks are the root cause of nav/footer/head drift. | Deterministic Node templates/partials; one head/header/footer source, static output. | P0 | L | Medium |
| F-08 | Canonical/staging indexing | `data/site-config.js:4`; `index.html:8,15`; `vercel.json:8-35` | Canonicals point at staging and staging lacks `X-Robots-Tag: noindex`, risking duplicate indexing. | Generate `miebaka.design` canonical/OG URLs; add staging noindex header and disallow policy. | P0 | S | Low |
| F-09 | Token contract | `styles/foundations.css:5-31`; `audit/raw/recon.txt` | Raw hex/px/ms and `!important` prevent systematic refinement and fail acceptance criteria. | One readable `tokens.css` in OKLCH; semantic tokens; cascade layers; no raw values outside tokens. | P0 | L | High |
| F-10 | Font delivery | `styles/foundations.css:1-4,26`; `audit/raw/computed-style-clusters.txt` | TTFs, missing metric overrides and faux 200/700 weights create transfer and layout risks. | WOFF2 Latin subsets, real used weights/styles, two preloads max, metric-adjusted fallbacks. | P0 | M | Medium |
| F-11 | Mobile navigation | `js/render/navigation.js:42-50`; `audit/before/index--390--motion-reduce.png` | Tiny duplicated horizontal nav plus fixed tab bar does not expose the complete D2 IA or requested menu behavior. | One disclosure menu with full links, Escape, focus return, inert background, stable scroll lock. | P0 | M | Medium |
| F-12 | Accessibility manual proof | axe JSONs; `audit/tracks/G-accessibility.md` | Zero axe violations do not prove keyboard, screen-reader, 400% zoom or target-size compliance. | Run and record keyboard path, VoiceOver rotor/forms, 320px and 400% reflow, landscape/notch checks. | P1 | M | Low |
| F-13 | Typography scale | `styles/foundations.css:6-7`; 121 rendered font sizes in `audit/raw/computed-style-clusters.txt` | The visible hierarchy is strong, but the implementation cannot meet “every size maps to a step.” | Steps -2…+6; document interpolation; reduce label tracking after optical test. | P1 | M | Medium |
| F-14 | Theme color | `index.html:22-23`; `js/render/navigation.js:64` | Paper/dark navy metadata conflicts with D4 and runtime JS hard-codes hex. | Paper for light; ultramarine for dark/browser chrome unless owner deliberately selects midnight. | P1 | S | Low |
| F-15 | Outcome evidence | `data/case-studies.js:35-40,108,320-332,475-480` | Honest descriptions show delivery but not external effect; senior claims remain under-evidenced. | Owner supplies shipped links, production artefacts, permitted quotes or verified scope; do not invent metrics. | P1 | Owner | None |
| F-16 | Services/Instagram | `data/services.js`; `about.html:81,91-116`; `index.html:110` | Freelance language and a personal handle can blur the in-house senior-role signal. | Keep capabilities as proof; do not add Services to primary nav by default; retain Instagram only if professionally curated. | P2 | S | Low |
| F-17 | Tooling/CI | `package.json:7-34`; `lighthouserc.cjs:3-16` | CI covers only three desktop URLs at lower category thresholds and lacks formatter/style/html lint gates. | Add EditorConfig, Prettier, Stylelint, HTMLHint; mobile all-route Lighthouse and link checker. | P1 | M | Low |

## Cross-track reconciliation

| Conflict | Decision | Reason |
|---|---|---|
| C typography change vs H CLS/LCP | Tokenize first; specimen three serifs; ship only the chosen WOFF2 subsets with metric overrides; rerun Lighthouse before merging. | Aesthetic comparison without transfer/CLS proof is incomplete. |
| A nav rename vs H URLs/SEO | Rename labels/routes and add explicit 301s in the same atomic change; regenerate sitemap/canonicals together. | Prevents broken links and split indexing. |
| E component merge vs F JS selectors | Use stable data attributes for behavior before class consolidation; migrate one component at a time. | Avoids breaking nav, reveals and case index behavior during BEM cleanup. |
| B OKLCH conversion vs G contrast | Treat current colors as reference targets, compute OKLCH values, then test every semantic foreground/background pair. | Numeric conversion alone does not prove AA, especially with transparency and images. |
| D compact first viewport vs identity | Reduce empty hero height, not the authored headline or ultramarine field. | Brings work proof forward while preserving voice and identity. |
| I stronger outcomes vs content constraints | Add placeholders only in internal schema/report; do not publish empty metrics slots. | Visible placeholders weaken credibility and fabricated results are prohibited. |

## Decisions D1–D4

### D1 — Type stack

Recommendation: build `--font-display`, `--font-body`, `--font-label`; keep Google Sans Flex body and Josefin Sans labels while testing **Newsreader**, **Besley**, and **Literata** on the real Home H1 and case H2s. All have SIL OFL sources, italics and usable ranges; Newsreader is the first candidate, not an approved final choice. See `audit/tracks/C-typography.md`.

### D2 — Primary navigation

Recommendation: logo = Home; Work, Explorations, Community, About, Writing, Contact. Current content does not justify a distinct Community page, so implementation must either create a truthful destination from existing approved material or omit it pending owner content. **Services remains separate and is not recommended in primary nav** for the senior in-house hiring goal.

### D3 — Canonical domain

Recommendation: `https://miebaka.design/` in generated canonicals, OG URLs, sitemap and JSON-LD. Staging receives `X-Robots-Tag: noindex, nofollow` and robots disallow. This follows the explicit audit brief; DNS/production ownership remains unverified.

### D4 — Theme color

Recommendation: paper for light browser chrome and ultramarine for dark/identity chrome. Keep dark navy inside the visual system only if documented as a deliberate supporting field; do not expose hard-coded theme hex in JS.

## Assumptions and open questions

1. `miebaka.design` is the intended future canonical, but DNS and Vercel project-domain attachment are unverified.
2. Community has no distinct approved source content in the repository. D2 cannot be fully implemented without deciding what truthful content belongs there.
3. The serif winner is intentionally unconfirmed pending real-copy screenshots, subset sizes and CLS measurements.
4. VoiceOver/NVDA, 400% zoom and 320px checks are not yet evidenced; they remain acceptance work, not passes.
5. All collaborator strings must be copied byte-for-byte from current content data during migration; no editorial normalization.
6. The requested parallel-agent audit was attempted, but all three agents hit the platform usage limit before producing work. Track reports were completed in the primary session.

## Track reports

- `audit/tracks/A-information-architecture-navigation.md`
- `audit/tracks/B-design-tokens.md`
- `audit/tracks/C-typography.md`
- `audit/tracks/D-layout-spacing-alignment.md`
- `audit/tracks/E-component-consistency.md`
- `audit/tracks/F-codebase-architecture.md`
- `audit/tracks/G-accessibility.md`
- `audit/tracks/H-performance-seo-metadata.md`
- `audit/tracks/I-content-credibility.md`

## Stop gate

Phase 3 has **not** started. No production source has been changed and no feature branch or commits have been created. Proceed with the defaults above after owner review; D2 Community content is the only material blocker.
