# Personal Identity System: Ultramarine Air

Status: normative design and implementation specification  
Version: 2.0  
Owner: Miebaka Joshua  
Primary platform: miebaka.design

## 1. Design thesis

Ultramarine Air is a calm, exacting and open identity for a designer who moves between strategy, visual systems and production. The system should feel like a well-composed working document: generous space, precise hierarchy, expressive typography, original project imagery and a small number of decisions repeated with confidence.

The signature colour is exact Ultramarine `#002080`. It is supported by cool blue neutrals and one warm coral family used only for feedback, focus and exceptional emphasis. Photography keeps its authored colour.

This is not a Material-looking portfolio. Material 3 contributes the system architecture:

- reference, system and component token tiers;
- semantic colour roles with explicit on-colour pairings;
- surface containers for hierarchy;
- state, shape, motion and type roles;
- adaptive behaviour that keeps roles consistent across breakpoints.

Material's default components, rounded visual language and baseline contrast targets are not adopted. Official references:

- <https://m3.material.io/foundations/>
- <https://m3.material.io/styles/color/the-color-system>
- <https://m3.material.io/styles/typography/applying-type>
- <https://m3.material.io/styles/motion>

## 2. Design read

- Page kind: editorial designer portfolio.
- Primary audience: design leaders, hiring managers, collaborators and clients.
- Atmosphere: gallery-airy, intelligent, exact, warm without being decorative.
- Design variance: 7/10. Asymmetric but readable.
- Motion intensity: 5/10. Responsive and purposeful, never theatrical by default.
- Visual density: 3/10. Space is the principal grouping device.
- Shape language: sharp. Radius is zero unless a platform control requires otherwise.
- Theme: one coherent light or dark theme at page level. Sections never invert independently.

## 3. Governing principles

1. **Roles before values.** Components consume system or component tokens, never raw colour values.
2. **One visual argument.** Ultramarine carries identity. Coral carries interaction. Neutrals carry structure.
3. **AAA by placement.** Every text and essential-icon pairing must achieve at least 7:1 in its documented placement.
4. **Pair colours intentionally.** An `on-*` role is used only on its paired container. Arbitrary mixing is forbidden.
5. **Space before lines.** Use spacing, alignment and surface steps before adding borders.
6. **Images remain authored.** Do not recolour, duotone or artificially desaturate project work.
7. **Motion explains.** Motion must communicate feedback, state, spatial continuity or explanation.
8. **Progressive enhancement.** Navigation, content, links and project access remain usable without JavaScript.
9. **One source of truth.** This file defines the intended system; automated tests verify the shipped system.

## 4. Token architecture

### 4.1 Reference tokens

Reference tokens are canonical sRGB values. Hex is the production source of truth because it is stable across CSS and Adobe workflows. OKLCH is recorded for design reasoning, not used as a second colour source.

| Token | Hex | OKLCH | Function |
| --- | --- | --- | --- |
| `ref.ultramarine` | `#002080` | `oklch(0.308 0.163 263.4)` | Brand key colour |
| `ref.air` | `#E8EEFF` | `oklch(0.950 0.024 270.3)` | Light brand container |
| `ref.paper` | `#F8F9FC` | `oklch(0.982 0.004 271.4)` | Light canvas and fixed on-dark text |
| `ref.midnight` | `#07112B` | `oklch(0.186 0.055 265.2)` | Dark canvas and fixed on-light text |
| `ref.blue.30` | `#1C3DA4` | `oklch(0.408 0.170 265.4)` | Light-theme secondary |
| `ref.blue.80` | `#B1C5FF` | `oklch(0.829 0.085 269.7)` | Dark-theme primary and secondary |
| `ref.neutral.30` | `#3C4661` | `oklch(0.397 0.048 268.5)` | Light muted text and meaningful outline |
| `ref.neutral.80` | `#C3C6CF` | `oklch(0.827 0.013 271.3)` | Dark muted text and meaningful outline |
| `ref.coral.30` | `#83251D` | `oklch(0.412 0.130 28.8)` | Light interactive accent |
| `ref.coral.75` | `#FFA08F` | `oklch(0.798 0.117 30.8)` | Dark interactive accent |
| `ref.error.30` | `#8F0B28` | `oklch(0.417 0.160 18.4)` | Light error |
| `ref.error.75` | `#FF9E9F` | `oklch(0.798 0.116 19.3)` | Dark error |

Pure black and pure white are not part of the active interface palette.

### 4.2 System colour roles

| Role | Light | Dark | Allowed use |
| --- | --- | --- | --- |
| `surface` | Paper | Midnight | Page canvas |
| `surface-container-low` | `#EFF1F6` | `#0C1730` | Quiet grouped regions |
| `surface-container` | `#ECEEF3` | `#111B33` | Navigation and controls |
| `surface-container-high` | `#F2F3F8` | `#172138` | Inputs and emphasized neutral regions |
| `on-surface` | Midnight | Paper | Primary text and icons |
| `on-surface-variant` | Neutral 30 | Neutral 80 | Secondary text and labels |
| `primary` | Ultramarine | Blue 80 | Links, active states and key icons |
| `on-primary` | Paper | `#032485` | Content on primary fills |
| `primary-container` | Air | Ultramarine | Branded containers |
| `on-primary-container` | Ultramarine | Paper | Content on primary containers |
| `tertiary` | Coral 30 | Coral 75 | Hover, focus and rare emphasis |
| `error` | Error 30 | Error 75 | Error copy and essential icons |

The same semantic role remains attached to the same layout region at every breakpoint. Responsive changes alter composition, not colour meaning.

### 4.3 Verified contrast pairs

The following are the permitted foreground/background pairs. Ratios use WCAG 2 relative luminance and are rounded down to two decimals in reporting.

| Foreground | Background | Minimum ratio |
| --- | --- | ---: |
| Midnight | Paper and all light surface containers | 16.09:1 |
| Neutral 30 | Paper and all light surface containers | 8.07:1 |
| Ultramarine | Paper and all light surface containers | 11.91:1 |
| Blue 30 | Paper and all light surface containers | 8.03:1 |
| Coral 30 | Paper and all light surface containers | 8.05:1 |
| Error 30 | Paper and all light surface containers | 8.05:1 |
| Paper | Midnight and all dark surface containers | 15.21:1 |
| Neutral 80 | Midnight and all dark surface containers | 9.38:1 |
| Blue 80 | Midnight and all dark surface containers | 9.38:1 |
| Coral 75 | Midnight and all dark surface containers | 8.14:1 |
| Error 75 | Midnight and all dark surface containers | 8.12:1 |
| Paper | Ultramarine | 13.14:1 |
| `#032485` | Blue 80 | 7.71:1 |
| Ultramarine | Air | 11.92:1 |

Decorative surface steps and non-essential separators are exempt because they do not carry information. A boundary required to understand or operate a control uses `outline`, not `outline-variant`.

### 4.4 Component tokens

Component tokens are aliases of system roles. They exist only when a component needs a stable contract.

```css
--comp-nav-bg: color-mix(in srgb, var(--sys-color-surface) 97%, transparent);
--comp-link: var(--sys-color-primary);
--comp-button-bg: var(--sys-color-action);
--comp-button-fg: var(--sys-color-on-action);
```

The navigation's three-percent transparency is the maximum allowed glass approximation. The resulting colour remains within the surface family, while blur separates content in motion. `prefers-reduced-transparency` receives a fully opaque surface.

## 5. Typography

| Role | Typeface | Purpose |
| --- | --- | --- |
| Display | BIZ UDPMincho | Selected work titles, case-study statements and rare expressive moments |
| Body | Schibsted Grotesk | Reading, navigation and explanatory copy |
| Label | Josefin Sans Semibold | Short labels and compact metadata |
| Signature | Borges Square Pixel | Footer wordmark only |

Rules:

- Body copy is at least 1rem where sustained reading occurs and remains below 65 characters per line.
- Display type is reserved for short text. Long introductions use the body face.
- Section labels stay small and rare. A label must orient, not decorate.
- Borges is never used for body copy or controls.
- All text colours use semantic roles. Project-card copy uses Paper over a bounded Midnight veil.

## 6. Layout and spacing

- Maximum content width: `92rem`.
- Page gutter: `clamp(1.4rem, 4.8vw, 5.25rem)`.
- Grid: twelve columns on expanded layouts; single-column collapse below 48rem.
- Breakpoints: compact below 600px, medium 600-839px, expanded 840-1199px, large 1200px and above.
- Navigation height: 4.5rem desktop, 4.25rem compact.
- Interactive target: minimum 44 by 44 CSS pixels.
- Full-height moments use `100svh` or `100dvh`, never `100vh`.
- Cards are used only where a whole surface is interactive or where media and copy form one object.
- Repeated content sections must use distinct composition families.

## 7. Shape and material

The website is sharp-edged. Control and surface radius are both zero. This is a deliberate production-document quality, not a lack of styling.

Depth is expressed through:

1. surface tone;
2. scale and crop;
3. overlap only where content remains readable;
4. a restrained near-opaque navigation material.

There are no decorative drop shadows, neon glows or widespread glass cards. Liquid Glass is native Apple platform language, not a web standard. This website uses only an honest web approximation for the sticky navigation layer, with an opaque accessibility fallback.

## 8. Motion system

Motion scheme: standard, with one expressive exception on the rare 404 page.

| Token | Value | Use |
| --- | --- | --- |
| `duration.fast` | 120ms | Press feedback |
| `duration.ui` | 180ms | Colour and compact state changes |
| `duration.spatial` | 240ms | Work-card expansion and small spatial changes |
| `ease.standard` | `cubic-bezier(.23,1,.32,1)` | Entrances and responsive UI |
| `ease.exit` | `cubic-bezier(.3,0,.8,.15)` | Deliberate exits only |

Rules:

- Animate transform and opacity only, except content-driven disclosure height.
- Hover motion runs only with `hover:hover` and `pointer:fine`.
- Pressable controls scale to .98 for 120ms.
- The client marquee is the only perpetual motion on the homepage. It pauses offscreen and when the document is hidden.
- Reduced motion removes spatial movement and loops while preserving immediate state feedback.
- Navigation and theme changes are high-frequency and remain nearly instant.
- The 404 Three.js identity field is rare-page delight. Its custom shader uses a small normal displacement and Fresnel edge; it is omitted on compact, reduced-motion and save-data devices.

## 9. Component contracts

### Navigation

- Near-opaque `surface` material with restrained blur.
- One-line desktop navigation below 80px high.
- No text underlines. Active and hover states use the tertiary role.
- Keyboard focus uses a two-pixel tertiary outline with four-pixel offset.

### Editorial links

- Inline links are underlined by default.
- Underline colour is quiet at rest and becomes current colour on hover or focus.
- Large clickable cards, buttons, navigation and footer links are not underlined.

### Buttons

- Primary actions use `action` plus `on-action`, with a 3rem minimum height.
- Utility controls use a quiet surface, a 2.75rem minimum target and tertiary hover feedback.
- Mutually exclusive reading modes use one segmented group; only the selected segment receives the action fill.
- Hover uses `action-hover` plus `on-action-hover`; press feedback scales to no less than 97 percent.
- Labels remain on one line at desktop and use the label role.
- Links and large project surfaces are never restyled as generic buttons.

### Listening status

- The homepage always exposes one compact Last.fm link, even when live data is unavailable.
- When data resolves, the fallback upgrades to the current or most recently played track without changing geometry.
- The control shares the portrait's five-column measure and sits one `s2` step above it.
- Live status may pulse; recent or unavailable status remains still. Reduced motion removes the pulse.
- Track names truncate rather than widening the composition.

### Selected work

- Three authored projects plus one `See more` card.
- The rail begins as four equal, collapsed cards within the shared content measure.
- Each authored project uses a compact inset label bar: project name at rest, one-sentence premise on hover or keyboard focus.
- Hover or focus expands one card at a time.
- `See more` is a fixed navigation card and never participates in the accordion hover behaviour.
- Mobile removes the accordion behaviour and presents full stacked cards.

### What I do

Every item follows one fixed reading sequence:

1. number;
2. capability name;
3. plain-language explanation;
4. a restrained project-image reveal on hover or keyboard focus.

Evidence is shown rather than labelled: no `Evidence:` links or project-name captions appear in the service list.

### Footer

- Three information groups: location, navigation, social and legal.
- No email address.
- Borges wordmark spans the viewport width at 48 percent opacity in both themes.

## 10. Content language

- Lead with the decision, not the process theatre.
- Prefer concrete verbs: define, position, design, direct, produce, deliver.
- Avoid inflated claims, fake metrics and generic agency language.
- Project copy distinguishes observation, decision, execution and outcome.
- Use one register: warm, direct and professionally exact.
- No decorative metadata, fake status, weather, version labels or scroll instructions.

## 11. Runtime, accessibility and delivery

- Static HTML is the source layer; JavaScript progressively enhances it.
- All images reserve dimensions and use responsive variants.
- The homepage portrait remains discoverable by the preload scanner.
- Three.js loads only on a page that mounts the 404 identity field.
- Theme defaults to system preference and supports a manual override.
- Case-study reading preference persists for the browser session.
- Continuous marquees pause on hover or keyboard focus.
- Focus remains visible in forced-colour mode.
- Build output contains one bundled CSS request and no source-only directories.
- HTML revalidates. Versioned or stable assets use long-lived caching where safe.
- Security headers include CSP, content-type protection, referrer policy, permissions policy and frame protection.

## 12. Governance and acceptance tests

Any new component must answer these questions before release:

1. Which system role does every colour consume?
2. Is every text and essential-icon pairing at least 7:1?
3. Does the component preserve its role mapping in both themes and every breakpoint?
4. Is the component understandable without colour or motion?
5. Does motion have a named purpose and reduced-motion behaviour?
6. Does the component duplicate an existing pattern or CTA intent?
7. Does it work without JavaScript where progressive enhancement permits?

Release is blocked if any of the following are true:

- raw colour values appear outside reference-token declarations or authored project media data;
- an undocumented foreground/background pair appears;
- contrast falls below 7:1 for text or essential icons;
- the page contains more than one marquee;
- a hover transform is not pointer-gated;
- movement lacks reduced-motion handling;
- a route, navigation label, form field or legal statement changes silently;
- visual QA has not covered light, dark, compact and expanded layouts.

## 13. Known boundaries

- WCAG contrast is defined in sRGB. Display technologies such as True Tone can alter perceived white point, but they do not change the authored hex values.
- Project imagery can contain any colour. Identity colour restrictions apply to interface chrome, not artwork.
- Decorative 3D and surface differences are not information carriers and do not need text contrast ratios.
- AAA is guaranteed only for the documented role pairs. Arbitrary token combinations are unsupported.
