# Editorial spacing review — 9 September 2026

Applied ECC design-system (audit mode), coding-standards, accessibility, and browser-qa guidance. This is a refinement of the owner's original editorial Swiss system: TeX Gyre Heros, Libre Baskerville, Josefin Sans, warm paper and clay. No framework or additional animation dependency was introduced.

## Implemented

- Added shared editorial column-gap and row-padding tokens in styles/swiss.css. The content width is capped at 1680px; page margins range from 24px to 96px.
- Relaxed the name's tracking and line height and reduced its scale slightly. Preserved the music pill beside Joshua and the single logo sculpture.
- Increased selected-work row padding from 22px to 28–48px. Kept names flush left and retained shader fills.
- Increased catalogue column gaps from 16px to 24px and row gaps from 32px to 48px, with three columns below 1100px and two on phones. Six columns remain on wide screens.
- Widened supporting-page introductions, relaxed reading leading and paragraph spacing, and gave service and experience disclosures consistent padding.
- Removed viewport-height distribution from Services; spacing now follows the content, including open disclosures.
- Moved the navigation collapse breakpoint from 640px to 896px. Navigation and footer links have at least 44px height.

## Visual audit

Subjective design scores, not automated compliance grades. Locations refer to selectors in styles/swiss.css unless stated otherwise.

| Dimension | Score / 10 | Evidence and action |
| --- | --- | --- |
| Colour consistency | 9 | Original palette preserved; no new colour tokens. |
| Typography | 8 | Masthead tracking relaxed; supporting headings regular weight. |
| Spacing | 8 | Shared --editorial-gap and --editorial-row replace isolated tight values. |
| Components | 8 | Services and Experience now share row padding and heading weight. |
| Responsive behavior | 8 | 42 route/viewport checks passed; tablet menu no longer crowds the bar. |
| Dark mode | 8 | Work page inspected; inherited theme remains functional. |
| Animation | 8 | Existing focused logo/fill effects retained; reduced-motion tests pass. |
| Accessibility | 7 | Larger link targets; menu Escape returns focus; native disclosure opens with Enter. Full audit still required. |
| Information density | 8 | More space inside lists and columns; original reading measures retained. |
| Polish | 7 | Consistent spacing; existing missing project imagery remains a content limitation. |

## Verification

- All 14 public routes checked at 375, 768 and 1440px: no document horizontal overflow, heading and navigation logo present (42 checks).
- Screenshots inspected for desktop Home and Services, phone Services with disclosure open, and phone Work in dark mode.
- Tablet menu opens; Escape closes it and restores focus to Menu. Native Services summary opens with Enter.
- Browser warning/error log empty at end of these checks.
- Existing scene lifecycle suite: 4 passed. Git whitespace check passed.

## Evidence limits

Visual regression verdict: INCONCLUSIVE, because no committed screenshot baseline exists for this owner-approved direction. These are current-render inspections, not a pixel regression pass. No axe or screen-reader audit, full network-resource audit, or measured LCP/CLS/INP run was performed; no WCAG conformance or Core Web Vitals pass is claimed. No form was submitted. Changes are local, not deployed.

## Type system and page transition — 9 September 2026

- Normalized the fluid scale from 13px labels and 17–19px reading copy through six heading tiers and two display tiers.
- Verified rendered roles: TeX Gyre Heros for headings, Libre Baskerville for running text, and uppercase Josefin Sans for labels.
- Added a cross-document Three.js snake transition for internal HTML links. A clay, lacquered tube and modeled head cross the viewport while a paper veil wipes the outgoing page; session state lets the destination page enter from the opposite edge and settle after the snake.
- The transition ignores external, download, modified-click and same-page links. Reduced-motion visitors retain immediate native navigation.
- Repeated 42 route/viewport checks at settled 375px, 768px and 1440px widths: zero overflow or font-role failures.
- Direct browser interaction confirmed the outgoing overlay, WebGL canvas, busy state and final destination cleanup. Browser console warnings/errors: zero.
