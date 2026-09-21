# Portfolio cohesion rebuild

## Product contract

- The homepage is a restrained warm-paper introduction: one proposition, selected work, a compact service index, brief biography, and contact.
- The Work page is an image-led, filterable archive using the White Desert “Our Trips” composition: tall visual cards, compact metadata, title, and a short outcome.
- Case studies are cinematic but legible. Their fixed order is opening image, project facts, proposition, Problem, Decision, System, Applications, Result, and next project.
- About is compressed into positioning, current role and trajectory, selected experience, three interests, writing/experiments, portrait, and contact.

## System decisions

- Palette: warm paper, ink, linen, restrained clay. Project colours only appear inside their own case study.
- Type: TeX Gyre Heros for display, Literata for reading, Josefin Sans for interface labels.
- Motion: 150ms interface feedback; 420ms pointer-only project handoff; keyboard navigation is immediate. Reduced-motion users receive static states.
- Media roles are explicit: hero, evidence, detail, atmosphere. Each case has one full-viewport visual chapter only.
- Components follow HyperUI’s practical grammar: bounded containers, image-first cards, hairline dividers, compact definition lists, and grouped filter controls.

## Full-stack and safety boundary

This is a zero-build static portfolio. There is no server, database, authentication, or user-generated HTML. Data-rendered strings remain escaped, slugs remain tokenised, external links retain safe rel attributes, images keep intrinsic dimensions, and the existing no-JavaScript fallbacks remain intact.
