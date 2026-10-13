# Miebaka Joshua — Refined Editorial system

Updated 10 October 2026. The detailed source of truth is
[`docs/design-system-v3.md`](docs/design-system-v3.md).

## Direction

A forest-green editorial portfolio for hiring teams and selected clients. Pale
sage paper, deep green ink, restrained accents, generous whitespace and
hairline rules form the interface. Project imagery keeps its own colour.

## Type and language

- BIZ UDPMincho: display headlines and case-study statements.
- Schibsted Grotesk: body copy, navigation and interface text.
- Josefin Sans: compact uppercase labels only.
- Copy moves from question, to decision, to a useful system a team can keep
  using. It is first-person, plain-spoken and evidence-bounded.
- “Work with me” is the contact CTA. “See the work” is the portfolio CTA.

## Motion

The homepage decision field is the signature moment. Repeated navigation,
reading and case-study interactions stay still or respond in 120–240ms. Motion
uses transform and opacity, is interruptible where needed, and respects reduced
motion. Keyboard-triggered navigation opens immediately.

## Implementation

The live cascade is deliberately small: `styles/foundations.css`,
`styles/components-v4.css` and `styles/pages-v4.css`, imported by
`styles/main.css`. Older unimported CSS folders are historical and are not a
source of truth.
