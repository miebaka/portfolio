# Motion reference review

Reviewed 1 November 2026 against the portfolio's existing editorial system and reduced-motion preference.

## Decisions

| Reference | Useful principle | Decision for this portfolio |
| --- | --- | --- |
| [Lexington Themes](https://lexingtonthemes.com/) | Let project imagery carry the page; use short entrances, restrained hover feedback and still reduced-motion states. Astromax SP's sequence of heading, statement and image was the most relevant pattern. | Extend the existing chapter reveal to every published case and let its images settle after the copy. Keep the portfolio's typography, colour and structure rather than borrowing a template surface. |
| [Dynamics.js](https://github.com/michaelvillar/dynamics.js) | Physics is useful for interruptible, direct-manipulation moments. Its slow-motion debug mode is also a useful review habit. | Keep the existing pull-cord physics as the single spring-like interaction. Do not add Dynamics.js: the project already has a small purpose-built loop, and most page motion is deterministic CSS. |
| [Rellax](https://github.com/dixonandmoe/rellax) | Different scroll rates can create spatial depth. | Do not install it. Persistent parallax would compete with case-study reading, adds per-scroll work and must be removed for reduced motion. The work does not need simulated depth to communicate hierarchy. |
| [Barba.js](https://github.com/barbajs/barba) | Page transitions should preserve continuity and provide explicit lifecycle hooks. | Keep native cross-document View Transitions as progressive enhancement. Barba's SPA navigation, state restoration and lifecycle layer would duplicate browser behavior for two shared project-image transitions. |

## Implemented motion contract

- Chapter copy and imagery enter once when the chapter reaches the viewport.
- Motion uses opacity and `translate3d` only, with 280-300 ms durations and small 10-14 px travel.
- The sequence is heading, body, then at most the first three image positions; it is not a theatrical cascade.
- The site's explicit Reduce preference makes the content immediately visible and static.
- Reading pages remain static, and normal scrolling is never intercepted.
- Work-to-case continuity remains a native enhancement, not a navigation dependency.

No new animation library was installed. The browser platform and existing project code cover the justified interactions with less bundle weight and a smaller maintenance surface.
