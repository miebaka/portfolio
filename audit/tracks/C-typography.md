# Track C — Typography

## Findings

| ID | Evidence | Finding / fix |
|---|---|---|
| C-01 | `styles/foundations.css:1-4`; `audit/raw/recon.txt` | Google Sans Flex, Josefin Sans and Material Symbols ship as TTF, not WOFF2. Convert/subset to WOFF2 and preload only the two above-fold faces. |
| C-02 | `styles/foundations.css:1-4` | No fallback metric overrides (`size-adjust`, ascent/descent/line-gap overrides) are declared, so zero font-swap CLS is not demonstrated. Generate measured fallback faces. |
| C-03 | `styles/foundations.css:26` | Families are exposed as `--display/--body/--label`, close to D1 but not the requested swappable `--font-display/--font-body/--font-label`. Rename without changing copy. |
| C-04 | `styles/foundations.css:6-7`; `audit/raw/computed-style-clusters.txt` | The authored type scale is partly tokenized, but rendered dumps contain 121 sizes. Consolidate every declaration to steps -2…+6 and document exceptions caused by transforms only. |
| C-05 | `audit/raw/computed-style-clusters.txt` | Labels most often render at 13px with 2.6px tracking (0.2em), exceeding the requested +0.06–0.12em range. Reduce tracking after optical testing; effective size is above 11px. |
| C-06 | screenshots `audit/before/index--390--motion-reduce.png`, `audit/before/work--rivo--1440--motion-reduce.png` | H1/H2/body/caption hierarchy is visually distinct, but mobile utility/nav labels are extremely small and the case page’s editorial scale produces large dead zones when several media items fail to render. Verify after asset fixes. |
| C-07 | `styles/foundations.css:1-4`; computed weights in `audit/raw/computed-style-clusters.txt` | Rendered weights include 200 and 700, but loaded Google Sans files declare only 400/500 and Josefin only 600. This creates faux weights. Either load real axes/files or constrain use. |

## D1 serif shortlist

Implement tokens first, then make three real-browser specimen pages using the actual Home H1 and case H2 strings:

1. **Newsreader** — variable 200–800 with optical size and true italic, SIL OFL; editorial without feeling heritage-pastiche. Primary source: https://github.com/productiontype/Newsreader
2. **Besley** — variable family with italics and a WOFF2 build target, SIL OFL; stronger slab personality, higher risk of competing with project imagery. Primary source: https://github.com/indestructible-type/Besley
3. **Literata** — variable roman/italic with weight and optical-size axes, SIL OFL; robust for long-form writing, slightly more familiar. Primary source: https://github.com/googlefonts/literata

Recommendation: Newsreader first, but do not commit a winner without screenshot comparison at 390/1440 and measured WOFF2 subset sizes. The requested “usable range” disqualifies single-weight display serifs.

