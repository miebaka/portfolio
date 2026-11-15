# Miebaka Portfolio Engineered Complexity System

## Governing idea

The portfolio turns complicated problems into clear creative systems. Warm editorial restraint provides the visual grammar; connected routes reveal how questions become decisions, systems and useful work. Project imagery provides the variation.

## Foundation

| Layer | Rule |
| --- | --- |
| Typography | Hedvig Letters Serif carries display headings. Finlandica Text carries body copy, navigation, labels and interface text. |
| Colour | Burgundy (`#3a0d1c`, `#561226`, `#6e1932`) is the identity anchor. Sandalwood (`#765642`, `#c6a98f`), paper (`#f4f0e8`, `#e7ded1`) and ink (`#171311`) create the warm field. Forest, storm and electric are bounded supporting accents. Dark mode remaps semantic roles rather than individual components. |
| Spacing | 8px base rhythm. Fluid section spacing resolves to named steps. |
| Shape | Square editorial controls and image frames. Shape follows function rather than decoration. |
| Elevation | Hairline rules and tonal contrast replace ornamental shadows. |
| Motion | 120–160ms feedback and 180–240ms state changes. Route lines and junctions are restrained orientation devices. Reduced motion removes their transitions without hiding content. |

Primary page headings span the shared 12-column container. Their measure is
set by grid columns, not `ch` values, so wide viewports use the available space
without producing arbitrary three-line compositions. At 1440px and above, a
primary heading should occupy no more than two lines and remain inside the
container edges.

The canonical desktop frame is 1800px wide with 84px outer margins, twelve
114px columns and eleven 24px gutters. The resulting 1632px content width is a
hard maximum; full-bleed fields may carry colour, but content and media do not
cross the grid edges. Type follows the Figma roles: 10.9/12.5/14px labels,
14/19.2px body, 24/48px headings, and 48/64/88/136px display.

## Metaphor limits

The interchange idea describes connected thinking, not roads. It appears once as
an original abstract route study on the homepage and may reappear only as
functional route lines, junctions or ordered sequences. Do not add highway
photography, traffic motifs, pseudo-maps or decorative complexity. Essential
content always remains ordinary semantic HTML beneath any visual route.

## Components

- Navigation uses a tonal container, selected destination state and adaptive mobile menu.
- Buttons use a filled primary style, square shape and visible press/focus states.
- Editorial rows use rules, type hierarchy and restrained state feedback rather than card containers.
- Text fields retain labels, use ruled inputs and show inline errors.
- Experience rows use native `details` and `summary` semantics.
- Project media uses intrinsic dimensions, explicit aspect ratios and responsive sources.
- Homepage work rows expose one persistent project image; imagery is never hover-only proof.
- Published work and studies in progress use separate hierarchy and scale.
- Case-study accent colour is project-specific, but grid, typography, evidence labels and navigation remain shared.
- Decision maps render only documented proof records; reflection pairs render only when both authored statements exist.
- About uses a semantic practice timeline; Notes exposes four thematic routes; Contact makes fit, context and follow-through explicit.
- Long articles receive progressive contents, reading-progress and next-note navigation.

## Content rules

- One idea per section.
- Labels describe the destination or outcome.
- No decorative status, repeated availability or non-essential metadata.
- Case-study claims stay bounded by documented work and supplied facts.
- Every proof statement is labelled as documented or bounded evidence.
- Experiments is the public name for spatial and self-initiated work; Notes is reserved for writing.
- Voice is direct, observant and evidence-minded.
- “Work with me” is the canonical contact CTA; “See the work” is reserved for portfolio navigation.

## Accessibility and resilience

- Native HTML remains the interaction layer.
- Focus, hover, active, current, invalid and open states are explicit.
- Navigation and content remain usable without JavaScript or WebGL.
- Interactive controls meet the Material 3 minimum target size; inline text links remain inline.
