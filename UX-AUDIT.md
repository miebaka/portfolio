# PORTFOLIO UX AUDIT — 2026-11-20

**Reference:** https://lawsofux.com/laws/ (reviewed 2026-11-20).
**Scope:** Home, Work, About, Essays, Experiments, Contact, footer, themes, and interactive visual systems.

## Scoring policy

A claim of **9/10 on every UX law** cannot be verified by visual inspection alone. Laws of UX are descriptive models, not a standardized per-site scoring instrument. This audit records actionable design criteria and a verification plan. No numerical scores are manufactured. An individual score of 9+ is withheld until scenario tests, accessible browser checks, and performance measurements support it.

A law is **implemented** when a concrete product decision addresses it, **partially implemented** when evidence is incomplete, and **requires users** where real task observation is needed.

## 30 laws — mapping and acceptance criteria

| Law | Product application | Evidence and acceptance |
|---|---|---|
| Aesthetic-Usability Effect | Consistent surfaces, typography, and purposeful motion | Inspect each breakpoint for visual cohesion; actual usability still tested separately |
| Choice Overload | Remove the grid/list choice from Selected Work | One presentation and one obvious All Work exit |
| Chunking | Divide work, about, services, clients, contact into recognizable regions | Landmark hierarchy and readable section headings |
| Cognitive Bias | Avoid unsupported claims and fabricated client metrics | Authored and published evidence only |
| Cognitive Load | Remove surplus decorative labels and unnecessary role copy | Clear proposition, featured cases, primary CTA |
| Doherty Threshold | Keep response fast and avoid CPU-bound fluid simulation on software GPUs | Lighthouse performance and blocking-time budgets |
| Fitts's Law | Keep target hit areas at least 44 CSS pixels | Touch/keyboard checks on links, controls and footer canvas |
| Flow | Continuous section sequence and non-blocking transitions | No forced scroll-jacking; users can navigate backwards |
| Goal-Gradient Effect | Clear progress through five services and short paths to cases | Service numbering and links to evidence |
| Hick's Law | One Selected Work list; focused destinations | View toggle removed; quick navigation |
| Jakob's Law | Semantic links, nav, contact form, familiar affordances | Native keyboard behavior and direct case links |
| Law of Common Region | Service card boundaries and work rows | Consistent grouping without unrelated decoration |
| Law of Proximity | Couple titles, metadata, supporting proof and CTAs | Card and section spacing respects hierarchy |
| Law of Prägnanz | Simplify visual treatment and hierarchy | One page surface per theme, restrained interaction |
| Law of Similarity | Apply shared label / card / button patterns | Common type scale and interaction states |
| Law of Uniform Connectedness | Real links connect each service to an evidence chapter | Every link resolves to a published chapter |
| Mental Model | Light and dark modes behave conventionally | Lamp pull changes actual page colors and stays persistent |
| Miller's Law | Break down material rather than present a long undifferentiated grid | Three featured cases and five service cards |
| Occam's Razor | Prefer sticky CSS to custom scroll choreography | No scroll library required for Jacobsen-style overlap |
| Paradox of the Active User | Interactive controls should explain themselves | Keyboard-exposed footer dot matrix with label |
| Pareto Principle | Prioritize work, contact and service evidence | Core journeys surfaced; supporting sections secondary |
| Parkinson's Law | Avoid overlong interaction and cumbersome forms | Clear contact prompt and concise field set |
| Peak-End Rule | Strong hero and useful final contact CTA | Footer decorative interaction does not block CTA |
| Postel's Law | Forms accept reasonable inputs; content output stays escaped | Validate existing form behavior and escape inserted text |
| Selective Attention | Remove redundant visual noise in the hero and archive | No PORTFOLIO / 2026 badge, no competing grid button |
| Serial Position Effect | Highest priority work early; contact at the end | Selected Work near hero and direct closing email |
| Tesler's Law | Keep real complexity inside rendering code | Mathematical logo sizing happens automatically |
| Von Restorff Effect | Primary action is clear without making every element loud | All Work / email receive distinct yet consistent affordance |
| Working Memory | Persistent grouping and simple navigation | Short work list and indexed cases |
| Zeigarnik Effect | Use descriptive, authentic case pathways, not false cliffhangers | Clear evidence links and complete published stories |

## Implementation scope of this revision

1. Remove the pseudo-label on the landing page and the availability paragraph in the closing section.
2. Keep the hero pinned behind the following section, respecting browser scrolling and reduced motion.
3. Standardize document and section backgrounds through the existing `--paper` token. Distinct artworks and coloured service cards are **content layers**, not additional page backgrounds.
4. Make the five services full-bleed and map their colours to existing `--ref-*` tokens.
5. Remove Selected Work grid mode and center the title within the numbered row.
6. Make the footer signature pointer-, touch-, and keyboard-interactive, without leaving an overlay that blocks the footer.
7. Fit client logos to a common optical area using `W = sqrt(A × aspect)`, `H = sqrt(A / aspect)`, constrained to a fixed target rectangle, preserving each artwork's aspect ratio.

## Outstanding research / verification

- Real user testing of find-a-project, find-services, change-theme, and contact journeys, including screen-reader users.
- Multi-device GPU checks for fluid visual realism and long-session frame pacing.
- Compare final rendered states at 390, 768, 1440 and 1920 CSS pixels, including 200% zoom and reduced motion.
- Verify footer dot matrix does not overlap navigation or email CTA and does not capture scroll gestures.
- Run full Node.js 24 quality workflow including Chromium, contrast, Lighthouse and shipped dependency audits.

The UX principles are lenses for design, **not a claim that aesthetic consistency alone proves usability**.
