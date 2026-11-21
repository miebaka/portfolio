# Work archive: The Filing Cabinet (v2)

**Status:** Creative direction for discussion. Not approved for implementation.
**Scope:** `work.html`, plus a small shared CSS/JS include on case-study pages (arrival styling only). No changes to published case-study content or URLs.
**Lenses applied:** Casey (idea and metaphor), creative direction (idea / communication / execution), Loewy (restraint, MAYA), Emil (motion, interaction craft).

---

## 1. Governing idea

> **The drawer is the system.** Every folder is cut, numbered and labelled to one rule, so the page proves a brand-systems claim by being unusually well ordered.

v1 framed the cabinet as an *evidence archive*. That reads as detective or police-evidence, and it pulls away from a portfolio about building brand systems that stay intact. A filing cabinet's real subject is **order and retrieval**. The rigour of the drawer (consistent tab cuts, numbering, year dividers, one label style) is the argument. The metaphor should be recognisable in a glance and credible in a study.

**What must register in 2 seconds:** "a drawer of files, and some of them open."
**What rewards inspection:** the tab-cut rhythm, the numbering, the register plate, the way the page behaves like physical paper.

---

## 2. Experience statement

You look straight down into an open drawer. It runs the height of the page and is full of folders. Scrolling travels along the drawer. The folder you are passing is named. Hover one and it lifts out of the stack, exposing its case-study title on the lip. Click, and it pulls clear of the drawer, a sheet rises out of it and becomes the case study.

| State | Trigger | What the user sees |
| --- | --- | --- |
| **Read** | Scroll | Every tab carries the project name. The folder crossing the reading axis is also named large on the drawer-front register plate. |
| **Lift** | Hover (fine pointer) or keyboard focus. On touch, the folder at the reading axis. | Folder rises about 20px, revealing a lip with the case-study title, discipline and year. |
| **Extract** | Plain left-click or tap | Folder pulls clear, drawer dims, a paper sheet opens from the folder to full viewport, navigation lands on matching paper. |
| **Return** | Back | Scroll position and the folder you left are restored. The folder drops back into place. |

---

## 3. Drawer anatomy (overhead)

- **Camera:** orthographic, 90 degrees straight down. No perspective, no rotation, no 3D showroom.
- **Why you can see labels from directly above:** folders in a drawer lean toward the front, so each shows a strip of its front face and its cut tab. Every folder is drawn as one full-width **band** (about 56px visible on desktop, 64px on mobile) with a tab rising from its top edge.
- **Stacking:** the folder nearer the viewer sits on top. Each band's lower part is covered by the next one, with a soft 10px shadow where one edge falls on another. The lip lives in that covered strip, which is why lifting a folder reveals it with no extra elements.
- **Tab cut:** three staggered positions (left, centre, right), repeating A, B, C down the drawer. This is how real tabs work, it solves label legibility, and it gives the drawer its visual rhythm.
- **Filing order:** newest at the back (top of the page), older work toward the front. The page opens on the latest case.
- **Dividers:** year guide cards (2024, 2025, 2026) with their own tab. They are real filing furniture and add truthful density.
- **Frame:** the cabinet frame is stationary; only the drawer contents scroll. A fixed **register plate** sits on the drawer front (bottom of the viewport, clear of safe-area insets) showing `No. 02 / 07  CHOPBOX  2026` for the folder at the reading axis.

---

## 4. Content integrity and density budget

At the time of writing there are **three published cases**: TEDx Rivers State University, Rivo Studio and ChopBox.

| Item | Count | Behaviour |
| --- | --- | --- |
| Live folders | 3 | Real `<a href="work/[slug].html">`. Lift, lip, extract. |
| Sealed folders | up to 4 | Same stock and tab cut, tab reads `IN PREPARATION`, strap or seal graphic. No lift, no pointer cursor, not focusable, not linked. |
| Year dividers | 3 | Structural. Not interactive. |
| Total bands | about 10 | A drawer that reads as full without lying. |

Rules:
1. **Sealed folders must say what they are.** Status is legible in the tab, not implied by a missing link.
2. **Do not add a sealed folder you will not open within about a quarter.** A permanently sealed folder is a stale promise.
3. **Mind the ratio.** Three live folders among ten bands is acceptable. Three live among eighteen tells a hiring manager the portfolio is mostly empty.
4. **Do not pad the drawer to force scroll.** At about 10 bands on desktop the drawer is roughly one and a half viewports. Scroll is real but short, which is honest. On mobile it is longer.
5. Essays and experiments belong in a separate, clearly labelled drawer later, reusing this component. Out of scope for v2.

---

## 5. Interaction specification

All values are starting points to tune in a prototype. Motion uses `transform` and `opacity` only. Shadows are pre-rendered on a pseudo-element whose opacity animates; `box-shadow` is never transitioned.

```css
--ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--lift: 20px;   /* 24px on mobile */
```

### 5.1 Read (scroll)
- Tabs always show the project name (Mono, uppercase, 11 to 12px). Names are never hidden behind a gesture, so touch and keyboard users get the same information.
- Reading axis: one invisible line at about 40% of viewport height, detected with `IntersectionObserver` (`rootMargin: "-40% 0px -59% 0px"`). The intersecting folder gets `data-reading="true"`.
- Register plate updates **instantly**. No animation: this fires constantly during scroll. The plate is `aria-hidden` (it duplicates the tab labels) and is never an `aria-live` region.
- Do **not** dim non-focused tabs below AA contrast to fake emphasis. Differentiate the reading folder by weight and the register plate, not by fading the others.

### 5.2 Lift (hover, focus, axis)
| Property | Value |
| --- | --- |
| Enter | `translateY(calc(var(--lift) * -1))`, 160ms, `--ease-out` |
| Exit | 110ms, `--ease-out` (faster out than in) |
| Shadow | `::after` opacity 0 to 1, same timing |
| Lip content | Case-study title (display face, one line, ellipsis at about 48 characters), discipline and year in Mono. Fades in over 120ms. |
| Adjacent hover | Moving folder to folder swaps instantly: no delay, no enter animation on the new lip, old one drops over 110ms |
| Gating | Pointer hover only inside `@media (hover: hover) and (pointer: fine)` |
| Keyboard focus | Lift state with **no animation**. Keyboard-initiated actions are never animated. |
| Focus ring | 2px coral outline, 2px offset, not clipped by the stack; verify at least 3:1 against both paper and ink |
| Sealed folders | No lift. Hover shows nothing. Lift is an affordance and a promise to open. |

**Hit-target stability (critical).** The pointer target is a static wrapper covering the resting band plus the lip zone. Only the inner face transforms. Otherwise the folder lifts, the pointer is suddenly outside it, it drops, the pointer is inside again, and it flickers.

**Scroll vs hover.** Folders slide under a stationary pointer while scrolling, firing hover constantly. Add `.is-scrolling` on scroll and remove it 140ms after scroll end; while set, folder faces ignore pointer hover.

### 5.3 Extract (click)
Only for an unmodified left-click or tap. Ctrl/Cmd/Shift/middle-click and right-click behave as normal links with no animation.

| Time | Step |
| --- | --- |
| 0 to 160ms | Folder pulls clear: `translateY(-48px) scale(1.04)`, deep shadow in. One overlay on the cabinet dims to about 35% ink (single layer, no per-folder dimming). |
| 100 to 340ms | A paper sheet, full-viewport and fixed, opens from the folder's rectangle to the whole viewport using `clip-path: inset(...)` to `inset(0)`, `--ease-in-out`. The sheet is blank paper, so there is nothing to blur. |
| about 340ms | Navigate. Total under 450ms. |

- The sheet's colour equals the case page's `html` background, so first paint on arrival matches the final frame.
- **Keyboard activation (Enter) skips the extraction** and navigates immediately. Same for reduced motion.
- Built with WAAPI. Interruptible; ends with `finished` then `location.assign`. It never blocks the link: if JS fails, the `<a>` still navigates.

### 5.4 Arrival (case page)
- Page paints paper immediately. Hero elements enter with a 40ms stagger, 4 elements maximum, each 240ms, `translateY(8px)` and `opacity` with `--ease-out`. Nothing blocks interaction while it plays.
- Progressive enhancement: opt both pages into `@view-transition { navigation: auto; }`. Where supported, the browser holds the old paper sheet until the new page is ready (up to a few seconds) and crossfades, which removes load-time white flashes. It is a safety net, not the animation.

### 5.5 Return
- Store the last slug in `sessionStorage`; restore scroll and move focus back to that folder's link.
- Folder re-files with a 160ms `translateY(-24px)` to `0`.
- **bfcache:** on `pageshow` with `event.persisted`, reset all animation state, remove the dim overlay and sheet, and clear `.is-scrolling`. Otherwise Back can return to a page frozen mid-extraction.

### 5.6 Reduced motion
Keep opacity, remove travel. Lift becomes a lip fade only (120ms). Extract becomes immediate navigation with a 120ms opacity fade. Register plate unchanged.

---

## 6. Visual direction

**Decision (replaces the v1 A/B choice): "B-plus."** Precision structure with warmth from paper variation and one soft light.

- **A (manila) rejected** as the category default. A manila folder is the first picture anyone has of a file. It earns recognition, not ownership.
- **B (clinical) adopted with correction.** Numbered tabs, embossed rules and strict alignment carry the "system" idea. A purely monochrome drawer risks coldness, so warm it through paper stock.
- **Palette** (tokens from the portfolio identity; swap if the system changes): drawer interior in `ink`; folders in three subtly different paper stocks, cycled so the stack never reads as wallpaper; `ultramarine` for the register plate and the sealed strap; `coral` **only** for interaction feedback (focus ring, lip underline). Real project artwork supplies any other colour.
- **Type roles are tokens, not fixed fonts:** `--font-label` (tab labels, register, lip metadata: uppercase, tabular figures, legible at 11 to 12px) and `--font-display` (lip title). v1 names Geist Sans and Geist Mono as approved; keep them as placeholders only if the identity type stack is settled. Nothing in the interaction depends on the faces.
- **Surface:** no texture in the first build. Paper-edge highlights (1px light top, 10px soft shadow bottom) and one soft top light do the work. Add grain last, only if the flat version feels dead, at about 3% opacity on folder faces and never behind text.
- **Restraint (Loewy):** the drawer, the tabs and the register plate are the only inventions. No rotating, no parallax, no cursor-following light, no sound.

**MAYA position:** familiar cues (drawer, folder, tab, label holder) carry recognition and trust. The advance is the system rigour (staggered cut, numbering, register plate) and the ink-and-ultramarine treatment. Novelty serves the idea rather than fashion.

---

## 7. Implementation

**CSS first.** The page works with CSS alone. JS adds only: reading-axis detection, scroll-hover suppression, the extraction sequence, return restoration and bfcache reset.

```html
<main class="cabinet" aria-labelledby="work-title">
  <h1 id="work-title" class="sr-only">Work</h1>
  <div class="register" aria-hidden="true">No. 02 / 07  CHOPBOX  2026</div>

  <ol class="drawer">
    <li class="divider"><span>2026</span></li>

    <li class="folder" data-tab="a">
      <a class="folder__face" href="work/chopbox.html">
        <span class="folder__no">No. 02</span>
        <span class="folder__tab">ChopBox</span>
        <span class="folder__lip">
          <span class="folder__title">[Case-study title]</span>
          <span class="folder__meta">Brand identity, 2026</span>
        </span>
      </a>
    </li>

    <li class="folder folder--sealed" data-tab="b">
      <div class="folder__face">
        <span class="folder__tab">In preparation</span>
      </div>
    </li>
  </ol>
</main>
```

- Tab order and DOM order are the same as visual order (newest first). No `column-reverse` tricks.
- Prefer WAAPI. Add GSAP only if it is already loaded sitewide; this sequence does not justify the dependency on its own.
- **No Lenis in v1.** The signature moment is scroll-reading; wheel smoothing lengthens inertia under a stationary pointer, worsens hover churn and complicates scroll restoration. Revisit only if native scroll feels steppy in testing.
- `will-change: transform` only on the hovered or extracting folder, never on all of them.
- Cross-document view transitions: confirmed in Chrome 126+ and Safari 18.2+, and Firefox support remains partial or limited depending on source, so nothing may depend on them. Both documents must opt in, navigations must be same-origin, and the transition is skipped if navigation runs long. `pageswap` and `pagereveal` event support is inconsistent across sources; verify in target browsers before using them.
- **Scope amendment:** opting into view transitions and styling arrival requires a small shared CSS/JS include on case-study pages. This changes templates, not published content or URLs. v1's scope line contradicted its own "opt both pages in" instruction.

---

## 8. Accessibility and input parity

- Each live folder is one link. Its accessible name includes project, case title, discipline and year, via visually hidden text rather than an `aria-label` that overrides visible text.
- Sealed folders are list items with visible status. Not links, not focusable, not announced as buttons.
- Touch: bands at least 64px tall, tab target at least 44px. The folder at the reading axis shows its lip as the hover substitute. **One tap opens.** There is never a two-tap pattern.
- Remove v1's "Escape closes previews": there is no preview state in this model.
- Focus must scroll into view clear of the register plate (`scroll-margin-bottom`).
- Contrast: tab labels and lip text at least 4.5:1 on every paper stock.
- 200% zoom: bands reflow, nothing clips, the lip stays readable.
- Mobile keeps the overhead drawer (full-width bands, taller, tab width about 55%). The "dossier cards" fallback from v1 survives only for no-CSS rendering.

---

## 9. QA and acceptance criteria

| Check | Pass condition |
| --- | --- |
| Glance test | A stranger says "filing cabinet" within 2 seconds and can point to a clickable folder |
| Honesty | No sealed folder lifts, links, or takes focus; all three live folders resolve to real URLs |
| Hover stability | No flicker at the bottom edge of a lifted folder; no layout shift (CLS 0) |
| Scroll | Hover does not fire while scrolling; register updates with no animation; stays at 60fps on a mid-range Android phone |
| Click | Total under 450ms; modifier-clicks behave as normal links; Enter navigates instantly |
| Return | Scroll position and focus restore; bfcache return shows no frozen sheet or dim overlay |
| No JS | Drawer renders, lifts via CSS hover and focus, links navigate |
| Reduced motion | No travel, only opacity |
| Devices | 320, 390, 768, 1440px, 200% zoom; Chrome, Safari, Firefox; VoiceOver labels; touch and keyboard |
| Slow motion | Review all sequences at 3x duration and again the next day |

---

## 10. Decisions requested before implementation

1. **Lip content:** the case-study title for each of the three live cases (about 48 characters maximum). Assumption in this draft: "project name" is the short tab label and "case-study name" is the longer title on the lip.
2. **Sealed folders:** how many (recommended: up to 4), with an honest status line for each, and a rule for removing any that stall.
3. **Art direction:** confirm B-plus, or veto it for A.
4. **Scope:** approve the small shared include on case-study pages.
5. **Drawer length:** keep the honest short drawer (recommended), or add Explorations and Writing as further drawers in the same cabinet later.

---

## Appendix: what changed from v1 and why

| Before | After | Why |
| --- | --- | --- |
| "Evidence archive" thesis | "The drawer is the system" | Evidence reads as police or detective work; order and retrieval match a brand-systems portfolio |
| Folder rises 12px when it crosses the axis | Axis shows the name on a register plate; lift is hover or focus (and the touch substitute) | Matches the new brief: scroll reads, hover lifts |
| No lip definition | 20px lift reveals a lip strip that was hidden under the next folder | Physically honest, no extra DOM, room for readable text |
| Tabs vaguely "narrow" | Three staggered tab cuts, A, B, C | Real filing logic; fixes legibility and creates rhythm |
| `transition` and shadow unspecified | `transform` and `opacity` only; shadow on `::after` | Performance and interruptibility |
| Hover target moves with the folder | Static hit wrapper, inner face transforms | Prevents hover flicker at the edge |
| Hover fires during scroll | `.is-scrolling` suppression | Folders slide under a stationary pointer |
| Enter opens with sheet animation | Enter navigates instantly | Keyboard actions are never animated |
| "Escape closes previews" | Removed | No preview state exists |
| GSAP plus optional Lenis | WAAPI, no Lenis in v1 | Smaller, interruptible; Lenis harms scroll-reading |
| Cross-document transitions as part of the main path | Progressive enhancement only | Firefox support is limited; navigation must never depend on it |
| Scope: `work.html` only | Plus a small include on case pages | Opt-in needs both documents |
| Mobile swaps to dossier cards | Mobile keeps the overhead drawer | Dropping the metaphor on the device most recruiters open links on removes the idea |
| A or B art direction | B-plus, identity-led | Manila is the category default; clinical alone is cold |
| Visually packed cabinet vs. 3 cases (unresolved tension) | About 10 honest bands: 3 live, up to 4 sealed, 3 dividers | Density without implying finished work that does not exist |

**Verdicts**
- **Casey:** Promising, now Clear. The metaphor is specific to the subject, and its proof is the drawer's own order.
- **Creative direction:** Idea Strong, Communication Developing (depends on lip titles and sealed-folder copy), Execution Developing (needs a prototype to tune lift, band height and shadows).
- **Loewy:** REFINE. The concept is sound and not too familiar or unfamiliar; the open risks are the live-to-sealed ratio and lip legibility.
- **Emil:** Frequency-appropriate motion. Scroll and keyboard stay instant, hover is short, click is the one rare moment that earns extra time.

**Sources checked:** caniuse, "Cross-document view transitions" support table; Chrome for Developers, "Cross-document view transitions for multi-page applications" (developer.chrome.com/docs/web-platform/view-transitions/cross-document). Browser support changes quickly, so recheck before build.
