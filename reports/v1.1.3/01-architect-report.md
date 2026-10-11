# Architect report — v1.1.3

## Decision

Treat this release as a contract repair, not another visual layer. The current production graph is small (`styles/main.css` imports three files; `js/main.js` reaches fifteen modules), but the source tree and the two active CSS files retain several generations of superseded implementation. Restore the missing footer information, make the contact CTA the single primary-action contract, complete the mobile platform baseline, and delete only files proven unreachable from the production graph.

## Current production graph

- HTML: ten root pages, four case-study shells, and two writing pages all load `styles/main.css` and `js/main.js`.
- CSS: `styles/main.css` imports only `foundations.css`, `components-v4.css`, and `pages-v4.css`. The build recursively inlines those into one production CSS file.
- JavaScript: `js/main.js` imports the renderers and behaviours listed in that file. The build copies only this reachable graph.
- Data: `data/site.js` is the source of truth for name, location, navigation, social links, projects, clients, capabilities, writing, and case studies.
- Runtime: static HTML/CSS/ES modules, Last.fm read-only request, and a local `mailto:` handoff. There is no server, database, authentication, account model, or privileged state.

## Critical findings

### A-01 — The footer renderer discarded information that still exists in the data model

`data/site.js` still contains `SITE.location` and four `SITE.socials`. `js/render/footer.js` renders only Explore and Privacy. This is a presentation regression, not missing content. The site-integrity test currently codifies the regression by asserting that `Based in` and `Social` must not appear; that assertion must be reversed.

**Contract:** the footer panel contains three labelled groups in one responsive horizontal row:

1. `Explore` — Work, About, Services, Writing, Contact, Privacy
2. `Based in` — Lagos, Nigeria
3. `Social` — Behance, LinkedIn, Instagram, Twitter

Each group uses the same label-then-inline-items grammar. External social links use `safeURL`, `target="_blank"`, and `rel="noopener noreferrer"`. At narrow widths the groups wrap or stack without changing their reading order. The dot-matrix signature stays full width beneath them.

### A-02 — The primary button rule is singular, but control behaviour is still split

The active cascade contains exactly one `.btn` block at the end of `styles/pages-v4.css`, and the contact submit is the clearest reference implementation. It defines a 48px target, filled semantic action colour, focus ring, hover colour/elevation, press compression, and disabled state. The legacy `.btn--primary` class has no active rules and adds no value.

Actual `<button>` elements also include the mobile menu and theme toggle. They are utility controls, so they should not inherit the CTA's filled geometry, but they should inherit the same interaction timing and state logic: focus ring, pointer-gated hover, 120ms press compression, disabled semantics, no `transition: all`. Define the primary CTA once as `.btn`; either remove `.btn--primary` from markup or keep it only as a temporary no-op while tests prohibit any selector for it. Document the distinction between **primary action** (`.btn`) and **utility control** (`.site-nav__menu-btn`, `.theme-toggle`).

### A-03 — The mobile baseline is incomplete

All pages use only `width=device-width, initial-scale=1.0`. They are missing `viewport-fit=cover` and `interactive-widget=resizes-content`, scheme-specific theme colours, safe-area padding, iOS text-size normalization, tap-highlight treatment, and the 16px coarse-pointer form-control floor.

Specific layout risks in the active cascade:

- The mobile navigation panel uses fixed positioning but has no `max-height`, scroll container, or safe-area-aware insets.
- The footer's final override changes the panel to `display:block`; restoring three groups without a new layout contract would place them as an unstructured vertical stream or create crowding.
- Work cards use `70svh` minimum heights on mobile, creating unusually long repeated screens; cap them with a bounded `clamp()` and an aspect-aware minimum.
- The homepage profile media is pushed to the right at `78vw`; at very narrow widths the visual alignment can look accidental. Use full available width with a bounded max-width and explicit left alignment.
- The now-playing grid can truncate the track, but the label plus arrow still compete under 360px. Allow the track to occupy a second row at the smallest breakpoint.
- Experience rows hide neither long role text nor metadata intelligently below 360px; make metadata a full-width second row and ensure the toggle stays aligned to the top.
- Project archive summaries suppress category/year, but the reveal padding is independently hardcoded instead of using the shared list inset token.
- Large headline clamps are defined repeatedly across historical V5–V13 layers. The final rules work by source order, making breakpoint changes fragile.
- Form controls have no mobile font-size floor, so iOS can zoom on focus.
- `body` uses `100vh`; use `100svh` as the stable minimum and opt into `100dvh` only for keyboard-aware surfaces.

### A-04 — The active CSS is an append-only history, not a maintainable system

`components-v4.css` and `pages-v4.css` include successive V5–V13 override sections. Many selectors are defined repeatedly and then neutralized later. Examples include `.work-flick`, `.discipline`, `.service-detail`, `.site-footer__panel`, `.home-profile__listening`, and mobile media queries. This is the main source of inconsistent responsiveness: a fix at the apparent owning rule may be overridden hundreds of lines later.

**Refactor constraint:** preserve rendered output while consolidating each component into one final selector family. Do not add V14. Prefer this order inside the active CSS:

1. component base
2. desktop enhancement
3. tablet (`max-width: 60rem`)
4. mobile (`max-width: 48rem`)
5. narrow mobile (`max-width: 23.5rem`)
6. input-capability media (`hover`, `pointer`, reduced motion/transparency)

### A-05 — Proven dead source files remain tracked

The following files are unreachable from `styles/main.css` and therefore absent from the built CSS. They are safe code-deletion candidates after one final `git grep` confirms no non-archival consumer:

- `styles/base/*`
- `styles/components/*`
- `styles/sections/*`
- `styles/tokens/*`
- `styles/cohesion.css`
- `styles/editorial-system.css`
- `styles/swiss.css`

The following JavaScript modules are unreachable from `js/main.js` and the build graph:

- `js/core/case-rail.js`
- `js/core/motion-director.js` (also imports GSAP paths that are not part of the declared dependency contract)

`js/core/kinetic.js` is reachable but intentionally empty. Remove the import and invocation, then delete the file unless a near-term feature has an explicit owner. `data/drafts.js` is excluded from production and has no runtime reference; treat it as archival content, not application code. Delete it only if its contents are already represented elsewhere.

The cleanup must also update `README.md`, whose architecture section still directs contributors to the dead token/component/section tree. Historic reports and design specs can retain dated references; they are records, not runtime instructions.

## Implementation sequence

### 1. Lock contracts with tests

- Replace the footer regression assertion with positive checks for Explore, Based in, location, Social, and all social labels.
- Assert every external footer link has `target="_blank"` and `rel="noopener noreferrer"`.
- Assert there is exactly one `.btn` definition and no `.btn--primary` selector.
- Assert all primary action markup uses `.btn` and the contact submit remains the reference.
- Assert all production pages contain the expanded viewport directive and two scheme-aware theme-colour metas.
- Assert mobile baseline rules exist: safe-area variables/use, coarse-pointer 16px input floor, `-webkit-text-size-adjust`, `-webkit-tap-highlight-color`, and pointer-gated hover.
- Add a source-graph test that fails if the retired CSS directories or dead JS modules return.

### 2. Restore footer data without duplicating content

- Build `explore`, `location`, and `socials` from `SITE` in `js/render/footer.js`.
- Use a shared footer-group markup shape and the existing `site-footer__label` / `site-footer__links` contract.
- Keep the signature mount and its progressive enhancement unchanged.
- Update all no-JS footer fallbacks so location and social links remain available if the module graph fails.

### 3. Make the contact CTA the action source of truth

- Keep one `.btn` rule in `components-v4.css` (buttons are components, not page styles).
- Move all hover/focus/active/disabled rules with it.
- Remove `.btn--primary` from all HTML and generated markup.
- Centralize shared interaction durations as component variables or existing motion tokens; apply the same state choreography to menu/theme utility controls without forcing primary visual treatment onto them.
- Make `aria-disabled="true"` spans non-interactive and visually identical to disabled `.btn`; real buttons use the `disabled` attribute.

### 4. Complete the mobile platform baseline

- Update every HTML page's viewport and theme-colour metadata.
- Add `env(safe-area-inset-*)` to page/nav/footer edge padding while preserving the existing `--page` minimum.
- Set `-webkit-text-size-adjust:100%`, a transparent or tokenized tap highlight, and `touch-action:manipulation` on interactive controls.
- Add `user-select:none` only to buttons/control labels, never to content.
- Use `min-height:100svh` for the document and safe dynamic-height handling for the menu.
- Add coarse-pointer input/textarea/select font-size of 16px.
- Gate all hover-only reveals behind `@media (hover:hover) and (pointer:fine)`; provide visible/focus/tap equivalents for touch.
- Normalize the final mobile layouts for home, work, about, services, writing, contact, privacy, articles, 404, and locked work pages at 320, 375, 768, and 1024 CSS pixels.

### 5. Remove old code by reachability, then consolidate active CSS

- Delete the unreachable CSS tree and dead JS modules listed in A-05.
- Remove the empty kinetic entrypoint.
- Consolidate repeated V5–V13 rules by component, deleting overridden declarations rather than appending new ones.
- Remove stale comments that describe retired layouts.
- Update README architecture instructions to the three-file source system, or split those three files into a new explicit system only if the build imports every new file.

### 6. Verification gates

- `npm test` and production build.
- Static link/asset/CSP checks already in the suite.
- Browser console clean on all route families.
- Responsive screenshots at 1440×900, 768×1024, 375×812, and 320×568 in light and dark modes.
- Keyboard pass: nav open/close/Escape, focus visibility, contact validation, details disclosure, all links.
- Touch emulation pass: no hover-dependent content, no horizontal overflow, no iOS form zoom assumptions.
- Performance sanity: no new dependency, one CSS request retained, no new render-blocking script, signature canvas disabled under reduced motion.

## Security, privacy, accessibility, and performance

- **Backend/database/auth:** N/A. This release must not introduce any of them.
- **Secrets:** the Last.fm API key is public client-side data. Do not add private credentials. If the provider treats the key as confidential, proxying it would be a separate backend/security project.
- **Links:** sanitize all data-authored hrefs with `safeURL`; external links get `noopener noreferrer`.
- **Form privacy:** retain the plain-language statement that the site stores no message; the form remains a local mail-client handoff.
- **Accessibility:** 48px primary target, 44px utility targets, visible focus, semantic headings/landmarks, no motion-only state, reduced-motion fallback, logical DOM order, and live form status.
- **Performance:** deletion reduces repository ambiguity; CSS consolidation should reduce source and shipped CSS. Do not add Tailwind or another runtime/design dependency to this static site. Apply design-system principles through existing semantic tokens.

## Acceptance criteria

- Based In and Social are visible in the footer on every page, arranged horizontally with Explore at desktop widths and cleanly stacked/wrapped on mobile.
- The dot-matrix signature retains the largest share of footer area.
- Every primary action matches the contact submit in geometry and behaviour; there is one `.btn` contract.
- No page overflows horizontally at 320px.
- All interactive targets are at least 44×44px; `.btn` remains at least 48px high.
- Content needed to understand or operate the site is never hover-only.
- The production graph contains no retired CSS tree, dead motion director, dead case rail, or empty kinetic initializer.
- The full automated suite and light/dark responsive visual pass succeed.
