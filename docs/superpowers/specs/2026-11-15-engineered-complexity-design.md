# Engineered Complexity — Portfolio Design Specification

**Status:** Approved
**Date:** 15 November 2026

## Intent

Evolve Miebaka Joshua's portfolio from a polished but emotionally cool editorial system into a warmer, more personal system that demonstrates strategic curiosity, controlled ambition and the ability to make complexity useful.

## Governing idea

**Many paths. One clear direction.**

The Takaosan Interchange is a structural metaphor, not a literal site theme. The portfolio should behave like engineered complexity: layered, interconnected and easy to navigate. The interchange appears once as a personal thesis; road graphics, map pins and motorway-sign styling must not become decorative motifs.

## Goals

- Make the portfolio recognisably Miebaka within 15 seconds.
- Preserve professional credibility while adding warmth, intensity and curiosity.
- Frame projects around the problem, governing decision, system and evidence.
- Connect Work, About, Notes and Experiments into one coherent practice.
- Preserve the static-site architecture, complete HTML fallbacks, accessibility and performance.

## Anti-goals

- A highway-themed portfolio.
- Unsupported strategy, leadership or outcome claims.
- Motion used as spectacle.
- Burgundy used as a full-site wash.
- New framework or animation dependencies.
- Any interaction required to access essential content.

## Visual system

- Warm paper and ink replace cool white/blue as the dominant emotional field.
- Burgundy is a controlled signature colour.
- Sandalwood provides quiet warmth.
- Existing ultramarine remains a supporting structural colour and project colours remain project-owned.
- Display typography remains Hedvig Letters Serif; Finlandica remains body and UI.
- Density alternates between open, structured and dense sections; no page stays dense for more than two consecutive sections.

## Core tokens

- `--ec-burgundy-900: #3a0d1c`
- `--ec-burgundy-800: #561226`
- `--ec-burgundy-700: #6e1932`
- `--ec-burgundy-100: #f2dde3`
- `--ec-sandalwood-700: #765642`
- `--ec-sandalwood-300: #c6a98f`
- `--ec-paper: #f4f0e8`
- `--ec-paper-deep: #e7ded1`
- `--ec-ink: #171311`
- `--ec-charcoal: #292320`
- `--ec-mist: #d8d5ce`
- `--ec-forest: #28382d`
- `--ec-storm: #111827`
- `--ec-electric: #e06046`

All pairings must meet WCAG 2.2 AA in context.

## Homepage

- Replace the hero claim with: “I turn complicated problems into clear creative systems.”
- Support with plain, evidence-bounded positioning.
- Add a compact personal-thesis section after the hero: “There is a system behind the complexity.”
- Use a licensed overhead Takaosan image only after rights are verified. Until then, ship an original CSS/SVG route study, clearly treated as abstract and replaceable.
- Keep three flagship cases and expose problem, decision, contribution and evidence before click-through.
- Present the practice as Question → Decide → Design → Test → Equip.
- Close with “Bring me the complicated part.”

## About

Open with: “My mind takes the long route. My work should not make you do the same.”

Connect environmental systems, design practice, marketing, production, church leadership and tool-building as one practice. Add specific interests without publishing private health, financial, relationship or psychological material.

## Case studies

Use: Context → Actual problem → Governing decision → System → Applications → Constraints → Evidence → Reflection → Next route.

Add compact decision maps and honest “What I would protect / What I would improve” conclusions only where source evidence supports them.

## Motion

- Calm infrastructure: 120–240ms, transform/opacity/rule extension.
- Rare storm moments: 500–700ms maximum.
- No parallax, cursor followers, scroll hijacking, continuous route animation or particles.
- Respect `prefers-reduced-motion`.

## Accessibility and performance

WCAG 2.2 AA minimum; semantic HTML, visible focus, non-colour states, complete non-JS content, responsive images, explicit dimensions and no new client or animation framework.

## Final rule

For every proposed element ask: **Does this help the visitor navigate complexity, or does it merely add more complexity?** Remove it if the answer is the latter.
