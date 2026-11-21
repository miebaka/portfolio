> Historical reference study — **not an active typography system**. For all implemented type sizes, weights, families, line heights, and tracking, use [docs/TYPOGRAPHY-SYSTEM.md](docs/TYPOGRAPHY-SYSTEM.md) and its single source `styles/tokens.css`. Do not apply older reference measurements as CSS tokens.

# EDITORIAL DESIGN SYSTEM — NOVEMBER 2026

## Source study

For Living: https://www.for-living.it/ (inspected with Firecrawl, live DOM and computed styles on November 20, 2026).

Measured from a ~1905px desktop viewport (these are *reference measurements*, not copied website CSS):

| Role | Font used on reference | Measured size | Leading | New portfolio role |
|---|---|---:|---:|---|
| Main headline | PP Fragment | 81px | 89.1px (1.1) | Geist Sans / display XXL |
| Section heading | PP Fragment | 54px | 59.4px (1.1) | Geist Sans / display L |
| Paragraph | Instrument Sans | 18px | 27px (1.5) | Geist Sans / body M |
| Navigation | Instrument Sans | 18px | 27px | Geist Mono / navigational labels |
| Handwritten accent | Adobe Handwriting Ernie | 22.5–24.75px | 19.8–36px | Existing personal script SVG, not a substitute typeface |

Reference centered nav measured 771.02 × 63px on a 1905px viewport; its centered inner group sits 18px from the top. That is a proportional reference—not a reason to hard-code a 771px pill on a 390px phone.

The original reference footer is about 742px tall on the measured desktop and uses a large embossed SVG (directional drop shadows and opposing inner highlights). We reproduce the *arrangement, visual depth, and typography hierarchy* using Miebaka's own signature, links, and brand content, not the other company's artwork.

## Typography authority

The preceding table is a historical measurement of an external site, not a second scale for this portfolio. All typography must consume `--type-*` tokens from `styles/tokens.css` per `docs/TYPOGRAPHY-SYSTEM.md`.

## Grid specification

An authored **12-column, 24px baseline editorial grid** (an 8px micro-row system), reduced to 8 columns for tablets and 4 for phones.

| Size | Columns | Edge margin | Gutter | Content width |
|---|---:|---|---|---|
| Desktop ≥ 992px | 12 | clamp(20px,4.667vw,84px) | clamp(14px,1.5vw,24px) | max 1600px |
| Tablet 768–991px | 8 | responsive | responsive | page width |
| Mobile below 768px | 4 | 20px | 14–24px | page width |

Composition archetypes:
1. **Lead spread** — large sans-serif headline and quiet mono location labels. Centered headline when appropriate, not uniformly center-aligned prose.
2. **Asymmetric portrait editorial** — copy occupying 6/12 columns and portrait 4/12, with a planned one-column negative space interval.
3. **Work index** — strong typographic row and controlled photo preview. Identity is at the center while the sequence number remains in the margin.
4. **Case-study gallery** — alternating 7+5, 6+6, and full-span image modules, preserving reading order and author-supplied image aspect ratios.
5. **Long-form** — 7-column readable 60–68ch measure, supporting a 3-column sticky chapter index on desktop; no cramped sidebar on phone.
6. **Footer** — 7/5 statement/navigation spread above the large embossed handwritten signature. Contrast and spacing remain tied to `--paper` and `--ink`.

References examined: Clemson University magazine grid guidance, Design Instruction's editorial baseline/grid system, Affinity's grid guidance, and contemporary editorial spread patterns. The goal is disciplined asymmetry rather than decorative complexity.

## Water / light transport

The GPU solver remains a persistent *2.5D water-surface simulation*; it is not incorrectly claimed to be volumetric fluid dynamics.

- **High-noon mode:** directional sunlight near the surface normal, high caustic transmission through shallow water, clear blue-green water and bright white specular accents.
- **Full-moon mode:** colder and substantially weaker transmitted light, darker depth tint, more focused silver specular glints, cooler sky reflection.
- The fragment shader now estimates angle-dependent Fresnel reflection separately from refracted caustic intensity. Theme controls the lighting environment rather than merely adding a dark overlay.
- GPU detection, reduced-motion and software fallback remain mandatory for performance.

## Acceptance checks

- Confirm all page headings use Geist Sans, bodies use Geist Sans, labels use Geist Mono; ensure external font files actually resolve, or system fallbacks are clearly disclosed.
- Check centered desktop navigation and responsive Index fallback without overflow or loss of the lamp-pull theme switch.
- Compare light/dark footer colors, SVG emboss and pointer/touch/keyboard ripple; ensure the footer matches across every HTML route.
- Validate work/case/writing/contact layouts across mobile 390px, tablet 768px and desktop 1440px, including keyboard focus and 200% zoom.
- Run Node.js 24 quality workflow, browser tests, accessibility and Lighthouse performance before release.

**Sources:** https://www.for-living.it/ ; https://vercel.com/font ; https://www.clemson.edu/brand/design-elements/grid-systems.html ; https://designinstruction.info/Editorial-Design/grids.html ; https://www.affinity.studio/blog/grid-design-for-editorial-and-web-layouts
