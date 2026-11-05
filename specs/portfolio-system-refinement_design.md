# Portfolio system refinement: technical design

## Objective

Refine the existing static portfolio without changing its information architecture or case-study URLs. The change standardizes the type system, simplifies the two editorial indexes, reuses the evidence-trail interaction for article navigation, replaces the About particle threshold with an image-and-copy composition, and adds an evidence-bounded experience ruler.

## Frontend architecture

- Keep the existing data-render-module split.
- Treat `data/projects.js`, `data/case-studies.js`, and static fallbacks as the single naming surface for TEDx Rivers State University while retaining the stable `tedx-rsu` slug.
- Keep the editorial-index renderer shared. Home and Notes callers will pass only the content each index needs rather than hiding unwanted descriptions in CSS.
- Extend `article-navigation.js` with evidence-trail-compatible semantic markup. The navigation remains a real `nav` with anchor links, and every generated ID is derived from authored headings.
- Replace the About particle markup and runtime initialization with a static responsive image-and-copy hero. This removes a page-specific canvas and preserves a useful no-JavaScript result.
- Render experience from `siteConfig.experience` as a chronological ruler. Store explicit start and end years beside the human-readable period so visual positions are deterministic and do not depend on parsing display copy.

## Typography contract

- Headings: Television Sans only, with ExtraLight at weight 200, Regular at 400, and Medium at 500. No heading may exceed 500.
- Labels: Josefin Sans only.
- Interface and body copy: Google Sans Flex only.
- The existing signature artwork is an authored graphic treatment and remains outside the text-role contract.
- Remove the Television Sans Bold face and the monospace Now Playing token from the shipped CSS contract.

## Interaction design

- Article contents links use a bottom-origin color fill, index, title, and visible focus state derived from the Evidence trail interaction.
- Hover enhancement is limited to fine pointers. Keyboard focus receives the same filled state.
- Reduced-motion users receive immediate state changes with no transform transition.
- The experience ruler is readable without animation and does not require pointer interaction.

## Responsive behavior

- Home and Notes indexes occupy the full width of their existing 12-column container.
- Article contents switches from a sticky rail to a two-column mobile list, then one column at narrow widths.
- About uses a 5/7 image-copy split on wide screens. The text begins to the right of the image and never overlays it. Mobile stacks image above copy.
- The ruler scrolls vertically at every size, with years and tick marks held in a narrow leading column.

## Security and data boundaries

- This is a static frontend change. There are no new endpoints, authentication flows, database writes, cookies, or privileged operations.
- Generated project, writing, and experience strings continue through the existing HTML escaping utility.
- External profile URLs continue through the existing safe URL handling and use appropriate `rel` attributes where opened in a new tab.
- LinkedIn is used only as a read-only public evidence source. The implementation will not add unsupported employers, dates, claims, or private profile data.

## Verification

- Update unit, integrity, visual-contract, and end-to-end expectations for renamed content and simplified indexes.
- Run the content build, full test suite, CSS contract, budget check, and focused browser checks at desktop and mobile sizes.
- Run taste lint and rendered inspection before and after, then critique the screenshots for hierarchy, alignment, typography, interaction affordance, and mobile composition.
