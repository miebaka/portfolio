# Portfolio sizing system — Belonwus

Effective 24 November 2026. Source: https://belonwus.com/ (rendered stylesheet, inspected 24 November). This replaces the previous Knowhere/Kati fluid typography and capped-container system.

## Reference values and implementation

Belonwus uses 16px ordinary text and 32px large text on desktop, 14px and 24px on mobile; all use 1.35 line-height. The portfolio retains Overused Grotesk (400/600). Reference pixels are expressed as rem at the default 16px browser root to respect text enlargement. Text fields retain a 16px input size to avoid mobile browser auto-zoom.

| Role | Mobile | Desktop |
|---|---:|---:|
| Standard text, labels, captions | 14px | 16px |
| Display/section headings and lead | 24px | 32px |
| Line height | 1.35 | 1.35 |
| Outer margin | 16px | 40px |
| Column gutter | 16px | 24px |
| Navigation height | 48px | 64px |
| Normal section spacing | 64px | 80px |
| Tight section spacing | 32px | 40px |
| Major section break | 120px | 240px |

The reference uses a 12-column desktop grid, 2-column project grids, and stacked small-screen content. There is no desktop content-width cap. Reading and project description copy use a maximum 628px measure from the reference project description. Essays and cases retain the shared sticky legend on the left and narrative in columns 7–12; on smaller screens both stack. The shared oversized name role `--type-name` is centered and container-scaled at 13.25cqi for the homepage, case covers and next-page handoffs. Longer names wrap; the link wraps only the displayed name. Belonwus uses a graphic wordmark, so this is a live-text adaptation.

## Sources of truth

- `styles/tokens.css`: typography roles, font faces and type declarations.
- `styles/foundations.css`: shared spacing stops, margins, gutters, section rhythm and navigation height.
- `styles/layout.css`: reusable container and grid.
- `scripts/stylelint-sizing.mjs` and `js/core/responsive.js`: responsive contract and browser queries.

The reference spacing stops used in the portfolio are 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 120 and 240px. Use the shared `--s1`–`--s12` stops, `--spacing-unit` (4px), or semantic section/gutter tokens rather than introducing a second scale. Painting and component geometry are not a second spacing scale. Minimum control target remains 44px for accessibility.

## Responsive behavior

Belonwus's source uses 375px, 425px and 768px upper boundaries, with desktop starting at 769px. At the normal browser root these correspond to 23.4375em, 26.5625em and 48em. Portfolio component and JS breakpoints are migrated to these ranges. The reference's root viewport scaling is not copied because the measured reference text and spacing are fixed CSS pixel lengths; using rem preserves browser text resizing.

## Shared Proof Sheet components

Button base: `--ref-ultramarine` with `--ref-white`. Hover: `--ref-coral-30` with `--ref-white`. No positional animation, scale or shadow on hover. Essay list and table-of-contents links use the same hover colours and keep visible focus. The record pill uses reference component spacing (18px gap, 14px vertical/leading padding, 20px trailing padding). The marquee has the reference 4.5vw gap and proportional logo height; loader uses the ultramarine overlay and personal SVG logo. These reference-specific dimensions are shared semantic tokens rather than alternative global scales.

## Verification

Run CSS lint, sizing contract tests and browser geometry checks at the three boundaries and representative desktop widths. Confirm the homepage name fits, the gallery is outside the sticky reading region, the navigation stays usable and both operating-system color schemes remain supported.
