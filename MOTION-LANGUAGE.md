# Portfolio Motion Language — Research and implementation ledger

**Date:** 20 November 2026  
**Status:** Implemented on the `feat/cohesive-motion-language-2026-11-20` branch; production approval requires CI and browser review.  
**Authority:** `DESIGN.md` and `engineering-specification.md` outrank this supplementary ledger.

## Direction

Motion is a way to demonstrate editorial judgment, not to demonstrate how many effects a website can run. The portfolio already contains a rounded-frame hero, Three.js water, an interactive footer SVG, project image previews, sticky service cards, page transitions and a logo ticker. This pass improves their coherence, feedback, readability and performance rather than replacing the site with a new framework.

**Vocabulary**

| Function | Treatment | Timing |
| --- | --- | --- |
| Establish | Hero display enters in two readable phrases, supporting copy follows | 680–800 ms; stagger 80–160 ms |
| Introduce | Existing scroll observer reveals headings, project proof and case chapters once | Existing ~800 ms; threshold 1% |
| Respond | One large project image appears behind the active oversized title on hover or focus | 260 ms opacity; no layout movement |
| Focus | Pointer spotlight marks the active service card; keyboard focus receives an equivalent state | 220 ms |
| Orient | Navigation overlay links enter in sequence without delaying focus | 460 ms; 35 ms stagger |
| Confirm | Navigation and case proof arrows move 2–4px to acknowledge a choice | 220 ms |
| Rest | OS Reduce or the explicit Reduce setting removes decorative movement | Immediate; all important content visible |

## Reference responsibility map

The references below were reviewed as **concept and interaction references**, not sources of unlicensed code, screenshots, typefaces or imagery.

| Source | What is useful | Implemented here | Deliberately not adopted |
| --- | --- | --- | --- |
| [Kawai Text Animation](https://kawai-text-animation.pages.dev/) | Slide-up, fade, restrained blur, tempo | Masked hero display, soft supporting-copy entrance | Shake, flashing, infinite color shifts, bouncing every word, typewriter on critical identity |
| [21st.dev](https://21st.dev/) · [Hover Preview](https://21st.dev/@minhxthanh/components/hover-preview) | Contextual reveal on active image/item | One centered image preview per active project, without cursor following | Importing a React component into this static ESM site |
| [21st.dev Spotlight Card](https://21st.dev/@easemize/components/spotlight-card) | Cursor-aware glow that signals an active surface | Low-contrast radial light on existing services with focus-within fallback | Heavy global cursor and high-energy glow |
| [OriginKit Hover Image Reveal](https://www.originkit.dev/components/hover-image-reveal) | Hovered list to image mapping, consistent keyboard focus | Preserved original case-study links and used a CSS-only centered image reveal | Recreating the proprietary component, oversized spring library, floating image on touch |
| [OriginKit Round Carousel](https://www.originkit.dev/components/roundcarousel) | Circular spatial composition | Reference for future Experiments-only exploration | Constantly spinning project work in the primary recruitment journey |
| [Supahero](https://supahero.io/) · [IntegratedBio](https://supahero.io/hero/integratedbio) | Hero visual hierarchy and high-quality first-fold composition | Preserved and staged the existing rounded-frame hero | Copying a reference company's layout or assets |
| [MotionSites](https://motionsites.ai/) | Section rhythm, interactive portfolio examples and creative prompts | Used as a check on hierarchy and selective motion emphasis | Reusing premium prompts or adding a second ambient shader to each section |

## Implementation map

- `js/core/motion-language.js`: lightweight motion-preference controller with no project pointer tracking, animation frames or geometry reads. The module reacts to the site's *effective* motion preference, including changes made after page load.
- `styles/motion-language.css`: visual language layered **after** the existing authored styles. It changes neither site copy nor the brand fonts. All content remains in normal DOM and keyboard order.
- `js/core/editorial-reveals.js`: 1% intersection threshold so tall sections no longer risk never revealing. It listens to motion preference changes and reveals all pending content when Reduce becomes active.
- `js/main.js` and `styles/main.css`: integrate with the existing data-driven static site, no new runtime dependency.
- `tests/motion-language.test.mjs` and `tests/e2e/motion-language.spec.mjs`: exercise preference precedence, visual preview behavior, reduced motion, and live preference changes.

## Performance and accessibility contracts

1. No animation changes the underlying project title, evidence, destination or content order.
2. No scroll or pointer event handlers are required for the work preview. The large image changes via CSS, with no forced geometry reads.
3. Fine pointers gain a centered image reveal on hover; touch users receive large in-flow project images without requiring hover.
4. An animation must never require a JavaScript observer to make essential text accessible; missing observers and Reduce reveal all content.
5. The site-wide motion preference is authoritative: **System** follows OS, **Reduce** removes decorative motion, **Full** is an explicit override.
6. Keyboard focus continues to expose the existing work image and service link without requiring hover.
7. The Three.js caustics, interactive footer and scroll-linked project transitions are not duplicated.
8. `prefers-reduced-motion` and explicit Reduce disable decorative menu and page-transition motion. No flash or rapid color-loop effects are added.

## Release verification

Run under Node.js 24:

```sh
npm ci
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run test:budgets
```

Review at 320, 390, 768, 1024 and 1440 pixels in both color themes. Confirm touch has visible project imagery without hover; verify keyboard focus, preference toggles during scrolling, fast repeated menu open/close, 3D fallback, and `document.hidden` throttling for the existing water shader. Inspect LCP, CLS and INP rather than claiming improvement from code inspection alone.

## Not implemented yet

An actual animated route transition between *every* case is inappropriate until it is tested against back navigation, long reading positions and low-end mobile devices. An extra 3D carousel or interactive shader in every chapter would compete with the existing hero and experiments and dilute the portfolio's proof. These are references, not accepted deliverables.
