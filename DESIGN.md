# Miebaka Joshua — Refined Editorial system

Updated 10 October 2026. The detailed source of truth is
[`docs/design-system-v3.md`](docs/design-system-v3.md).

## Direction

An ultramarine editorial portfolio for hiring teams and selected clients.
Ultramarine, air, paper and midnight define the identity; coral is reserved for
focused interaction and project imagery keeps its own colour. Generous
whitespace and hairline rules form the interface.

The object of the design is not an isolated page. It is an authored system that
makes Miebaka's judgement visible: find the decision beneath the brief, build a
usable system around it, and edit until every surviving detail earns its place.

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

## Primary actions

The contact form's “Work with me” control defines the site-wide `.btn` contract.
It is a square-cornered, full-width editorial action rail with a 64px minimum
height and a directional arrow. It uses the semantic action colours:
blue-80 on ultramarine at rest, coral-75 on midnight on pointer hover, and a
theme-aware coral focus ring. Pressing compresses it to 98% for 100ms. Colour,
shadow and opacity changes resolve in 120ms; reduced motion removes the scale.
Disabled actions are visibly unavailable, while an active submission uses
`aria-busy="true"`, a wait cursor and the legible 72% busy state.

Use `.btn` only on real links and buttons that perform a primary action. The
rail should span its local content column, so it inherits the composition of a
form, section or closing statement rather than floating as a small badge. Labels
such as “Coming soon” are statuses, not disabled buttons, and must use their own
status class even when they share the same visual vocabulary.

## Implementation

The live cascade is deliberately small: `styles/foundations.css`,
`styles/components-v4.css` and `styles/pages-v4.css`, imported by
`styles/main.css`. Older unimported CSS folders are historical and are not a
source of truth.

## Quality bar

- **Specific before familiar.** Prefer language, imagery and interactions that
  could only belong to this practice and this project. A polished convention is
  not enough if it is interchangeable.
- **Proof before biography.** Show the work and the decision inside it before
  asking the visitor to trust a claim about the designer.
- **Whole before part.** Judge pages as a hiring or client journey: arrival,
  evidence, context, fit and contact.
- **Built is not done.** Review at desktop and mobile, with keyboard and reduced
  motion, then make a separate editorial pass for hierarchy, truth and craft.
- **Care must be legible.** Add detail when it reveals anticipation, judgement
  or production knowledge; remove it when it is merely decorative.
- **Variation needs an invariant.** Projects can change colour and image
  language, while the editorial grid, evidence-first copy and decision framing
  keep the portfolio recognisable.
