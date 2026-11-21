# One typography system — Jacobsen-informed editorial hierarchy

**Status:** Binding design and engineering contract  
**Updated:** 21 November 2026  
**Single source of typography values:** `styles/tokens.css`  
**Families:** Geist Sans for display and body; Geist Mono for metadata and labels.

## 1. Design intent

[Jacobsen](https://lexingtonthemes.com/viewports/jacobsen) uses calm, precise typography: short, legible section headings, generous whitespace, understated labels, and an editorial rhythm that lets the work remain central. Apply those *principles*, not its font files, color palette, or site layout. In this portfolio, **Miebaka Joshua** remains the largest visual expression, followed by section headings, project titles, supporting headings and reading copy.

The previous scale contained overlapping `display-s`, `display-m`, `display-l`, `display-mobile`, `display-xxl`, and `display-section` roles and multiple font-family compatibility aliases. Those are retired. Do not create competing page-local typography tokens.

## 2. Typography tokens

All ranges assume a 16px root font. Fluid sizes are bounded with `clamp()` so browser zoom and mobile viewports remain usable.

| Purpose | Token | Size / range |
| --- | --- | --- |
| Caption and small label | `--type-label-s` | 13px |
| Standard label and navigation | `--type-label-m` | 14px |
| Important label and metadata | `--type-label-l` | 16px |
| Input | `--type-input` | 16px |
| Small body | `--type-body-s` | 16px |
| Standard body | `--type-body-m` | 17px |
| Long-form reading | `--type-body-l` | 17–20px |
| Lead | `--type-body-lead` | 20–24px |
| Intro | `--type-body-intro` | 20–32px |
| Heading small | `--type-heading-s` | 24–36px |
| Heading medium | `--type-heading-m` | 30–48px |
| Heading large | `--type-heading-l` | 36–56px |
| Heading XL | `--type-heading-xl` | 42–76px |
| Compact editorial display | `--type-display-compact` | 38–76px |
| Project titles and indexes | `--type-display-project` | 44–100px |
| Major section display | `--type-display-section` | 48–104px |
| Home name / intentional hero | `--type-display-hero` | 54–176px |

The relative signature variables `--type-display-signature-vw`, `--type-display-signature-wide-vw`, and `--type-inline-mark` belong to decorative geometry; they are not alternative type scales.

## 3. Font families and weights

- `--type-family-display` — Geist Sans.
- `--type-family-body` — Geist Sans.
- `--type-family-label` — Geist Mono.
- `--type-family-icon` — Material Symbols, icons only.

`--type-weight-regular` is **400** and `--type-weight-semibold` is **600**. These are the only available registered static text weights. Don't synthesize unsupported intermediate weights.

## 4. Line height and letter spacing

Use `--type-leading-body` (1.5) or `--type-leading-reading` (1.6) for paragraphs; `--type-leading-heading` (1.14) for normal headlines. The tighter `--type-leading-hero` (.9), `--type-leading-display` (.98) and `--type-leading-display-comfort` (1.02) are only for short display text.

Compression now stops at `--type-tracking-compressed` (-.06em) rather than -.08em. Display is -.035em, heading -.025em, and normal titles -.015em. Uppercase labels are tracked +.08em, with +.12em and +.16em reserved for spaced metadata.

## 5. The contract

```css
.case-chapter__heading {
  font-family: var(--type-family-display);
  font-size: var(--type-heading-xl);
  font-weight: var(--type-weight-semibold);
  line-height: var(--type-leading-display-comfort);
  letter-spacing: var(--type-tracking-heading);
}

.meta {
  font: var(--type-weight-semibold) var(--type-label-m)/var(--type-leading-label) var(--type-family-label);
  letter-spacing: var(--type-tracking-label);
  text-transform: uppercase;
}
```

Never restore `--font-size-*`, `--font-display`, `--font-body`, `--font-label`, `--display`, `--body`, `--label`, `--signature`, `--editorial-display*`, or redundant display-token variants. Every `--type-*` declaration belongs in `styles/tokens.css`; component and page styles may *consume* tokens, never redefine them. Do not use raw numbers for `font-size`, `font-weight`, `line-height`, or `letter-spacing` in component styles.

## 6. Quality and QA

The custom Stylelint rule and Node tests enforce the single source, ban retired aliases, validate declared roles and protect the responsive display hierarchy at **320, 390, 768, 1440, and 1920px**. Run `npm run lint:typography`, `npm run test:typography`, `npm run test:tokens`, `npm run build`, and the E2E suite. Then inspect the homepage, Work archive, About, case studies, essays and navigation with a browser, including at 200% zoom. Check wrapping, line lengths, clipping, uppercase labels, focus targets, and text contrast.
