# Work Filing Cabinet: Three.js implementation

Status: review branch (not production). Baseline: docs/work-filing-cabinet-concept.md.

## Locked creative direction

The archive remains a fixed, overhead orthographic drawer. Its dominant direction is dark powder-coated metal, subtly warm paper stocks, numbered die-cut tabs, simple indexing and controlled studio light. Avoid orbit controls, flashy effects, exaggerated dirt, parallax, synthetic floating paper and any additional unpublished case studies.

The new rendering layer must make the existing archive look physically credible, not replace its interaction model.

## Interaction boundary

The Work DOM remains authoritative. Existing js/core/work-cabinet.js controls reading-axis selection, scrolling, pointer extraction, navigation, keyboard focus, reduced motion and bfcache restoration. Existing HTML anchors provide real destinations and accessible names.

The 3D renderer is decorative and never receives pointer interactions. It observes the existing states and renders physical paper and metal layers under the original HTML text.

## Implementation layout

- js/core/work-cabinet-bootstrap.js: lightweight bootstrap that checks device constraints and loads Three.js only after visitor engagement; a settled visible scroll, pointer entry, or keyboard focus.
- js/work-cabinet-three.js: Three.js scene, geometry, paper texture generation, material system, lighting, folder transforms, on-demand rendering and cleanup.
- scripts/build-work-cabinet-three.mjs: esbuild entry for the isolated browser bundle.
- scripts/build-site.mjs: copies that bundle when available, including when building isolated content tests without the optional runtime.
- styles/work-cabinet.css: preserves all fallback presentation and removes flat paper backgrounds only after the first 3D frame is ready.
- tests/work-cabinet-three.test.mjs and tests/e2e/work-cabinet.spec.mjs: quality-tier, source, browser and fallback contracts.

## Art direction and engineering specifics

Folder fronts and undersheets have real thickness and bevelled tab geometry. Three high-roughness paper stocks use deterministic, low-amplitude fibre variation and sRGB colour textures. Year dividers are physically modelled. The cabinet has metallic side rails, environment reflections on capable desktops, and a shadow-producing directional key positioned to keep contact shadows tight.

The camera matches measured browser geometry rather than using a second independent layout. Rendering is demand-driven: sample the native HTML face's actual transformed rectangle (including CSS and WAAPI easing) rather than interpolating a competing 3D animation; redraw during the short transition window and stop when offscreen or hidden. Pixel density is capped. Expensive environment lighting is disabled on low-tier devices.

Save-Data and very low hardware-concurrency devices keep the existing CSS archive. Browser/WebGL failure, lost context and no JavaScript must never block the three existing published case-study links. Cleanup must release geometries, materials, textures, environment maps, observers and renderer on every failure path. Reduced motion, forced colours and low-memory tiers keep CSS.

## Honest limitations

This first pass builds reusable procedural geometry in Three.js. It does not yet supply a bespoke high-polygon Blender model, photographic texture scans or a custom HDRI. If sidewall realism, shadows, paper folds or measured bevels fail visual QA, replace the physical meshes with optimised glTF/GLB without changing the DOM architecture.

## Release gate

Run the Node quality suite, the production build, performance budgets and Playwright tests; then examine actual desktop/mobile screenshots in multiple browser engines and both themes. Test mouse, touch, keyboard, reduced motion, scroll suppression, native return, and unavailable WebGL. Do not merge solely on the basis of unit tests. A photographic-looking cabinet requires rendered visual acceptance.


## Visual evidence and measurable release gate

The quality workflow captures cabinet-*-css.png for mobile and desktop,
and cabinet-gpu-webgl.png in a dedicated Chromium project running with a
software-backed WebGL2 renderer. This is intentionally stronger than tests
that only check for a canvas element. The GPU project must assert that the
scene contains nonempty pixel variation, and verify real context-loss
recovery. A software GPU proves the rendering path runs in CI; it does not
replace testing on real low-power hardware. Download and inspect these CI artefacts before merging.

- First navigation to Work: no Three.js network request or GPU allocation.
- First physical interaction: the immediate CSS response must paint before
  costly optional 3D compilation. Assess INP/long tasks on real hardware,
  not only initial Lighthouse.
- HTML tab text must line up with the physical mesh at rest, on hover/focus,
  during extraction scaling and after resizing or late font loads.
- Never claim actual photorealism from a green CI suite alone. Compare the
  screenshots at 390px and 1440px across bright and dark themes.
- Do not invent case studies to make the drawer more dense; the published
  set and project URLs stay unchanged until real content is supplied.


## Material and geometric realism pass

The Work cabinet retains its 90-degree fixed orthographic composition. Rather
than introducing a controllable camera or expensive post-processing, the scene
now uses physically based construction cues that read correctly at this angle:

- **Three layers per manila stock colour:** a seeded colour map, a separate
  linear-height bump map and a separate linear roughness map. Grain is weak,
  uneven and directionally fibrous. Colour maps are sRGB; data maps are not.
- **True thin folded stock:** the die-cut outline is extruded only 0.52 units
  deep with a restrained paper bevel, plus a second offset leaf and a
  pressure crease with a subtle raised edge.
- **Contact occlusion:** a baked diffuse under-leaf shadow reinforces the
  directional PCF shadows as folders lift, without screen-space effects.
- **Powder-coated metal:** rails have radiused outer edges, recessed channels,
  subdued metal reflections and small countersunk mechanical fasteners.
- **Material and performance guardrails:** texture resolution is 384 on
  desktop and 256 on mobile; the GPU scene is never imported during first
  paint; textures/materials and geometries are disposed on teardown.

The material generator is deterministic and locally authored: no downloaded
photo scans or third-party textures. It may look more photographic than a
flat colour card, but realism still requires human judgement of a screenshot
and a real-device interaction trace. Do not equate passing tests with a
validated photorealistic result. The scene remains deliberately subordinate
to the real accessible labels and native case-study links.

### Open-drawer continuity

The archive intentionally holds only three real published case studies.
To avoid making the necessary mobile spacing look like floating website
cards, the scene models a powder-coated recessed metal floor below the
shadow receiver, plus two thin interior hanging-file support rails.
This is physical furniture, not fake project content. The HTML tab face
keeps an opaque paper-toned background for text contrast, but uses very
subtle directional highlights to match the model's warm key light.
Stock selection follows each folder's A/B/C tab token—not the list
index, which also counts year separators.

### Physical shadow and reflectance correction

Desktop screenshot QA revealed that a metallic drawer-floor shader was
incorrectly reflecting the white studio environment, washing the drawer
interior to pale grey. Mobile, without that environment, became nearly black.
The floor has therefore been corrected to **dielectric powder-coat paint**:
navy diffuse colour, near-matte roughness, no studio environment reflections,
and a tiny ambient emissive floor to preserve consistent colour across tiers.
The metal rails also have lower metallic reflectance; screws retain a true
steel finish.

The fine contact-occlusion patch now remains anchored to the original
drawer surface when a folder moves. Its opacity decreases as the paper lifts,
while Three.js PCF cast shadows continue to track the actual lifted geometry.
A per-folder cloned shadow material is explicitly disposed at rebuild/teardown.
The screenshot contract samples the unobstructed drawer floor to prevent
the former bright-grey desktop regression from returning.


### HDR floor-regression follow-up

The first dielectric MeshStandard floor still appeared grey under the desktop
studio pipeline (GPU test sampled roughly 180 luminance versus the 115
limit), while mobile remained dark. Because the floor is a mostly stationary,
near-orthographic powder-coat surface, it now uses a deliberately baked
low-contrast colour texture: tiny pigment grain, slight depth falloff, and
narrow side-rim bounce. The floor uses a colour-only basic material with
tone mapping disabled; it cannot wash out under RoomEnvironment, and a
deterministic colour-variation test ensures it is not a featureless flat fill.
Folder stock, metal rails, real geometry and dynamic PCF shadows remain
physically lit.

### Physical construction: late November refinement

A file cabinet is not a collection of rectangular cards. The overhead view
must show authentic suspension and the physical tension of thin stock.

- Paper fronts now include a bounded, tessellated **calendered sheet surface**:
  a subtle centre bow, edge spring, and restrained fibre tension. UVs are
  projected in world-size units so existing colour, relief and roughness maps
  remain correctly registered across the full visible sheet.
- Top-tab suspension is modelled as a pair of small, bent metal hooks on each
  folder, reaching the existing support rails. Rolled slot sleeves, a two-ply
  tab crown, and an embossed reinforcement line give the die-cut folder real
  construction clues without taking over the HTML labels.
- Mobile white label pockets use a more compact tab with a wider but lower
  profile and smaller type, so a long project name does not inflate into
  a giant floating card. A new viewport geometry test guards readability,
  tab size and horizontal overflow.
- The additional surface detail is made only on optional GPU activation;
  mobile has fewer paper subdivisions and lower-resolution hanger geometry.
  Geometry is disposed with its owning file group after resize/context loss.
- Furniture construction was cross-checked against physical hanging-folder
  photographs and filing-supplies catalogues; details are modelled rather
  than copying photographic artwork.

The material remains a crafted real-time simulation, not a photographic scan.
Preserve the orthographic view and native case-study links.
