# Intent, quality and artistry implementation plan

## Thesis

The portfolio does not need a new aesthetic. Its ultramarine (`#002080`)
editorial system
already has a point of view. The 20X opportunity is to make that point of view
more legible in the visitor journey, make project judgement visible before a
click, and encode a standard future work must meet.

The source talk contributes four operating principles:

1. Have a point of view before the tool supplies a generic one.
2. Encode standards in the means of production, not only in one person's taste.
3. Refuse to confuse a finished-looking build with a good, coherent experience.
4. Use faster production to fund more exploration, specificity and craft.

## Current diagnosis

### Keep

- The `54dcc41` production look remains the visual baseline.
- The full-height ultramarine hero is distinctive, restrained and authored.
- The serif/grotesk/label type system creates a strong editorial hierarchy.
- Project imagery is allowed to bring its own colour into the system.
- The site already has strong resilience, accessibility, performance and
  evidence-bounded content contracts.

### Improve

- The work archive lists title, category and year but withholds each project's
  proposition. It makes visitors do extra work before they can judge relevance.
- The homepage explains services and biography, but does not plainly state the
  repeatable standard behind the work.
- The design documentation describes visual rules more clearly than editorial
  judgement, which makes future AI-assisted changes vulnerable to generic polish.
- Only one case study is publicly complete. Deeper gains depend on publishing
  evidence-rich Rivo and ChopBox cases, not inventing proof.

## Implemented now

### 1. Publish the practice standard on the homepage

Add a three-part editorial section between selected work and biography:
`Find the decision`, `Build the system`, and `Edit until it holds`.

Success criteria:

- A visitor can explain Miebaka's method after a fast scan.
- The section belongs to the existing editorial system rather than introducing
  a new card language.
- The content remains readable without JavaScript and at mobile widths.

### 2. Make the work index proposition-led

Expose each project's existing, evidence-bounded tagline in the archive row.
Keep publication status explicit and unfinished projects non-interactive.

Success criteria:

- A hiring manager can tell why each project matters without opening it.
- No outcome, role or impact claim is invented.
- Published and coming-soon states stay unambiguous.

### 3. Encode the standard

Extend `DESIGN.md` with rules for specificity, proof, whole-journey editing,
legible care and controlled variation. Add automated tests for the new practice
section and proposition-led archive. Add an executable intent-quality gate that
compares the active documentation with `styles/foundations.css`, rejects stale
forest-green language, rejects generic project propositions and requires every
published case to expose context, decision, system and production evidence.

## Next phases requiring new evidence or owner input

### Phase 2 — Complete the proof set

Publish Rivo and ChopBox only after each has a precise brief, verified role, the
decisive design choice, system rules, production evidence, final imagery and an
evidence-bounded outcome. Three complete cases will change the portfolio more
than ten shallow thumbnails.

### Phase 3 — Add project-specific care notes

For every published case, identify one detail a visitor would not expect: a
production constraint anticipated, an accessibility decision, a failed route
rejected, or a rule that kept rollout coherent. Add it only when evidence exists.

### Phase 4 — Stress the whole journey

Review Home → project → next project → contact, Work → project → services →
contact, and Writing → about → work at 390px, 768px and 1440px; keyboard-only;
light/dark; reduced motion; slow network; and JavaScript unavailable.

### Phase 5 — Protect the strange

Reserve one controlled experimental surface for self-initiated work. It may
change interaction or visual language, but must preserve navigation,
readability, reduced-motion behavior and a clear connection to the practice.

## Release gate

1. Content, unit, integrity and contract tests pass.
2. End-to-end, accessibility and visual tests pass.
3. Visual baselines are reviewed, not blindly updated.
4. Performance budgets and Lighthouse pass.
5. Browser review checks hierarchy, mobile wrapping, focus order, reduced
   motion, console errors and the complete visitor journey.
6. Deployment is complete only after the exact commit is live and verified.
