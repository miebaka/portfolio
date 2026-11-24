> **Approved implementation update, 23 November 2026:** The interactive homepage water and its Three.js bundle were extracted from this portfolio. The hero is now a static dark frame with the approved oversized uppercase name. All earlier GPU, water, ripple and shader requirements in the historical design decisions below are superseded. The existing navigation, Work folders, other site sections and accessibility requirements remain active.

# MIEBAKA JOSHUA — PORTFOLIO DESIGN & EXPERIENCE CONSTITUTION

> **Status:** Authoritative design and interaction contract. The most recent approved decisions below override historical reference proposals.  
> **Version:** 2.3.0 — physically accurate Work folders, dot-matrix footer and cleaned production code  
> **Date:** 22 November 2026  
> **Repository:** <https://github.com/miebaka/portfolio> (changes reviewed in PR #48 before merging to `main`)  
> **Public canonical host:** <https://miebaka-portfolio.vercel.app/>  
> **Scope:** Every public page, template, interactive system, content module, motion effect, and delivery pipeline.  
> **Purpose:** Define *what to build*, *why*, *how it must behave*, *what not to build*, and *how to prove it meets the standard*.

---

## 0. AUTHORITY, READING RULES & NON-NEGOTIABLES

This document is the governing **product, visual, interaction, editorial and acceptance specification** for the Miebaka Joshua portfolio. It consolidates the earlier portfolio codebase review, the seven-chapter homepage references, the motion references, and lessons from the ZeroSlop design-reference library. It supersedes older *visual recommendations* in the repository's previous `DESIGN.md` where they conflict, but **does not silently supersede technical facts, approved branding, content evidence, infrastructure limits or security requirements**.

### 0.1 Order of precedence

When implementation instructions conflict, resolve them in this order:

1. **Security, privacy, accessibility, factual accuracy and working functionality.** These cannot be sacrificed for a reference aesthetic.
2. **This document's explicit decisions and acceptance criteria**, including the Reference Responsibility Map and page contracts.
3. **`engineering-specification.md`** for build architecture, deployment, canonical host, production budgets, server boundaries and security. In a genuine technical contradiction, preserve the safer existing engineering rule and record a change request rather than silently overriding it.
4. **`styles/tokens.css`** for the approved typography roles; `styles/foundations.css` remains authoritative for colour, spacing and motion. This document describes the intended roles and refinements; a proposal is not permission to rewrite the palette.
5. **Content files under `data/`** as the source of facts about projects, experience, clients, case studies and writing. Do not fabricate business outcomes to fill a design layout.
6. **Reference websites and ZeroSlop reference records** as bounded *inspiration*, not as code, licenses, authoritative brand assets or evidence of accessibility.

If this specification lacks enough detail, implement the least surprising accessible and maintainable behavior consistent with its principles, then document the decision. Do not create a parallel design system or invent a more spectacular interpretation.

### 0.2 Normative terminology

- **MUST / MUST NOT**: Release-blocking requirements.
- **SHOULD / SHOULD NOT**: Strong defaults; deviations require an explicit rationale and proof that a better outcome results.
- **MAY**: Optional, only when it adds tangible value without violating another requirement.
- **Target**: A measurable proposed quality goal, not a claim that the present code already meets it.
- **Current state**: Observed in the repository during review, not a certification of the deployed version.
- **Reference lock**: The explicitly approved traits inherited from a reference and the limits on their application.
- **Evidence**: Confirmed project facts, measurable outcomes, approved visuals, real links and user-accessible proof.

### 0.3 The one-sentence brief

**An unmistakably authored, image-led portfolio that turns creative decisions into vivid, editorial experiences—without sacrificing comprehension, access, or proof. The current ultramarine system is a starting point, not an aesthetic ceiling.**

### 0.4 The purpose of the product

A visitor should leave understanding (a) what Miebaka does, (b) why his creative judgment is worth trusting, (c) what he personally contributed to the work, (d) how the work functioned beyond mockups, and (e) how to contact him. The portfolio is **not** a playground masquerading as a résumé, an agency landing-page template, a collection of fashionable web effects, or an unsubstantiated pitch for seniority.

### 0.5 Core principles, in priority order

1. **Proof before spectacle.** An excellent project preview or clear decision explanation outranks decorative motion.
2. **Clarity before cleverness.** The next action and its outcome must always be understandable.
3. **One author, many project worlds.** The portfolio owns navigation, type roles, grid, accessibility and UI behavior; each project may own its imagery and bounded accent palette.
4. **Personal rather than derivative.** Preserve the distinct signature, ultramarine identity, editorial tension and measured expression. Do not combine references into a collage.
5. **Static first, enhanced second.** Essential content, navigation and contact routes must work without JavaScript, WebGL and advanced animation.
6. **Motion communicates hierarchy.** Interaction is responsive, consistent, interruptible and respectful of reduced-motion preferences.
7. **Document decisions, not arbitrary snapshots.** Measured reference values describe observations; they do not automatically become tokens.
8. **Mobile is a first-class composition.** It must show the work, not merely squeeze desktop text into a column.
9. **Commercial usefulness is a design criterion.** The work must be easy for recruiters, creative leaders and clients to assess.
10. **Built is not approved.** Every significant change passes functional, editorial, visual, accessibility and performance review.

### 0.6 Success criteria

Within roughly ten seconds of arrival, a visitor SHOULD be able to identify the designer, specialty and route to selected work. Within a minute, they SHOULD be able to enter a complete case study and understand its role and problem. Every page MUST offer an intelligible path to other work or contact. Site effects MUST NOT delay essential navigation or conceal content.

---

## 1. AUDIENCE, POSITIONING, INFORMATION ARCHITECTURE

### 1.1 Primary audiences

**Hiring managers / recruiters:** Need immediate role clarity, recognizable projects, chronology, portfolio links, contact and confidence that work is complete. Avoid requiring experimentation to discover essentials.

**Creative directors / design leads:** Need to inspect rationale, taste, craft, production fluency, ability to work within constraints, collaboration and the boundary between concept and documented results.

**Potential collaborators / clients:** Need to understand services, types of problems solved, examples, availability wording and a low-friction contact route.

**Design peers / community:** May explore essays, experiments and distinctive interactions, but MUST NOT dictate the primary information hierarchy.

### 1.2 Positioning and voice

The portfolio positions Miebaka Joshua as a **brand, visual and marketing designer who finds the decision beneath a difficult brief and turns it into usable identity and campaign systems**. This is stronger than an unqualified claim to be an art director or chief creative officer. The latter is a career ambition, not a substitute for documented scope.

Writing is first-person when discussing personal work and contribution; simple, concrete, direct and editorial. Favor active verbs. Prefer *what changed because of the design* over adjectives like “innovative”, “visionary” or “world-class”. No invented percentages, revenue claims, awards, client endorsements or adoption outcomes. Where evidence is incomplete, say so explicitly and use the existing **Documented / Bounded** distinction.

Suggested editorial line, subject to factual review: **“I design identities and campaigns that still work after the presentation.”** This can work as a supporting introduction, but MUST NOT appear everywhere as filler.

### 1.3 Information architecture

Maintain the **existing route registry** in `data/navigation.js`:

| Destination | Path | Purpose |
| --- | --- | --- |
| Home | `index.html` or `/` | Introduction, flagship proof, context, services, trust, contact |
| Work | `work.html` | Complete published work index plus honest in-progress register |
| Case studies | `work/{slug}.html` | Detailed project decisions and outcomes |
| About | `about.html` | Biography, thinking, experience, professional evidence |
| Experiments | `experiments.html` | Exploratory visual practice with spatial interaction |
| Essays | `essays.html` | Editorial and professional writing |
| Individual essays | `essays/{slug}.html` | Accessible long-form reading |
| Contact | `contact.html` | Contact routes and functional form |
| Privacy | `privacy.html` | Truthful privacy policy |
| 404 | `404.html` | Recovery to useful destinations |

`community.html` is a legacy route, not another public chapter. Preserve redirects and canonical behavior. The logo routes home. Navigation labels remain **Work, About, Experiments, Essays, Contact** as supported by the canonical route registry; alternate order in a visual menu MUST derive from the same data.

### 1.4 Home chapter: exact seven-section order

The homepage MUST contain exactly the following **primary narrative chapters**, in this order. Nested visual subsections are allowed; inserting new independent marketing sections between them requires approval.

1. **Landing Page** — introduction and first impression.
2. **Selected Work** — three completed flagship cases with high-quality visual evidence.
3. **About Me** — personal context and working philosophy.
4. **What I Do** — concrete services supported by examples.
5. **Brands I Have Worked With** — accurately labeled relationship proof.
6. **CTA** — meaningful contact invitation.
7. **Footer** — navigation, socials and existing interactive dot-matrix signature.

The structure is already present in `index.html`; redesign in place rather than creating a new framework or unnecessary route.

---

## 2. REFERENCE RESPONSIBILITY MAP (LOCKED)

A reference owns only the specific design function listed below. The site MUST NOT copy an entire reference, reproduce proprietary assets, or import its undocumented code or brand typography. All visual decisions must trace to this map, a confirmed portfolio requirement or a recorded exception.

| Source | Assigned ownership | Keep | Do not copy |
| --- | --- | --- | --- |
| [Artiom Yakushev](https://www.art-yakushev.com/) | Home hero composition | Bold typographic presence, authored spacing, deliberate editorial positioning | Identity, illustrations, copy, exact layout |
| [Integrated Biosciences](https://integratedbio.com/) | Hero opening | Rounded panel that expands into the final hero state | Entire visual system or complex animation dependencies |
| [Bulletproof](https://www.wearebulletproof.com/) | Selected Work | Large navigable project menu with visual content and kinetic states | Brand, projects or interaction that hides necessary information |
| [Seun Badejo — About](https://seun.design/about/) | About and CTA | Quiet editorial biography, spacing, direct contact invitation | Personal biography, portrait, exact typographic composition |
| [White Desert](https://white-desert.com/) | What I Do | Image-led cards, immersive but readable sequencing | Antarctic visual language, travel clichés, proprietary photos |
| [Beskar Labs Logo Marquee](https://dribbble.com/shots/21846626-Beskar-Labs-Logo-Marquee) | Client logo strip | Consistent optical logo sizes, continuous scrolling rhythm | Logos not actually connected to the portfolio |
| Current portfolio | Footer | Authored name-shaped interactive dot matrix | Replacing signature with generic canvas decoration |
| [Jasmine Gunarto](https://jasminegunarto.com/) | Global motion direction | Coordinated typographic reveals, image wipes and responsive transitions | Universal animation or effects that impede reading |
| [Sasha Martynchuk on ZeroSlop](https://www.zeroslop.design/library/sashamartynchuk-com) | Work presentation craft | Strong display/body contrast, visible project work | His fonts and images |
| [Remedy on ZeroSlop](https://www.zeroslop.design/library/remedyeditorial-com) | Editorial clarity | Readable prose, quiet framing and section pacing | All-white rebrand |
| [Everwonder Studio on ZeroSlop](https://www.zeroslop.design/library/everwonder-studio) | Project art direction | Purposeful large photography and image/type contrast | Unrelated imagery or copied identity |
| [Studio Modular on ZeroSlop](https://www.zeroslop.design/library/studiomodular-be) | Brand coherence | A small repeated graphic vocabulary | Their cream/green/blue palette |
| [Depth on ZeroSlop](https://www.zeroslop.design/library/depth-fyi) | Experiments/spatial craft | Meaningful 3D interaction, grid discipline | 3D scenes on every page |
| [Arturo Spatino on ZeroSlop](https://www.zeroslop.design/library/arturospatino-com) | About/utility craft | Restrained personal-portfolio information hierarchy | Replacing existing brand identity |
| [Khanh Nguyen on ZeroSlop](https://www.zeroslop.design/library/khanhnguyen-design) | Editorial detail | Expressive scale with readable supporting typography | Mixed-font novelty for its own sake |
| ZeroSlop DESIGN.md methodology | Governance | Document roles, decision ledger, responsive and state verification | Assuming computed-style captures certify accessibility or intent |

### 2.1 Reference confidence and evidence discipline

The ZeroSlop library records computed values and sampled DOM elements. Many records explicitly state that semantic role assignment, interaction states, keyboard behavior, alternate pages and accessibility remain *draft / unverified*. Consequently:

- Captured values are **observations**, not mandatory numeric tokens.
- A screenshot does not demonstrate hover, keyboard behavior, reduced-motion support or performance.
- The reference's font name does not imply permission to redistribute that font.
- Visual imitation is not an acceptable shortcut around the portfolio's accessibility and factual standards.
- Before implementation, record a short **reference lock** for any new pattern: source, intended role, traits, rejected traits, media strategy, responsive behavior, verification state.

### 2.2 Anti-collage rule

The governing visual identity is the **evolving authored editorial system defined by the 2026 research direction below**. Existing ultramarine tokens are working production values, not a prohibition on stronger, tested alternatives. External references borrow a narrow interaction or composition, never replace that system. Do not average colors, typefaces, radii and shadows from multiple sites. Do not inject a serif word into a headline merely to appear editorial. Do not make every section a different showcase of CSS tricks.


### 2.2a Four-library refinement lock (20 November 2026)

The following references extend **The Living Editorial**, not the global brand. No framework migration or licensed reference asset copying is authorised.

| Source | Adopted feature | Rejected | Responsive and verification requirement |
| --- | --- | --- | --- |
| [Unsection](https://www.unsection.com/) | Clearer image-first Work media and deliberate case-study spacing | SaaS cards or new homepage chapters | One-cover previews occupy their full space; images remain visible on touch |
| [Spell](https://spell.sh/docs/components) | Existing staggered text entrances with Overused Grotesk display, Overused Grotesk body, Overused Grotesk labels | Competing React animations or multiple effects per heading | Semantic first paint and reduced-motion state remain readable |
| [Details](https://www.details.so/inspo) | Refinement of selected-work list and distinct case-study image rhythm | Hidden-on-touch previews or mandatory transitions | Keyboard, touch and static fallbacks preserve the work |
| [Curated](https://curated.design/) | An authored editorial hierarchy across all templates | Importing unrelated palettes, images or typography | True evidence and readable image captions remain primary |

Initial delivery: repair display-type contract drift, show Work images at all widths, fill single-cover frames, vary case-gallery composition and fix nested 404 recovery URLs. Sound and paid interaction libraries remain out of scope.

### 2.3 Expanded research — ZeroSlop, Awwwards and Refero access status (19 November 2026)

This expanded research layer **supersedes any earlier instruction that forbids a fundamental visual redesign**. The original seven-section Home references remain binding *interaction assignments*, but the rest of the website may be redesigned decisively. Distinguish a cited observed pattern from a reviewed/approved implementation. Links below are primary reference landing pages, not licenses to reuse their assets.

**Research provenance:** ZeroSlop's library was enumerated and multiple individual draft `DESIGN.md` capture records inspected. Awwwards' Portfolio, Typography and Interaction Design categories and the listed individual showcase pages were reviewed. A live Refero design-style search was attempted and returned `NO_SUBSCRIPTION`; **no Refero search result, screenshot, style UUID, or inferred detail is represented as verified**. Once Refero access is active, perform its mandatory styles → sections/screens → full-style review workflow and record real UUIDs and roles in this ledger before acting on them.

| Source | URL | Observed contribution | Portfolio assignment | Explicit rejection |
| --- | --- | --- | --- | --- |
| Eugene Sokolovski (ZeroSlop) | https://www.zeroslop.design/library/sokolovski-pro | Dense tiny navigation and clean portfolio project-grid logic on white | Work index density, disciplined project meta and archive | Tiny labels without adequate reading contrast |
| Cruz Estudio (ZeroSlop) | https://www.zeroslop.design/library/cruzestudio-com-ar | Cream/dark studio framing, compact bold sans, wireframe-3D emphasis | Controlled dimensional motif for hero and project-specific media | Unnecessary 3D ornament across every route |
| Revelatio Studio (ZeroSlop) | https://www.zeroslop.design/library/revelatio-studio | Dark brand-studio page with pixelated moving imagery and direct statement | Distinctive media treatment for editorial opening and experiment transitions | Always-on high-cost video or unreadable text over it |
| Research Design Agency (ZeroSlop) | https://www.zeroslop.design/library/researchdesignagency-com | Architectural photography with concise typographic statement | Work photography scale, large negative-space composition | Generic monochrome agency imitation |
| Ohh My Design (ZeroSlop) | https://www.zeroslop.design/library/ohhmydesign-com | Condensed display and unmistakable graphic world | Characterful display-scale exploration, expressive typographic rhythm | Decorative patterned letters impairing reading |
| Artem Shcherbakov (ZeroSlop) | https://www.zeroslop.design/library/artemartemartem-com | Director portfolio with white background, hand-drawn accent | Personal authored touches in Experiments or About only | Imported green sketch motif as default global decoration |
| Ricardo Chance (ZeroSlop) | https://www.zeroslop.design/library/ricardochance-com | Dramatic serif/3D star contrast on deep purple | Evaluate rare unexpected typographic contrast in personal essays | A second unrelated 3D object or purple rebrand |
| For Living (ZeroSlop) | https://www.zeroslop.design/library/for-living-it | Editorial materiality and considered interior imagery | About portrait art direction and image cropping discipline | Artificial warm beige everywhere |
| Sasha Martynchuk (ZeroSlop) | https://www.zeroslop.design/library/sashamartynchuk-com | Heavy condensed headings against content-rich project imagery | Featured project hierarchy and strong visual work walls | Fonts/images and a product-only design identity |
| Remedy Editorial (ZeroSlop) | https://www.zeroslop.design/library/remedyeditorial-com | Restrained type and readable black/white work sections | Essays and case-study explanatory prose | Flat minimalism across all chapters |
| Everwonder Studio (ZeroSlop) | https://www.zeroslop.design/library/everwonder-studio | Assertive condensed headings with culture-led photography | Hero/art direction and flagship project imagery | Stock action photography and incoherent loudness |
| White Desert (ZeroSlop) | https://www.zeroslop.design/library/white-desert-com | Image-led section progression and tall display | What I Do capabilities and section pacing | Copying hospitality content or images |
| Carter Ogunsola (Awwwards SOTD, 19 Nov 2026) | https://www.awwwards.com/sites/carter-ogunsola | Listed home project wheel, theme flip, studio-pass/lab-grid interactions and About telemetry | Secondary study for Work discovery, theme transitions and Experiments | Adding a wheel solely for spectacle or substituting portfolio proof with games |
| PSP Production (Awwwards SOTD, 18 Nov 2026) | https://www.awwwards.com/sites/psp-production | Listed distinct work/gallery, hero, contact and film/video treatments | Large project media and transitions between editorial sections | Full-screen preload and mandatory autoplay |
| Voy Design (Awwwards nominee, 17 Nov 2026) | https://www.awwwards.com/sites/voy-design | Interactive principles, infinite canvas, draggable cards, progressive bento | Experiments exploratory field and interactive design-principles presentation | Infinite canvas as the only path to essential information |
| Adrien Quéchon 2026 (Awwwards nominee, 19 Nov 2026) | https://www.awwwards.com/sites/adrien-quechon-2026-website | Listed selected work, page transitions, light/dark treatment, distinct footer | Nav, theme choreography and refined cross-page motion | Locking users into transitions or duplicating footer signature |
| Louise Jongen (Awwwards nominee, 16 Nov 2026) | https://www.awwwards.com/sites/louise-jongen | VHS-inspired hero, scrolling profile, horizontal case-study and transition study | Art-directed occasional multimedia / project storytelling | VHS styling or horizontal scroll across every case |
| mowa.studio (Awwwards nominee, 17 Nov 2026) | https://www.awwwards.com/sites/mowa-studio | Branding practice combined with interactive 3D craft | A standard for coherent brand + technical experimentation | React/Three.js migration as an aesthetic shortcut |

**Reference filter:** favor distinctive creative leadership, art direction, mature typography, documentary evidence, excellent project imagery, technical imagination, and African creative specificity. Awwwards nomination is a discovery cue, **not proof** of inclusive UX, coding quality or actual user outcomes. ZeroSlop values are sampled computed styles, not approved semantic tokens. Each adopted behavior requires direct capture, interaction testing and a provenance note before final implementation.

### 2.4 Reference authority — one conceptual direction, several tightly bounded mechanisms

The prior references still own specific Home section interactions. The new research identifies **cross-page quality standards**. Use a single narrative language, not one full brand palette per website:

- **Primary art direction:** a striking, graphic/editorial creative practice. High contrast, large typography, work that feels authored as objects, and deliberately varied project worlds.
- **Primary work behavior:** Bulletproof-inspired typographic index on Home; Sasha/Eugene/PSP-informed confident full-media presentation in Work and case studies.
- **Primary motion:** Jasmine for rhythm, Adrien for route/theme transition craft, and static/reduced-motion equivalence for all functional content.
- **Primary experiment behavior:** Voy and Depth as *research evidence* for spatial interaction, keeping a complete keyboard-accessible discovery path.
- **Primary biographies/CTAs:** Seun for honest, calm language and Arturo/Remedy for hierarchy; image personality from original photography, not reference-stock content.
- **Primary governance:** ZeroSlop-style measurements and design-drift logs, with live interactions checked separately.

### 2.5 Three visual directions evaluated; one chosen

**A — Muted editorial restraint:** neutral canvas, modest type, small projects, understated interactions. Rejected as the primary direction: too easy to confuse with other portfolios and insufficiently expressive for a brand/marketing designer.

**B — 3D experimental playground:** dark immersive canvas, 3D navigation and highly animated work browsing. Rejected as the primary direction: slows hiring evaluation and risks hiding the work behind the interface.

**C — THE LIVING EDITORIAL (selected):** a confident typographic identity combined with ambitious, fully art-directed project imagery, cinematic *yet short* transitions, distinctive personal visual signatures, and plainspoken evidence. Projects are allowed different worlds; navigation and reading remain stable. The experience communicates **taste + judgment + production ability**, not just technical fireworks.

Visual metaphor: **a living portfolio of decisions**. Treat each project as an authored editorial feature: a compelling cover, a short decision statement, large evidence plates and captions, and a decisive conclusion. Do not literalize this as notebook stickers, cartographic icons, paper texture everywhere or fake scientific labels. Graphic discipline must feel lived-in, not templated.

### 2.6 Dramatic visual improvement — mandatory reinterpretation

The new direction is **not** a facelift or continuation of the current visual proportions. Implement a controlled *generational leap*:

1. **Hero:** strong name mark + kinetic scale choreography + one exceptional image/physical art-directed element (or the existing shader only if it withstands a direct visual comparison); no bland uniform gradient.
2. **Work:** shift from a hidden-hover list to fully visual storytelling at every breakpoint. Project images must deserve attention—large composition, non-generic art direction and meaningful titles.
3. **Case studies:** open with a strong media-led title spread and specific governing creative decision; alternate genuinely full-bleed imagery and precise evidence/text. Avoid repetitive blocks of images and generic 50/50 splits.
4. **About:** commission/curate a memorable portrait sequence or existing original environmental imagery; never lead with a stock-looking headshot and resume prose.
5. **Experiments:** become the experimental signature of the practice, with multiple entry paths: spatial exploration, simple accessible list/index, and distinctive individual artwork presentation.
6. **Essays:** serious editorial typesetting, better typescale, generous margins, side annotations only when they carry information, graceful reading-progress/contents behavior.
7. **Contact/footer:** a final memorable typographic close, with real contact conversion and a repaired dot-matrix signature—not another random animation.
8. **Global chrome:** navigation has quiet precision; visual ambition is deliberately concentrated in authored work, not in every button or divider.

**Image first:** For each flagship project, select one *excellent* cover image and 4–8 high-quality evidence frames with intentional crop, consistent visual logic and role-accurate captions. If assets are insufficient, surface the limitation rather than creating generic placeholders or overstating deliverables. Show the work's materiality—scale, print, real context, tactile depth—when supported by genuine files.

**Typography is governed by the unified Overused Grotesk system:** Overused Grotesk carries headings, body and labels, and `styles/tokens.css` is the only source of all typography-related CSS declarations. The contract is in [`docs/TYPOGRAPHY-SYSTEM.md`](docs/TYPOGRAPHY-SYSTEM.md). Evaluating another family is a separate, deliberate project: compare actual hero, work, About and essay screenshots at 320/390/768/1440px, verify licensing and font availability before installing or redistributing anything, then update the tokens, the docs and the contract tests in the same pull request.

**Color is open to change:** Retain an identifiable ultramarine signal **only if** it still performs best after comparative visual studies. Author up to three *complete* palette directions with real source imagery, test both Print/Screen states, contrast and project world transitions, then record the chosen semantic palette in `styles/foundations.css`. Never let references turn the system into a beige/olive/terracotta average.

**Page rhythm:** Alternate dense and quiet with purpose. Aim for an unmistakable impact moment at arrival, high-confidence proof at Work, an emotional human pause in About, a discoverable but expressive capability chapter, then a strong CTA. Subsequent pages must feel like members of the same publication, not unrelated theme demos.

**Implementation lock:** No whole-site visual redesign is accepted from CSS token changes alone. Before sign-off, provide actual before/after screenshots of every key template, accessibility/performance measurements, and a review of whether project imagery, typography, work hierarchy and motion *visibly* improved. "Awwwards-like" is not an acceptance criterion; observable craft is.


---

## 3. DESIGN SYSTEM — GLOBAL FOUNDATIONS

### 3.1 Color roles and existing palette

The portfolio already ships a layered color-token system in `styles/foundations.css`. **Preserve the semantic-token architecture, not necessarily today's palette. A coherent, research-backed new palette is authorized if tested across light/dark surfaces, cases, forms, and focus states.** Existing architecture: OKLCH `--ref-*` values → semantic `--sys-color-*` values → short aliases such as `--paper`, `--ink`, `--muted`, `--line`, `--accent` → component roles. **Preserve this architecture.** No hard-coded new hex values in component/page CSS. All colors must reference semantic roles or bounded project-specific tokens.

Base source colors currently include:

| Role | Existing token | Existing raw value | Contract |
| --- | --- | --- | --- |
| Primary identity | `--ref-ultramarine` | `#002080` | Portfolio identity and selected deliberate emphasis |
| Dark dramatic surface | `--ref-midnight` | `#07112B` | Hero, dark surfaces, dark-mode framing |
| Light paper | `--ref-paper` | `#F8F9FC` | Light base and reading spaces |
| Light blue surface | `--ref-air` | `#E8EEFF` | Restrained secondary surface / subtle emphasis |
| Dark-mode light blue | `--ref-blue-80` | `#B1C5FF` | Accessible inverse identity roles where token mapping requires |
| Interaction accent | `--ref-coral-75` | `#FFA08F` | Select interactive emphasis on dark surfaces |
| Neutral near-black | `--ref-near-black` | `#111111` | Bounded neutral use |

**These are confirmed existing values, not a mandate to keep the visual identity unchanged.** Match current token definitions before editing. Project brand colors (Rivo blue, ChopBox warm palette, TEDx purple) MAY appear **within project evidence, case-study imagery, and bounded project-highlight states**, not in global navigation or unrelated cards.

#### Color operating rules

1. One background role per reading surface; avoid random alternating section colors.
2. Use one dominant light surface for editorial sections and a dark framed hero; use dark thematic sections only for explicit narrative reasons.
3. Hairline rules and generous whitespace replace gratuitous shadows.
4. Hover and keyboard focus MUST be perceivable in both themes; never depend solely on subtle color changes.
5. On project hover, a tinted background MUST preserve foreground contrast and MUST NOT cover a photograph such that text becomes illegible.
6. The existing Print/Screen preference is respected across all pages, including cases, essays, menus and footer.
7. Source-brand logos may retain their originals when brand recognition depends on color; monochrome treatments must not destroy recognizability.

### 3.2 Typography — Overused Grotesk (production contract)

**Binding specification:** [docs/TYPOGRAPHY-SYSTEM.md](docs/TYPOGRAPHY-SYSTEM.md). **Values:** `styles/tokens.css`. This formally approved migration supersedes earlier font trials and the typography ownership rules in `styles/foundations.css`.

| Role | Font | Weight | Source |
| --- | --- | --- | --- |
| Home hero and main page headings | Overused Grotesk | 400 / 600 | `--type-heading-lg` (48px maximum) |
| Section, card and article headings | Overused Grotesk | 400 / 600 | `--type-heading-sm`, `--type-heading-md`, `--type-heading-lg` |
| Body, narrative and essays | Overused Grotesk | 400 / 600 | `--type-body`, `--type-body-lg`, `--type-lead` |
| Navigation, metadata and short UI labels | Overused Grotesk | 400 / 600 | `--type-label`, `--type-caption` |

Material Symbols is an **icon font only**, not a text family. **Every typography declaration** (font face, family, size, weight, leading, tracking, text wrapping, text decoration, uppercase transformation and responsive typography) belongs in `styles/tokens.css`. All other CSS files contain layout, appearance and behaviour only. The single text family are `--font-sans` and `--font-mono`; 400/600 are the only supported static weights. The homepage name and other major headings use the restrained, shared 48px maximum headline role. Separate oversized display and hero size tiers are retired. Do not reintroduce `--display`, `--body`, `--label`, `--signature` or the retired size aliases.

**Accessibility remains mandatory:** exactly one semantic visible h1 per page; strong type hierarchy; accurate case on project names; authored casing for UI labels and paragraphs; short-line compressed display only; legible reading at 320px and 200% zoom; and proper fallback during font swap. Long-form copy SHOULD measure roughly 55–75 characters per line and use comfortable `--type-leading-reading`.

Stylelint rule `portfolio/typography-tokens`, `npm run test:typography` and the GitHub Actions Quality job are the release gate. Add a named token in the authoritative file if a new editorial role is genuinely necessary. Do not suppress lint as a workaround.

### 3.3 Grid, widths and spacing

The binding four-system sizing contract is [`docs/SIZING-SYSTEM.md`](docs/SIZING-SYSTEM.md). Typography lives only in `styles/tokens.css`; spacing in `styles/foundations.css`; containers and grids use the same `--page`, `--content` and `--grid-gap` foundation tokens through `styles/layout.css`; responsive breakpoints are enforced by `scripts/stylelint-sizing.mjs`. The mobile editorial grid starts with four columns, expands to eight at `48em` and twelve at `62em`. The standard `.grid` grows from four to twelve at `48em`.

- At wide screens, content aligns with the shared max-width and grid edges.
- Full-bleed or frame-bleed sections express their geometry with the canonical layout variables; they do not introduce another container scale.
- Use the same section-heading rhythm and baseline alignment across Home, About, Work and Essays.
- Preserve strong negative space, but do not use excessive blank space when it buries a CTA or makes important content difficult to reach.
- The layout must work at **320, 360, 390, 430, 768, 1024, 1280, 1440, 1800 and 1920 CSS pixels**, with additional dynamic checks between breakpoints.
- Section heights MUST be content-aware. Avoid forcing minimum heights that create clipping on small screens or short landscape viewports.
- `100svh` is preferable to unstable viewport assumptions for framed mobile hero behavior, with safe-area support.
- Mobile uses deliberate stacking/recomposition, not one-column leftovers from desktop.

Responsive viewport queries MUST use exactly the five approved thresholds. Any new query width fails CI:

| Approved boundary | Required behavior |
| --- | --- |
| Below `24em` | Compact controls and readable Work folders |
| `24em`–`39.999em` | Phone-first single-column content with comfortable margins |
| `40em`–`55.999em` | Natural mobile reading order; no forced sticky cards |
| `56em`–`71.999em` | Tablet composition and eight-track editorial grid |
| `72em`–`87.999em` | Twelve-column editorial layout, wider index and evidence |
| From `88em` | Wide-screen refinements within the same `86em` maximum container |

### 3.4 Radius, surfaces, strokes, shadows

- Rounded corners are a **hero framing device and selected media treatment**, not a universal card ornament.
- Hero outer radius: target `clamp(1.25rem, 2.5vw, 2.75rem)` based on current stylesheet; adjust only after visual QA.
- Supporting image containers may use small purposeful radii; editorial rules and sharp corners should dominate text controls and lists.
- Hairlines use the semantic `--line` role.
- Shadows are rare, reserved for true layering or functional elevation; do not add generic soft shadows to every component.
- Iconography must be coherent in stroke, size and direction. Prefer minimal arrows and useful indicators over decorative icon grids.

### 3.5 Visual motifs — an invariant system

Recognizable authored elements are: the ultramarine signal, generous editorial grid, asymmetric use of typography, slender dividing rules, honest project imagery and the existing name-shaped dot matrix. Reuse these carefully. Do not add unrelated squiggles, blobs, pseudo-3D floating objects, mismatched cursors, fake noise, arbitrary gradients, or generic AI-generated editorial decor.

---

## 4. HOME — EXACT SECTION CONTRACTS

### 4.1 HOME / SECTION 01 — LANDING PAGE

**Owner:** `index.html` (`.home-landing`), `styles/home.css`, `js/core/hero-wave.js`, `js/hero-wave-island.js`, generated shader assets.  
**Reference lock:** Artiom Yakushev for editorial name scale and positioning; Integrated Biosciences for rounded-panel opening.  
**Purpose:** Present identity and profession, establish craft, point clearly to Selected Work.

#### Required content

- One `h1` with the designer's correct public name: **Miebaka Joshua**.
- One concise proposition that states practice and value, not a vague poetic slogan.
- Location: Lagos, Nigeria; broader availability only if accurate.
- Current profession/role only if factually current; do not turn employer name into a fake client endorsement.
- Clear in-page anchor to `#selected-work`.
- Persistent usable header/navigation outside or above the hero as designed.

#### Visual composition

The opening frame is a visually distinct, dark rounded rectangle floating inside the paper surface. The panel expands into its final near-full-width frame while retaining purposeful margins. The name dominates the composition; the positioning line and meta information remain secondary but clearly legible. The shader is a subtle, authored atmospheric layer behind text, never a foreground image competing for attention. The visual should feel crafted rather than like a generic startup hero.

#### Interaction sequence — precise intended states

1. **SSR/no-JS baseline:** Final-size hero is visible, readable, navigable. No content starts hidden pending JavaScript.
2. **Initial enhanced state:** Rounded panel begins at an approximately 0.72 visual scale (tune 0.68–0.78 after screenshot review); geometry centered inside the available viewport. This is a visual effect, not a change to semantic content or focus order.
3. **Frame expansion:** Animate transform and opacity where possible, target **900–1200ms** using a smooth `cubic-bezier(0.16, 1, 0.3, 1)`-type curve. Preserve a stable final inset and radius; avoid needless simultaneous `clip-path` work if transform-only yields the same perceived result.
4. **Typography reveal:** Reveal name and supporting text in a restrained sequence, typically **60–100ms** per visual unit, with no blocked interaction.
5. **Shader entrance:** Shader should become apparent only once an accessible readable hero already exists. Shader startup MUST NOT hold the text, navigation or first content paint hostage.
6. **Settled state:** All transforms are at rest; no continuing forced-scale motion. Scroll to Selected Work follows ordinary anchor behavior.
7. **Repeat visits:** A stored/session-based shortened intro MAY be introduced, but MUST be privacy-safe, optional and tested. Do not add persistence just to be clever.

#### Hero motion requirements

- The hero animation MUST be skippable in effect by interacting or scrolling; do not lock body scroll for a ceremonial opening.
- On reduced motion, **no large-scale expansion**. Show the final panel immediately, with no delay in text visibility.
- On small devices, prefer a shorter/subtler opacity transition or static final state; avoid shrinking text under tight viewports.
- If WebGL fails, a static dark paper-compatible background remains; errors in shader module must not prevent other sections rendering.
- Respect `data-motion` (`reduced` / `full`) and media-level `prefers-reduced-motion`, including live preference changes.
- Shader pointer response is subtle and capped; disable where pointer interaction is imprecise or performance is poor.
- Use stable viewport coordinates and ResizeObserver/resize handling appropriately. No visible tearing or huge GPU spikes.

#### Acceptance tests

- Correct static hero appears with JS disabled and while shader bundle fails.
- 320px and 390px layouts do not clip the name, metadata or CTA.
- Hero `h1` is not masked, occluded by shader, or clipped by over-tight line height.
- Reduced-motion hero has immediate final geometry.
- No unexpected horizontal scrollbar, layout shift or text flash during frame animation.
- Opening does not prevent keyboard use or scrolling.
- Shader initializes lazily and observes shipped performance budgets.

#### Current-state correction

`styles/home.css` already defines `.home-landing` and `@keyframes frame-in` from `scale(.64)` to `scale(1)` while changing radius and `clip-path`. Improve this existing effect rather than duplicating it with a second animation controller. Evaluate the animation before deciding whether an imperative sequence is needed. Use **one source of truth** for entry behavior.

### 4.2 HOME / SECTION 02 — SELECTED WORK

**Owner:** `js/render/projects.js`, `data/projects.js`, `data/case-studies.js`, `styles/home.css`, `js/render/editorial-index.js`.  
**Reference lock:** Bulletproof for large, kinetic work-menu styling; Sasha Martynchuk for visible visual evidence and type contrast.  
**Purpose:** Make three complete flagship cases impossible to miss and easy to open.

#### Content contract

- Exactly three **complete, published, linked** flagship cases by default; current set: **TEDx Rivers State University**, **Rivo Studio**, **ChopBox**. This editorial selection is intentional, not the same as showing all projects.
- Each item MUST show a large project title and a reliable project destination. Category and year remain in the accessible link name and full case study, but not as redundant visual micro-labels in the Home index.
- Each item MUST have a real corresponding image from `assets/images/optimized/`, not a decorative generic asset.
- Every destination must provide case-study evidence; no broken or empty routes.
- Place one visually substantial **All Work** button centered horizontally beneath the full flagship list. No tiny corner CTA or additional per-row arrow controls.
- Feature selection MUST derive from `data/projects.js` plus published case availability, using explicit `featuredOrder` or equivalent editorial field. Do not hard-code slug order inside the renderer. Validate uniqueness and publication state.

#### Visual behavior

Desktop uses a light neutral canvas, truly oversized, centered project headlines, and one substantial real project image positioned centrally behind the active title. The second featured project provides the resting image; hovering or focusing any row changes the visible artwork without moving or expanding the list. Inactive headings use a muted but readable grey. Do not render a visible section eyebrow, row numbers, category/year stamps, circular arrow buttons, floating capsules or redundant image thumbnails. Each entire row is the project link, with a clear keyboard focus indicator. The image remains close to the typographic composition rather than sitting as a small detached thumbnail.

**Critical mobile rule:** Project imagery remains **visible in the default mobile state**. Hover-only visual proof is unacceptable. Use stacked rows with compact but strong media or a split thumbnail composition that survives touch. Never set primary visual proof to `display:none` merely because the viewport is narrow.

#### Interaction states

- **Default:** Three oversized titles, a visible centrally positioned real project image, and a single centered All Work CTA. Category and year are available to screen readers via the link name.
- **Hover (fine pointer only):** Activate that project's centered image and darker title. No falling tags, row expansion, extra icons, overlapping interface controls or content jump.
- **Keyboard focus:** Same image/title emphasis as hover, with a **visible focus ring** and a direct Enter-to-open link.
- **Touch:** Single tap opens the project. Do not require first tap to “activate preview.”
- **Pending/unpublished:** Must be non-clickable and explicitly marked *In progress* in the Work archive; never masquerade as a link or compete with the three complete flagship pieces.
- **Reduced motion:** Image and title changes are immediate; never remove the image's centering transform. All case links remain accessible.

#### Proposed data contract (illustrative; adapt validators)

```js
{
  slug: "rivo",
  title: "Rivo Studio",
  category: "Software studio",
  year: "2024",
  status: "published",
  featured: true,
  featuredOrder: 2,
  cover: "rivo-in-use"
}
```

Before rendering, filter for valid published entries with complete case-study records, sort by `featuredOrder`, and explicitly fail content validation if a featured entry is missing its page, image or required metadata. Do not silently render an empty href.

#### Acceptance tests

- Exactly three intended published entries appear in expected order.
- Their links resolve to correct case studies.
- Source data—not a hard-coded slug array—controls selection and order.
- Media is present at desktop and 320/390/430px mobile.
- Hover/focus/touch are equivalent in access to information, not necessarily identical in animation.
- Title wrapping is deliberately composed at all breakpoints, with visual metadata and arrow clutter removed.
- Project colors never reduce text contrast below required thresholds.

### 4.3 HOME / SECTION 03 — ABOUT ME

**Owner:** `index.html` `.home-profile`, `styles/home.css`; deeper detail in `about.html`.  
**Reference lock:** Seun Badejo's About page for restraint, editorial portrait/text balance and human presence.  
**Purpose:** Humanize the work without repeating the entire résumé.

#### Required content and order

1. Short personal heading, e.g. **“Hi, I’m Miebaka.”**
2. One powerful working-philosophy line, ideally grounded in real design behavior.
3. One concise statement of current role and field, accuracy-checked.
4. One paragraph that establishes leadership/mentoring or systems thinking, only where truthful.
5. **More about me** link to the full About route.
6. Authentic portrait with descriptive alt text and responsive sources.

#### Composition

Asymmetrical split between photograph and editorial text; visual rhythm from negative space, not arbitrary ornamental flourishes. The photo should feel like a deliberately selected portrait, with careful crop and tone. On mobile, the portrait and copy must form a strong sequence, not a detached large photo followed by tiny text.

#### Rules

- Do not overstate years of experience or role seniority; factual updates belong in `data/site-config.js` and approved HTML content.
- Do not add a giant technology/tool badge list here.
- Avoid a long biography on Home; the dedicated About page handles chronology and depth.
- Preserve a visible link to full biography and professional evidence.
- Do not make portrait animation more prominent than the text.

#### Acceptance tests

Portrait loads with appropriate sizes, has no layout shift, and does not bury the first meaningful paragraph on phone screens. The reading order is coherent. Text remains editable independently of imagery. The link works without JS.

### 4.4 HOME / SECTION 04 — WHAT I DO

**Owner:** `data/services.js`, `js/render/sections.js`, `styles/home.css`, `about.html` where capabilities are reused.  
**Reference lock:** White Desert *Our Trips* for immersive, image-led, distinct choice cards.  
**Purpose:** Help visitors recognize which kinds of problems Miebaka can solve and verify claims via examples.

#### Service taxonomy

**Implementation:** `data/services.js` now uses five plain-language discipline titles with published case-study chapter URLs and explicit proof labels. Process explanations remain supporting copy. Keep those titles and source-of-proof links synchronized across Home, About, and the non-JavaScript fallback; verify their evidence on every release.

Proposed categories, subject to accurately matching demonstrated services:

1. **Brand Identity & Systems** — strategy translation, visual identity, guidelines, rollout; linked to Rivo/ChopBox evidence.
2. **Art Direction** — defining and directing cohesive visual worlds and production decisions; linked to documented work.
3. **Campaign & Marketing Design** — channel-specific systems and launch/campaign craft; use published, permission-cleared work as proof.
4. **Editorial & Graphic Design** — information, typography, print, posters and culture-facing design; use relevant visible pieces.
5. **Design Systems & Production** — repeatable workflows, application rules, packaging, handoff and production reliability.

If one category lacks convincing public evidence, omit or relabel it rather than creating a beautifully styled unsupported claim.

#### Card anatomy

Every card contains: category number, primary service title, one-sentence value proposition, relevant project photograph/image, clearly labeled evidence link and a visible directional cue. Maintain strong legibility with a controlled gradient overlay if text sits on imagery; gradient MUST be tuned per image if generic overlay is insufficient.

#### Layout and interaction

- Desktop: horizontal, scrollable card sequence MAY be used; each card should have sufficient visual width and tall media treatment.
- Provide **visible directional controls and discoverability** if content extends beyond viewport. Wheel/drag enhancement may supplement but not replace native scroll or keyboard paths.
- Cards use scroll snap only where it improves navigation; do not trap users on a card.
- Phone: use an accessible horizontal sequence with a visible next-card hint **or** stack cards if native horizontal scrolling harms access. This is a responsive decision to validate, not an aesthetic assumption.
- Linked cards should click through to evidence or service-relevant case material. The entire card may be a single accessible link; do not nest links.
- Images must never rely on CSS backgrounds alone when they convey meaningful evidence; use semantic images/captions if informational.
- Shared services data must stay authoritative for Home and About.

#### Acceptance tests

Each service label is comprehensible without reading process copy. Every evidence link resolves. All cards are reachable by touch and keyboard, with visible state. Labels remain readable over images at all widths. A user can tell how many options exist and how to move between them.

### 4.5 HOME / SECTION 05 — BRANDS I HAVE WORKED WITH

**Owner:** `data/clients.js`, `js/render/projects.js` (`renderClients`, marquee controller), `styles/home.css`.  
**Reference lock:** Beskar Labs logo marquee.  
**Purpose:** Credible relationship proof, not decorative logo wallpaper.

#### Truthfulness and content

The current data contains Anakle, Celebration Church, Grey Finance, Rise, Riv-TechCreek and WellaHealth Technologies. Validate the nature of each relationship. “Brands I Have Worked With” can include employers and partners where involvement is accurate; do not imply every entity was an independent paying client. When necessary, use a concise explanatory label such as **Selected teams, clients and collaborators**. Obtain permission for sensitive logos and unannounced work.

#### Visual contract

- Use approved SVG source logos in `assets/images/clients/`.
- Normalize **optical area**, not identical geometric height. The existing renderer calculates an aspect-ratio-based correction; preserve and refine it with per-logo optical adjustments.
- Keep consistent spacing, generous negative space and optical alignment.
- A continuous row is the default. Two counter-directional rows are **not** required; implement only if the verified logo inventory expands enough to justify them.
- Seamless looping requires two matching sets with no visible jump; second set is `aria-hidden="true"`.
- Masked edges MAY communicate motion, but logos must not be unreadably faded when centered.
- Brand colors versus monochrome treatment should be deliberate and tested in light/dark themes.

#### Motion contract

Current animation uses a 34-second linear movement and IntersectionObserver pausing. Keep low-distraction constant speed, pause offscreen and on document hide. On reduced motion, display a stable fully accessible row/list. A pause control SHOULD be provided if motion is persistent and not otherwise sufficiently controllable; hover/focus pause is a useful complement, not a substitute for users without pointers.

#### Acceptance tests

No seam, jump or duplicated accessible announcements; logos have accessible names; no hidden or blank region without JS; static mode contains all relationships; no unauthorized logos or misleading claims.

### 4.6 HOME / SECTION 06 — CALL TO ACTION

**Owner:** `.home-close` in `index.html` / `styles/home.css`, email config.  
**Reference lock:** Seun Badejo's direct editorial contact approach.  
**Purpose:** Turn attention into a low-friction next step.

#### Content contract

One concise question or declarative statement, one supporting line about fit/availability and one clear contact action. Example, not mandatory final copy: **“Have something worth making?”** Supporting text should be true and specific. The principal action is a working `mailto:` link showing the real contact address. A nearby copy-email affordance MAY be used where supported by the existing `js/core/copy-email.js` behavior.

**CTA hierarchy:** A repeated label is not always desirable. **“See the work”** is for navigation to portfolio proof; **“Work with me”** is for engagement; the Home closing headline may be more editorial while the action remains clear. Avoid contradictory offers such as actively seeking senior roles while simultaneously asserting general freelance availability if not intended.

#### Composition

Near-full-page visual breathing room is acceptable if justified by pacing, but the CTA must not be so tall that contact feels buried. Use a strong typographic statement and a deliberate underline/hairline email link. On mobile, make the email wrap or scale safely; copy interaction should be accessible and non-essential.

#### Acceptance tests

The email opens a compose action; the visible address matches the `SITE.email` configuration; the target is reachable on mobile; focus-visible state meets accessibility requirements; no unnecessary form gate.

### 4.7 HOME / SECTION 07 — FOOTER & DOT MATRIX

**Owner:** `js/render/footer.js`, `js/core/footer-signature.js`, `styles/components-v4.css`, Home overrides in `styles/home.css`; authored SVG `assets/images/miebaka-joshua-script-name.svg`.  
**Reference lock:** Existing portfolio—preserve the signature rather than introducing a new one.  
**Purpose:** Leave a memorable personal mark while providing real navigation and social routes.

#### Required content

Site destinations, relevant social links, privacy, and the name-shaped signature. Social links open safely with `rel="noopener noreferrer"` when they open a new tab. The footer needs meaningful contrast and a visible navigation hierarchy. The dot matrix is decorative and is `aria-hidden`; a textual accessible name/identity remains available outside it.

#### Confirmed bug to repair

**Implemented contract:** pointer movement belongs to the `.site-footer__signature` host; the canvas stays non-interactive (`pointer-events:none`) so it never blocks links. The controller defers enhancement until visible, stops at rest, supports reduced-motion fallbacks and cleans up on pagehide. Any future refactor MUST preserve those behaviors.

#### Motion/graphics behavior

- Preserve authored SVG-sampled name geometry; never replace it with random dots or a generic MJ logo.
- Constrain device-pixel-ratio canvas size and point count; avoid unbounded allocations on resize.
- Idle state shows legible static dots. Hover/pointer repulsion is subtle, damped and returns to rest.
- Pause requestAnimationFrame offscreen, when document is hidden, and in reduced motion.
- Observe resize and theme changes without duplicating listeners.
- If canvas/image loading fails, the CSS-masked or SVG static signature remains visible.
- Ensure signature is properly composed on touch devices without requiring touch interaction.

#### Acceptance tests

Pointer interaction responds where intended; links remain clickable; reduced-motion displays static signature; no animation runs offscreen; resizing/theme switches do not leak canvases or observers; static fallback matches the authored name.

---

## 5. GLOBAL MOTION CONSTITUTION

**Reference lock:** Jasmine Gunarto for motion character, filtered through portfolio clarity and performance. The existing `js/core/editorial-reveals.js`, `js/core/hero-wave.js`, `js/core/preferences.js` and CSS duration tokens are the foundation. Do **not** layer independent animation libraries over the existing system without measurable benefit.

### 5.1 Motion families

| Family | Purpose | Nominal target | Allowed behavior |
| --- | --- | --- | --- |
| Micro response | Press, focus, hover, toggles | 120–240ms | Fast, immediate, reversible |
| Content reveal | Section heading/media/list entry | 500–800ms | One-time, restrained translate/opacity |
| Page/hero introduction | Establish a clear scene | 900–1200ms | Exceptional, not repeated on every component |
| Ambient | Marquee, water field, dot matrix | Continuous when appropriate | Interruptible, subtle, offscreen-paused |
| Navigation transition | Preserve context between pages | 180–400ms | Must never delay or obscure navigation |

All values are **tuning ranges**, not indiscriminate constants. A visual entrance may be slower than a button. This resolves the previous documentation's unrealistic implication that all motion must fit one 120–240ms window.

### 5.2 Animation semantics

- Animate `transform` and `opacity` preferentially. Animation of `filter`, `clip-path`, large shadows and layout properties requires profiling and explicit justification.
- Staggers communicate reading order, not arbitrary flourish. Typical delays 60–100ms; avoid cascading dozens of delayed items.
- A reveal MUST NOT permanently leave content at `opacity:0` if the observer fails, JS arrives late, or the browser lacks required APIs.
- Never introduce custom smooth scrolling that breaks anchors, browser history, keyboard navigation or user preferences.
- Do not globally set `will-change` on dozens of persistent elements; use only for known active animations.
- Avoid simulated heavy motion blur that reduces perceived sharpness of typography.
- Do not add a decorative custom cursor that compromises pointer affordances.
- Browser Back/Forward navigation must remain immediate and predictable.

### 5.3 Reduced-motion contract (critical)

Honor BOTH `prefers-reduced-motion: reduce` and the portfolio's explicit preference controls (`data-motion`, `data-motion-preference`). If the user chooses “Reduce,” that choice takes precedence over ambient animation; if “System,” follow the OS. The explicit “Full” choice must not undermine essential accessibility protections for rapidly moving or flashing content; always avoid dangerous motion and provide a way to stop it.

In reduced motion:

- No hero scale expansion, parallax, large scroll translations or continuous marquee motion.
- Section content appears immediately without hidden placeholders.
- Shader and signature are static or disabled with a meaningful visual fallback.
- Buttons and navigation remain functional and their states remain legible.
- Any essential state change is still confirmed with text, focus, color and structure, not animation alone.

### 5.4 Observer and lifecycle management

Every controller that registers observers, event listeners, timers or animation frames MUST have a cleanup path. Lazy enhancements SHOULD activate near the viewport and stop when no longer needed. Do not create duplicate controllers on rerender. Test theme toggles, route changes, resize, `pagehide`, document visibility and back/forward navigation.

---

## 6. GLOBAL NAVIGATION, PREFERENCES AND SHARED COMPONENTS

### 6.1 Header and Index

The masthead is quiet. The full-screen **Index** is the navigational statement. Use `data/navigation.js` as the only route source. The implementation already generates `renderIndexMarkup()` with numbered destinations, CV/contact area and appearance preferences.

**Required:**

- Visible brand/home affordance, clear Index button and site navigation appropriate to viewport.
- Full-screen Index opens as a modal dialog with `aria-modal`, inert background, focus trap, Escape close, focus restore and scroll management.
- Keyboard access remains direct; no decorative animation should delay focus or opening.
- One current route is marked with `aria-current="page"` where applicable.
- All destinations remain available in non-JS static navigation fallback.
- On mobile, existing persistent destination controls must not overlap content or safe areas.
- No duplicate navigations with contradictory routes or labels.

### 6.2 Appearance controls

Preserve **Print / Screen** color-mode language and the existing **System / Reduce / Full** motion preference UI. `js/core/preferences.js` is the state owner. Preferences must update CSS and active controls without reload, persist safely when storage is available, and degrade gracefully when localStorage is blocked.

The masthead uses a compact Light, Dark and System picker with sun, moon and monitor icons. Use native single-select controls with a visible selection and keyboard focus. The Index offers the same preferences when the masthead runs out of room.

### 6.3 Buttons, links, toggles and form states

Each interactive component MUST define relevant states and behavior:

| State | Visual / behavioral contract |
| --- | --- |
| Default | Clear label and affordance, adequate contrast |
| Hover | Perceivable but not the sole indication of action |
| `:focus-visible` | Strong visible ring, never removed without replacement |
| Active/pressed | Short physical feedback, no layout shift |
| Disabled | Only for genuinely unavailable controls; reason apparent where relevant |
| Loading | Prevent duplicate submission, convey progress through readable state |
| Success | Plain-language confirmation, not icon-only animation |
| Error | Specific accessible message and recovery path |
| Reduced motion | State communicated immediately without reliance on animation |

Control targets SHOULD be at least **44×44 CSS px** where practical. Link contrast and affordance MUST remain obvious in dark/light modes. Never nest interactive elements. Do not use pointer-only triggers for essential navigation.

### 6.4 Contact form

Existing `api/contact.js` and supporting schema/origin/rate-limit/mail modules remain the server boundary. Do not bypass server validation or expose credentials in browser code. Form validation must be clear, not accusatory; error messages must associate with fields; successful submission must be confirmed accessibly; rate-limiting response must be intelligible; honeypot/anti-abuse protections must not block legitimate users. `mailto:` remains a fallback if the API is unavailable.

### 6.5 Social links, email and now-playing

Links use real external destinations and safe target behavior. The copy-email enhancement must report clipboard success/failure correctly and keep the visible mailto link. The Last.fm/now-playing component is optional enrichment: if the network is unavailable, the page remains stable and no misleading live status appears. Do not allow an external service call to delay primary rendering.

---

## 7. WORK INDEX AND CASE-STUDY SYSTEM

### 7.1 Work index hierarchy

**Owner:** `work.html`, `js/render/projects.js`, `js/render/editorial-index.js`, `styles/pages-v4.css`, `data/projects.js`.

- Published, complete case studies occupy the primary visual index.
- Incomplete or future work appears in an explicitly labeled **In progress** register, visually quieter and non-deceptive.
- Each published item has title, year, category/role, meaningful introductory proof and clickable image where appropriate.
- The archive MAY introduce preview interactions but must not require hovering to identify projects or access links.
- Maintain an accessible and readable static fallback.
- Do not repeat all Home layout machinery mechanically; the Work page should be an expanded editorial index with deeper context.

### 7.2 Case-study information architecture

**Owner:** `data/case-studies.js`, `js/render/case-markup.js`, `work/*.html`, shared case CSS.

Every published case SHOULD communicate, in this conceptual order:

1. **Identity:** project title, year, scope, organization/context and clear hero image.
2. **At a glance:** role, collaborators, deliverables, time frame, constraints.
3. **Problem:** what needed to change; the business/user/contextual challenge.
4. **Decision:** the central creative reasoning; why that direction was chosen.
5. **System:** how the idea became a coherent identity, visual or production system.
6. **Applications:** tangible executions and how they hold up in context.
7. **Outcome / limits:** what is known to have happened, supported by proof; what is not verified.
8. **Reflection:** useful learning, tradeoffs, or what would change with new evidence.
9. **Next step:** next project, Work archive or contact.

The existing case renderer already includes facts, proof-trail labels, media sequences and chapter normalization. Evolve it; do not start a second case-study schema with overlapping facts. Some projects lack complete evidence; state this rather than filling gaps with unverified metrics. Preserve the existing **Documented / Bounded** evidence-language contract.

### 7.3 Media strategy per case

- The case's strongest image leads, without being buried under huge introduction text.
- Use real authored assets with appropriate consent and ownership.
- Use paired media, gallery sequences and full-width plates only where they support an explanation.
- Every informative image gets meaningful alt text; purely redundant decorative images may have empty alt.
- Captions explain what a viewer is seeing or why it matters, not repeat title labels.
- Avoid repeated identical mockups to manufacture case-study length.
- Maintain stable image dimensions and responsive `srcset`/`sizes` behavior.
- Do not stretch photographs into incompatible aspect ratios or allow key content to crop out unnoticed.
- A case can express its project colors, but shared navigation/reading patterns do not change across projects.

### 7.4 Project-specific expression

Rivo may use project blue; ChopBox may use warm brand colors; TEDx may use its purple/typographic system. These are **content worlds** within the fixed portfolio UI. Do not let each page invent its own link semantics, button size, focus style, body typography or navigation placement.

### 7.5 Case navigation and chapter rail

The existing scroll index can remain on wide screens. It must reflect real sections, expose the active section programmatically, have usable focus labels, and support click/keyboard activation without requiring pointer scrubbing. On mobile, favor a compact accessible chapter index rather than a screen-edge rail that consumes space. Respect reduced motion and maintain browser anchors.

---

## 8. ABOUT PAGE

**Owner:** `about.html`, `data/site-config.js`, `js/render/sections.js`, `styles/pages-v4.css`.

The About page expands on the Home introduction: personal perspective → working method → credible career history → leadership/mentorship → selected proof → relevant personal context → contact.

- Use a single strong portrait-led or editorial intro, not an interchangeable résumé template.
- Make the chronology clear and accurate; verify present employer, dates and descriptions.
- Preserve the existing experience ledger only if readable at mobile and keyboard navigable. A visual timeline must not make work history harder to access than a standard list.
- If the CV is unavailable (`siteConfig.cv` is currently `null`), display a truthful request alternative; do not render a broken download.
- Link relevant career claims to actual work or specific examples where possible.
- Do not treat community/church leadership as paid client work or vice versa; describe each relationship accurately.
- Be selective about personal details. Every paragraph should explain how the designer thinks, collaborates or works.
- CTA remains direct and understandable.

Acceptance: biography is scannable, timeline conveys clear dates/roles, copy is factual, portrait and prose work with JS disabled, and contact is discoverable.

---

## 9. EXPERIMENTS PAGE

**Owner:** `experiments.html`, `js/render/experiments.js`, `assets/experiments/`, metadata and manifest build scripts.

This is the portfolio's explicitly **experimental** mode. It MAY be spatial, draggable, richly interactive and visually unusual, but MUST have accessible routes to each piece.

- Keep the full-viewport spatial field as the defining behavior if it remains reliable.
- Use actual authored posters, visual studies and media rather than decorative placeholders.
- Desktop interaction can support drag, wheel/pan, pointer momentum and controlled zoom only if clear.
- Keyboard: arrows and Tab provide meaningful access, focus remains visible, and links can be activated normally.
- Touch: panning must not conflict severely with page/navigation gestures; a comprehensible instruction should appear when needed.
- Reduced motion removes momentum and major animations; a static or list-like discovery path must be available.
- Avoid rendering every full-resolution image simultaneously. Use optimized sources, lazy loading and virtualization only when it demonstrably improves performance.
- Page-level navigation to Work, About and Contact remains accessible despite spatial canvas behavior.
- Prevent media from escaping viewport bounds in ways that conceal controls; provide recovery/orientation affordance if visitors get lost.
- Asset metadata should include appropriate title, medium/year where available, alt description and link details.

The lesson from Depth is **meaningful interaction tied to the content**, not a mandate to add another generic 3D framework.

---

## 10. ESSAYS / WRITING

**Owner:** `essays.html`, `essays/*.html`, `js/render/writing.js`, `js/core/article-navigation.js`, shared editorial CSS.

### 10.1 Index

The index is typographic, scannable and informative. Each essay has accurate title, topic/summary, date where published and a working link. Use restrained metadata. Do not make essays look like cards from an e-commerce site.

### 10.2 Article page

- Comfortable line measure and body scale, generous line-height and meaningful heading hierarchy.
- Strong opening title, summary/dek where appropriate, byline/date information only if accurate.
- Full readable source HTML without JS; reading-progress and table-of-contents are progressive enhancement.
- Article navigation must accurately reflect headings and current section; no phantom headings.
- Figures, quotations, citations and links should be typographically distinct but restrained.
- Proper link contrast, underline affordance, keyboard focus and reasonable tap areas.
- A clear next essay or return-to-Essays path at the end.
- Do not insert decorative reveal animations into every paragraph; reading speed belongs to the visitor.

For research-heavy essays, verify citations and distinguish analysis from externally established facts.

---

## 11. CONTACT, PRIVACY, 404 AND SECONDARY ROUTES

### 11.1 Contact

The Contact page should be concise, confident and useful. Display an email option that works without any API and a well-tested form for visitors who prefer it. Include relevant scope/availability information only if true. Form success and failure states require plain language and accessible focus handling.

### 11.2 Privacy

The privacy page must accurately describe data actually processed by the contact form, analytics (if any), local preferences and integrations. Do not claim no tracking or zero storage without verifying implementation. It must be easy to find in the footer.

### 11.3 404

The 404 page should immediately explain that the destination is unavailable, offer Home/Work/Contact routes and maintain consistent visual design. It must be indexed appropriately (`noindex` where intended), remain accessible and avoid playful interactions that block recovery.

### 11.4 Legacy URLs and SEO

Honor redirects and canonical URLs for old routes. Do not introduce multiple competing canonical destinations.

---

## 12. CONTENT GOVERNANCE — PROJECTS, SERVICES, CLIENTS AND COPY

### 12.1 Source-of-truth table

| Concern | Canonical owner | Rule |
| --- | --- | --- |
| Role, name, email, location, experience, socials | `data/site-config.js` | One source for dynamic content; page-specific static copy must be reconciled |
| Routes | `data/navigation.js` | Never hard-code duplicate public route menus |
| Projects | `data/projects.js` | Featured order, status, metadata and images validated |
| Case-study evidence | `data/case-studies.js` | Real role, decision, constraints and outcomes |
| Services | `data/services.js` | Discipline-first labels, process as supporting detail |
| Relationship logos | `data/clients.js` | Approved, truthful affiliations, optical sizing |
| Writing inventory | `data/writing.js` | Current publishing state and true metadata |
| Shared content facade | `data/site.js` | Compatibility composition, not a second authoring store |
| Home editorial-only narrative | `index.html` or centralized content module | Keep copy discoverable and consistent; no renderer-embedded marketing prose |

### 12.2 Truth model

All public assertions belong to one of four evidence categories:

- **Verified factual:** role, date, published asset, actual deliverable, link.
- **Documented outcome:** supported by a first-party metric, written confirmation or accessible evidence.
- **Bounded inference:** professional interpretation clearly identified as such; not phrased as an observed fact.
- **Unknown / withheld:** omitted, qualified or described as unavailable.

Do not turn project photography into evidence of a fabricated commercial outcome. Do not create fictional testimonials, logos or metrics to fit visual layouts. Keep client employer/collaborator relationships unambiguous.

### 12.3 Voice and microcopy

Use direct verbs. Prefer **“View project”**, **“See the work”**, **“More about me”**, **“Work with me”**, **“Copy email”**, **“Send message”** over poetic labels whose function is unclear. Avoid repeating the same sentence in hero, About, CTA and footer. Avoid dramatic em-dash-heavy phrases and hollow slogans. Read every line aloud; if a recruiter cannot understand it in one pass, rewrite it.

---

## 13. MEDIA, IMAGE OPTIMIZATION AND ART DIRECTION

**Owner:** image assets under `assets/images/optimized/`, `assets/experiments/`, `scripts/optimize-images.mjs`, renderers and stylesheet crop behavior.

### 13.1 Production rules

- Use existing responsive **AVIF/WebP with JPEG fallback** for photographs where supported by build pipeline.
- `picture`, `srcset`, `sizes`, intrinsic `width`/`height` or CSS `aspect-ratio` are required for large project images.
- Reserve `fetchpriority="high"` for the actual likely LCP visual, not all page images.
- Eager-load only media essential to first paint; lazy-load lower-page imagery.
- Avoid shipping identical sources at multiple resolutions in the initial payload.
- Crop with intent. Each project needs a focal point and mobile strategy; do not assume `object-fit: cover` universally preserves the relevant artwork.
- Prefer genuine design documentation and applications over decorative stock-style filler.
- Video must have an accessible alternative, no surprise audio and a sensible poster/fallback.

### 13.2 Art direction contracts

**Hero:** controlled shader/dark gradient, not competing photographic wallpaper.  
**Selected Work:** project-specific best evidence image, framed to enhance the project title.  
**About:** authentic portrait, carefully positioned and responsive.  
**What I Do:** each service image relates to actual output of that discipline.  
**Clients:** authorized SVG logos; optical alignment.  
**Case studies:** media sequencing follows the explanation, with captions when necessary.  
**Experiments:** work itself is the imagery and receives the most freedom.

### 13.3 Fallbacks

If a source is missing, show a deliberate and correctly sized fallback with clear title/description; do not leave a broken image or pull unrelated external stock imagery. A missing project hero or service proof may be a publishing blocker rather than a design-placeholder opportunity.

---

## 14. ACCESSIBILITY — RELEASE-BLOCKING CONTRACT

The target is **WCAG 2.2 AA** for relevant content and interactions, backed by automated and manual review. Accessibility scores from synthetic tools alone do not certify compliance.

### 14.1 Structural

- Semantic landmarks, main content, meaningful section headings and one visible `h1` per route.
- Skip link works and lands on meaningful content.
- Logical DOM and keyboard focus order; animations and CSS layout must not reorder meaning.
- Controls use native elements wherever practical.
- Clear alt text and caption decisions; decorative images marked appropriately.
- Modals have proper roles, inert backdrop, focus trap and focus restore.

### 14.2 Visual and input

- Normal text contrast ≥ **4.5:1**; large text ≥ **3:1** (subject to WCAG exemptions); essential non-text UI contrast ≥ **3:1**.
- Do not rely on color alone for state.
- Keyboard focus is obvious across both themes and project-specific backdrops.
- Hit areas reasonably sized; prefer ≥44×44 CSS px for controls, check WCAG 2.2 target-size exceptions where applicable.
- Content reflows at 320px equivalent width and 400% zoom without horizontal scrolling for ordinary reading content; intentional two-dimensional artwork has a usable alternate pathway.
- Text resizing, increased line-height and browser zoom do not cut off critical controls.
- No keyboard traps outside purposeful, dismissible dialogs.
- Error messages are specific, associated with fields, and available to assistive technology.

### 14.3 Motion and sensory

Honor reduced motion across CSS keyframes, WebGL, marquee, footer canvas and transitions. Do not flash content at unsafe frequencies. Provide a way to stop recurring movement if users may find it distracting. Avoid automatic audio and background video where it adds little evidence.

### 14.4 Required manual journeys

Keyboard-only: Home → Selected Work → Case Study → next project → Contact → submit/error recovery.  
Screen reader: hero structure, project names, service categories, client-logo list, modal Index, error/status announcements.  
Touch: menu, gallery, work previews, service cards and email.  
Reduced motion: every route and theme with all essential content visible.  
No-JS: header, Home content, Work, case-study bodies, email, footer and route navigation remain useful.

---

## 15. PERFORMANCE AND RESILIENCE

Existing `engineering-specification.md` includes production budget gates. They are **hard constraints unless revised with measured evidence**, not optional aspirations.

### 15.1 Existing budget contract

| Budget | Existing stated limit |
| --- | --- |
| Initial CSS | ≤45 KiB gzip |
| Initial JavaScript | ≤75 KiB gzip |
| Lazy shader island | ≤375 KiB gzip |
| Eager homepage media | ≤1.5 MiB |

Existing Lighthouse CI checks desktop Home (shader performance mode), Work and one case page. It currently targets Performance ≥90, Accessibility ≥95, LCP ≤2500ms, CLS ≤0.05 and Total Blocking Time ≤200ms. Preserve or strengthen these gates rather than weakening them to accommodate decoration.

### 15.2 User-oriented metrics

Target **LCP ≤2.5s**, **CLS ≤0.1**, **INP ≤200ms** at the 75th percentile of representative real-user visits. CLS ≤0.05 in current Lighthouse CI remains the stricter synthetic gate. These are targets; measure and report actual figures before claiming success. Add mobile Lighthouse testing and realistic network throttling rather than relying only on desktop CI.

### 15.3 Resilience

- No dependency on WebGL for page comprehension.
- No layout shift from image sizes or dynamic content.
- Third-party API failure cannot break main rendering.
- Avoid long main-thread tasks caused by shader startup, excessive DOM cloning or scroll handlers.
- Use passive listeners where appropriate and `requestAnimationFrame` for continuous visual updates.
- Pause invisible animations and clean up observers/listeners.
- Maintain `noscript` / static fallback behavior already established by HTML and build pipeline.
- Respect offline/network failure as graceful degradation; do not show empty skeletons indefinitely.

---

## 16. ENGINEERING ARCHITECTURE — PRESERVE AND IMPROVE

### 16.1 Approved stack

Static HTML, authored CSS with cascade layers, vanilla ES modules, Node-based validation/build, Playwright, axe-core, Lighthouse CI, lightweight native WebGL isolated to the optional hero shader, Vercel deployment. **Do not migrate to React/Next.js/GSAP/Lenis merely to implement visual references.** Introduce dependencies only after a performance, maintenance and licensing evaluation.

### 16.2 File ownership and boundaries

| System | Current source files | Approved action |
| --- | --- | --- |
| Typography | `styles/tokens.css` | Single owner of all typography declarations, including responsive selectors |
| Colour, layout and motion | `styles/foundations.css` | Preserve shared design tokens independently from typography |
| Shared UI/nav/footer | `styles/components-v4.css` | Keep shared states and components consistent |
| Page composition | `styles/pages-v4.css` | Scope by page/section; avoid leakage |
| Home composition | `styles/home.css` | Own all Home-only layout and motion rules |
| CSS entry | `styles/main.css` | Preserve cascade order / imports |
| Browser startup | `js/main.js` | Preserve clear render then behavior sequence |
| HTML ↔ JS mount contract | `js/core/contract.js` | Register new mounts before using them |
| Home projects/clients | `js/render/projects.js` | Maintain data-driven featured ordering and preserve marquee controller |
| Home services | `js/render/sections.js` | Keep data source, update category presentation |
| Menu | `js/render/navigation.js`, `js/core/navigation.js` | Maintain a11y and route registry |
| Preferences | `js/core/preferences.js` | Keep theme/motion handling centralized |
| Reveals | `js/core/editorial-reveals.js` | Align with global motion contract |
| Shader | `js/core/hero-wave.js`, `js/hero-wave-island.js` | Progressive, lazy, resilient |
| Footer signature | `js/core/footer-signature.js` | Fix pointer target and fallback behavior |
| Case renderer | `js/render/case-markup.js` | Preserve evidence-first schema and semantic media |
| Contact server | `api/contact.js`, `api/lib/*` | Preserve validation/security and test thoroughly |
| Content | `data/*.js` | Single source; no fabricated values |
| Build | `scripts/build-site.mjs` | Allow-listed production output, validation |
| Tests | `tests/`, `scripts/*test*`, `lighthouserc.cjs` | Expand coverage before declaring done |

### 16.3 CSS rules

1. Reuse semantic tokens; no new scattered color values, timings or spacing magic numbers without documenting why.
2. Use cascade layers, predictable page-scoped selectors and modest specificity.
3. Avoid unreviewed `!important` patches that hide upstream layout errors.
4. Prefer container queries where component width—not viewport—is the real condition.
5. Use the shared grid; section exceptions have named and tested selectors.
6. Don't duplicate the same animation keyframe or component state in multiple files.
7. Preserve keyboard state styling even if a pointer-only visual flourish is added.

### 16.4 JavaScript rules

1. Every enhancement must fail independently and clean up its resources.
2. Do not generate critical prose exclusively from JS if static prerendering/fallback is available.
3. Never interpolate unsanitized content into HTML; continue using escaping/safe URL functions and validated data.
4. Controllers have explicit initialization, state synchronization and teardown.
5. Avoid runtime DOM work where build-time rendering can provide a stable baseline.
6. Don't change user-visible DOM order solely for animation.
7. Preserve tests for focus/interaction preferences and add new regression cases with every new effect.

### 16.5 SEO and canonical domain — resolved conflict

**The authoritative public canonical host is `https://miebaka-portfolio.vercel.app/`** as defined in `engineering-specification.md`. `data/site-config.js` and published metadata now agree on the Vercel canonical URL. Do not reintroduce `miebaka.design` or another canonical host without owner control and an intentional migration plan.

Use one consistent canonical per route, correct open-graph/Twitter metadata, stable sitemap entries and `noindex` for 404 where appropriate. Validate structured data factual claims. Don't ship a project-specific canonical pointing at a nonexistent page.

---

## 17. ZERO-SLOP GOVERNANCE / DESIGN DRIFT CONTROL

ZeroSlop is a **method for documenting, inspecting and enforcing decisions**, not a replacement brand. The library contains draft captured reference files; treat them as research inputs with uncertainty, not as a plug-and-play token package.

### 17.1 Mandatory reference ledger

For each meaningful imported pattern, record:

| Field | What to record |
| --- | --- |
| Decision ID | Stable identifier, e.g. `HOME-HERO-OPEN-01` |
| Source | Reference URL + capture/inspection date |
| Page/component | Exact target surface |
| Borrowed rule | The specific typography/layout/motion principle |
| Rejected rule | What must not transfer from that source |
| Evidence status | Observed in source / inferred / to verify |
| Token mapping | Existing token role or proposed documented addition |
| Responsive mapping | Phone, tablet, desktop behavior |
| Accessibility | Keyboard, touch, reduced motion, semantics |
| Code owner | File(s) to update |
| Test owner | Screenshot, Playwright, manual or performance test |

A file can contain this ledger as an appendix, issue checklist or adjacent change record. Never turn every style observation into a token.

### 17.2 Design workflow

1. **Inspect** the current implementation and target reference for a specific section.
2. **Extract** actual values and behaviors, including limitations and unknowns.
3. **Choose** one primary ownership rule; don't blend incompatible styles.
4. **Map** values to existing semantic tokens or document narrowly scoped new tokens.
5. **Implement** one section or shared primitive at a time, preserving fallback behavior.
6. **Compare** browser screenshots and computed styles with the reference lock and portfolio design system.
7. **Audit** keyboard, touch, reduced motion, contrast and performance.
8. **Correct** drift and regression, document intentional exceptions.
9. **Ship only** once acceptance criteria pass.

Recommended ZeroSlop workflow categories: `extract-design`, `define-typography`, `define-responsive-layout`, `define-interaction-states`, `review-design-drift`, `review-accessibility`, `enforce-design`. If these named skills are unavailable in an execution environment, execute the checks manually using the same evidence-based procedure; don't pretend a skill ran.

### 17.3 Drift criteria

A change constitutes **unapproved design drift** if it creates a second token source, overrides global typography ad hoc, changes a shared control state only on one route, hides evidence on mobile, uses unapproved imagery, introduces a new animation family, breaks canonical metadata, or makes a page less accessible in order to match a screenshot. Document and justify intentional project-specific variations.

---

## 18. TESTING & VISUAL QUALITY ASSURANCE

### 18.1 Existing quality scripts

Preserve the existing `package.json` commands and quality gates, including:

```bash
npm install
npm run build
npm test
npm run test:e2e
npm run test:a11y
npm run test:budgets
npm run test:lighthouse
npm run audit:shipped
```

Also run `npm run lint`, `npm run format:check` and `npm run test:contract` / token checks as relevant. If a command fails because the source state is already broken, record the baseline and fix it; do not weaken tests or silently skip failures.

### 18.2 Visual matrix

For **every major route** at minimum capture review screenshots at:

- 320×~720 phone
- 390×~844 phone
- 430×~932 phone
- 768×~1024 tablet
- 1024×~768 landscape/tablet
- 1280×~800 desktop
- 1440×900 desktop
- 1920×1080 wide desktop

Also test 200% and 400% zoom where applicable, both themes, reduced/full motion, with and without JavaScript for essential content, and at least Chrome, Safari/WebKit and Firefox for significant interactions.

Screenshots MUST include important states: hero initial and settled, selected-work default/focus/hover, services scrolled, Index opened, contact error/success, footer animated/static, Experiments keyboard focus, case-study media and reading states. Use deterministic screenshot modes where supported to avoid flaky visual baselines.

### 18.3 Automated scenarios to add/strengthen

- Hero displays static content before shader and after shader failure.
- Hero reduced-motion final state is immediate; no invisible content remains.
- All three Home featured projects derive from data and have media in mobile layout.
- Clicking mobile work previews opens the project on first tap.
- Client marquee has no accessibility duplication and pauses correctly.
- Footer pointer movement is handled by host; links remain interactable.
- Theme and motion preferences survive rerenders, storage denial and live changes.
- Every menu destination uses route registry; focus trap, Escape and focus return work.
- Case-study published content includes real role and evidence labels, no empty links.
- Contact form handles success, schema errors, rate limit and server failure accessibly.
- No local 404s, serious console errors, unexpected horizontal overflow or missing image sources.
- Correct canonical metadata appears in built output, with no unowned domain.
- Build output respects the allow-list and budgets.

### 18.4 Manual editorial review

A human-style pass must ask:

1. Can I understand what this designer does in ten seconds?
2. Can I open his strongest work in one obvious action?
3. Can I distinguish his contribution from collective/project-wide results?
4. Are images demonstrating actual design judgment or merely decorative mockups?
5. Is the design recognizably his after external references are removed?
6. Can I read everything on a phone, navigate by keyboard and contact him without an animation prerequisite?
7. Does each embellishment earn its cost in load time and attention?
8. Are all claims verified, bounded or appropriately omitted?

### 18.5 Release gates

A release is blocked by: missing/broken project links; hidden critical mobile evidence; persistent invisible content; keyboard traps; serious/critical accessibility failures; unapproved brand claims; broken contact fallback; WebGL dependence; canonical host inconsistency; failed build/tests; significant overflow or clipping; broken footer interaction; or production performance budget violations.

---

## 19. IMPLEMENTATION ROADMAP AND ORDER OF OPERATIONS

### Phase 0 — Establish a known-good baseline

1. Record current `main` commit SHA.
2. Run build, unit tests, e2e tests, accessibility checks and Lighthouse.
3. Capture current-state screenshot matrix.
4. Inventory currently published projects, real client logos, all page routes and image sources.
5. Create an issue/PR checklist tied to this specification. Do not make a giant unreviewable all-at-once rewrite.

**Exit:** Known baseline, list of confirmed defects, test results and existing design-to-code discrepancy log.

### Phase 1 — Correct foundations and governance

1. Reconcile this document with `engineering-specification.md`, `README.md` and actual cascade imports.
2. Fix canonical URL config to the approved Vercel host.
3. Formalize shared typography, spacing, color and motion roles.
4. Fix footer pointer-event conflict.
5. Verify homepage projects continue using validated, data-driven featured ordering.
6. Improve cross-route interaction-state contracts and reduce CSS specificity collisions.

**Exit:** Site behavior at least as good as baseline, documented roles consistent, tests passing.

### Phase 2 — Hero and Selected Work

1. Tune hero frame, responsive typography and initial/settled states.
2. Ensure shader remains a lazy non-blocking enhancement.
3. Implement strong Bulletproof-inspired editorial project listing.
4. Preserve real project previews on mobile and keyboard/touch equality.
5. Re-run visual/a11y/performance checks before extending styles.

**Exit:** Hero feels authored, Work is immediately discoverable, mobile evidence is strong, no new performance failures.

### Phase 3 — Remaining Home sections

1. Refine About portrait and biography.
2. Update service category names, evidence, card images and accessible horizontal behavior.
3. Refine client/logo marquee truthfulness, optical sizing and reduced-motion state.
4. Refine CTA and clear action hierarchy.
5. Restore/polish and verify existing footer signature.

**Exit:** All seven chapters have a coherent rhythm and fulfill their distinct functions.

### Phase 4 — Whole-site consistency

1. Work archive and published/in-progress hierarchy.
2. Case study evidence-first readability and image presentation.
3. About biography and timeline.
4. Experiments spatial accessibility/performance.
5. Essays index and article reading.
6. Contact, Privacy, 404 and legacy routes.
7. Shared nav, appearance preferences and footer consistency.

**Exit:** Every public page feels like one authored portfolio without flattening individual project identities.

### Phase 5 — Motion polish and release certification

1. Unify choreography and remove needless motion.
2. Verify reduced motion in CSS, JS, shader, marquee and canvas.
3. Profile performance on slower hardware and mobile networks.
4. Run the entire test matrix and browser/keyboard/manual checks.
5. Fix all release blockers, compare final screenshots with reference locks and document intentional deviations.
6. Produce a final change summary, known limitations and evidence of acceptance.

**Exit:** A measured, accessible, navigable, stable production-ready portfolio. Do not claim completion merely because new CSS merged.

---

## 20. CHANGE MANAGEMENT AND EXCEPTION PROCESS

Any change that affects a **locked principle, reference ownership, primary typography family, palette role, Home section order, route taxonomy, public claim, major animation behavior or performance budget** must include:

1. The problem the existing rule causes.
2. The proposed change and source/reference, if any.
3. Why the change helps users or the business goal.
4. Its effects on all relevant pages and breakpoints.
5. Accessibility and performance implications.
6. Exact implementation files.
7. Tests and visual examples proving the result.
8. Updated documentation and decision ledger.

Emergency bug fixes may be merged without a new art-direction exercise when they restore correctness; document the exception afterward. No one should quietly override a design rule because the last reference screenshot looked more fashionable.

---

## 21. FINAL DEFINITION OF DONE

A feature, section or full redesign is only **DONE** when all of the following are true:

- [ ] It serves a documented visitor need and respects the assigned reference role.
- [ ] It is consistent with the core visual identity and shared tokens.
- [ ] Its copy is accurate, straightforward and backed by real evidence.
- [ ] It works in a usable static/no-JS state where it contains essential information.
- [ ] It is responsive from 320px upward, with intentional tablet/desktop compositions.
- [ ] Keyboard, pointer and touch interactions are usable and visibly communicated.
- [ ] Reduced-motion behavior is complete and no critical content remains hidden.
- [ ] All relevant default, focus, hover, loading, success, error and disabled states are specified/tested.
- [ ] Media is authentic, properly cropped, accessible and efficiently delivered.
- [ ] No new design-system duplication or unexpected layout shift was introduced.
- [ ] Performance budgets and quality scripts pass; failures are not suppressed.
- [ ] Visual regression screenshots match the approved direction and any deviations are documented.
- [ ] Navigation, case studies, contact and metadata are functional and truthful.
- [ ] `DESIGN.md`, engineering documentation and tests reflect the actual implementation.

### Final governing statement

> **Every design decision must improve clarity, demonstrate creative judgment, strengthen usability, or make the work more memorable. If it achieves none of those, it does not belong.**

**The goal is not to look like a collection of impressive websites. The goal is to make an unmistakably personal, credible and technically disciplined portfolio that earns attention and rewards scrutiny.**

---

## APPENDIX A — CURRENT CODEBASE FINDINGS (AUDIT SNAPSHOT)

The following observations are from the `main` branch reviewed on 19 November 2026; they are not claims about post-redesign behavior.

| Observation | Source | Required response |
| --- | --- | --- |
| Seven Home sections exist already in intended order | `index.html` | Refine rather than recreate |
| Hero frame scales from `.64` while radius and clip-path change | `styles/home.css` | Tune animation/avoid unnecessary composite cost |
| Featured homepage order | `data/projects.js` / `js/render/projects.js` | Implemented using `featuredOrder`; keep tested and avoid future hard-coded slugs |
| Project visual starts hidden by opacity and is entirely hidden on mobile | `styles/home.css` | Mobile must show meaningful project images |
| Services titles describe process steps, not discipline categories | `data/services.js` | Adjust category/title hierarchy while retaining method detail |
| Client marquee already duplicates logos and pauses by observer | `js/render/projects.js` | Preserve logic, refine control/optical treatment |
| Footer canvas registers pointer events on a pointer-disabled element | `js/core/footer-signature.js`, `styles/components-v4.css` | Attach handling to host and test |
| Existing motion preference controller supports system/reduce/full | `js/core/preferences.js` | Honor it in every motion effect |
| Existing design document calls for persistent project images | previous `DESIGN.md` | Reconcile wording with actual behavior |
| Site config uses dormant `miebaka.design` domain | `data/site-config.js` | Align with Vercel canonical contract |
| Engineering specification names Vercel as active canonical | `engineering-specification.md` | Preserve authority of that rule |
| README describes older Home ordering / content | `README.md` | Update alongside implementation |
| Current quality suite includes Playwright/axe/Lighthouse | `package.json`, `tests/`, `lighthouserc.cjs` | Extend, do not weaken |

## APPENDIX B — DESIGN DECISION RECORD TEMPLATE

```md
### DECISION-ID — Short decision name

- **Status:** Proposed | Approved | Implemented | Verified | Rejected
- **Date / reviewer:** YYYY-MM-DD / role
- **Problem:** What visitor or implementation problem is being solved?
- **Reference:** URL, capture date, what was actually observed.
- **Ownership:** Exact page/component; what the reference does NOT control.
- **Decision:** One direct statement of the rule.
- **Alternatives rejected:** Brief explanation.
- **Token mapping:** Existing semantic roles and any explicitly approved additions.
- **Responsive behavior:** Mobile, tablet, desktop; key failure cases.
- **Interaction:** Default, hover, focus, touch, reduced motion, error/fallback.
- **Media:** Source, rights, crop, `srcset`, alt and fallback.
- **Files:** Specific changed files.
- **Verification:** Screenshots, browser check, automated test, performance evidence.
- **Outcome:** What changed, what remains uncertain.
```

## APPENDIX C — SPECIFICATION CHANGELOG

- **2.0.0 (2026-11-19):** Consolidated the current codebase review, seven-section Home reference locks, ZeroSlop-inspired governance, site-wide chapter contracts, motion/accessibility/performance requirements, canonical-host resolution, known defects and a comprehensive staged acceptance process. Maintained the ultramarine identity, vanilla/static-first architecture, real case studies and dot-matrix signature. Typography was subsequently migrated to Overused Grotesk on 21 November 2026.


### The Index, Overused Grotesk and embossed signature (20 November 2026)

- **Typography:** Overused Grotesk throughout headlines, body and labels. Small UI labels, paragraphs, and project titles retain their authored casing.
- **Navigation:** replace the centered dark pill with a restrained masthead and fullscreen Index inspired by [Alex Pierce on Navbar Gallery](https://www.navbar.gallery/navbar/alex-pierce). Keep canonical routes, focus trapping, Escape restoration, theme/motion preferences and static no-JavaScript navigation.
- **What I Do:** five unnumbered semantic service cards, flat authored token colours and no spotlight or image-overlay gradient. Evidence links remain accessible on touch, hover, and keyboard.
- **Footer:** the original script SVG uses opposing masked highlight/shadow layers for a tactile, raised embossed effect inspired by [For Living](https://www.for-living.it/). Its small keyboard-operable interaction is progressive, not a requirement for reading the signature.
- **Tests:** desktop checks verify fine-pointer behavior; mobile checks verify always-visible images, focus, and reduced motion. No intentional mobile skips for these behaviors.


### Approved portfolio direction (21 November 2026) — overrides the earlier embossed/footer and cabinet concepts

This is the current design contract when older sections above or historical Work handoff files conflict:

1. **Navigation:** no written identity or “Home / Independent Design” line in the masthead. Keep the logo at the left and the **Index** control mathematically centered, with an accessible, animated light/dark liquid toggle at the right. Keep the fullscreen Index, focus trap and preference persistence. The unused Last.fm listening-status widget and endpoint have been retired.
2. **Landing hierarchy:** “Miebaka Joshua” gets the largest sanctioned display token; the creative-partner statement drops to a supporting heading token. No invented sizes outside `styles/tokens.css`.
3. **Selected Work:** on the shared page surface with no isolated tinted background; large headings, no rows touching, generous space, real case-study links and no decorative labels competing for attention.
4. **About:** use a robust editorial text/portrait split on large screens and readable single-column text/portrait order on mobile. The complete About page follows the same typographic rhythm and retains verified biography, roles and proof.
5. **What I Do:** supporting—not hero-sized—section heading. Five existing, unnumbered, rounded, visually distinct sticky cards with natural native scrolling; no scroll-jacking. Every service and evidence link must be usable by keyboard and touch.
6. **Footer:** the **whole original scripted-name signature is an interactive dot matrix**. Its source is `js/core/footer-signature.js` and the authored SVG. The embossed shadow/highlight relief layers are retired. The fallback is a dotted, SVG-masked shape; canvas enhancement must not obscure the signature, interfere with links or force motion on visitors opting out.
7. **Work (revised 22 November 2026):** the published case files are **full-width, landscape physical folders** in a single vertical sequence, not narrow upright portrait cards, a colored stage, a metal drawer, or a 3D cabinet. Each folder's complete silhouette includes a back panel, a raised third-cut tab displaying **only its two-digit file number**, alternating left, center and right across the three published folders, five fixed warm-white ruled sheets with slight paper-tone variation and tiny rotations (as in the owner-provided `Work — Folder Rack.html` reference), and an opaque front pocket bearing **only the oversized project name**. Nothing is written on the sheets, the vertical edge, or elsewhere on the front. The page/stage surface is transparent and inherits the site's existing light/dark theme; the physical folders retain authentic project brand colors (Rivo, TEDx RSU, ChopBox). Each folder occupies the available content width and uses the real letter-file silhouette: approximately 11¾ inches wide by 9½ inches tall (47:38 ratio) at mobile, tablet and desktop sizes. Details include dimensional paper edges, a subtly reinforced tab, softly varied paper stock, soft, irregular tonal variation in the colored cardstock (not a visible repeating hatch), a visible top bevel, a bottom pressure-score fold and realistic restrained contact shadows. The front cover conceals most of each folder, while all five paper sheets remain visible as layers. Links are independent native anchors with reliable hover/focus/touch hit areas and reduced-motion support. The same content and navigation must remain present with JavaScript disabled. Project metadata belongs inside the case-study pages, not printed on the archive folders.

**Implementation ownership:** `styles/portfolio-refinement.css` owns the current global refinements; `styles/project-folders.css` and `js/render/projects.js` own the new Work archive; `js/render/navigation.js` and `scripts/render-partials.mjs` own the masthead. The retired 3D cabinet prototype, its superseded research notes, scripts and source CSS have been removed. Do not restore the drawer implementation; the physical full-width folder stack is the supported Work archive.

**Acceptance:** npm validation, HTML/typography lint, content and interaction tests, complete Playwright coverage at desktop and emulated mobile (zero skipped), reduced-motion/keyboard/no-JS checks, bundle budgets and Lighthouse must pass before release. In addition, verify a READY preview at the exact PR head, live routes, real touch/zoom/screen-reader sampling, and contact delivery before production promotion. CI passing is not proof of live deployment.


### Regression-repair decisions — PR #49 (22 November 2026)

These owner-approved changes supersede the preceding visual details where they conflict. The homepage retains the exact Three.js water simulation from the [earlier approved deployment](https://miebaka-portfolio-1a3l5m29f-mjdsgn1.vercel.app/index.html); remove unstable WebGL probe context loss, maintain WebGL2 capability and reduced-motion fallbacks, and require a real no-bypass shader test. A visual match must be judged on rendered screenshots, not only matching source.

- **Work:** Maintain the full-width 47:38 physical folders, authentic brand colours, five blank sheets and number-only tabs. Overlap the three folders slightly in a vertical stack, based on the owner's `Work — Folder Rack.html` logical overlap concept. Each visible surface remains an independent native anchor; avoid a transform-based guessed click target.
- **What I Do:** Five full-width unnumbered cards form a gently overlapping sticky stack as readers scroll. No scroll-jacking, hidden cards or gradient overlays; keyboard, touch and reduced-motion flows remain usable.
- **Nav:** Original logo at left, a concise Last.fm Now Playing vinyl pill immediately afterward, Index mathematically centered and a three-option Light, Dark and System picker on the right. Index uses **light text on a dark fill** in light mode and **dark text on a light fill** in dark mode via semantic theme aliases. The listening pill links to the real public Last.fm account when the API is missing; no fake song.
- **Footer:** Keep the contact CTA, navigation, social links and full interactive dot-matrix signature. Remove the standalone location/worldwide line and bottom personal-name/independent-practice line; enlarge the signature without hiding its fallback or blocking footer links.
- **Case studies:** Preserve PR #46's five chapters and exact question descriptors, all case plates, native anchors and truthful evidence. Reveal **chapter headings, descriptors and body together**, both with JavaScript and without it. Never rely on raw DOM presence as proof of visible content.

**Release acceptance:** enforce HTML/typography/static contracts, explicit five-chapter visible-browser assertions, complete project and service stack geometry/hit-target tests, theme/navigation/pill fallbacks, a no-bypass WebGL path, and Vercel preview inspection before merging.

### Latest approved presentation — 22 November 2026, Home / Work / Footer

This decision supersedes older references to upright Home case folders, a visible
Home "Selected work" heading, an inert client marquee or footer links beneath
the oversized signature. Preserve the existing hero-water, native navigation,
case-study chapters, truthfulness and accessible interaction.

- **Selected Work on Home:** use the Work page's physical landscape cardstock
  silhouette, published project colors, number-only tabs, five blank paper sheets and
  real links. The desktop Home files match the height of the rendered What I Do panels;
  on phones they are deliberately shorter. Keep a clear landing-to-work interval with
  the resting rack near the bottom of its section. Hover/focus raises only the chosen
  file **inside the cabinet's original stacking order**: every subsequent file
  continues to cover its lower portion. Never promote the active Home folder to the
  foreground. The exposed upper cover shows the project's name and concise preview.
  Work uses the same cover, responsive height, overlap, preview and hover treatment. Selected Work retains
  `aria-label="Selected work"` without a visible heading or duplicate "All Work" CTA.
- **What I Do:** the five unnumbered colored cards form a native sticky stack
  on desktop, ending with yellow above purple; a contained runway completes the
  sequence before the client marquee. At widths up to 48rem, replace the immersive
  stack with a restrained non-sticky, neutral reading list. Keep the service title,
  description and accessible chapter-proof link, but omit decorative marks, repeated
  deliverable badges and the empty scroll runway. This simpler view must remain
  legible on 320px screens and with reduced motion.
- **Brands / marquee:** two identical tracks for seamless movement. While visible,
  and unless motion is reduced, the rail travels continuously. Logos retain SVG
  aspect ratios but share one rendered height; duplicates are aria-hidden.
- **Footer:** adapt the observed Belonwus hierarchy, not its brand assets:
  inquiry email and real internal/social links are placed above an oversized,
  edge-to-edge **original interactive Miebaka script-name dot-matrix**. Keep its
  authored SVG fallback, keyboard interaction, dark/light theme and intact links.
  This footer layout is shared across the portfolio.

**Authoritative source files:** `js/render/projects.js`,
`js/core/project-folder-interactions.js`, `styles/project-folders.css`,
`styles/home-folders.css`, `styles/home-experience.css`,
`js/render/footer.js`, `styles/footer-layout.css`,
`js/core/footer-signature.js`. Typography remains centralized in
`styles/tokens.css`. Visual and automated contracts must be kept in sync.

### Mobile-first file cabinet and visual-debt cleanup — 22 November 2026

The hero water and physical Work files remain distinctive signature elements; mobile should not repeat every desktop flourish. The Home folder controller uses a capped upward motion with the **natural later-folder paint depth unchanged**. The smaller mobile files do not force the five service cards to match their height. The profile is concise, the marquee renders smaller balanced marks and the footer owns the only final inquiry action. Touch previews a folder on first tap, opens the project on second tap; keyboard activation stays a native link.

Removed as dead visual code: `styles/project-roster.css`, `styles/optical-lens.css`, `js/core/optical-lens.js` and retired Home editorial-row, oversized CTA and image-lens declarations previously scattered across shared styles. The editorial index **remains** for the Essays archive and the navigation system. Do not add a second CSS/JS presentation of Selected Work without retiring the existing one first. Verify mobile reading order, horizontal overflow, touch accessibility and cabinet layer order before describing the update as released; passing source lint is not equivalent to deployment approval.


### Mobile-first proportional sizing — 22 November 2026

The current sizing system is based on the visitor's inherited font size, **not pixel presets**. Mobile is the starting composition: `styles/layout.css` defines four grid tracks and `styles/foundations.css` defines comfortable phone gutters, navigation height and section spacing; `@media (min-width: 56em)` expands the standard grid to twelve tracks, while editorial layouts have an intermediate eight-track tablet composition. Home hero and profile also begin with their mobile reading order and enhance at larger viewports. Component media-query widths use the single approved breakpoint table; independent page-specific viewport thresholds are prohibited.

- All authored typography remains centralized in `styles/tokens.css`, with `em` size bounds. The system remains Overused Grotesk for headlines, body and labels.
- Relative `em` units are used for **typography, spacing, component layout, and responsive image-size hints**. An `em` is based on the font size of the element (or its parent for `font-size` itself). Deliberately test nested type scales to avoid compounded growth.
- Painting details and native WebGL raster/pointer coordinates are rendering primitives, not competing layout sizing scales. The shared accessible touch target is `--control-target: max(44px, 2.75em)`; all page and component styles consume that token rather than writing independent 44px lengths. Browser viewport decisions are centralized in `js/core/responsive.js`.
- Viewport, percentage, `ch`, `svh`, `vw`, `fr` and intrinsic sizing remain where their semantics are correct. Replacing these with `em` would make layout less adaptive, not more.
- The `npm run test:relative` gate prevents accidental fixed-size CSS regressions. Validate reflow at 320, 390, 430, 768, 1024, 1440 CSS pixels **and** increased browser default text size or zoom. Preserve water, physical folder layering, focus and reduced-motion behavior.


## Live usability and editorial corrections (24 November 2026)

This supersedes earlier conflicting directions. The outer portfolio measure is capped at 100em with the shared page gutter. The sole full-bleed content surface is the solid case-study opening, whose colour and foreground match its project folder; artwork follows in the contained gallery. The homepage name fits 98.5% of its shared frame, with no listening widget, and the work cue uses a short reduced-motion-safe nudge. Buttons and reading legends share the former editorial list's rising colour plane and keyboard focus treatment, rather than pill fills. The Contact grid uses two explicit desktop tracks and one mobile track. Experiments switches to its interactive gallery only when ready; its static list is otherwise the sole artwork presentation. The masthead retains static links until navigation is enhanced. Fonts and the early bootstrap are same-origin.


### Follow-up refinements

The masthead height is 4.5rem on compact screens and 6rem on desktop; its links use shared spacing tokens. The original editorial rising-plane interaction extends to Beyond the Brief, reading legends and the larger Essays rows. Capability cards inherit the shared content frame without full-bleed overrides. Solid case openings center the title at the homepage display scale, with All Work independently anchored near the top. The homepage alone uses the progress loader; project navigation uses the destination project tone and a CSS-debossed original logo. The shared continuation aligns right at the heading scale, with a content-sized native link. Logos have no crosshair separators. Experiments uses the paper surface without decorative shading, and Study/Medium share the same semantic metadata strip as Year/Deliverables/Credits.

### Consistent spacing and small interactions

Use the About page's opening rhythm (`--page-opening-space`, derived from `--s9`) and the existing shared `--section-padding` on page-level sections. The headings of What I Do and Beyond the Brief share `--heading-content-gap`. Capability cards have a separate, shorter height from the folder stack. Beyond the Brief objects use a compact intrinsic height. The Work heading is retained for assistive technology only. Active primary navigation routes use a small dot, including Home and Contact. Essay titles remain stationary; colour-plane feedback is shared with How Projects Work. The selected-work arrow repeats its bob when motion is enabled and uses the same rising colour plane on hover and focus. The footer's rest ink is black in light mode and white in dark mode; displaced dots always use the reference ultramarine, without blend modes or faded overlays.
