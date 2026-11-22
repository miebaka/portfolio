> **Historical companion study (superseded typeface choice).** This document records the alternative exploration from PR #26. The live system of record is [docs/TYPOGRAPHY-SYSTEM.md](docs/TYPOGRAPHY-SYSTEM.md), with the newest approved [DESIGN.md](DESIGN.md) decisions taking precedence over this historical study. As of 22 November 2026, the current headline/display typeface is **Geist Sans**, not the earlier Geist Serif. Non-conflicting chapter layout refinements from this study were integrated during PR #26 reconciliation.

# Editorial design system — For Living study (20 November 2026)

## Source-grounded observations

Inspected the live [For Living](https://www.for-living.it/) homepage through Firecrawl, including its source HTML and desktop accessibility structure. Its own site loads **Instrument Sans** (the live document declares `wf-instrumentsans`) and groups navigation in a floating center-aligned capsule. The lower homepage closes with a centered invitation, a separate embossed brand-image treatment, and a prominent action to start a project. That brand treatment is part of its closing CTA rather than a conventional footer element. The source uses Webflow and custom presentation effects.

The source's descriptive typography classes include `heading-style-h2_custom`, `body-xl-regular_custom`, and `body-m-regular_custom`; however, the Firecrawl extracted source did **not** expose reliable computed browser values for every breakpoint. Exact reference pixel sizes should therefore **not** be claimed. The following responsive scale is an adaptation of the observed hierarchy, not a literal pixel-for-pixel extraction.

## Fonts — licensed, pinned, and traceable

User-chosen fonts, not copied from For Living:
- **Display (historical decision, now superseded):** Geist Serif was explored (including a `GeistSerifVF.woff2` file). Current display uses **Geist Sans**, with supported regular and semibold font faces.
- **Body:** Vercel Geist Sans variable, 100–900, `Geist-Variable.woff2`.
- **Labels:** Vercel Geist Mono variable, 100–900, `GeistMono-Variable.woff2`.

The historically evaluated three families were pinned to the Vercel `geist@1.9.2` npm distribution and delivered through jsDelivr WOFF2. The unused legacy Archivo, Finlandica and Host Grotesk font assets were removed during the 22 November cleanup; this historical alternative scale is **not** shipped. The Vercel family uses SIL Open Font License 1.1. The script-name SVG is the original artwork owned by this portfolio and has not been replaced.

## Type scale

| Role | Token | Fluid rule | Usage |
| --- | --- | --- | --- |
| Cover | `--ed-cover` | clamp(4.75rem, 9.2vw, 12.5rem) | Rare hero / manifesto |
| Headline | `--ed-headline` | clamp(3.6rem, 5.9vw, 8.75rem) | Chapter headings |
| Subhead | `--ed-subhead` | clamp(2rem, 2.7vw + 1.2rem, 4.25rem) | Cards, secondary headlines |
| Lead | `--ed-lead` | clamp(1.3rem, 1.1vw + 1.1rem, 2.25rem) | Intro and persuasive copy |
| Body | `--ed-body` | clamp(1.0625rem, .35vw + 1rem, 1.27rem) | Long-form reading |
| Caption | `--ed-caption` | clamp(.75rem, .22vw + .73rem, .9rem) | Evidence metadata |
| Overline | `--ed-overline` | clamp(.68rem, .3vw + .63rem, .8125rem) | Nav, numbering, labels |

Typical display line-height .88–1.07, body 1.57–1.72; tight display tracking only where legibility permits. All long-form text remains comfortably readable and labels remain monospaced.

## Grid — adaptable magazine language

Magazine and editorial references: Swiss 12-column systems, asymmetric image and text pairing in contemporary editorial portfolios, *The Gentlewoman*'s oversized image and quiet caption contrast, *Apartamento*'s richly paced text-and-photo rhythm, and modular-grid methods used in publication design. These are general design principles, not claims that any reference uses a particular exact CSS layout.

- **Wide:** 12 equal columns, 1.65vw responsive gutter, generous outer margin.
- **Tablet:** 8 columns with preserved editorial asymmetry.
- **Mobile:** 4 columns, 12px gutter, no forced side-by-side long reading copy.
- **Homepage About:** 7-column text + 4-column image, with a one-column breathing gap.
- **Work archive:** 7:5 text/media split on desktop; single-column on mobile.
- **Essays:** prose measure of 66ch, offset from the left grid edge at desktop.
- **Services:** full-bleed, layered color-token panels, readable content aligned inside page margins.
- **Footer:** central embossed SVG signature on a single theme-matched surface, CTA above, working navigation and social links below. Existing interactive dot-matrix remains accessible.

## Responsive and interaction principles

Keep one `--paper` surface per colour mode. Make the central navigation a fixed, rounded, accessible capsule while retaining the existing Index dialog and lamp pull. The embossed element must not obstruct links; the dot matrix must remain usable by pointer, tap and keyboard. Ocean shader: shallow tropical-blue sunlight and refracted highlights by day; deep-blue water with cold moonlight, Fresnel rim and restrained glitter by night.

## Verification

Test with Node.js 24, static contract tests, Chromium desktop and mobile, colour contrast, long-term animation bounds, Lighthouse, and a visual review of the reference at common breakpoints. A passing build alone does not guarantee reference fidelity.
