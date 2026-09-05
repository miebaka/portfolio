# Portfolio — Swiss direction

## Decision
A neutral grotesk system, generous aligned space, and blue as a single identifying accent. The portfolio presents a designer with a clear point of view; project artwork supplies the variety.

The previous site mixed serif reading text, geometric interface labels, small editorial headings, a portrait-led hero, a background particle field, and a scripted footer. Each decision could work independently, but together they diluted the requested Swiss direction. Home and Work also used the same text index despite two different supplied references.

## Reference interpretation
The repository contains `Samples from Figma/For Work Listing (On Homepage).png` and `Samples from Figma/For Work Listing (When Clicked From Menu).png`. These were visually inspected and used as the two listing references because the message attachments were not separately available.

- Home: large grotesk project names, deliberate indentation, blue letter accents. Project names and destinations remain real. Hover previews complement the names; the names are usable on touch and keyboard without previews.
- Work: a quiet catalogue with metadata and services above aligned tall images. Four columns on desktop, two on tablets, one on narrow phones. Category filters expose the complete archive without an additional page.
- The reference names and artwork belong to other designers and are not presented as Miebaka’s work. Raptor Text is not bundled; the existing locally hosted TeX Gyre Heros is used throughout.

## Research and critical assessment
Sources inspected on 5 September 2026:

- [Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/): collection listing, including Lusion, Igloo, Pangram Pangram, KPR, and other winners.
- [Awwwards Design Agencies](https://www.awwwards.com/websites/design-agencies/): current collection listing, including Studio Merge, Little Plains, twks, and other entries.
- [Lusion](https://lusion.co/): live layout and rendered 3D hero visually inspected. Strongest applicable lesson: repeat a simple geometric vocabulary until it becomes a recognisable signature. The loading screen delayed the work during this inspection. Adopt the coherent object language; avoid a mandatory loading sequence and scroll capture.
- [Pangram Pangram](https://pangrampangram.com/): live content and catalogue structure inspected. Its typography is also its merchandise, making type-led browsing appropriate. For this portfolio, typography establishes the voice, but the dedicated Work page needs actual project images so visitors can judge the craft.
- [Igloo](https://www.igloo.inc/): attempted text retrieval returned no readable page content. No detailed visual judgement is claimed.

Scope: this is a focused design synthesis of the two collections and selected live references, **not an exhaustive interaction audit of every website or every paginated entry in either directory**. Live sites may differ from the versions that won their awards. The implementation was prioritised over an unbounded awards-directory survey.

## Motion
An original Three.js sculpture made from 13 repeated rounded rectangular loops. The plates rotate gently relative to one another and respond to the pointer. No downloaded 3D models, environment maps, or remote runtime scripts.

- Locally vendored Three.js 0.180.0, MIT license included.
- Pause/play button; render loop stops outside the viewport and when the tab is hidden.
- Reduced-motion and data-saving preferences retain the authored static SVG.
- WebGL failure/context loss retains the static visual and all normal page content.
- Pixel ratio capped at 1.5; shared geometry and material; resources disposed on page exit.
- Existing security policy remains unchanged.

## Content limitations
Poster A Week has no cover image in the project data. Kiki-Joshua and Kigoma Hotels have no covers or completed case studies. The catalogue labels these states explicitly and does not link unfinished case studies. Existing case-study copy and image sequences remain in place.

## Validation
- Desktop home and catalogue visually inspected at 1280px.
- Home and a case study visually inspected at 390px; no horizontal overflow detected.
- Three.js canvas rendered; pause control changed to Play motion.
- Mobile menu expanded, exposed destinations, and closed with Escape.
- Dark theme rendered successfully on mobile and persisted across navigation.
- Brand filter returned exactly Rivo, TEDx RSU, and ChopBox.
- No broken loaded images in the catalogue check; no browser console errors in home/case checks.
- All 14 site HTML pages checked for missing local src/href destinations: none.
- All project case destinations and all advertised catalogue image sizes checked: none missing.
- JavaScript syntax and git whitespace checks passed.
- Reduced-motion/WebGL failure behavior was reviewed in code; no browser emulation test is claimed.
- Contact form structure retained and inspected; no real submission was sent.
- npm reports an existing high-severity advisory in the optional Sharp image-optimisation dependency. Three.js is not implicated; the site runtime does not use Sharp.
