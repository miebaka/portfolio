# Miebaka Portfolio Refined Editorial System

## Governing idea

The portfolio makes the decision underneath each project visible. Editorial restraint provides the visual grammar; project imagery provides the variation.

## Foundation

| Layer | Rule |
| --- | --- |
| Typography | BIZ UDPMincho gives display and heading roles an editorial voice; Schibsted Grotesk carries body and title text; Josefin Sans handles compact uppercase labels. |
| Colour | Ultramarine (`#002080`) is the identity anchor. Air, paper and midnight provide the light/dark field; the blue ramp supports hierarchy, and coral is reserved for focused interaction. Dark mode remaps semantic roles rather than individual components. |
| Spacing | 8px base rhythm. Fluid section spacing resolves to named steps. |
| Shape | Square editorial controls and image frames. Shape follows function rather than decoration. |
| Elevation | Hairline rules and tonal contrast replace ornamental shadows. |
| Motion | 120–160ms feedback and 180–240ms state changes. The homepage decision field is the one signature motion moment. Reduced motion removes non-essential movement. |

Primary page headings span the shared 12-column container. Their measure is
set by grid columns, not `ch` values, so wide viewports use the available space
without producing arbitrary three-line compositions. At 1440px and above, a
primary heading should occupy no more than two lines and remain inside the
container edges.

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
- Focus, hover, active, current, invalid, open and reduced-motion states are explicit.
- Navigation and content remain usable without JavaScript or WebGL.
- Interactive controls meet the Material 3 minimum target size; inline text links remain inline.
