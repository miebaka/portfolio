# Portfolio Version 4 — information architecture and responsive wireframes

Status: approved  
Date: 12 October 2026  
Governing specification: `engineering-specification.md` Version 4.0

## 1. Structural thesis

The site should feel like one authored editorial publication with three clear reading modes:

1. **Proof** — professional work and complete case studies.
2. **Practice** — services, experience, thinking and writing.
3. **Contribution** — explorations and community work.

The homepage introduces all three without becoming an index of everything. Work remains the strongest proof. Explorations shows self-directed taste. Community shows generosity and usefulness. Writing demonstrates thought.

## 2. Site map

```text
HOME
├── WORK
│   ├── TEDx RSU — flagship
│   ├── Rivo Studio
│   ├── ChopBox
│   └── Christian Poster a Week
├── EXPLORATIONS
│   └── Curated self-initiated series and experiments
├── COMMUNITY
│   └── Resources, teaching, tools, events and contributions
├── ABOUT
│   ├── Positioning
│   ├── Experience
│   ├── Working principles
│   └── DOWNLOAD CV
├── SERVICES
│   └── Five services represented by the swatch system
├── WRITING
│   └── Essays, notes and developed ideas
├── CONTACT
│   ├── Accessible contact form
│   ├── Copy email
│   └── Professional links
├── PRIVACY
└── 404
```

## 3. Navigation model

### 3.1 Desktop and large tablet

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ◇ MIEBAKA JOSHUA       WORK   EXPLORATIONS   COMMUNITY      INDEX  │
└──────────────────────────────────────────────────────────────────────┘
```

- The bar is compact and visually quiet.
- It stays visible at the top of a route.
- After meaningful downward movement it condenses, preserving the logo and `INDEX`.
- Reversing scroll direction or tabbing into navigation restores the full bar.
- `INDEX` opens the full editorial navigation sheet.

### 3.2 Full editorial Index

```text
┌──────────────────────────────────────────────────────────────────────┐
│ INDEX                                                         CLOSE │
│                                                                      │
│ 01  WORK                         ABOUT                 PRINT/SCREEN   │
│ 02  EXPLORATIONS                 SERVICES              MOTION         │
│ 03  COMMUNITY                    WRITING                              │
│ 04  CONTACT                      DOWNLOAD CV                          │
│                                                                      │
│ LAGOS, NIGERIA                   LINKEDIN · BEHANCE · INSTAGRAM       │
└──────────────────────────────────────────────────────────────────────┘
```

- Primary destinations carry large BIZ UDPMincho titles.
- Supporting destinations and settings use uppercase Josefin Sans labels.
- Current-page state remains visible.
- The sheet replaces the need to fit every destination into the top bar.

### 3.3 Mobile bottom navigation

```text
┌─────────────────────────────────────┐
│                                     │
│             PAGE CONTENT            │
│                                     │
├─────────────────────────────────────┤
│ HOME   WORK   EXPLORE  CONTACT INDEX│
└─────────────────────────────────────┘
```

- Five persistent text-labelled destinations.
- `EXPLORE` opens Explorations, not a submenu.
- Community, About, Services, Writing and CV remain one tap away in Index.
- The current destination receives a non-colour indicator plus colour.
- The bar accounts for the device safe area.

## 4. Homepage architecture

### 4.1 Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                                                                      │
│  I design brand systems,                                             │
│  then build the tools that                                           │
│  keep them intact.                                                    │
│                                                                      │
│  Brand strategy, identities, campaigns and production systems       │
│  designed to hold together in the real world.                        │
│                                                                      │
│                              subtle material response                │
├──────────────────────────────────────────────────────────────────────┤
│ SELECTED WORK                                                        │
│                                                                      │
│ ┌───────────────────────────────┬────────────┬────────────┐          │
│ │ TEDx RSU                      │ RIVO       │ CHOPBOX    │          │
│ │ flagship image and premise    │            │            │          │
│ └───────────────────────────────┴────────────┴────────────┘          │
│ Cards rebalance proportion on focus/hover.                            │
├──────────────────────────────────────────────────────────────────────┤
│ ABOUT                                                                │
│ ┌──────────────────────────────────┬─────────────────────────────┐   │
│ │ Short positioning and biography │ Quiet editorial portrait    │   │
│ │ MORE ABOUT ME                    │                             │   │
│ └──────────────────────────────────┴─────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│ WHAT I DO                                                            │
│                    [ five-card swatch stack ]                         │
│                    fans across the sheet                             │
├──────────────────────────────────────────────────────────────────────┤
│ SELECTED BRANDS I’VE WORKED WITH                                     │
│ ← slow continuous logo marquee →                                     │
├──────────────────────────────────────────────────────────────────────┤
│ HOW I WORK                                                           │
│ 01 CLARIFY        02 DECIDE        03 BUILD        04 HAND OVER      │
├──────────────────────────────────────────────────────────────────────┤
│ Have something worth making unmistakable?             WORK WITH ME  │
├──────────────────────────────────────────────────────────────────────┤
│                  interactive dot-matrix signature                    │
│ BASED IN              EXPLORE                           SOCIAL        │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mobile wireframe

```text
┌───────────────────────────────┐
│ MIEBAKA JOSHUA          INDEX │
├───────────────────────────────┤
│                               │
│ I design brand systems,       │
│ then build the tools that     │
│ keep them intact.             │
│                               │
│ Support line                  │
│                               │
├───────────────────────────────┤
│ SELECTED WORK                 │
│ ┌───────────────────────────┐ │
│ │ TEDx RSU                 │ │
│ │ large authored image     │ │
│ └───────────────────────────┘ │
│ ┌────────────┐ ┌────────────┐ │
│ │ RIVO       │ │ CHOPBOX    │ │
│ └────────────┘ └────────────┘ │
├───────────────────────────────┤
│ ABOUT                         │
│ Short biography               │
│ Editorial portrait            │
├───────────────────────────────┤
│ WHAT I DO                     │
│ horizontally snapped services │
├───────────────────────────────┤
│ CLIENT MARQUEE / STATIC LIST  │
├───────────────────────────────┤
│ HOW I WORK                    │
├───────────────────────────────┤
│ WORK WITH ME                  │
├───────────────────────────────┤
│ DOT-MATRIX SIGNATURE          │
│ FOOTER GROUPS                 │
├───────────────────────────────┤
│ HOME WORK EXPLORE CONTACT IDX │
└───────────────────────────────┘
```

## 5. Work archive

### Purpose

Help a hiring lead find the strongest relevant evidence quickly without presenting work as interchangeable cards.

### Structure

1. Short editorial introduction.
2. Featured TEDx RSU case study.
3. Filterable project archive when enough projects exist.
4. Each row includes project title, discipline, year, premise and authored image.
5. Hover and focus rebalance media and text proportions.
6. Touch reveals the complete card without requiring a hover simulation.

```text
WORK
Selected projects where strategy, identity and production hold together.

┌──────────────────────────────────────────────────────────────────────┐
│ TEDx RSU                       large image                  2024      │
│ A global event system given a distinct pause-and-reflect rhythm.     │
└──────────────────────────────────────────────────────────────────────┘

01  RIVO STUDIO        BRAND IDENTITY · STRATEGY             2025
02  CHOPBOX            IDENTITY · PACKAGING                  2024
03  POSTER A WEEK      SELF-INITIATED                        ACTIVE
```

## 6. Case-study template

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PROJECT-TINTED NAVIGATION                                            │
├──────────────────────────────────────────────────────────────────────┤
│ TEDx RSU                                                             │
│ Project proposition                                                  │
│ [hero media inside editorial measure]                                │
├───────────────────────┬──────────────────────────────────────────────┤
│ ROLE                  │ COLLABORATORS · YEAR · DELIVERABLES         │
├───────────────────────┴──────────────────────────────────────────────┤
│ CONTEXT                                                              │
│ CENTRAL PROBLEM                                                      │
│ PROCESS EVIDENCE                                                     │
│ STRATEGIC DECISION                                                   │
│ IDENTITY / CAMPAIGN SYSTEM                                           │
│ APPLICATIONS                                                         │
│ PRODUCTION AND HANDOFF                                               │
│ MEASURABLE OUTCOMES                                                  │
│ REFLECTION                                                           │
├──────────────────────────────────────────────────────────────────────┤
│ NEXT PROJECT →                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

- Process is visible inline.
- Rejected directions are not published.
- A quiet sticky chapter indicator may appear on expanded layouts after the reader reaches Context.
- The project palette may tint navigation and page surfaces through semantic tokens.
- The closing action is only the next project.

## 7. Explorations

### Purpose

Show taste, curiosity and self-directed range without weakening the professional Work archive.

### Structure

1. One-sentence section position.
2. Curated visual index with variable image scales.
3. Each entry shows title, self-imposed prompt, date and one decisive observation.
4. Entries may open into light editorial detail pages when the work deserves explanation.

The layout may be freer than Work, but navigation, typography, labels, contrast and interaction states remain part of the same system.

## 8. Community

### Purpose

Make contribution useful and credible, not performative.

### Structure

1. Short statement of what Miebaka gives back.
2. Resource or contribution index grouped by type.
3. Each entry names the intended audience and concrete value.
4. Downloads show file type, licence, version and updated date.
5. Empty categories are omitted.

```text
COMMUNITY
Useful things I have made, shared or taught for other designers.

RESOURCES     [templates, files, guides]
TEACHING      [talks, workshops, mentoring]
CONTRIBUTIONS [events, collaborations, open work]
```

## 9. About

1. Positioning statement.
2. Quiet editorial portrait.
3. Short biography.
4. Selected experience ledger.
5. Working principles.
6. Current location and opportunity scope.
7. `DOWNLOAD CV` with PDF format and verified file size.
8. Contact invitation.

The page should read as evidence of senior judgement, not a long personal profile.

## 10. Services

The five services retain the same names and order across the homepage and Services page:

1. Brand identity.
2. Brand strategy.
3. Visual and graphic design.
4. Art direction.
5. Print and production design.

Each service includes:

- what it changes for the client;
- typical outputs;
- one relevant project example;
- the conditions under which Miebaka is most useful.

No price cards, packages or agency-style feature comparison tables.

## 11. Writing

1. Short editorial introduction.
2. Article index with title, publication date and reading length.
3. No inferred category labels.
4. Article pages use one strong reading measure and optional related-work references.
5. Writing remains visually quieter than Explorations.

## 12. Contact

```text
LET’S MAKE SOMETHING THAT HOLDS TOGETHER.

NAME
EMAIL
I’M CONTACTING YOU ABOUT
MESSAGE

SEND MESSAGE

OR
miebakakiki@gmail.com  COPY
LINKEDIN · BEHANCE
```

- Enquiry type may distinguish role, project and collaboration without changing the form destination.
- Submission uses the approved Vercel and Resend architecture.
- Success replaces the form action area without erasing the submitted message.
- Failure keeps every entered value and provides a direct email fallback.

## 13. Keep, change and remove

### Keep

- Ultramarine identity.
- Editorial type system.
- Full-height proposition.
- Print and Screen themes.
- Paper grain.
- Five-service swatch fan.
- Slow client marquee.
- Interactive dot-matrix signature based on the script-name SVG.
- Shared editorial sheet geometry.

### Change

- Replace the current navigation with compact desktop navigation, mobile bottom navigation and one editorial Index.
- Add the support line to the hero.
- Replace the hero’s current still field with a subtle bounded material response.
- Replace the interactive halftone portrait with a quiet editorial photograph.
- Rebuild selected work around one flagship and responsive proportional cards.
- Expand case studies into the complete evidence-led chapter structure.
- Add Explorations and Community as first-class routes.
- Rebuild contact around resilient server-side delivery and direct email copying.
- Extend tokens into complete component states and project themes.
- Raise sustained reading text to 17px.

### Remove

- Borges and every font-based signature dependency.
- The current portrait development lens and halftone canvas.
- Coordinates and live clock from persistent navigation.
- Any duplicated theme or motion controls outside the Index and adaptive navigation system.
- Decorative metadata, fake status and placeholder outcomes.
- Locked `COMING SOON` case-study treatments once real case studies are published.
- Any interaction that reveals essential information only on hover.

## 14. Content required before implementation completion

### TEDx RSU

- confirmed year;
- exact role;
- collaborator names and responsibilities;
- project context and central problem;
- process images approved for publication;
- final identity and event applications;
- production or handoff evidence;
- measurable outcomes;
- final reflection.

### Explorations

- first three to six entries;
- title, date, prompt and imagery for each;
- indication of whether each needs a detail page.

### Community

- first real contribution or resource;
- audience and value;
- download, event or access details;
- licence and version where applicable.

### Global

- approved portrait;
- final CV publication approval;
- availability wording;
- current professional links.

## 15. Approved decisions

Approved by the owner on 12 October 2026:

1. Proof, Practice and Contribution model.
2. Desktop navigation destinations and mobile five-item bottom navigation.
3. Homepage sequence.
4. `HOW I WORK` using Clarify, Decide, Build and Hand over.
5. Work archive structure.
6. Case-study chapter structure and quiet sticky chapter indicator.
7. Explorations and Community structures.
8. Full keep, change and remove map.
