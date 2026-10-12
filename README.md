# Miebaka Joshua — Portfolio

An editorial, print-informed portfolio for Miebaka Joshua. It is a static site built with semantic HTML, a bundled CSS cascade and dependency-light ES modules. The interface uses one shared sheet, list, motion and colour system across every route.

[`engineering-specification.md`](engineering-specification.md) is the implementation contract. [`specs/personal-identity-system_design.md`](specs/personal-identity-system_design.md) defines the identity rationale and colour system.

## Run and verify

```bash
npm install
npm run dev
npm test
```

Use an HTTP server rather than opening the HTML with `file://`; browser modules do not load reliably from the filesystem. The production command builds `dist/`, bundles the CSS into one request, prerenders case-study content and copies only referenced production assets.

## Production structure

```text
index.html                 Home
work.html                  Work archive
about.html                 Profile and experience
services.html              Capabilities
writing.html            Writing
contact.html               Contact
privacy.html / 404.html    Utility pages
data/site.js               Content source of truth
styles/foundations.css     Tokens, type, sheet geometry, accessibility
styles/components-v4.css   Shared controls and components
styles/pages-v4.css        Route composition
styles/proof-system.css    Print language, portrait, fan, index and signature
js/render/                 Data-driven markup
js/core/                   Interactions and progressive enhancement
scripts/build-site.mjs     Production build
scripts/site-integrity.test.mjs  Contract tests
```

## Governing contracts

- **Sheet:** every readable element stays inside the same `--page` / `--content` measure used by the logo and Index control. Trim marks describe the page edge; content never uses them as a layout margin.
- **Type:** BIZ UDPMincho for display, Schibsted Grotesk for body, Josefin Sans for labels and Borges only as the footer-signature sampling face.
- **Colour:** semantic roles derive from Ultramarine `#002080`; documented text pairs pass the 7:1 contrast floor.
- **Rows:** Index, experience, work, services and writing use one interactive-row grammar: generous target, bottom-origin colour fill, short horizontal acknowledgement and explicit disclosure where content expands.
- **Motion:** regular motion is expressive but input-led. Reduced motion removes loops and large spatial changes while retaining colour, opacity and the custom cursor.
- **Surface:** a fixed, non-interactive procedural paper grain replaces the retired folds shader. It contains no image request and disappears for forced-colour or reduced-transparency users.
- **Progressive enhancement:** navigation, content and links remain usable without JavaScript.

## Content changes

Edit `data/site.js` for profile, project, article, client and social data. Keep presentation values in CSS tokens. A new project requires a data entry, a matching `work/<slug>.html` shell and optimized cover/media variants.

## Deployment

`vercel.json` serves `dist/` after `npm run build`. Pushes to the connected GitHub repository deploy through Vercel. Before pushing, run `npm test` and visually inspect the home, Index, work, services, writing and footer layouts at mobile and desktop widths.
