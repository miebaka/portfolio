# Geist Unified — portfolio typography system

**Status:** Binding design and engineering contract  
**Date:** 21 November 2026  
**Authoritative CSS:** `styles/tokens.css`  
**Import order:** `styles/tokens.css` before `styles/foundations.css`, followed by component and page layers.

## 1. Design intent

Typography is the portfolio's most prominent visual device. Oversized, image-led editorial headings are a deliberate signature, not a reason to invent new fonts and numbers for every page. The scale provides **one reusable hierarchy** with enough breadth for small UI, long-form essays, and large creative displays. Project imagery and content stay central. The large type must not impede reading or interaction.

## 2. Families and verified face coverage

| Role | Family | Allowed weights | Case |
| --- | --- | --- | --- |
| Displays / headings / project titles | Geist Sans | 400, 600 | Author's case |
| Body / essays / narrative / emphasis | Geist Sans | 400, 600 | Sentence case |
| Navigation / labels / metadata / captions | Geist Mono | 400, 600 | Uppercase for UI labels |
| Symbols (icons ONLY) | Material Symbols Outlined | 400 | Not used as prose |

The currently loaded Geist Sans and Geist Mono Regular and SemiBold WOFF2 files are *static* faces. They are declared at exactly 400 and 600 with `font-display:swap`; there are no licensed, installed files for weights such as 430, 535, 550, 640, 700 or the arbitrary 600–900 range. Do not request synthetic weights or condensed `font-stretch` percentages. The icon font is a functional exception, not another text family.

## 3. Canonical size hierarchy

All px figures assume 16px root size and are indicative; browser zoom preserves the underlying rem and fluid calculations. Use token names in code, never copied numbers from this table.

| Role | Tokens | Range or fixed size at 16px root | Primary placement |
| --- | --- | --- | --- |
| Secondary labels | `--type-label-s` / `m` / `ui` / `l` | 11 / 12 / 13 / 14px | Eyebrows, metadata, labels; 11px only when genuinely secondary |
| Input and mobile nav | `--type-input` / `--type-nav-mobile` | 16 / 13px | Form fields, touch navigation |
| Small & normal body | `--type-body-s` / `m` / `l` | 15 / 17 / 17–20px | Cards, case text, essays |
| Lead and intro | `--type-body-lead` / `intro` | 18–24 / 20–38px | Ledes and restrained introductory statements |
| Content headings | `--type-heading-s` / `m` / `l` / `xl` | 24–40 / 30–54 / 36–54 / 40–84px | Case chapters, cards and page subsections |
| Compact editorial | `--type-display-mobile` / `s` / `m` / `l` | 37–72 / 42–64 / 48–81 / 51–120px | Responsive editorial headings |
| Project list | `--type-display-project` | 48–118px | Selected Work and project roster |
| Section display | `--type-display-section` | 52–160px | About Me, What I Do and archive chapters |
| Wide editorial | `--type-display-xxl` | 68–120px | Full-width editorial moments |
| Home name | `--type-display-hero` | 54–212px | Home hero ONLY: major point of visual impact |
| Decorative signature | `--type-display-signature*` | Fluid / proportional | Existing signature visuals |
| Inline mark | `--type-inline-mark` | Relative 0.35em | Arrow and minimal punctuation motifs |

## 4. Weight, leading and tracking

Font weights are `--type-weight-regular:400` and `--type-weight-semibold:600`. Default body and main display copy use 400; use 600 for meaningful emphasis and for short functional labels, not to force visual hierarchy through faux-bold.

Leading tokens are `--type-leading-hero` (.82), `display` (.9), `display-comfort` (.96), `heading` (1.08), `lead` (1.12), `ui` (1.25), `label` (1.3), `body` (1.5), `reading` (1.65) and `loose` (1.8). The first three are for very short display lines, never paragraphs.

Tracking tokens are `--type-tracking-compressed` (-.08em), `display` (-.055em), `heading` (-.035em), `title` (-.02em), `normal` (0), `ui` (+.04em), `label` (+.1em), `label-wide` (+.16em) and `label-ultra` (+.24em). Labels are tracked positively; long-form prose should not acquire editorial headline tracking.

## 5. Usage contract

In CSS, a component consumes a semantic family and size:

```css
.case-chapter__copy h2 {
  font-family: var(--display);
  font-size: var(--type-heading-l);
  font-weight: var(--type-weight-regular);
  line-height: var(--type-leading-heading);
  letter-spacing: var(--type-tracking-heading);
}

.meta {
  font: var(--type-weight-semibold) var(--type-label-ui)/var(--type-leading-label) var(--label);
  letter-spacing: var(--type-tracking-label);
  text-transform: uppercase;
}
```

Never introduce hard-coded `font-size`, numeric `font-weight`, `line-height`, `letter-spacing`, an undocumented font family, or an unsupported `font-stretch` inside page or component styles. Add a meaningful token and update this spec instead. `--font-size-*` and `--editorial-display*` remain temporary compatibility aliases only; new code uses `--type-*`.

## 6. Compliance and CI

Run `npm ci`, `npm run lint:typography`, `npm run test:typography`, `npm run test:tokens`, `npm run build` and the existing E2E/quality suite. `stylelint.config.mjs` loads `scripts/stylelint-typography.mjs`. The Quality workflow runs the typography gate before Playwright. A new raw size, weight, tracking or line-height is a blocking error; do not hide it with a lint-disable comment.

**Browser review is still required before merge.** Inspect 320, 390, 768, 1024, 1440 and 1920px widths and 200% zoom. Check Home hero clipping and intentional breakpoints, Selected Work titles, menu and buttons, About and What I Do headings, Work archive, case-study chapter headings, essay reading width, contact inputs, uppercase labels and fallback font loading. Static checks are not a substitute for rendered QA.
