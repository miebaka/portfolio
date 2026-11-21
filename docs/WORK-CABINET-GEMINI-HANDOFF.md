# WORK ARCHIVE — ULTRA-REALISTIC FILING CABINET
## Creative direction, technical handoff, improvement brief and acceptance criteria for Gemini

**Project:** Miebaka Joshua's personal design portfolio (the Work / Selected Work archive).  
**Repository:** https://github.com/miebaka/portfolio  
**Production site:** https://miebaka-portfolio.vercel.app/work.html  
**Development history:** PR #41 — https://github.com/miebaka/portfolio/pull/41  
**Primary design reference:** docs/work-filing-cabinet-concept.md  
**Implementation documentation:** docs/work-filing-cabinet-threejs.md  
**Prepared:** 21 November 2026

> **Single highest priority:** Make the Work archive look, feel and behave like a believable, beautifully art-directed, physically manufactured filing cabinet viewed directly from above. Do not mistake more Three.js, stronger effects, a larger shader, or a passing test for photographic realism. The material and construction must hold up to close visual inspection.

---

## 1. The product goal, in plain language

Instead of presenting case studies as generic portfolio cards, the Work page is an **open drawer containing real hanging file folders**. Each physical folder represents a genuine published design project. Visitors scroll through the drawer, read the labelled tabs, hover or focus a folder to raise it slightly, and click or tap to open the real case study.

The archive itself should demonstrate the designer's strengths: brand systems, clear information architecture, material craft, precision, and attention to detail. A viewer should recognise the object as a filing cabinet **within two seconds**. A designer, photographer, industrial designer or 3D artist should find its material response and construction credible upon closer inspection.

**Desired reaction:** "This is a beautifully photographed open file drawer that happens to be interactive."  
**Undesired reaction:** "These are white website cards with shadows and a metal border."

This is not a free-roaming 3D product configurator. The overhead view and real, usable portfolio information are central to the experience.

### Success has five independent dimensions

1. **Object recognition:** the scene unmistakably reads as a hanging-file drawer, not cards or a spreadsheet.
2. **Photographic credibility:** physically plausible stock thickness, edge cuts, hardware, fibre variation, illumination, shadows, colour and wear.
3. **Art direction:** distinctive, restrained, premium editorial photography; no gratuitous noise, chrome, glare, fake scratches or gimmicks.
4. **Interaction:** the stack responds naturally to scroll, mouse, touch and keyboard; lift reveals information without jitter or occlusion; links open normally.
5. **Engineering integrity:** responsive, accessible and performant; existing content, route structure, typography and testing remain intact.

A green CI result only supports dimension 4–5. It cannot by itself certify dimensions 1–3.

---

## 2. Non-negotiable experience and design decisions

| Area | Requirement |
|---|---|
| Camera | **Fixed orthographic, 90-degree overhead view.** No orbit controls, perspective showroom, rotation, 3D mouse parallax or user-controllable camera. |
| Main object | Deep powder-coated midnight/navy steel drawer, believable rim/inner supports and hanging folders. |
| Stock | Three subtly different warm cream/manila archival paper tones. Paper is matte, fibrous, thin and slightly tensioned, not plastic or uniformly beige. |
| Structure | Real stepped A/B/C tabs, pressed folder folds, layers of front/back stock, visible rails and plausible suspensions. |
| Light | Soft directional daylight / controlled studio key, secondary cool bounce, real contact and cast-shadow behavior. Avoid white HDR reflections that turn the navy floor light grey. |
| Labels | Actual HTML for meaningful text. **ALL LABELS IN CAPS**, based on the portfolio's approved Geist typography tokens. No Geist Serif. |
| Navigation | Actual case-study anchors with correct URLs; browser back/forward, modifier-click, keyboard and links work normally. |
| Honesty | Never fabricate projects, publish placeholder links, overstate a project's role or add fake folder density. |
| Aesthetic | Editorial, precisely composed, tactile, quietly confident. No excessive UI chrome, novelty cursor trails, sound, floating particles or heavy bloom. |
| Accessibility | Native reading order, focus rings, contrast, hit targets, reduced-motion, forced-colours and no-WebGL fallback. |
| Theme | Respect the existing portfolio's colour system and both light/dark display states. |

### Genuine case studies

The current archive has **three published case studies**. They are the true source of content; verify the actual routes and years against data/projects.js and data/case-studies.js before editing:

- Rivo Studio
- TEDx Rivers State University
- ChopBox

Do not add extra published folders or invent case studies to fill the cabinet. The density must be honest, even if the drawer has deliberate open spaces.

### Existing interaction contract

- **Read:** scroll the page; the current file is reflected in the fixed bottom register plate.
- **Lift:** pointer hover or keyboard focus raises a real folder around 20 px; touch uses the reading-axis selection.
- **Reveal:** the exposed portion shows the case title and year/category with good contrast; text never crosses the lower paper edge.
- **Extract:** clicking the actual link triggers a short paper/extraction transition and then goes to the project URL; normal modifier-clicks retain browser behavior.
- **Return:** the browser should restore archive position and focus correctly, including back-forward cache behavior.
- **Reduced motion:** no physical travel; all essential details and links remain accessible without animation.
- **No JavaScript/WebGL:** the CSS folder/archive remains complete and readable.

---

## 3. Current implementation: what already exists

The codebase uses **Three.js 0.187.0** as a progressively enhanced, lazy-loaded decorative layer beneath native HTML links and labels. An esbuild step creates an isolated Work-cabinet bundle. Three.js is intentionally not part of the initial navigation payload. Rendering is on-demand rather than a permanent 60 fps loop. The scene is hidden or disabled for constrained devices, Save-Data, reduced-motion and forced-colours conditions.

### Existing physical scene

- Measured, browser-synchronised orthographic camera; the physical paper moves with the real DOM transforms.
- Three paper stocks with locally generated colour (sRGB), bump/height (linear) and roughness (linear) textures.
- Fine, deterministic pulp fibre lines, restrained surface noise and anisotropic paper response.
- Die-cut tabs, thin extrusion, a second offset sheet, fold creases, paper-edge highlights and subtle bowed/tensioned front faces.
- Reinforced tab crowns, folded edges and small hanger arms/sleeves.
- Powder-coated steel slide rails, inner suspension supports, channels, grooves and fastener details.
- Deep navy drawer floor with a deliberately calibrated colour texture to avoid unreliable HDR reflections.
- Soft under-folder occlusion, directional PCF shadows, a warm key light, cool bounce and optional studio environment lighting.
- GPU tiering, resolution limits, proper Three.js disposal and recovery after WebGL context loss.
- Browser tests capture CSS and WebGL desktop/mobile screenshots and validate the rendered pixels.

### What the previous rounds fixed

1. Synchronised the animated physical geometry with the actual native CSS/WAAPI folder transforms, so the mesh no longer drifts from HTML labels.
2. Corrected hidden accessibility copy that became visibly exposed in the WebGL mode.
3. Kept year dividers and labels opaque where necessary for contrast and readability.
4. Shortened folder lips, anchored their content to the paper edge, and reserved clearance so one file does not hide the next year label.
5. Fixed the mismatch between mobile and desktop drawer floors: an earlier metallic material reflected the light environment and washed out to pale grey on desktop. A locally authored, controlled dark paint finish now keeps the interior consistent across quality tiers.
6. Added independent maps for paper colour, bump and roughness, realistic thin stock, reinforcement details and restrained bows.
7. Replaced mobile's too-large project tabs with compact, readable labels, including the long TEDx name.
8. Aligned hanging-file arms to the measured support rails instead of fixed offsets.
9. Added geometry, browser, screenshot, accessibility, performance and fallback tests.

**Important:** These changes substantially improve technical and material realism, but the last reviewed images are still visibly digital/editorial. Do not claim they are photographically indistinguishable.

---

## 4. Architecture and relevant source-file map

Use the handoff ZIP for the exact merged source. This section describes file ownership, not an invitation to rewrite the whole portfolio.

### Rendering and physical construction

| File | Responsibility |
|---|---|
| js/work-cabinet-three.js | Central scene orchestration: orthographic camera, geometry placement, quality tiers, lights, shader/material assembly, pointer/scroll sync, resizing and cleanup. |
| js/three/work-cabinet-geometry.js | Bowed paper mesh, suspension hardware and tab reinforcement. Extend with manufactured detail here or split into small dedicated submodules. |
| js/three/work-cabinet-materials.js | Deterministic paper maps, metal finish, floor paint and contact-shadow texture. Replace or augment with properly licensed, optimised photographed/scan-derived materials only when available. |
| js/core/work-cabinet-bootstrap.js | Lazy activation of optional Three.js code after user interaction. Do not make the GPU scene eager on page load. |
| js/core/work-cabinet.js | Native folder selection, scrolling, extraction/navigation, focus, reduced motion, return and bfcache behavior. Preserve this as the interaction source of truth. |
| scripts/build-work-cabinet-three.mjs | Separate esbuild build for the optional physical cabinet. |
| scripts/build-site.mjs | Site assembly; includes optional cabinet build asset. |

### HTML, content, design system

| File | Responsibility |
|---|---|
| work.html | Actual Work page. Some authored HTML is produced from the renderer/data; verify the generation process before making direct edits. |
| js/render/projects.js | Generates the archive markup and project listings from canonical data. |
| data/projects.js | Published project metadata. Do not falsify or duplicate it. |
| data/case-studies.js | Case-study data and publication status. |
| data/site.js | Aggregated site data and content dependencies. |
| styles/work-cabinet.css | Physical CSS fallback, real label positions, staggered tabs, interactive states, responsive spacing and GPU-ready transparency. |
| styles/tokens.css | Central palette and enforced fluid type scale. Do not create random one-off font sizes. |
| styles/foundations.css | Shared typography and base styles. |
| DESIGN.md | Portfolio-wide creative direction and visual constraints. |
| engineering-specification.md | Shared engineering conventions and quality expectations. |

### Verification and CI

| File | Responsibility |
|---|---|
| tests/work-cabinet-three.test.mjs | Startup quality tiers, 3D/DOM synchronisation, module integrity and fallback contracts. |
| tests/work-cabinet-materials.test.mjs | Reproducible physical maps and calibrated floor pigment. |
| tests/work-cabinet-geometry.test.mjs | Bounded paper curvature, world-size UV mapping, metal hanger reach, tab reinforcement. |
| tests/e2e/work-cabinet.spec.mjs | Real-browser interaction, responsive tabs, reduced motion, focus, text clearance and links. |
| tests/e2e/work-cabinet-gpu.spec.mjs | Software-backed WebGL2, visible pixel contribution, dark floor, contrast surfaces and context-loss recovery. |
| playwright.config.mjs | Desktop/mobile/GPU Playwright projects and timeouts. |
| scripts/check-budgets.mjs | Asset and page-performance budgets. |
| scripts/site-integrity.test.mjs | Publication/source integrity. |
| .github/workflows/quality.yml | GitHub Actions: Node 24, typography gate, browser quality suite, Lighthouse, audits and visual evidence upload. |
| package.json / package-lock.json | Exact scripts, dependencies, Three.js and build tool versions. |

### Existing reference material

- docs/work-filing-cabinet-concept.md — governing idea, interactions, art direction, accessibility and original acceptance criteria.
- docs/work-filing-cabinet-implementation-plan.md — historical implementation notes; distinguish initial plan from current behaviour.
- docs/work-filing-cabinet-threejs.md — current renderer architecture, material evolution, performance guardrails, visual regression history.
- Previous PR #41 and GitHub Actions visual-review artifacts — the implementation history and captured screenshots.

---

## 5. What still prevents genuine photographic realism

Treat these as *hypotheses to inspect*, not as proof that a particular rewrite will succeed.

### P0 — The scene must read as one manufactured object

**Observation:** At normal portfolio viewport size, the visible paper bands can still read as evenly spaced HTML cards rather than a compressed set of real hanging folders. Thin tab geometry alone is not enough.

**Investigate:**
- Whether folder fronts should visibly overlap instead of showing broad, uniform gaps.
- Whether the top edges, folded binding lines, contact points and rails have a coherent physical relationship.
- Whether the existing drawer wall and base have real depth cues, mechanical joins, a folded rim or realistic interior finish.
- Whether the tabs and paper edges show physically plausible thickness rather than bright, uniform 1 px strokes.
- Whether the interaction lift should expose the sheet below instead of merely translating a rigid plane vertically.

**Possible direction:** Author a single highly accurate master hanging-folder model and reuse it with dimensional/material variations, rather than independently styling each paper band as a card. The model can be built procedurally with careful geometry or in Blender and exported as an optimised glTF/GLB.

### P0 — Material texture still looks generated

**Observation:** Procedural fibre and roughness variation improve the image but can lack the irregularity, scattering and compression patterns of actual dyed archival stock.

**Investigate:**
- Genuine paper stock photographed in controlled cross-polarised lighting, with appropriately licensed high-quality sources.
- Independent albedo, roughness, normal/height maps, and physically plausible anisotropic microstructure.
- Local wear only where an actual sheet is handled, folded, scuffed or die-cut—not random dirty noise across the face.
- Cut-edge fibre bloom and subtle tone variation where material has been compressed.
- Consistent texture scale in world units across desktop, mobile, each tab and each paper panel.

**Do not** indiscriminately apply stock noise or download copyrighted texture scans without checking terms. A beautiful clean archive is preferable to an artificially grungy one.

### P0 — Lighting and depth must be believable

**Observation:** With a fixed 90-degree view, the cabinet can look flat unless the shadows and metal boundaries describe the depth of the drawer precisely.

**Investigate:**
- Contact occlusion along rails, sheet bottoms and tab overlaps.
- Accurate separation between moving sheets and stationary under-shadows.
- Shadow softness versus light size and height.
- Raking highlights on small paper bends; broad gradients should stay subtle.
- Rich but controlled navy floor; absolutely avoid the earlier pale-grey desktop HDR regression.
- Powder-coated paint versus exposed fastener metal: different reflectance and roughness, no indiscriminate chrome.
- Calibrated exposure and sRGB/linear map interpretation across GPU tiers.

### P1 — Physical movement should have weight

The folder should feel like **lightweight but stiff cardstock**, not a hovering digital card. Inspect how the raised sheet bends, casts shadow, returns to rest and reveals the underlying leaf. The interaction can remain short and controlled. Avoid overshooting, bouncing springs or gratuitous rotation. Respect keyboard navigation and reduced-motion settings.

### P1 — Responsive consistency

At 320, 390, 768 and 1440 px:
- Labels remain legible and aligned with the physical geometry.
- Tabs stay proportionate, without long project names becoming huge white cards.
- Rails, hooks and sleeves actually meet, and never clip unexpectedly.
- The bottom register plate never covers focus targets or project names.
- Year guides and adjacent files do not overpaint each other.
- Dark/light appearances remain deliberate; all text retains required contrast.

### P1 — Performance and reliability

Quality cannot depend on disabling fallbacks. Test CPU/GPU load, first-interaction long tasks, software WebGL and real low-powered phones. Optimise draw calls and texture formats where needed. Never hide severe performance regressions behind screenshot tricks or inflated budgets.

---

## 6. Recommended execution sequence

### Phase A — Reference audit and visual diagnosis

1. Study high-resolution photographs of real suspended folders in open steel filing drawers, including top-down and 10–20 degree near-top-down close-ups **for anatomy**, but keep the site's actual camera orthographic.
2. Build a labelled anatomy diagram: sheet faces, folds, tab crown, reinforcement sleeves, suspension rods, channels, drawer sides, front register and contact points.
3. Compare every component with the latest desktop/mobile browser screenshots, zoomed 200% and at actual size.
4. Write a short, ranked gap analysis with screenshots illustrating geometry/material/light/interaction problems.
5. Reject changes that add novelty without increasing recognisability or photographic plausibility.

**Deliverable:** visual diagnosis and measurable acceptance conditions, not vague taste judgments.

### Phase B — Master physical asset

1. Use a physically measured master folder design, with realistic paper thickness and suspension geometry.
2. Model the two-layer sheet construction and pressed folds; avoid exaggerated curvature that resembles cloth.
3. Ensure the master geometry can adapt to actual DOM-driven width, tab position and folder height without UV stretching.
4. Decide whether low-cost procedural geometry remains sufficient or whether a glTF/GLB master asset is the better production choice.
5. Keep meshes/polygons/draw calls within the existing WebGL quality tiers and proper disposal lifecycle.

**Deliverable:** correctly built, reusable asset that reads as a hanging folder even with all text labels hidden.

### Phase C — Material and lighting system

1. Compare existing procedural materials against responsibly licensed real-world reference assets.
2. Make roughness, colour and micro-relief independent and physically calibrated.
3. Tune light rig at the exact site camera and viewport; do not optimise for a separate Blender beauty shot only.
4. Remove blown highlights, hard artificial bevels, false floating shadows and inconsistent floor colours.
5. Verify scene on desktop GPU and mobile lower-tier GPU using equivalent framing.

**Deliverable:** paired before/after captures with a brief explanation of why each material change is more realistic.

### Phase D — Interaction integration

1. Preserve the HTML links as the canonical source. The WebGL scene remains aria-hidden and pointer-events none.
2. Align mesh transform to actual browser-computed folder rectangles during lift/extraction.
3. Have the suspension/shadow response follow the moving sheet without breaking measured rail attachment.
4. Respect scroll suppression, bfcache restoration and keyboard activation.
5. Confirm fallback remains fully functional when WebGL is disabled, lost or unsupported.

**Deliverable:** motion capture and tests showing physically coherent lift, return and navigation across interaction modes.

### Phase E — Verification and controlled release

1. Run Node unit tests, typography lint, content integrity, production bundle build, Playwright browser tests, Lighthouse and shipped-dependency audit.
2. Use dedicated software WebGL2 screenshots and compare visual before/after for desktop/mobile, light/dark.
3. Conduct real-device tests on Chrome, Safari and Firefox, especially a mid-range Android phone.
4. Record initial load, first interaction latency, sustained scroll performance, GPU memory/texture use and any shader compilation long tasks.
5. Merge only after no release blockers remain and the visible result is an obvious improvement in photographic credibility.

---

## 7. Explicit acceptance checklist / release gate

### Visual acceptance

- [ ] At first glance, the page clearly resembles a real open hanging-file cabinet rather than a generic card UI.
- [ ] Each file has a credible cut edge, fold, surface bow/tension, tab and suspension structure.
- [ ] The same paper reads as coherent stock across label, upper crown, face and lower leaf.
- [ ] Rails, hangers, fasteners and drawer walls visibly connect; no floating decorative brackets.
- [ ] Shadows sit at physical contact points; they separate and soften correctly during lift.
- [ ] Dark navy powder-coated floor remains similar in desktop and mobile WebGL.
- [ ] The archive is premium and restrained, not grungy, glossy or visually cluttered.
- [ ] Before/after screenshots show material and construction improvement at **normal screen size**, not only extreme zoom.
- [ ] The top-down composition still feels intentionally art directed.

### Functional acceptance

- [ ] Every genuine published folder opens its correct case-study URL.
- [ ] Scroll-reading, hover, focus, touch and extraction work and do not flicker.
- [ ] All native labels are readable, in the right place, with no clipping or accidental exposure of screen-reader-only content.
- [ ] Year dividers, tabs and footer register do not overlap or cover focus targets.
- [ ] No-WebGL, context-loss, reduced-motion and forced-colours modes are functional.
- [ ] Back/forward navigation restores the expected state and focus.
- [ ] Browser modifier-clicks and keyboard activation retain standard semantics.

### Engineering acceptance

- [ ] No eager Three.js work on first navigation.
- [ ] No redundant frame loop or runaway texture allocation.
- [ ] Proper WebGL disposal on rebuild, route exit and context loss.
- [ ] Geometry/texture LOD adapts to available capability; low-power devices fall back gracefully.
- [ ] Existing typography tokens and site design standards remain enforced.
- [ ] All relevant CI tests pass without weakening assertions or blanket test skips.
- [ ] Final browser screenshots are attached to the PR and actually reviewed.
- [ ] No unlicensed imagery, assets, fonts or invented projects introduced.

---

## 8. Current tests and operational commands

Run from the repository root under the project's pinned **Node.js 24** runtime. Install using npm ci.

- npm run build:cabinet — build the optional Three.js Work-cabinet bundle.
- npm run test:cabinet — run 3D geometry, materials and integration contract tests.
- npm run lint:typography — enforce Geist Unified typography tokens.
- npm run test:typography — enforce typography contract and structure.
- npm run test:e2e — Playwright browser suite including desktop/mobile and GPU modes.
- npm run test:budgets — asset/performance budget checks.
- npm run test:lighthouse — configured Lighthouse assertions.
- npm run audit:shipped — shipped runtime dependency vulnerability gate.
- npm run quality — full CI-grade quality pipeline.

**Verified pre-handoff baseline:** PR #41's last complete single-branch quality run had 272 Playwright tests passed, 12 skipped, and successful Lighthouse, asset-budget and shipped-dependency checks. A later merge integration brings in new typography rules from main; verify its CI result before presenting a new baseline as fully green.

A screenshot of a real GPU render is evidence; a source contract that merely checks for the presence of an effect is not evidence that the effect looks realistic.

---

## 9. Guardrails for Gemini / other assisting agents

**DO:**
- Inspect the repository, source and screenshots before editing.
- Verify the current main commit and associated PR history.
- Suggest a clear art-direction improvement before changing the model.
- Prioritise genuine construction, tactile materials, physical shadow response and proportion.
- Work within the existing architecture and test contracts.
- Explain every changed physical parameter (thickness, gap, roughness, UV density, light intensity) in real-world terms.
- Provide actual before/after browser screenshots and keep a compact visual regression record.
- Return the source code, tests, asset provenance and an honest list of remaining shortcomings.

**DO NOT:**
- Swap out the Work archive for a generic masonry grid, floating cards or a draggable 3D demo.
- Change the locked fixed 90-degree view without explicit authorisation.
- Replace existing real HTML labels/links with GPU-only text.
- Invent work, titles, clients, years or case-study links.
- Trade accessibility, semantic HTML or load performance for animation.
- Introduce Geist Serif, arbitrary typography values or decorative clutter.
- Call procedural textures photographic scans, or claim "ultra-realism achieved" simply because tests pass.
- Add unlicensed external texture downloads, third-party assets or font binaries.
- Merge unreviewed failing code to main or silently disable tests to get green CI.

---

## 10. What Gemini should return

1. A **specific, screenshot-grounded criticism** of the current Work archive, ranked by severity and visual impact.
2. A final art-direction description rooted in real hanging-folder manufacture and photography.
3. Edited, working source files (or a clear PR/patch) with minimal unrelated churn.
4. Any new physical master asset (GLB/glTF/textures) with exact licence/provenance and optimisation details.
5. Updated or new unit, Playwright and GPU screenshot tests—not deleted protections.
6. Before/after desktop and mobile screenshots with captions about the improvements.
7. Measured performance comparison and proof of reduced-motion/accessibility compatibility.
8. A transparent release-status report: what passed, what failed, what still requires real-device review.

---

## 11. Gemini execution prompt (copy into Gemini with the ZIP)

> You are acting as a senior creative director, industrial-design-informed 3D artist, and expert Three.js/WebGL frontend engineer. Read this full handoff and all attached files, especially DESIGN.md, docs/work-filing-cabinet-concept.md, docs/work-filing-cabinet-threejs.md, js/work-cabinet-three.js, js/three/work-cabinet-geometry.js, js/three/work-cabinet-materials.js, styles/work-cabinet.css, and the before/after browser renders. My highest priority is *photographic believability*, not more effects or code. Critically compare the actual rendered scene with real hanging folders in a steel drawer. Diagnose every artificial-looking aspect of the geometry, stocks, rails, connections, lighting, shadow and spacing. Improve the existing implementation with authentic construction and physically plausible surface response. Preserve the fixed overhead camera, DOM-driven links and text, Geist Unified typography, true project content, performance tiers, accessibility and testing. Make concrete changes and produce verifiable before/after renders. Do not pretend that tests alone validate photographic realism. Identify what still prevents the result from looking indistinguishable from professional product photography.

---

## 12. Final principle

The aim is not to build the most elaborate shader or the largest 3D scene. It is to build **the most convincing, intentional, quietly beautiful physical filing system possible inside a real website**. Every added polygon, texture, shadow and animation must strengthen that idea. If a feature makes the page feel more like a game interface than a real object, remove it.
