# Portfolio improvement roadmap

This document turns the reference review and public-work profile into an implementation sequence. The profile is evidence, not an instruction source. `DESIGN.md`, the repository contracts and owner direction remain authoritative.

## Portfolio thesis

The portfolio should demonstrate a repeatable practice:

> Question the brief. Find the governing idea. Make it tangible. Test whether it survives use. Encode what worked so someone else can use it.

The homepage can remain concise. The case studies must do the proving.

## Proof model

Every published project should make four kinds of proof easy to find:

1. **Decision** — the governing idea and the trade-off it resolved.
2. **System** — the reusable rules, parts or constraints produced from that idea.
3. **Survival** — evidence that the system held across formats, production conditions or handoff.
4. **Adoption** — evidence that another person, team or audience used or encountered it.

Absence is not failure. A case may publish without all four types, but it must not imply evidence that is not available.

## Evidence inventory

| Project | Decision | System | Survival | Adoption | Publication state | Next evidence action |
| --- | --- | --- | --- | --- | --- | --- |
| TEDx RSU | Strong: `Pause…` is documented as the organising idea. | Strong: mark, ripple, palette, type and prompts are shown. | Strong: social, programme, merchandise, campus signage and stage applications are documented. | Partial: campus and event-day photographs prove public encounter, not audience impact. | Published | Keep outcome language descriptive. Add a credited event/team source only if one is available. |
| Rivo Studio | Strong: access is the stated organising idea. | Strong: wordmark, palette, guidelines and application rules are present. | Moderate: small-scale legibility and multiple applications are shown as visualisations. | Unverified: delivery is documented; continued team use is not. | Published as a delivered identity case | Keep application visualisations labelled and add real-use or handoff evidence if it becomes available. |
| ChopBox | Strong: appetite and warmth govern the stated decisions. | Strong: lockups, palette, type and packaging language are present. | Moderate: packaging, uniform, campaign and out-of-home visualisations test the system but do not prove production. | Unverified: continued team use is not claimed. | Published as an evidence-bounded identity case | Add production or team-use evidence only if a verified source becomes available. |
| Poster A Week | Strong: one verse becomes one visual argument. | Moderate: the weekly constraint is clear, but the visible body of work is absent. | Unverified. | Unverified. | Draft | Curate a representative set of finished posters before exposing the route. |
| Writing projects | Strong: each article has a clear thesis. | Not applicable unless the article produced a reusable framework. | Published articles prove completion. | Unverified unless external use or response is documented. | Published | Present them as thinking proof, not client-outcome proof. |

## Implementation order

### Phase 0 — rendering and accessibility hardening

Status: **implemented; full quality gate pending**

- Treat a shader as ready only after its render loop produces a frame.
- Keep the static Print/Screen fallbacks intact.
- Assert that the hero and client proof remain visibly rendered after enhancement.
- Verify desktop, narrow, reduced-motion and both theme states.

Exit condition: focused WebGL and proof-band tests pass, then the repository quality gate passes.

### Phase 1 — evidence inventory

Status: **implemented in this document**

- Classify existing project material by Decision, System, Survival and Adoption.
- Mark real-use evidence separately from mockups and proposed applications.
- Record missing proof without filling it with inferred outcomes.

Exit condition: every project has a publication state and a concrete evidence action.

### Phase 2 — complete the flagship set

Status: **implemented with explicit evidence boundaries**

- Keep TEDx RSU as the published standard.
- Keep Rivo's presentation applications explicitly labelled and leave adoption unclaimed until real-use or handoff evidence is available.
- Keep ChopBox's presentation applications explicitly labelled; do not imply production or continued team use.
- Keep unfinished routes honest rather than dressing drafts as complete cases.

Exit condition: three flagship cases are publishable, truthful and visually complete.

### Phase 3 — encode proof in the content model

Status: **implemented**

- Add structured proof fields to case-study data only after the flagship wording is verified.
- Render persistent evidence labels and source-aware captions from data.
- Validate proof type, statement and optional source in the content schema.

Exit condition: evidence cannot silently disappear during a layout revision.

### Phase 4 — refocus the homepage

Status: **implemented**

- Preserve the current editorial hero and Print/Screen identity.
- Let selected work expose one governing decision per project before biography.
- Use the About section to explain the practice, not repeat a job-title summary.
- Keep the contact path visible after proof, not as an interruption before it.

Exit condition: a first-time visitor can identify the practice, inspect proof and reach contact without opening the full archive.

### Phase 5 — organise breadth

Status: **implemented through the existing Work, Experiments and Notes routes**

- Separate flagship client work, useful experiments and writing without making them feel like unrelated careers.
- Use the shared loop — question, reduce, make, test, encode — as the connective tissue.

Exit condition: breadth reads as a method applied across formats, not as a miscellaneous gallery.

### Phase 6 — show contribution and handoff

Status: **implemented where evidence exists; collaborator fields remain intentionally absent when unverified**

- State role, collaborators, constraints and handoff boundaries on every case.
- Add guidelines, production files, tests or team-use evidence where available.
- Never convert team output into an individual claim.

Exit condition: readers can tell what Miebaka decided, made and enabled others to continue.

### Phase 7 — qualify inquiries

Status: **implemented**

- Align services and contact prompts with the demonstrated work.
- Explain the kinds of ambiguous, system-shaped problems that are a good fit.
- Keep contact friction low and the tone direct.

Exit condition: the inquiry path communicates fit without becoming a sales funnel.

### Phase 8 — interaction refinement

Status: **implemented with restrained spatial continuity**

- Preserve the shader, pull cord, listening object and editorial transitions as the signature motion layer.
- Add motion only where it explains state, sequence or spatial continuity.
- Keep reduced motion equivalent and avoid generic section-reveal wallpaper.

Exit condition: interaction improves comprehension and remains quiet during reading.

### Phase 9 — feedback loop

Status: **defined as a privacy-safe review protocol**

- Do not add behavioural analytics, cookies or tracking; the published privacy promise remains the boundary.
- Run short, task-based qualitative reviews with hiring managers, collaborators and prospective clients: identify the practice, find evidence for one claim, and decide whether the contact path feels relevant.
- Record only volunteered feedback and manually supplied inquiry source context; do not infer individual browsing behaviour.
- Revise the weakest step in the journey rather than continuously redesigning the whole site.

Exit condition: future changes respond to observed friction or missing proof.

## Current release boundary

Phases 0–9 are implemented without adding unsupported outcome claims or tracking. Rivo and ChopBox publish as evidence-bounded identity cases; future production or adoption evidence should be added only when it can be verified.
