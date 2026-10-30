# Portfolio authorship and AI-pattern review

Reviewed 30 October 2026. Baseline: GitHub main `0acccad`.

## What the evidence supports

There is no reliable visual signature proving that a website was built with AI. An eyebrow is a small label above a heading. It can be redundant; it is not evidence of authorship. Shared fonts, three-column grids, rounded cards, gradients, em dashes and tidy code likewise cannot establish who or what made a site.

A useful distinction is between (1) explicit provenance, (2) patterns that make work feel interchangeable, and (3) quality defects. Only the first directly speaks to origin. The second is an editorial judgment; the third is a defect regardless of the tool used.

Research on web vibe coding describes homogenization risks and a framework for resisting default outputs, rather than a validated classifier for websites. It is a research preprint combining literature/platform review, risk analysis and case studies; its conclusions should not be turned into a numerical AI probability. [Shin et al., 2026](https://arxiv.org/abs/2603.13036)

The genjutsu authors catalogue numbered eyebrows, generic steps, artificial status, decorative movement and hollow copy from their own tool/evaluation work. That makes the catalogue useful as a critique checklist, but not independent proof that a given site used a model. They explicitly allow patterns that have a reason to exist. [Field guide](https://genjutsu.athevon.dev/docs/tells)

## Scope and method

Inspected 15 primary authored HTML routes plus the legacy redirect: home, Work, About, Services, Contact, Experiments, Notes, Privacy, 404, the legacy Community redirect, four project routes and two articles. Reviewed shared navigation/footer, dynamic renderers, content domains, case-study fallbacks, CSS, motion, listening integration, build output, contact handling, metadata, deployment configuration and existing tests. Read project Git history to identify current changes, without treating commit phrasing as a detector.

Visual and browser results are recorded in the accompanying verification notes. This is a design/content/implementation review, not a penetration test, clinical profile, forensic determination of asset authorship or independent verification of employment and client claims.

## Changes made

- Removed “About me,” “How I work” and “Claims, with somewhere to point” above larger headings.
- Removed “Evidence ledger” and proof-type labels above evidence statements. Retained the statements and the distinction between documented and bounded evidence.
- Removed the three decorative method numbers on About.
- Removed all fifteen numbered chapter eyebrows across the three published cases. Kept actual chapter headings, anchors and chapter navigation.
- Moved project identity from a small line above the proposition into the structured project facts. The name is retained rather than discarded.
- Removed the unused “Selected work” eyebrow from the locked-case renderer.
- Folded “Next project” into the destination link itself rather than placing it above the link.
- Removed the decorative footer group labels “Explore” and “Social,” retaining accessible group names, and removed “Get in touch” above the menu's email address.
- Removed the listening widget's separate status eyebrow. Its initial display is now “Listening history on Last.fm.” A successful response supplies “Listening now: …” or “Last listened: …” within the track text. The hard-coded song previously presented as current listening is gone.
- Rebalanced the case-study grid after removing its label column. Updated the progress control to read chapter navigation or the actual heading, so accessible names do not degrade to anonymous chapter numbers.
- Synchronized authored fallbacks with the renderer and removed obsolete label styles. Updated the design guidance to discourage reintroducing decorative eyebrows.

Functional labels remain: form labels, service controls, navigation, project facts, evidence confidence, dates, image captions, image plate identifiers and real section headings. These carry information rather than repeat a heading. The listening widget can still show an earlier successful response during a later network failure; stronger freshness handling is a follow-up opportunity.

## Findings across the portfolio

| Area | Finding and evidence | Assessment | Next action |
| --- | --- | --- | --- |
| Home | Hero says “I design brands, build useful things & ask a lot of questions.” Profile repeats “useful,” “systems,” “decisions” and “handoff.” | Personal intent is present, but the abstract language could describe many designers. Moderate editorial issue, not authorship evidence. | Name the kinds of work and constraints that recur in your actual briefs. Replace one abstract paragraph with a specific, verifiable example. |
| Home fallback | Before JavaScript, Rivo and ChopBox still said “Coming soon” while their data and case routes are published. | Concrete inconsistency. Visitors with scripts unavailable get a different publication state. | Align the fallback with published project data. |
| Home listening | A fixed song appeared under a current-listening claim before a response. | High-confidence manufactured-live-status problem. | Fixed with a neutral initial state and response-driven text. |
| Work | Three complete cases have project imagery and specific categories; unfinished projects occupy a separate register. | Real evidence and useful hierarchy. Retain. | Expand only when more owner material is ready. |
| About | “Ask the annoying question,” “one decision,” “unglamorous part” form a polished three-step manifesto. | Familiar copy rhythm. The specificity is in the experience entries, not this framework. | Shorten the manifesto and ground each surviving principle in an actual decision or production constraint. |
| About / Rivo | Experience dates show Jun–Nov 2024, while the Rivo project year is 2025 and the context says in-house work. | Owner confirmed on 30 October that 2025 is the publication year. | Case facts now explicitly label 2025 as “Published”; employment dates remain 2024. |
| Cases | All three use Question → Governing decision → System → System in use → What survived, plus a proof block. | Useful consistency becomes conspicuous when the rhetorical arc is identical. Removed repeated eyebrows; retained the supported content. | Allow project-specific chapter structures in a later content/schema change. Do not invent research, testing or commercial outcomes to fill them. |
| Cases | “Stress-test,” “limited vocabulary,” “signal,” “system,” “useful” recur. | Stronger impression of generic authorship than any one font. | Substitute the actual logo, palette, application and production choice wherever an abstract claim adds no detail. |
| Cases | Evidence confidence and visualisation caveats explicitly bound what images can prove. | Retain. Credibility is more valuable than avoiding a supposedly AI-like phrase. | Consolidate repeated caveats if desired, while keeping each mockup's status clear. |
| Case media | Full images, intrinsic dimensions, descriptive alternatives, captions and sequential plates. | Informative editorial structure. A plate beneath an image is not an eyebrow above a heading. | Keep unless you prefer simpler captions; verify provenance from originals before making authorship claims. |
| Services | “Typical outputs” and “Good fit” give practical service detail. Some descriptions repeat the same clarity/usefulness promise. | Functional labels are useful; descriptions could be more specific. | Add examples of genuine deliverables and engagement boundaries when available. |
| Contact | An actual endpoint validates fields and handles failure states; it is not merely a decorative submit button. | A substantive counterexample to the “polished shell, no function” pattern. | Existing contact tests remain the verification basis; no unsolicited messages were sent. |
| Experiments | The spatial artwork field is a deliberate separate mode, with a drag/scroll instruction and keyboard handling. | Distinct authored interaction; the cue has a navigational purpose. | Keep. Evaluate artwork decode time separately; do not remove the instruction for cosmetic reasons. |
| Notes / articles | Two substantive pieces have descriptive topics, contents/progress and reading navigation. | Content is more specific than generic “insights” cards. Articles' external facts were not independently re-researched here. | Any later editorial review should verify their quotations, numbers and references before publication changes. |
| Privacy / 404 | Useful supporting pages and site-specific navigation. Privacy copy makes claims about actual behavior. | Supporting-page completeness is good quality, not proof of human origin. | Keep privacy claims synchronized with future third-party integrations. |
| Shared visual system | Display serif, compact uppercase typography, ultramarine, generous space and rules. | Common editorial ingredients; their presence cannot identify AI. The work imagery gives them context. | Removed redundant label usage. Keep the existing identity rather than introduce a different fashionable template. |
| Motion and texture | Shader hero, line-field canvas, native custom cursors, animated portrait, logo marquee, pull-cord theme switch and progress rail coexist. | Individually intentional, collectively potentially busy. Newest cursor/texture changes are recent deliberate repository work. | Retain in this scoped removal. A future simplification pass should rank effects by purpose and measured cost. |
| CSS architecture | Some rules contain sequential overrides inside a declaration block; e.g. heading sizes then a font shorthand, and borders then `border:0`. | Maintenance debt and source of accidental changes. It does not demonstrate AI authorship. | Simplify with visual checks in a separate cleanup; do not rename/rewrite the whole system to obscure its history. |
| Metadata | Explicit canonical/social metadata and project-specific image handling exist. | Positive specificity. `og:locale` uses `en_US`, a generic default for a Lagos-based portfolio. | Confirm intended locale before changing it; this is not a detector. |

## What “invisible markers” actually means

### Explicit records in source and services

Generator meta tags, “Made with…” badges, vendor-specific scripts, domains, project IDs, comments naming tools, prompt files, package names and Git co-author lines can reveal use of a tool. They may identify a host, framework or one assisted contribution rather than authorship of an entire site. React, Three.js, Vercel, ordinary class names and conventional formatting are not AI signatures.

The inspected runtime is a static HTML/CSS/JavaScript portfolio with a small React/Three.js shader island. No builder badge or generator meta tag identifying an AI site builder was found in the authored pages inspected. The repository contains a `.claude/launch.json` development configuration and code that credits adapted third-party interactions. The build copies registered routes and the runtime dependency graph, rather than publishing that configuration or this review. Those records are not defects and have not been erased. Preserve attributions and licenses.

### Content credentials and media watermarks

Some assets can contain signed provenance such as C2PA manifests, software metadata or imperceptible provider-specific watermarks. These concern particular files and their processing history. C2PA explains that provenance can authenticate recorded history but cannot establish that the depicted claim is factually true. Missing credentials do not prove human authorship. [C2PA explainer](https://c2pa.org/specifications/specifications/2.2/explainer/Explainer.html)

Google's SynthID documentation describes imperceptible watermarking with specific detection and transformation limitations. That is a different mechanism from looking for stylistic quirks in a page. [SynthID documentation](https://ai.google.dev/responsible/docs/safeguards/synthid)

This review did not run a cryptographic provenance validator or a provider watermark detector across the image/video library. Browser screenshots and optimized delivery files cannot establish the full provenance of original assets. No metadata, watermark, credit or authorship record was removed.

### Implementation symptoms that are easy to miss

Dead buttons, empty links, fabricated metrics, frozen “live” activity, stale fallback HTML, repeated generic alt text, heading-only decoration, missing keyboard behavior, motion that ignores reduced preferences, duplicate CSS overrides and inaccurate structured data can expose unreviewed output. None is specific to AI. Here, the concrete examples were the listening initial state and stale homepage publication fallback; both can be corrected without pretending that visual polish proves authorship.

NIST treats provenance, labeling, watermarking and detection as distinct approaches with limitations; it does not provide a universal website-authorship test. [NIST synthetic content report](https://www.nist.gov/publications/reducing-risks-posed-synthetic-content-overview-technical-approaches-digital-content)

## Priorities after this change

1. Rivo chronology resolved: 2025 is publication, now labelled explicitly. Retain the separate 2024 employment dates.
2. Rewrite the repeated abstract case-study/manifesto phrasing using your own documented decisions and constraints. Preserve factual boundaries and original article voice.
3. Decide whether every case needs the same five-part story; allow structure to follow available evidence rather than filling a template.
4. Measure whether the shader, texture, cursors and other effects help reading and browsing, then simplify deliberately.
5. Audit original media provenance if asset origin matters to a client or publisher. Do not infer it from this website's aesthetic.

The most convincing improvement is specificity: actual work, accurate states, consistent dates, real constraints and a voice that could only belong to this practice.

## Verification completed

- Standard `npm test`: 147 Node checks passed, including content, navigation, case narratives, contact handling, motion, integrity and visual contracts; build passed.
- CSS contract, documentation registry and production size budgets passed.
- Browser audit: all 15 primary routes at 1440, 390 and 320 pixels (45 route/viewport checks) had no horizontal overflow, script exceptions or removed eyebrow classes. The separate About-number removal was then verified in the visual suite.
- Browser interaction/accessibility suite: 145 passed, one existing skip, and one setup failure caused by the source preview missing a generated Three.js vendor file. Restoring the generated preview asset made the targeted 404 check pass on both desktop and mobile. Overall coverage: 146 passing cases, one existing skip; the initial run was not completely green.
- Visual suite: 35 passed with updated baselines; one homepage test hit a shared artifact-directory cleanup collision. The homepage test passed when rerun with its own output directory. All 36 visual cases are covered; no comparison threshold was weakened.
- Live-status response checks: unavailable response retains the neutral history link; a playing response shows the verified track and live state; a recent-track response shows last-listened text and a false live state.
- Built-output smoke check: all 15 primary routes loaded without failed resource responses or removed labels; Rivo displays “Published 2025.”
- Git diff whitespace check passed. No contact message was sent and no factual outcome was invented.

The review and implementation are prepared on a separate GitHub branch for review. They are not a claim that production has been deployed.
