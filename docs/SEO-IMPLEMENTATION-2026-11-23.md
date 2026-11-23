# Portfolio SEO implementation and verification
23 November 2026. Based on the attached SEO audit.

## Implemented in the site
- Canonical 308 redirects for /index.html, /work, /work/, /essays and /essays/ via vercel.json.
- Directory listing disabled through the Vercel project's setting; no asset-folder redirects, so direct image/CSS/JS assets remain addressable.
- Descriptive page title tags, descriptions and matching Open Graph/Twitter snippets on case studies, essays, Work, Process, About and Contact.
- Stable Person `@id` (`https://miebaka-portfolio.vercel.app/#miebaka-joshua`), connected from WebSite, CreativeWork and Article. Breadcrumbs for published case studies and essays, with project/essay image URLs.
- Project-scope leads that distinguish physical TEDx use from Rivo and ChopBox concept applications; corrected inaccurate “rollout” deliverable labels.
- More descriptive project-folder link names and evidence links from process stages to published work.
- Verified dated disability population source and clear Nike filing references, with qualification on editorial causation.
- Production SEO regression test checks metadata, canonical, schema, image alt presence, sitemap, scope and redirects. Existing hero animation remains unchanged.

## Verify after deployment
1. Confirm HTTP 308/301 for aliases in one hop to final canonical and HTTP 200 for /, /work.html, /essays.html.
2. Confirm /assets/ and /styles/ now return 404 as directory listings are disabled, while a known image, stylesheet and script still return HTTP 200.
3. Confirm a nonexistent route stays 404, /404.html remains noindex and /explorations.html redirects to /experiments.html.
4. Run the existing test suite and Playwright. The CI now runs a separate two-pass mobile Lighthouse audit for Home, Experiments and TEDx RSU, publishing `seo-mobile-lighthouse` as a downloadable Actions artifact. Record scores/metrics from the generated reports rather than claiming improvements without measurement. Compare repeat runs with the audit baseline (mobile Home: LCP 1.7 s, CLS 0, TBT 840 ms, performance 77). Lab scores are not field Core Web Vitals.
5. In Google Search Console, check sitemap processing, index status, last crawl and Google-selected canonical for Home, About, Work, Rivo, TEDx, ChopBox and the two essays. Record branded queries and page impressions monthly.

## Work that cannot honestly be auto-published
- Search Console URL inspection and indexing requests need a verified property and account permissions. A verification meta tag does not confirm pages are indexed.
- CrUX/field LCP, INP and CLS require sufficient field traffic; do not present Lighthouse as field data.
- An additional Rise campaign case requires actual publishable work, documented credits and employer approval.
- Third-party LinkedIn, Sessionize, organizer or client links require authorised edits by the relevant account owners.
- AI answer inclusion must be measured in each product and region; `llms.txt` does not guarantee ranking or citation.

## Monthly visibility worksheet
Track one row per month with: month, region, branded impressions, unbranded impressions, clicks, CTR, indexed published URLs / total, excluded URLs and reasons, number of verified AI citations / prompts tested, and link to the dated Search Console export.

Test these **branded** prompts: “Who is Miebaka Joshua?”, “Where can I see Miebaka Joshua’s portfolio?”, “What does Miebaka Joshua do at Rise?”, “What brand identity work has Miebaka Joshua done?”, “What has Miebaka Joshua written about design?”

Test these **project/topic** prompts separately: “Who designed the TEDx Rivers State University event identity?”, “What was the design approach behind the Rivo Studio identity?”, “What did the ChopBox food identity and packaging project include?”, “What are practical starting points for accessible design in Nigeria?”, “Show examples of software studio identity case studies with documented guidelines.”

For each prompt log date, product (Google AI Overview, ChatGPT Search or Perplexity), locale, prompt, answer shown, site cited (Y/N), exact linked URL and correct attribution (Y/N). Report branded and topic citation rates separately. Do not infer cause from small samples.

## Publishing contract for future cases
Follow `/work/{slug}.html` with factual role, constraint, governing design decision, delivered scope, proposed vs released application labels, accessible captioned images, linked Person + CreativeWork schema, BreadcrumbList, canonical, sitemap entry and working internal links. Publish only if credits and approval are established.
