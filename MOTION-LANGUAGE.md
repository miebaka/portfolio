# Motion architecture

## Current effects

The portfolio uses a **static homepage opening frame**, the interactive footer dot matrix, native-link Selected Work folders, a client marquee, native service-card transitions and the Experiments poster gallery. The previously integrated GPU water simulation has been extracted from the portfolio and preserved separately in the dedicated source snapshot on `archive/threejs-water-standalone` until repository transfer is complete.

## Principles

- **Content is visible by default.** Primary text, project links and case-study evidence must never wait for an animation controller.
- **Native scrolling owns the document.** Wheel, touch, anchor links and browser history continue to work without Lenis, GSAP or global scroll hijacking.
- **Motion preferences are authoritative.** The site's Reduce, System and Full choices apply to supported enhancements; System respects the operating system preference.
- **Each feature owns its own animation.** The poster gallery, project folders, client marquee and footer signature must manage their own lifecycles and cleanup.
- **Accessibility first.** Focus and touch expose the same content as hover; reduced motion never hides important information.
- **Static opening frame.** The homepage hero must work without canvas, WebGL2, shader bundles, generated water assets or JavaScript. The oversized name remains a semantic H1.

## Release tests

Test native scrolling, semantic heading and case content, keyboard project navigation, reduced motion, responsive overflow and the absence of unwanted runtime dependencies. The old water shader, ripple and GPU fallback tests were extracted along with the feature; they must not run against the portfolio.
