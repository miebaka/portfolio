# Engineering specification — Miebaka Joshua Portfolio

Status: normative

Version: 4.0

Owner: Miebaka Joshua

Last updated: 12 October 2026

## 1. Product definition

The portfolio is a rich, considered editorial experience supported by the system depth of Material 3. It must demonstrate senior-level art direction, brand-system thinking, visual design, interaction design and production discipline without resembling a Google product, software dashboard or component-library demo.

The portfolio must feel rich, unique, deliberate and well considered. It must never feel inconsistent, jumbled or inexperienced.

### 1.1 Primary proposition

**I design brand systems, then build the tools that keep them intact.**

Support line:

**Brand strategy, identities, campaigns and production systems designed to hold together in the real world.**

The proposition and support line appear together on the homepage. The proposition carries the memory; the support line explains the practical meaning of “tools”.

### 1.2 Product outcomes

The portfolio must support three outcomes, in this order:

1. secure senior design employment;
2. win suitable independent client work;
3. establish a recognisable design point of view.

The primary conversion is contact. Secondary outcomes are viewing a complete case study, remembering Miebaka Joshua, downloading the CV and visiting LinkedIn.

### 1.3 Audience order

1. Design leaders and hiring managers.
2. Founders and potential clients.
3. Creative directors and collaborators.
4. General audiences.
5. Other designers.

Target roles include Art Director, Senior Brand Designer and Senior Visual Designer. The site must work for remote international opportunities, Nigerian roles and relocation opportunities without presenting a different identity to each audience.

## 2. Governing model

Material 3 supplies system discipline, not visual imitation. The portfolio adopts:

- reference, system and component token tiers;
- semantic colour roles with explicit foreground pairs;
- state layers and complete interaction states;
- role-based typography, shape, elevation and motion;
- adaptive navigation and responsive composition;
- accessible components and equivalent keyboard behaviour;
- documented loading, empty, error, offline and reduced-capability states;
- measurable release gates.

The portfolio retains its own editorial identity:

- Ultramarine as the signature colour;
- BIZ UDPMincho, Schibsted Grotesk and Josefin Sans;
- sharp editorial surfaces;
- full-screen proposition;
- Print and Screen themes;
- paper grain;
- five-service swatch fan;
- dot-matrix footer signature;
- original project imagery and project-specific colour worlds.

Material defaults such as widespread rounded cards, bubbly geometry, generic pills, Roboto, tonal-purple branding and app-dashboard composition are not adopted.

## 3. Precedence and sources of truth

1. Current owner direction.
2. This engineering specification.
3. `specs/personal-identity-system_design.md`.
4. `DESIGN.md` and `docs/design-system-v3.md`.
5. Shared tokens and component contracts in production code.

When documentation and production disagree, repair both in the same approved change. Historical specifications may explain past decisions but do not override this document.

Content belongs in `data/site.js` or a successor content schema. Presentation values belong in design tokens. Templates must not duplicate content that can be modelled once.

## 4. Information architecture

### 4.1 Primary destinations

- Home
- Work
- Explorations
- Community
- About
- Services
- Writing
- Contact

Supporting destinations include the CV, Privacy and the 404 page.

### 4.2 Destination roles

**Work** contains complete professional case studies and the strongest evidence of senior practice.

**Explorations** contains self-initiated visual work made outside client or employment briefs. It is curated, not a miscellaneous dump.

**Community** contains resources, teaching, tools, templates, events or other contributions that give back to the design community. Every entry must state what it gives the visitor.

**Writing** remains the name of the editorial section. It contains developed ideas rather than visual experiments or community resources.

**About** establishes Miebaka’s positioning, experience, working principles, availability and CV access.

**Services** translates capabilities into clear client outcomes without turning the portfolio into an agency website.

**Contact** supports roles, commissions and collaborations through one accessible form, a direct email address and relevant external links.

### 4.3 Homepage sequence

1. Full-screen proposition and support line.
2. Selected work.
3. Short positioning statement and quiet editorial portrait.
4. Five-service swatch fan under the visible label `WHAT I DO`.
5. Slow client marquee.
6. Short working-principles section.
7. Contact invitation.
8. Dot-matrix signature and footer navigation.

The homepage remains spacious and atmospheric. Proof is introduced through authored work, precise language and controlled interactions rather than dense feature grids.

## 5. Adaptive navigation

Navigation uses one information architecture with two adaptive presentations.

### 5.1 Expanded and large layouts

- A compact top navigation shows the logo, `WORK`, `EXPLORATIONS`, `COMMUNITY` and `INDEX`.
- `INDEX` opens a full-screen editorial overlay containing every primary and supporting destination.
- The current route is identified through colour, typography and accessible current-page semantics.
- The navigation remains visible but may condense after downward scrolling. It must return immediately when the user reverses direction, focuses within it or reaches a route boundary.
- Condensation must not change destination order or reduce targets below the minimum size.

### 5.2 Compact layouts

- A bottom navigation contains five destinations: `HOME`, `WORK`, `EXPLORE`, `CONTACT` and `INDEX`.
- `EXPLORE` leads to Explorations. Community remains one tap away inside Index.
- `INDEX` opens the same full-screen editorial destination layer used on larger screens.
- The bottom bar respects safe-area insets and never covers content, form actions or browser controls.
- Labels remain visible. Icon-only navigation is forbidden.

### 5.3 Index overlay

- The overlay is an editorial sheet, not a generic modal menu.
- Opening and closing preserve focus, scroll position and route context.
- Escape closes it. Focus remains trapped while open and returns to the trigger on close.
- Navigation remains available without JavaScript through an ordinary fallback list.
- Motion suggests a physical editorial sheet entering the composition. It remains predictable, interruptible and reversible.

## 6. Layout system

### 6.1 Sheet geometry

- `--content: 92rem` is the maximum editorial measure.
- `--page: clamp(1.4rem, 4.8vw, 5.25rem)` is the common inline margin.
- The left content edge aligns with the logo.
- The right content edge aligns with the primary navigation boundary.
- `.container`, navigation, Index, work archive, services, experience, case-study chapters and footer consume the same geometry.
- Text, controls, project media, disclosures and signatures stay within this measure.
- Case-study media does not become viewport full bleed.
- One restrained fixed trim frame may describe the viewport edge. Repeated crop marks and decorative printer furniture are forbidden.
- Safe-area insets may increase, never reduce, the page margin.

### 6.2 Responsive ranges

- Compact: below 600px.
- Medium: 600–839px.
- Expanded: 840–1199px.
- Large: 1200px and above.

Breakpoints respond to content failure rather than device names. Components may introduce local container-query changes where the shared page breakpoints are insufficient.

### 6.3 Composition rules

- Space is the primary grouping device.
- Underlying grid precision remains invisible.
- Repeated sections must not collapse into one interchangeable card grammar.
- Responsive changes alter composition, not content priority or semantic colour roles.
- Content order in the document must match reading and keyboard order.
- Full-height moments use `100svh` or `100dvh`, never `100vh` alone.

## 7. Typography

| Role | Typeface | Use |
| --- | --- | --- |
| Display | BIZ UDPMincho | Hero, project titles, section statements and authored display moments |
| Body | Schibsted Grotesk | Reading, descriptions, navigation and form content |
| Label | Josefin Sans Semibold | Every interface label, button label, navigation label, metadata label, tag and case-study fact label |

### 7.1 Rules

- Visible labels are always uppercase and use Josefin Sans Semibold.
- Button and navigation labels are labels, so they are uppercase.
- BIZ UDPMincho is the only project-title face.
- No fourth typeface is part of the production system.
- Sustained reading uses at least 17px text. Compact interface text may use 16px.
- Reading measures remain below 65 characters per line.
- Display type is reserved for short text and must not carry essential long-form explanation.
- Type scales use named roles rather than page-specific sizes.
- Optical size, line height and letter spacing are documented for every role.
- Faux bold, faux italic and uncontrolled font synthesis are forbidden.

## 8. Colour and themes

### 8.1 Identity roles

- Ultramarine `#002080` remains the signature brand colour.
- Paper and Ink form the editorial base.
- Coral appears only during hover, focus, selection, validation or other active feedback.
- Coral is not a decorative resting accent.
- Project imagery retains authored colour.

### 8.2 Token tiers

Reference tokens store canonical colour values. System tokens define semantic roles. Component tokens alias system roles for stable component contracts. Components do not consume raw colour values.

Every filled role has an explicit `on-*` foreground partner. Arbitrary foreground and background mixing is forbidden.

### 8.3 Print and Screen

- Print and Screen remain equally important, complete themes.
- Print is a light paper environment with dark ink and Ultramarine structure.
- Screen is a dark, luminous editorial environment without neon, glow-heavy or gaming aesthetics.
- Theme changes preserve component roles, reading order and hierarchy.
- Theme preference defaults to the operating system, supports manual override and persists locally.
- Neither theme may be a superficial inversion of the other.

### 8.4 Project theming

- A case study may temporarily tint the navigation and page background using an approved project palette.
- Project palettes must be mapped into the same semantic roles as the core themes.
- Project themes retain the site’s typography, spacing, state and accessibility contracts.
- Leaving the case study restores the global theme without a flash of incorrect colour.

### 8.5 Contrast and conformance

- Every text placement must meet a strict 7:1 contrast floor in Print, Screen and project themes.
- The 7:1 requirement applies regardless of text size, weight, state or function; large-text and inactive-text exceptions are not used.
- The rule includes navigation, buttons, links, labels, metadata, captions, placeholders, validation messages, disabled text and text over imagery.
- Text over variable imagery requires a tested semantic backing surface. Untested text directly over imagery is forbidden.
- Essential icons and focus indicators remain clearly distinguishable in both themes and project themes and meet their documented non-text contrast requirement.
- Decorative surface differences are not accepted as the only signal of state.
- No expressive colour, project theme, state layer, image overlay or disabled treatment may weaken the universal 7:1 text rule.
- Automated contrast tests cover every documented text foreground/background pair. Browser review verifies actual rendered states, including text over media.

## 9. Shape, surface and material

### 9.1 Shape scale

- Editorial surface: `0px`.
- Functional container: `4px`.
- Status, toggle and compact pill: fully rounded only when the function benefits from it.
- Large generic rounded cards are forbidden.

Shape communicates function. It is not applied uniformly as decoration.

### 9.2 Surface hierarchy

Depth is expressed through surface tone, scale and crop, controlled overlap, state layers, and restrained elevation only when a floating layer must separate from content.

Decorative shadows, glass-card fields, neon glows and gradients used as generic polish are forbidden.

### 9.3 Paper grain

- The procedural monochrome paper grain remains fixed, pointer-inert and request-free.
- Print uses a subtle multiply treatment.
- Screen uses a quieter screen treatment.
- Forced-colour and reduced-transparency environments remove it.
- Grain never reduces text or focus visibility.

## 10. State model

Every interactive component documents and implements all applicable states:

- enabled;
- hover;
- keyboard focus;
- pressed;
- selected or current;
- expanded;
- loading;
- success;
- warning;
- error;
- disabled;
- unavailable;
- reduced motion;
- forced colours;
- offline or failed dependency.

Hover is never the only route to information or action. Focus and selected states do not rely on colour alone. Disabled controls remain legible but are not focusable unless their explanation must be discoverable.

## 11. Motion system

Motion is expressive throughout but controlled, predictable and predefined.

| Role | Range | Use |
| --- | ---: | --- |
| Immediate | 100–160ms | Press, hover acknowledgement and small state changes |
| Interface | 200–320ms | Navigation, controls, cards and compact disclosures |
| Authored spatial | 450–700ms | Page transitions, swatch fan and large compositional changes |

### 11.1 Principles

- Motion explains state, hierarchy, continuity or causality.
- Page transitions are animated and communicate movement between editorial sheets.
- Transitions remain interruptible and never delay navigation or keyboard activation.
- Work cards may change shape and proportion on hover or focus. Crop, colour and typography reinforce the response.
- Pointer velocity and drag force do not alter outcomes. Behaviour remains predictable.
- Transform and opacity are preferred. Layout animation is limited to deliberate authored components.
- No motion depends on cursor position for essential meaning.
- The client marquee and live status are the only permitted continuous loops.
- Continuous motion sleeps offscreen and when the document is hidden.
- Motion does not make reading, navigation or comparison harder.

### 11.2 Reduced motion

- System preference is respected automatically.
- A manual override remains available.
- Reduced motion removes loops, large spatial travel, parallax and shape morphing.
- It preserves colour feedback, visible focus, immediate state changes and content access.
- Reduced motion does not hide the cursor or replace interaction with zero-duration flashes.

## 12. Signature interactions

### 12.1 Hero material response

- The full-screen hero contains the proposition and support line.
- A subtle material response may alter tone, grain density or a bounded surface field.
- It feels native to paper, ink and Ultramarine rather than like a generic WebGL effect.
- It may acknowledge pointer or focus position, but its outcome remains predefined.
- Content remains fully legible without the effect.
- Reduced motion, reduced transparency and low-power modes receive a static hero.

### 12.2 Selected work

- Selected work remains image-led and spacious.
- More than three projects may appear when the composition remains legible and atmospheric.
- Cards may change proportion on hover and keyboard focus.
- Each transformation has an equivalent non-hover route on touch.
- Project title, premise, role and availability remain readable without animation.

### 12.3 Portrait

- The portrait becomes a quiet editorial photograph.
- It uses authored crop, responsive sources and restrained theme treatment.
- Halftone development lenses or other pointer-led reveals are retired unless a later visual checkpoint proves they strengthen the final direction.

### 12.4 Swatch fan

- The visible heading remains `WHAT I DO`.
- Five cards represent five services.
- Expanded layouts present one centred stack that fans across the shared sheet on hover or focus.
- Compact layouts use an accessible scroll-snapped or stacked treatment.
- No hexadecimal values appear on the cards.
- All five services remain readable and reachable without animation.

### 12.5 Client marquee

- Client marks move in one slow continuous loop.
- The loop pauses offscreen, when the document is hidden and under reduced motion.
- Reduced motion presents a wrapped static list.
- Hover does not accelerate the loop.
- Logos have accessible text equivalents and preserve their approved artwork.

### 12.6 Footer signature

- The dot-matrix name is the first and largest footer element.
- Its canonical source is `assets/images/miebaka-joshua-script-name.svg`.
- The source artwork is sampled into an interactive dot matrix; it is not typeset from a font.
- The assembled dots preserve the SVG silhouette and remain inside the shared sheet without clipping.
- Pointer proximity may disperse cells; an interruptible spring returns them.
- Reduced motion retains the assembled signature.
- Footer information follows in the order `BASED IN`, `EXPLORE`, `SOCIAL`.

## 13. Component system

The documentation covers the complete product system. Production implements only components supported by real portfolio requirements.

### 13.1 Required families

- site navigation and bottom navigation;
- Index overlay;
- buttons and editorial text links;
- project cards and work rows;
- service swatches;
- tags and metadata;
- disclosures and accordions;
- form fields and validation;
- tooltips;
- theme and motion controls;
- status and feedback messages;
- dialogs and editorial sheets;
- images, galleries, video and captions;
- case-study chapter navigation;
- pagination and next-project navigation;
- loading, skeleton, empty, error and offline states;
- copy-to-clipboard feedback;
- download links;
- marquees;
- accessibility utilities.

### 13.2 Buttons and links

- Buttons remain visually quiet until interaction while retaining a clear affordance.
- All button labels are uppercase Josefin Sans.
- Primary, secondary, quiet and icon-plus-label actions are distinct roles.
- Editorial links remain links and are never restyled as generic buttons.
- Press, focus, loading, success and disabled states preserve geometry.
- Minimum target size is 44×44 CSS pixels; 48×48 is preferred for bottom navigation and high-frequency touch controls.

### 13.3 Cards

- Card treatment follows content function rather than one universal visual shell.
- Whitespace and crop define editorial project cards.
- Surface tone defines grouped utilities.
- Borders are used only where a boundary is necessary for comprehension.
- A whole card is interactive only when it has one destination.
- Nested interactive targets remain independently operable.

### 13.4 Forms

- Every field has a persistent visible uppercase label.
- Placeholder text is supplementary and never substitutes for a label.
- Required, optional, help, focus, valid, invalid, disabled, submitting, success and failure states are defined.
- Errors identify the field and explain recovery in plain language.
- Submission preserves entered data when the network or service fails.
- Contact submissions are delivered to `miebakakiki@gmail.com` through an approved form service or serverless endpoint.
- The approved delivery architecture is a Vercel serverless endpoint using Resend. Credentials remain server-side and are never exposed to the browser bundle.
- The email address is visible and directly copyable, with accessible confirmation.
- Anti-spam measures must not introduce an inaccessible challenge.

## 14. Case-study system

Professional projects are hosted as complete case studies on the portfolio.

### 14.1 Chapter order

1. Project proposition.
2. Hero media.
3. Role, collaborators, year and deliverables.
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

### 14.2 Evidence rules

- Final work, process, measurable outcomes, precise role and collaborators may be published.
- Rejected directions are never published.
- Process appears inline rather than behind optional disclosures.
- Outcomes are collected and verified project by project.
- Unknown metrics are omitted. They are never estimated for presentation value.
- Team contributions are credited precisely.
- Confidential information is excluded even when it would strengthen the narrative.
- Case-study media remains inside the editorial sheet measure.
- Each case study ends with one next-project transition. Competing contact and related-work panels do not crowd the ending.

### 14.3 Project media

- Media may include final images, guidelines, presentations, production details, packaging photography, motion and video as supplied per project.
- Every media item has dimensions, responsive sources, appropriate loading priority and meaningful alternative text or caption.
- Video never autoplays with sound.
- Motion media supplies a poster and a non-moving equivalent where required.

## 15. Explorations and Community

Both destinations are required for the first complete release. Their initial entries are supplied and approved during route implementation; placeholder projects, invented community activity and empty decorative cards are forbidden.

### 15.1 Explorations

- Entries are curated by idea, not uploaded chronologically without context.
- Each entry states the self-imposed prompt, visual decision and date.
- The section may be visually freer than Work but still consumes the same global tokens and accessibility contracts.
- Experiments must not be mistaken for commissioned client work.

### 15.2 Community

- Each entry identifies the audience, contribution and access method.
- Downloadable resources show format, licence, version and last-updated date.
- Events or workshops distinguish past recordings from upcoming participation.
- Community work is evaluated by usefulness, not decorative engagement metrics.
- Empty launch state uses a purposeful introduction and clear future scope rather than fabricated entries.

## 16. Content language

- Lead with the decision, not process theatre.
- Prefer concrete verbs: define, position, design, direct, produce, deliver.
- Avoid inflated claims, generic agency language and unsupported outcomes.
- Distinguish observation, decision, execution and result.
- Use one register: warm, direct and professionally exact.
- Interface labels are short, uppercase and destination-led.
- No decorative status, weather, release version, fake availability or scroll instruction is published.
- Dates, reading length, roles, collaborators and results are factual.
- `WORK WITH ME` is the canonical contact action.
- `SEE THE WORK` is reserved for portfolio navigation.

## 17. Accessibility and input

- Semantic HTML is the interaction foundation.
- Navigation, content, links, case studies and contact information work without JavaScript.
- Every pointer interaction has a keyboard and touch equivalent.
- Focus order follows the visible reading order.
- Focus is never removed and remains visible in forced-colour mode.
- Interactive targets are at least 44×44 CSS pixels.
- Current page, expanded state, validation and live feedback are programmatically exposed.
- Decorative canvas and texture layers are ignored by assistive technology.
- Images use meaningful alternative text; decorative images use empty alternatives.
- Captions and transcripts accompany meaningful video or audio.
- Zoom to 200% and text spacing overrides do not remove content or actions.
- Layout remains usable at 320 CSS pixels without horizontal page scrolling.
- Labels remain visible when fields contain values.
- Colour, motion and shape never act as the only state signal.
- Accessibility testing includes keyboard-only, screen-reader smoke tests, forced colours, reduced motion, reduced transparency and touch.

## 18. Resilience and progressive enhancement

- Static HTML exposes every primary destination and core page narrative.
- JavaScript enhances navigation, transitions, responsive media and authored interactions.
- Failed JavaScript leaves readable pages, working links and a usable contact path.
- Failed optional services preserve stable geometry and show a truthful fallback.
- Slow connections receive reserved media dimensions and progressive loading.
- Save-Data, low-power and reduced-motion environments receive quieter media and no non-essential continuous work.
- Graceful online failure is required. Full offline application behaviour is not required unless approved later.

### 18.1 CV delivery

- The approved source file is `/Users/mac/Desktop/Career/Miebaka Joshua's Resume.pdf`.
- The production build copies it to a stable, URL-safe public asset name rather than exposing the local source path.
- The public action label is `DOWNLOAD CV`.
- The link identifies the PDF format and download size where it is presented.
- The source PDF is verified before release and replaced only through an explicit content update.

## 19. Performance budgets

Budgets apply to production on a representative mid-range mobile device and constrained connection.

| Measure | Budget |
| --- | ---: |
| Largest Contentful Paint | ≤2.0s target, ≤2.5s hard gate |
| Interaction to Next Paint | ≤150ms target, ≤200ms hard gate |
| Cumulative Layout Shift | ≤0.05 |
| Initial JavaScript, compressed | ≤75KB, excluding route-lazy media players |
| Initial CSS, compressed | ≤45KB |
| Homepage media before interaction | ≤1.5MB |
| Long tasks during ordinary navigation | none above 200ms |
| Idle continuous main-thread work | none |
| Regular-motion animation | 60fps target |

Additional rules:

- Production serves one bundled CSS request and a small ES-module graph.
- Route-specific code and media load only where used.
- Above-the-fold media has dimensions and intentional fetch priority.
- Other media lazy-loads.
- Canvas work sleeps offscreen and when settled.
- No runtime module ships without an import and route-specific purpose.
- Font files are subset where practical and preloaded only when immediately required.

## 20. Browser and platform support

The supported matrix is the latest two stable versions of Chrome, Safari, Firefox and Edge, plus current iOS Safari and current Android Chrome.

The site supports pointer, keyboard and touch input; light and dark operating-system preferences; safe-area insets; modern viewport units with fallbacks; reduced motion; reduced transparency where available; forced colours; increased text size; and browser zoom.

Unsupported enhancement APIs fail silently to the static editorial experience.

## 21. Privacy, security and delivery

- Contact collection is limited to information required to reply.
- The form explains what is submitted and how it is used.
- No advertising trackers are introduced.
- Analytics, if later approved, are privacy-conscious and documented.
- Security headers include a tested Content Security Policy, content-type protection, referrer policy, permissions policy and frame protection.
- External links that open new contexts are marked safely.
- Build output contains only production files and referenced assets.
- Source maps, drafts, unused media and private notes do not ship.

## 22. Implementation checkpoints

The rebuild happens in the current site and current repository. Each checkpoint requires owner approval before the next visual layer becomes authoritative.

1. Revised engineering specification.
2. Information architecture and responsive wireframes.
3. Two visual-system directions to compare.
4. Approved homepage implementation.
5. One complete TEDx RSU flagship case study.
6. Remaining routes, including Explorations and Community.
7. Accessibility, performance and browser QA.
8. Deployment review.

Existing interactions may be removed when they do not survive this system. Every material removal is named and justified before implementation.

## 23. Release gate

Before push or deployment:

1. Run `npm test` and all new specification tests.
2. Build the production `dist/` directory from a clean input state.
3. Inspect Home, Work, Explorations, Community, About, Services, Writing, Contact, Privacy, 404 and every published case study.
4. Inspect compact, medium, expanded and large layouts.
5. Confirm `document.body.scrollWidth === innerWidth` on every production route at required widths.
6. Confirm Print and Screen themes, including project-colour themes.
7. Confirm regular and reduced motion.
8. Confirm keyboard, touch and pointer access to every interaction.
9. Confirm visible focus, forced-colour usability and form error recovery.
10. Confirm no console errors, broken internal links, missing assets or failed font loads.
11. Confirm performance budgets with production assets and a representative mobile profile.
12. Confirm navigation and core content remain usable without JavaScript.
13. Confirm no unverified outcome, testimonial or collaborator credit is published.
14. Confirm only approved production files ship.

Automated tests establish technical health. They do not replace browser and human visual review.

## 24. Approved implementation anchors

1. Every text placement uses a universal 7:1 minimum contrast ratio, with no size, state or inactive-text exception.
2. TEDx RSU is the first complete flagship case study.
3. The approved CV source is `/Users/mac/Desktop/Career/Miebaka Joshua's Resume.pdf`; the public action is `DOWNLOAD CV`.
4. Contact delivery uses a Vercel serverless endpoint with Resend and sends to `miebakakiki@gmail.com`.
5. Explorations and Community both ship as primary destinations. Their real launch entries are defined during implementation, without fabricated placeholder content.
