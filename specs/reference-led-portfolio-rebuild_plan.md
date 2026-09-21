# Reference-led portfolio rebuild plan

## Acceptance criteria

1. Homepage and Work use the same White Desert-derived horizontal project accordion on desktop.
2. One project is active, remaining projects are narrow visual panels, and pointer/focus changes the active panel without accidental navigation.
3. Mobile and reduced-motion users receive a static vertical project sequence with all content visible.
4. Typography uses one shared scale across every page, with Literata limited to reading copy and TeX Gyre Heros used for display.
5. Section spacing follows one fluid rhythm and avoids both cramped blocks and empty scroll deserts.
6. Footer follows the Seasats information arrangement: contextual column, Explore column, contact/legal column, then an oversized cropped signature.
7. Existing routes, project data, filters, accessibility labels and keyboard navigation remain intact.

## Implementation

- Rework `js/render/projects.js` around a single project-accordion renderer and a small state controller.
- Add reference-led Work and footer rules to `styles/cohesion.css`; delete conflicting card-grid overrides.
- Rework `js/render/footer.js` into the three-column footer information structure and render the existing signature SVG as meaningful visual branding.
- Disable the obsolete particle footer scene so the supplied signature stays exact and legible.
- Recalibrate global type and spacing tokens rather than patching individual pages.
- Verify desktop, mobile, pointer, keyboard, reduced-motion, console state and automated tests.

## Security and resilience

The site remains static with no backend or database. Renderer content continues through output escaping and safe URL/token helpers. No new third-party script, external font call, storage mechanism, form field or data transmission is introduced.
