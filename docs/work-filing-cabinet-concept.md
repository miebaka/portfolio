# Work archive — The Filing Cabinet

**Status:** Creative direction for discussion. Not approved for implementation.
**Scope:** `work.html` only. No changes to published case-study content or URLs.

## Experience statement
Browse the work like a physical evidence archive. From above, see a drawer of tactile
folders. Scroll through the files to inspect their labels. Opening one feels like
extracting a document: a sheet rises, unfolds and becomes the case-study opening.

The visual metaphor reinforces the portfolio's thesis: each project is an
investigation, and a strong design decision is evidence.

## Proposed sequence
1. **Browse:** A stationary, art-directed cabinet frame surrounds a native-scroll
   folder track. Orthographic/top-down perspective, real paper edges, understated
   texture, narrow tab labels in Geist Mono.
2. **Inspect:** The folder that crosses the reading axis rises about 12 px and
   advances above neighbouring folders. A title/year/discipline label becomes
   readable. Pointer hover and keyboard focus reveal the same project metadata.
3. **Open:** Activation lifts the selected tab and pulls an off-white paper sheet
   upward (GSAP). The sheet expands to the viewport and navigation enters the
   matching `work/[slug].html` case study. Prefer native cross-document
   View Transitions where supported; the fallback navigates after a short
   accessible 200–350ms sheet lift, never blocks the link.
4. **Return:** Back navigation preserves the previously selected folder and
   returns to its scroll position when possible. Without JS, a conventional
   linked Work list remains directly navigable.

## Content integrity
At the time this direction was drafted there are **three published cases**:
TEDx Rivers State University, Rivo Studio and ChopBox. A visually packed cabinet
cannot truthfully imply many more finished case studies. Coming-soon items can be
presented as sealed folders only if their status is explicitly legible; they must
not pretend to link to published project pages. Essays and experiments may be a
separate drawer, labelled clearly as different types of content.

## Visual direction
- The cabinet must look top-down, **not** like a rotating 3D showroom.
- A constrained neutral palette: warm paper, smoked graphite or ink-black
  cabinetry. Real project artwork provides the occasional colour.
- Title display: approved Geist Sans. Index tabs and technical labels: Geist Mono.
- Surface texture is subtle: avoid a photorealistic noise wash that compromises
  legibility, contrast or loading speed.
- A horizontal drawer metaphor can scroll vertically to preserve familiar
  wheel and keyboard navigation.

## Implementation and QA
- DOM/CSS first: real `<a>` elements for every published folder, real case hrefs.
- GSAP for focused lift / paper extraction, not for navigation correctness.
- Lenis may smooth desktop wheel input, but mobile remains native-scroll.
- For real case-study navigation between HTML documents, opt both pages into
  same-origin cross-document transitions with CSS `@view-transition { navigation: auto; }`
  when supported. `document.startViewTransition()` applies to the same-document
  prototype instead; it cannot initiate a cross-document transition.
  Do not gate route changes on experimental APIs.
- Full keyboard support: Tab reveals folder, Enter opens, Escape closes previews.
- Full reduced-motion support: skip extraction and navigate immediately.
- Mobile fallback: vertical labelled dossier cards rather than tiny top-down tabs.
- Test 320/390/768/1440px, 200% zoom, no-JS routing, focus, URL transitions,
  navigation history, voice-over labels and contrast.

## Decision requested before implementation
Choose one cabinet art direction:
**A — Tactile archive:** warm manila folders, charcoal metal rails, soft light.
**B — Precision archive:** monochromatic document drawer, numbered tabs,
embossed rules and clinical paper.

The two can share one interaction architecture, so the decision affects
art direction rather than basic navigation.
