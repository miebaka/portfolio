# Owner revision — 6 September 2026

The owner’s ten requested corrections supersede the earlier fieldbook proposal.

- The navigation uses the existing `assets/images/miebaka-joshua-logo.svg`.
- Home contains the only 3D object: all original SVG paths are extruded, including the outer diamond and internal lettering. Pointer movement turns the mark; motion can be paused. Other pages do not initialise Three.js.
- All enquiry/helix/wave objects, the Playground form experiment and the “Always another question” footer section are removed.
- Home’s small decorative captions are removed. Functional navigation, project information and footer text are kept readable.
- The Now Playing pill sits in the gap before Joshua. The existing Last.fm integration reports a live track or explicitly labels the most recently played track; unavailable status is not presented as live listening.
- Link arrows point northeast at rest and rotate clockwise to east on hover or keyboard focus.
- Selected project names share a flush left edge, with plain black type in the light theme. A Three.js shader fills the letterforms with colour on hover/focus. This is a flat text effect, not another 3D object. CSS provides a non-WebGL/reduced-motion fallback. Project-image hover cards are no longer initialised or rendered.
- Journey So Far restores the animated client-logo marquee.
- Work uses a compact heading and six columns on desktop, with responsive three- and two-column layouts.

The local preview server now uses persistent HTTP connections and a larger request queue after cold loads intermittently stalled while fetching the stylesheet and ES-module graph.

Validation: JavaScript syntax checks, four graphics lifecycle/fallback tests, visual checks at 1280 × 900 and 390 × 844, project filtering, keyboard colour fill, arrow direction, SVG extrusion, Now Playing state and client-logo strip. The actual contact form was not submitted.
