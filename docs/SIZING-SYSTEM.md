# Sizing system: four sources, no alternate scales

**Binding rules for the entire portfolio.** Effective 22 November 2026.

## 1. Typography — `styles/tokens.css`

Geist Sans (headings/body) and Geist Mono (metadata/controls) use only the approved `--type-*` roles. Font faces, size, line height, weight, tracking, wrapping and text transformations are defined exclusively in this file. No typography declaration belongs to a page or component CSS file.

## 2. Spacing — `styles/foundations.css`

The basic unit is `--spacing-unit: .125em` (2px at a 16px element font size). Named stops `--s1` to `--s12` represent increments of `.5em`, from `.5em` to `6em`. All `margin`, `padding`, `gap`, `scroll-margin` and `scroll-padding` declarations consume one of those stops or a whole-number multiple of the single unit, e.g. `calc(var(--spacing-unit) * 14)`. Fluid `clamp()` expressions may interpolate through viewport units but their length endpoints must use the spacing system. No authored literal `em`, `rem` or `px` is permitted in spacing declarations. Position and component aspect sizing remain geometric, not a competing spacing scale.

## 3. Container/grid — `styles/foundations.css` + `styles/layout.css`

There is one content maximum: `--grid-max: 86em` (aliased as `--content`), and one outer gutter `--grid-outer` (aliased as `--page`). Interior mastheads, standard content and footer panels use the same content and margin tokens. The Home masthead follows the framed hero. The outer margin grows fluidly from 1em to 4em, independently of the column gap. The standard container expression is `min(calc(100% - 2 * var(--page)), var(--content))`. The generic grid is four tracks below `56em` and twelve from `56em`. Editorial compositions use four tracks below `56em`, eight from `56em`, and twelve from `72em`. The only global grid gutter is `--grid-gutter` (aliased as `--grid-gap`). Retired `--tailor-container` and `--tailor-gutter` are prohibited.

## 4. Responsive sizing — `scripts/stylelint-sizing.mjs`

CSS media queries cannot currently consume ordinary CSS custom properties, so the enforced breakpoint table is defined in the lint rule. The five approved upward boundaries are `24em`, `40em`, `56em`, `72em` and `88em`. Matching non-overlapping upper boundaries are `23.999em`, `39.999em`, `55.999em`, `71.999em` and `87.999em`. At the browser's normal 16px initial font size, the lower thresholds are approximately 384px, 640px, 896px, 1152px and 1408px. The existing layout roles follow those five steps; no component may define an additional viewport-width breakpoint. New arbitrary breakpoint literals fail the lint rule. Browser preference queries (motion, pointer, contrast) do not define viewport widths and remain available.

## Verification

`npm run lint:css` enforces the entire sizing contract through Stylelint. `npm run test:sizing` checks that the rule rejects deliberate violations; `npm run test:relative` guards the mobile-first four/twelve grid and font-relative behavior; the Playwright suite checks rendered geometry at 320, 390, 768, 896, 1024, 1152, 1408 and 1440 pixels and enlarged text.

Painting primitives, hairline strokes and WebGL raster pixels are not layout scales. They retain device-level syntax to preserve fidelity and input accessibility.

All browser-side layout decisions use `js/core/responsive.js`; the Three.js water performance tier and the physical folder interaction both consume its compact predicate instead of inventing independent pixel thresholds.

The 44px minimum interactive target is defined once as `--control-target: max(44px, 2.75em)` in the foundation and consumed through `var(--control-target)`. Raw 44px literals in components are prohibited. JavaScript has one imported breakpoint helper (`js/core/responsive.js`) and a test rejects any second viewport-width threshold in browser scripts.

Responsive image `sizes` hints in the case-study renderer also consume `viewportQueries` from the same browser-side source, rather than inventing 52.5em, 64em or 100em image-loading breakpoints. The image fallback content measure is the canonical `86em` maximum.
