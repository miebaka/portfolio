# Architect Report — v1.1.0 Page Cleanup

## Pages Audited
- index.html, about.html, work.html, services.html, contact.html, playground.html, 404.html
- work/chopbox.html, work/rivo.html, work/tedx-rsu.html, work/christian-poster-a-week.html
- writing/when-the-swoosh-lost-its-soul.html, writing/designing-for-disability-in-nigeria.html
- data/site.js, js/render/*, js/core/menu.js

## Priority 1 Issues (correctness/a11y)
1. 404.html — dark-theme persistence missing from inline script
2. 404.html — missing librebaskerville-regular.woff2 preload
3. about.html:112 + contact.html:59 — data-href="email" anchors fall back to href="#"
4. All pages — twitter:image:alt missing everywhere
5. Writing pages — og:image:alt missing
6. Dead 404 links on work cards for kiki-joshua-notepad and kigoma-hotels
7. data/site.js — placeholder testimonial rendered live on homepage
8. data/site.js — Rivo outcome note is a placeholder rendered on live case page
9. index.html:71 — hero-noir__media-label visible before JS runs

## Priority 2 Issues (consistency/polish)
1. js/core/menu.js:60 — dead .site-menu__cta selector
2. data/site.js city/timezone fields — no feature uses them
3. js/render/footer.js + writing.js — rel="noopener" missing noreferrer
4. All work/ case pages — data-nav-theme="dark" likely stale (paper background)
5. Writing pages — article dates should be <time> elements
6. playground.html — static empty-state design explorations section
7. about.html — mission section has no aria-label
