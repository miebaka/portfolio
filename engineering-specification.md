# Engineering Specification — Miebaka Joshua Portfolio
### "The Quiet Gallery"

> The interface is the wall. The work is the art. Everything the frame does is in service of making the work — bold, colourful, African brand design — the loudest thing in the room.

This is the single governing document for the project. It absorbs the former
`creative-direction.md`: art direction, voice and positioning now live here
alongside the engineering contract, so there is one place to look and no way for
the two to drift apart. Where the two documents disagreed, the resolutions are
recorded inline and marked **Resolved**.

---

## Current implementation contract, 23 October 2026

This section supersedes older navigation and Experiments requirements elsewhere
in this document when they conflict.

- Global navigation is exactly: Work, About, Experiments, Notes, Contact.
- The identity mark is the route back to Home. Privacy remains a footer route.
- Mobile navigation combines a persistent five-item safe-area-aware bottom bar
  with a full-screen numbered Index. The Index must trap focus, close on Escape,
  restore trigger focus and remain usable with reduced motion.
- Experiments uses `explorations.html` as a full-viewport spatial archive. It
  supports drag, wheel, arrow-key and sequential-keyboard navigation, mixed
  image/video media and an honest empty state.
- Experiment media belongs only in `assets/experiments/`. The build generates
  `manifest.json`; optional `metadata.json` may override presentation metadata.
- `npm run build` must validate public content, generate the Experiments
  manifest, build the shader bundle and emit the static production site.

---

# 0. Positioning & Thesis

* **Who:** Joshua Miebaka Williams Atubokiki — brand and visual designer, 7+ years, Lagos / WAT, remote-global.
* **Thesis line (the spine of the whole site):** *"Building a standard for what brand and graphic design can be for African brands."*
* **Promise:** World-class craft, premium and considered, hireable from anywhere.
* **Feeling:** Considered, confident, warm. Restraint as proof of taste, never loud for its own sake.

Every page must reinforce the thesis and end with a single clear ask.

---

# 1. Design Principles

The portfolio is **not** a SaaS dashboard.

It is not a Behance clone.

It is not a marketing website.

It is a carefully designed editorial experience that demonstrates systems thinking, typography, composition, restraint, and engineering quality.

Every design decision should satisfy the following principles.

## 1.1 Editorial First

Typography carries the experience.

Whitespace carries hierarchy.

Images support the story rather than becoming the story.

---

## 1.2 System Before Components

No component owns visual decisions.

Every component consumes design tokens.

Never hardcode:

* spacing
* colors
* typography
* shadows
* transitions
* radii

inside components.

---

## 1.3 Intentional Simplicity

Remove visual noise.

Prefer:

* whitespace
* rhythm
* typography

over decoration.

Whitespace is a feature, not leftover space. Wide margins and big air are the
deliberate output of the spacing scale, not what is left once content is placed.

---

## 1.4 Consistency

The same interaction should always behave identically.

The same typography role should always look identical.

The same spacing token should always produce identical rhythm.

---

## 1.5 The Frame Stays Neutral; the Work Supplies the Colour

No decorative colour in the UI. Every colour a visitor sees beyond the core
palette must come from the work itself: a project tile, a case-study band, a
photograph. The chrome never competes with the portfolio.

---

## 1.6 Show, Never List

Any reference to a project carries an image or a colour field. A project named
in text with nothing to look at is a broken reference.

---

## 1.7 One Idea Per Screen

Lead the eye to a single focal point. If a viewport contains two things
competing to be read first, one of them is in the wrong place.

---

## 1.8 Restraint Over Options

One accent, one weight of emphasis, one call to action per view.

---

## 1.9 Every Project Is a Story

Challenge, role, decisions, outcome, with numbers. A case study that only shows
the artefact has not explained the work.

---

# 2. Typography System

Typography is the primary communication layer.

Images are secondary.

---

## Font Roles

| Role      | Typeface          | Usage                        |
| --------- | ----------------- | ---------------------------- |
| Display   | TeX Gyre Heros    | Headlines                    |
| Reading   | Libre Baskerville | Long-form copy               |
| Interface | Josefin Sans      | Labels, navigation, metadata |

Never interchange these roles.

> **Resolved — type pairing.** The retired `creative-direction.md` specified
> Fraunces (display) plus Inter (body), with an optional signature script. That
> pairing is void. The three roles above are the only correct ones: they are
> what is self-hosted in `assets/fonts/`, what `styles/tokens/typography.css`
> declares, and what every page renders. Fraunces and Inter appear nowhere in
> the build and must not be reintroduced.
>
> The signature script survives in one place only, and not as a typeface: the
> footer wordmark is an SVG (`miebaka-joshua-script-name.svg`), used as a mask
> and as the sampling source for the footer particle scene. It is artwork, never
> a font, and never sets type.

---

## Display Typography

Used only for:

* Hero
* H1
* H2
* Section titles
* Case study titles

Never use display font for:

* paragraphs
* captions
* testimonials
* metadata

---

## Body Typography

Libre Baskerville is responsible for every reading experience.

Including:

* hero introduction
* about page
* case studies
* testimonials
* articles
* long captions

Reading typography should never exceed 70 characters per line.

---

## Interface Typography

Josefin Sans is reserved for:

Navigation

Buttons

Labels

Dates

Categories

Metadata

Tags

Captions

It should never appear in paragraphs.

---

## Typography Scale

| Token      | Desktop | Mobile |
| ---------- | ------: | -----: |
| display-xl |      96 |     56 |
| display-lg |      72 |     48 |
| h1         |      56 |     40 |
| h2         |      44 |     34 |
| h3         |      34 |     28 |
| h4         |      28 |     24 |
| h5         |      22 |     20 |
| h6         |      18 |     18 |
| body-lg    |      20 |     18 |
| body       |      18 |     17 |
| body-sm    |      16 |     16 |
| caption    |      14 |     14 |
| label      |      12 |     12 |

All sizes should use `clamp()` for fluid scaling.

---

## Font Weights

Display

400

500

700

Body

400

700

Labels

400

500

600

No artificial bolding.

---

## Letter Tracking

| Role       | Tracking |
| ---------- | -------- |
| Display XL | -0.05em  |
| Display    | -0.03em  |
| Heading    | -0.02em  |
| Body       | 0        |
| Caption    | 0.01em   |
| Label      | 0.16em   |
| Button     | 0.12em   |

Tracking values must exist only as tokens.

Never inside components.

---

## Line Heights

| Role    | Value |
| ------- | ----- |
| Hero    | 1     |
| Heading | 1.08  |
| Intro   | 1.55  |
| Body    | 1.75  |
| Caption | 1.55  |
| Label   | 1     |

---

## Reading Measures

```
--measure-hero:18ch;

--measure-lead:34ch;

--measure-reading:68ch;

--measure-caption:42ch;

--measure-wide:84ch;
```

Every content role gets its own measure.

---

## OpenType Features

Enable globally.

```
font-kerning: normal;

text-rendering: optimizeLegibility;

font-feature-settings:
"kern",
"liga",
"clig",
"calt";

font-variant-ligatures:
common-ligatures
contextual;
```

---

## Typography Utility Classes

```
.display-xl

.display-lg

.display

.headline

.subhead

.lead

.body

.small

.caption

.label

.overline

.quote
```

Components consume these classes.

---

# 3. Color System

Current naming already communicates quality.

Retain semantic naming.

## Core Palette

| Token   | Hex       | Use                                          |
| ------- | --------- | -------------------------------------------- |
| `paper` | `#F4F1EA` | Primary background                            |
| `ink`   | `#16140F` | Primary text, inverted sections               |
| `stone` | `#6B6256` | Secondary text                                |
| `linen` | `#E4DED2` | Card and section separation, hairlines        |
| `clay`  | `#C2531C` | Accent: links, the one CTA — sparingly        |

Derived roles (`linen-strong`, `clay-hover`, `clay-text`, `clay-text-hover`,
`bg`, `surface`, `text-*`, `border*`, `accent*`) are defined in
`styles/tokens/colors.css` and are the only things components may consume. Dark
mode redefines these token values; it never redefines a component.

> **Resolved — accent contrast.** `--clay` is the brand colour and is 4.09:1 on
> `--paper`, which clears WCAG AA for large text (3:1) but not for body text
> (4.5:1). Small accent text therefore uses `--clay-text` (4.72:1 light,
> 5.24:1 dark). Large display accents keep the true brand `--clay`. Do not
> collapse these back into one token.

> **Resolved — phantom tokens.** Earlier drafts of this section also named
> `mist`, `forest`, `ember` and `gold`. None of them exist in
> `styles/tokens/colors.css` and none are used anywhere in the build. They were
> aspirational, never implemented, and are removed here rather than left as a
> list that does not describe the product. Adding any of them back is a new
> decision requiring a token definition first.

**Accent budget:** `clay` appears on no more than roughly three elements per
screen. All other colour on any page must come from the work itself. A single
near-black `ink` section is permitted as a tonal break; invert text to `paper`
inside it.

Never expose numerical color names.

Avoid:

```
gray-500

gray-700
```

---

## Color Categories

Background

Surface

Text

Border

Interactive

Accent

Status

Overlay

---

## Text Hierarchy

Primary

Secondary

Muted

Disabled

Inverse

Link

Visited

---

## Contrast

Minimum WCAG AA.

Large headings

4.5:1 minimum.

Body copy

7:1 preferred.

---

## Dark Mode

Maintain semantic token names.

Never redefine components.

Only redefine tokens.

---

# 4. Spacing System

Use an 8-point grid.

```
0

4

8

12

16

24

32

40

48

64

80

96

128

160

192
```

---

## Tokens

```
--space-0

--space-1

...

--space-12
```

No literal spacing inside components.

---

## Vertical Rhythm

Every section must align to the spacing system.

Paragraph spacing

Heading spacing

Section spacing

Media spacing

All tokenized.

---

# 5. Layout System

Containers

```
--content-width

--text-width

--gallery-width

--bleed-width

--page-max
```

---

## Layout Utilities

```
.container

.container-wide

.container-reading

.container-gallery

.container-bleed
```

---

## Section Utilities

```
.section-xs

.section-sm

.section-md

.section-lg

.section-xl
```

Padding must never be manually declared inside pages.

---

# 6. Grid System

Use CSS Grid exclusively for page layout.

## Columns

Desktop

12 columns

Tablet

8 columns

Mobile

4 columns

---

## Gutter

Desktop

32px

Tablet

24px

Mobile

16px

---

## Grid Tokens

```
--grid-columns

--grid-gap

--grid-margin

--grid-max
```

---

## Rules

No nested grids unless necessary.

Avoid arbitrary column spans.

Use semantic layout utilities instead of inline grid declarations.

---

## The Golden Ratio (φ ≈ 1.618)

> **Resolved — grid systems.** The retired creative direction proportioned the
> site on the golden ratio; this document specified a 12/8/4 column grid. These
> were recorded as a conflict, but they are not one: they govern different
> things and both are present in the build. The rule is which one applies where.

**φ governs two-part splits.** Any layout that divides into a major and a minor
column uses `--col-major` (`1.618fr`) and `--col-minor` (`1fr`), giving the
61.8% / 38.2% division. In the build this covers the hero (statement : portrait),
the about grid, the capability and experience rows, the contact page, and the
footer.

**The 12-column grid governs multi-item layouts.** The work grid and the
case-study body use `repeat(12, 1fr)`, with each item claiming a span from data.
Tablet collapses to 8 columns, mobile to 4.

Further φ rules:

* **Vertical placement:** anchor focal elements on the golden lines, not
  arbitrary centres. The hero statement sits on the lower golden line.
* **Spacing and type:** prefer steps that scale by φ, or √φ ≈ 1.272 for finer
  increments.
* **Tokens:** `--phi`, `--phi-inv`, `--col-major`, `--col-minor`, defined in
  `styles/tokens/grid.css` alongside the 12-column tokens.
* **Mobile:** the golden split collapses to a single column; work reverts to a
  single-column stack before widening to 2 and then 12.

Content max width is ~1400px with generous margins. Deliberate asymmetry is
expected; work is shown full-bleed where it earns it.

---

# 7. Motion System

## Motion Philosophy

Motion should communicate hierarchy, continuity, and intent.

It should never exist purely for decoration.

Every animation must answer one of four questions:

* Where did this come from?
* Where is it going?
* What changed?
* What should I notice?

If an animation cannot answer one of those questions, it should be removed.

Motion confirms quality; it never performs. Specifically banned: auto-advancing
carousels, bouncing, and any attention-grabbing loop. A visitor should never
have to wait for the interface to finish moving before they can read it.

---

## Motion Characteristics

The site should feel:

* calm
* confident
* premium
* editorial
* deliberate

It should never feel:

* playful
* bouncy
* exaggerated
* game-like
* flashy

---

## Motion Categories

## Entrance

Fade

Slide

Reveal

Scale

Mask

---

## Interaction

Hover

Focus

Active

Pressed

Disabled

---

## Navigation

Menu

Overlay

Page transition

Scroll restoration

---

## Scroll

Fade-in

Translate

Parallax (minimal)

Sticky transitions

---

## Feedback

Button confirmation

Form success

Loading

Error

---

## Timing Tokens

```css
--duration-instant:75ms;

--duration-fast:150ms;

--duration-standard:250ms;

--duration-medium:350ms;

--duration-slow:500ms;

--duration-emphasis:700ms;
```

No component may hardcode durations.

---

## Easing Tokens

```css
--ease-linear;

--ease-standard;

--ease-snappy;

--ease-gentle;

--ease-emphasized;
```

Rules:

Hover → Standard

Menus → Emphasized

Micro interactions → Snappy

Reading transitions → Gentle

---

## Hover Standards

Links

Opacity

Underline

Color

Never move more than 2px.

---

Buttons

Background

Border

Shadow

Never animate width.

Never animate height.

---

Cards

Elevation

Shadow

TranslateY

Maximum translate:

```text
-4px
```

---

Images

Scale

Maximum

```text
1.03
```

Never exceed

```text
1.05
```

---

## Reduced Motion

Always support

```css
prefers-reduced-motion
```

Disable

* parallax

* reveals

* transitions

* autoplay animations

---

## Scroll Reveals

Allowed

Opacity

Translate

Clip-path

Not allowed

Bounce

Elastic

Overshoot

---

# 8. Design Token Architecture

Tokens are the single source of truth.

No component owns visual values.

---

## Directory Structure

```text
styles/

tokens/

colors.css

typography.css

spacing.css

layout.css

grid.css

motion.css

radius.css

shadow.css

z-index.css

opacity.css

base/

reset.css

typography.css

utilities.css

components/

navigation.css

buttons.css

cards.css

forms.css

footer.css

sections/

hero.css

work.css

about.css

contact.css

case-study.css
```

---

## Token Rules

Every token must be:

Semantic

Reusable

Platform independent

Never named by appearance.

Bad

```text
gray500
blue400
```

Good

```text
surface

surface-raised

text-primary

text-secondary

accent

border-muted
```

---

## Token Ownership

Only tokens may define

Colors

Spacing

Typography

Radius

Shadow

Elevation

Motion

Opacity

Layout

Z-index

---

## Component Rules

Components consume tokens.

Components never create design language.

---

# 9. CSS Architecture

Architecture

```text
Tokens

↓

Base

↓

Utilities

↓

Components

↓

Sections

↓

Overrides
```

Nothing skips layers.

---

## Naming Convention

BEM

```text
.hero

.hero__title

.hero__content

.hero--dark
```

No deep nesting.

Maximum selector depth

```text
3
```

---

## CSS Conventions

Never use

IDs

Important

Inline styles

Deep selectors

Element chains

---

Always use

Custom properties

Logical properties

Container queries (future)

Modern CSS

---

## Property Order

Position

Display

Layout

Box model

Typography

Visual

Animation

Misc

Every rule follows identical order.

---

## File Size Limits

tokens

<250 lines

component

<300 lines

section

<350 lines

If larger

Split file.

---

## Responsive Strategy

Desktop first layout

Mobile first CSS

Fluid typography

Clamp spacing

No breakpoint-specific typography.

---

## Utilities

Allowed

Typography

Spacing

Display

Flex

Grid

Alignment

Visibility

Aspect ratio

Not allowed

Color utilities

Component utilities

Visual hacks

---

# 10. HTML Architecture

HTML communicates meaning.

CSS communicates appearance.

---

## Semantic Structure

```text
body

header

main

section

article

aside

footer
```

Never use div when a semantic element exists.

---

## Heading Structure

One

H1

Per page.

Never skip heading levels.

---

## Images

Every image

Width

Height

Alt

Loading

Decoding

---

## Links

Descriptive text.

Never

Click here

Learn more

---

## Forms

Every control

Label

Description

Error state

Autocomplete

---

## Accessibility

Landmarks

ARIA

Skip links

Keyboard support

Required everywhere.

---

## Inline Styles

Forbidden.

Move every inline declaration into CSS.

---

## Data Attributes

Allowed only for

JS hooks

Analytics

State

Never for styling.

---

# 11. JavaScript Architecture

JavaScript enhances.

HTML should remain usable.

---

## Directory

```text
js/

core/

navigation.js

menu.js

scroll.js

animation.js

components/

carousel.js

accordion.js

modal.js

utilities/

dom.js

events.js

helpers.js

render/

navigation.js

footer.js

projects.js
```

---

## Principles

Single responsibility.

Pure functions.

Small modules.

Predictable naming.

---

## Naming

Good

```text
renderProjects()

mountNavigation()

toggleMenu()

updateClock()
```

Bad

```text
doStuff()

run()

handle()

execute()
```

---

## DOM Access

Cache selectors.

Avoid repeated queries.

Batch DOM writes.

Prefer

```js
DocumentFragment
```

for multiple insertions.

---

## Events

Delegate where possible.

Avoid attaching listeners repeatedly.

---

## State

Never store UI state in the DOM unless required.

Keep state centralized.

---

## Rendering

Rendering functions should

Receive data

Return markup

Never mutate unrelated state.

---

## Error Handling

Gracefully handle

Missing data

Missing images

Network failures

Unexpected values

---

# 12. Art Direction

Engineering decides how an image is delivered. This section decides which image
is worth delivering.

## Portraits

Warm, natural light, with presence: eye contact, or caught in the act of making.
Never passive or incidental.

## Work

High resolution, true colour, full-bleed where the piece earns it. The posters
and identities are the subject; the page is the wall they hang on.

## Consistency

One treatment throughout. Do not mix black-and-white and colour portraits
arbitrarily. The chosen lane is warm colour, for approachability and for the
trust a remote hire has to establish quickly.

## Credit

Third-party imagery used editorially (campaign stills, documentary photography)
carries its credit in the caption, below the image, never set over it.

---

# 13. Voice

Inquisitive, warm, unhedged. The register is the writer's smartest, most curious
self.

Personal detail — comic books, dinosaurs, snakes, the ability to taste the
difference in water — is encouraged rather than tolerated: it earns the craft and
makes the work memorable.

Lead client-facing copy with the African-brands mission. Keep personality
concentrated in the About page and the writing.

**Mechanics:**

* Sentence case everywhere except small uppercase interface labels.
* No em-dashes or en-dashes in any user-visible string, including page titles,
  meta descriptions, alt text and button labels. Use a comma, colon, period or
  plain hyphen. This applies to prose in the articles as much as to UI copy.
* One label per intent across the whole site. The contact call to action is
  "Start a project" everywhere it appears.
* No scroll cues, no section-number eyebrows, no decorative status dots.
* At most one small-caps eyebrow per three sections; a headline that names its
  own section does not also need a label above it.

---

# 14. Component-by-Component Implementation Guide

## Navigation

### Responsibilities

Global navigation

Theme switching

Menu state

Clock

Accessibility

### Tasks

* Remove duplicated markup generation.
* Centralize navigation rendering.
* Add focus trapping to overlay menu.
* Ensure Escape closes menu.
* Lock body scroll when open.
* Tokenize spacing and typography.
* Improve keyboard navigation.

Acceptance Criteria

* [ ] Keyboard accessible
* [ ] Screen-reader friendly
* [ ] No duplicated HTML
* [ ] Token-driven styling

---

## Hero

Responsibilities

Identity

Introduction

Primary CTA

Portrait

### Tasks

* Replace inline styles.
* Use typography utility classes.
* Constrain reading measure.
* Improve image loading.
* Standardize spacing.
* Improve responsive composition.

Acceptance Criteria

* [ ] Editorial hierarchy
* [ ] Responsive
* [ ] Typography tokens only

---

## Work Grid

Responsibilities

Project discovery

### Tasks

* Replace manual sizing with layout utilities.
* Normalize card spacing.
* Improve hover interactions.
* Lazy-load images.
* Remove duplicated card styles.

Acceptance Criteria

* [ ] Consistent rhythm
* [ ] Accessible links
* [ ] Responsive grid

---

## Testimonials

### Tasks

* Move to serif typography.
* Increase reading measure.
* Improve quotation styling.
* Add semantic `<blockquote>` and `<cite>` usage.

Acceptance Criteria

* [ ] Editorial appearance
* [ ] Semantic HTML
* [ ] Typography consistency

---

## Footer

### Tasks

* Simplify layout.
* Tokenize spacing.
* Improve navigation semantics.
* Normalize social links.
* Improve responsive layout.

Acceptance Criteria

* [ ] Accessible
* [ ] Responsive
* [ ] Consistent spacing

---

## Case Studies

### Tasks

* Standardize template.
* Replace inline media colors.
* Normalize rails.
* Improve typography.
* Improve media rhythm.
* Create reusable content blocks.

Acceptance Criteria

* [ ] Shared layout system
* [ ] Zero duplicated patterns
* [ ] Consistent hierarchy

---

# 15. Acceptance Criteria

## Typography

* [ ] Every heading uses TeX Gyre Heros.
* [ ] Every long-form paragraph uses Libre Baskerville.
* [ ] Every label and UI element uses Josefin Sans.
* [ ] No typography role leaks into another.
* [ ] All font sizes use tokens.
* [ ] All tracking values use tokens.
* [ ] Reading measures are respected.

## Color

* [ ] No hardcoded colors remain.
* [ ] Components consume semantic color tokens only.
* [ ] All text meets contrast requirements.

## Spacing

* [ ] No literal margin or padding values remain.
* [ ] All spacing derives from the spacing scale.
* [ ] Vertical rhythm is consistent across pages.

## Layout

* [ ] Containers use layout tokens.
* [ ] No inline widths remain.
* [ ] All sections use spacing utilities.

## Grid

* [ ] Multi-item layouts follow the 12/8/4 column system.
* [ ] Two-part splits use `--col-major` / `--col-minor`, not hand-written percentages.
* [ ] Gutters are tokenized.
* [ ] Components align to the grid consistently.

## Art Direction

* [ ] Every project reference carries an image or a colour field.
* [ ] Portrait treatment is consistent across the site.
* [ ] Third-party imagery is credited in a caption below the image.

## Voice

* [ ] No em-dash or en-dash appears in any user-visible string.
* [ ] The contact call to action reads "Start a project" everywhere.
* [ ] Eyebrow labels number at most one per three sections.
* [ ] No scroll cues, section numbering, or decorative status dots.

---

# 16. Definition of Done — Implementation

The implementation is complete only when:

* [ ] No hardcoded design values remain in components.
* [ ] All visual decisions originate from design tokens.
* [ ] CSS follows the defined architecture.
* [ ] HTML is fully semantic and accessible.
* [ ] JavaScript is modular and predictable.
* [ ] Every component passes accessibility review.
* [ ] Motion is consistent with the defined system.
* [ ] No inline styles remain.
* [ ] All pages share a unified visual language.
* [ ] The codebase is maintainable, scalable, and production-ready.

# 17. File-by-File Refactor Tasks

The project should be refactored from the foundation outward. Never begin with visual polish before completing the architectural work.

Priority definitions:

Critical — Blocks maintainability, accessibility, or scalability.
High — Significant improvement to engineering or UX.
Medium — Improves consistency and polish.
Low — Cosmetic or future enhancement.
styles/tokens.css

Priority: Critical

Current Issues
Single file owns too many responsibilities.
Typography, spacing, color, layout, and motion are coupled.
File will become difficult to maintain.
Tasks

Split into dedicated token files.

Standardize naming.

Remove duplicated values.

Introduce semantic token groups.

Introduce token documentation.

Alphabetize related token groups.

Add comments describing ownership.

Remove deprecated tokens.

Acceptance Criteria

One responsibility per token file.
No duplicated token values.
Components consume only semantic tokens.
styles/base.css

Priority: Critical

Tasks

Establish document defaults.

Move typography defaults here.

Configure OpenType features.

Configure smooth font rendering.

Configure focus styles.

Configure selection styles.

Normalize forms.

Normalize media.

Normalize lists.

Normalize tables.

Normalize code blocks.

styles/components.css

Priority: High

Tasks

Remove duplicated typography.

Remove duplicated spacing.

Replace literal values with tokens.

Reduce selector depth.

Split into smaller files:

buttons
navigation
cards
forms
footer
marquee
quotes
styles/sections.css

Priority: High

Tasks

Separate page-specific sections.

Normalize spacing.

Normalize layout utilities.

Remove inline layout decisions.

Ensure every section consumes utilities.

index.html

Priority: Critical

Tasks

Verify semantic heading hierarchy.

Ensure single H1.

Improve landmark structure.

Replace inline styles.

Improve hero reading width.

Improve CTA hierarchy.

Optimize image loading.

Improve metadata.

work.html

Priority: High

Tasks

Normalize work grid.

Improve masonry consistency.

Improve hover behavior.

Improve card accessibility.

Improve keyboard navigation.

about.html

Priority: High

Tasks

Improve typography rhythm.

Reduce line length.

Increase whitespace.

Improve hierarchy.

Improve portrait loading.

contact.html

Priority: High

Tasks

Improve form accessibility.

Add autocomplete attributes.

Improve validation messaging.

Improve mobile spacing.

work/*.html

Each case study should use a shared template.

Tasks

Remove inline colors.

Normalize rail layout.

Normalize media spacing.

Standardize metrics.

Standardize next-project navigation.

Standardize typography.

Create reusable content blocks.

data/site.js

Priority: Medium

Tasks

Validate schema.

Separate content from configuration.

Normalize project objects.

Add image metadata.

Add SEO metadata.

Add social metadata.

Add accessibility metadata where required.

js/render.js

Priority: Critical

Tasks

Break into modules.

Reduce repeated template logic.

Reuse rendering helpers.

Centralize escaping.

Improve readability.

Cache selectors.

Improve error handling.

js/main.js

Priority: High

Tasks

Separate concerns.

Improve event delegation.

Remove duplicated listeners.

Improve state management.

Improve naming consistency.

# 18. Accessibility Requirements (WCAG 2.2 AA)

Accessibility is not an enhancement. It is a release requirement.

Keyboard Navigation

Every interactive element is reachable.

Logical tab order.

No keyboard traps.

Escape closes overlays.

Enter and Space activate controls.

Focus returns to the invoking control after dialogs close.

Focus Indicators

Visible on every interactive element.

Minimum 3:1 contrast.

Never removed with outline: none.

Consistent focus ring token.

Color Contrast

Normal text ≥ 4.5:1.

Large text ≥ 3:1.

UI controls ≥ 3:1.

Focus indicators ≥ 3:1.

Aim for 7:1 on body copy where practical.

Images

Decorative images have empty alt.

Informative images have descriptive alt.

Portraits describe the subject.

Logos identify the organization.

Width and height declared.

Lazy-load below the fold.

Forms

Labels associated with inputs.

Error messages linked using aria-describedby.

Required fields announced.

Autocomplete attributes used.

Clear success state.

Landmarks

header

nav

main

section

article

footer

No redundant ARIA on native elements.

Motion

Honor prefers-reduced-motion.

Disable non-essential animation.

Preserve usability without animation.

# 19. Performance Optimization Plan
Core Web Vitals Targets
| Metric | Target |
| ------ | ------ |
| LCP | < 2.5 s |
| CLS | < 0.1 |
| INP | < 200 ms |

Fonts

Subset fonts.

Self-host.

Use font-display: swap.

Preload critical fonts.

Avoid loading unused weights.

Images

Convert to AVIF/WebP.

Responsive srcset.

Explicit dimensions.

Lazy-load below fold.

Compress assets.

CSS

Remove unused rules.

Reduce specificity.

Minify production build.

Eliminate duplicate declarations.

JavaScript

Defer non-critical scripts.

Remove dead code.

Minimize DOM queries.

Batch DOM updates.

Avoid layout thrashing.

Rendering

Avoid forced reflow.

Minimize paint areas.

Animate only transform and opacity.

# 20. SEO Implementation Plan
Metadata

Every page requires:

Unique title.

Unique meta description.

Canonical URL.

Open Graph tags.

Twitter Card tags.

Structured Data

Implement JSON-LD for:

Person
WebSite
CreativeWork
Breadcrumbs (case studies)
Content

One H1 per page.

Logical heading hierarchy.

Descriptive link text.

Descriptive image alt text.

Meaningful page introductions.

Technical SEO

XML sitemap.

robots.txt.

Favicon set.

Social preview images.

Clean URLs.

404 page.

Proper redirects where required.

# 21. Responsive Design Standards

Responsive behavior is part of the design system, not an afterthought.

Breakpoints
| Size | Width |
| ---- | ----- |
| Small | 0–599px |
| Medium | 600–899px |
| Large | 900–1199px |
| XL | 1200–1599px |
| XXL | 1600px+ |

Layout Rules

Fluid containers.

Clamp typography.

Clamp spacing.

Flexible grids.

No horizontal scrolling.

No content clipping.

Images

Responsive sources.

Maintain aspect ratio.

No pixel stretching.

Touch Targets

Minimum:

44 × 44 px.

Testing Matrix
Mobile portrait
Mobile landscape
Tablet portrait
Tablet landscape
Laptop
Desktop
Ultrawide
# 22. Animation Standards

> Detailed timing tokens, easing tokens, hover standards and reduced-motion
> rules live in **§7 Motion System**. This section holds the acceptance-level
> standards only; §7 is authoritative where the two describe the same value.

Animation should reinforce the editorial character of the portfolio.

Principles
Deliberate
Restrained
Consistent
Performance-friendly
Allowed Properties
opacity
transform
filter (sparingly)

Avoid animating:

width
height
margin
padding
top
left
Scroll Reveals
Fade
Translate (≤ 24px)
Clip-path (where appropriate)

Never use bounce, overshoot, or elastic easing.

Hover States

Links

Color
Underline
Opacity

Buttons

Elevation
Background
Shadow

Cards

Elevation
TranslateY (≤ 4px)
Shadow

Images

Scale ≤ 1.03
Timing
Hover: 150–250 ms
Section reveal: 350–500 ms
Menu: 300–500 ms
Page transitions: 400–700 ms
Release Checklist
Critical

Token architecture complete.

CSS refactor complete.

HTML semantics complete.

JavaScript modularized.

Accessibility audit passed.

Performance targets met.

SEO implementation complete.

Responsive QA complete.

Animation system consistent.

Only after every critical item is complete should visual polish and future enhancements be considered.

# 23. Naming Conventions

> CSS-specific naming (BEM, selector depth, file names) is defined in
> **§9 CSS Architecture**. This section covers project-wide naming: branches,
> commits, assets and tokens.

Naming is architecture.

Names should communicate intent, not implementation.

A developer unfamiliar with the project should understand the purpose of any file, class, variable, or function without reading its implementation.

General Principles

Every identifier must be:

Descriptive
Predictable
Consistent
Singular in responsibility
Stable over time

Avoid abbreviations unless universally understood.

Bad

btn
img
el
obj
arr

Good

primaryButton
heroImage
navigationElement
projectCollection
featuredProjects
File Naming

Use kebab-case.

Correct

case-study.html
project-card.js
navigation.css
design-tokens.css

Incorrect

CaseStudy.html
ProjectCard.js
Navigation.CSS
CSS Custom Properties

Use semantic names only.

Correct

--text-primary
--surface-elevated
--border-muted
--space-6
--duration-standard

Incorrect

--gray500
--padding20
--blue
CSS Classes

Follow BEM.

.hero

.hero__content

.hero__headline

.hero__summary

.hero__actions

.hero--compact

Rules

Maximum nesting depth: 3
Never chain more than three selectors.
Never style IDs.
Never rely on tag selectors for component styling.
JavaScript

Variables

featuredProjects
navigationState
currentTheme

Booleans

isOpen
isVisible
isLoading
hasError
canNavigate

Functions

Always begin with a verb.

renderProjects()

toggleMenu()

loadTheme()

initializeNavigation()

updateClock()

Avoid

run()

execute()

handle()

doStuff()
Events
onMenuOpen()

onProjectSelect()

onFormSubmit()
Constants
MAX_PROJECTS

DEFAULT_THEME

GRID_COLUMNS
Data

Object names should represent entities.

project

testimonial

navigationItem

contactLink

Never

item

data

object
Folder Naming
components/

sections/

utilities/

tokens/

assets/

data/

scripts/

Folders represent architectural boundaries.

Git Commit Convention

Every commit should follow Conventional Commits.

Examples

feat: add responsive case study layout

fix: improve keyboard navigation

refactor: split typography tokens

perf: optimize hero image loading

docs: update engineering specification

style: normalize spacing scale

test: add Lighthouse regression checklist
Branch Naming
feature/design-system

feature/navigation

feature/case-study-layout

fix/mobile-navigation

refactor/css-architecture
# 24. Quality Assurance Checklists

Every feature must pass the following gates.

Design QA
Typography

Correct typeface role

Correct scale

Correct tracking

Correct line height

Correct reading measure

No typography leaks

Consistent vertical rhythm

Layout

Grid alignment

Consistent gutters

Consistent section spacing

Consistent container widths

No alignment drift

Color

Semantic tokens only

No hardcoded values

Contrast verified

Dark mode parity

Motion

Uses motion tokens

No layout-shifting animation

Reduced-motion support

Consistent easing

Frontend QA
HTML

Valid HTML

One H1

Landmark structure

Heading hierarchy

No inline styles

No duplicate IDs

CSS

No duplicated declarations

No magic numbers

Token-driven values

Selector depth ≤ 3

No !important

Logical properties preferred

JavaScript

No duplicated logic

Pure rendering functions

Event delegation where appropriate

Error handling implemented

Console free of warnings

No unused variables

Accessibility QA

Keyboard navigation complete

Focus visible

Screen-reader labels verified

Forms accessible

Alt text complete

Color contrast verified

Reduced motion supported

Performance QA

LCP target met

CLS target met

INP target met

Images optimized

Fonts optimized

CSS minimized

JS minimized

Lighthouse ≥ 95

SEO QA

Metadata complete

Structured data valid

Sitemap updated

Canonical URLs

Open Graph complete

Twitter Cards complete

# 25. Definition of Ready

No implementation begins until:

Requirements documented

Acceptance criteria written

Dependencies identified

Design approved

Tokens available

Accessibility impact reviewed

Responsive behaviour defined

# 26. Definition of Done — Per Task

> §16 defines when the *implementation as a whole* is complete. This section
> defines when an *individual task* is complete. Both apply.

A task is complete only when every requirement below is satisfied.

Engineering

Code reviewed

No duplicated logic

Consistent architecture

Lint passes

Build passes

Design

Matches design system

Typography correct

Spacing consistent

Motion consistent

Editorial quality maintained

Accessibility

WCAG AA compliant

Keyboard tested

Screen-reader tested

Focus order verified

Performance

Performance budget met

No regressions

Lighthouse targets achieved

Documentation

Comments updated where required

Changelog updated

Engineering documentation updated

# 27. Refactor Priorities
Critical

These block release.

Token architecture

Typography system

CSS architecture

HTML semantics

Accessibility

Navigation refactor

Responsive layout

Render pipeline cleanup

High

Motion system

Component standardization

Image optimization

Performance optimization

SEO implementation

Case study template unification

Medium

Animation polish

Utility class expansion

Documentation improvements

Component extraction

Micro-interactions

Low

Theme customization

Experimental transitions

Future-proof container query enhancements

Optional visual flourishes

# 28. Progress Tracking
Phase 1 — Foundation

Split token architecture

Typography system

Color system

Spacing system

Layout system

Motion system

Phase 2 — Core Architecture

Base styles

Utility classes

Component library

Section architecture

Phase 3 — HTML

Home

Work

About

Contact

Case studies

Phase 4 — JavaScript

Rendering

Navigation

Utilities

Events

State management

Phase 5 — Optimization

Accessibility

SEO

Performance

Responsive QA

Cross-browser testing

Phase 6 — Release

Regression testing

Documentation

Final QA

Production build

Deployment

# 29. Page-by-Page Acceptance Criteria
Home
Objectives

Communicate identity, expertise, and credibility within the first viewport.

Acceptance Criteria

Hero communicates positioning immediately.

Primary CTA is obvious.

Editorial typography applied consistently.

Featured work loads progressively.

All interactions keyboard accessible.

Performance budget met.

Work
Objectives

Enable effortless exploration of projects.

Acceptance Criteria

Grid remains consistent at all breakpoints.

Cards share identical interaction patterns.

Filtering (if present) remains accessible.

Every project card has descriptive metadata.

Images lazy-load correctly.

About
Objectives

Tell a compelling professional story with long-form readability.

Acceptance Criteria

Reading measure ≤ 68 characters.

Serif typography used throughout prose.

Portrait optimized.

Timeline and achievements are semantically structured.

Contact pathways are visible without overwhelming the page.

Contact
Objectives

Reduce friction to initiating a conversation.

Acceptance Criteria

Form is fully accessible.

Validation is clear and non-blocking.

Email and social links are descriptive.

Success and error states are announced to assistive technologies.

Mobile interaction is effortless.

Case Study Template
Objectives

Provide a repeatable narrative structure that scales across every project.

Acceptance Criteria

Shared template used by every case study.

Consistent typography hierarchy.

Consistent media spacing.

Consistent navigation between projects.

Semantic sections (Overview, Challenge, Process, Solution, Outcome).

All images include dimensions, captions where appropriate, and optimized formats.

Reading rhythm remains consistent from start to finish.

Release Gate

The portfolio is considered production-ready only when:

Every Critical item is complete.

Every page meets its acceptance criteria.

Accessibility passes WCAG 2.2 AA.

Lighthouse Performance, Accessibility, Best Practices, and SEO all score ≥ 95.

No duplicated design decisions remain outside the design token system.

The codebase is maintainable, documented, and capable of supporting future growth without architectural changes.
# What This Locks

* **Direction:** The Quiet Gallery — warm editorial, neutral frame, work-led colour.
* **Type:** TeX Gyre Heros (display) · Libre Baskerville (reading) · Josefin Sans (interface). Fraunces and Inter are void.
* **Palette:** Paper · Ink · Stone · Linen · Clay. No `mist`, `forest`, `ember` or `gold`.
* **Proportion:** φ for two-part splits, 12/8/4 for multi-item grids.
* **Principle:** show the work; the frame stays quiet.

Everything built from here references this document, and only this document.

---
