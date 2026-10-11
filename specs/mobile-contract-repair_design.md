# Mobile contract repair

## Decision

This release repairs shared interface contracts rather than adding another visual layer. The site remains static HTML, CSS and ES modules with three active stylesheet sources: `foundations.css`, `components-v4.css`, and `pages-v4.css`.

## Contracts

- Footer: three labelled groups in reading order — Explore, Based in, Social — followed by the full-width dot-matrix signature. Groups share the same label and inline-item grammar and collapse to two columns, then one column.
- Primary action: `.btn` is the only filled CTA contract. It owns the 48px target, padding, type, colours, focus ring, pointer-gated hover, pressed compression, and disabled state. Navigation controls remain utility controls but share timing and focus principles.
- Mobile platform: every document opts into safe-area and keyboard-aware viewport behavior; content uses stable small viewport units, 16px coarse-pointer form controls, manipulation touch behavior, and no hover-only information.
- Layout: existing `--page` and `--list-item-inline` tokens remain the alignment source of truth. Safe-area insets augment rather than replace them.

## Architecture and data flow

`data/site.js` remains the sole source for location and social links. `renderFooter()` escapes visible copy, validates authored URLs through `safeURL()`, and applies `noopener noreferrer` to new-tab links. No content is duplicated in JavaScript.

The project has no backend, database, authentication, sessions, roles, or privileged mutations. These concerns are not applicable to this release. The contact form remains a local mail-client handoff and stores no message.

## Security and privacy

- External footer URLs are scheme-checked and safely escaped.
- New-tab links cannot access the opener.
- No dependency, credential, endpoint, or collection behavior is introduced.
- Existing CSP and production-build validation remain release gates.

## Performance and accessibility

The release removes unreachable legacy CSS trees and dead JavaScript initializers. It adds no dependency or render-blocking asset. Primary actions remain at least 48px high; utility controls remain at least 44px; focus is visible; touch devices never depend on hover; reduced-motion behavior remains intact.

## Verification

Run `npm test`, syntax-check reachable JavaScript, check the diff for whitespace errors, and inspect representative route families at 320, 375, 768, and 1440 CSS pixels in light and dark themes. Browser emulation is not a substitute for final physical-device testing.
