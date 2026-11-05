# Track H — Performance, SEO and metadata

## Findings

- Canonicals and OG URLs point to staging, not D3’s `miebaka.design` (`data/site-config.js:4`; `index.html:8,15`; representative case `work/rivo.html:8,15`). P0.
- Staging is indexable: `vercel.json:8-35` contains security/cache headers but no `X-Robots-Tag: noindex`; `robots.txt` must also be checked against the requested disallow. P0.
- Theme colors are paper/dark navy, not ultramarine plus paper/ink reconciliation (`index.html:22-23`; `js/render/navigation.js:64`). D4 needs an explicit decision and runtime JS must not hard-code hex. P1.
- Published cases correctly use `og:type=article` and project-specific images (`work/rivo.html:11,15`; `work/chopbox.html:11,15`; `work/tedx-rsu.html:11,15`). The unpublished Poster A Week shell uses the portrait (`work/christian-poster-a-week.html:11,15`); keep it noindex or supply a real project image before publication. P1.
- Sitemap generation is centralized (`scripts/build-site.mjs:90-96`) but inherits the staging canonical.
- No JSON-LD was found in the source inventory. Add Person on Home/About and CreativeWork only to truthful published cases. P1.
- LCP case images use explicit dimensions, `fetchpriority="high"` and responsive sources (`work/rivo.html:65`), but many subsequent case images are `loading="eager"` in generated markup, increasing mobile transfer pressure (`work/rivo.html:65`; `js/render/case-markup.js:33-52`). P0.
- Existing Lighthouse CI tests only three URLs, desktop preset, with 90/95 category thresholds—not the requested every-page mobile 95/100/100/100 gate (`lighthouserc.cjs:3-16`). P0.
- Mobile Lighthouse raw results and summary are in `audit/before/lighthouse/`; see `summary.json` for measured scores and Web Vitals.
- The separate category run scored Accessibility and Best Practices 100 on all routes and SEO 100 on every route except 404 (66), in `audit/before/lighthouse-categories/summary.json`. These automated scores do not supersede the manual accessibility gaps in Track G.

