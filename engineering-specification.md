# Engineering specification — Miebaka Joshua Portfolio

Status: normative

Version: 3.0

Owner: Miebaka Joshua

## 1. Product intent

The portfolio is a working print document expressed on the web: editorial, exact and tactile. It demonstrates brand-system thinking through composition, typography, interaction and production discipline. The interface is not a dashboard, template gallery or imitation press proof.

Primary statement: **I design brand systems, then build the tools that keep them intact.**

## 2. Precedence

1. Current user direction.
2. This engineering specification.
3. `specs/personal-identity-system_design.md`.
4. Shared tokens and component contracts in the code.

When documentation and production disagree, repair both in the same change.

## 3. Sheet geometry

- `--content: 92rem` is the maximum sheet measure.
- `--page: clamp(1.4rem, 4.8vw, 5.25rem)` is the common inline margin.
- The left content edge aligns with the logo. The right content edge aligns with the Index control.
- `.container`, navigation, Index, services frame, experience ledger and footer groups consume the same geometry.
- No text, control, image, reveal or signature may escape this measure.
- One restrained fixed trim frame is allowed at the viewport edge. Section-level crop marks, folio decorations and repeated printer furniture are forbidden.
- Safe-area insets may increase, never reduce, the page margin.

## 4. Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | BIZ UDPMincho | Hero, section and project statements |
| Body | Schibsted Grotesk | Reading, navigation and explanations |
| Label | Josefin Sans Semibold | Labels, metadata and compact controls |
| Signature | Borges Square Pixel | Footer dot-matrix sampling only |

No other typeface is part of the production system. Body copy remains below 65 characters per line. Borges never sets controls or prose.

## 5. Colour

All components consume semantic roles in `styles/foundations.css`. The signature colour is Ultramarine `#002080`. Coral is restricted to focus, hover and rare interaction feedback. Project imagery retains authored colour.

Every text and essential icon pair must meet the documented 7:1 contrast floor. Light and dark themes remap roles; components never hardcode alternate palettes.

## 6. Surface

The page uses a procedural monochrome paper grain built with an inline SVG turbulence texture. It is fixed, pointer-inert and request-free. Light mode uses a subtle multiply treatment; dark mode uses a quieter screen treatment. Forced-colour and reduced-transparency modes remove it.

The retired neutral-folds canvas and chroma-shift treatments must not return.

## 7. Shared interaction contracts

### Interactive row

Use for Index entries, experience, the work archive, services and writing.

- Rest: transparent surface and current text colour.
- Hover/focus: primary fill grows from the bottom; content shifts horizontally by `.625rem`.
- Open: plus becomes minus and disclosed content remains in document flow.
- Target: minimum 44 CSS pixels; production rows are 7–10rem tall.
- Touch: the full row remains the target; hover is never the only route to content.

### Now Playing

- One wide pill aligned exactly to the portrait.
- Disc, label, truncated track and looping arrow occupy stable columns.
- The disc rotates only in regular motion.
- The Last.fm fallback stays visible when live data fails.

### Portrait

- The portrait is sampled into a theme-aware halftone canvas.
- Light/print uses dark dots; dark/screen uses light-emitting dots.
- Fine pointers reveal the photograph through a moving circular development lens.
- Reduced motion keeps a static, usable representation.

### Swatch fan

- The homepage keeps the visible label “What I do”.
- Five wide cards rest in one centred stack and fan across the shared sheet on hover or keyboard focus.
- Dark/screen cards are Paper with Midnight text. Light/print cards are Midnight with Paper text.
- No HEX values appear on the cards.
- Compact layouts become a horizontal, scroll-snapped strip.

### Footer signature

- The dot-matrix name is the first and largest footer element.
- It samples Borges, fits within the shared sheet and may never clip.
- Pointer proximity disperses dots; an interruptible spring returns them.
- Footer information follows horizontally in this order: Based in, Explore, Social.

## 8. Motion

| Role | Value | Use |
| --- | ---: | --- |
| Press | 120ms | Immediate control feedback |
| UI | 220ms | Colour and row acknowledgement |
| Disclosure | 380ms | Expand/collapse |
| Enter | 680ms | One-time section arrival |
| Spatial | 720ms | Fan and large authored interactions |

Use `cubic-bezier(.23,1,.32,1)` for entrances and responsive feedback. Animate transform and opacity; content disclosures may animate grid rows. Perpetual motion is limited to the client marquee and live record disc, and both stop under reduced motion.

Reduced motion removes loops, parallax and large transforms. It does not hide the cursor, remove focus feedback or reduce the interface to zero-duration state changes.

## 9. Performance and accessibility

- Production serves one CSS request and a small ES-module graph.
- Above-the-fold images have dimensions and intentional fetch priority; other media lazy-loads.
- Canvas animation sleeps offscreen or when settled.
- All controls have keyboard focus, names and at least 44×44px targets.
- Content and navigation exist without JavaScript.
- Native colour scheme, safe areas and `100svh`/`100dvh` are supported.
- No runtime module may be shipped without an import or a route-specific purpose.

## 10. Release gate

Before push and deployment:

1. Run `npm test`.
2. Inspect mobile and desktop home, Index, About, Work, Services, Writing and footer layouts.
3. Confirm `document.body.scrollWidth === innerWidth` on every production route.
4. Confirm regular/reduced motion and light/dark theme combinations.
5. Confirm no console errors or broken local assets.
6. Build `dist/` and verify only production files are copied.
