# Figma portfolio — fidelity and continuation specification
_Date: November 20, 2026 · implementation branch: `design/geist-sans-headlines-figma-system`_

## Deliverable and current state

- Figma design: https://www.figma.com/design/ZI8H1lBn8EKCpqmUqcnZHj
- Screens page: `01 · All screens / Desktop + Mobile`; foundation page `00 · Foundations`.
- 15 desktop structural screens (1440px); 15 mobile structural screens (390px).
- 52 local variables for colour and dimensions; 11 local typography styles.
- 37 original raster source images successfully imported as separate layers (3 hero sources + 34 supporting assets) and two original SVG marks imported.
- **Do not call the Figma file pixel-perfect.** The existing page content is still the earlier structural reconstruction. The replacement with full source case-study copy and plate-specific placement was blocked by the Figma MCP Starter-plan rate limit. Existing imported photography has not been laid out inside the corresponding sections.
- Image asset use: import/source originals, never synthetic or unrelated stock photography. Avoid flattening the whole page into a raster.

## Source of truth / typography

- Site: https://miebaka-portfolio.vercel.app/
- Repo: https://github.com/miebaka/portfolio/
- `styles/foundations.css` is the source of raw and semantic colour tokens, typography, spacing and grid.
- `styles/forliving-editorial.css`, `styles/pages-v4.css`, `styles/home.css` layer specific visual decisions.
- **Headlines**: Geist Sans (Figma local family `Geist`); **body**: Geist Sans; **labels/nav/meta**: Geist Mono. Current deployed live site may still display Geist Serif until PR #30 is merged. Do not use that deployed serif face in the updated Figma artboards.
- Existing major display sizes: 112px case-title at wide desktop, 60.8px section headings in the live case pages; body 17px / 25.5px; desktop nav 12px mono. Adjust line wraps after Sans substitution; don't blindly copy serif line breaks.
- Responsive reference: 12 desktop columns, 8 tablet, 4 mobile. Desktop max content width 1600px; side margins clamp(20px,4.667vw,84px); gutter clamp(14px,1.5vw,24px). Long-form copy 60–68ch.
- Light background `#F8F9FC`, primary ink `#07112B`, ultramarine `#002080`; dark background `#07112B`, text approx `#C3C6CF`, interactive blue `#B1C5FF`. All colours should bind to semantic modes rather than hardcoded swatches.
- Project-specific case backgrounds may include cream editorial panel `#F9F4E1`; add that colour to the case-specific system before binding it everywhere.

## Layout composition and imagery

Each complete case-study should follow the production DOM:
1. Global nav, back-to-work link, large title, case summary, 5-part facts row.
2. Full-width hero figure with image, numbered plate and caption.
3. Evidence-trail section with cards/linked rows for Decision, System, Survival, and (TEDx only) Encounter.
4. Editorial introductory statement and five-item chapter index.
5. Five full chapters: Problem, Decision, System, Applications, Outcome.
6. Embedded image plates exactly in source order. Preserve original aspect ratios and alternate larger and narrower media spans, not repeated 16:9 crops.
7. Next-project navigation and contact footer with user's own embossed signature.
8. Mobile: one-column order, never overlay text on images without matching the production source.

The server-rendered HTML files are the authoritative full-copy sources; `data/case-studies.js` defines structured case narratives and captions. Images have accessible alt text and each `PLATE XX` reference. Preserve the case proof caveats: presentation mockups are not presented as real deployments.

### Original image inventory

**work/chopbox.html**
- `/assets/images/optimized/chopbox-platter-1080.jpg`
- `/assets/images/optimized/chopbox-logo-lockups-1080.jpg`
- `/assets/images/optimized/chopbox-typeface-810.jpg`
- `/assets/images/optimized/chopbox-palette-1080.jpg`
- `/assets/images/optimized/chopbox-packaging-1080.jpg`
- `/assets/images/optimized/chopbox-apron-1080.jpg`
- `/assets/images/optimized/chopbox-campaign-1080.jpg`
- `/assets/images/optimized/chopbox-billboard-1080.jpg`

**work/rivo.html**
- `/assets/images/optimized/rivo-in-use-1080.jpg`
- `/assets/images/optimized/rivo-wordmark-1080.jpg`
- `/assets/images/optimized/rivo-palette-1080.jpg`
- `/assets/images/optimized/rivo-tote-1080.jpg`
- `/assets/images/optimized/rivo-stage-1080.jpg`
- `/assets/images/optimized/rivo-flag-1080.jpg`
- `/assets/images/optimized/rivo-stationery-1080.jpg`
- `/assets/images/optimized/rivo-guidelines-1080.jpg`

**work/tedx-rsu.html**
- `/assets/images/optimized/tedx-rsu-campus-banner-1080.jpg`
- `/assets/images/optimized/tedx-rsu-logomark-1080.jpg`
- `/assets/images/optimized/tedx-rsu-typeface-1080.jpg`
- `/assets/images/optimized/tedx-rsu-palette-1080.jpg`
- `/assets/images/optimized/tedx-rsu-pattern-1080.jpg`
- `/assets/images/optimized/tedx-rsu-merch-1080.jpg`
- `/assets/images/optimized/tedx-rsu-street-banner-1080.jpg`
- `/assets/images/optimized/tedx-rsu-event-1080.jpg`

**essays/designing-for-disability-in-nigeria.html**
- `/assets/images/optimized/disability-flying-stars-1080.jpg`
- `/assets/images/optimized/disability-types-1080.jpg`

**essays/when-the-swoosh-lost-its-soul.html**
- `/assets/images/optimized/swoosh-dream-crazy-1080.jpg`
- `/assets/images/optimized/swoosh-nike-2021-540.jpg`
- `/assets/images/optimized/swoosh-outlet-racks-1080.jpg`

Additional imported assets:
- `assets/images/optimized/miebaka-joshua-profile-600.webp`
- Seven `assets/experiments/*.webp` poster artworks (Wada Sanzō, GCFR, Party #2, four Peter Obi posters).
- Editable original SVG assets `assets/images/miebaka-joshua-logo.svg` and `assets/images/miebaka-joshua-script-name.svg`.

## Exact case-study copy, with preserved claims


### ChopBox (work/chopbox.html)

**Opening statement:** A food identity designed to feel warm, generous and ready to order.

- Context: Independent brand identity commission
- Role: Brand strategy, identity design and packaging
- Constraint: Build appetite and recognition without defaulting to the category’s loud delivery-app shorthand
- Year: 2022
- Delivered: Identity, packaging and rollout

**problem — How can a food brand feel worth ordering before the first bite?**

ChopBox needed an identity that felt warm, generous and immediately appetising before a first order arrived. The work began as an independent identity commission spanning strategy, packaging and rollout.

Food brands often reach for the same loud reds and delivery-app urgency. ChopBox needed enough energy to invite an order while still feeling considered, trustworthy and distinct.


**decision — Use appetite as the filter**

I built the identity from strategy out, checking each decision against one question: does this make you hungry? The filter kept the work focused on warmth, generosity and food rather than decoration.

A friendly rounded logotype and toasted yellow-red palette replace the category's harder, louder shorthand. The result aims to feel ready to order without making every application shout.

- Plate asset: `../assets/images/optimized/chopbox-logo-lockups-1080.jpg` — Three ChopBox lockups in yellow and red on black: full logo, wordmark, and the CB monogram.
- Plate asset: `../assets/images/optimized/chopbox-typeface-810.jpg` — DM Sans shown as a full character set in black on Deepfry Yellow.

**system — Build the identity for the box and the screen**

The full logo, wordmark and CB monogram provide different levels of recognition. Deepfry Yellow and Fireside Red carry the appetite signal, while DM Sans keeps supporting information direct and legible.

- Plate asset: `../assets/images/optimized/chopbox-palette-1080.jpg` — The ChopBox palette: Deepfry Yellow, Fireside Red, black and white, each with usage notes.

**applications — Stress-test one voice across formats**

Packaging, uniform, campaign and out-of-home applications show how the rounded voice and warm palette stay recognisable at very different scales.

Together, the applications establish a consistent kit for presenting food, packaging offers and direct campaign messages.

- Plate asset: `../assets/images/optimized/chopbox-packaging-1080.jpg` — A red lid for The Chop Dip pepper sauce, shown against black.
- Plate asset: `../assets/images/optimized/chopbox-apron-1080.jpg` — A red ChopBox apron printed with the line Hello, I am the chef.
- Plate asset: `../assets/images/optimized/chopbox-campaign-1080.jpg` — A campaign poster reading Abobi, chop life, make life no chop you, surrounded by flying small chops.
- Plate asset: `../assets/images/optimized/chopbox-billboard-1080.jpg` — A ChopBox advert wrapped around a water tower against a blue sky.

**outcome — One appetite-led system across every touchpoint**

The final system connects packaging, uniform, campaign and outdoor applications through one appetite test: every part should make the food feel warm, generous and worth ordering.


### Rivo Studio (work/rivo.html)

**Opening statement:** A software studio positioned around access, built to feel useful before it feels technical.

- Context: In-house identity work at Rivo Studios
- Role: Brand strategy, identity design and guidelines
- Constraint: Make a software studio feel capable without relying on cold, technical category codes
- Year: 2024
- Delivered: Identity system and rollout

**problem — How can access feel like a brand position?**

Rivo Studio needed an identity for a software practice positioned around access. The work had to make that intention visible in the brand itself, rather than leave it as a statement beside the design.

The category often uses complexity as shorthand for capability. Rivo needed to communicate technical confidence while remaining clear, approachable and useful across everyday brand materials.


**decision — Soften the technical signal**

I worked from the spoken name, /ˈraɪvoʊ/, then tested how it behaved at small sizes, in strong colour pairings and beside practical information.

The wordmark removes hard corners and keeps the letterforms open. Its job is to feel assured without becoming severe, giving the studio a recognisable voice before supporting graphics are added.

- Plate asset: `../assets/images/optimized/rivo-wordmark-1080.jpg` — The Rivo wordmark in black, centred on a full field of signal yellow.

**system — One primary field, one signal colour**

Clar blue anchors the identity against deep navy. Signal yellow is reserved for emphasis, allowing hierarchy to come from a controlled contrast rather than a growing collection of accents. The guidelines record how the wordmark, colour and typography work together.

- Plate asset: `../assets/images/optimized/rivo-palette-1080.jpg` — The Clar swatch at hex 0000FF beside four progressively lighter tints.

**applications — Stress-test one limited vocabulary across scales**

The system was extended from a carried object to a large environmental surface. The same short proposition and yellow signal remain legible without turning every touchpoint into the same composition.

The delivered identity included guidelines, stationery and a practical application system that another designer could carry forward.

- Plate asset: `../assets/images/optimized/rivo-tote-1080.jpg` — Tote-bag application visualisation reading Software that simply works for all in yellow.
- Plate asset: `../assets/images/optimized/rivo-stage-1080.jpg` — Stage-screen application visualisation reading From village squares to virtual spaces.
- Plate asset: `../assets/images/optimized/rivo-flag-1080.jpg` — Flag application visualisation reading Software that simply works for all against open sky.
- Plate asset: `../assets/images/optimized/rivo-stationery-1080.jpg` — Business-card application visualisation with blue and yellow faces arranged on dark cloth.
- Plate asset: `../assets/images/optimized/rivo-guidelines-1080.jpg` — Brand-guidelines book visualisation with the Rivo cover facing up.

**outcome — A focused system built for everyday use**

The final identity gives Rivo a recognisable wordmark, a stable blue field, one signal colour and a documented set of rules for applying them across brand materials.


### TEDx Rivers State University (work/tedx-rsu.html)

**Opening statement:** A global event system given a distinct pause-and-reflect rhythm.

- Context: Identity commission for TEDx Rivers State University
- Role: Identity design, creative direction and print
- Constraint: Create a distinct local event language inside TEDx’s fixed global identity
- Year: 2023
- Delivered: Event identity, social creative, programmes, merchandise, campus signage and stage applications

**problem — How can a local event speak inside a fixed global identity?**

TEDx gives every event a strict global identity and asks each chapter to find its own character within it. For TEDx Rivers State University, the work had to feel local while keeping the parent system recognisable.

The identity needed one idea strong enough to hold across social promotion, printed collateral and the event stage. The TEDx red and wordmark were fixed; the event’s own character had to come from the elements around them.


**decision — Give the event a pause**

“Pause…” is the organising idea. Its three dots leave the thought open; the line beneath it makes the invitation explicit: “Reflect. Reconsider. Reward.”

The theme mark sits alongside the TEDx identity in the applications, giving the event its own voice within the parent system. Neue Haas Grotesk carries the direct voice, while the type specimen turns the theme into a short reminder: “Remember to stay pause-itive.”

- Plate asset: `../assets/images/optimized/tedx-rsu-logomark-1080.jpg` — The white pause wordmark ends with three dots above Reflect, Reconsider, Reward, on black.
- Plate asset: `../assets/images/optimized/tedx-rsu-typeface-1080.jpg` — Red type on black reads Remember to stay pause-itive above a Neue Haas Grotesk specimen.

**system — Colour, type and a recurring ripple**

Porphyra, Kakhol and Red ochre form the theme palette. The colour sheet records the values and tint ramps used to carry the system across digital and print.

The ripple pattern supplies a recurring background, while the pause mark and typographic questions keep the central idea legible.

- Plate asset: `../assets/images/optimized/tedx-rsu-palette-1080.jpg` — Porphyra, Kakhol and Red ochre swatches with colour values and light-to-dark tint ramps.
- Plate asset: `../assets/images/optimized/tedx-rsu-pattern-1080.jpg` — Irregular concentric magenta rings radiate outward over a darker Porphyra field.

**applications — An invitation people could encounter**

The pause motif moved from social promotion into programmes, merchandise, campus banners and the event stage.

The hoodie places the theme mark beside the TEDx lockup. The street banner turns the idea into a public prompt, while campus and event-day photographs show the identity in use with attendees.

- Plate asset: `../assets/images/optimized/tedx-rsu-merch-1080.jpg` — A person wearing headphones and a white hoodie with the pause theme mark and TEDx Rivers State University lockup.
- Plate asset: `../assets/images/optimized/tedx-rsu-street-banner-1080.jpg` — A Porphyra street-pole banner asks what lessons you would tell your ten-year-old self, over the ripple pattern.
- Plate asset: `../assets/images/optimized/tedx-rsu-event-1080.jpg` — Two attendees stand beside a large red TEDx X, one holding a smaller red X, on event day.

**outcome — A theme that held across the event**

The final identity carried one invitation to pause and reflect, from social promotion into garments, campus signage, printed materials and the event-day environment, while keeping TEDx recognisable.



## Shader art direction — source parity

Source: `js/hero-water-three.js`, `js/core/hero-wave.js`, `styles/home.css`.

The home hero is a GPU-driven **2.5D height-field fluid simulator**, not true 3D water volume; implementation includes advection, divergence, a Jacobi pressure solver, velocity projection, wave integration, refracted caustic focusing, Fresnel reflection and glint. Figma should document the appearance as labelled *static reference states*, never claim its static raster is a live shader.

**Day / Print surface**: light from near surface normal; turquoise/deep-blue transmission; bright white/warm specular accents. Source shader: transmission 1.5, floorColor (0.028, 0.24, 0.35), deepColor (0.008, 0.14, 0.24), lightColor (1.0, 0.97, 0.88), lightDirection (0.07, 0.12, -1.0), skyColor (0.36, 0.62, 0.82), nightFactor 0.

**Night / Screen surface**: dark-blue deep water, cold reflected moonlight, very low transmission, restrained silver glints. Source: transmission 0.15, floorColor (0.009, 0.022, 0.05), deepColor (0.005, 0.013, 0.034), lightColor (0.4, 0.57, 0.78), lightDirection (0.38, 0.24, -0.89), skyColor (0.018, 0.035, 0.09), nightFactor 1.

Include labelled state frames `Day / Rest`, `Day / Pointer disturbance`, `Night / Rest`, `Night / Pointer disturbance`, and `Reduced motion / static fallback`. Use original site screenshots as references, but do not flatten the actual content layouts or invent visual parity.

## Interaction state matrix

| Component | State set | Source / timing |
|---|---|---|
| Floating desktop nav capsule | resting, active page, hover, keyboard focus | `styles/forliving-editorial.css`, `js/core/navigation.js`: centered dark pill, light mono text, responsive fallback; response 220ms cubic-bezier(.25,1,.5,1) |
| Mobile index | closed, open, menu item stagger, Escape close, focus return | `js/core/navigation.js`, `styles/motion-language.css`: accessible trap, lock body scroll and restore; stagger 35ms increments with 460ms entrance |
| Theme pull cord | light, dark, dragged, released, keyboard toggle | `js/core/theme-pull-cord.js`: semantic Print/Screen switch and pointer capture; preserve accessible switch label |
| Hero shader | day/night; idle/disturbed; GPU unavailable; reduced motion | `js/hero-water-three.js`: continuous WebGL2 heightfield if supported; fallback must retain legibility |
| Home entrance | headline lines, statement, metadata | `styles/motion-language.css`: 800ms headline enter, 680ms copy with 240ms delay, 640ms metadata with 420ms starting delay; ease cubic-bezier(.16,1,.3,1) |
| Selected work list | normal, hover-preview, keyboard focus, pointer-tracking | `js/core/motion-language.js`: image preview follows pointer within maximum ±28px X and ±16px Y; on keyboard focus preview remains available without pointer |
| Services | rest, pointer spotlight, hover/focus, motion-off | `styles/motion-language.css`: 350px radial spotlight and 220ms response, hidden in reduced motion |
| Article table of contents | idle, hover, active section, keyboard focus | `styles/pages-v4.css`: highlighted chapter index and progress line (2px) |
| Footer signature | embossed still, pointer hover, tap ripple, Enter ripple, reduced motion | `js/core/footer-signature.js`, `styles/forliving-editorial.css`: original SVG plus controlled dot matrix, never flatten the SVG |
| Case index | idle, hover/focus, active pressed | `styles/pages-v4.css`: small 97% press scale where active, parent background/foreground contrast |
| Contact form | idle, focused, invalid, validation, sending, success/error | `contact.html`, `js/core/form.js`; review against live for exact messaging |

**Reduced motion is a required full experience, not a hidden implementation note.** Render no fake continuous animation on the Figma boards. Preserve keyboard access, focus outlines, navigation order and touch equivalents.

## Remaining QA and blockers

- Figma's Starter-plan MCP rate limit prevented fully rebuilding and positioning the 30 screen frames in this session.
- Image uploads succeeded but are stand-alone imported layers, not placed within individual screen hierarchies.
- Audit the site at 390px, 768px, 1440px and 1905px (light, dark, keyboard focus and reduced-motion); compare live screenshots with Figma frames.
- Validate all 15 routes for precise image crops, captions, responsive typography/line breaks, section padding, footer placement and fixed/capsule nav.
- Do not claim full pixel fidelity until the above checks pass.
- Node.js 24 CI/build and Vercel deploy must pass separately; PR #30 is currently unmerged and Vercel reported build-rate-limit failure.

## Proposed acceptance gates

1. All page screens contain authentic copy and original imagery *inside* their editable semantic frames.
2. Components use instances, colour properties bind to mode-aware variables and typography is the selected Geist family.
3. Correct case-study hero/proof/gallery/outcome flow and all image plate captions.
4. Annotated interaction-state components show accessible defaults and reduced-motion behaviour.
5. Source-site visual comparison passes across all viewports, with any intentional adaptation documented.
