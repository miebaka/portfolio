# Track B — Design tokens

## Measured drift

- Source CSS contains 51 raw hex occurrences, 180 raw `px` occurrences, 89 raw `ms` occurrences and 22 `!important` declarations (`audit/raw/recon.txt`). This fails the requested token contract before any semantic judgment.
- Across 105 computed-style dumps, the browser produced 121 font sizes, 184 line heights, 132 paddings, 102 margins and 64 gaps (`audit/raw/computed-style-clusters.txt`). Some values are interpolation results, but the long tail proves the rendered system is not reducible to the requested small scale today.
- Foundations mixes reference, system, alias, component and page tokens in one minified `:root`; color is authored in hex/rgb/sRGB mixes rather than OKLCH (`styles/foundations.css:5-31`).
- Coral is wired to focus, hover, warning and general tertiary/accent aliases, broader than “interaction feedback only” (`styles/foundations.css:18-25`).
- The palette includes project-specific colors in global foundations (`styles/foundations.css:12`), which makes the global token layer carry content data.

## Proposed minimal token contract

Keep reference values and semantic tokens separate in one readable `tokens.css`:

```css
@layer tokens {
  :root {
    --ink: oklch(...);
    --paper: oklch(...);
    --accent: oklch(...); /* ultramarine */
    --feedback: oklch(...); /* coral; interaction states only */
    --surface-1: oklch(...);
    --surface-2: oklch(...);
    --border: oklch(...);
    --on-accent: oklch(...);
    --on-feedback: oklch(...);
    --space-1: .25rem; --space-2: .5rem; --space-3: .75rem;
    --space-4: 1rem; --space-6: 1.5rem; --space-8: 2rem;
    --space-12: 3rem; --space-16: 4rem; --space-24: 6rem; --space-32: 8rem;
    --section-pad: clamp(var(--space-16), 8vw, var(--space-32));
    --radius-control: 0; --radius-pill: 999px;
    --elevation-1: ...; --elevation-2: ...; --elevation-3: ...;
    --dur-fast: 120ms; --dur-med: 220ms; --dur-slow: 700ms;
    --ease-out: cubic-bezier(...); --ease-in-out: cubic-bezier(...);
  }
}
```

Exact OKLCH values must be derived from the approved identity colors and then checked as pairs; do not visually approximate the current hex values. Store project palettes with project data or scoped case tokens, not global semantics.

