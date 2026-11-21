# Work Filing Cabinet: Three.js implementation

Status: review branch (not production). Baseline: docs/work-filing-cabinet-concept.md.

## Locked creative direction

The archive remains a fixed, overhead orthographic drawer. Its dominant direction is dark powder-coated metal, subtly warm paper stocks, numbered die-cut tabs, simple indexing and controlled studio light. Avoid orbit controls, flashy effects, exaggerated dirt, parallax, synthetic floating paper and any additional unpublished case studies.

The new rendering layer must make the existing archive look physically credible, not replace its interaction model.

## Interaction boundary

The Work DOM remains authoritative. Existing js/core/work-cabinet.js controls reading-axis selection, scrolling, pointer extraction, navigation, keyboard focus, reduced motion and bfcache restoration. Existing HTML anchors provide real destinations and accessible names.

The 3D renderer is decorative and never receives pointer interactions. It observes the existing states and renders physical paper and metal layers under the original HTML text.

## Implementation layout

- js/core/work-cabinet-bootstrap.js: lightweight bootstrap that checks device constraints and lazy-loads Three.js near the viewport.
- js/work-cabinet-three.js: Three.js scene, geometry, paper texture generation, material system, lighting, folder transforms, on-demand rendering and cleanup.
- scripts/build-work-cabinet-three.mjs: esbuild entry for the isolated browser bundle.
- scripts/build-site.mjs: copies that bundle when available, including when building isolated content tests without the optional runtime.
- styles/work-cabinet.css: preserves all fallback presentation and removes flat paper backgrounds only after the first 3D frame is ready.
- tests/work-cabinet-three.test.mjs and tests/e2e/work-cabinet.spec.mjs: quality-tier, source, browser and fallback contracts.

## Art direction and engineering specifics

Folder fronts and undersheets have real thickness and bevelled tab geometry. Three high-roughness paper stocks use deterministic, low-amplitude fibre variation and sRGB colour textures. Year dividers are physically modelled. The cabinet has metallic side rails, environment reflections on capable desktops, and a shadow-producing directional key positioned to keep contact shadows tight.

The camera matches measured browser geometry rather than using a second independent layout. Rendering is demand-driven: animate while transforms move, redraw on resize and stop when offscreen or hidden. Pixel density is capped. Expensive environment lighting is disabled on low-tier devices.

Save-Data and very low hardware-concurrency devices keep the existing CSS archive. Browser/WebGL failure, lost context and no JavaScript must never block the three existing published case-study links.

## Honest limitations

This first pass builds reusable procedural geometry in Three.js. It does not yet supply a bespoke high-polygon Blender model, photographic texture scans or a custom HDRI. If sidewall realism, shadows, paper folds or measured bevels fail visual QA, replace the physical meshes with optimised glTF/GLB without changing the DOM architecture.

## Release gate

Run the Node quality suite, the production build, performance budgets and Playwright tests; then examine actual desktop/mobile screenshots in multiple browser engines and both themes. Test mouse, touch, keyboard, reduced motion, scroll suppression, native return, and unavailable WebGL. Do not merge solely on the basis of unit tests. A photographic-looking cabinet requires rendered visual acceptance.
