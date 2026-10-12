# Design Thesis: Ultramarine Air

**The Miebaka Joshua portfolio — identity, system and engineering, in one document**

Status: normative
Version: 5.0
Owner: Miebaka Joshua
Platform: miebaka.design
Last updated: 12 October 2026

**Supersedes:** `engineering-specification.md` (v4.0) and `personal-identity-system_design.md` (v2.0). Both are retained as history only. Where this document and either of them disagree, this document wins.

**Built from:** the two source documents, reconciled against the owner's answers in `Questons_Before_Engineering_Specification.md` (Round 1 and Round 2). Every place where the sources conflicted, or where the answers overrode them, is recorded in Appendix A. Items still needing the owner are in Appendix C.

---

## 1. The thesis

### 1.1 In one paragraph

The portfolio is a calm, exacting editorial experience for a designer who moves between strategy, visual systems and production. It borrows the *system depth* of Material 3 (tokens, roles, states, adaptive behaviour, measurable gates) and refuses its *visual language*. What the visitor sees is paper, ink and Ultramarine: generous space, precise hierarchy, expressive typography, authored project imagery and a small number of decisions repeated with confidence. What the visitor does not see is the machinery that makes it hold together.

It must demonstrate senior-level art direction, brand-system thinking, visual design, interaction design and production discipline. It must not resemble a Google product, a software dashboard or a component-library demo.

### 1.2 The success test

After a first visit, the visitor should think:

> "That is a beautiful, well-thought and designed portfolio; this person must be a very good designer."

Every decision in this document is judged against that sentence. If a feature does not make that thought more likely, it is a candidate for removal.

### 1.3 Character

- The portfolio must feel **rich, unique and well considered**.
- It must never feel **inconsistent, jumbled or inexperienced**.

### 1.4 Positioning

**I design brand systems, then build the tools that keep them intact.**

Support line:

**Brand strategy, identities, campaigns and production systems designed to hold together in the real world.**

The proposition carries the memory. The support line explains what "tools" means in practice. They always appear together in the hero.

### 1.5 Outcomes

In this order:

1. Secure senior design employment (the weighted priority).
2. Win suitable independent client work.
3. Establish a recognisable design point of view.

The primary conversion is **contact**. Secondary outcomes, in order: view a complete case study; remember the name and return; download the CV; visit LinkedIn.

### 1.6 Audience, in strict order

1. Design leaders and hiring managers.
2. Founders and potential clients.
3. Creative directors and collaborators.
4. General audiences.
5. Other designers.

Target roles: **Art Director, Senior Brand Designer, Senior Visual Designer.** The site serves remote international roles, Nigerian roles and relocation opportunities at once, without showing a different identity to each.

### 1.7 Design read

| Dimension | Setting |
| --- | --- |
| Page kind | Editorial designer portfolio |
| Atmosphere | Gallery-airy, intelligent, exact, warm without being decorative |
| Design variance | 8/10. Asymmetric but readable |
| Motion intensity | 8/10. Expressive throughout but controlled; every larger movement is tied to a direct interaction |
| Visual density | 2/10. Space is the principal grouping device |
| Shape | Sharp editorial surfaces; function-led rounding only where a control demands it |
| Theme | One coherent theme per page. Sections never invert independently |

---

## 2. Governing principles

1. **Roles before values.** Components consume system or component tokens, never raw colour values.
2. **One visual argument.** Ultramarine carries identity. Coral carries interaction. Neutrals carry structure. Project colour lives inside its case study.
3. **AAA by placement.** Every text placement meets 7:1 contrast. No size, weight, state or function is exempt.
4. **Pair colours intentionally.** An `on-*` role is used only on its paired container. Arbitrary mixing is forbidden.
5. **Space before lines.** Spacing, alignment and surface steps come before borders.
6. **Images stay authored.** Project work is never recoloured, duotoned or desaturated.
7. **Motion explains.** Motion communicates feedback, state, hierarchy, spatial continuity or causality, or it is removed.
8. **Progressive enhancement.** Navigation, content, links and project access work without JavaScript.
9. **Evidence over assertion.** Unverified outcomes, testimonials and collaborator credits are never published. Unknown metrics are omitted, not estimated.
10. **One source of truth.** This document defines the intended system. Automated tests verify the shipped one. When documentation and production disagree, repair both in the same approved change.

---

## 3. The role of Material 3

Material 3 supplies discipline, not appearance.

**Adopted**

- Reference, system and component token tiers.
- Semantic colour roles with explicit foreground pairs.
- Surface containers for hierarchy.
- State layers and a complete interaction-state model.
- Role-based typography, shape, elevation and motion.
- Adaptive navigation and responsive composition.
- Accessible components with equivalent keyboard behaviour.
- Documented loading, empty, error, offline and reduced-capability states.
- Measurable release gates.

**Not adopted**

- Widespread rounded cards, bubbly geometry and generic pills.
- Roboto and tonal-purple branding.
- App-dashboard composition.
- Material's baseline contrast targets (this system is stricter).
- Material's default component appearance.

References: <https://m3.material.io/foundations/>, <https://m3.material.io/styles/color/the-color-system>, <https://m3.material.io/styles/typography/applying-type>, <https://m3.material.io/styles/motion>.

**What is protected.** The following are untouchable and anchor the identity: Ultramarine identity, editorial typography, full-screen hero, Print/Screen themes, paper grain, swatch fan, dot-matrix footer signature. Everything else may be redesigned. Radical latitude is a deliberate mix of strengthening the existing identity and substantially redesigning structure and interactions.

---

## 4. Precedence and sources of truth

1. Current owner direction.
2. This design thesis.
3. `DESIGN.md` and `docs/design-system-v3.md`.
4. Shared tokens and component contracts in production code.

Historical specifications explain past decisions but never override this document.

Content lives in `data/site.js` or a successor content schema. Presentation values live in design tokens. Templates must not duplicate content that can be modelled once.

---

## 5. Colour and themes

### 5.1 Identity roles

- **Ultramarine `#002080`** is the signature colour.
- **Paper and Ink** form the editorial base. Pure black and pure white are not part of the interface palette.
- **Coral** appears only during hover, focus, selection, validation or other active feedback. It is never a resting decorative accent.
- **Project imagery** keeps its authored colour.
- **Controlled expressiveness** comes from the tonal range of the blues (Air, Blue 30, Blue 80), the hero's material response and project colour worlds. It does not come from additional accent families.

### 5.2 Reference tokens

Hex is the production source of truth. OKLCH is recorded for design reasoning only.

| Token | Hex | OKLCH | Function |
| --- | --- | --- | --- |
| `ref.ultramarine` | `#002080` | `oklch(0.308 0.163 263.4)` | Brand key colour |
| `ref.air` | `#E8EEFF` | `oklch(0.950 0.024 270.3)` | Light brand container |
| `ref.paper` | `#F8F9FC` | `oklch(0.982 0.004 271.4)` | Light canvas; fixed on-dark text |
| `ref.midnight` | `#07112B` | `oklch(0.186 0.055 265.2)` | Dark canvas; fixed on-light text |
| `ref.blue.30` | `#1C3DA4` | `oklch(0.408 0.170 265.4)` | Light-theme secondary |
| `ref.blue.80` | `#B1C5FF` | `oklch(0.829 0.085 269.7)` | Dark-theme primary and secondary |
| `ref.neutral.30` | `#3C4661` | `oklch(0.397 0.048 268.5)` | Light muted text and meaningful outline |
| `ref.neutral.80` | `#C3C6CF` | `oklch(0.827 0.013 271.3)` | Dark muted text and meaningful outline |
| `ref.coral.30` | `#83251D` | `oklch(0.412 0.130 28.8)` | Light interactive accent |
| `ref.coral.75` | `#FFA08F` | `oklch(0.798 0.117 30.8)` | Dark interactive accent |
| `ref.error.30` | `#8F0B28` | `oklch(0.417 0.160 18.4)` | Light error |
| `ref.error.75` | `#FF9E9F` | `oklch(0.798 0.116 19.3)` | Dark error |

### 5.3 System roles

Print is the light theme. Screen is the dark theme.

| Role | Print (light) | Screen (dark) | Allowed use |
| --- | --- | --- | --- |
| `surface` | Paper | Midnight | Page canvas |
| `surface-container-low` | `#EFF1F6` | `#0C1730` | Quiet grouped regions |
| `surface-container` | `#ECEEF3` | `#111B33` | Navigation and controls |
| `surface-container-high` | `#F2F3F8` | `#172138` | Inputs and emphasised neutral regions |
| `on-surface` | Midnight | Paper | Primary text and icons |
| `on-surface-variant` | Neutral 30 | Neutral 80 | Secondary text and labels |
| `outline` | Neutral 30 | Neutral 80 | Boundaries required to understand or operate a control |
| `primary` | Ultramarine | Blue 80 | Links, active states, key icons |
| `on-primary` | Paper | `#032485` | Content on primary fills |
| `primary-container` | Air | Ultramarine | Branded containers |
| `on-primary-container` | Ultramarine | Paper | Content on primary containers |
| `tertiary` | Coral 30 | Coral 75 | Hover, focus, selection, rare emphasis |
| `on-tertiary` | Paper | Midnight | Content on tertiary fills |
| `error` | Error 30 | Error 75 | Error copy and essential icons |

`outline` and `on-tertiary` were referenced but undefined in the source documents. They are defined here from the sources' own token values (Neutral 30/80 for "meaningful outline"; Paper/Midnight as the fixed on-colours). `action`, `on-action`, `action-hover` and `on-action-hover`, used in the old component tokens, map as follows: `action` = `primary`, `on-action` = `on-primary`, `action-hover` = `tertiary`, `on-action-hover` = `on-tertiary`.

Decorative surface steps and non-essential separators are exempt from contrast because they carry no information. A boundary needed to understand or operate a control uses `outline`.

The same semantic role stays attached to the same layout region at every breakpoint. Responsive changes alter composition, not colour meaning.

### 5.4 Verified contrast pairs

These are the only permitted foreground/background pairings. All ratios were recomputed from the hex values on 12 October 2026 using the WCAG 2 relative-luminance formula, and rounded down.

| Foreground | Background | Ratio |
| --- | --- | ---: |
| Midnight | Paper and all light surface containers | 16.09:1 |
| Neutral 30 | Paper and all light surface containers | 8.07:1 |
| Ultramarine | Paper and all light surface containers | 11.91:1 |
| Blue 30 | Paper and all light surface containers | 8.03:1 |
| Coral 30 | Paper and all light surface containers | 8.04:1 |
| Error 30 | Paper and all light surface containers | 8.05:1 |
| Paper | Midnight and all dark surface containers | 15.21:1 |
| Neutral 80 | Midnight and all dark surface containers | 9.38:1 |
| Blue 80 | Midnight and all dark surface containers | 9.38:1 |
| Coral 75 | Midnight and all dark surface containers | 8.14:1 |
| Error 75 | Midnight and all dark surface containers | 8.11:1 |
| Paper | Ultramarine | 13.13:1 |
| Blue 80 | Ultramarine | 8.10:1 |
| Neutral 80 | Ultramarine | 8.10:1 |
| Air | Ultramarine | 11.92:1 |
| Ultramarine | Air | 11.92:1 |
| `#032485` | Blue 80 | 7.71:1 |
| Paper | Coral 30 | 8.87:1 |
| Midnight | Coral 75 | 9.49:1 |
| Paper | Error 30 | 8.87:1 |
| Midnight | Error 75 | 9.46:1 |
| Coral 75 | Ultramarine | 7.03:1 |

Two consequences of the arithmetic worth stating plainly:

- **Ultramarine is never text or an icon on Screen surfaces.** Against Midnight it measures 1.35:1. On Screen, `primary` is Blue 80, which is why the role table swaps it. Ultramarine appears on Screen only as a fill (hero field, primary container).
- **On Ultramarine fields, focus and interactive text use Coral 75, in both themes.** It clears 7:1 by a narrow margin (7.03:1), so no tint, opacity or overlay may sit between it and the field.

### 5.5 The universal 7:1 rule

- Every text placement meets 7:1 in Print, Screen and every project theme.
- This applies regardless of size, weight, state or function. Large-text and inactive-text exceptions are not used.
- It covers navigation, buttons, links, labels, metadata, captions, placeholders, validation messages, disabled text and text over imagery.
- Text over variable imagery requires a tested semantic backing surface. Project-card copy uses Paper over a bounded Midnight veil. Untested text directly over imagery is forbidden.
- Essential icons and focus indicators remain clearly distinguishable in both themes and meet their non-text contrast requirement.
- No expressive colour, project theme, state layer, image overlay or disabled treatment may weaken the rule.
- Automated tests cover every documented text pair. Browser review verifies rendered states, including text over media.

### 5.6 Print and Screen

- Print is a light paper environment: dark ink, Ultramarine structure.
- Screen is a dark, luminous editorial environment: no neon, no glow-heavy or gaming aesthetics.
- Both are complete themes and equally important. Neither is a superficial inversion of the other.
- Theme changes preserve component roles, reading order and hierarchy.
- Preference defaults to the operating system, supports manual override and persists locally.

### 5.7 Project theming

- A case study may temporarily tint the navigation and page background with an approved project palette.
- The theme change is page-level: the whole page retints, sections never invert independently.
- Every project palette is mapped into the same semantic roles as the core themes and ships with its own verified contrast table. A project palette without a passing table is not approved.
- Project themes keep the site's typography, spacing, state and accessibility contracts.
- Leaving the case study restores the global theme without a flash of incorrect colour.

### 5.8 Component tokens

Component tokens alias system roles and exist only where a component needs a stable contract. Components never consume raw colour values. A raw value outside reference-token declarations or authored project-media data blocks release.

```css
--comp-nav-bg: color-mix(in srgb, var(--sys-color-surface) 97%, transparent);
--comp-link: var(--sys-color-primary);
--comp-button-bg: var(--sys-color-action);
--comp-button-fg: var(--sys-color-on-action);
```

The navigation's 3% transparency is the maximum glass approximation permitted. It stays within the surface family; blur separates moving content. `prefers-reduced-transparency` receives a fully opaque surface. Liquid Glass is native Apple platform language, not a web standard, and is not imitated beyond this.

---

## 6. Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | BIZ UDPMincho | Hero, project titles, section statements, authored display moments |
| Body | Schibsted Grotesk | Reading, descriptions, form content |
| Label | Josefin Sans Semibold | Every label: interface, button, navigation, metadata, tag, form, case-study fact |

### 6.1 Rules

- **Three typefaces. No fourth.** The former signature face (Borges Square Pixel) is retired; see §12.6.
- **Every visible label is uppercase Josefin Sans Semibold.** Buttons and navigation items are labels, so they are uppercase too. This overrides the earlier sentence-case convention.
- BIZ UDPMincho is the only project-title face. No authored per-project display treatments.
- Sustained reading is at least 17px. Compact interface text may be 16px. Reading measure stays under 65 characters per line.
- Display type is for short text and never carries essential long-form explanation. Long introductions use the body face.
- Section labels stay few and orient the reader; a label must never be decoration.
- Type scales use named roles, not page-specific sizes. Optical size, line height and letter spacing are documented for every role.
- Faux bold, faux italic and uncontrolled font synthesis are forbidden.
- Font files are subset where practical and preloaded only when immediately required.

---

## 7. Layout, shape and material

### 7.1 Sheet geometry

- `--content: 92rem` is the maximum editorial measure.
- `--page: clamp(1.4rem, 4.8vw, 5.25rem)` is the common inline margin. Safe-area insets may increase it, never reduce it.
- The left content edge aligns with the logo; the right edge aligns with the primary navigation boundary.
- Navigation, Index, work archive, services, experience, case-study chapters and footer all consume the same geometry.
- Text, controls, media, disclosures and signatures stay inside the measure. **Case-study media never runs viewport full-bleed.**
- One restrained fixed trim frame may describe the viewport edge. Repeated crop marks and decorative printer furniture are forbidden.
- Navigation height: 4.5rem on larger layouts, 4.25rem on compact.

### 7.2 Responsive ranges

| Range | Width | Columns (invisible) |
| --- | --- | --- |
| Compact | below 600px | 4 |
| Medium | 600–839px | 8 |
| Expanded | 840–1199px | 12 |
| Large | 1200px and up | 12 |

Breakpoints respond to content failure, not device names. Components may use container queries where the shared breakpoints are insufficient. The layout must work at 320 CSS pixels without horizontal scrolling.

### 7.3 Composition

- Space is the primary grouping device. Underlying grid precision stays invisible.
- Repeated sections must not collapse into one interchangeable card grammar; each uses a distinct composition family.
- Document order matches reading and keyboard order.
- Full-height moments use `100svh` or `100dvh`, never `100vh` alone.

### 7.4 Shape scale

| Use | Radius |
| --- | --- |
| Editorial surfaces | `0` |
| Fields and small functional containers | `4px` |
| Status controls, toggles, compact pills | `999px`, only where the function benefits |

Shape communicates function; it is never decoration. Large generic rounded cards are forbidden.

### 7.5 Surface and depth

Depth comes from, in order: surface tone; scale and crop; controlled overlap where content stays readable; state layers; and restrained elevation only when a floating layer must separate from content (the Index sheet, a dialog). Decorative shadows, glass-card fields, neon glows and gradients-as-polish are forbidden.

### 7.6 Paper grain

The procedural monochrome grain is fixed, pointer-inert and request-free. Print uses a subtle multiply treatment; Screen uses a quieter one. It is removed under forced colours and reduced transparency, and never reduces text or focus visibility.

---

## 8. Information architecture and navigation

### 8.1 Destinations

Primary: Home, Work, Explorations, Community, About, Services, Writing, Contact.
Supporting: CV, Privacy, 404.

| Destination | Role |
| --- | --- |
| **Work** | Complete professional case studies; the strongest evidence of senior practice |
| **Explorations** | Self-initiated visual work made outside client or employment briefs. Curated by idea, not dumped chronologically |
| **Community** | Resources, teaching, tools, templates and events that give back to the design community. Every entry states what it gives the visitor |
| **Writing** | Developed ideas. Not visual experiments, not community resources |
| **About** | Positioning, experience, working principles, availability, CV access |
| **Services** | Capabilities translated into client outcomes, without becoming an agency website |
| **Contact** | Roles, commissions and collaborations through one accessible form, a direct copyable email and relevant external links |

The CV is a prominent action inside About and the Index, not a top-level destination.

### 8.2 One architecture, two presentations

**Expanded and large layouts**

- A compact top navigation: logo, `WORK`, `EXPLORATIONS`, `COMMUNITY`, `INDEX`.
- `INDEX` opens a full-screen editorial overlay listing every primary and supporting destination.
- The current route is shown through colour, typography and `aria-current`.
- The bar may condense on downward scroll. It returns immediately when scroll reverses, when focus enters it, or at a route boundary. Condensing never reorders destinations or shrinks targets below minimum size.

**Compact layouts**

- A bottom navigation with five destinations: `HOME`, `WORK`, `EXPLORE`, `CONTACT`, `INDEX`.
- `EXPLORE` leads to Explorations. Community is one tap away inside Index.
- Labels are always visible. Icon-only navigation is forbidden.
- The bar respects safe-area insets and never covers content, form actions or browser controls.

**Index overlay (both)**

- An editorial sheet, not a generic modal menu.
- Opening and closing preserve focus, scroll position and route context.
- Escape closes it. Focus is trapped while open and returns to the trigger on close.
- Without JavaScript, an ordinary fallback list provides the same destinations.
- Motion suggests an editorial sheet entering the composition. It is predictable, interruptible and reversible.
- The visitor can always see the current page and, inside a case study, the current chapter.

### 8.3 Homepage sequence

1. Full-screen proposition and support line.
2. Selected work.
3. Short positioning statement and a quiet editorial portrait.
4. `WHAT I DO`: the five-service swatch fan.
5. Client marquee (slow, continuous).
6. Short working-principles section.
7. Contact invitation (`WORK WITH ME`).
8. Dot-matrix signature and footer navigation.

The homepage stays spacious and atmospheric. Proof arrives through authored work, precise language and controlled interaction, not dense feature grids. There is no testimonials block until real, publishable testimonials exist.

---

## 9. Motion

Motion is expressive throughout, but controlled, predictable and predefined.

### 9.1 Tokens

| Token | Value | Range | Use |
| --- | ---: | --- | --- |
| `duration.fast` | 120ms | 100–160ms | Press, hover acknowledgement, small state changes |
| `duration.ui` | 220ms | 200–320ms | Navigation, controls, cards, compact disclosures |
| `duration.spatial` | 640ms | 450–700ms | Page transitions, swatch fan, large compositional change |
| `ease.standard` | `cubic-bezier(.23,1,.32,1)` | | Entrances and responsive UI |
| `ease.exit` | `cubic-bezier(.3,0,.8,.15)` | | Deliberate exits only |

### 9.2 Rules

- Page changes are animated and read as movement between editorial sheets. They are interruptible and never delay navigation or keyboard activation.
- Prefer transform and opacity. Layout animation is limited to deliberate authored components and content-driven disclosure height.
- Hover motion runs only under `hover:hover` and `pointer:fine`. Every hover behaviour has a focus and touch equivalent.
- Pressable controls scale to `.98` over 120ms. No elevation change on press or hover.
- Pointer velocity and drag force never alter outcomes. Pointer position may *acknowledge* an effect, but outcomes are predefined.
- No motion depends on cursor position for essential meaning.
- **Continuous loops: the client marquee and (provisionally) the live listening status. Nothing else.** Only one marquee per page. Loops sleep offscreen and when the document is hidden. Canvas work sleeps when settled.
- Motion never makes reading, navigation or comparison harder.

### 9.3 Reduced motion

- System preference is respected automatically; a manual override remains.
- Reduced motion removes loops, large spatial travel, parallax and shape morphing.
- It preserves colour feedback, visible focus, immediate state changes, opacity changes and full content access.
- It never replaces interactions with zero-duration flashes.

---

## 10. State model

Every interactive component documents and implements every applicable state:

enabled · hover · keyboard focus · pressed · selected or current · expanded · loading · success · warning · error · disabled · unavailable · reduced motion · forced colours · offline or failed dependency.

- Hover is never the only route to information or action.
- Focus and selection never rely on colour alone.
- Focus is a two-pixel `tertiary` outline with a four-pixel offset in both themes. On Ultramarine fields it uses Coral 75 (see §5.4).
- Disabled controls remain legible (7:1 still applies) and are not focusable unless their explanation must be discoverable.
- Colour, motion and shape never act as the only state signal.

---

## 11. Components

The documentation covers the complete system. Production implements only components that real portfolio content requires, so the library never becomes decoration.

### 11.1 Families

Site navigation and bottom navigation · Index overlay · buttons and editorial text links · project cards and work rows · service swatches · tags and metadata · disclosures · form fields and validation · tooltips · theme and motion controls · status and feedback messages · dialogs and editorial sheets · images, galleries, video and captions · case-study chapter navigation · pagination and next-project navigation · loading, skeleton, empty, error and offline states · copy-to-clipboard feedback · download links · marquees · accessibility utilities.

### 11.2 Buttons and links

- Buttons are visually quiet at rest (`surface-container` or transparent, `outline` boundary, `on-surface` label) while keeping a clear affordance. They become action-oriented on interaction: hover and press fill with `action-hover`/`on-action-hover`.
- All button labels are uppercase Josefin Sans. One line at desktop.
- Roles are distinct: primary, secondary, quiet, icon-plus-label.
- Primary actions have a 3rem minimum height; utility controls 2.75rem.
- Minimum target is 44×44 CSS pixels; 48×48 preferred for bottom navigation and high-frequency touch controls.
- Press, focus, loading, success and disabled states preserve geometry.
- Inline editorial links are underlined by default (quiet at rest, current colour on hover/focus). Cards, buttons, navigation and footer links are not underlined.
- Links and large project surfaces are never restyled as generic buttons.

### 11.3 Cards

- Treatment follows function, not one universal shell. Whitespace and crop define editorial project cards; surface tone defines grouped utilities; borders appear only where a boundary is needed for comprehension.
- A whole card is interactive only when it has one destination. Nested interactive targets remain independently operable.

### 11.4 Forms

- Every field has a persistent, visible uppercase label. Placeholders are supplementary only. Labels stay visible when fields hold values.
- Required, optional, help, focus, valid, invalid, disabled, submitting, success and failure states are all defined.
- Errors name the field and explain recovery in plain language.
- Submission preserves entered data when the network or service fails.
- Delivery: a Vercel serverless endpoint using Resend, sending to `miebakakiki@gmail.com`. Credentials stay server-side and never reach the browser bundle.
- The email address is visible and copyable directly, with accessible confirmation.
- Anti-spam measures must not introduce an inaccessible challenge.
- The form states what is submitted and how it is used.

### 11.5 Tooltips, dialogs, sheets

Tooltips never carry essential information. Dialogs and editorial sheets trap focus, return it on close, close on Escape and preserve scroll position.

---

## 12. Signature interactions

### 12.1 Hero

- A full-screen Ultramarine field carrying the proposition and support line. No separate action button; the hero stays a single, memorable statement.
- It gains a subtle material response (tone, grain density or a bounded surface field) that feels native to paper, ink and Ultramarine, not like a generic WebGL effect. It may acknowledge pointer or focus position; the outcome stays predefined.
- Content is fully legible without the effect. Reduced motion, reduced transparency and low-power modes get a static hero.
- Text on the field uses Paper (13.13:1) and Blue 80 (8.10:1).

### 12.2 Selected work

- Image-led and spacious. More than three projects may appear while the composition stays legible and atmospheric.
- Cards may change shape and proportion on hover and keyboard focus, reinforced by crop, colour and typography. Every transformation has a non-hover route on touch.
- Title, premise, role and availability stay readable without animation.
- A project without a complete published case study shows an honest `COMING SOON` state, never a fake page. Direct URLs to such a project render the same state.
- The section closes with `SEE THE WORK`, which is reserved for portfolio navigation.
- On compact layouts, the expanding-rail behaviour is replaced by full stacked cards.

### 12.3 Portrait

A quiet editorial photograph: authored crop, responsive sources, restrained theme treatment. The halftone development lens and other pointer-led reveals are retired. The homepage portrait stays discoverable by the preload scanner.

### 12.4 Swatch fan (`WHAT I DO`)

- Five cards, one per service. No hexadecimal values on the cards.
- Expanded layouts: one centred stack that fans across the shared sheet on hover or focus.
- Compact layouts: an accessible scroll-snapped or stacked treatment.
- Each service reads in a fixed sequence: number, capability name, plain-language explanation. Evidence is shown, never labelled (no "Evidence:" links or project-name captions).
- All five remain readable and reachable without animation. Every card is keyboard-operable.

### 12.5 Client marquee

- One slow, continuous loop of client marks. Hover does not accelerate it.
- It pauses offscreen, when the document is hidden, and under reduced motion, where it becomes a wrapped static list.
- A visible `PAUSE` / `PLAY` control is provided, because auto-moving content that runs longer than five seconds needs a user-operable stop (WCAG 2.2.2).
- Logos keep their approved artwork and have accessible text equivalents.

### 12.6 Footer signature

- The dot-matrix name is the first and largest footer element. Canonical source: `assets/images/miebaka-joshua-script-name.svg`, sampled into an interactive dot matrix. It is **not** typeset from a font; Borges Square Pixel is retired.
- The assembled dots preserve the SVG silhouette and sit inside the shared sheet without clipping.
- Pointer proximity may disperse cells; an interruptible spring returns them. Reduced motion keeps the assembled signature.
- Footer groups follow in order: `BASED IN`, `EXPLORE`, `SOCIAL`. `EXPLORE` carries Work, Explorations, Community, About, Services, Writing, Contact and Privacy on a wrapping row.

### 12.7 Provisional items (decide at checkpoints)

- **Listening status.** The earlier system placed a compact Last.fm link beside the portrait, always visible, upgrading to the current or last-played track without changing geometry; it may pulse only while live and truncates long titles. Neither source document's later answers address it. It survives provisionally because it is real data, not decorative status. It is reviewed at the homepage checkpoint and removed if it competes with the quiet portrait.
- **404 identity field.** A Three.js field with a small normal displacement and Fresnel edge, loaded only on the 404 page and omitted on compact, reduced-motion and save-data devices. Retained provisionally as rare-page delight; it must consume this system's tokens and is reviewed at the remaining-routes checkpoint.

### 12.8 Retired

Halftone portrait lens and pointer-led reveals; the custom cursor (native cursor is used everywhere); the selected-work accordion rail with a `See more` card; hover elevation on buttons; the fourth typeface; sentence-case buttons and navigation. Each removal is justified in Appendix B.

---

## 13. Case studies

Professional projects are hosted in full on the portfolio. **TEDx RSU is the first complete flagship case study.**

### 13.1 Chapter order

1. Project proposition.
2. Hero media.
3. Role, collaborators, year, deliverables.
4. Context.
5. Central problem.
6. Process evidence.
7. Strategic decision.
8. Identity or campaign system.
9. Applications.
10. Production and handoff.
11. Measurable outcomes.
12. Reflection.
13. Next project.

Case studies open directly into the narrative. There is no "Case study" kicker and no brief/full mode switch. Chapter navigation shows the current chapter.

### 13.2 Evidence rules

- May publish: final work, process, measurable outcomes, precise role and collaborators.
- **Rejected directions are never published.** Process evidence shows the path to the decision using work that was actually carried forward.
- Process appears inline, not behind disclosures.
- Outcomes are collected and verified project by project. Unknown metrics are omitted.
- Team contributions are credited precisely.
- Confidential information is excluded even when it would strengthen the story.
- Each case study ends with one next-project transition. No competing contact or related-work panels.

### 13.3 Media

- Final images, guidelines, presentations, production details, packaging photography, motion and video, as supplied per project.
- Every item has dimensions, responsive sources, intentional loading priority and meaningful alt text or caption.
- Video never autoplays with sound. Motion media supplies a poster and a non-moving equivalent.
- Media stays within the editorial measure.

---

## 14. Explorations and Community

Both are required for first release. Launch entries are supplied and approved during route implementation. Placeholder projects, invented community activity and empty decorative cards are forbidden.

**Explorations.** Entries are curated by idea. Each states the self-imposed prompt, the visual decision and the date. The section may be visually freer than Work but consumes the same tokens and accessibility contracts, and must never be mistaken for commissioned work.

**Community.** Each entry names its audience, contribution and access method. Downloads show format, licence, version and last-updated date. Events distinguish past recordings from upcoming participation. Value is judged by usefulness, not engagement metrics. If launched without entries, the empty state is a purposeful introduction with clear future scope.

**Writing.** Keeps its name. Metadata is factual only: publication date and reading length. No inferred category labels.

---

## 15. Content language

- Lead with the decision, not process theatre.
- Prefer concrete verbs: define, position, design, direct, produce, deliver.
- Avoid inflated claims, generic agency language, fake metrics and unsupported outcomes.
- Separate observation, decision, execution and result.
- One register: warm, direct, professionally exact.
- Interface labels are short, uppercase and destination-led.
- No decorative status, weather, version labels, fake availability or scroll instructions.
- Dates, reading length, roles, collaborators and results are factual.
- `WORK WITH ME` is the canonical contact action. `SEE THE WORK` is reserved for portfolio navigation. `DOWNLOAD CV` is the CV action.

---

## 16. Accessibility and input

- Semantic HTML is the foundation. Navigation, content, links, case studies and contact information work without JavaScript.
- Accessibility floor: WCAG 2.2 AA throughout, with the stricter universal 7:1 text rule from §5.5.
- Every pointer interaction has keyboard and touch equivalents, including the swatch fan and project-card transformations. Focus order follows visible reading order.
- Focus is never removed and remains visible in forced-colour mode.
- Targets are at least 44×44 CSS pixels.
- Current page, expanded state, validation and live feedback are programmatically exposed.
- Decorative canvas and texture layers are hidden from assistive technology. Decorative images use empty alt text.
- Captions and transcripts accompany meaningful video or audio.
- Usable at 200% zoom, under text-spacing overrides and at 320 CSS pixels.
- Testing covers keyboard-only, screen-reader smoke tests, forced colours, reduced motion, reduced transparency and touch.
- Devices: modern phones, tablets, laptops and large desktop displays carry equal weight.

---

## 17. Resilience, performance and platform

### 17.1 Progressive enhancement

- Static HTML exposes every primary destination and core narrative. JavaScript enhances navigation, transitions, responsive media and authored interactions.
- If JavaScript fails: pages stay readable, links work, a contact path remains.
- If optional services fail: geometry stays stable and the fallback is truthful.
- Slow connections receive reserved media dimensions and progressive loading.
- **Save-Data, low-power and reduced-motion environments automatically receive a quieter media experience** and no non-essential continuous work.
- Graceful online failure is required. Offline application behaviour is not, unless approved later.

### 17.2 Budgets

Measured in production on a representative mid-range mobile device and a constrained connection.

| Measure | Target | Hard gate |
| --- | ---: | ---: |
| Largest Contentful Paint | ≤2.0s | ≤2.5s |
| Interaction to Next Paint | ≤150ms | ≤200ms |
| Cumulative Layout Shift | ≤0.05 | ≤0.05 |
| Initial JavaScript (compressed, excluding route-lazy media players) | ≤75KB | ≤75KB |
| Initial CSS (compressed) | ≤45KB | ≤45KB |
| Homepage media before interaction | ≤1.5MB | ≤1.5MB |
| Long tasks in ordinary navigation | none >200ms | none >200ms |
| Idle main-thread work | none | none |
| Animation | 60fps | — |

Further rules: one bundled CSS request and a small ES-module graph; route-specific code and media load only where used; above-the-fold media has dimensions and intentional fetch priority; everything else lazy-loads; no runtime module ships without an import and a route-specific purpose; Three.js loads only where mounted.

### 17.3 Support matrix

Latest two stable versions of Chrome, Safari, Firefox and Edge, plus current iOS Safari and current Android Chrome. Support covers pointer, keyboard and touch; light and dark system preferences; safe-area insets; modern viewport units with fallbacks; reduced motion; reduced transparency; forced colours; increased text size; browser zoom. Unsupported enhancement APIs fail silently to the static editorial experience.

### 17.4 CV delivery

Approved source: `/Users/mac/Desktop/Career/Miebaka Joshua's Resume.pdf`. The build copies it to a stable, URL-safe public asset name and never exposes the local path. The public action is `DOWNLOAD CV`, with format (PDF) and file size shown where presented. The source is verified before release and replaced only by explicit content update.

### 17.5 Privacy, security and caching

- Contact collection is limited to what is needed to reply. No advertising trackers. Any later analytics must be privacy-conscious and documented.
- Security headers: tested Content Security Policy, content-type protection, referrer policy, permissions policy, frame protection. External links that open new contexts are marked safely.
- Build output contains only production files and referenced assets. No source maps, drafts, unused media or private notes ship.
- HTML revalidates. Versioned or stable assets use long-lived caching where safe.

---

## 18. Delivery process

The rebuild happens in the current repository. Each checkpoint needs owner approval before its visual layer becomes authoritative. At visual checkpoints, **two directions are presented for comparison**, each with a rationale. The approved thesis becomes an implementation plan, then a verified rebuild.

1. This design thesis.
2. Information architecture and responsive wireframes.
3. Two visual-system directions to compare.
4. Homepage implementation.
5. One complete case study (TEDx RSU).
6. Remaining routes, including Explorations and Community.
7. Accessibility, performance and browser QA.
8. Deployment review.

Existing interactions may be removed when they do not survive this system. Every material removal is named and justified before implementation.

### 18.1 Release gate

Before any push or deployment:

1. Run `npm test` and all specification tests.
2. Build `dist/` from a clean input state.
3. Inspect Home, Work, Explorations, Community, About, Services, Writing, Contact, Privacy, 404 and every published case study.
4. Inspect compact, medium, expanded and large layouts.
5. Confirm `document.body.scrollWidth === innerWidth` on every route at required widths.
6. Confirm Print and Screen themes, including project-colour themes.
7. Confirm regular and reduced motion.
8. Confirm keyboard, touch and pointer access to every interaction.
9. Confirm visible focus, forced-colour usability and form error recovery.
10. Confirm no console errors, broken internal links, missing assets or failed font loads.
11. Confirm budgets with production assets on a representative mobile profile.
12. Confirm navigation and core content work without JavaScript.
13. Confirm no unverified outcome, testimonial or collaborator credit is published.
14. Confirm only approved production files ship.

Automated tests establish technical health. They do not replace browser and human visual review.

### 18.2 Governance for new components

Before release, every new component answers:

1. Which system role does each colour consume?
2. Is every text and essential-icon pairing at least 7:1?
3. Does it preserve role mapping in both themes and at every breakpoint?
4. Is it understandable without colour or motion?
5. Does its motion have a named purpose and reduced-motion behaviour?
6. Does it duplicate an existing pattern or CTA intent?
7. Does it work without JavaScript where progressive enhancement permits?

Release is **blocked** if: raw colours appear outside reference tokens or authored project media; an undocumented foreground/background pair appears; any text or essential icon falls below 7:1; a page has more than one marquee; a hover transform is not pointer-gated; movement lacks reduced-motion handling; a route, navigation label, form field or legal statement changes silently; or visual QA has not covered Print, Screen, compact and expanded layouts.

---

## 19. Known boundaries

- WCAG contrast is defined in sRGB. Displays and features such as True Tone can shift perceived white point without changing authored hex values.
- Project imagery may contain any colour. Identity colour restrictions apply to interface chrome, not artwork.
- Decorative 3D and surface differences carry no information and need no text-contrast ratio.
- AAA is guaranteed only for the documented pairs. Arbitrary token combinations are unsupported.
- Coral 75 on Ultramarine clears 7:1 by 0.03. Any change to either value requires re-testing.

---

## Appendix A. Decision register

How each conflict between sources, or between a source and the owner's answers, was resolved. Later answers beat earlier ones; owner answers beat both specs.

| # | Conflict | Resolution | Basis |
| --- | --- | --- | --- |
| A1 | Audience order: Round 1 put general audience first; Round 2 put it fourth | General audience fourth | R2 Q2 approved |
| A2 | Contrast: R2 Q49 answered "No" to "WCAG 2.2 AA floor, 7:1 for all *ordinary* text" | Universal 7:1, no exceptions | R1 Q19 (stricter than Material), v4.0 anchor 1. **Interpreted: "No" read as "stricter than proposed". Confirm (C1)** |
| A3 | Identity doc: sentence-case buttons and nav; R2 Q33 answered "No. Follow 32" | All labels, buttons and navigation uppercase Josefin Sans | R2 Q32, Q33 |
| A4 | Identity doc: four typefaces (Borges Square Pixel for footer). Owner: three-typeface system | Three. Footer signature sampled from SVG | R1 Q13, v4.0 §12.6 |
| A5 | Identity doc: radius zero everywhere. Owner approved a shape scale | 0 / 4px / 999px by function | R1 Q9, R2 Q29 |
| A6 | Identity doc: selected work = three projects + "See more" accordion, locked. Owner wants hosted case studies, shape-changing cards, more than three allowed | Image-led cards with proportion change; locked only where unfinished; `SEE THE WORK` closes the section | R1 Q14, R2 Q21, Q39 |
| A7 | Identity doc: "What I do" as numbered list with image reveal. Owner: swatch fan is untouchable and represents five services | Swatch fan; the list's number/name/explanation sequence kept inside each card | R1 Q7, R2 Q15 |
| A8 | Identity doc: halftone/pointer portrait. Owner: quiet photograph | Quiet photograph; halftone retired | R2 Q16 |
| A9 | Identity doc: `duration.spatial` 720ms. v4.0 range 450–700ms | 640ms | R2 Q36 approved ranges |
| A10 | Identity doc: navigation "nearly instant". Owner: animated page transitions | Animated, interruptible, never delaying activation | R2 Q37 |
| A11 | Identity doc: hover elevation on buttons. Owner: quiet until interaction; no decorative shadow | Elevation removed; state layer and colour only | R2 Q45, v4.0 §9.2 |
| A12 | Identity doc: custom cursor preserved under reduced motion. Owner delegated cursor choice | Custom cursor retired; native cursor throughout | R2 Q40 delegated; predictability (Q42) |
| A13 | Identity doc: "one coherent theme per page". Owner: project colour may tint nav and background | Compatible: project theme is a page-level retint | R2 Q31 |
| A14 | Round 1 listed rejected directions as publishable evidence; Round 2 says never | Never published | R2 Q24 (later) |
| A15 | Identity doc: 12-col grid, collapse below 48rem; breakpoints at 600/840 | 4 / 8 / 12 invisible columns on the four breakpoints | Thesis decision to remove the mismatch |
| A16 | Identity doc used `action`, `outline`, `on-tertiary` roles without defining them | Defined in §5.3 | Gap in source |
| A17 | Footer Explore list lacked Explorations and Community | Added | R2 Q7, Q9 |
| A18 | Navigation: R2 Q8 asked for a mix of compact desktop menu, bottom nav and full-screen overlay | Compact top bar + Index overlay; bottom nav on compact | R2 Q8, Q9; v4.0 §5 |
| A19 | R2 Q13: hero "should also contain the support line" | Proposition + support line only; no action | R2 Q13 |
| A20 | "Directly on the current site" (R2 Q59) | Read as current repository; nothing deploys before checkpoint approval | Thesis decision. **Confirm (C8)** |
| A21 | Delegated answers (Q10, 11, 38, 40, 44, 46, 52, 54, 56) | Decided in this document: see §5, §9, §10, §11, §17 | Owner delegation |

## Appendix B. Retirements and their justification

| Retired | Why |
| --- | --- |
| Halftone portrait lens | Not listed as untouchable; a quiet photograph was chosen; pointer reveals add motion without evidence value |
| Custom cursor | Not listed as untouchable; predictability was chosen; custom cursors are a standing accessibility and performance liability |
| Accordion rail and `See more` card | Conflicts with hosted case studies, proportion-change cards and a Work route that handles "more" |
| Button hover elevation | Contradicts "quiet until interaction" and the no-decorative-shadow rule |
| Borges Square Pixel | A fourth face violates the three-typeface rule; the SVG-sampled signature is more faithful to the artwork |
| Sentence-case labels | Superseded by the always-uppercase label rule |

## Appendix C. Open items needing the owner

1. **C1 — Confirm the contrast interpretation.** R2 Q49 was answered "No". This document reads that as "make it stricter" (universal 7:1, no exceptions). If you meant "relax it", say so; it changes §5.5.
2. **C2 — The three senior-ready projects.** R2 Q20 was left unanswered. Needed before homepage selection. TEDx RSU is the flagship; two more are needed.
3. **C3 — Five service names and copy.** The swatch fan and Services page depend on them. They are not in any supplied file.
4. **C4 — Working-principles copy.** The homepage section exists in the sequence but no content has been supplied.
5. **C5 — Measurable outcomes per project.** To be collected project by project. Until verified, outcomes chapters stay out.
6. **C6 — Testimonials.** None yet. No testimonial block ships until a real, publishable one exists.
7. **C7 — Listening status and 404 field.** Provisional (§12.7). Confirm keep or retire.
8. **C8 — Rebuild location.** Confirm "directly on the current site" means working in the current repository with deployment gated by checkpoint approval, not editing the live site in place.
9. **C9 — Contact visibility on desktop.** The primary conversion is contact, yet the desktop top bar shows `WORK`, `EXPLORATIONS`, `COMMUNITY`, `INDEX` only. Contact is reachable through Index and the footer but not persistently on large screens. Recommendation: add `WORK WITH ME` to the top bar. Not adopted without your approval because it changes the approved navigation.
10. **C10 — Launch entries.** Real entries for Explorations and Community; project palettes with contrast tables for each case study.
