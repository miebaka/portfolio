# Track G — Accessibility (WCAG 2.2 AA)

## Automated baseline

All 15 built pages produced zero axe violations at 390px with reduced motion (`audit/before/*--axe.json`; summarized by the baseline command output). This is a useful floor, not WCAG conformance.

## Findings

| ID | Evidence | Finding / fix |
|---|---|---|
| G-01 | `explorations.html:48-56` | With JS disabled, the spatial work itself and footer are empty; the page does not meet the explicit progressive-enhancement requirement. Add a complete static list/gallery fallback. P0. |
| G-02 | `scripts/build-site.mjs:99-104`; `js/render/navigation.js:12,41,48` | Static navigation lacks `aria-current`; build it into HTML. P1. |
| G-03 | `js/render/navigation.js:42-50`; mobile screenshot | The mobile pattern is not the requested dialog/disclosure menu and does not prove focus trap, Escape, or focus return. P0. |
| G-04 | `styles/foundations.css:18-25` | Coral is used as focus and hover feedback, which is directionally correct, but exact OKLCH contrast pairs are not documented. Recalculate every semantic pair after token conversion. P0. |
| G-05 | `audit/raw/computed-style-clusters.txt` | 4,242 rendered nodes use 13px text and 300 use 12px text. Labels may pass minimum size but require manual legibility and 400% zoom review. P1. |
| G-06 | `index.html:94`; mobile screenshot | “Selected brands” becomes blank cards at 390px, removing meaningful credibility content for mobile users. Fix responsive rendering/contrast. P0. |
| G-07 | case screenshots and `js/render/case-markup.js:33-52` | Figures use `figure/figcaption` and images have meaningful alts in published cases; decorative archive previews use empty alts. Pass. |

Keyboard-only, VoiceOver/NVDA and 400% zoom remain **unverified**. They cannot be inferred from axe. Required manual scripts: complete nav/card/form path, screen-reader landmark/heading rotor review, and 320px plus 400% reflow.

