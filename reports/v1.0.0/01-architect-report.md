# @architect Report — Codebase Audit vs Engineering Spec
**Version:** v1.0.0 | **Date:** 2026-06-29

---

## Spec Compliance Summary

| Area | Status | Notes |
|------|--------|-------|
| Token architecture | PARTIAL | 9 of 10 required token files exist; `opacity.css` missing. All existing token files are well-structured and under the 250-line limit. |
| CSS cascade/specificity | PASS | Layers flow Tokens → Base → Components → Sections correctly. No `!important` found anywhere. No ID selectors. |
| BEM naming | PARTIAL | Core components follow BEM correctly. `section-head h2` overrides the heading font via an element-tag selector inside a utility class — mixes utility and component concern. `.hero__title--display` modifier is defined in `about.css` not `hero.css`. |
| Z-index scale | PASS | Five-level scale defined and consumed correctly via tokens throughout. |
| Colour usage | PARTIAL | Token system is semantic and well-designed. Three violations exist: `rgba(255, 255, 255, 0.80)` hardcoded in `case-study.css:78`; multiple `rgba(0,0,0,*)` values hardcoded inside `buttons.css` (Rams button) and `navigation.css` (theme-toggle shadows). Per-project `--case-accent` hex values in `case-study.css:22–25` are intentional local tokens — borderline acceptable but undocumented. |
| Typography system | PARTIAL | Three-role system is correctly defined and enforced globally. One undefined token: `--step-display` is referenced in `playground.css:118` but never defined — this silently breaks the article-hero title size. `work.html` uses `<h1 class="meta hero__role">` which forces the heading element into Josefin Sans via cascade, violating the rule "every heading uses TeX Gyre Heros." `.label`/`.meta`/`.overline` use `--weight-medium` (500) but Josefin Sans only loads weights 400 and 600 — the browser will fake-bold weight 500. |
| Spacing system | PASS | 8-point token system is complete and consistently consumed. No literal `margin` or `padding` pixel values found in components or sections. `--space-8: 13rem` (208px) is a minor deviation from the spec's 192px step but does not break the rhythm. |
| JS module architecture | PASS | Modular ES module structure is well-organised across `core/`, `render/`, and `utilities/`. `js/components/` directory is absent (spec lists `carousel.js`, `accordion.js`, `modal.js`) but these components don't yet exist — omission is acceptable for this stage. Function naming follows verb convention throughout. |
| HTML semantics | PARTIAL | Three violations: (1) `work.html:48` uses `<h1>` as a label element with `.meta` class — the page title "Work" is semantically the H1 but is styled as an interface label, forcing Josefin Sans onto a heading. (2) Case study `<section>` elements rendered by JS have no `aria-label` attributes — they lack accessible names. (3) `<textarea>` in contact forms has no `autocomplete` attribute. |
| Accessibility baseline | PARTIAL | Skip link present on all pages. Focus trapping on menu is correctly implemented. Keyboard Escape closes menu. Focus returns to invoking control after close. `prefers-reduced-motion` is honoured for reveals and scroll behaviour. Missing: the `scroll-cue` keyframe animation (`scroll-dot`) in `hero.css:109` has no reduced-motion override — it runs indefinitely even when the user requests no motion. `aria-expanded` on menu button is correctly maintained. ARIA is clean — no redundant roles on native elements. |

---

## Violations Found

### Critical

**V-01 — Undefined CSS token: `--step-display`**
File: `styles/sections/playground.css:118`
The `.article-hero__title` rule references `var(--step-display)` which is never defined in `tokens/typography.css` or anywhere else. The defined tokens are `--step-display-xl` and `--step-hero`. This causes the article hero title to inherit the body font size silently — a broken visual state that will not produce a CSS error.

**V-02 — Scroll-cue animation ignores `prefers-reduced-motion`**
File: `styles/sections/hero.css:109–116`
The `scroll-dot` keyframe runs `infinite` with no `@media (prefers-reduced-motion: reduce)` override. The spec requires all autoplay animations to be disabled for users who request reduced motion. The `.reveal` class correctly handles this; the scroll cue does not.

**V-03 — `<h1>` on `work.html` overridden to Interface font**
File: `work.html:48`
`<h1 class="meta hero__role reveal">Work</h1>` — the `.meta` class sets `font-family: var(--font-label)`, `text-transform: uppercase`, and `letter-spacing: var(--tracking-label)`, overriding the base heading rule. The spec states: "Every heading uses TeX Gyre Heros." Josefin Sans is the Interface font and must never appear on a heading element. This also means the H1 renders at `--step-meta` (12px) — far below any heading scale. The visual intent is a label-style page marker, but the semantic element chosen is `<h1>`.

### High

**V-04 — Hardcoded raw `rgba()` colour values in components**
Files:
- `styles/components/buttons.css:58–77` — the `.btn-rams` and `.btn-rams__keycap` components define nine `rgba(0,0,0,*)` and `rgba(255,255,255,*)` shadow values as inline property values (not custom properties). The comment in the source acknowledges the global `--shadow-*` tokens don't apply here, but the values are not tokenised at all — they are magic numbers that cannot be themed.
- `styles/components/navigation.css:91,105,115,119` — the theme toggle track and knob shadows use raw `rgba(0,0,0,*)` values directly in property declarations.
- `styles/sections/case-study.css:78` — `.case-media__placeholder` sets `color: rgba(255, 255, 255, 0.80)` — a hardcoded white with no token.

**V-05 — Josefin Sans weight-500 not loaded; used as `--weight-medium`**
Files: `styles/tokens/typography.css:57` loads weights 400 and 600 only. `styles/base/typography.css:120` uses `font-weight: var(--weight-medium)` (500) on `.label`, `.overline`, and `.meta`. The browser will synthesise a faux-weight between 400 and 600 — defeating the spec's rule "No artificial bolding."

**V-06 — `opacity.css` token file missing**
The engineering specification's directory structure lists `tokens/opacity.css` as a required file. It does not exist. Opacity values appear as literal numbers (e.g., `opacity: 0.07` in `footer.css:29`, `opacity: 0.05` in `case-study.css:15`, `opacity: 0.55` in `footer.css:60`) scattered across components. These are not tokenised.

**V-07 — Case study `<section>` elements have no accessible names**
File: `js/render/case-study.js:23,32,69,81`
Each narrative section (Overview, Challenge, Process, Solution, Outcome) is a `<section>` element with no `aria-label` or `aria-labelledby`. The spec requires landmark structure and screen-reader friendly navigation. Anonymous sections cannot be distinguished by assistive technologies.

**V-08 — `.playground-empty` class defined in two separate files**
Files: `styles/sections/home.css:40–45` and `styles/sections/playground.css:5–9`
The class is defined twice with different declarations. `home.css` sets `font-size: var(--step-body-lg)` while `playground.css` sets `font-size: var(--step-body)`. This is a duplicated declaration that produces unpredictable results depending on import order. The spec forbids duplicated CSS declarations.

### Medium

**V-09 — `<textarea>` missing `autocomplete` attribute**
Files: `index.html:137`, `contact.html:78`
Both contact forms have `<textarea id="message">` without `autocomplete="off"` or any `autocomplete` attribute. The spec and WCAG 1.3.5 (Identify Input Purpose) require autocomplete attributes on all form controls.

**V-10 — `section-head h2` mixes BEM and element-tag selectors**
File: `styles/base/utilities.css:43–51`
`.section-head h2 { font-family: var(--font-label); ... }` — a utility class reaching into and restyling a heading element by tag name. This couples the utility to the heading element and violates the spec rule "Never rely on tag selectors for component styling." The correct approach is a BEM element class: `.section-head__label` applied directly to the element.

**V-11 — `hero__title--display` modifier defined in wrong file**
File: `styles/sections/about.css:60–63`
The BEM modifier `.hero__title--display` belongs to the hero block, which lives in `styles/sections/hero.css`. Defining a hero block modifier in `about.css` breaks the single-responsibility principle and makes the modifier invisible to any developer reading `hero.css`.

**V-12 — Inline `style` attributes used for CSS custom property injection**
Files:
- `js/render/projects.js:12` — injects `style="--tile:${color};--reveal-i:${i}"` on work cards
- `js/render/sections.js:11` — injects `style="--reveal-i:${i}"` on capability rows

The spec states "Inline styles: Forbidden." The `--tile` property passes a hex colour value from `data/site.js` into a card element via an inline style. While CSS custom properties are elegant, the spec provides no exemption for this pattern. The `--reveal-i` stagger index is a JS-driven animation concern and may be a reasonable exception, but the `--tile` colour injection is more concerning as it bypasses the token system.

**V-13 — Hardcoded `--_gap`, `--_py`, `--_px` component-local spacing tokens not on 8pt grid**
Files: `styles/components/navigation.css:139–141` (back button), `styles/components/buttons.css:6–7` (`.btn`)
The spec permits component-local custom properties (prefixed `--_`) for encapsulated values. However, values like `--_px: 1.2rem` (19.2px), `--_py: 0.7rem` (11.2px), `--_gap: 0.4rem` (6.4px) do not align to the 8-point grid and are not derived from spacing tokens. The spec says: "No literal spacing inside components."

**V-14 — `scroll-cue__track` and `scroll-cue__dot` use non-tokenised dimension values**
File: `styles/sections/hero.css:88–98`
`--cue-w: 4px`, `--cue-h: 44px`, `--cue-radius: 2px`, `--dot-h: 12px` are component-local properties with raw pixel values that are not derived from the spacing or radius token system.

### Low

**V-15 — `styles/tokens/opacity.css` not imported in `main.css`**
Related to V-06. Even if `opacity.css` were created, it is not currently listed in the `main.css` import chain.

**V-16 — `js/components/` directory absent**
The spec directory structure lists `js/components/` containing `carousel.js`, `accordion.js`, `modal.js`. These do not exist. This is acceptable at the current stage since none of these components are built yet, but the directory is not stubbed.

**V-17 — Instagram and Twitter social links are incomplete placeholders**
File: `data/site.js:47–48`
`href: "https://instagram.com/"` and `href: "https://twitter.com/"` are incomplete. These render in the footer and menu as live links pointing to platform homepages. The spec requires descriptive link text and functional links.

**V-18 — Open Graph image for case studies points to portrait, not case-specific image**
Files: `work/rivo.html:15`, `work/christian-poster-a-week.html`, etc.
`og:image` uses `miebaka-joshua-portrait.jpg` for every case study page. The spec requires social preview images per page. Each case study should have its own cover image for social sharing.

---

## Top 5 High-Impact Fixes

**Fix 1 — Define `--step-display` token or correct the reference (V-01)**
In `styles/tokens/typography.css`, add `--step-display: var(--step-hero);` to alias the missing token, OR update `styles/sections/playground.css:118` to use `var(--step-display-xl)` or `var(--step-hero)` depending on the intended size. This is currently a silent visual regression on the article hero — the most visible element of any writing page.

**Fix 2 — Add `prefers-reduced-motion` override for `scroll-cue` animation (V-02)**
In `styles/sections/hero.css`, add:
```css
@media (prefers-reduced-motion: reduce) {
  .scroll-cue__dot { animation: none; }
}
```
This is a WCAG 2.1 SC 2.3.3 (Animation from Interactions) concern and the only autoplay animation without a reduced-motion kill switch.

**Fix 3 — Fix the `work.html` H1 semantic/visual conflict (V-03)**
The "Work" page title is semantically the H1. Two solutions: (a) Convert the element to a `<p class="meta hero__role reveal">Work</p>` and add a visually-hidden actual H1 for screen readers, OR (b) keep `<h1>` and apply a `.hero__role` modifier that reduces font-size to the label scale while keeping `font-family: var(--font-display)` — preserving both semantics and visual intent. Option (b) is cleaner and keeps the heading in the Display role.

**Fix 4 — Load Josefin Sans weight 500, or switch `--weight-medium` usage on label font to 600 (V-05)**
The label font only loads 400 and 600. The `.label`, `.overline`, and `.meta` classes request 500. Fix: either add a `font-face` block for `josefinsans-medium.woff2` in `typography.css` (if the asset exists) OR update `styles/base/typography.css:120` to use `var(--weight-regular)` or `var(--weight-bold)` for label elements. No artificial bolding is the hard rule.

**Fix 5 — Add `aria-label` attributes to case study narrative sections (V-07)**
In `js/render/case-study.js`, update the `section()` helper to include an `aria-label` parameter:
```js
function section(label, bodyHTML) {
  return (
    '<section class="container case-grid reveal" aria-label="' + esc(label) + '">' + ...
  );
}
```
Apply to all five narrative sections (Overview, Challenge, Process, Solution, Outcome) and the case hero and case next sections. This unblocks screen-reader navigation via landmark regions.

---

## Passed Audits

- **No `!important` declarations** — codebase is clean throughout all CSS files.
- **No inline styles in HTML** — all pages audited; zero `style=""` attributes in static HTML (JS injection is a separate finding).
- **Token file sizes** — all 9 token files are well under the 250-line limit; largest is `typography.css` at 118 lines.
- **Z-index scale** — consistently tokenised and used; no magic numbers in stacking contexts.
- **Dark mode** — implemented correctly by redefining only tokens, not components. Semantic token names are maintained.
- **CSS cascade layer order** — `main.css` imports follow the exact Tokens → Base → Components → Sections order with no skipped layers.
- **Responsive font scales** — all type scale tokens use `clamp()` for fluid mobile-to-desktop scaling. No breakpoint-specific typography overrides.
- **OpenType features** — `font-kerning`, `text-rendering`, `font-feature-settings`, `font-variant-ligatures` all configured in `reset.css`.
- **Reading measures** — five measure tokens defined and applied to content regions correctly.
- **Skip link** — present on every audited page, correctly positioned, keyboard-accessible.
- **Focus indicators** — `:focus-visible` global rule applied using `--accent` token. No `outline: none` without replacement found.
- **Menu accessibility** — focus trapping, Escape handling, focus return to invoking control, `aria-expanded`, `aria-haspopup`, `aria-modal`, and body scroll lock all implemented correctly in `js/core/menu.js`.
- **`prefers-reduced-motion`** — honoured in `reset.css` (scroll-behavior), `utilities.css` (reveal transitions), and `marquee.css` (infinite scroll animation). JS `scroll.js` checks at init.
- **Structured data** — JSON-LD on all pages: `Person` and `WebSite` on home; `CreativeWork` + `BreadcrumbList` on case studies; `BreadcrumbList` on all secondary pages.
- **SEO files** — `sitemap.xml`, `robots.txt`, and `404.html` all exist.
- **JS module naming** — all functions follow the `verb + Noun` convention (`renderNavigation`, `initMenu`, `renderCaseStudy`, etc.). No `doStuff()` or `run()` patterns found.
- **Selector depth** — audited components; maximum depth observed is 3 (e.g., `[data-theme="dark"] .site-menu__list a`). No deeper chains found.
- **File size limits** — largest section file is `playground.css` at 203 lines (limit: 350). Largest component is `navigation.css` at 174 lines (limit: 300). All within spec.
- **Grid system** — 12-column token defined. Container query used correctly for the work grid in `work.css`. Golden-ratio grid tokens (`--col-major`, `--col-minor`, `--phi`) defined and used consistently.
- **Duplicate IDs** — none found across audited pages.
- **Conventional commits** — git log confirms `feat:`, `fix:`, `refactor:`, `style:`, `copy:`, `update:` prefixes in use.
- **Font self-hosting** — all three typefaces are self-hosted with `font-display: swap`. Critical fonts are preloaded in every page `<head>`.

---

*Report generated by @architect. Next recommended action: address Fix 1 (broken token reference) and Fix 2 (reduced-motion) as zero-risk single-line changes, then Fix 3 (H1 semantics) before any public share of the work page URL.*
