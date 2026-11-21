# Unified portfolio typography — Jacobsen-informed

**Authoritative stylesheet:** `styles/tokens.css`  
**Reference:** https://lexingtonthemes.com/viewports/jacobsen  
**Updated:** 21 November 2026  
**Status:** Binding design and engineering contract

## Decision

There is **one source of truth for all typography-related CSS**, not merely one set of design tokens. `styles/tokens.css` owns:

- Geist Sans and Geist Mono font families, plus Material Symbols as an icon font only.
- The entire size, weight, line-height and letter-spacing scale.
- All font-face declarations (the two text families each load Regular 400 and SemiBold 600).
- **All typographic selectors and declarations**, including uppercase transformations, text wrapping, text alignment, text decoration, letter spacing and responsive typography.

No other file in `styles/` is allowed to set typography properties. The remaining stylesheets are strictly concerned with layout, interaction, colours, motion, and component appearance.

`styles/main.css` imports the typography stylesheet **once, last**, into the `typography` cascade layer. CSS variables are resolved at computed-value time, so earlier layout rules may safely reference them. The Work page may keep its separate `styles/project-folders.css`, but that file no longer contains any typography declarations.

## Families

| Role | Token | Font | Supported weights |
| --- | --- | --- | --- |
| Headings, display and body | `--font-sans` | Geist Sans | 400, 600 |
| Navigation, metadata and labels | `--font-mono` | Geist Mono | 400, 600 |
| Icons only | `--icon` | Material Symbols Outlined | 400 |

No legacy family aliases are kept. Do not reintroduce `--display`, `--body`, `--label`, `--font-display`, `--font-body` or `--font-label`.

## Canonical size scale

These ranges assume the browser's default 16px root. Keep `rem` bounds so zoom remains effective.

| Token | Size | Usage |
| --- | --- | --- |
| `--type-label` | 13px | Eyebrows, uppercase metadata |
| `--type-caption` | 14px | Captions, navigation |
| `--type-input` | 16px | Form inputs and controls |
| `--type-body` | 17px | Regular reading |
| `--type-body-lg` | 17–20px | Essays and case studies |
| `--type-lead` | 20–28px | Lead text |
| `--type-heading-sm` | 24–36px | Card headings |
| `--type-heading-md` | 32–56px | Subsection headings |
| `--type-heading-lg` | 40–72px | Project titles and feature headings |
| `--type-display` | 52–96px | Major section displays |
| `--type-hero` | 56–160px | Homepage hero and truly exceptional moments |
| `--type-signature` | 32–112px | Decorative signature |
| `--type-signature-vw` | 7.6vw | Signature proportional geometry |
| `--type-signature-wide-vw` | 8.69vw | Wide signature proportional geometry |
| `--type-inline-mark` | .35em | Decorative inline marks |

These fifteen roles form one unified scale. The three proportional signature / ornament values are not independent editorial scales.

**Line heights:** `--type-leading-hero` 0.92, `--type-leading-display` 1, `--type-leading-heading` 1.12, `--type-leading-ui` 1.3, `--type-leading-body` 1.5, `--type-leading-reading` 1.65.

**Tracking:** `--type-tracking-display` −.055em, `--type-tracking-heading` −.025em, `--type-tracking-normal` 0, `--type-tracking-ui` .04em, `--type-tracking-label` .08em, `--type-tracking-label-wide` .12em.

**Weights:** 400 and 600 only. Do not synthesize unsupported intermediate or condensed weights.

## Example

```css
/* styles/tokens.css: allowed */
.case-chapter__heading {
  font: var(--type-weight-semibold) var(--type-heading-lg) /
    var(--type-leading-display) var(--font-sans);
  letter-spacing: var(--type-tracking-heading);
}
```

Do not put this rule in `pages-v4.css`, `home.css`, `project-folders.css`, or any other stylesheet. CSS page owners retain `grid`, `padding`, `margin`, `color`, `background`, and similar *non-typographic* rules for the same selectors.

## Why Jacobsen

Jacobsen uses its typography to support image-led editorial storytelling rather than filling every viewport with oversized words. This portfolio adapts its restrained hierarchy, not its specific font face, colours, or brand.

Keep the name dominant, section displays controlled, projects clearly distinguishable, and reading matter comfortable. Small labels should not fall under 13px.

## Enforcement

`scripts/stylelint-typography.mjs` prohibits typography properties in every stylesheet except `styles/tokens.css`, **even if the rule uses a valid token**. `scripts/typography-contract.test.mjs` independently checks for escaped declarations and font faces outside the canonical file; `scripts/typography-structure.test.mjs` checks scale bounds and count; `scripts/token-integrity.test.mjs` checks token ownership and resolution.

Before merge or release, run:

```sh
npm ci
npm run lint:typography
npm run test:typography
npm run test:tokens
npm run build
npm test
npm run test:e2e
```

Check 320, 390, 768, 1024, 1440 and 1920px viewports as well as 200% browser zoom. Verify hero and project-title wrapping, Work folder tabs, case-study readability, uppercase metadata, and contact form inputs. Static contracts do not substitute for visual and interaction testing.
