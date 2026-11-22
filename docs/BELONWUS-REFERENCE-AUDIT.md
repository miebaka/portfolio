# Belonwus reference audit and portfolio adaptation

Inspected 22 November 2026 at 1440×900, using a live browser and computed CSS values. The site is https://belonwus.com/.

| Role | Measured font | Size | Line height | Tracking |
|---|---|---|---|---|
| Navigation | SF Pro | 16px | 16px | -0.08px |
| Project title and categories | SF Pro | 16px | 21.6px | -0.24px |
| General metadata | SF Pro | 16px | 16px–21.6px | -0.08px |
| Home introduction | SF Pro | 32px | 43.2px | -0.48px |
| Section heading | SF Pro | 32px | 32px | -0.48px |
| Case-study introduction | SF Pro | 32px | 43.2px | -0.48px |

Our portfolio deliberately keeps Geist Sans and Geist Mono, and translates this hierarchy into the canonical typography tokens in `styles/tokens.css`: 16px labels/body, 32px section roles, generous 1.35 text leading, compact larger tracking and the existing oversized hero size. No other stylesheet owns text roles.

The Belonwus case page has a 0–1 opacity full-screen transition plane, a roughly 112px centered brand icon beginning at 70% scale, and a full-viewport case image ahead of editorial copy. We recreate that *behavior* using our own Miebaka logo with a cover-in/mark-in handoff at route exit, a cover-out/mark-out arrival, and a top-down full-bleed case image reveal. Native view transitions enhance browsers supporting cross-document navigation. Reduced-motion preference removes all entrance/exit effects. We do not copy source code, brand assets or claims from the reference.

The upright folder-rack experiment was reverted on 22 November 2026 at the user's request. Home uses the original image-led Selected Work roster; the Work page uses its previous wide, layered landscape folders. The case-study animation is owned separately by `styles/case-transitions.css` and `js/core/case-route-transition.js`.

The Three.js water uses its existing home renderer without replacement; navigation aligns visually to the outer left and right edges of the water frame. The now-playing status remains Last.fm-backed, with an expanded pill width.
