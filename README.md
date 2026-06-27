# Miebaka Joshua — Portfolio

A fast, scalable, zero-build portfolio site. Direction: **The Quiet Gallery** — a
warm editorial frame that stays neutral so the work supplies the colour. Full art
direction lives in [`creative-direction.md`](creative-direction.md).

## Run it

No build step. Two options:

```bash
# Simplest — just open it
open index.html

# Recommended — serve locally (relative paths + fonts behave best)
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Structure

```
Portfolio/
├── index.html          # Home: hero → proof → work → capabilities → about → contact
├── about.html          # Full about page
├── work/
│   └── rivo.html       # Case-study template (copy this for new projects)
├── css/
│   ├── tokens.css      # Design tokens — colour, type, space, motion (edit here first)
│   ├── base.css        # Reset, typography, layout helpers, scroll-reveal
│   ├── components.css  # Nav, footer, buttons, chips, forms
│   └── sections.css    # Hero, work grid, about, case study, contact
├── data/
│   └── site.js         # Single source of truth: projects, skills, socials, contact
├── js/
│   ├── render.js       # Builds nav, footer, work grid, capabilities from data
│   └── main.js         # Scroll reveals, mobile nav, live WAT clock, contact form
└── assets/images/      # Drop project covers and portraits here
```

## How to add a project

1. Open [`data/site.js`](data/site.js) and add an object to `projects`:

   ```js
   {
     slug: "new-project",          // becomes work/new-project.html
     title: "New Project",
     tags: ["Brand identity"],
     year: "2025",
     tone: "#1f4d3a",              // tile colour shown until a cover image exists
     cover: "assets/images/new-project-cover.jpg", // optional
     featured: true                // show on the homepage grid
   }
   ```

2. Copy `work/rivo.html` to `work/new-project.html` and fill in the story
   (challenge → what I did → key decisions → outcome + metrics).

That's it — the homepage grid updates automatically from the data.

## Customise

- **Colours / type / spacing:** [`css/tokens.css`](css/tokens.css) only.
- **Name, email, socials, availability:** the top of [`data/site.js`](data/site.js).
- **Images:** drop files in `assets/images/` and reference them via `cover`
  (projects) or by editing the `.about-portrait` / `.case-figure` blocks in HTML.

## Wire up the contact form

The form works out of the box via a `mailto:` handoff (see `initForm` in
[`js/main.js`](js/main.js)). To collect submissions without an email client,
point it at a service such as [Formspree](https://formspree.io) or
[Netlify Forms](https://docs.netlify.com/forms/setup/) — replace the
`e.preventDefault()` handler with a `fetch()` POST to your endpoint.

## Accessibility & performance notes

- Semantic landmarks, skip link, visible focus rings, `prefers-reduced-motion`
  respected, content never hidden when JS is off.
- No framework, no bundler — just fonts and three small CSS/JS files.
- Add real `alt` text to every image you drop in.
