# Portfolio Design Engineering Review

**Status:** Implemented, with the navigation decision superseded on 23 October 2026
**Date:** 13 October 2026  
**Visual authority:** The restored production site at commit `54dcc41`  
**Supporting sources:** `design-thesis.md` version 5.0, owner answers, production code, deployed site, frontend audit, backend audit

## Decision

The current production website is the visual baseline. Its editorial restraint, typographic character, Ultramarine identity, image treatment, spacing, sharp geometry and quiet interaction language must be preserved. This work is not a revival of the rejected thesis-aligned redesign.

The design thesis remains useful as a requirements inventory, but it is subordinate wherever it conflicts with the restored site's visual character. Structural changes are allowed only when they improve proof, navigation, accessibility, conversion or maintainability without making the site busier or more generic.

## Current state

The live deployment, local checkout and `origin/main` match commit `54dcc41`. The repository builds 14 pages and passes 20 integrity tests. Production uses one bundled stylesheet, a small ES-module graph, responsive image variants, strong security headers and no moderate-or-higher dependency vulnerabilities.

The green build does not mean the portfolio is complete. Several tests explicitly protect an older product contract: locked case studies, missing Explorations and Community routes, the old navigation model and incomplete conversion behavior.

## Design preservation contract

The following qualities are protected:

- The present Ultramarine, paper and ink visual world.
- The current editorial typography and typographic tension.
- The spacious composition and low visual density.
- Sharp surfaces and restrained functional rounding.
- Authored imagery without interface-driven recolouring.
- Quiet motion that follows user action.
- The current portrait treatment and general photographic tone.
- The existing footer signature and overall page atmosphere.
- The site’s warm, direct and professionally exact language.

The implementation must not introduce dashboard composition, generic component-library styling, decorative cards, excessive borders, bubbly Material geometry, unrelated accent colours, gratuitous motion or dense proof modules.

## Primary problems

### The work cannot currently be evaluated

Every professional case study is locked. Homepage project cards are non-interactive articles and the Work route exposes disabled “Coming soon” states. The site therefore claims senior design capability without letting hiring managers inspect a complete project.

TEDx RSU must become the first complete flagship case study. Its structure should be adapted to the current site's editorial language rather than copied mechanically from the design thesis.

### The information architecture is incomplete

Explorations and Community are absent. The restored navigation is visually coherent but does not provide the expanded route system requested by the owner. New destinations must be introduced with the same typographic and spatial restraint as existing navigation.

### The homepage does not build proof in the strongest order

The current sequence places the personal introduction before selected work. Carefully moving selected work earlier would let the portfolio establish competence before biography. This change should reuse the existing sections and treatments rather than invent a new homepage system.

### Contact is not a functioning web conversion

The contact form validates only name and email, does not require a message and ultimately opens a `mailto:` URL. The production `/api/contact` route returns 404. The primary conversion therefore depends on a configured mail client and cannot report delivery success or failure.

### Tests validate the wrong contract

The current tests pass because they require locked case studies and the restored route set. Tests must become an executable expression of the approved visual baseline plus the new structural requirements.

## Proposed information architecture

> **Implementation update, 23 October 2026:** The owner approved a tighter
> five-destination public navigation: Work, About, Experiments, Notes and
> Contact. Home remains available through the identity mark; Services and
> Community remain built routes but are no longer global destinations. The
> permanent mobile bottom bar was approved because the final set fits five
> stable destinations and provides direct one-tap wayfinding. This update
> supersedes the proposal below where the names or navigation behavior differ.

### Primary destinations

- Home
- Work
- Explorations
- Community
- About
- Services
- Writing
- Contact

Privacy remains a footer destination. CV download appears within About and the expanded navigation rather than as a top-level page.

### Navigation behavior

Desktop keeps the current visual treatment. It gains an Index entry that opens a restrained full-screen editorial layer containing the complete destination set, contact action, CV action and preferences. The persistent bar should not become crowded.

Compact layouts retain a small, direct control model. A permanent five-item bottom bar should be introduced only if measured testing proves it improves wayfinding without competing with content. The default recommendation is to keep the current compact control and strengthen the Index layer first.

### Homepage order

1. Existing full-screen proposition.
2. Selected work using the current project-card language.
3. Existing profile and portrait section.
4. Services using a refined form of the current presentation.
5. Client proof with an operable pause control.
6. Working principles, only after owner-authored copy exists.
7. Existing contact invitation.
8. Existing signature and footer.

The exact support line from the thesis may be added to the hero only if it can be integrated without weakening the restored composition. It is not automatically required.

## Page changes

### Home

- Move selected work before the profile section.
- Convert publication-ready projects into real links.
- Keep unfinished work visibly distinct and non-deceptive.
- Preserve current imagery, typography and section vocabulary.
- Add a visible Pause or Play control to the moving client marks.
- Increase small body and interface type only where measured readability requires it.
- Add working principles only when real copy is supplied.

### Work

- Replace the universal locked state with mixed publishing states.
- Present available case studies as direct entries.
- Keep unfinished projects listed only when their presence helps the portfolio and their state is clear.
- Preserve the existing editorial disclosure rhythm where it remains useful.

### TEDx RSU case study

- Publish the project proposition, hero media, role, collaborators, year and deliverables.
- Explain context, central problem, decision, system, applications, production, verified outcomes and reflection.
- Show process that led to the final direction; do not publish rejected routes.
- Use inline media inside the existing editorial measure.
- End with one next-project transition.
- Add restrained chapter orientation without turning the page into an application interface.

### Remaining case studies

- Keep locked until enough authored media and verified evidence exist.
- Use the same data contract as TEDx RSU so later publication does not require a new template.

### Explorations

- Publish it as **Experiments**, using a full-viewport spatial field within the
  site's existing visual grammar.
- Each entry needs a self-initiated prompt, visual decision and date.
- If no entry is ready, publish a truthful introductory empty state rather than invented cards.
- Source image and video assets from `assets/experiments/`; generate placement
  data at build time and keep drag, wheel, arrow-key and tab access equivalent.

### Community

- Create a real route with the same restraint.
- Each entry identifies audience, contribution and access method.
- Downloads identify format, licence, version and last-updated date.
- A truthful empty state is acceptable until real material exists.

### About

- Retain the current portrait and tone.
- Verify every numerical or outcome claim.
- Add a stable `DOWNLOAD CV` action with PDF format and file size.
- Remove or qualify unsupported claims.

### Services

- Preserve the present service language unless owner-supplied revisions improve precision.
- Ensure the homepage and Services page use one source of truth.
- Avoid decorative service cards or unrelated imagery.

### Writing

- Publish it as **Notes** in global navigation while retaining the existing
  `playground.html` route and editorial article structure.
- Use only factual publication date and reading length metadata.
- Preserve the current editorial article design.

### Contact

- Keep the visible email address and copy action.
- Make message required.
- Submit progressively to a same-origin serverless endpoint.
- Preserve entered values on failure.
- Provide clear submitting, success, validation, rate-limit and provider-failure states.
- Keep a truthful no-JavaScript email fallback.

### Privacy

- Update the page when server submission is introduced.
- State which fields are collected, why, which processors deliver the message and how long operational data is retained.
- Disclose Last.fm behavior if listening status remains client-side.

### 404

- Retain the current special treatment only if it stays inside performance and reduced-capability budgets.

## Frontend engineering architecture

### Content

Split `data/site.js` into validated public domains for site configuration, navigation, projects, case studies, services, writing and client marks. A build-time schema must reject missing slugs, missing media dimensions, invalid project states, duplicate routes and broken next-project references.

### Rendering

Core narrative content must be prerendered. JavaScript enhances navigation, animation, media and live status but does not own the only copy of essential sections.

### Styles

Consolidate the repeated override strata in `styles/pages-v4.css`. Keep one production CSS request, but give source files clear responsibilities: foundations, components, pages and route-specific enhancements. Replace raw interface colours with semantic tokens while leaving authored project artwork untouched.

### Interaction

Pointer-only transformations must be gated behind fine-pointer hover capability. Keyboard and touch receive equivalent information and state without surprise geometry changes. Reduced motion removes continuous and spatial movement while retaining concise colour and opacity feedback.

### Responsive behavior

Support 320px through large desktop. Every route must be verified for horizontal overflow, 200 percent zoom, text spacing, safe-area insets, touch targets and both themes.

## Backend architecture

Keep the site static-first. Add one narrow contact boundary:

`HTTP handler -> request validator -> abuse guard -> mail-service interface -> Resend adapter -> structured response and safe logger`

No database, authentication system or broad backend framework is justified.

The endpoint must:

- Accept only same-origin JSON POST requests.
- Enforce request and field-size limits.
- Require valid name, email and message values.
- Reject unexpected interest values and malformed bodies.
- Use an accessible honeypot and minimum-fill-time signal.
- Apply shared infrastructure-backed rate limiting rather than process memory.
- Bound provider work with an eight-second timeout.
- Return stable error codes for validation, abuse, provider failure and internal failure.
- Log request ID, status, latency and provider response class without logging message bodies or email addresses.

## Accessibility requirements

- WCAG 2.2 AA is the minimum; existing higher-contrast placements should be retained.
- Do not impose a universal 7:1 requirement where it damages the approved visual baseline without measurable benefit.
- All controls need visible focus and keyboard operation.
- Targets must provide a practical 44 by 44 pixel interaction region.
- The marquee requires a visible stop control.
- Form errors must be associated without overwriting existing descriptions.
- The site must remain understandable with reduced motion, forced colours, increased text size and JavaScript unavailable.

## Performance and resilience

- LCP target at or below 2.0 seconds; hard gate 2.5 seconds.
- INP target at or below 150 milliseconds; hard gate 200 milliseconds.
- CLS at or below 0.05.
- Initial compressed JavaScript at or below 75KB.
- Initial compressed CSS at or below 45KB.
- Homepage media before interaction at or below 1.5MB.
- No ordinary navigation long task above 200 milliseconds.
- No non-essential idle main-thread work.
- Use content-hashed filenames before assigning one-year immutable cache headers.
- Save-Data and reduced-motion environments receive quieter media behavior.

## Security and privacy

- Keep the current CSP and security-header baseline.
- Make Vercel the canonical deployed configuration and test Netlify parity only if Netlify remains supported.
- Remove inline-style dependencies where practical before tightening `style-src`.
- Introduce CSP reporting in report-only mode before enforcement changes.
- Restrict and document the public Last.fm key.
- Consider a cached server proxy for Last.fm if the listening feature survives review.

## Verification

Automated tests must cover content schemas, route generation, required homepage order, mixed project states, the published TEDx chapter contract, navigation, CV delivery, form validation, provider mocking, rate limiting, origin checks, timeout behavior, value retention and privacy-copy parity.

Browser verification must cover all production routes at 320px, 390px, tablet, 1280px and 1440px; Print and Screen themes; keyboard, touch and pointer; reduced motion; forced colours; 200 percent zoom; text-spacing overrides; JavaScript disabled; console errors; broken assets; Lighthouse budgets and production headers.

## Delivery order

1. Freeze and test the visual preservation contract.
2. Replace obsolete product-contract tests.
3. Introduce the validated route and content registry.
4. Add Explorations and Community with truthful states.
5. Reorder homepage proof and make publishable work navigable.
6. Build and publish the complete TEDx RSU case study.
7. Restore CV delivery and audit claims.
8. Implement the contact endpoint, form states and privacy update.
9. Consolidate CSS and semantic tokens without visual redesign.
10. Complete accessibility, responsive, performance and security QA.
11. Create a preview deployment for owner review.
12. Merge and deploy only after explicit visual approval.

## Explicit non-goals

- Recreating the rejected thesis-aligned redesign.
- Replacing the current visual language with Material 3 styling.
- Inventing project results, testimonials, community entries or working-principles copy.
- Publishing incomplete case studies as if finished.
- Adding a database, account system, CMS or analytics platform without demonstrated need.
- Deploying visual changes before review.

