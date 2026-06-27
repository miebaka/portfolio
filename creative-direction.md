# Creative Direction — Miebaka Joshua Portfolio
### "The Quiet Gallery"

> The interface is the wall. The work is the art. Everything the frame does is in service of making the work — bold, colourful, African brand design — the loudest thing in the room.

---

## 1. Positioning & thesis

- **Who:** Joshua Miebaka Williams Atubokiki — brand & visual designer, 7+ years, Lagos / WAT, remote-global.
- **Thesis line (the spine of the whole site):** *"Building a standard for what brand and graphic design can be for African brands."*
- **Promise:** World-class craft, premium and considered, hireable from anywhere.
- **Feeling:** Considered, confident, warm. Restraint as proof of taste — never loud for its own sake.

Every page must reinforce the thesis and end with a clear, single ask.

---

## 2. Design principles (the non-negotiables)

1. **The frame stays neutral; the work supplies the colour.** No decorative colour in the UI.
2. **Show, never list.** Any reference to a project carries an image.
3. **One idea per screen.** Lead the eye to a single focal point.
4. **Whitespace is a feature, not leftover space.** Wide margins, big air.
5. **Restraint over options.** One accent, one weight of emphasis, one CTA per view.
6. **Every project is a story** — challenge → role → decisions → outcome, with numbers.

---

## 3. Typography

| Role | Typeface | Usage |
|------|----------|-------|
| Display / headlines | **Fraunces** (high-contrast serif, optical sizing) | Hero, section titles, project titles, pull quotes. Use the italic for warmth on subheads. |
| Body / UI | **Inter** (clean grotesque) | Paragraphs, captions, nav, labels, metadata. |
| Accent (optional) | Your **signature script** | Used once, as the personal wordmark only — never for reading. |

**Premium alternative** (if budget allows): Reckless or PP Editorial New for display; Söhne or Neue Haas Grotesk for body. Fraunces + Inter is the free, production-ready default.

**Scale (desktop):**
- H1 / hero: 64–88px, weight 500, line-height 0.98, tracking −0.01em
- H2 / section: 36–48px, weight 500
- H3 / project title: 24–28px, weight 500
- Body: 16–18px, weight 400, line-height 1.65, measure 45–65ch
- Caption / meta: 12–13px, weight 400, letter-spacing 0.08em, uppercase for labels only

**Rule:** Two weights only — 400 and 500. Sentence case everywhere except small uppercase meta labels.

---

## 4. Colour

| Token | Hex | Use |
|-------|-----|-----|
| Paper | `#F4F1EA` | Primary background |
| Ink | `#16140F` | Primary text, dark sections |
| Stone | `#6B6256` | Secondary text |
| Linen | `#E4DED2` | Card / section separation, hairlines |
| Clay (accent) | `#C2531C` | Links, live clock, the one CTA — sparingly |

**Rule:** Clay appears on no more than ~3 elements per screen. All other colour on any page must come from the work itself. A single near-black section (`#16140F`) is allowed as a tonal break (e.g. the contact block) — invert text to paper.

---

## 5. Layout & grid — the golden ratio (φ ≈ 1.618)

The whole project is proportioned on the **golden ratio**. This is the grid guide.

- **Major / minor splits** divide φ:1 → **61.8% / 38.2%**. Two-part layouts use the
  `--col-major` (`1.618fr`) and `--col-minor` (`1fr`) tokens. The hero is statement
  (61.8%) : portrait (38.2%), split both horizontally and vertically.
- **Vertical placement:** anchor focal elements on the golden lines (the 61.8% / 38.2%
  marks), not arbitrary centres. The hero statement sits on the lower golden line.
- **Spacing & type:** prefer steps that scale by φ (or √φ ≈ 1.272 for finer steps).
- Tokens: `--phi`, `--phi-inv`, `--col-major`, `--col-minor` in `css/tokens.css`.
- Still true: max content width ~1400px, generous margins, deliberate asymmetry,
  work shown full-bleed; mobile collapses to one column (golden 61.8/38.2 stack).

---

## 6. Motion

- Slow fade-up reveals on scroll (≈400–600ms, ease-out).
- Hover-reveal on project thumbnails (subtle scale + caption fade-in).
- Gentle image parallax on full-bleed work. Smooth scroll.
- **No** auto-carousels, bouncing, or attention-grabbing loops. Motion confirms quality; it never performs.

---

## 7. Imagery

- Portraits: warm, natural light, with presence (eye contact or in the act of making). Retire the passive phone-in-bed hero.
- Work: high-res, true colour, full-bleed. The posters and identities are the stars.
- One consistent treatment — don't mix B&W and colour portraits randomly; pick a lane (recommend warm colour for approachability + remote-trust).

---

## 8. Voice

Inquisitive, warm, unhedged — your smartest, most curious self. Personal flashes (comic books, dinosaurs, snakes, tasting water) are allowed and encouraged: they earn the craft and make you memorable. Lead client-facing copy with the African-brands mission; keep personality for the About.

---

## 9. How it applies per section

- **Hero:** Signature wordmark + set name/role + one value-prop line + availability ("Open to remote roles worldwide"). One best piece, full-bleed.
- **Selected work:** 4–6 projects, large uncropped thumbnails, hover captions. Quality over quantity.
- **Case study:** Challenge / role / decisions / outcome + metrics. Big imagery, narrative left rail.
- **About:** Headline of personality, portrait, the mission elevated as a large statement, fun-fact chips.
- **Capabilities:** 5–6 sharp skills only (brand identity, brand strategy, visual/graphic, art direction, editorial).
- **Contact:** Dark Ink section, one clear ask, email visible, WAT clock, socials.

---

## 10. What this locks

- Direction: **The Quiet Gallery** (warm editorial, neutral frame, work-led colour).
- Type: **Fraunces + Inter.**
- Palette: **Paper / Ink / Stone / Linen / Clay.**
- Principle: **show the work; the frame stays quiet.**

Everything built from here references this document.
