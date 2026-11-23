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

The Belonwus case page pairs a full-screen brand handoff with a media-led gallery and a two-column information section. This portfolio reverses the sequence: project opening, explanation and facts come before a gallery headed by a full-width image. The handoff uses the Miebaka mark, a cover-in and cover-out fade, and reduced-motion support.

The next-project treatment draws on Wigxel’s right-aligned label and oversized destination, using the portfolio’s Geist roles and a forward arrow.

The upright folder-rack experiment was reverted on 22 November 2026 at the user's request. Home uses the native-link Selected Work paper folders; the Work page retains its wide, layered landscape folders. The case-study animation is owned separately by `styles/case-transitions.css` and `js/core/case-route-transition.js`.

The homepage keeps the oversized MIEBAKA JOSHUA name and an editorial dark frame without the previously used water renderer. Existing navigation and the Last.fm-backed now-playing pill remain unchanged.
