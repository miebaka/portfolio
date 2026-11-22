# Unified portfolio typography — restrained Knowhere-informed hierarchy

**Authoritative stylesheet:** `styles/tokens.css`  
**Visual reference:** https://made-knowhere.framer.website/  
**Updated:** 22 November 2026  
**Status:** Binding design and engineering contract

## Direction and research limits

The Knowhere website's publicly readable content follows an editorial hierarchy: a studio introduction, the numbered **Our Philosophy** section, succinct headings with supporting sentences, and a compact contact close. That structure informs this move to quieter typography that lets projects and imagery carry the composition.

The source's exact computed font family, CSS sizes, tracking, line heights and breakpoints were **not independently verified**. This is an intentional, restrained interpretation of the observable hierarchy, not a pixel-accurate copy or a claim about Knowhere's unseen design tokens. Retain this portfolio's approved Geist families and original imagery.

## Rules

There is **one source of truth for all typography-related CSS**: `styles/tokens.css`, imported once, last, in the `typography` cascade layer. It owns font faces, family, size, weight, line-height, tracking, transformation, wrapping, text decoration and responsive typographic selectors. Other CSS files own only layout, appearance and interaction.

The approved family roles are Geist Sans for headings and body (400/600) and Geist Mono for labels and navigation (400/600). Material Symbols Outlined is an icon font only. Preserve fallbacks and font swap behavior.

No separate editorial `display` or `hero` text tier is permitted. Every page title, the homepage name, case-study opening and major call to action draw from a **3em upper bound (nominally 48px at a 16px parent size)** headline scale. Rather than using huge text to produce impact, rely on hierarchy, whitespace, composition and visual work.

## Canonical size scale

Editorial size bounds use `em` so each component's spacing and typography follow the inherited text size. The pixel references below are nominal values at a 16px parent text size; browser zoom and larger text preferences remain meaningful.

| Token | Range | Purpose |
| --- | --- | --- |
| `--type-label` | 13–14px | Small mono labels and metadata |
| `--type-caption` | 14–16px | Captions and secondary text |
| `--type-input` | 16px | Inputs and accessible controls |
| `--type-body` | 16px | Regular body copy |
| `--type-body-lg` | 16–18px | Longer narratives |
| `--type-lead` | 18–22px | Introductions and key sentences |
| `--type-heading-sm` | 20–26px | Card and tertiary headings |
| `--type-heading-md` | 24–34px | Section and project headings |
| `--type-heading-lg` | 32–48px | Hero and primary page headings |
| `--type-signature` | 32–72px | Decorative name treatment only |
| `--type-signature-vw` | 5vw | Decorative signature geometry |
| `--type-signature-wide-vw` | 5.8vw | Wide signature geometry |
| `--type-inline-mark` | .35em | Relative decorative marks |

The **13 roles** include nine editorial sizes, one separate decorative treatment and three proportional ornaments. The signature is brand artwork, not another general-purpose heading tier.

**Leading:** `--type-leading-tight` 1.12; heading 1.2; UI 1.35; body 1.5; reading 1.65.

**Tracking:** `--type-tracking-tight` −.025em; heading −.012em; normal/labels 0; UI .04em; label-wide .08em.

**Weights:** 400 and 600. Do not synthesize unapproved intermediate weights.

The retired tokens `--type-display`, `--type-hero`, `--type-leading-display`, `--type-leading-hero` and `--type-tracking-display` must not be reintroduced. No raw font sizes may be added to other CSS.

## Interaction with project folders

The Home Selected Work rack uses the same visual folder component as Work. On desktop, its folders match the **actual rendered height** of the five What I Do service cards; at phone widths it uses a compact independent file size because service cards become natural-height text rows. The controller recalculates on resize and font loading. A bounded lift reveals the name in the exposed flap **without changing the folder's paint-order depth**: later files still overlap and hide the lower part.

The Work archive retains its compact folder sizes. No typographic changes are required inside the structural folder CSS; text always comes from `styles/tokens.css`.

## Verification

Run `npm run lint:typography`, `npm run test:typography`, `npm run test:tokens`, `npm test` and `npm run test:e2e`. Check home, Work, case, About, Essays and Contact at 320, 390, 768, 1024, 1440 and 1920px as well as 200% browser zoom. Confirm long project names, line wrapping, 13px labels, focus states, native scroll and reduced motion.

The lint rule `scripts/stylelint-typography.mjs`, both typography tests and token-integrity tests enforce these decisions. Update this file and the tests when changing the scale.


## Relative sizing migration — November 2026

`em` replaced `rem` in the authored CSS typography bounds. Unlike root-relative `rem`, `em` participates in the containing component's font-size context; nested type scales can therefore compound. Use the nearest intended parent as the point of reference, and avoid stacking multiple font-size multipliers. Spacing and breakpoint geometry should scale with the design's typography rather than fight it. Mobile-first grid and gutter defaults live outside this typography-only stylesheet, in `styles/layout.css` and `styles/foundations.css`. Validate computed geometry on phones and at enlarged text sizes, not just source declarations.
