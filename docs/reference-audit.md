# Portfolio reference audit and design decision

> Owner revision, 6 September 2026: the implementation decision below is historical. The owner replaced the enquiry forms with one exact SVG logo extrusion on Home; removed all other 3D objects and small decorative captions; restored Now Playing and the client-logo marquee; specified flush-left black project names with a Three.js colour fill and a six-column desktop Work catalogue. These explicit choices supersede the earlier fieldbook implementation contract.

Research snapshot: 5 September 2026. This is an evidence-labelled audit, not a claim that every linked site was successfully visited.

## Coverage and limits

The two readable Sites of the Year collection pages yielded **53 entries**. The readable Design Agencies landing page yielded **31 entries**. This ledger covers every one of those **84 retrieved entries**. Agency pagination repeatedly failed, direct Awwwards browser navigation was refused, and some individual records were unavailable. Therefore the entire paginated agency directory and every live experience have **not** been exhaustively reviewed. A listing or award description cannot establish live accessibility, motion quality, mobile behaviour or performance; none is scored from metadata.

Two selected agency homepages, LIRCLE and Studio Merge, received live desktop screenshot and DOM inspection. The remaining available award records support concept-level comparisons only. Mendo’s mismatched older edition is explicitly excluded. Unavailable entries remain in the ledger rather than disappearing from the sample. Directory membership is not treated as a recommendation or proof of quality.

Sources: [Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), [second page](https://www.awwwards.com/websites/sites_of_the_year/?page=2), [Design Agencies](https://www.awwwards.com/websites/design-agencies/). Each row links its attempted matching record; unavailable links are not asserted to identify a verified edition.

## Verdict on the first rebuild

REFINE the Swiss structure; REBUILD the identity of the opening. The first version had appropriate restraint and differentiated listings, but “Clarity in thought. Character in form.” and a stack of blue rings could belong to almost any studio. Making those rings more complex would not make the site more personal. The About page is more revealing than the old hero: inquisitiveness, a reason behind every decision, affection for snakes and games, and a determination to build a standard from Lagos.

The chosen direction is a **personal fieldbook**. Miebaka Joshua is the opening statement. A staggered two-line masthead introduces controlled asymmetry. Small numbered captions and a strict underlying grid give experiments a place to live. The voice is direct and human: “I question things. Then I give them form.” The flowing cobalt line alludes to curiosity and organic form without making a literal snake mascot.

The alternatives were a cinematic world (memorable but wrong positioning and heavier), a pure typographic archive (fast and fitting but insufficiently expressive), and the fieldbook (strong personal authorship with a clear route to evidence). The third combines typographic discipline with one ownable behaviour. It does not borrow another studio’s logo, assets, shader code or copy.

## What the references change

- Pangram, Synchronized, ViV and the observed Merge homepage strengthen the case for typography and a legible archive. Merge’s extremely compressed tracking is not copied.
- Bruno Simon, Messenger, Chungi and Undead Fish show why an interaction should reveal its author. Their games or illustrative worlds are not interchangeable templates for this user.
- The observed LIRCLE hero communicates clearly, but its centred agency promise, heavy uppercase display and two competing actions are weaker fits than a personal name and one route to the work.
- Opal, Simply Chocolate and the documentary examples suggest that effects earn their place through the subject. Project images remain readable and undistorted.
- The two supplied listing images remain the governing references: typographic names and cobalt initials on Home; compact labels above upright images on Work. Work now uses five desktop columns, then three, two and one as space requires.

## Three.js source review

[ThreeUI](https://threeui.com/browse): inspected the live catalogue and the Structure Flow preview, descriptions and controls. Its particle field demonstrates procedural depth without image assets, but reads as a technology backdrop. The useful principle is an authored family with a small control set. The portfolio uses original geometry and does not import its React package or premium components.

[Awwwards Three.js collection](https://www.awwwards.com/websites/three-js/): the readable landing page supplied 31 entries; this is an additional discovery source, not a verified technical benchmark of every linked site. Award tags do not prove runtime performance.

[FreeFrontend](https://freefrontend.com/three-js/): the source returned a verification interstitial. No examples, source code or quality conclusions are attributed to it.

[Awesome Three.js](https://github.com/AxiomeCG/awesome-threejs): reviewed the resource index as a route to primary documentation, not as a component library to install. It supports using the underlying engine and its official manual.

[Utsubo’s eight-site article](https://www.utsubo.com/blog/best-threejs-websites-2026): Oryzo and Hubtown favour a single focal object; IVRESS discusses renderer fallback; Lacoste a bounded game; Shopify and Sleep Well sequential storytelling; Primland spatial exploration; Cartier separate product scenes. These are article-derived descriptions, not eight independent live audits. IVRESS is the authoring studio’s own work. The inference for this portfolio is one consistent mechanic, visible controls and readable content. Cinematic scenes, terrain and game navigation would add production cost without clarifying the user’s work.

## Implementation contract

The line has three authored forms: Enquiry, Order and Flow. Home introduces Enquiry; Work presents Order; Playground lets visitors choose; every page shares Flow in the footer. This gives the site a recognisable visual language without placing movement over case-study images or reading text.

A single WebGL renderer draws the visible slots. It has a capped pixel density, no external textures, no HDR download and no framework migration. Pages whose only scene is the footer defer loading until that area approaches. Animation stops offscreen, in background tabs, when paused, or under reduced-motion preferences. Session pause is shared between controls and pages. SVGs remain when WebGL is unavailable or data-saving/reduced-motion settings apply.

Primary technical references: [multiple scenes](https://threejs.org/manual/en/multiple-scenes.html) for one renderer with viewport/scissor regions; [cleanup](https://threejs.org/manual/en/cleanup.html) for releasing geometries, materials and environment textures. The actual work uses the repository’s existing local Three.js version and security policy.

## Per-site ledger

“Metadata” means the matching award page was readable. The assessment is a design-fit inference, not a live usability audit. “Unavailable” means no judgement is made.

### Sites of the Year

| Site | Evidence | Assessment for this portfolio |
| --- | --- | --- |
| [Lando Norris](https://www.awwwards.com/sites/lando-norris) | metadata | An identity-specific accent can make a site recognisable before reading. Racing energy is appropriate to Norris; copying that urgency would misrepresent a reflective designer. |
| [Messenger](https://www.awwwards.com/sites/messenger) | metadata | A single playable task makes an imaginary world understandable. Use that clarity in an optional experiment; making visitors complete a game to see work adds friction. |
| [Igloo Inc](https://www.awwwards.com/sites/igloo-inc) | metadata | A unified 3D world offers strong recall. Keep a consistent material language; infinite transitions are a poor trade for a small portfolio that needs direct comparison. |
| [Don't Board Me](https://www.awwwards.com/sites/dont-board-me) | metadata | Graphic storytelling can establish a point of view. The lesson is conviction in one idea, not adopting a campaign’s visual rhetoric without its cause. |
| [Opal Tadpole](https://www.awwwards.com/sites/opal-tadpole) | metadata | Specific product imagery gives motion a subject. Treat portfolio artwork as evidence with a clear image hierarchy; avoid distortion that obscures the designed outcome. |
| [Lusion v3](https://www.awwwards.com/sites/lusion-v3) | metadata | Spatial craft can itself demonstrate capability. Borrow the disciplined relationship between motion and composition, but a brand designer should still lead with brand work. |
| [Noomo Agency](https://www.awwwards.com/sites/noomo-agency) | metadata | A studio can communicate through a continuous spatial narrative. Use continuity between pages; avoid a cinematic introduction that delays the portfolio. |
| [Mana Yerba Mate](https://www.awwwards.com/sites/mana-yerba-mate) | metadata | Illustrated commerce ties personality to product. Let existing project colours appear in their artwork rather than turning the whole portfolio into an unrelated illustration style. |
| [KPR](https://www.awwwards.com/sites/kpr) | metadata | Experimental worldbuilding fits an entertainment/community proposition. Its density would compete with the user’s identities; reserve discovery for the Playground. |
| [The Other Side of Truth](https://www.awwwards.com/sites/the-other-side-of-truth) | metadata | Interaction can embody a serious editorial argument. In case studies, explain the problem and decision before celebrating the effect. |
| [Persepolis Reimagined](https://www.awwwards.com/sites/persepolis-reimagined) | metadata | 3D is strongest when it reveals otherwise inaccessible spatial information. A historical reconstruction is not a template for presenting flat brand artwork. |
| [Pangram Pangram Foundry](https://www.awwwards.com/sites/pangram-pangram-foundry) | metadata | Typography can be both the subject and interface. High relevance: strong type hierarchy and a catalogue visitors can scan without waiting. |
| [Star Atlas](https://www.awwwards.com/sites/star-atlas) | metadata | A game universe has a reason for cinematic scale. Low direct fit: worldbuilding would imply a game/3D specialism that is not the main portfolio proposition. |
| [Prometheus Fuels](https://www.awwwards.com/sites/prometheus-fuels) | metadata | A process can become a spatial story. Use staged explanation when a case study warrants it; do not make a simple biography into a product launch film. |
| [Umami Land](https://www.awwwards.com/sites/umami-land) | metadata | Exploration becomes meaningful when each discovery teaches something. Give experimental forms a short question and explicit controls. |
| [Chungi Folio](https://www.awwwards.com/sites/chungi-folio) | metadata | A personal portfolio can make character visible through authored illustration and motion. High conceptual fit; the user needs his own motif rather than a borrowed cartoon voice. |
| [Mammut Expedition Baikal](https://www.awwwards.com/sites/mammut-expedition-baikal) | metadata | Photography and typography can carry an expedition’s drama. Let real project imagery provide variety; do not add fake cinematic footage to fill absent case material. |
| [Kode Sports Club](https://www.awwwards.com/sites/kode-sports-club) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Dark: Official Netflix Guide](https://www.awwwards.com/sites/dark-official-netflix-guide) | metadata | An interactive guide can clarify relationships. Make project navigation and metadata systematic before introducing special transitions. |
| [Synchronized studio](https://www.awwwards.com/sites/synchronized-studio) | metadata | Monochrome typography leaves room for confident transitions. Strong relevance to Swiss structure; restrain choreography so the work remains quick to reach. |
| [Pioneer - Corn Revolutionized](https://www.awwwards.com/sites/pioneer-corn-revolutionized) | metadata | A difficult industrial process gives 3D explanatory purpose. Use process visuals only where the user can supply actual evidence of decisions. |
| [Bruno Simon Portfolio](https://www.awwwards.com/sites/bruno-simon-portfolio) | metadata | The interaction is an unmistakable demonstration of a creative developer’s skills. Excellent conceptual coherence, weak direct fit for a brand designer’s primary navigation. |
| [MA](https://www.awwwards.com/sites/ma) | metadata | Distinct spatial worlds can help separate product families. A shared portfolio shell should stay consistent while each case study keeps its own artwork. |
| [The Cool Club x FWA](https://www.awwwards.com/sites/the-cool-club-x-fwa) | metadata | A collection can feel like a set of physical objects. Apply numbering and catalogue rhythm, with conventional links rather than simulated handling requirements. |
| [Nomadic Tribe](https://www.awwwards.com/sites/nomadic-tribe) | metadata | Illustrated narrative creates emotion through a coherent world. Low stylistic fit; its lesson is a governing idea, not maximal atmospheric production. |
| [Orano](https://www.awwwards.com/sites/orano) | metadata | Spatial narrative can make an abstract industry legible. Retain the explanation-first principle and avoid production spectacle without information gain. |
| [koox](https://www.awwwards.com/sites/koox) | metadata | Minimal structure and illustration can coexist. High relevance to restraint: one expressive element is enough when the typography is controlled. |
| [Frans Hals Museum](https://www.awwwards.com/sites/frans-hals-museum) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Active Theory v4](https://www.awwwards.com/sites/active-theory-v4) | metadata | Immersive agency work demonstrates the medium the agency sells. Borrow continuity of art direction; keep an ordinary route to content for this portfolio. |
| [The New Mobile Workforce](https://www.awwwards.com/sites/the-new-mobile-workforce) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Simply Chocolate](https://www.awwwards.com/sites/simply-chocolate) | metadata | Product interaction can echo a familiar physical action. Let the Playground change a line’s form; keep actual project images stable. |
| [Inside The Head](https://www.awwwards.com/sites/inside-the-head) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Dunkirk WebVR](https://www.awwwards.com/sites/dunkirk-webvr) | metadata | Cooperative VR serves a film campaign with a specific dramatic premise. Low transfer value: device and participation requirements would obstruct portfolio review. |
| [OUIGO - Let's play](https://www.awwwards.com/sites/ouigo-lets-play) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Mendo](https://www.awwwards.com/sites/mendo) | unavailable | Not assessed: the retrieved Mendo record belonged to a different, older edition. It is excluded from design conclusions. |
| [Protest Sportswear](https://www.awwwards.com/sites/protest-sportswear) | metadata | An editorial lookbook benefits from immediately visible images and commerce structure. High relevance to the Work catalogue’s upright image rhythm. |
| [Paper Planes](https://www.awwwards.com/sites/paper-planes) | metadata | One simple action creates a memorable social experience. Adopt a small, instantly understood interaction rather than a long list of controls. |
| [KIKK Festival 2016](https://www.awwwards.com/sites/kikk-festival-2016) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Cavalier: Conqueror of Excellence](https://www.awwwards.com/sites/cavalier-conqueror-of-excellence) | metadata | A balancing game has a clear challenge and feedback loop. Optional play can demonstrate inquisitiveness; do not put a challenge between a hiring lead and contact details. |
| [Falter Inferno](https://www.awwwards.com/sites/falter-inferno) | metadata | An allegorical scene makes a publication’s position tangible. A personal motif should grow from the user’s actual interests, not a generic spectacular environment. |
| [Because Recollection](https://www.awwwards.com/sites/because-recollection) | metadata | Music and visual experimentation can make an archive explorable. The user’s writing and experiments can be distinct entries without forcing sound or unusual navigation. |
| [Weber - BBQ Cultures](https://www.awwwards.com/sites/weber-bbq-cultures) | metadata | Documentary material anchors an interactive food story. Case-study specificity is more useful than generic claims of craft. |
| [Beagle - Better proposals](https://www.awwwards.com/sites/beagle-better-proposals) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [In Pieces](https://www.awwwards.com/sites/in-pieces) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Nixon eCommerce Platform](https://www.awwwards.com/sites/nixon-ecommerce-platform) | metadata | Clean commerce makes a brand culture easy to browse. Adopt legible information architecture and responsive images, not storefront UI irrelevant to a portfolio. |
| [AQuest](https://www.awwwards.com/sites/aquest) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Dragone](https://www.awwwards.com/sites/dragone) | metadata | Performance storytelling warrants spectacle. Low direct fit for the main site; reserve expressive sequences for projects with equivalent visual evidence. |
| [A Journey Through Middle-earth](https://www.awwwards.com/sites/a-journey-through-middle-earth) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [PHARRELL WILLIAMS - 24 HOURS OF HAPPY](https://www.awwwards.com/sites/pharrell-williams-24-hours-of-happy) | metadata | A time-based navigation idea gives long-form video a usable structure. The transferable principle is a clear organising rule, not a literal 24-hour interface. |
| [Into the Arctic - Greenpeace](https://www.awwwards.com/sites/into-the-arctic-greenpeace) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Blacknegative](https://www.awwwards.com/sites/blacknegative) | metadata | Minimal framing can make photography feel cinematic. Useful restraint, but a full-screen scene must not hide the route to projects. |
| [Made in a Free World: Slavery Footprint](https://www.awwwards.com/sites/made-in-a-free-world-slavery-footprint) | metadata | A personal survey turns an abstract issue into an understandable interaction. Any future attention-tool demo should communicate a real result rather than decorative metrics. |
| [360° Langstrasse Zürich](https://www.awwwards.com/sites/360-langstrasse-zurich) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |

### Design Agencies

| Site | Evidence | Assessment for this portfolio |
| --- | --- | --- |
| [LIBELLULA LAB 4.0](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [MadamePolare](https://www.awwwards.com/sites/madamepolare) | nominee metadata | An app-like studio presentation can organise several disciplines. Keep routes and contact choices clear; avoid excess interface chrome. |
| [Undead Fish Studio](https://www.awwwards.com/sites/undead-fish-studio) | nominee metadata | A pixel world populated by client characters is an ownable premise. Strong lesson in personal authorship, but an RPG would position this user as a game developer. |
| [ViV](https://www.awwwards.com/sites/viv) | nominee metadata | A quiet artist roster makes photography the primary evidence. Strong fit for image presentation and restrained metadata. |
| [LIRCLE](https://www.awwwards.com/sites/lircle) | live desktop screenshot and DOM; award metadata | Live desktop review: a darkened project photograph, centred heavy uppercase promise, green emphasis, a large centred menu and two calls to action. Clear hierarchy, but the generic agency promise and competing buttons are unsuitable for a personal introduction. |
| [Grigoletti](https://www.awwwards.com/sites/grigoletti) | nominee metadata | Flat, clean portfolio structure supports quick scanning. Useful baseline, but a personal site needs more identity than the underlying builder’s familiar conventions. |
| [Grafik](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Studio Merge](https://www.awwwards.com/sites/studio-merge) | live desktop screenshot and DOM; award metadata | Live desktop review: oversized compressed black typography on pale ground, numbered navigation spread across the page, compact marginal notes and a central showreel. Strong editorial tension; excessive tracking compression and multiple competing introductory statements would reduce readability. |
| [NexStudio](https://www.awwwards.com/sites/nexstudio) | nominee metadata | Minimal service presentation with 3D can signal technical capability. Keep one purposeful object; avoid letting software-studio positioning replace the user’s brand-design focus. |
| [Little Plains](https://www.awwwards.com/sites/little-plains) | nominee metadata | A searchable body of studio work suggests that the archive itself can be the experience. Six projects need simple filters, not an elaborate search or voice layer. |
| [Nordpixel.ch](https://www.awwwards.com/sites/nordpixel-ch) | nominee metadata | Responsive agency presentation is relevant to reliable delivery. Swiss geography alone is not evidence of Swiss typographic quality; no live visual score assigned. |
| [Neutomni](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Mad Dogs Design Concept](https://www.awwwards.com/sites/mad-dogs-design-concept) | nominee metadata | Motion, sound and experimental scrolling create an assertive studio personality. Too loud for the chosen fieldbook direction; the useful lesson is a consistent attitude. |
| [Signal-A Studio](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [VectorElements](https://www.awwwards.com/sites/vectorelements) | nominee metadata | A vector marketplace depends on classification and preview clarity. Useful catalogue logic, but commercial marketplace controls would be unnecessary here. |
| [Squarespace Foundations](https://www.awwwards.com/sites/squarespace-foundations) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [The Donut Studio](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [twks](https://www.awwwards.com/sites/twks-1) | nominee metadata | Typography and gallery structure are directly relevant to a designer’s archive. Prioritise names, images and whitespace; the 2026 nominee must not be confused with its earlier site edition. |
| [SEE ME](https://www.awwwards.com/sites/see-me) | nominee metadata | Large images and film support a fashion talent roster. Use a generous artwork scale and factual credits; avoid styling the whole portfolio as a fashion editorial. |
| [L'AGENCE Design Studio](https://www.awwwards.com/sites/lagence-design-studio) | nominee metadata | Minimal, full-screen presentation can support premium positioning. Whitespace is useful when paired with proof; luxury conventions alone cannot establish personal character. |
| [Levo Studio - Software](https://www.awwwards.com/sites/levo-studio-software) | nominee metadata | Clear software-service positioning connects the offer with delivery. Keep the user’s disciplines explicit, while resisting generic technology-agency language. |
| [MiniMax H3](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Graffico Office](https://www.awwwards.com/websites/design-agencies/) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Sasha Martynchuk](https://www.awwwards.com/sites/sasha-martynchuk) | nominee metadata | Process-focused portfolio metadata and physics interactions suggest an effective split between useful proof and optional play. Relevant to the Playground, without making the case studies behave like toys. |
| [TBWA\HAKUHODO Corporate Site](https://www.awwwards.com/sites/tbwa-hakuhodo-corporate-site) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Lidar Drone Scanning](https://www.awwwards.com/sites/lidar-drone-scanning) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [HOBRO DIGITAL](https://www.awwwards.com/sites/hobro-digital) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [sokolovski.pro](https://www.awwwards.com/sites/sokolovski-pro) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Abhay Singh](https://www.awwwards.com/sites/abhay-singh) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Riangle v5](https://www.awwwards.com/sites/riangle-v5) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |
| [Loop Creative Studio](https://www.awwwards.com/sites/loop-creative-studio) | unavailable | Not assessed: the matching award record could not be verified. The collection title is inventory evidence only; no visual or interaction judgement is claimed. |

