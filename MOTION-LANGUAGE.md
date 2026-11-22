# Motion architecture

## Current, supported effects
The site retains the original Three.js water (with a static fallback), the interactive footer dot matrix, native-link Selected Work previews, the client marquee, the service card transitions, and the Experiments poster gallery. None of these requires a replacement scrolling engine or a page-wide reveal observer.

### Rules
- **Content is visible by default.** Headings, case-study chapters and body paragraphs must never be set to opacity zero awaiting a JavaScript observer.
- **Native scrolling owns the document.** Wheel, touch, anchor links and browser history must continue to function without Lenis, GSAP or injected scroll listeners.
- **Motion preferences are authoritative.** The site's Reduce setting overrides system Full; its Full setting overrides system Reduce. In System mode, respect `prefers-reduced-motion`.
- **Page-specific motion is owned by its feature.** Three.js handles the hero water, and the gallery handles its own poster transitions. Each controller must clean up listeners, observers and animation frames on teardown.
- **Keep resources contained.** The hero water is lazily bundled; static fallbacks exist when WebGL is unsupported. No second global animation scheduler should load.
- **One motion source of truth.** The renderer uses the controller's resolved `animate` flag. A second OS check must not defeat the visitor's explicit Full setting.
- **Keyboard first.** Focus reveals the same information as hover. Avoid suppressing content or intercepting page scrolling to produce effects.

### Removed in the November 2026 cleanup
- The optional Lenis + GSAP scroll engine, its build task, runtime bundle, production dependency graph, and old engine-specific tests.
- The full-page IntersectionObserver reveal controller and `data-editorial-reveal` hooks.
- Homepage staggered opacity-zero entry effects, case-study text opacity gating, retired experiment-tunnel styles, and unused scroll-linked keyframes.

### Regression tests
Retain tests for water fallback and pointer ripples, native page scroll, all case chapters being visible, motion preferences, project-link focus, reduced motion, cross-page navigation, and image/gallery availability. Never preserve a test solely because a removed implementation used to produce a class or attribute.


## Mobile water parity and cache policy (November 2026)
- Desktop and mobile use the same Three.js refraction/caustics shader. Mobile uses
  a reduced render resolution, not an alternative visual shader.
- Only the renderer's actual canvas obtains a WebGL2 context. A preflight GPU
  context or device-name blacklist must not suppress supported mobile hardware.
- The renderer requests the device's default power preference, including
  power-saving mobile browsers.
- If WebGL2 or a render-target extension is unavailable, a quiet static water
  surface replaces the old animated concentric-ring imitation. Never animate
  the fallback or present it as WebGL.
- The stable `/assets/runtime/hero-wave.js` URL has a revisioned import and
  an explicit revalidation cache policy. Changing the shader requires updating
  the revision so already-cached mobile browsers cannot keep an old effect.
- The host reports `data-renderer` and `data-fallback-reason` to distinguish
  a working GPU shader from module load, initialization, or context loss.
