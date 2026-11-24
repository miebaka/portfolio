# Native rendering and career index — 24 November 2026

Baseline: ba5ddd96ba7621df0fa02622ad44df65eb4d4c21. No Three.js runtime dependency in package.json or the source tree's runtime entry points. Project folders are native HTML/CSS; the footer is Canvas 2D with per-particle physics, not WebGL. Keep the footer because replacing its individual particle simulation with CSS would either change the interaction or add many DOM elements. No speculative performance claim without profiling.

The prior experience ruler was already CSS but required 52em minimum width, a focusable horizontal scroller, and year-resolution blocks that visually overstated partial-year tenures. The new numbered career index uses a semantic list, company headings, exact authored periods and contribution copy. The CSS uses existing responsive and spacing tokens; no JS animation, fake duration bars or new dependency. The source fallback and built prerender use identical markup, with runtime rendering retained for unbuilt pages.

Remove the route dots from both masthead and Index; retain aria-current and existing focus and active text treatments.

References:
- https://web.dev/articles/animations-guide
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/CSS
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style
- https://www.w3.org/WAI/tutorials/menus/structure/
- https://www.nngroup.com/articles/layer-cake-pattern-scanning/
- https://www.nngroup.com/articles/ux-design-portfolios/

Validation: professional evidence unit test, route and career responsive browser tests (320–1440 CSS pixels, both themes, reduced motion). Actual CI execution is separate from authoring the tests.
