# Before / after evidence

Measured 2026-11-10 against the local production build. Full-page captures use
Chromium at 360, 390, 768, 1024, 1280, 1440 and 1920 CSS pixels with reduced
motion both enabled and disabled.

| Check | Before | After | Evidence |
| --- | --- | --- | --- |
| Screenshot coverage | 210 captures | 210 captures | `audit/before/`, `audit/after/` |
| Computed-style coverage | 105 dumps | 105 dumps | `audit/before/*computed-styles.json`, `audit/after/*computed-styles.json` |
| axe serious / critical | 0 | 0 | 15 after-state reports in `audit/evidence/` |
| Home initial CSS (gzip) | Unverified | 27.7 KiB | `npm run test:budgets` |
| Home initial JS (gzip) | Unverified | 1.2 KiB | `npm run test:budgets` |
| Home initial media | Portrait master was 1.3 MiB | 39.2 KiB initial page media | `audit/REPORT.md`, `npm run test:budgets` |
| Font payload (gzip) | TTF sources | 67.9 KiB, WOFF2 only | `npm run test:budgets` |
| Production CSS requests | 3 authored stylesheets | 1 bundled stylesheet | `scripts/site-integrity.test.mjs` |
| Lighthouse accessibility | 100 on measured pages | 100 on all 15 pages | `audit/evidence/lighthouse/` |
| Lighthouse best practices | 100 on measured pages | 100 on all 15 pages | same as above |
| Lighthouse performance | 62–91 | 56–90 | Local mobile runs; target not met |
| Lighthouse SEO | 66–100 | 66–69 | Intentionally reduced by staging `noindex`; target is launch-gated |
| CLS | Baseline home 0 | 0–0.083 after | `audit/after/lighthouse/` |

Selected visual pairs:

| Page | Before | After |
| --- | --- | --- |
| Home, 390 | `audit/evidence/before/index--390--motion-reduce.png` | `audit/evidence/after/index--390--motion-reduce.png` |
| Home, 1440 | `audit/evidence/before/index--1440--motion-reduce.png` | `audit/evidence/after/index--1440--motion-reduce.png` |
| Rivo, 390 | `audit/evidence/before/work--rivo--390--motion-reduce.png` | `audit/evidence/after/work--rivo--390--motion-reduce.png` |

## Acceptance status

Verified: one built head/header/footer source; identical five-item navigation
without Community; one bundled CSS request; WOFF2-only fonts; zero `!important`
declarations; no horizontal overflow in the automated narrow/zoom checks; full
case-study anatomy and matching section ids; working keyboard menu; readable
no-JavaScript content; no serious/critical axe findings; no missing local assets.

Not verified or not met: Lighthouse Performance 95 on every page; SEO 100 while
staging is deliberately `noindex`; zero raw hex/px/ms outside `tokens.css`; a
manual VoiceOver or NVDA pass; live-domain compression and cache behaviour.
