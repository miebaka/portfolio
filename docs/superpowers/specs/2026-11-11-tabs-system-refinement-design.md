# Tabs design-system portfolio refinement

## Intent

Refine the portfolio into a more coherent recruiter-facing system. Preserve the existing static architecture, routes, content model, project names, colour themes, and case-study content while correcting inconsistent typography, card alignment, cropped project previews, unclear theme controls, weak navigation state, excessive opening whitespace, and static project entry.

## Goals

- Copy the complete typography and button token values from the Tabs design system into the portfolio token layer.
- Use OGARANYA for Display 1–4 and Heading 1–4.
- Use Atkinson Hyperlegible Next for subheadings, body copy, action labels, navigation, metadata, controls, and form content.
- Align every project identity to one internal card edge and every card to the global page grid.
- Present each project through one fixed-ratio cover composed from its strongest existing imagery.
- Make the Print/Screen control a labelled, accessible two-state switch with an unmistakable selected state.
- Make the current page obvious in desktop and mobile navigation, with restrained hover/focus movement.
- Bring the first project into the initial viewport on common laptop sizes.
- Reveal project cards with a subtle blur-and-fade entrance while respecting reduced-motion preferences.

## Non-goals

- No framework migration or information-architecture rewrite.
- No new project artwork, project copy, case-study routes, or third-party animation dependency.
- No decorative motion outside the navigation indicator and project-card entrance.
- No direct copy of the Tabs brand colours where they conflict with the portfolio’s established colour system.

## Token contract

### Typography

| Token | Size | Line height | Tracking | Weight | Portfolio family |
|---|---:|---:|---:|---:|---|
| Display 1 | 72px | 84px | -4% | 600 | OGARANYA |
| Display 2 | 56px | 64px | -4% | 600 | OGARANYA |
| Display 3 | 40px | 48px | -1% | 600 | OGARANYA |
| Display 4 | 32px | 40px | -1% | 600 | OGARANYA |
| Heading 1 | 24px | 32px | -2% | 600 | OGARANYA |
| Heading 2 | 18px | 24px | -2% | 600 | OGARANYA |
| Heading 3 | 16px | 24px | -2% | 600 | OGARANYA |
| Heading 4 | 14px | 20px | -2% | 600 | OGARANYA |
| Subheading 1 | 16px | 24px | -2% | 500 | Atkinson Hyperlegible Next |
| Subheading 2 | 14px | 20px | -2% | 500 | Atkinson Hyperlegible Next |
| Body 1 | 20px | 28px | 0 | 400 | Atkinson Hyperlegible Next |
| Body 2 | 18px | 24px | 0 | 400 | Atkinson Hyperlegible Next |
| Body 3 | 16px | 24px | -2% | 400 | Atkinson Hyperlegible Next |
| Body 4 | 14px | 20px | -2% | 400 | Atkinson Hyperlegible Next |
| Body 5 | 12px | 16px | -2% | 400 | Atkinson Hyperlegible Next |
| Action XSmall | 12px | 24px | -0.2px | 600 | Atkinson Hyperlegible Next |
| Action Small | 14px | 21px | -0.2px | 500 | Atkinson Hyperlegible Next |
| Action Medium | 15px | 24px | -0.2px | 600 | Atkinson Hyperlegible Next |
| Action Large | 16px | 21px | -0.2px | 500 | Atkinson Hyperlegible Next |
| Action XLarge | 20px | 21px | -0.2px | 500 | Atkinson Hyperlegible Next |

Use responsive aliases only where an existing layout needs fluid scaling; aliases must resolve to these endpoints.

### Buttons

All buttons share inline-flex centring, a 100px pill radius, 1px transparent border, 6px icon gap, 150ms state transition, no wrapping, and border-box sizing.

| Size | Height | Inline padding | Type |
|---|---:|---:|---|
| XSmall | 36px | 12px | 12/16, -0.1px, 500 |
| Small | 40px | 15px | 14/20, -0.15px, 500 |
| Medium | 44px | 20px | 16/24, -0.2px, 500 |
| Large | 46px | 20px | 18/24, -0.2px, 500 |
| XLarge | 46px | 20px | 20/28, -0.25px, 500 |

Provide primary, secondary, destructive, destructive-light, and link semantic variants mapped to existing portfolio colour tokens. Disabled buttons use 40% opacity, the muted text token, no pointer events, and a not-allowed cursor.

## Layout and interaction

- Project cards use a single `--project-card-padding` value of 48px on wide screens and a responsive smaller value below tablet width.
- Title, divider, description, metadata, and year share that same internal left edge.
- The global page edge owns section headings; project content does not introduce a competing arbitrary offset.
- Every cover uses the same aspect ratio and overflow boundary. Existing images are composed with explicit `object-position` per project; no text may be clipped mid-letter by the browser crop.
- The work-page opening gap is reduced until the first project is visibly present at 768px viewport height.
- Print/Screen is exposed as a labelled switch/group with selected-state text, `aria-checked`, keyboard operation, and persistent preference.
- Active navigation uses `aria-current="page"` plus a clearly visible underline or dot. Hover/focus moves the indicator; reduced motion makes it immediate.
- Project reveal begins at low opacity, 6px vertical offset, and 6px blur, resolving once intersecting. It runs once per card. With reduced motion or JavaScript disabled, content is fully visible.

## Responsive and accessibility constraints

- Preserve content and reading order from 320px through wide desktop.
- Maintain visible focus indicators, touch targets of at least 44px where appropriate, and sufficient contrast in both themes.
- Typography must survive WCAG text-spacing overrides, 200% zoom, and long project titles without horizontal overflow.
- Motion must never hide content and must honour `prefers-reduced-motion`.
- Font loading uses local WOFF2 where available, `font-display: swap`, and sensible system fallbacks.

## Verification

Update the visual contract, navigation/unit tests, integrity tests, and Playwright coverage. Verify token values, font-role removal of Google Sans Flex/Josefin Sans, shared project padding, fixed-ratio covers, active navigation semantics, switch state, first-card visibility, reveal behaviour, no-JavaScript visibility, reduced motion, mobile overflow, build, CSS contract, budget checks, and the full test suite.
