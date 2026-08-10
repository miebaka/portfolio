# Visual Re-direction — Design Spec (Refined Editorial)

**Phase 2 of 3.** Builds on the locked copy spec
(`2026-08-10-copy-and-positioning-design.md`). Canonical visual reference:
`prototype/home.html` (approved 2026-08-10).

> Supersedes the "Quiet Gallery" visual direction in `engineering-specification.md`
> where they differ. The token architecture, accessibility contract, and voice rules
> from that document are retained in full. This is a re-skin at editorial scale, not
> a re-architecture: same tokens, same three type roles, same five colours, pushed
> to magazine confidence.

## Owner decisions (locked)

- **Direction:** Refined Editorial. Big grotesk display, Libre Baskerville kept for
  reading warmth, tiny palette, wide margins, premium/mature register.
- **Motion:** one signature moment (hero) + restrained micro-motion. Honest and
  reduced-motion safe (Norman/Nielsen).
- **No serif-italic display accent.** Headlines are pure grotesk. Emphasis via
  weight/colour, never a font-swap or italic. `[owner change 2026-08-10]`

## The masters, as build rules

- **Rams — less but better:** every section is one idea; nothing decorative that
  isn't doing a job; detail perfected.
- **Vignelli — bold through restraint:** two type roles carry everything (grotesk
  display + serif reading), one grid, five colours, clay on ~3 elements per screen.
  Scale and whitespace create impact, not effects.
- **Norman — honest affordances:** interactive rows/links visibly respond; every
  action gives feedback; the signature motion never hides a control.
- **Nielsen — usability rail:** nav always reachable, state always visible, focus
  rings intact, nothing sacrificed to art.

## System deltas (from current build)

1. **Type scale (`styles/tokens/typography.css`):** raise the top of the ramp so the
   home hero statement can command the page (target ~clamp(2.75rem, 8vw, 7.5rem) for
   the hero statement). Add an editorial `--step-statement` if needed; keep the rest
   of the ramp calm so size stays earned.
2. **Hero:** flip the golden split to **statement-major (1.618fr) : portrait-minor
   (1fr)**. Sentence case (drop `text-transform:uppercase`). Serif lede retained
   beneath the statement. Portrait on the minor column with a clay location notch.
   Single soft CTA "See the work". Signature motion = split-text reveal on the
   statement + subtle portrait parallax on cursor (reduced-motion: none).
3. **Selected work:** replace the side-scrolling square rail (`.sl-rail`) with an
   **editorial index**: numbered rows, project name at display scale, category · year,
   row indents + name → clay on hover/focus. Rebuild in `js/render/projects.js`.
   (Full-bleed imagery moves into the case studies, not the home index.)
4. **Capabilities:** render as a numbered editorial index (name grotesk, meta serif),
   matching the work index rhythm.
5. **Section rhythm:** wider page margin, hairline rules between index rows, one idea
   per section, generous vertical space.
6. **Copy + CTA:** apply the phase-1 copy; replace every "Start a project" /
   "Send message" with **Work with me**.
7. **Contact:** big grotesk question + single clay "Work with me"; keep the accessible
   form (labels, autocomplete, aria) intact.
8. **Testimonial block:** omitted for now (no quote), per phase-1 decision.

## Build order (each verified in the browser, committed separately)

1. Tokens: type scale.  2. Home hero (CSS + `index.html`).  3. Work index (CSS + JS).
4. Capabilities index.  5. Home copy + section rhythm.  6. About / Services / Work /
Contact pages.  7. Case-study template polish.  8. Signature + micro motion.
Then phase 3 (code hardening).

## Guardrails (unchanged, enforced throughout)

- No hardcoded design values in components; everything via tokens.
- No em/en dashes in user-visible strings. Sentence case except small-caps labels.
- WCAG 2.2 AA: contrast, focus, keyboard, reduced-motion.
- Selector depth ≤ 3, no `!important`, no inline styles.
