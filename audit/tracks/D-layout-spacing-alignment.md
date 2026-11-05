# Track D — Layout, spacing and alignment

## Findings

- The layout has a global container concept (`--page`, `--content`, `--grid-gap`, `--grid-edge`) in `styles/foundations.css:28`, but no documented 12/4-column primitive. Page CSS defines many one-off grids, contributing to 132 computed paddings and 64 gaps (`audit/raw/computed-style-clusters.txt`). P1: implement `.container`, `.grid`, `.stack`, `.section` primitives.
- Home content aligns consistently on desktop, but the hero composition has a very large dark empty band before the headline (`audit/before/index--1440--motion-reduce.png`). Against the 90-second hiring goal, this delays proof without adding information. P1: reduce the first-screen void while preserving the identity field.
- At 390px, content does not visibly overflow in the captured full page; however, the primary nav is duplicated as a tiny horizontal strip directly below the hero and again in the fixed tab bar (`audit/before/index--390--motion-reduce.png`). P0: one mobile navigation pattern.
- The client-logo area renders as three blank white cards at 390px (`audit/before/index--390--motion-reduce.png`) while desktop shows logos (`audit/before/index--1440--motion-reduce.png`). P0: fix responsive logo presentation; this is credibility proof, not decoration.
- The Rivo 1440 screenshot contains multiple caption-only blank regions inside the gallery (`audit/before/work--rivo--1440--motion-reduce.png`). P0: investigate asset loading/rendering before treating spacing as intentional.
- `viewport-fit=cover` is declared across pages (`index.html:5` representative), but safe-area use must be verified in fixed mobile chrome. No evidence in the baseline proves notch-safe tab-bar padding. P1.
- A separate automated 320px/200%/landscape pass is still required; the mandated screenshot matrix starts at 360px. This remains **unverified**, not passed.

