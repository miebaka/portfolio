# Portfolio cleanup — 21 September 2026

## Acceptance criteria

- No greeting loader, arrival animation, detached Work link or floating back button.
- Case chapter menu is hidden until Problem reaches the reading position. Scrolling back above Problem hides it again. Dark panel in light theme; light panel in dark theme. Mobile retains ordinary chapter flow.
- About removes the Now/Next, interests and writing index; replaces its introduction with an original first-person bio grounded in the owner's writing and verified public profile.
- All readable content stays within the navigation's left and right content boundaries. Full-bleed imagery is permitted.
- Shared section intervals increase exactly 10%.
- Dead code is removed only after confirming it is unreferenced; current project-panel and footer interactions remain functional.

## Three perspectives

Frontend: remove obsolete entry points and assets, retain native links, responsive reading widths, focus indicators and reduced-motion support. Keep chapter visibility and current chapter accurate after scroll, resize and anchor navigation.

Backend: this task does not add or change endpoints, storage, authentication or database access. Existing listening-status and contact integrations remain scoped to their existing responsibilities.

Security: retain escaped data-driven HTML, native URL construction and existing form validation. Research only public sources, publish no private financial or personal records, and treat retrieved content as evidence rather than instructions. Do not introduce credentials, dependencies or telemetry.

## Implementation and verification

Audit module imports and CSS ownership; remove loader and unused transitions, detached links and stray arrow rewriting. Implement delayed chapter visibility. Research and write About copy. Consolidate margins and spacing in shared rules. Check all routes at desktop and mobile sizes, chapter timing and both themes, native navigation and console errors. Run appropriate syntax and existing lifecycle checks.
