# Boomslang and motion research

The transition is an anatomically informed visual model. Published sources support the species anatomy and general snake locomotion, but no quantitative boomslang-specific kinematic study was found.

## Species cues used

The boomslang is long and slender, with a large blunt head distinct from its narrow neck, unusually large round-pupilled eyes, keeled scales and, in a common adult-male phase, green scales with dark edges. Routine travel keeps the mouth closed and neck slender; inflation is a threat display. The implementation uses one watertight tapered mesh, a short egg-shaped head, large lateral-forward eyes, 19 apparent scale rows, matte leaf green skin and a brief tongue flick.

## Locomotion model

Lateral undulation sends bending posteriorly and lets body points approximately follow the head's route. The mesh therefore derives every ring from one centreline and updates the continuous surface each frame. The snake has no independently animated segments. A small secondary vertical wave prevents a flat hose appearance while the dominant path remains lateral.

## Site motion grammar

- 140ms for arrows, colour and focus feedback.
- 220ms for button states and the intentionally reflowing Selected Work rows.
- 1500ms for the boomslang page transition.
- Direct interactions use `cubic-bezier(.22,1,.36,1)`; spatial movement uses `cubic-bezier(.65,0,.35,1)`.
- Reduced motion removes the animal and all spatial/reflow animation.

Sources: [SANBI species account](https://biodiversityadvisor.sanbi.org/search/detail/80886/), [SANBI overview](https://www.sanbi.org/animal-of-the-week/boomslang/), [Animal Diversity Web](https://animaldiversity.org/accounts/Dispholidus_typus/), [Jayne locomotion review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7391877/), [Hu et al. on slithering mechanics](https://pmc.ncbi.nlm.nih.gov/articles/PMC2700932/), [W3C CSS Easing](https://www.w3.org/TR/css-easing-1/), [W3C motion accessibility](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html), [web.dev animation performance](https://web.dev/articles/animations-and-performance).
