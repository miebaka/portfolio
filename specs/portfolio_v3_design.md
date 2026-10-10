# Portfolio Material 3 implementation specification

## Scope

Apply one Material 3 system across all 13 generated pages without changing URLs, SEO structure, project facts, the image pipeline or the progressive email handoff.

## Acceptance criteria

- One production stylesheet owns foundations and components.
- BIZ UDPMincho, Schibsted Grotesk and Josefin Sans are self-hosted and assigned to heading, body and label roles across every production route.
- Colour, type, shape, elevation, spacing, state and motion decisions resolve through named roles.
- Every route shares one visual grammar.
- Primary destination names match in JavaScript and no-JavaScript states.
- Copy is useful, concise, evidence-bounded and consistent with Miebaka's voice.
- Three.js is decorative, pauses off-screen and never blocks content.
- Every page has one H1, no broken images and no horizontal overflow at desktop or 390px.
- Reduced motion, keyboard focus, forced colours and missing JavaScript remain usable.

## Information architecture

Primary destinations: Work, About, Services, Writing and Contact.

The homepage sequence is proposition → selected work → services → approach → client proof → contact. Case studies use context → problem → decision → direction → applications → delivery.

## Verification

Run `npm test`, `npm audit --audit-level=moderate`, JavaScript syntax checks and `git diff --check`. Inspect all 13 routes at desktop and 390px, including font resolution, H1 count, image loading, overflow and console diagnostics.
