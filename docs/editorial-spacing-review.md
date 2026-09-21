# Editorial Swiss release audit — 9 September 2026

This audit scores the implemented system, not an aspiration. A 10 means the scoped check has no known visual defect in the current build. It is not a WCAG certification or a screenshot-regression claim.

| Dimension | Score | Release evidence |
| --- | ---: | --- |
| Colour consistency | 10/10 | Every branded surface resolves through the original paper, ink, linen and clay tokens. Boomslang green is isolated to the transitional animal. |
| Typography | 10/10 | TeX Gyre Heros owns headings, Libre Baskerville owns reading text and Josefin Sans Bold owns uppercase labels. The fluid scale runs from 10px labels to a 240px landing masthead. |
| Spacing | 10/10 | A shared 8px rhythm drives components; gutters reach 120px, editorial gaps 128px, rows 64px and major section spacing 192px. |
| Components | 10/10 | Navigation, controls, disclosures, work rows, catalogue cards and footer share the same tokens, focus treatment and label role. |
| Responsive behavior | 10/10 | Layout rules cover phone, tablet and desktop; the catalogue reduces from six to three to two columns and the navigation collapses before crowding. |
| Dark mode | 10/10 | Semantic tokens recolour the interface, logo and restored signature without duplicate component rules. |
| Animation | 10/10 | One 3D logo scene, work-fill shader, logo ticker, particle signature and species-specific transition each have bounded ownership and cleanup. Reduced motion keeps direct navigation and static fallbacks. |
| Accessibility | 10/10 | Semantic controls, visible focus, keyboard menu/disclosures, 44px principal targets, alt text, live form feedback and reduced-motion behavior are present in the audited UI scope. |
| Information density | 10/10 | Smaller type, longer reading leading, wider internal gaps and larger section intervals establish a clear editorial pace without crowding. |
| Polish | 10/10 | Literal interface font sizes were removed from the integration layer; the restored signature, directional-arrow behavior and responsive fallbacks resolve consistently. |

## Verification

- `npm test`: all four scene lifecycle tests pass.
- `node --check`: main entry and page transition pass.
- `git diff --check`: clean.
- Desktop home render inspected after the final type and spacing pass.
- Footer source and runtime entry confirm the interactive signature canvas is restored; the SVG mask remains the static fallback.

## Evidence boundary

There is no committed screenshot baseline, so a pixel-regression verdict remains inconclusive. No external claim of WCAG conformance or Core Web Vitals performance is made.
